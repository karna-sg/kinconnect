package repository

import (
	"context"
	"families-linkedin/internal/database"
	"families-linkedin/internal/models"
	"fmt"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type PersonRepository struct {
	driver neo4j.DriverWithContext
}

func NewPersonRepository(driver neo4j.DriverWithContext) *PersonRepository {
	return &PersonRepository{driver: driver}
}

// CreatePerson creates a new person in the database
func (r *PersonRepository) CreatePerson(ctx context.Context, person *models.Person) error {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := database.ExecuteWithTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (f:Family {family_id: $family_id})
			CREATE (p:Person {
				person_id: $person_id,
				family_id: $family_id,
				first_name: $first_name,
				last_name: $last_name,
				gender: $gender,
				age: $age,
				date_of_birth: date($date_of_birth),
				marital_status: $marital_status,
				eligible_for_marriage: $eligible_for_marriage,
				highest_degree: $highest_degree,
				institution: $institution,
				field_of_study: $field_of_study,
				graduation_year: $graduation_year,
				job_title: $job_title,
				company: $company,
				industry: $industry,
				experience_years: $experience_years,
				annual_income: $annual_income,
				height: $height,
				complexion: $complexion,
				body_type: $body_type,
				hobbies: $hobbies,
				profile_visibility: $profile_visibility,
				created_at: datetime($created_at),
				updated_at: datetime($updated_at)
			})
			CREATE (p)-[:BELONGS_TO {role: $role, primary_member: $primary_member}]->(f)
			RETURN p.person_id
		`
		
		role := "MEMBER"
		if person.Gender == "Male" && person.Age >= 21 {
			role = "SON"
		} else if person.Gender == "Female" && person.Age >= 18 {
			role = "DAUGHTER"
		}

		params := map[string]interface{}{
			"person_id":              person.ID,
			"family_id":              person.FamilyID,
			"first_name":             person.FirstName,
			"last_name":              person.LastName,
			"gender":                 person.Gender,
			"age":                    person.Age,
			"date_of_birth":          person.DateOfBirth.Format("2006-01-02"),
			"marital_status":         person.MaritalStatus,
			"eligible_for_marriage":  person.EligibleForMarriage,
			"highest_degree":         person.Education.HighestDegree,
			"institution":            person.Education.Institution,
			"field_of_study":         person.Education.FieldOfStudy,
			"graduation_year":        person.Education.GraduationYear,
			"job_title":              person.Profession.JobTitle,
			"company":                person.Profession.Company,
			"industry":               person.Profession.Industry,
			"experience_years":       person.Profession.ExperienceYears,
			"annual_income":          person.Profession.AnnualIncome,
			"height":                 person.PhysicalAttributes.Height,
			"complexion":             person.PhysicalAttributes.Complexion,
			"body_type":              person.PhysicalAttributes.BodyType,
			"hobbies":                person.Hobbies,
			"profile_visibility":     person.ProfileVisibility,
			"created_at":             person.CreatedAt.Format(time.RFC3339),
			"updated_at":             person.UpdatedAt.Format(time.RFC3339),
			"role":                   role,
			"primary_member":         person.EligibleForMarriage,
		}

		_, err := tx.Run(ctx, query, params)
		return nil, err
	})

	return err
}

// GetPersonByID retrieves a person by ID
func (r *PersonRepository) GetPersonByID(ctx context.Context, personID string) (*models.Person, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (p:Person {person_id: $person_id})
			RETURN p
		`
		
		result, err := tx.Run(ctx, query, map[string]interface{}{
			"person_id": personID,
		})
		
		if err != nil {
			return nil, err
		}

		if result.Next(ctx) {
			record := result.Record()
			return r.mapRecordToPerson(record)
		}

		return nil, nil
	})

	if err != nil {
		return nil, err
	}

	if result == nil {
		return nil, fmt.Errorf("person not found: %s", personID)
	}

	return result.(*models.Person), nil
}

