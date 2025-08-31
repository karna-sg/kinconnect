package service

import (
	"context"
	"families-linkedin/internal/algorithms"
	"families-linkedin/internal/metrics"
	"families-linkedin/internal/models"
	"families-linkedin/internal/repository"
	"fmt"
	"time"
)

type ConnectionService struct {
	connectionRepo *repository.ConnectionRepository
	familyRepo     *repository.FamilyRepository
	pathFinder     algorithms.PathFinder
	metrics        *metrics.Collector
}

func NewConnectionService(
	connectionRepo *repository.ConnectionRepository,
	familyRepo *repository.FamilyRepository,
	metrics *metrics.Collector,
) *ConnectionService {
	// Create bidirectional BFS path finder with repository adapter
	repoAdapter := &repositoryAdapter{
		connectionRepo: connectionRepo,
		familyRepo:     familyRepo,
	}
	
	pathFinder := algorithms.NewBidirectionalBFS(repoAdapter)
	
	// Wrap with caching
	cachedPathFinder := algorithms.NewCachedPathFinder(pathFinder, 5*time.Minute)

	return &ConnectionService{
		connectionRepo: connectionRepo,
		familyRepo:     familyRepo,
		pathFinder:     cachedPathFinder,
		metrics:        metrics,
	}
}

// FindConnectionPath finds the shortest path between two families
func (s *ConnectionService) FindConnectionPath(ctx context.Context, fromFamilyID, toFamilyID string, maxDepth int) (*models.ConnectionPath, error) {
	start := time.Now()
	defer s.metrics.RecordDuration("connection_service_find_path", start)

	if maxDepth <= 0 || maxDepth > 6 {
		maxDepth = 4 // Default max depth
	}

	path, err := s.pathFinder.FindPath(ctx, fromFamilyID, toFamilyID, maxDepth)
	if err != nil {
		s.metrics.IncrementCounter("connection_service_find_path_errors")
		return nil, fmt.Errorf("failed to find connection path: %w", err)
	}

	if path == nil {
		s.metrics.IncrementCounter("connection_service_path_not_found")
		return nil, nil // No path found
	}

	s.metrics.IncrementCounter("connection_service_path_found")
	s.metrics.RecordValue("connection_service_path_degree", float64(path.Degree))
	s.metrics.RecordValue("connection_service_path_strength", path.PathStrength)

	return path, nil
}

// FindMultipleConnectionPaths finds multiple paths between two families
func (s *ConnectionService) FindMultipleConnectionPaths(ctx context.Context, fromFamilyID, toFamilyID string, maxDepth, maxPaths int) ([]*models.ConnectionPath, error) {
	start := time.Now()
	defer s.metrics.RecordDuration("connection_service_find_multiple_paths", start)

	if maxDepth <= 0 || maxDepth > 6 {
		maxDepth = 4 // Default max depth
	}
	if maxPaths <= 0 || maxPaths > 10 {
		maxPaths = 3 // Default max paths
	}

	paths, err := s.connectionRepo.FindMultiplePaths(ctx, fromFamilyID, toFamilyID, maxDepth, maxPaths)
	if err != nil {
		s.metrics.IncrementCounter("connection_service_find_multiple_paths_errors")
		return nil, fmt.Errorf("failed to find multiple paths: %w", err)
	}

	s.metrics.IncrementCounter("connection_service_multiple_paths_found")
	s.metrics.RecordValue("connection_service_paths_count", float64(len(paths)))

	return paths, nil
}

