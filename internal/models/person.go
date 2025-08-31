package models

import (
	"time"

	"github.com/google/uuid"
)

// Person represents an individual family member
type Person struct {
	ID                 string             `json:"id" neo4j:"person_id"`
	FamilyID           string             `json:"family_id" neo4j:"family_id"`
	FirstName          string             `json:"first_name" neo4j:"first_name"`
	LastName           string             `json:"last_name" neo4j:"last_name"`
	Gender             string             `json:"gender" neo4j:"gender"`
	DateOfBirth        time.Time          `json:"date_of_birth" neo4j:"date_of_birth"`
	Age                int                `json:"age" neo4j:"age"`
	MaritalStatus      string             `json:"marital_status" neo4j:"marital_status"`
	EligibleForMarriage bool              `json:"eligible_for_marriage" neo4j:"eligible_for_marriage"`
	Education          Education          `json:"education"`
	Profession         Profession         `json:"profession"`
	PhysicalAttributes PhysicalAttributes `json:"physical_attributes"`
	Preferences        MarriagePreferences `json:"preferences"`
	Hobbies            []string           `json:"hobbies" neo4j:"hobbies"`
	ProfileVisibility  string             `json:"profile_visibility" neo4j:"profile_visibility"`
	CreatedAt          time.Time          `json:"created_at" neo4j:"created_at"`
	UpdatedAt          time.Time          `json:"updated_at" neo4j:"updated_at"`
}

type Education struct {
	HighestDegree    string `json:"highest_degree" neo4j:"highest_degree"`
	Institution      string `json:"institution" neo4j:"institution"`
	FieldOfStudy     string `json:"field_of_study" neo4j:"field_of_study"`
	GraduationYear   int    `json:"graduation_year" neo4j:"graduation_year"`
}

type Profession struct {
	JobTitle       string `json:"job_title" neo4j:"job_title"`
	Company        string `json:"company" neo4j:"company"`
	Industry       string `json:"industry" neo4j:"industry"`
	ExperienceYears int   `json:"experience_years" neo4j:"experience_years"`
	AnnualIncome    int64  `json:"annual_income" neo4j:"annual_income"`
}

type PhysicalAttributes struct {
	Height     int    `json:"height" neo4j:"height"` // in cm
	Complexion string `json:"complexion" neo4j:"complexion"`
	BodyType   string `json:"body_type" neo4j:"body_type"`
}

type MarriagePreferences struct {
	PreferredAgeRange      [2]int   `json:"preferred_age_range" neo4j:"preferred_age_range"`
	PreferredEducation     []string `json:"preferred_education" neo4j:"preferred_education"`
	PreferredProfession    []string `json:"preferred_profession" neo4j:"preferred_profession"`
	PreferredLocation      []string `json:"preferred_location" neo4j:"preferred_location"`
	PreferredCaste         []string `json:"preferred_caste" neo4j:"preferred_caste"`
	PreferredIncome        [2]int64 `json:"preferred_income" neo4j:"preferred_income"`
	MaxDistance            int      `json:"max_distance" neo4j:"max_distance"` // in km
	FlexibleOnRequirements bool     `json:"flexible_on_requirements" neo4j:"flexible_on_requirements"`
}

// NewPerson creates a new person with generated ID
func NewPerson(familyID, firstName, lastName, gender string, dateOfBirth time.Time) *Person {
	now := time.Now()
	age := now.Year() - dateOfBirth.Year()
	
	// Adjust age if birthday hasn't occurred this year
	if now.YearDay() < dateOfBirth.YearDay() {
		age--
	}

	return &Person{
		ID:                  "PER_" + uuid.New().String()[:8],
		FamilyID:            familyID,
		FirstName:           firstName,
		LastName:            lastName,
		Gender:              gender,
		DateOfBirth:         dateOfBirth,
		Age:                 age,
		MaritalStatus:       "SINGLE",
		EligibleForMarriage: age >= 18 && age <= 35, // Default eligibility
		ProfileVisibility:   "NETWORK_VISIBLE",
		CreatedAt:           now,
		UpdatedAt:           now,
		Preferences: MarriagePreferences{
			PreferredAgeRange:      [2]int{age - 5, age + 5},
			FlexibleOnRequirements: true,
			MaxDistance:            100, // 100km default
		},
	}
}

