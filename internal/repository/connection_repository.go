package repository

import (
	"context"
	"families-linkedin/internal/database"
	"families-linkedin/internal/models"
	"fmt"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type ConnectionRepository struct {
	driver neo4j.DriverWithContext
}

func NewConnectionRepository(driver neo4j.DriverWithContext) *ConnectionRepository {
	return &ConnectionRepository{driver: driver}
}

// CreateConnection creates a new connection between families
func (r *ConnectionRepository) CreateConnection(ctx context.Context, connection *models.FamilyConnection) error {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := database.ExecuteWithTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		// Check if connection already exists to avoid duplicates
		checkQuery := `
			MATCH (f1:Family {family_id: $from_family_id})
			MATCH (f2:Family {family_id: $to_family_id})
			OPTIONAL MATCH (f1)-[existing:FAMILY_RELATION]-(f2)
			RETURN existing IS NOT NULL as connection_exists
		`
		
		result, err := tx.Run(ctx, checkQuery, map[string]interface{}{
			"from_family_id": connection.FromFamilyID,
			"to_family_id":   connection.ToFamilyID,
		})
		
		if err != nil {
			return nil, err
		}
		
		if result.Next(ctx) {
			record := result.Record()
			exists, _ := record.Get("connection_exists")
			if exists.(bool) {
				return nil, fmt.Errorf("connection already exists between families %s and %s", 
					connection.FromFamilyID, connection.ToFamilyID)
			}
		}

		// Create bidirectional connection
		createQuery := `
			MATCH (f1:Family {family_id: $from_family_id})
			MATCH (f2:Family {family_id: $to_family_id})
			CREATE (f1)-[:FAMILY_RELATION {
				relation_type: $relation_type,
				specific_relation: $specific_relation,
				strength: $strength,
				verified: $verified,
				established_date: date($established_date),
				notes: $notes,
				created_at: datetime($created_at)
			}]->(f2)
			CREATE (f2)-[:FAMILY_RELATION {
				relation_type: $relation_type,
				specific_relation: $specific_relation,
				strength: $strength,
				verified: $verified,
				established_date: date($established_date),
				notes: $notes,
				created_at: datetime($created_at)
			}]->(f1)
		`
		
		params := map[string]interface{}{
			"from_family_id":     connection.FromFamilyID,
			"to_family_id":       connection.ToFamilyID,
			"relation_type":      connection.RelationType,
			"specific_relation":  connection.SpecificRelation,
			"strength":           connection.Strength,
			"verified":           connection.Verified,
			"established_date":   connection.EstablishedDate.Format("2006-01-02"),
			"notes":             fmt.Sprintf("Connection established on %s", connection.EstablishedDate.Format("2006-01-02")),
			"created_at":         connection.CreatedAt.Format(time.RFC3339),
		}

		_, err = tx.Run(ctx, createQuery, params)
		return nil, err
	})

	return err
}