// GetFamilyNetwork retrieves the network connections for a family up to specified degree
func (s *ConnectionService) GetFamilyNetwork(ctx context.Context, familyID string, degree int) (*FamilyNetwork, error) {
	start := time.Now()
	defer s.metrics.RecordDuration("connection_service_get_network", start)

	if degree <= 0 || degree > 4 {
		degree = 2 // Default degree
	}

	// Get connected family IDs
	connectedFamilyIDs, err := s.connectionRepo.GetFamilyConnections(ctx, familyID, degree)
	if err != nil {
		s.metrics.IncrementCounter("connection_service_get_network_errors")
		return nil, fmt.Errorf("failed to get family connections: %w", err)
	}

	// Get the central family
	centralFamily, err := s.familyRepo.GetFamilyByID(ctx, familyID)
	if err != nil {
		s.metrics.IncrementCounter("connection_service_get_network_errors")
		return nil, fmt.Errorf("failed to get central family: %w", err)
	}

	// Get connected families
	connectedFamilies, err := s.familyRepo.GetFamiliesByIDs(ctx, connectedFamilyIDs)
	if err != nil {
		s.metrics.IncrementCounter("connection_service_get_network_errors")
		return nil, fmt.Errorf("failed to get connected families: %w", err)
	}

	// Build network structure
	network := &FamilyNetwork{
		CentralFamily:     centralFamily,
		ConnectedFamilies: make(map[int][]*models.Family),
		TotalConnections:  len(connectedFamilies),
		MaxDegree:         degree,
		GeneratedAt:       time.Now(),
	}

	// Organize families by degree
	for _, family := range connectedFamilies {
		// Find the shortest path to determine the degree
		path, err := s.pathFinder.FindPath(ctx, familyID, family.ID, degree)
		if err != nil {
			continue // Skip if path not found
		}
		
		if path != nil {
			degreeLevel := path.Degree
			if degreeLevel <= degree {
				network.ConnectedFamilies[degreeLevel] = append(network.ConnectedFamilies[degreeLevel], family)
			}
		}
	}

	s.metrics.IncrementCounter("connection_service_get_network_success")
	s.metrics.RecordValue("connection_service_network_size", float64(len(connectedFamilies)))

	return network, nil
}

// FindCommonConnections finds families that are connected to both input families
func (s *ConnectionService) FindCommonConnections(ctx context.Context, family1ID, family2ID string, maxDegree int) ([]*CommonConnection, error) {
	start := time.Now()
	defer s.metrics.RecordDuration("connection_service_find_common", start)

	if maxDegree <= 0 || maxDegree > 3 {
		maxDegree = 2 // Default max degree
	}

	// Get connections for both families
	connections1, err := s.connectionRepo.GetFamilyConnections(ctx, family1ID, maxDegree)
	if err != nil {
		s.metrics.IncrementCounter("connection_service_find_common_errors")
		return nil, fmt.Errorf("failed to get connections for family1: %w", err)
	}

	connections2, err := s.connectionRepo.GetFamilyConnections(ctx, family2ID, maxDegree)
	if err != nil {
		s.metrics.IncrementCounter("connection_service_find_common_errors")
		return nil, fmt.Errorf("failed to get connections for family2: %w", err)
	}

	// Find intersection
	commonFamilyIDs := findIntersection(connections1, connections2)

	var commonConnections []*CommonConnection

	for _, commonFamilyID := range commonFamilyIDs {
		// Get the common family
		commonFamily, err := s.familyRepo.GetFamilyByID(ctx, commonFamilyID)
		if err != nil {
			continue // Skip if family not found
		}

		// Find paths from both families to the common family
		path1, err := s.pathFinder.FindPath(ctx, family1ID, commonFamilyID, maxDegree)
		if err != nil {
			continue
		}

		path2, err := s.pathFinder.FindPath(ctx, family2ID, commonFamilyID, maxDegree)
		if err != nil {
			continue
		}

		if path1 != nil && path2 != nil {
			commonConnection := &CommonConnection{
				CommonFamily: commonFamily,
				PathToFamily1: path1,
				PathToFamily2: path2,
				TotalDegree: path1.Degree + path2.Degree,
				CombinedStrength: (path1.PathStrength + path2.PathStrength) / 2.0,
			}
			commonConnections = append(commonConnections, commonConnection)
		}
	}

	// Sort by total degree (shortest total path first)
	s.sortCommonConnectionsByDegree(commonConnections)

	s.metrics.IncrementCounter("connection_service_find_common_success")
	s.metrics.RecordValue("connection_service_common_connections", float64(len(commonConnections)))

	return commonConnections, nil
}

