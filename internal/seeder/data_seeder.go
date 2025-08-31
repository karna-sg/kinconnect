package seeder

import (
	"context"
	"families-linkedin/internal/database"
	"families-linkedin/internal/models"
	"fmt"
	"math/rand"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// DataSeeder generates and seeds test data for the family matrimony platform
type DataSeeder struct {
	driver neo4j.DriverWithContext
	config SeederConfig
}

// SeederConfig holds configuration for data seeding
type SeederConfig struct {
	FamilyCount             int
	AvgPersonsPerFamily     int
	ConnectionProbability   float64
	MaxConnectionsPerFamily int
	BatchSize               int
	EnableProgressLogging   bool
}

// DefaultSeederConfig returns a default configuration
func DefaultSeederConfig() SeederConfig {
	return SeederConfig{
		FamilyCount:             1000,
		AvgPersonsPerFamily:     4,
		ConnectionProbability:   0.003, // 0.3% chance of connection
		MaxConnectionsPerFamily: 15,
		BatchSize:               100,
		EnableProgressLogging:   true,
	}
}

// NewDataSeeder creates a new data seeder
func NewDataSeeder(driver neo4j.DriverWithContext, config SeederConfig) *DataSeeder {
	return &DataSeeder{
		driver: driver,
		config: config,
	}
}

// SeedData seeds the database with test families and connections
func (s *DataSeeder) SeedData(ctx context.Context) error {
	start := time.Now()

	if s.config.EnableProgressLogging {
		fmt.Printf("Starting data seeding with %d families...\n", s.config.FamilyCount)
	}

	// Step 1: Create families and persons
	families, persons, err := s.generateFamiliesAndPersons()
	if err != nil {
		return fmt.Errorf("failed to generate families and persons: %w", err)
	}

	if s.config.EnableProgressLogging {
		fmt.Printf("Generated %d families with %d persons\n", len(families), len(persons))
	}

	// Step 2: Insert families in batches
	if err := s.insertFamiliesBatch(ctx, families); err != nil {
		return fmt.Errorf("failed to insert families: %w", err)
	}

	// Step 3: Insert persons in batches
	if err := s.insertPersonsBatch(ctx, persons); err != nil {
		return fmt.Errorf("failed to insert persons: %w", err)
	}

	// Step 4: Generate and insert connections
	connections := s.generateConnections(families)
	if err := s.insertConnectionsBatch(ctx, connections); err != nil {
		return fmt.Errorf("failed to insert connections: %w", err)
	}

	duration := time.Since(start)
	if s.config.EnableProgressLogging {
		fmt.Printf("Data seeding completed in %v\n", duration)
		fmt.Printf("Created %d families, %d persons, %d connections\n",
			len(families), len(persons), len(connections))
	}

	return nil
}

// generateFamiliesAndPersons generates test families with their members
func (s *DataSeeder) generateFamiliesAndPersons() ([]*models.Family, []*models.Person, error) {
	families := make([]*models.Family, 0, s.config.FamilyCount)
	persons := make([]*models.Person, 0, s.config.FamilyCount*s.config.AvgPersonsPerFamily)

	// Indian surnames and their typical regions/castes
	surnames := []SurnameData{
		{"Sharma", "North", "Brahmin"}, {"Gupta", "North", "Vaishya"}, {"Singh", "North", "Kshatriya"},
		{"Kumar", "North", "General"}, {"Verma", "North", "Kayastha"}, {"Agarwal", "North", "Vaishya"},
		{"Patel", "West", "Patidar"}, {"Shah", "West", "Vaishya"}, {"Modi", "West", "Vaishya"},
		{"Reddy", "South", "Reddy"}, {"Nair", "South", "Nair"}, {"Iyer", "South", "Brahmin"},
		{"Das", "East", "Kayastha"}, {"Banerjee", "East", "Brahmin"}, {"Ghosh", "East", "Kayastha"},
	}

	// Indian cities with regions
	cities := []CityData{
		{"Mumbai", "Maharashtra", "West"}, {"Delhi", "Delhi", "North"}, {"Bangalore", "Karnataka", "South"},
		{"Chennai", "Tamil Nadu", "South"}, {"Kolkata", "West Bengal", "East"}, {"Hyderabad", "Telangana", "South"},
		{"Pune", "Maharashtra", "West"}, {"Ahmedabad", "Gujarat", "West"}, {"Jaipur", "Rajasthan", "North"},
		{"Lucknow", "Uttar Pradesh", "North"}, {"Kochi", "Kerala", "South"}, {"Indore", "Madhya Pradesh", "Central"},
	}

	firstNames := map[string][]string{
		"Male":   {"Rahul", "Arjun", "Vikram", "Suresh", "Amit", "Rajesh", "Sandeep", "Pradeep", "Manoj", "Ravi"},
		"Female": {"Priya", "Anjali", "Sunita", "Meera", "Kavya", "Pooja", "Neha", "Shruti", "Deepika", "Anita"},
	}

	for i := 0; i < s.config.FamilyCount; i++ {
		// Select random surname and city
		surnameData := surnames[rand.Intn(len(surnames))]
		cityData := cities[rand.Intn(len(cities))]

		// Create family
		family := s.createFamily(fmt.Sprintf("FAM_%06d", i+1), surnameData, cityData)
		families = append(families, family)

		// Create family members
		numPersons := s.generateFamilySize()
		familyPersons := s.createFamilyMembers(family.ID, surnameData.Surname, numPersons, firstNames)
		persons = append(persons, familyPersons...)
	}

	return families, persons, nil
}

// createFamily creates a single family with realistic Indian data
func (s *DataSeeder) createFamily(familyID string, surname SurnameData, city CityData) *models.Family {
	family := &models.Family{
		ID:             familyID,
		Name:           surname.Surname + " Family",
		PrimarySurname: surname.Surname,
		Location: models.Location{
			City:    city.Name,
			State:   city.State,
			Country: "India",
			Region:  city.Region,
		},
		Community: models.Community{
			Caste:     surname.Caste,
			SubCaste:  s.generateSubCaste(surname.Caste),
			Religion:  "Hindu",
			Languages: s.generateLanguages(city.Region),
		},
		ContactInfo: models.ContactInfo{
			PrimaryPhone: s.generatePhone(),
			Email:        fmt.Sprintf("%s.family@example.com", surname.Surname),
			Address:      fmt.Sprintf("%s, %s", city.Name, city.State),
		},
		Verification: models.Verification{
			Status:     s.generateVerificationStatus(),
			VerifiedBy: "community",
		},
		TrustScore:   s.generateTrustScore(),
		ActiveStatus: "ACTIVE",
		PrivacySettings: models.PrivacySettings{
			ProfileVisibility: "NETWORK_ONLY",
			ContactSharing:    "MUTUAL_CONNECTIONS",
		},
		CreatedAt: s.generateCreatedDate(),
		UpdatedAt: time.Now(),
	}

	family.Verification.VerificationDate = family.CreatedAt

	return family
}

// createFamilyMembers creates persons for a family
func (s *DataSeeder) createFamilyMembers(familyID, surname string, count int, firstNames map[string][]string) []*models.Person {
	persons := make([]*models.Person, 0, count)

	for i := 0; i < count; i++ {
		gender := "Male"
		if rand.Float64() < 0.5 {
			gender = "Female"
		}

		age := s.generateAge()
		dob := time.Now().AddDate(-age, 0, -rand.Intn(365))

		firstName := firstNames[gender][rand.Intn(len(firstNames[gender]))]

		person := &models.Person{
			ID:                  fmt.Sprintf("PER_%s_%02d", familyID[4:], i+1),
			FamilyID:            familyID,
			FirstName:           firstName,
			LastName:            surname,
			Gender:              gender,
			Age:                 age,
			DateOfBirth:         dob,
			MaritalStatus:       s.generateMaritalStatus(age),
			EligibleForMarriage: s.isEligibleForMarriage(age, gender),
			Education:           s.generateEducation(age),
			Profession:          s.generateProfession(age),
			PhysicalAttributes:  s.generatePhysicalAttributes(gender),
			Preferences:         s.generatePreferences(age, gender),
			Hobbies:             s.generateHobbies(),
			ProfileVisibility:   "NETWORK_VISIBLE",
			CreatedAt:           time.Now().AddDate(0, -rand.Intn(12), -rand.Intn(30)),
			UpdatedAt:           time.Now(),
		}

		persons = append(persons, person)
	}

	return persons
}

// generateConnections creates realistic connections between families
func (s *DataSeeder) generateConnections(families []*models.Family) []*models.FamilyConnection {
	var connections []*models.FamilyConnection

	// Create family clusters based on region and caste for more realistic connections
	familyClusters := s.createFamilyClusters(families)

	for _, cluster := range familyClusters {
		clusterConnections := s.generateClusterConnections(cluster)
		connections = append(connections, clusterConnections...)
	}

	// Add some random connections across clusters
	randomConnections := s.generateRandomConnections(families, len(connections))
	connections = append(connections, randomConnections...)

	return connections
}

// Helper methods for data generation

func (s *DataSeeder) generateFamilySize() int {
	// Generate family size with normal distribution around average
	size := int(rand.NormFloat64()*1.5 + float64(s.config.AvgPersonsPerFamily))
	if size < 2 {
		size = 2
	}
	if size > 8 {
		size = 8
	}
	return size
}

func (s *DataSeeder) generateAge() int {
	// Weighted age distribution favoring marriage-eligible ages
	weights := []int{1, 1, 1, 2, 3, 5, 8, 10, 12, 10, 8, 5, 3, 2, 1}
	ages := []int{5, 10, 15, 20, 22, 24, 26, 28, 30, 32, 35, 40, 45, 50, 60}

	totalWeight := 0
	for _, w := range weights {
		totalWeight += w
	}

	r := rand.Intn(totalWeight)
	sum := 0
	for i, w := range weights {
		sum += w
		if r < sum {
			return ages[i] + rand.Intn(2) // Add some randomness
		}
	}

	return 25 // fallback
}

func (s *DataSeeder) generateSubCaste(caste string) string {
	subCastes := map[string][]string{
		"Brahmin":   {"Kashmiri Pandit", "Tamil Brahmin", "Bengali Brahmin", "Punjabi Brahmin"},
		"Kshatriya": {"Rajput", "Thakur", "Rana", "Chauhan"},
		"Vaishya":   {"Marwari", "Gujarati", "Punjabi Baniya", "Chettiar"},
		"General":   {"Other", "Mixed", "General Category"},
	}

	if subs, exists := subCastes[caste]; exists {
		return subs[rand.Intn(len(subs))]
	}
	return "Other"
}

func (s *DataSeeder) generateLanguages(region string) []string {
	languages := map[string][]string{
		"North": {"Hindi", "Punjabi", "Urdu"},
		"South": {"Tamil", "Telugu", "Kannada", "Malayalam"},
		"West":  {"Gujarati", "Marathi", "Hindi"},
		"East":  {"Bengali", "Hindi", "Odia"},
	}

	if langs, exists := languages[region]; exists {
		return []string{"English", langs[rand.Intn(len(langs))]}
	}
	return []string{"English", "Hindi"}
}

func (s *DataSeeder) generatePhone() string {
	return fmt.Sprintf("+91-%d%d%d%d-%d%d%d%d%d%d",
		rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10),
		rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10))
}

