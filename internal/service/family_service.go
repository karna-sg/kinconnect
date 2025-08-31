package service

import (
	"context"
	"families-linkedin/internal/metrics"
	"families-linkedin/internal/models"
	"families-linkedin/internal/repository"
	"fmt"
	"time"
)

type FamilyService struct {
	familyRepo     *repository.FamilyRepository
	personRepo     *repository.PersonRepository
	connectionRepo *repository.ConnectionRepository
	metrics        *metrics.Collector
}

func NewFamilyService(
	familyRepo *repository.FamilyRepository,
	personRepo *repository.PersonRepository,
	connectionRepo *repository.ConnectionRepository,
	metrics *metrics.Collector,
) *FamilyService {
	return &FamilyService{
		familyRepo:     familyRepo,
		personRepo:     personRepo,
		connectionRepo: connectionRepo,
		metrics:        metrics,
	}
}

// CreateFamily creates a new family
func (s *FamilyService) CreateFamily(ctx context.Context, family *models.Family) error {
	start := time.Now()
	defer s.metrics.RecordDuration("family_service_create_family", start)

	if err := s.validateFamily(family); err != nil {
		s.metrics.IncrementCounter("family_service_validation_errors")
		return fmt.Errorf("validation failed: %w", err)
	}

	if err := s.familyRepo.CreateFamily(ctx, family); err != nil {
		s.metrics.IncrementCounter("family_service_create_errors")
		return fmt.Errorf("failed to create family: %w", err)
	}

	s.metrics.IncrementCounter("family_service_created")
	return nil
}

// GetFamily retrieves a family by ID
func (s *FamilyService) GetFamily(ctx context.Context, familyID string) (*models.Family, error) {
	start := time.Now()
	defer s.metrics.RecordDuration("family_service_get_family", start)

	family, err := s.familyRepo.GetFamilyByID(ctx, familyID)
	if err != nil {
		s.metrics.IncrementCounter("family_service_get_errors")
		return nil, fmt.Errorf("failed to get family: %w", err)
	}

	s.metrics.IncrementCounter("family_service_get_success")
	return family, nil
}

// UpdateFamily updates an existing family
func (s *FamilyService) UpdateFamily(ctx context.Context, family *models.Family) error {
	start := time.Now()
	defer s.metrics.RecordDuration("family_service_update_family", start)

	if err := s.validateFamily(family); err != nil {
		s.metrics.IncrementCounter("family_service_validation_errors")
		return fmt.Errorf("validation failed: %w", err)
	}

	// Check if family exists
	existing, err := s.familyRepo.GetFamilyByID(ctx, family.ID)
	if err != nil {
		s.metrics.IncrementCounter("family_service_update_errors")
		return fmt.Errorf("family not found: %w", err)
	}

	// Preserve creation timestamp
	family.CreatedAt = existing.CreatedAt

	if err := s.familyRepo.UpdateFamily(ctx, family); err != nil {
		s.metrics.IncrementCounter("family_service_update_errors")
		return fmt.Errorf("failed to update family: %w", err)
	}

	s.metrics.IncrementCounter("family_service_updated")
	return nil
}

// DeleteFamily soft deletes a family
func (s *FamilyService) DeleteFamily(ctx context.Context, familyID string) error {
	start := time.Now()
	defer s.metrics.RecordDuration("family_service_delete_family", start)

	if err := s.familyRepo.DeleteFamily(ctx, familyID); err != nil {
		s.metrics.IncrementCounter("family_service_delete_errors")
		return fmt.Errorf("failed to delete family: %w", err)
	}

	s.metrics.IncrementCounter("family_service_deleted")
	return nil
}

// SearchFamilies searches for families based on criteria
func (s *FamilyService) SearchFamilies(ctx context.Context, criteria *models.FamilySearchCriteria) ([]*models.Family, error) {
	start := time.Now()
	defer s.metrics.RecordDuration("family_service_search_families", start)

	// Set default pagination if not provided
	if criteria.Limit == 0 {
		criteria.Limit = 50 // Default limit
	}
	if criteria.Limit > 200 {
		criteria.Limit = 200 // Max limit
	}

	families, err := s.familyRepo.SearchFamilies(ctx, criteria)
	if err != nil {
		s.metrics.IncrementCounter("family_service_search_errors")
		return nil, fmt.Errorf("failed to search families: %w", err)
	}

	s.metrics.IncrementCounter("family_service_search_success")
	s.metrics.RecordValue("family_service_search_results", float64(len(families)))
	return families, nil
}

