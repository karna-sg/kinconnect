package database

import (
	"context"
	"families-linkedin/internal/config"
	"fmt"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// NewNeo4jConnection creates a new Neo4j driver connection
func NewNeo4jConnection(cfg config.Neo4jConfig) (neo4j.DriverWithContext, error) {
	driver, err := neo4j.NewDriverWithContext(
		cfg.URI,
		neo4j.BasicAuth(cfg.Username, cfg.Password, ""),
		func(config *neo4j.Config) {
			config.MaxConnectionLifetime = 30 * time.Minute
			config.MaxConnectionPoolSize = cfg.MaxConnections
			config.ConnectionAcquisitionTimeout = cfg.ConnectionTimeout
			config.MaxTransactionRetryTime = cfg.MaxTransactionRetryTime
		},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create Neo4j driver: %w", err)
	}

	return driver, nil
}

// VerifyConnection verifies the Neo4j database connection
func VerifyConnection(driver neo4j.DriverWithContext) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	session := driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	_, err := session.Run(ctx, "RETURN 1 as test", nil)
	if err != nil {
		return fmt.Errorf("failed to verify Neo4j connection: %w", err)
	}

	return nil
}

// CreateConstraintsAndIndexes creates necessary constraints and indexes for optimal performance
func CreateConstraintsAndIndexes(driver neo4j.DriverWithContext) error {
	ctx := context.Background()
	session := driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	constraints := []string{
		// Family constraints
		"CREATE CONSTRAINT family_id_unique IF NOT EXISTS FOR (f:Family) REQUIRE f.family_id IS UNIQUE",
		
		// Person constraints
		"CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.person_id IS UNIQUE",
	}

	indexes := []string{
		// Family indexes
		"CREATE INDEX family_location IF NOT EXISTS FOR (f:Family) ON (f.city, f.state)",
		"CREATE INDEX family_community IF NOT EXISTS FOR (f:Family) ON (f.caste, f.sub_caste)",
		"CREATE INDEX family_trust_score IF NOT EXISTS FOR (f:Family) ON (f.trust_score)",
		"CREATE INDEX family_verification IF NOT EXISTS FOR (f:Family) ON (f.verification_status)",
		"CREATE INDEX family_active_status IF NOT EXISTS FOR (f:Family) ON (f.active_status)",
		"CREATE INDEX family_created_at IF NOT EXISTS FOR (f:Family) ON (f.created_at)",
		
		// Person indexes
		"CREATE INDEX person_eligibility IF NOT EXISTS FOR (p:Person) ON (p.eligible_for_marriage, p.marital_status)",
		"CREATE INDEX person_age_gender IF NOT EXISTS FOR (p:Person) ON (p.age, p.gender)",
		"CREATE INDEX person_education IF NOT EXISTS FOR (p:Person) ON (p.highest_degree)",
		"CREATE INDEX person_profession IF NOT EXISTS FOR (p:Person) ON (p.industry)",
		"CREATE INDEX person_family IF NOT EXISTS FOR (p:Person) ON (p.family_id)",
		
		// Composite indexes for common queries
		"CREATE INDEX person_search_criteria IF NOT EXISTS FOR (p:Person) ON (p.gender, p.age, p.marital_status, p.eligible_for_marriage)",
		"CREATE INDEX family_location_community IF NOT EXISTS FOR (f:Family) ON (f.city, f.caste, f.trust_score)",
		
		// Relationship indexes
		"CREATE INDEX rel_type_strength IF NOT EXISTS FOR ()-[r]-() ON (r.relation_type, r.strength)",
		"CREATE INDEX rel_verified IF NOT EXISTS FOR ()-[r]-() ON (r.verified)",
		"CREATE INDEX rel_established_date IF NOT EXISTS FOR ()-[r]-() ON (r.established_date)",
	}

	// Create constraints
	for _, constraint := range constraints {
		_, err := session.Run(ctx, constraint, nil)
		if err != nil {
			return fmt.Errorf("failed to create constraint '%s': %w", constraint, err)
		}
	}

	// Create indexes
	for _, index := range indexes {
		_, err := session.Run(ctx, index, nil)
		if err != nil {
			return fmt.Errorf("failed to create index '%s': %w", index, err)
		}
	}

	return nil
}