func (s *DataSeeder) generateVerificationStatus() string {
	statuses := []string{"VERIFIED", "PENDING", "UNVERIFIED"}
	weights := []int{70, 20, 10} // 70% verified

	r := rand.Intn(100)
	sum := 0
	for i, w := range weights {
		sum += w
		if r < sum {
			return statuses[i]
		}
	}

	return "UNVERIFIED"
}

func (s *DataSeeder) generateTrustScore() float64 {
	// Generate trust score with normal distribution around 7.0
	score := rand.NormFloat64()*1.5 + 7.0
	if score < 3.0 {
		score = 3.0
	}
	if score > 9.5 {
		score = 9.5
	}
	return float64(int(score*10)) / 10 // Round to 1 decimal
}

func (s *DataSeeder) generateCreatedDate() time.Time {
	days := rand.Intn(365 * 2) // Random date within last 2 years
	return time.Now().AddDate(0, 0, -days)
}

func (s *DataSeeder) generateMaritalStatus(age int) string {
	if age < 18 {
		return "SINGLE"
	}
	if age < 25 {
		if rand.Float64() < 0.1 {
			return "MARRIED"
		}
		return "SINGLE"
	}
	if age < 35 {
		if rand.Float64() < 0.4 {
			return "MARRIED"
		}
		return "SINGLE"
	}
	// Age 35+
	if rand.Float64() < 0.7 {
		return "MARRIED"
	}
	return "SINGLE"
}