// CreateConnection creates a new connection between families with validation
func (s *ConnectionService) CreateConnection(ctx context.Context, connection *models.FamilyConnection) error {
	start := time.Now()
	defer s.metrics.RecordDuration("connection_service_create", start)

	if err := s.validateConnection(connection); err != nil {
		s.metrics.IncrementCounter("connection_service_create_validation_errors")
		return fmt.Errorf("validation failed: %w", err)
	}

	// Additional cycle detection
	if err := s.connectionRepo.ValidateNoCircularConnections(ctx, connection.FromFamilyID, connection.ToFamilyID); err != nil {
		s.metrics.IncrementCounter("connection_service_create_cycle_errors")
		return fmt.Errorf("connection would create cycles: %w", err)
	}

	if err := s.connectionRepo.CreateConnection(ctx, connection); err != nil {
		s.metrics.IncrementCounter("connection_service_create_errors")
		return fmt.Errorf("failed to create connection: %w", err)
	}

	s.metrics.IncrementCounter("connection_service_created")
	return nil
}

// GetNetworkStats provides comprehensive statistics about the family network
func (s *ConnectionService) GetNetworkStats(ctx context.Context) (*NetworkStats, error) {
	start := time.Now()
	defer s.metrics.RecordDuration("connection_service_get_stats", start)

	stats, err := s.connectionRepo.GetNetworkStats(ctx)
	if err != nil {
		s.metrics.IncrementCounter("connection_service_get_stats_errors")
		return nil, fmt.Errorf("failed to get network stats: %w", err)
	}

	networkStats := &NetworkStats{
		TotalFamilies:           getIntValue(stats, "total_families"),
		TotalConnections:        getIntValue(stats, "total_connections"),
		VerifiedConnections:     getIntValue(stats, "verified_connections"),
		AverageTrustScore:       getFloatValue(stats, "average_trust_score"),
		NetworkDensityPercent:   getFloatValue(stats, "network_density_percentage"),
		CalculatedAt:           time.Now(),
	}

	// Calculate additional metrics
	if networkStats.TotalConnections > 0 {
		networkStats.VerificationRate = float64(networkStats.VerifiedConnections) / float64(networkStats.TotalConnections) * 100
	}

	if networkStats.TotalFamilies > 0 {
		networkStats.AverageConnectionsPerFamily = float64(networkStats.TotalConnections * 2) / float64(networkStats.TotalFamilies) // *2 because connections are bidirectional
	}

	s.metrics.IncrementCounter("connection_service_get_stats_success")
	return networkStats, nil
}

// AnalyzeConnectionStrength analyzes the strength of connections in a path
func (s *ConnectionService) AnalyzeConnectionStrength(ctx context.Context, path *models.ConnectionPath) (*ConnectionAnalysis, error) {
	start := time.Now()
	defer s.metrics.RecordDuration("connection_service_analyze_strength", start)

	if path == nil || len(path.Path) < 2 {
		return nil, fmt.Errorf("invalid path for analysis")
	}

	analysis := &ConnectionAnalysis{
		Path:           path,
		WeakestLink:    1.0,
		StrongestLink:  0.0,
		AverageStrength: 0.0,
		TotalConnections: len(path.Path) - 1,
		AnalyzedAt:     time.Now(),
	}

	totalStrength := 0.0
	var connectionStrengths []float64

	// Analyze each connection in the path
	for i := 0; i < len(path.Path)-1; i++ {
		strength, err := s.connectionRepo.GetConnectionStrength(ctx, path.Path[i], path.Path[i+1])
		if err != nil {
			s.metrics.IncrementCounter("connection_service_analyze_errors")
			return nil, fmt.Errorf("failed to get connection strength: %w", err)
		}

		connectionStrengths = append(connectionStrengths, strength)
		totalStrength += strength

		if strength < analysis.WeakestLink {
			analysis.WeakestLink = strength
			analysis.WeakestLinkIndex = i
		}

		if strength > analysis.StrongestLink {
			analysis.StrongestLink = strength
			analysis.StrongestLinkIndex = i
		}
	}

	analysis.AverageStrength = totalStrength / float64(len(connectionStrengths))
	analysis.ConnectionStrengths = connectionStrengths

	// Classify path strength
	if analysis.AverageStrength >= 0.8 {
		analysis.PathClassification = "Strong"
	} else if analysis.AverageStrength >= 0.6 {
		analysis.PathClassification = "Moderate"
	} else if analysis.AverageStrength >= 0.4 {
		analysis.PathClassification = "Weak"
	} else {
		analysis.PathClassification = "Very Weak"
	}

	s.metrics.IncrementCounter("connection_service_analyze_success")
	return analysis, nil
}