// UpdateAge recalculates and updates the person's age
func (p *Person) UpdateAge() {
	now := time.Now()
	age := now.Year() - p.DateOfBirth.Year()
	
	if now.YearDay() < p.DateOfBirth.YearDay() {
		age--
	}
	
	p.Age = age
	p.UpdatedAt = now
}

// IsEligibleForMarriage checks if person is eligible based on current criteria
func (p *Person) IsEligibleForMarriage() bool {
	return p.EligibleForMarriage && 
		   p.MaritalStatus == "SINGLE" && 
		   p.Age >= 18 && 
		   p.Age <= 50
}

// GetFullName returns the person's full name
func (p *Person) GetFullName() string {
	return p.FirstName + " " + p.LastName
}

// MatchesPreferences checks if another person matches this person's preferences
func (p *Person) MatchesPreferences(other *Person) bool {
	// Age preference check
	if other.Age < p.Preferences.PreferredAgeRange[0] || other.Age > p.Preferences.PreferredAgeRange[1] {
		if !p.Preferences.FlexibleOnRequirements {
			return false
		}
	}

	// Education preference check
	if len(p.Preferences.PreferredEducation) > 0 {
		found := false
		for _, edu := range p.Preferences.PreferredEducation {
			if edu == other.Education.HighestDegree {
				found = true
				break
			}
		}
		if !found && !p.Preferences.FlexibleOnRequirements {
			return false
		}
	}

	// Profession preference check
	if len(p.Preferences.PreferredProfession) > 0 {
		found := false
		for _, prof := range p.Preferences.PreferredProfession {
			if prof == other.Profession.Industry {
				found = true
				break
			}
		}
		if !found && !p.Preferences.FlexibleOnRequirements {
			return false
		}
	}

	// Income preference check
	if p.Preferences.PreferredIncome[0] > 0 {
		if other.Profession.AnnualIncome < p.Preferences.PreferredIncome[0] || 
		   other.Profession.AnnualIncome > p.Preferences.PreferredIncome[1] {
			if !p.Preferences.FlexibleOnRequirements {
				return false
			}
		}
	}

	return true
}

// PersonSearchCriteria defines search parameters for persons
type PersonSearchCriteria struct {
	Gender              string   `json:"gender,omitempty"`
	MinAge              int      `json:"min_age,omitempty"`
	MaxAge              int      `json:"max_age,omitempty"`
	MaritalStatus       string   `json:"marital_status,omitempty"`
	EligibleForMarriage bool     `json:"eligible_for_marriage,omitempty"`
	Education           []string `json:"education,omitempty"`
	Profession          []string `json:"profession,omitempty"`
	MinIncome           int64    `json:"min_income,omitempty"`
	MaxIncome           int64    `json:"max_income,omitempty"`
	Location            []string `json:"location,omitempty"`
	Caste               []string `json:"caste,omitempty"`
	Religion            string   `json:"religion,omitempty"`
	Limit               int      `json:"limit,omitempty"`
	Offset              int      `json:"offset,omitempty"`
}

// EligibleMatch represents a potential marriage match with compatibility score
type EligibleMatch struct {
	Person            *Person `json:"person"`
	Family            *Family `json:"family"`
	CompatibilityScore float64 `json:"compatibility_score"`
	ConnectionPath    *ConnectionPath `json:"connection_path"`
	MatchReasons      []string `json:"match_reasons"`
	CreatedAt         time.Time `json:"created_at"`
}

// NewEligibleMatch creates a new eligible match
func NewEligibleMatch(person *Person, family *Family, path *ConnectionPath) *EligibleMatch {
	return &EligibleMatch{
		Person:         person,
		Family:         family,
		ConnectionPath: path,
		MatchReasons:   make([]string, 0),
		CreatedAt:      time.Now(),
	}
}