func (s *DataSeeder) isEligibleForMarriage(age int, gender string) bool {
	if gender == "Male" {
		return age >= 21 && age <= 35
	}
	return age >= 18 && age <= 32
}

func (s *DataSeeder) generateEducation(age int) models.Education {
	degrees := []string{"High School", "Diploma", "Graduate", "Post-Graduate", "Doctorate"}
	institutions := []string{"Mumbai University", "Delhi University", "IIT", "NIT", "Local College"}
	fields := []string{"Engineering", "Medicine", "Commerce", "Arts", "Science", "Management"}

	degreeIndex := 0
	if age >= 22 {
		degreeIndex = 2 // Graduate
	}
	if age >= 24 && rand.Float64() < 0.6 {
		degreeIndex = 3 // Post-Graduate
	}
	if age >= 28 && rand.Float64() < 0.1 {
		degreeIndex = 4 // Doctorate
	}

	return models.Education{
		HighestDegree:  degrees[degreeIndex],
		Institution:    institutions[rand.Intn(len(institutions))],
		FieldOfStudy:   fields[rand.Intn(len(fields))],
		GraduationYear: time.Now().Year() - (age - 22),
	}
}

func (s *DataSeeder) generateProfession(age int) models.Profession {
	industries := []string{"Technology", "Finance", "Healthcare", "Education", "Government", "Business"}
	companies := []string{"TCS", "Infosys", "HDFC", "Reliance", "Government", "Private Ltd"}
	jobTitles := []string{"Software Engineer", "Manager", "Consultant", "Executive", "Analyst", "Director"}

	if age < 22 {
		return models.Profession{
			JobTitle:        "Student",
			Company:         "College",
			Industry:        "Education",
			ExperienceYears: 0,
			AnnualIncome:    0,
		}
	}

	experience := age - 22
	if experience > 20 {
		experience = 20
	}

	income := int64((experience + 2) * 300000) // Base 3L, increases with experience
	if rand.Float64() < 0.2 {                  // 20% chance of higher income
		income *= 2
	}

	return models.Profession{
		JobTitle:        jobTitles[rand.Intn(len(jobTitles))],
		Company:         companies[rand.Intn(len(companies))],
		Industry:        industries[rand.Intn(len(industries))],
		ExperienceYears: experience,
		AnnualIncome:    income,
	}
}