// GetFamilyMembers retrieves all members of a family
func (s *FamilyService) GetFamilyMembers(ctx context.Context, familyID string) ([]*models.Person, error) {
	start := time.Now()
	defer s.metrics.RecordDuration("family_service_get_members", start)

	persons, err := s.personRepo.GetPersonsByFamilyID(ctx, familyID)
	if err != nil {
		s.metrics.IncrementCounter("family_service_get_members_errors")
		return nil, fmt.Errorf("failed to get family members: %w", err)
	}

	s.metrics.IncrementCounter("family_service_get_members_success")
	s.metrics.RecordValue("family_service_members_count", float64(len(persons)))
	return persons, nil
}

// GetEligibleMatches finds eligible marriage matches within the family network
func (s *FamilyService) GetEligibleMatches(ctx context.Context, personID string, maxDegree int) ([]*models.EligibleMatch, error) {
	start := time.Now()
	defer s.metrics.RecordDuration("family_service_get_eligible_matches", start)

	// Get the person seeking matches
	seeker, err := s.personRepo.GetPersonByID(ctx, personID)
	if err != nil {
		s.metrics.IncrementCounter("family_service_match_errors")
		return nil, fmt.Errorf("failed to get person: %w", err)
	}

	if !seeker.IsEligibleForMarriage() {
		s.metrics.IncrementCounter("family_service_match_not_eligible")
		return nil, fmt.Errorf("person is not eligible for marriage")
	}

	// Get seeker's family
	seekerFamily, err := s.familyRepo.GetFamilyByID(ctx, seeker.FamilyID)
	if err != nil {
		s.metrics.IncrementCounter("family_service_match_errors")
		return nil, fmt.Errorf("failed to get seeker's family: %w", err)
	}

	fmt.Println("seekerFamily", seekerFamily)
	// Get connected families within the specified degree
	connectedFamilyIDs, err := s.connectionRepo.GetFamilyConnections(ctx, seeker.FamilyID, maxDegree)
	if err != nil {
		s.metrics.IncrementCounter("family_service_match_errors")
		return nil, fmt.Errorf("failed to get family connections: %w", err)
	}

	var eligibleMatches []*models.EligibleMatch

	// Search for eligible persons in connected families
	for _, familyID := range connectedFamilyIDs {
		family, err := s.familyRepo.GetFamilyByID(ctx, familyID)
		if err != nil {
			continue // Skip if family not found
		}

		// Get family members
		members, err := s.personRepo.GetPersonsByFamilyID(ctx, familyID)
		if err != nil {
			continue // Skip if can't get members
		}

		for _, candidate := range members {
			// Check if candidate is eligible and compatible
			if s.isEligibleCandidate(seeker, candidate) {
				// Find connection path
				connectionPath, err := s.connectionRepo.FindShortestPath(ctx, seeker.FamilyID, candidate.FamilyID, maxDegree)
				if err != nil {
					continue // Skip if no path found
				}

				match := models.NewEligibleMatch(candidate, family, connectionPath)
				match.CalculateCompatibilityScore(seeker)

				eligibleMatches = append(eligibleMatches, match)
			}
		}
	}

	// Sort by compatibility score (highest first)
	s.sortMatchesByCompatibility(eligibleMatches)

	s.metrics.IncrementCounter("family_service_match_success")
	s.metrics.RecordValue("family_service_matches_found", float64(len(eligibleMatches)))
	return eligibleMatches, nil
}

// CalculateFamilyTrustScore calculates and updates the trust score for a family
func (s *FamilyService) CalculateFamilyTrustScore(ctx context.Context, familyID string) (float64, error) {
	start := time.Now()
	defer s.metrics.RecordDuration("family_service_calculate_trust_score", start)

	score, err := s.familyRepo.GetFamilyTrustScore(ctx, familyID)
	if err != nil {
		s.metrics.IncrementCounter("family_service_trust_score_errors")
		return 0, fmt.Errorf("failed to calculate trust score: %w", err)
	}

	// Update the family's trust score
	if err := s.familyRepo.UpdateFamilyTrustScore(ctx, familyID, score); err != nil {
		s.metrics.IncrementCounter("family_service_trust_score_update_errors")
		return score, fmt.Errorf("failed to update trust score: %w", err)
	}

	s.metrics.IncrementCounter("family_service_trust_score_success")
	s.metrics.RecordValue("family_service_trust_score_calculated", score)
	return score, nil
}

// AddFamilyMember adds a new member to a family
func (s *FamilyService) AddFamilyMember(ctx context.Context, person *models.Person) error {
	start := time.Now()
	defer s.metrics.RecordDuration("family_service_add_member", start)

	if err := s.validatePerson(person); err != nil {
		s.metrics.IncrementCounter("family_service_member_validation_errors")
		return fmt.Errorf("validation failed: %w", err)
	}

	// Verify family exists
	_, err := s.familyRepo.GetFamilyByID(ctx, person.FamilyID)
	if err != nil {
		s.metrics.IncrementCounter("family_service_add_member_errors")
		return fmt.Errorf("family not found: %w", err)
	}

	if err := s.personRepo.CreatePerson(ctx, person); err != nil {
		s.metrics.IncrementCounter("family_service_add_member_errors")
		return fmt.Errorf("failed to add family member: %w", err)
	}

	s.metrics.IncrementCounter("family_service_member_added")
	return nil
}