// GetPersonsByFamilyID retrieves all persons in a family
func (r *PersonRepository) GetPersonsByFamilyID(ctx context.Context, familyID string) ([]*models.Person, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (p:Person {family_id: $family_id})
			RETURN p
			ORDER BY p.age DESC
		`
		
		result, err := tx.Run(ctx, query, map[string]interface{}{
			"family_id": familyID,
		})
		
		if err != nil {
			return nil, err
		}

		var persons []*models.Person
		for result.Next(ctx) {
			person, err := r.mapRecordToPerson(result.Record())
			if err != nil {
				return nil, err
			}
			persons = append(persons, person)
		}

		return persons, nil
	})

	if err != nil {
		return nil, err
	}

	return result.([]*models.Person), nil
}

// SearchEligiblePersons searches for eligible marriage candidates
func (r *PersonRepository) SearchEligiblePersons(ctx context.Context, criteria *models.PersonSearchCriteria) ([]*models.Person, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := "MATCH (p:Person) WHERE p.eligible_for_marriage = true"
		params := make(map[string]interface{})

		// Build dynamic WHERE clauses
		if criteria.Gender != "" {
			query += " AND p.gender = $gender"
			params["gender"] = criteria.Gender
		}

		if criteria.MinAge > 0 {
			query += " AND p.age >= $min_age"
			params["min_age"] = criteria.MinAge
		}

		if criteria.MaxAge > 0 {
			query += " AND p.age <= $max_age"
			params["max_age"] = criteria.MaxAge
		}

		if criteria.MaritalStatus != "" {
			query += " AND p.marital_status = $marital_status"
			params["marital_status"] = criteria.MaritalStatus
		}

		if len(criteria.Education) > 0 {
			query += " AND p.highest_degree IN $education"
			params["education"] = criteria.Education
		}

		if len(criteria.Profession) > 0 {
			query += " AND p.industry IN $profession"
			params["profession"] = criteria.Profession
		}

		if criteria.MinIncome > 0 {
			query += " AND p.annual_income >= $min_income"
			params["min_income"] = criteria.MinIncome
		}

		if criteria.MaxIncome > 0 {
			query += " AND p.annual_income <= $max_income"
			params["max_income"] = criteria.MaxIncome
		}

		// Add ordering
		query += " ORDER BY p.age ASC"

		// Add pagination
		if criteria.Limit > 0 {
			query += " SKIP $offset LIMIT $limit"
			params["offset"] = criteria.Offset
			params["limit"] = criteria.Limit
		}

		query += " RETURN p"

		result, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}

		var persons []*models.Person
		for result.Next(ctx) {
			person, err := r.mapRecordToPerson(result.Record())
			if err != nil {
				return nil, err
			}
			persons = append(persons, person)
		}

		return persons, nil
	})

	if err != nil {
		return nil, err
	}

	return result.([]*models.Person), nil
}

// UpdatePerson updates an existing person
func (r *PersonRepository) UpdatePerson(ctx context.Context, person *models.Person) error {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := database.ExecuteWithTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (p:Person {person_id: $person_id})
			SET p.first_name = $first_name,
				p.last_name = $last_name,
				p.gender = $gender,
				p.age = $age,
				p.date_of_birth = date($date_of_birth),
				p.marital_status = $marital_status,
				p.eligible_for_marriage = $eligible_for_marriage,
				p.highest_degree = $highest_degree,
				p.institution = $institution,
				p.field_of_study = $field_of_study,
				p.graduation_year = $graduation_year,
				p.job_title = $job_title,
				p.company = $company,
				p.industry = $industry,
				p.experience_years = $experience_years,
				p.annual_income = $annual_income,
				p.height = $height,
				p.complexion = $complexion,
				p.body_type = $body_type,
				p.hobbies = $hobbies,
				p.profile_visibility = $profile_visibility,
				p.updated_at = datetime($updated_at)
			RETURN p.person_id
		`
		
		person.UpdatedAt = time.Now()
		
		params := map[string]interface{}{
			"person_id":              person.ID,
			"first_name":             person.FirstName,
			"last_name":              person.LastName,
			"gender":                 person.Gender,
			"age":                    person.Age,
			"date_of_birth":          person.DateOfBirth.Format("2006-01-02"),
			"marital_status":         person.MaritalStatus,
			"eligible_for_marriage":  person.EligibleForMarriage,
			"highest_degree":         person.Education.HighestDegree,
			"institution":            person.Education.Institution,
			"field_of_study":         person.Education.FieldOfStudy,
			"graduation_year":        person.Education.GraduationYear,
			"job_title":              person.Profession.JobTitle,
			"company":                person.Profession.Company,
			"industry":               person.Profession.Industry,
			"experience_years":       person.Profession.ExperienceYears,
			"annual_income":          person.Profession.AnnualIncome,
			"height":                 person.PhysicalAttributes.Height,
			"complexion":             person.PhysicalAttributes.Complexion,
			"body_type":              person.PhysicalAttributes.BodyType,
			"hobbies":                person.Hobbies,
			"profile_visibility":     person.ProfileVisibility,
			"updated_at":             person.UpdatedAt.Format(time.RFC3339),
		}

		_, err := tx.Run(ctx, query, params)
		return nil, err
	})

	return err
}