func (s *DataSeeder) generatePhysicalAttributes(gender string) models.PhysicalAttributes {
	complexions := []string{"Fair", "Medium", "Dark"}
	bodyTypes := []string{"Slim", "Average", "Athletic", "Heavy"}

	height := 165 // default
	if gender == "Male" {
		height = 170 + rand.Intn(20) // 170-190 cm
	} else {
		height = 155 + rand.Intn(20) // 155-175 cm
	}

	return models.PhysicalAttributes{
		Height:     height,
		Complexion: complexions[rand.Intn(len(complexions))],
		BodyType:   bodyTypes[rand.Intn(len(bodyTypes))],
	}
}

func (s *DataSeeder) generatePreferences(age int, gender string) models.MarriagePreferences {
	minAge := age - 5
	maxAge := age + 5

	if gender == "Male" {
		minAge = age - 3
		maxAge = age + 2
	} else {
		minAge = age - 2
		maxAge = age + 8
	}

	if minAge < 18 {
		minAge = 18
	}

	return models.MarriagePreferences{
		PreferredAgeRange:      [2]int{minAge, maxAge},
		PreferredEducation:     []string{"Graduate", "Post-Graduate"},
		PreferredProfession:    []string{"Technology", "Finance", "Healthcare"},
		PreferredLocation:      []string{"Mumbai", "Delhi", "Bangalore"},
		MaxDistance:            100,
		FlexibleOnRequirements: rand.Float64() < 0.7,
	}
}