// FindShortestPath finds the shortest path between two families with cycle detection
func (r *ConnectionRepository) FindShortestPath(ctx context.Context, fromFamilyID, toFamilyID string, maxDepth int) (*models.ConnectionPath, error) {
	if fromFamilyID == toFamilyID {
		return &models.ConnectionPath{
			SourceFamilyID: fromFamilyID,
			TargetFamilyID: toFamilyID,
			Path:           []string{fromFamilyID},
			Degree:         0,
			PathStrength:   1.0,
			Verified:       true,
			CalculatedAt:   time.Now(),
		}, nil
	}

	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH path = shortestPath((source:Family {family_id: $from_family_id})-[:FAMILY_RELATION*1..$max_depth]-(target:Family {family_id: $to_family_id}))
			WITH path, relationships(path) as rels, nodes(path) as pathNodes
			WHERE ALL(r IN rels WHERE r.verified = true)
			AND length([n IN pathNodes WHERE n.family_id = $from_family_id | n]) = 1  // Ensure no cycles - source appears only once
			AND length([n IN pathNodes WHERE n.family_id = $to_family_id | n]) = 1   // Ensure no cycles - target appears only once
			AND size(pathNodes) = size(apoc.coll.toSet([n IN pathNodes | n.family_id])) // No duplicate family IDs in path
			WITH path, rels, pathNodes,
				 reduce(strength = 1.0, r IN rels | strength * r.strength) as path_strength,
				 [r IN rels | r.relation_type] as relation_types
			RETURN [n IN pathNodes | n.family_id] as family_path,
				   length(path) as degree,
				   path_strength,
				   relation_types,
				   ALL(r IN rels WHERE r.verified = true) as all_verified
			ORDER BY degree ASC, path_strength DESC
			LIMIT 1
		`
		
		result, err := tx.Run(ctx, query, map[string]interface{}{
			"from_family_id": fromFamilyID,
			"to_family_id":   toFamilyID,
			"max_depth":      maxDepth,
		})
		
		if err != nil {
			return nil, err
		}

		if result.Next(ctx) {
			record := result.Record()
			
			pathNodes, _ := record.Get("family_path")
			degree, _ := record.Get("degree")
			pathStrength, _ := record.Get("path_strength")
			relationTypes, _ := record.Get("relation_types")
			allVerified, _ := record.Get("all_verified")
			
			var familyPath []string
			for _, node := range pathNodes.([]interface{}) {
				familyPath = append(familyPath, node.(string))
			}
			
			var relTypes []string
			for _, relType := range relationTypes.([]interface{}) {
				relTypes = append(relTypes, relType.(string))
			}

			connectionPath := &models.ConnectionPath{
				SourceFamilyID: fromFamilyID,
				TargetFamilyID: toFamilyID,
				Path:           familyPath,
				Degree:         int(degree.(int64)),
				PathStrength:   pathStrength.(float64),
				RelationTypes:  relTypes,
				Verified:       allVerified.(bool),
				CalculatedAt:   time.Now(),
			}

			return connectionPath, nil
		}

		return nil, nil // No path found
	})

	if err != nil {
		return nil, err
	}

	if result == nil {
		return nil, nil // No path found
	}

	return result.(*models.ConnectionPath), nil
}

// FindBidirectionalPath implements bidirectional BFS for efficient pathfinding with cycle detection
func (r *ConnectionRepository) FindBidirectionalPath(ctx context.Context, fromFamilyID, toFamilyID string, maxDepth int) (*models.ConnectionPath, error) {
	if fromFamilyID == toFamilyID {
		return &models.ConnectionPath{
			SourceFamilyID: fromFamilyID,
			TargetFamilyID: toFamilyID,
			Path:           []string{fromFamilyID},
			Degree:         0,
			PathStrength:   1.0,
			Verified:       true,
			CalculatedAt:   time.Now(),
		}, nil
	}

	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		// Use Cypher's bidirectional search with cycle prevention
		query := `
			WITH $from_family_id as source_id, $to_family_id as target_id, $max_depth as max_depth
			CALL {
				WITH source_id, target_id, max_depth
				MATCH path = shortestPath((source:Family {family_id: source_id})-[:FAMILY_RELATION*1..max_depth]-(target:Family {family_id: target_id}))
				WITH path, relationships(path) as rels, nodes(path) as pathNodes
				WHERE ALL(r IN rels WHERE r.verified = true)
				// Cycle detection: ensure each family appears only once in the path
				AND size(pathNodes) = size(apoc.coll.toSet([n IN pathNodes | n.family_id]))
				// Additional check: path should not revisit any node
				AND size([n IN pathNodes WHERE n.family_id IN [source_id, target_id] | n]) = 2
				RETURN path, rels, pathNodes,
					   reduce(strength = 1.0, r IN rels | strength * r.strength) as path_strength,
					   [r IN rels | r.relation_type] as relation_types,
					   ALL(r IN rels WHERE r.verified = true) as all_verified
				ORDER BY length(path) ASC, path_strength DESC
				LIMIT 1
			}
			RETURN [n IN pathNodes | n.family_id] as family_path,
				   length(path) as degree,
				   path_strength,
				   relation_types,
				   all_verified
		`
		
		result, err := tx.Run(ctx, query, map[string]interface{}{
			"from_family_id": fromFamilyID,
			"to_family_id":   toFamilyID,
			"max_depth":      maxDepth,
		})
		
		if err != nil {
			return nil, err
		}

		if result.Next(ctx) {
			record := result.Record()
			
			pathNodes, _ := record.Get("family_path")
			degree, _ := record.Get("degree")
			pathStrength, _ := record.Get("path_strength")
			relationTypes, _ := record.Get("relation_types")
			allVerified, _ := record.Get("all_verified")
			
			var familyPath []string
			if pathNodes != nil {
				for _, node := range pathNodes.([]interface{}) {
					familyPath = append(familyPath, node.(string))
				}
			}
			
			var relTypes []string
			if relationTypes != nil {
				for _, relType := range relationTypes.([]interface{}) {
					relTypes = append(relTypes, relType.(string))
				}
			}

			connectionPath := &models.ConnectionPath{
				SourceFamilyID: fromFamilyID,
				TargetFamilyID: toFamilyID,
				Path:           familyPath,
				Degree:         int(degree.(int64)),
				PathStrength:   pathStrength.(float64),
				RelationTypes:  relTypes,
				Verified:       allVerified.(bool),
				CalculatedAt:   time.Now(),
			}

			// Validate path has no cycles
			if !connectionPath.IsValidPath() {
				return nil, fmt.Errorf("invalid path detected with cycles")
			}

			return connectionPath, nil
		}

		return nil, nil // No path found
	})

	if err != nil {
		return nil, err
	}

	if result == nil {
		return nil, nil // No path found
	}

	return result.(*models.ConnectionPath), nil
}

// FindMultiplePaths finds multiple paths between two families (K-shortest paths with cycle detection)
func (r *ConnectionRepository) FindMultiplePaths(ctx context.Context, fromFamilyID, toFamilyID string, maxDepth, maxPaths int) ([]*models.ConnectionPath, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH path = (source:Family {family_id: $from_family_id})-[:FAMILY_RELATION*1..$max_depth]-(target:Family {family_id: $to_family_id})
			WITH path, relationships(path) as rels, nodes(path) as pathNodes
			WHERE ALL(r IN rels WHERE r.verified = true)
			// Cycle detection: ensure no family appears more than once
			AND size(pathNodes) = size(apoc.coll.toSet([n IN pathNodes | n.family_id]))
			// Additional validation: path length should be consistent
			AND length(path) <= $max_depth
			WITH path, rels, pathNodes,
				 reduce(strength = 1.0, r IN rels | strength * r.strength) as path_strength,
				 [r IN rels | r.relation_type] as relation_types,
				 length(path) as degree
			RETURN DISTINCT [n IN pathNodes | n.family_id] as family_path,
				   degree,
				   path_strength,
				   relation_types,
				   ALL(r IN rels WHERE r.verified = true) as all_verified
			ORDER BY degree ASC, path_strength DESC
			LIMIT $max_paths
		`
		
		result, err := tx.Run(ctx, query, map[string]interface{}{
			"from_family_id": fromFamilyID,
			"to_family_id":   toFamilyID,
			"max_depth":      maxDepth,
			"max_paths":      maxPaths,
		})
		
		if err != nil {
			return nil, err
		}

		var paths []*models.ConnectionPath
		for result.Next(ctx) {
			record := result.Record()
			
			pathNodes, _ := record.Get("family_path")
			degree, _ := record.Get("degree")
			pathStrength, _ := record.Get("path_strength")
			relationTypes, _ := record.Get("relation_types")
			allVerified, _ := record.Get("all_verified")
			
			var familyPath []string
			for _, node := range pathNodes.([]interface{}) {
				familyPath = append(familyPath, node.(string))
			}
			
			var relTypes []string
			for _, relType := range relationTypes.([]interface{}) {
				relTypes = append(relTypes, relType.(string))
			}

			connectionPath := &models.ConnectionPath{
				SourceFamilyID: fromFamilyID,
				TargetFamilyID: toFamilyID,
				Path:           familyPath,
				Degree:         int(degree.(int64)),
				PathStrength:   pathStrength.(float64),
				RelationTypes:  relTypes,
				Verified:       allVerified.(bool),
				CalculatedAt:   time.Now(),
			}

			// Validate path has no cycles before adding
			if connectionPath.IsValidPath() {
				paths = append(paths, connectionPath)
			}
		}

		return paths, nil
	})

	if err != nil {
		return nil, err
	}

	return result.([]*models.ConnectionPath), nil
}