// TransactionFunc represents a function that can be executed within a Neo4j transaction
type TransactionFunc func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error)

// ExecuteWithTransaction executes a function within a Neo4j transaction with retry logic
func ExecuteWithTransaction(ctx context.Context, session neo4j.SessionWithContext, fn TransactionFunc) (interface{}, error) {
	return session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (interface{}, error) {
		return fn(ctx, tx)
	})
}

// ExecuteReadTransaction executes a read-only transaction
func ExecuteReadTransaction(ctx context.Context, session neo4j.SessionWithContext, fn TransactionFunc) (interface{}, error) {
	return session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (interface{}, error) {
		return fn(ctx, tx)
	})
}

// BatchWriter helps with efficient batch operations
type BatchWriter struct {
	driver      neo4j.DriverWithContext
	batchSize   int
	database    string
}

// NewBatchWriter creates a new batch writer
func NewBatchWriter(driver neo4j.DriverWithContext, batchSize int, database string) *BatchWriter {
	return &BatchWriter{
		driver:    driver,
		batchSize: batchSize,
		database:  database,
	}
}

// WriteFamiliesBatch writes families in batches for optimal performance
func (bw *BatchWriter) WriteFamiliesBatch(ctx context.Context, families []map[string]interface{}) error {
	session := bw.driver.NewSession(ctx, neo4j.SessionConfig{
		AccessMode:   neo4j.AccessModeWrite,
		DatabaseName: bw.database,
	})
	defer session.Close(ctx)

	for i := 0; i < len(families); i += bw.batchSize {
		end := i + bw.batchSize
		if end > len(families) {
			end = len(families)
		}

		batch := families[i:end]
		
		_, err := ExecuteWithTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
			query := `
				UNWIND $families AS family
				CREATE (f:Family {
					family_id: family.family_id,
					family_name: family.family_name,
					primary_surname: family.primary_surname,
					city: family.city,
					state: family.state,
					country: family.country,
					region: family.region,
					caste: family.caste,
					sub_caste: family.sub_caste,
					religion: family.religion,
					languages: family.languages,
					trust_score: family.trust_score,
					verification_status: family.verification_status,
					profile_visibility: family.profile_visibility,
					contact_sharing: family.contact_sharing,
					created_at: datetime(family.created_at),
					updated_at: datetime(family.updated_at),
					active_status: family.active_status
				})
			`
			
			_, err := tx.Run(ctx, query, map[string]interface{}{"families": batch})
			return nil, err
		})

		if err != nil {
			return fmt.Errorf("failed to write family batch %d-%d: %w", i, end, err)
		}
	}

	return nil
}

// WritePersonsBatch writes persons in batches for optimal performance
func (bw *BatchWriter) WritePersonsBatch(ctx context.Context, persons []map[string]interface{}) error {
	session := bw.driver.NewSession(ctx, neo4j.SessionConfig{
		AccessMode:   neo4j.AccessModeWrite,
		DatabaseName: bw.database,
	})
	defer session.Close(ctx)

	for i := 0; i < len(persons); i += bw.batchSize {
		end := i + bw.batchSize
		if end > len(persons) {
			end = len(persons)
		}

		batch := persons[i:end]
		
		_, err := ExecuteWithTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
			query := `
				UNWIND $persons AS person
				MATCH (f:Family {family_id: person.family_id})
				CREATE (p:Person {
					person_id: person.person_id,
					family_id: person.family_id,
					first_name: person.first_name,
					last_name: person.last_name,
					gender: person.gender,
					age: person.age,
					date_of_birth: date(person.date_of_birth),
					marital_status: person.marital_status,
					eligible_for_marriage: person.eligible_for_marriage,
					highest_degree: person.highest_degree,
					institution: person.institution,
					field_of_study: person.field_of_study,
					graduation_year: person.graduation_year,
					job_title: person.job_title,
					company: person.company,
					industry: person.industry,
					experience_years: person.experience_years,
					annual_income: person.annual_income,
					height: person.height,
					complexion: person.complexion,
					body_type: person.body_type,
					hobbies: person.hobbies,
					profile_visibility: person.profile_visibility,
					created_at: datetime(person.created_at),
					updated_at: datetime(person.updated_at)
				})
				CREATE (p)-[:BELONGS_TO {role: person.role, primary_member: person.primary_member}]->(f)
			`
			
			_, err := tx.Run(ctx, query, map[string]interface{}{"persons": batch})
			return nil, err
		})

		if err != nil {
			return fmt.Errorf("failed to write person batch %d-%d: %w", i, end, err)
		}
	}

	return nil
}