func (s *DataSeeder) generateHobbies() []string {
	hobbies := []string{"Reading", "Music", "Cricket", "Movies", "Cooking", "Travel", "Yoga", "Dancing"}
	count := 2 + rand.Intn(3) // 2-4 hobbies

	selected := make([]string, 0, count)
	for i := 0; i < count; i++ {
		hobby := hobbies[rand.Intn(len(hobbies))]
		// Avoid duplicates
		found := false
		for _, h := range selected {
			if h == hobby {
				found = true
				break
			}
		}
		if !found {
			selected = append(selected, hobby)
		}
	}

	return selected
}

// Supporting types
type SurnameData struct {
	Surname string
	Region  string
	Caste   string
}

type CityData struct {
	Name   string
	State  string
	Region string
}

type FamilyCluster struct {
	Families []*models.Family
	Region   string
	Caste    string
}

// Database insertion methods

func (s *DataSeeder) insertFamiliesBatch(ctx context.Context, families []*models.Family) error {
	batchWriter := database.NewBatchWriter(s.driver, s.config.BatchSize, "neo4j")

	familyMaps := make([]map[string]interface{}, len(families))
	for i, family := range families {
		familyMaps[i] = s.familyToMap(family)
	}

	return batchWriter.WriteFamiliesBatch(ctx, familyMaps)
}

func (s *DataSeeder) insertPersonsBatch(ctx context.Context, persons []*models.Person) error {
	batchWriter := database.NewBatchWriter(s.driver, s.config.BatchSize, "neo4j")

	personMaps := make([]map[string]interface{}, len(persons))
	for i, person := range persons {
		personMaps[i] = s.personToMap(person)
	}

	return batchWriter.WritePersonsBatch(ctx, personMaps)
}

func (s *DataSeeder) insertConnectionsBatch(ctx context.Context, connections []*models.FamilyConnection) error {
	batchWriter := database.NewBatchWriter(s.driver, s.config.BatchSize, "neo4j")

	connectionMaps := make([]map[string]interface{}, len(connections))
	for i, connection := range connections {
		connectionMaps[i] = s.connectionToMap(connection)
	}

	return batchWriter.WriteRelationshipsBatch(ctx, connectionMaps)
}

// Helper methods for family clustering and connection generation

func (s *DataSeeder) createFamilyClusters(families []*models.Family) []FamilyCluster {
	clusterMap := make(map[string]*FamilyCluster)

	for _, family := range families {
		key := family.Location.Region + "_" + family.Community.Caste

		if cluster, exists := clusterMap[key]; exists {
			cluster.Families = append(cluster.Families, family)
		} else {
			clusterMap[key] = &FamilyCluster{
				Families: []*models.Family{family},
				Region:   family.Location.Region,
				Caste:    family.Community.Caste,
			}
		}
	}

	clusters := make([]FamilyCluster, 0, len(clusterMap))
	for _, cluster := range clusterMap {
		clusters = append(clusters, *cluster)
	}

	return clusters
}

func (s *DataSeeder) generateClusterConnections(cluster FamilyCluster) []*models.FamilyConnection {
	var connections []*models.FamilyConnection

	// Higher connection probability within clusters
	clusterProbability := s.config.ConnectionProbability * 10

	for i, family1 := range cluster.Families {
		connectionsCount := 0

		for j, family2 := range cluster.Families {
			if i >= j || connectionsCount >= s.config.MaxConnectionsPerFamily {
				continue
			}

			if rand.Float64() < clusterProbability {
				connection := s.createConnection(family1, family2, true)
				connections = append(connections, connection)
				connectionsCount++
			}
		}
	}

	return connections
}

func (s *DataSeeder) generateRandomConnections(families []*models.Family, existingCount int) []*models.FamilyConnection {
	var connections []*models.FamilyConnection
	targetCount := int(float64(len(families)) * s.config.ConnectionProbability * 2)

	for len(connections) < targetCount-existingCount && len(connections) < 1000 {
		i := rand.Intn(len(families))
		j := rand.Intn(len(families))

		if i != j {
			connection := s.createConnection(families[i], families[j], false)
			connections = append(connections, connection)
		}
	}

	return connections
}