// GetFamilyConnections retrieves all direct connections for a family
func (r *ConnectionRepository) GetFamilyConnections(ctx context.Context, familyID string, degree int) ([]string, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		var query string
		
		switch degree {
		case 1:
			query = `
				MATCH (source:Family {family_id: $family_id})-[:FAMILY_RELATION]-(connected:Family)
				RETURN DISTINCT connected.family_id as family_id
				ORDER BY connected.trust_score DESC
			`
		case 2:
			query = `
				MATCH (source:Family {family_id: $family_id})-[:FAMILY_RELATION*2]-(connected:Family)
				WHERE connected.family_id <> $family_id  // Exclude self
				RETURN DISTINCT connected.family_id as family_id
				ORDER BY connected.trust_score DESC
			`
		case 3:
			query = `
				MATCH (source:Family {family_id: $family_id})-[:FAMILY_RELATION*3]-(connected:Family)
				WHERE connected.family_id <> $family_id  // Exclude self
				RETURN DISTINCT connected.family_id as family_id
				ORDER BY connected.trust_score DESC
			`
		default:
			query = `
				MATCH (source:Family {family_id: $family_id})-[:FAMILY_RELATION*1..$degree]-(connected:Family)
				WHERE connected.family_id <> $family_id  // Exclude self
				RETURN DISTINCT connected.family_id as family_id
				ORDER BY connected.trust_score DESC
			`
		}
		
		params := map[string]interface{}{
			"family_id": familyID,
		}
		
		if degree > 3 {
			params["degree"] = degree
		}
		
		result, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}

		var connections []string
		for result.Next(ctx) {
			record := result.Record()
			familyIDValue, _ := record.Get("family_id")
			connections = append(connections, familyIDValue.(string))
		}

		return connections, nil
	})

	if err != nil {
		return nil, err
	}

	return result.([]string), nil
}

