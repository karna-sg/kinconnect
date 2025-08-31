package models

import (
	"time"

	"github.com/google/uuid"
)

// Family represents a family node in the graph
type Family struct {
	ID           string    `json:"id" neo4j:"family_id"`
	Name         string    `json:"name" neo4j:"family_name"`
	PrimarySurname string  `json:"primary_surname" neo4j:"primary_surname"`
	Location     Location  `json:"location"`
	Community    Community `json:"community"`
	ContactInfo  ContactInfo `json:"contact_info"`
	Verification Verification `json:"verification"`
	TrustScore   float64   `json:"trust_score" neo4j:"trust_score"`
	PrivacySettings PrivacySettings `json:"privacy_settings"`
	CreatedAt    time.Time `json:"created_at" neo4j:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" neo4j:"updated_at"`
	ActiveStatus string    `json:"active_status" neo4j:"active_status"`
}

type Location struct {
	City        string    `json:"city" neo4j:"city"`
	State       string    `json:"state" neo4j:"state"`
	Country     string    `json:"country" neo4j:"country"`
	Coordinates []float64 `json:"coordinates" neo4j:"coordinates"`
	Region      string    `json:"region" neo4j:"region"`
}

type Community struct {
	Caste      string   `json:"caste" neo4j:"caste"`
	SubCaste   string   `json:"sub_caste" neo4j:"sub_caste"`
	Religion   string   `json:"religion" neo4j:"religion"`
	Languages  []string `json:"languages" neo4j:"languages"`
	CommunityGroup int  `json:"community_group" neo4j:"community_group"`
}

type ContactInfo struct {
	PrimaryPhone string `json:"primary_phone" neo4j:"primary_phone"`
	Email        string `json:"email" neo4j:"email"`
	Address      string `json:"address" neo4j:"address"`
}

type Verification struct {
	Status       string    `json:"status" neo4j:"verification_status"`
	VerifiedBy   string    `json:"verified_by" neo4j:"verified_by"`
	VerificationDate time.Time `json:"verification_date" neo4j:"verification_date"`
}

type PrivacySettings struct {
	ProfileVisibility string `json:"profile_visibility" neo4j:"profile_visibility"`
	ContactSharing    string `json:"contact_sharing" neo4j:"contact_sharing"`
}

// NewFamily creates a new family with generated ID
func NewFamily(name, surname string) *Family {
	now := time.Now()
	return &Family{
		ID:           "FAM_" + uuid.New().String()[:8],
		Name:         name,
		PrimarySurname: surname,
		TrustScore:   5.0, // Default trust score
		ActiveStatus: "ACTIVE",
		CreatedAt:    now,
		UpdatedAt:    now,
		Verification: Verification{
			Status: "UNVERIFIED",
		},
		PrivacySettings: PrivacySettings{
			ProfileVisibility: "NETWORK_ONLY",
			ContactSharing:    "MUTUAL_CONNECTIONS",
		},
	}
}

// UpdateTrustScore updates the family's trust score
func (f *Family) UpdateTrustScore(score float64) {
	if score >= 0 && score <= 10 {
		f.TrustScore = score
		f.UpdatedAt = time.Now()
	}
}

// IsVerified returns true if family is verified
func (f *Family) IsVerified() bool {
	return f.Verification.Status == "VERIFIED"
}

// FamilySearchCriteria defines search parameters for families
type FamilySearchCriteria struct {
	City         string   `json:"city,omitempty"`
	State        string   `json:"state,omitempty"`
	Caste        string   `json:"caste,omitempty"`
	Religion     string   `json:"religion,omitempty"`
	MinTrustScore float64 `json:"min_trust_score,omitempty"`
	VerifiedOnly bool     `json:"verified_only,omitempty"`
	Languages    []string `json:"languages,omitempty"`
	Limit        int      `json:"limit,omitempty"`
	Offset       int      `json:"offset,omitempty"`
}

// FamilyConnection represents a connection between families with metadata
type FamilyConnection struct {
	FromFamilyID    string            `json:"from_family_id"`
	ToFamilyID      string            `json:"to_family_id"`
	RelationType    string            `json:"relation_type"`
	SpecificRelation string           `json:"specific_relation"`
	Strength        float64           `json:"strength"`
	Verified        bool              `json:"verified"`
	EstablishedDate time.Time         `json:"established_date"`
	Metadata        map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt       time.Time         `json:"created_at"`
}

// NewFamilyConnection creates a new family connection
func NewFamilyConnection(fromID, toID, relationType, specificRelation string, strength float64, verified bool) *FamilyConnection {
	now := time.Now()
	return &FamilyConnection{
		FromFamilyID:     fromID,
		ToFamilyID:       toID,
		RelationType:     relationType,
		SpecificRelation: specificRelation,
		Strength:         strength,
		Verified:         verified,
		EstablishedDate:  now,
		CreatedAt:        now,
		Metadata:         make(map[string]interface{}),
	}
}

// IsStrong returns true if connection strength is above threshold
func (fc *FamilyConnection) IsStrong() bool {
	return fc.Strength >= 0.7
}

// ConnectionPath represents a path between two families through intermediary connections
type ConnectionPath struct {
	SourceFamilyID string    `json:"source_family_id"`
	TargetFamilyID string    `json:"target_family_id"`
	Path           []string  `json:"path"` // Family IDs in order
	Degree         int       `json:"degree"`
	PathStrength   float64   `json:"path_strength"`
	RelationTypes  []string  `json:"relation_types"`
	Verified       bool      `json:"verified"` // True if all connections in path are verified
	CalculatedAt   time.Time `json:"calculated_at"`
}

// NewConnectionPath creates a new connection path
func NewConnectionPath(sourceID, targetID string, path []string, relationTypes []string) *ConnectionPath {
	return &ConnectionPath{
		SourceFamilyID: sourceID,
		TargetFamilyID: targetID,
		Path:           path,
		Degree:         len(path) - 1,
		RelationTypes:  relationTypes,
		CalculatedAt:   time.Now(),
	}
}

// CalculatePathStrength calculates the overall strength of the path
func (cp *ConnectionPath) CalculatePathStrength(connections []FamilyConnection) {
	if len(connections) == 0 {
		cp.PathStrength = 0
		return
	}

	strength := 1.0
	allVerified := true

	for _, conn := range connections {
		strength *= conn.Strength
		if !conn.Verified {
			allVerified = false
		}
	}

	cp.PathStrength = strength
	cp.Verified = allVerified
}

// IsValidPath checks if the path has no cycles and meets basic criteria
func (cp *ConnectionPath) IsValidPath() bool {
	if len(cp.Path) < 2 {
		return false
	}

	// Check for cycles (no family should appear twice)
	seen := make(map[string]bool)
	for _, familyID := range cp.Path {
		if seen[familyID] {
			return false // Cycle detected
		}
		seen[familyID] = true
	}

	return true
}