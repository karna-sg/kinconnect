package repository

import (
	"context"
	"families-linkedin/internal/database"
	"families-linkedin/internal/models"
	"fmt"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type FamilyRepository struct {
	driver neo4j.DriverWithContext
}

func NewFamilyRepository(driver neo4j.DriverWithContext) *FamilyRepository {
	return &FamilyRepository{driver: driver}
}

// CreateFamily creates a new family in the database
func (r *FamilyRepository) CreateFamily(ctx context.Context, family *models.Family) error {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := database.ExecuteWithTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			CREATE (f:Family {
				family_id: $family_id,
				family_name: $family_name,
				primary_surname: $primary_surname,
				city: $city,
				state: $state,
				country: $country,
				region: $region,
				caste: $caste,
				sub_caste: $sub_caste,
				religion: $religion,
				languages: $languages,
				primary_phone: $primary_phone,
				email: $email,
				address: $address,
				verification_status: $verification_status,
				verified_by: $verified_by,
				trust_score: $trust_score,
				profile_visibility: $profile_visibility,
				contact_sharing: $contact_sharing,
				created_at: datetime($created_at),
				updated_at: datetime($updated_at),
				active_status: $active_status
			})
			RETURN f.family_id
		`
		
		params := map[string]interface{}{
			"family_id":           family.ID,
			"family_name":         family.Name,
			"primary_surname":     family.PrimarySurname,
			"city":               family.Location.City,
			"state":              family.Location.State,
			"country":            family.Location.Country,
			"region":             family.Location.Region,
			"caste":              family.Community.Caste,
			"sub_caste":          family.Community.SubCaste,
			"religion":           family.Community.Religion,
			"languages":          family.Community.Languages,
			"primary_phone":      family.ContactInfo.PrimaryPhone,
			"email":              family.ContactInfo.Email,
			"address":            family.ContactInfo.Address,
			"verification_status": family.Verification.Status,
			"verified_by":        family.Verification.VerifiedBy,
			"trust_score":        family.TrustScore,
			"profile_visibility": family.PrivacySettings.ProfileVisibility,
			"contact_sharing":    family.PrivacySettings.ContactSharing,
			"created_at":         family.CreatedAt.Format(time.RFC3339),
			"updated_at":         family.UpdatedAt.Format(time.RFC3339),
			"active_status":      family.ActiveStatus,
		}

		_, err := tx.Run(ctx, query, params)
		return nil, err
	})

	return err
}

// GetFamilyByID retrieves a family by its ID
func (r *FamilyRepository) GetFamilyByID(ctx context.Context, familyID string) (*models.Family, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (f:Family {family_id: $family_id})
			RETURN f
		`
		
		result, err := tx.Run(ctx, query, map[string]interface{}{
			"family_id": familyID,
		})
		
		if err != nil {
			return nil, err
		}

		if result.Next(ctx) {
			record := result.Record()
			return r.mapRecordToFamily(record)
		}

		return nil, nil
	})

	if err != nil {
		return nil, err
	}

	if result == nil {
		return nil, fmt.Errorf("family not found: %s", familyID)
	}

	return result.(*models.Family), nil
}

// UpdateFamily updates an existing family
func (r *FamilyRepository) UpdateFamily(ctx context.Context, family *models.Family) error {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := database.ExecuteWithTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (f:Family {family_id: $family_id})
			SET f.family_name = $family_name,
				f.primary_surname = $primary_surname,
				f.city = $city,
				f.state = $state,
				f.country = $country,
				f.region = $region,
				f.caste = $caste,
				f.sub_caste = $sub_caste,
				f.religion = $religion,
				f.languages = $languages,
				f.primary_phone = $primary_phone,
				f.email = $email,
				f.address = $address,
				f.verification_status = $verification_status,
				f.verified_by = $verified_by,
				f.trust_score = $trust_score,
				f.profile_visibility = $profile_visibility,
				f.contact_sharing = $contact_sharing,
				f.updated_at = datetime($updated_at),
				f.active_status = $active_status
			RETURN f.family_id
		`
		
		family.UpdatedAt = time.Now()
		
		params := map[string]interface{}{
			"family_id":           family.ID,
			"family_name":         family.Name,
			"primary_surname":     family.PrimarySurname,
			"city":               family.Location.City,
			"state":              family.Location.State,
			"country":            family.Location.Country,
			"region":             family.Location.Region,
			"caste":              family.Community.Caste,
			"sub_caste":          family.Community.SubCaste,
			"religion":           family.Community.Religion,
			"languages":          family.Community.Languages,
			"primary_phone":      family.ContactInfo.PrimaryPhone,
			"email":              family.ContactInfo.Email,
			"address":            family.ContactInfo.Address,
			"verification_status": family.Verification.Status,
			"verified_by":        family.Verification.VerifiedBy,
			"trust_score":        family.TrustScore,
			"profile_visibility": family.PrivacySettings.ProfileVisibility,
			"contact_sharing":    family.PrivacySettings.ContactSharing,
			"updated_at":         family.UpdatedAt.Format(time.RFC3339),
			"active_status":      family.ActiveStatus,
		}

		_, err := tx.Run(ctx, query, params)
		return nil, err
	})

	return err
}

// DeleteFamily soft deletes a family (sets status to inactive)
func (r *FamilyRepository) DeleteFamily(ctx context.Context, familyID string) error {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := database.ExecuteWithTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (f:Family {family_id: $family_id})
			SET f.active_status = 'INACTIVE',
				f.updated_at = datetime($updated_at)
			RETURN f.family_id
		`
		
		_, err := tx.Run(ctx, query, map[string]interface{}{
			"family_id":  familyID,
			"updated_at": time.Now().Format(time.RFC3339),
		})
		return nil, err
	})

	return err
}