// GetConnectionStrength calculates the connection strength between two families
func (r *ConnectionRepository) GetConnectionStrength(ctx context.Context, family1ID, family2ID string) (float64, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (f1:Family {family_id: $family1_id})-[r:FAMILY_RELATION]-(f2:Family {family_id: $family2_id})
			RETURN r.strength as strength
		`
		
		result, err := tx.Run(ctx, query, map[string]interface{}{
			"family1_id": family1ID,
			"family2_id": family2ID,
		})
		
		if err != nil {
			return nil, err
		}

		if result.Next(ctx) {
			record := result.Record()
			strength, _ := record.Get("strength")
			return strength.(float64), nil
		}

		return 0.0, nil // No direct connection
	})

	if err != nil {
		return 0, err
	}

	return result.(float64), nil
}

// ValidateNoCircularConnections ensures that adding a connection won't create invalid cycles
func (r *ConnectionRepository) ValidateNoCircularConnections(ctx context.Context, fromFamilyID, toFamilyID string) error {
	// Check if families are the same
	if fromFamilyID == toFamilyID {
		return fmt.Errorf("cannot create connection from family to itself")
	}

	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		// Check if connection already exists
		query := `
			MATCH (f1:Family {family_id: $from_family_id})
			MATCH (f2:Family {family_id: $to_family_id})
			OPTIONAL MATCH (f1)-[r:FAMILY_RELATION]-(f2)
			RETURN r IS NOT NULL as connection_exists
		`
		
		result, err := tx.Run(ctx, query, map[string]interface{}{
			"from_family_id": fromFamilyID,
			"to_family_id":   toFamilyID,
		})
		
		if err != nil {
			return nil, err
		}

		if result.Next(ctx) {
			record := result.Record()
			exists, _ := record.Get("connection_exists")
			if exists.(bool) {
				return fmt.Errorf("connection already exists"), nil
			}
		}

		return nil, nil
	})

	if err != nil {
		return err
	}

	if result != nil {
		if err, ok := result.(error); ok {
			return err
		}
	}

	return nil
}

// GetNetworkStats provides statistics about the family network
func (r *ConnectionRepository) GetNetworkStats(ctx context.Context) (map[string]interface{}, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (f:Family)
			OPTIONAL MATCH ()-[r:FAMILY_RELATION]-()
			WITH count(DISTINCT f) as total_families,
				 count(r)/2 as total_connections,  // Divide by 2 since connections are bidirectional
				 avg(f.trust_score) as avg_trust_score
			OPTIONAL MATCH (f1:Family)-[r:FAMILY_RELATION]-(f2:Family)
			WHERE r.verified = true
			WITH total_families, total_connections, avg_trust_score,
				 count(r)/2 as verified_connections
			RETURN total_families, total_connections, verified_connections, avg_trust_score,
				   CASE 
					   WHEN total_families > 1 THEN (toFloat(total_connections) / (total_families * (total_families - 1) / 2)) * 100 
					   ELSE 0.0 
				   END as network_density_percentage
		`
		
		result, err := tx.Run(ctx, query, nil)
		if err != nil {
			return nil, err
		}

		if result.Next(ctx) {
			record := result.Record()
			
			stats := map[string]interface{}{
				"total_families":                record.Values[0],
				"total_connections":             record.Values[1],
				"verified_connections":          record.Values[2],
				"average_trust_score":           record.Values[3],
				"network_density_percentage":    record.Values[4],
				"calculated_at":                 time.Now(),
			}
			
			return stats, nil
		}

		return map[string]interface{}{}, nil
	})

	if err != nil {
		return nil, err
	}

	return result.(map[string]interface{}), nil
}