// Supporting types and methods

type FamilyNetwork struct {
	CentralFamily     *models.Family                  `json:"central_family"`
	ConnectedFamilies map[int][]*models.Family        `json:"connected_families"` // degree -> families
	TotalConnections  int                             `json:"total_connections"`
	MaxDegree         int                             `json:"max_degree"`
	GeneratedAt       time.Time                       `json:"generated_at"`
}

type CommonConnection struct {
	CommonFamily      *models.Family           `json:"common_family"`
	PathToFamily1     *models.ConnectionPath   `json:"path_to_family1"`
	PathToFamily2     *models.ConnectionPath   `json:"path_to_family2"`
	TotalDegree       int                      `json:"total_degree"`
	CombinedStrength  float64                  `json:"combined_strength"`
}

type NetworkStats struct {
	TotalFamilies                int       `json:"total_families"`
	TotalConnections             int       `json:"total_connections"`
	VerifiedConnections          int       `json:"verified_connections"`
	AverageTrustScore            float64   `json:"average_trust_score"`
	NetworkDensityPercent        float64   `json:"network_density_percent"`
	VerificationRate             float64   `json:"verification_rate"`
	AverageConnectionsPerFamily  float64   `json:"average_connections_per_family"`
	CalculatedAt                 time.Time `json:"calculated_at"`
}

type ConnectionAnalysis struct {
	Path                 *models.ConnectionPath `json:"path"`
	ConnectionStrengths  []float64              `json:"connection_strengths"`
	WeakestLink          float64                `json:"weakest_link"`
	WeakestLinkIndex     int                    `json:"weakest_link_index"`
	StrongestLink        float64                `json:"strongest_link"`
	StrongestLinkIndex   int                    `json:"strongest_link_index"`
	AverageStrength      float64                `json:"average_strength"`
	TotalConnections     int                    `json:"total_connections"`
	PathClassification   string                 `json:"path_classification"`
	AnalyzedAt           time.Time              `json:"analyzed_at"`
}

// Repository adapter for the path finding algorithms
type repositoryAdapter struct {
	connectionRepo *repository.ConnectionRepository
	familyRepo     *repository.FamilyRepository
}

func (ra *repositoryAdapter) GetNeighbors(ctx context.Context, familyID string) ([]string, error) {
	return ra.connectionRepo.GetFamilyConnections(ctx, familyID, 1)
}

func (ra *repositoryAdapter) GetConnectionStrength(ctx context.Context, from, to string) (float64, error) {
	return ra.connectionRepo.GetConnectionStrength(ctx, from, to)
}

func (ra *repositoryAdapter) GetFamilyTrustScore(ctx context.Context, familyID string) (float64, error) {
	return ra.familyRepo.GetFamilyTrustScore(ctx, familyID)
}

// Helper functions

func (s *ConnectionService) validateConnection(connection *models.FamilyConnection) error {
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

func findIntersection(slice1, slice2 []string) []string {
	m := make(map[string]bool)
	var intersection []string

	for _, item := range slice1 {
		m[item] = true
	}

	for _, item := range slice2 {
		if m[item] {
			intersection = append(intersection, item)
		}
	}

	return intersection
}

func (s *ConnectionService) sortCommonConnectionsByDegree(connections []*CommonConnection) {
	for i := 0; i < len(connections)-1; i++ {
		for j := 0; j < len(connections)-i-1; j++ {
			if connections[j].TotalDegree > connections[j+1].TotalDegree {
				connections[j], connections[j+1] = connections[j+1], connections[j]
			}
		}
	}
}

func getIntValue(m map[string]interface{}, key string) int {
	if val, ok := m[key]; ok {
		if intVal, ok := val.(int64); ok {
			return int(intVal)
		}
		if intVal, ok := val.(int); ok {
			return intVal
		}
	}
	return 0
}

func getFloatValue(m map[string]interface{}, key string) float64 {
	if val, ok := m[key]; ok {
		if floatVal, ok := val.(float64); ok {
			return floatVal
		}
		if intVal, ok := val.(int64); ok {
			return float64(intVal)
		}
	}
	return 0.0
}