// CalculateCompatibilityScore calculates compatibility based on various factors
func (em *EligibleMatch) CalculateCompatibilityScore(seeker *Person) {
	score := 0.0
	maxScore := 0.0

	// Age compatibility (weight: 20%)
	maxScore += 20
	ageWeight := 20.0
	ageDiff := abs(em.Person.Age - seeker.Age)
	if ageDiff <= 2 {
		score += ageWeight
		em.MatchReasons = append(em.MatchReasons, "Similar age")
	} else if ageDiff <= 5 {
		score += ageWeight * 0.7
		em.MatchReasons = append(em.MatchReasons, "Compatible age range")
	} else if ageDiff <= 10 {
		score += ageWeight * 0.3
	}

	// Education compatibility (weight: 25%)
	maxScore += 25
	eduWeight := 25.0
	if em.Person.Education.HighestDegree == seeker.Education.HighestDegree {
		score += eduWeight
		em.MatchReasons = append(em.MatchReasons, "Same education level")
	} else if isCompatibleEducation(em.Person.Education.HighestDegree, seeker.Education.HighestDegree) {
		score += eduWeight * 0.8
		em.MatchReasons = append(em.MatchReasons, "Compatible education")
	}

	// Profession compatibility (weight: 20%)
	maxScore += 20
	profWeight := 20.0
	if em.Person.Profession.Industry == seeker.Profession.Industry {
		score += profWeight
		em.MatchReasons = append(em.MatchReasons, "Same profession field")
	} else if isCompatibleProfession(em.Person.Profession.Industry, seeker.Profession.Industry) {
		score += profWeight * 0.6
		em.MatchReasons = append(em.MatchReasons, "Compatible profession")
	}

	// Family trust score (weight: 15%)
	maxScore += 15
	trustWeight := 15.0
	trustScore := (em.Family.TrustScore / 10.0) * trustWeight
	score += trustScore
	if em.Family.TrustScore >= 8.0 {
		em.MatchReasons = append(em.MatchReasons, "High family trust score")
	}

	// Connection path strength (weight: 20%)
	maxScore += 20
	pathWeight := 20.0
	if em.ConnectionPath != nil {
		pathScore := em.ConnectionPath.PathStrength * pathWeight
		score += pathScore
		if em.ConnectionPath.Degree <= 2 {
			em.MatchReasons = append(em.MatchReasons, "Close family connection")
		} else {
			em.MatchReasons = append(em.MatchReasons, "Family connection exists")
		}
	}

	// Convert to percentage
	em.CompatibilityScore = (score / maxScore) * 100
}

// Helper functions
func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func isCompatibleEducation(edu1, edu2 string) bool {
	educationLevels := map[string]int{
		"High School": 1,
		"Diploma":     2,
		"Graduate":    3,
		"Post-Graduate": 4,
		"Doctorate":   5,
	}

	level1, exists1 := educationLevels[edu1]
	level2, exists2 := educationLevels[edu2]

	if !exists1 || !exists2 {
		return false
	}

	// Compatible if levels are within 1 level difference
	return abs(level1-level2) <= 1
}

func isCompatibleProfession(prof1, prof2 string) bool {
	// Define profession compatibility groups
	compatibleGroups := map[string][]string{
		"Technology":      {"Technology", "Engineering", "Finance"},
		"Engineering":     {"Engineering", "Technology", "Manufacturing"},
		"Finance":         {"Finance", "Banking", "Technology"},
		"Medicine":        {"Medicine", "Healthcare", "Research"},
		"Education":       {"Education", "Research", "Government"},
		"Business":        {"Business", "Finance", "Marketing"},
	}

	if group, exists := compatibleGroups[prof1]; exists {
		for _, compatibleProf := range group {
			if compatibleProf == prof2 {
				return true
			}
		}
	}

	return false
}