// Helper function to map Neo4j record to Person model
func (r *PersonRepository) mapRecordToPerson(record *neo4j.Record) (*models.Person, error) {
	node, ok := record.Get("p")
	if !ok {
		return nil, fmt.Errorf("person node not found in record")
	}

	personNode := node.(neo4j.Node)
	props := personNode.Props

	person := &models.Person{}
	
	if id, ok := props["person_id"].(string); ok {
		person.ID = id
	}
	
	if familyID, ok := props["family_id"].(string); ok {
		person.FamilyID = familyID
	}
	
	if firstName, ok := props["first_name"].(string); ok {
		person.FirstName = firstName
	}
	
	if lastName, ok := props["last_name"].(string); ok {
		person.LastName = lastName
	}
	
	if gender, ok := props["gender"].(string); ok {
		person.Gender = gender
	}
	
	if age, ok := props["age"].(int64); ok {
		person.Age = int(age)
	}
	
	if dob, ok := props["date_of_birth"].(time.Time); ok {
		person.DateOfBirth = dob
	}
	
	if status, ok := props["marital_status"].(string); ok {
		person.MaritalStatus = status
	}
	
	if eligible, ok := props["eligible_for_marriage"].(bool); ok {
		person.EligibleForMarriage = eligible
	}

	// Education
	if degree, ok := props["highest_degree"].(string); ok {
		person.Education.HighestDegree = degree
	}
	if institution, ok := props["institution"].(string); ok {
		person.Education.Institution = institution
	}
	if field, ok := props["field_of_study"].(string); ok {
		person.Education.FieldOfStudy = field
	}
	if year, ok := props["graduation_year"].(int64); ok {
		person.Education.GraduationYear = int(year)
	}

	// Profession
	if title, ok := props["job_title"].(string); ok {
		person.Profession.JobTitle = title
	}
	if company, ok := props["company"].(string); ok {
		person.Profession.Company = company
	}
	if industry, ok := props["industry"].(string); ok {
		person.Profession.Industry = industry
	}
	if exp, ok := props["experience_years"].(int64); ok {
		person.Profession.ExperienceYears = int(exp)
	}
	if income, ok := props["annual_income"].(int64); ok {
		person.Profession.AnnualIncome = income
	}

	// Physical Attributes
	if height, ok := props["height"].(int64); ok {
		person.PhysicalAttributes.Height = int(height)
	}
	if complexion, ok := props["complexion"].(string); ok {
		person.PhysicalAttributes.Complexion = complexion
	}
	if bodyType, ok := props["body_type"].(string); ok {
		person.PhysicalAttributes.BodyType = bodyType
	}

	// Hobbies
	if hobbies, ok := props["hobbies"].([]interface{}); ok {
		for _, hobby := range hobbies {
			if hobbyStr, ok := hobby.(string); ok {
				person.Hobbies = append(person.Hobbies, hobbyStr)
			}
		}
	}

	// Profile visibility
	if visibility, ok := props["profile_visibility"].(string); ok {
		person.ProfileVisibility = visibility
	}

	// Timestamps
	if createdAt, ok := props["created_at"].(time.Time); ok {
		person.CreatedAt = createdAt
	}
	
	if updatedAt, ok := props["updated_at"].(time.Time); ok {
		person.UpdatedAt = updatedAt
	}

	return person, nil
}