func (s *DataSeeder) createConnection(family1, family2 *models.Family, sameCluster bool) *models.FamilyConnection {
	relationTypes := []string{"FAMILY_RELATION", "COMMUNITY_RELATION", "SOCIAL_RELATION"}
	specificRelations := []string{"RELATIVE", "FAMILY_FRIEND", "COMMUNITY_MEMBER", "NEIGHBOR"}

	relationType := relationTypes[rand.Intn(len(relationTypes))]
	specificRelation := specificRelations[rand.Intn(len(specificRelations))]

	strength := 0.3 + rand.Float64()*0.6 // 0.3 to 0.9
	if sameCluster {
		strength += 0.1 // Higher strength for same cluster
	}
	if strength > 1.0 {
		strength = 1.0
	}

	verified := rand.Float64() < 0.8 // 80% verified

	return models.NewFamilyConnection(
		family1.ID,
		family2.ID,
		relationType,
		specificRelation,
		strength,
		verified,
	)
}

// Conversion methods

func (s *DataSeeder) familyToMap(family *models.Family) map[string]interface{} {
	return map[string]interface{}{
		"family_id":           family.ID,
		"family_name":         family.Name,
		"primary_surname":     family.PrimarySurname,
		"city":                family.Location.City,
		"state":               family.Location.State,
		"country":             family.Location.Country,
		"region":              family.Location.Region,
		"caste":               family.Community.Caste,
		"sub_caste":           family.Community.SubCaste,
		"religion":            family.Community.Religion,
		"languages":           family.Community.Languages,
		"trust_score":         family.TrustScore,
		"verification_status": family.Verification.Status,
		"profile_visibility":  family.PrivacySettings.ProfileVisibility,
		"contact_sharing":     family.PrivacySettings.ContactSharing,
		"created_at":          family.CreatedAt.Format(time.RFC3339),
		"updated_at":          family.UpdatedAt.Format(time.RFC3339),
		"active_status":       family.ActiveStatus,
	}
}

func (s *DataSeeder) personToMap(person *models.Person) map[string]interface{} {
	return map[string]interface{}{
		"person_id":             person.ID,
		"family_id":             person.FamilyID,
		"first_name":            person.FirstName,
		"last_name":             person.LastName,
		"gender":                person.Gender,
		"age":                   person.Age,
		"date_of_birth":         person.DateOfBirth.Format("2006-01-02"),
		"marital_status":        person.MaritalStatus,
		"eligible_for_marriage": person.EligibleForMarriage,
		"highest_degree":        person.Education.HighestDegree,
		"institution":           person.Education.Institution,
		"field_of_study":        person.Education.FieldOfStudy,
		"graduation_year":       person.Education.GraduationYear,
		"job_title":             person.Profession.JobTitle,
		"company":               person.Profession.Company,
		"industry":              person.Profession.Industry,
		"experience_years":      person.Profession.ExperienceYears,
		"annual_income":         person.Profession.AnnualIncome,
		"height":                person.PhysicalAttributes.Height,
		"complexion":            person.PhysicalAttributes.Complexion,
		"body_type":             person.PhysicalAttributes.BodyType,
		"hobbies":               person.Hobbies,
		"profile_visibility":    person.ProfileVisibility,
		"created_at":            person.CreatedAt.Format(time.RFC3339),
		"updated_at":            person.UpdatedAt.Format(time.RFC3339),
		"role":                  s.determineRole(person),
		"primary_member":        person.EligibleForMarriage,
	}
}

func (s *DataSeeder) connectionToMap(connection *models.FamilyConnection) map[string]interface{} {
	return map[string]interface{}{
		"from_family_id":    connection.FromFamilyID,
		"to_family_id":      connection.ToFamilyID,
		"relation_type":     connection.RelationType,
		"specific_relation": connection.SpecificRelation,
		"strength":          connection.Strength,
		"verified":          connection.Verified,
		"established_date":  connection.EstablishedDate.Format("2006-01-02"),
		"created_at":        connection.CreatedAt.Format(time.RFC3339),
		"mutual_events":     []string{},
		"notes":             fmt.Sprintf("Connection established on %s", connection.EstablishedDate.Format("2006-01-02")),
	}
}

func (s *DataSeeder) determineRole(person *models.Person) string {
	if person.Age >= 50 {
		if person.Gender == "Male" {
			return "FATHER"
		}
		return "MOTHER"
	}
	if person.Age >= 21 && person.Gender == "Male" {
		return "SON"
	}
	if person.Age >= 18 && person.Gender == "Female" {
		return "DAUGHTER"
	}
	return "CHILD"
}