// CreateFamilyConnection creates a connection between two families
func (s *FamilyService) CreateFamilyConnection(ctx context.Context, connection *models.FamilyConnection) error {
	start := time.Now()
	defer s.metrics.RecordDuration("family_service_create_connection", start)

	if err := s.validateConnection(connection); err != nil {
		s.metrics.IncrementCounter("family_service_connection_validation_errors")
		return fmt.Errorf("validation failed: %w", err)
	}

	// Validate that the connection won't create cycles
	if err := s.connectionRepo.ValidateNoCircularConnections(ctx, connection.FromFamilyID, connection.ToFamilyID); err != nil {
		s.metrics.IncrementCounter("family_service_connection_cycle_errors")
		return fmt.Errorf("connection validation failed: %w", err)
	}

	if err := s.connectionRepo.CreateConnection(ctx, connection); err != nil {
		s.metrics.IncrementCounter("family_service_create_connection_errors")
		return fmt.Errorf("failed to create connection: %w", err)
	}

	// Update trust scores for both families after creating connection
	go func() {
		s.CalculateFamilyTrustScore(context.Background(), connection.FromFamilyID)
		s.CalculateFamilyTrustScore(context.Background(), connection.ToFamilyID)
	}()

	s.metrics.IncrementCounter("family_service_connection_created")
	return nil
}

// Helper methods

func (s *FamilyService) validateFamily(family *models.Family) error {
	if family.Name == "" {
		return fmt.Errorf("family name is required")
	}
	if family.PrimarySurname == "" {
		return fmt.Errorf("primary surname is required")
	}
	if family.Location.City == "" {
		return fmt.Errorf("city is required")
	}
	if family.Location.State == "" {
		return fmt.Errorf("state is required")
	}
	if family.Community.Caste == "" {
		return fmt.Errorf("caste is required")
	}
	if family.Community.Religion == "" {
		return fmt.Errorf("religion is required")
	}
	if family.TrustScore < 0 || family.TrustScore > 10 {
		return fmt.Errorf("trust score must be between 0 and 10")
	}
	return nil
}

func (s *FamilyService) validatePerson(person *models.Person) error {
	if person.FirstName == "" {
		return fmt.Errorf("first name is required")
	}
	if person.LastName == "" {
		return fmt.Errorf("last name is required")
	}
	if person.Gender != "Male" && person.Gender != "Female" {
		return fmt.Errorf("gender must be 'Male' or 'Female'")
	}
	if person.FamilyID == "" {
		return fmt.Errorf("family ID is required")
	}
	if person.Age < 0 || person.Age > 150 {
		return fmt.Errorf("age must be between 0 and 150")
	}
	return nil
}

func (s *FamilyService) validateConnection(connection *models.FamilyConnection) error {
	if connection.FromFamilyID == "" {
		return fmt.Errorf("from family ID is required")
	}
	if connection.ToFamilyID == "" {
		return fmt.Errorf("to family ID is required")
	}
	if connection.FromFamilyID == connection.ToFamilyID {
		return fmt.Errorf("cannot create connection from family to itself")
	}
	if connection.RelationType == "" {
		return fmt.Errorf("relation type is required")
	}
	if connection.Strength < 0 || connection.Strength > 1 {
		return fmt.Errorf("connection strength must be between 0 and 1")
	}
	return nil
}

func (s *FamilyService) isEligibleCandidate(seeker, candidate *models.Person) bool {
	// Basic eligibility checks
	if !candidate.IsEligibleForMarriage() {
		return false
	}

	// Gender compatibility (assuming heterosexual matches)
	if seeker.Gender == candidate.Gender {
		return false
	}

	// Same family check
	if seeker.FamilyID == candidate.FamilyID {
		return false
	}

	// Check if candidate matches seeker's preferences
	if !seeker.MatchesPreferences(candidate) {
		return false
	}

	return true
}

func (s *FamilyService) sortMatchesByCompatibility(matches []*models.EligibleMatch) {
	// Simple bubble sort by compatibility score (descending)
	for i := 0; i < len(matches)-1; i++ {
		for j := 0; j < len(matches)-i-1; j++ {
			if matches[j].CompatibilityScore < matches[j+1].CompatibilityScore {
				matches[j], matches[j+1] = matches[j+1], matches[j]
			}
		}
	}
}