// WriteRelationshipsBatch writes relationships in batches for optimal performance
func (bw *BatchWriter) WriteRelationshipsBatch(ctx context.Context, relationships []map[string]interface{}) error {
	session := bw.driver.NewSession(ctx, neo4j.SessionConfig{
		AccessMode:   neo4j.AccessModeWrite,
		DatabaseName: bw.database,
	})
	defer session.Close(ctx)

	for i := 0; i < len(relationships); i += bw.batchSize {
		end := i + bw.batchSize
		if end > len(relationships) {
			end = len(relationships)
		}

		batch := relationships[i:end]
		
		_, err := ExecuteWithTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
			query := `
				UNWIND $relationships AS rel
				MATCH (f1:Family {family_id: rel.from_family_id})
				MATCH (f2:Family {family_id: rel.to_family_id})
				CREATE (f1)-[:FAMILY_RELATION {
					relation_type: rel.relation_type,
					specific_relation: rel.specific_relation,
					strength: rel.strength,
					verified: rel.verified,
					established_date: date(rel.established_date),
					mutual_events: rel.mutual_events,
					notes: rel.notes,
					created_at: datetime(rel.created_at)
				}]->(f2)
			`
			
			_, err := tx.Run(ctx, query, map[string]interface{}{"relationships": batch})
			return nil, err
		})

		if err != nil {
			return fmt.Errorf("failed to write relationship batch %d-%d: %w", i, end, err)
		}
	}

	return nil
}

// HealthCheck performs a comprehensive health check on the Neo4j database
func HealthCheck(driver neo4j.DriverWithContext) (map[string]interface{}, error) {
	ctx := context.Background()
	session := driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	healthData := make(map[string]interface{})
	
	// Check basic connectivity
	start := time.Now()
	result, err := session.Run(ctx, "RETURN 1 as test", nil)
	if err != nil {
		return nil, fmt.Errorf("connectivity check failed: %w", err)
	}
	
	if result.Next(ctx) {
		healthData["connectivity"] = "ok"
		healthData["response_time_ms"] = time.Since(start).Milliseconds()
	} else {
		return nil, fmt.Errorf("no result returned from connectivity check")
	}

	// Get database statistics
	result, err = session.Run(ctx, `
		MATCH (n) RETURN 
		count(n) as total_nodes,
		count{(n:Family)} as family_count,
		count{(n:Person)} as person_count
	`, nil)
	
	if err != nil {
		healthData["statistics_error"] = err.Error()
	} else if result.Next(ctx) {
		record := result.Record()
		healthData["total_nodes"] = record.Values[0]
		healthData["family_count"] = record.Values[1]
		healthData["person_count"] = record.Values[2]
	}

	// Get relationship statistics
	result, err = session.Run(ctx, `
		MATCH ()-[r]->() RETURN 
		count(r) as total_relationships,
		count{()-[r:FAMILY_RELATION]-()} as family_relations,
		count{()-[r:BELONGS_TO]-()} as belongs_to_relations
	`, nil)
	
	if err != nil {
		healthData["relationship_stats_error"] = err.Error()
	} else if result.Next(ctx) {
		record := result.Record()
		healthData["total_relationships"] = record.Values[0]
		healthData["family_relations"] = record.Values[1]
		healthData["belongs_to_relations"] = record.Values[2]
	}

	healthData["timestamp"] = time.Now()
	return healthData, nil
}