// SearchFamilies searches for families based on criteria
func (r *FamilyRepository) SearchFamilies(ctx context.Context, criteria *models.FamilySearchCriteria) ([]*models.Family, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := "MATCH (f:Family) WHERE f.active_status = 'ACTIVE'"
		params := make(map[string]interface{})

		// Build dynamic WHERE clauses
		if criteria.City != "" {
			query += " AND f.city = $city"
			params["city"] = criteria.City
		}

		if criteria.State != "" {
			query += " AND f.state = $state"
			params["state"] = criteria.State
		}

		if criteria.Caste != "" {
			query += " AND f.caste = $caste"
			params["caste"] = criteria.Caste
		}

		if criteria.Religion != "" {
			query += " AND f.religion = $religion"
			params["religion"] = criteria.Religion
		}

		if criteria.MinTrustScore > 0 {
			query += " AND f.trust_score >= $min_trust_score"
			params["min_trust_score"] = criteria.MinTrustScore
		}

		if criteria.VerifiedOnly {
			query += " AND f.verification_status = 'VERIFIED'"
		}

		if len(criteria.Languages) > 0 {
			query += " AND ANY(lang IN f.languages WHERE lang IN $languages)"
			params["languages"] = criteria.Languages
		}

		// Add ordering
		query += " ORDER BY f.trust_score DESC, f.created_at DESC"

		// Add pagination
		if criteria.Limit > 0 {
			query += " SKIP $offset LIMIT $limit"
			params["offset"] = criteria.Offset
			params["limit"] = criteria.Limit
		}

		query += " RETURN f"

		result, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}

		var families []*models.Family
		for result.Next(ctx) {
			family, err := r.mapRecordToFamily(result.Record())
			if err != nil {
				return nil, err
			}
			families = append(families, family)
		}

		return families, nil
	})

	if err != nil {
		return nil, err
	}

	return result.([]*models.Family), nil
}

// GetFamiliesByIDs retrieves multiple families by their IDs
func (r *FamilyRepository) GetFamiliesByIDs(ctx context.Context, familyIDs []string) ([]*models.Family, error) {
	if len(familyIDs) == 0 {
		return []*models.Family{}, nil
	}

	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (f:Family)
			WHERE f.family_id IN $family_ids
			RETURN f
			ORDER BY f.trust_score DESC
		`
		
		result, err := tx.Run(ctx, query, map[string]interface{}{
			"family_ids": familyIDs,
		})
		
		if err != nil {
			return nil, err
		}

		var families []*models.Family
		for result.Next(ctx) {
			family, err := r.mapRecordToFamily(result.Record())
			if err != nil {
				return nil, err
			}
			families = append(families, family)
		}

		return families, nil
	})

	if err != nil {
		return nil, err
	}

	return result.([]*models.Family), nil
}

// GetFamilyTrustScore calculates and returns the trust score for a family
func (r *FamilyRepository) GetFamilyTrustScore(ctx context.Context, familyID string) (float64, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (f:Family {family_id: $family_id})
			OPTIONAL MATCH (f)-[r:FAMILY_RELATION]-(connected:Family)
			WHERE r.verified = true
			WITH f, COUNT(connected) as total_connections, AVG(r.strength) as avg_strength,
				 COUNT(CASE WHEN r.relation_type = 'RELATIVE' THEN 1 END) as relative_connections,
				 COUNT(CASE WHEN r.relation_type = 'COMMUNITY_RELATION' THEN 1 END) as community_connections
			RETURN f.trust_score as current_score,
				   (total_connections * 0.3 + 
					coalesce(avg_strength, 0.5) * 0.4 + 
					(relative_connections * 2 + community_connections) * 0.3) as calculated_score,
				   total_connections, avg_strength, relative_connections, community_connections
		`
		
		result, err := tx.Run(ctx, query, map[string]interface{}{
			"family_id": familyID,
		})
		
		if err != nil {
			return nil, err
		}

		if result.Next(ctx) {
			record := result.Record()
			calculatedScore, _ := record.Get("calculated_score")
			return calculatedScore.(float64), nil
		}

		return 0.0, nil
	})

	if err != nil {
		return 0, err
	}

	return result.(float64), nil
}

// UpdateFamilyTrustScore updates the family's trust score
func (r *FamilyRepository) UpdateFamilyTrustScore(ctx context.Context, familyID string, score float64) error {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := database.ExecuteWithTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (f:Family {family_id: $family_id})
			SET f.trust_score = $trust_score,
				f.updated_at = datetime($updated_at)
			RETURN f.family_id
		`
		
		_, err := tx.Run(ctx, query, map[string]interface{}{
			"family_id":   familyID,
			"trust_score": score,
			"updated_at":  time.Now().Format(time.RFC3339),
		})
		return nil, err
	})

	return err
}

// Helper function to map Neo4j record to Family model
func (r *FamilyRepository) mapRecordToFamily(record *neo4j.Record) (*models.Family, error) {
	node, ok := record.Get("f")
	if !ok {
		return nil, fmt.Errorf("family node not found in record")
	}

	familyNode := node.(neo4j.Node)
	props := familyNode.Props

	family := &models.Family{}
	
	if id, ok := props["family_id"].(string); ok {
		family.ID = id
	}
	
	if name, ok := props["family_name"].(string); ok {
		family.Name = name
	}
	
	if surname, ok := props["primary_surname"].(string); ok {
		family.PrimarySurname = surname
	}

	// Location
	if city, ok := props["city"].(string); ok {
		family.Location.City = city
	}
	if state, ok := props["state"].(string); ok {
		family.Location.State = state
	}
	if country, ok := props["country"].(string); ok {
		family.Location.Country = country
	}
	if region, ok := props["region"].(string); ok {
		family.Location.Region = region
	}

	// Community
	if caste, ok := props["caste"].(string); ok {
		family.Community.Caste = caste
	}
	if subCaste, ok := props["sub_caste"].(string); ok {
		family.Community.SubCaste = subCaste
	}
	if religion, ok := props["religion"].(string); ok {
		family.Community.Religion = religion
	}
	if languages, ok := props["languages"].([]interface{}); ok {
		for _, lang := range languages {
			if langStr, ok := lang.(string); ok {
				family.Community.Languages = append(family.Community.Languages, langStr)
			}
		}
	}

	// Contact Info
	if phone, ok := props["primary_phone"].(string); ok {
		family.ContactInfo.PrimaryPhone = phone
	}
	if email, ok := props["email"].(string); ok {
		family.ContactInfo.Email = email
	}
	if address, ok := props["address"].(string); ok {
		family.ContactInfo.Address = address
	}

	// Verification
	if status, ok := props["verification_status"].(string); ok {
		family.Verification.Status = status
	}
	if verifiedBy, ok := props["verified_by"].(string); ok {
		family.Verification.VerifiedBy = verifiedBy
	}

	// Trust Score
	if score, ok := props["trust_score"].(float64); ok {
		family.TrustScore = score
	}

	// Privacy Settings
	if visibility, ok := props["profile_visibility"].(string); ok {
		family.PrivacySettings.ProfileVisibility = visibility
	}
	if sharing, ok := props["contact_sharing"].(string); ok {
		family.PrivacySettings.ContactSharing = sharing
	}

	// Status and timestamps
	if status, ok := props["active_status"].(string); ok {
		family.ActiveStatus = status
	}
	
	if createdAt, ok := props["created_at"].(time.Time); ok {
		family.CreatedAt = createdAt
	}
	
	if updatedAt, ok := props["updated_at"].(time.Time); ok {
		family.UpdatedAt = updatedAt
	}

	return family, nil
}