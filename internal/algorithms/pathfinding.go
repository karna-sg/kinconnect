package algorithms

import (
	"context"
	"families-linkedin/internal/models"
	"fmt"
	"sync"
	"time"
)

// PathFinder interface defines methods for finding paths between families
type PathFinder interface {
	FindPath(ctx context.Context, fromID, toID string, maxDepth int) (*models.ConnectionPath, error)
	FindMultiplePaths(ctx context.Context, fromID, toID string, maxDepth, maxPaths int) ([]*models.ConnectionPath, error)
}

// GraphRepository interface for graph operations
type GraphRepository interface {
	GetNeighbors(ctx context.Context, familyID string) ([]string, error)
	GetConnectionStrength(ctx context.Context, from, to string) (float64, error)
	GetFamilyTrustScore(ctx context.Context, familyID string) (float64, error)
}

// BidirectionalBFS implements bidirectional breadth-first search with cycle detection
type BidirectionalBFS struct {
	repo GraphRepository
}

// NewBidirectionalBFS creates a new bidirectional BFS path finder
func NewBidirectionalBFS(repo GraphRepository) *BidirectionalBFS {
	return &BidirectionalBFS{repo: repo}
}

// FindPath finds the shortest path between two families using bidirectional BFS
func (bfs *BidirectionalBFS) FindPath(ctx context.Context, fromID, toID string, maxDepth int) (*models.ConnectionPath, error) {
	if fromID == toID {
		return &models.ConnectionPath{
			SourceFamilyID: fromID,
			TargetFamilyID: toID,
			Path:           []string{fromID},
			Degree:         0,
			PathStrength:   1.0,
			Verified:       true,
			CalculatedAt:   time.Now(),
		}, nil
	}

	// Forward and backward queues
	forwardQueue := []PathState{{FamilyID: fromID, Path: []string{fromID}, Visited: map[string]bool{fromID: true}}}
	backwardQueue := []PathState{{FamilyID: toID, Path: []string{toID}, Visited: map[string]bool{toID: true}}}
	
	forwardVisited := map[string][]string{fromID: {fromID}}
	backwardVisited := map[string][]string{toID: {toID}}
	
	depth := 0
	
	for len(forwardQueue) > 0 || len(backwardQueue) > 0 {
		if depth > maxDepth {
			break
		}
		
		// Expand forward frontier
		if len(forwardQueue) > 0 {
			newForwardQueue := []PathState{}
			
			for _, state := range forwardQueue {
				neighbors, err := bfs.repo.GetNeighbors(ctx, state.FamilyID)
				if err != nil {
					return nil, fmt.Errorf("failed to get neighbors for %s: %w", state.FamilyID, err)
				}
				
				for _, neighbor := range neighbors {
					// Check if we found connection to backward search
					if backwardPath, exists := backwardVisited[neighbor]; exists {
						// Connection found! Reconstruct path
						fullPath := append(state.Path, reverse(backwardPath[1:])...)
						
						// Validate no cycles
						if hasCycle(fullPath) {
							continue // Skip this path if it has cycles
						}
						
						connectionPath := &models.ConnectionPath{
							SourceFamilyID: fromID,
							TargetFamilyID: toID,
							Path:           fullPath,
							Degree:         len(fullPath) - 1,
							CalculatedAt:   time.Now(),
						}
						
						// Calculate path strength
						if err := bfs.calculatePathStrength(ctx, connectionPath); err != nil {
							return nil, err
						}
						
						return connectionPath, nil
					}
					
					// Check for cycles in current path
					if state.Visited[neighbor] {
						continue // Skip to avoid cycles
					}
					
					// Add to forward visited if not already explored
					if _, visited := forwardVisited[neighbor]; !visited {
						newPath := append(state.Path, neighbor)
						newVisited := make(map[string]bool)
						for k, v := range state.Visited {
							newVisited[k] = v
						}
						newVisited[neighbor] = true
						
						forwardVisited[neighbor] = newPath
						newForwardQueue = append(newForwardQueue, PathState{
							FamilyID: neighbor,
							Path:     newPath,
							Visited:  newVisited,
						})
					}
				}
			}
			
			forwardQueue = newForwardQueue
		}
		
		// Expand backward frontier
		if len(backwardQueue) > 0 {
			newBackwardQueue := []PathState{}
			
			for _, state := range backwardQueue {
				neighbors, err := bfs.repo.GetNeighbors(ctx, state.FamilyID)
				if err != nil {
					return nil, fmt.Errorf("failed to get neighbors for %s: %w", state.FamilyID, err)
				}
				
				for _, neighbor := range neighbors {
					// Check if we found connection to forward search
					if forwardPath, exists := forwardVisited[neighbor]; exists {
						// Connection found! Reconstruct path
						fullPath := append(forwardPath, reverse(state.Path[1:])...)
						
						// Validate no cycles
						if hasCycle(fullPath) {
							continue // Skip this path if it has cycles
						}
						
						connectionPath := &models.ConnectionPath{
							SourceFamilyID: fromID,
							TargetFamilyID: toID,
							Path:           fullPath,
							Degree:         len(fullPath) - 1,
							CalculatedAt:   time.Now(),
						}
						
						// Calculate path strength
						if err := bfs.calculatePathStrength(ctx, connectionPath); err != nil {
							return nil, err
						}
						
						return connectionPath, nil
					}
					
					// Check for cycles in current path
					if state.Visited[neighbor] {
						continue // Skip to avoid cycles
					}
					
					// Add to backward visited if not already explored
					if _, visited := backwardVisited[neighbor]; !visited {
						newPath := append(state.Path, neighbor)
						newVisited := make(map[string]bool)
						for k, v := range state.Visited {
							newVisited[k] = v
						}
						newVisited[neighbor] = true
						
						backwardVisited[neighbor] = newPath
						newBackwardQueue = append(newBackwardQueue, PathState{
							FamilyID: neighbor,
							Path:     newPath,
							Visited:  newVisited,
						})
					}
				}
			}
			
			backwardQueue = newBackwardQueue
		}
		
		depth++
	}
	
	return nil, nil // No path found
}

// FindMultiplePaths finds multiple paths using iterative BFS with cycle detection
func (bfs *BidirectionalBFS) FindMultiplePaths(ctx context.Context, fromID, toID string, maxDepth, maxPaths int) ([]*models.ConnectionPath, error) {
	var paths []*models.ConnectionPath
	pathsFound := make(map[string]bool) // Track found paths to avoid duplicates
	
	// Use multiple starting strategies to find diverse paths
	for attempt := 0; attempt < maxPaths && len(paths) < maxPaths; attempt++ {
		path, err := bfs.findPathWithExclusions(ctx, fromID, toID, maxDepth, pathsFound)
		if err != nil {
			return nil, err
		}
		
		if path != nil && !pathsFound[pathKey(path.Path)] && !hasCycle(path.Path) {
			paths = append(paths, path)
			pathsFound[pathKey(path.Path)] = true
		}
	}
	
	return paths, nil
}

// PathState represents the state during path finding
type PathState struct {
	FamilyID string
	Path     []string
	Visited  map[string]bool
}

// findPathWithExclusions finds a path while excluding previously found paths
func (bfs *BidirectionalBFS) findPathWithExclusions(ctx context.Context, fromID, toID string, maxDepth int, excludedPaths map[string]bool) (*models.ConnectionPath, error) {
	if fromID == toID {
		return &models.ConnectionPath{
			SourceFamilyID: fromID,
			TargetFamilyID: toID,
			Path:           []string{fromID},
			Degree:         0,
			PathStrength:   1.0,
			Verified:       true,
			CalculatedAt:   time.Now(),
		}, nil
	}

	queue := []PathState{{FamilyID: fromID, Path: []string{fromID}, Visited: map[string]bool{fromID: true}}}
	visited := map[string]bool{fromID: true}
	
	for len(queue) > 0 && len(queue[0].Path) <= maxDepth {
		state := queue[0]
		queue = queue[1:]
		
		neighbors, err := bfs.repo.GetNeighbors(ctx, state.FamilyID)
		if err != nil {
			return nil, err
		}
		
		for _, neighbor := range neighbors {
			// Found target
			if neighbor == toID {
				fullPath := append(state.Path, neighbor)
				
				// Check for cycles
				if hasCycle(fullPath) {
					continue
				}
				
				// Check if this path was already found
				if excludedPaths[pathKey(fullPath)] {
					continue
				}
				
				connectionPath := &models.ConnectionPath{
					SourceFamilyID: fromID,
					TargetFamilyID: toID,
					Path:           fullPath,
					Degree:         len(fullPath) - 1,
					CalculatedAt:   time.Now(),
				}
				
				// Calculate path strength
				if err := bfs.calculatePathStrength(ctx, connectionPath); err != nil {
					return nil, err
				}
				
				return connectionPath, nil
			}
			
			// Continue search if not visited and no cycle would be created
			if !state.Visited[neighbor] && !visited[neighbor] {
				newPath := append(state.Path, neighbor)
				
				// Check for cycles in the new path
				if hasCycle(newPath) {
					continue
				}
				
				newVisited := make(map[string]bool)
				for k, v := range state.Visited {
					newVisited[k] = v
				}
				newVisited[neighbor] = true
				visited[neighbor] = true
				
				queue = append(queue, PathState{
					FamilyID: neighbor,
					Path:     newPath,
					Visited:  newVisited,
				})
			}
		}
	}
	
	return nil, nil // No path found
}

// calculatePathStrength calculates the strength of a path based on individual connection strengths
func (bfs *BidirectionalBFS) calculatePathStrength(ctx context.Context, path *models.ConnectionPath) error {
	if len(path.Path) < 2 {
		path.PathStrength = 1.0
		path.Verified = true
		return nil
	}
	
	strength := 1.0
	allVerified := true
	
	for i := 0; i < len(path.Path)-1; i++ {
		connStrength, err := bfs.repo.GetConnectionStrength(ctx, path.Path[i], path.Path[i+1])
		if err != nil {
			return fmt.Errorf("failed to get connection strength between %s and %s: %w", 
				path.Path[i], path.Path[i+1], err)
		}
		
		strength *= connStrength
		
		// For simplicity, assume connection is verified if strength > 0.5
		if connStrength <= 0.5 {
			allVerified = false
		}
	}
	
	path.PathStrength = strength
	path.Verified = allVerified
	
	return nil
}

// ParallelPathFinder implements parallel path finding for multiple queries
type ParallelPathFinder struct {
	pathFinder PathFinder
	maxWorkers int
}

// NewParallelPathFinder creates a new parallel path finder
func NewParallelPathFinder(pathFinder PathFinder, maxWorkers int) *ParallelPathFinder {
	return &ParallelPathFinder{
		pathFinder: pathFinder,
		maxWorkers: maxWorkers,
	}
}

// PathQuery represents a path finding query
type PathQuery struct {
	FromID   string
	ToID     string
	MaxDepth int
}

// PathResult represents the result of a path finding query
type PathResult struct {
	Query *PathQuery
	Path  *models.ConnectionPath
	Error error
}

// FindMultiplePathsParallel finds paths for multiple queries in parallel
func (ppf *ParallelPathFinder) FindMultiplePathsParallel(ctx context.Context, queries []*PathQuery) ([]*PathResult, error) {
	if len(queries) == 0 {
		return []*PathResult{}, nil
	}
	
	results := make([]*PathResult, len(queries))
	semaphore := make(chan struct{}, ppf.maxWorkers)
	var wg sync.WaitGroup
	
	for i, query := range queries {
		wg.Add(1)
		go func(index int, q *PathQuery) {
			defer wg.Done()
			
			// Acquire semaphore
			semaphore <- struct{}{}
			defer func() { <-semaphore }()
			
			path, err := ppf.pathFinder.FindPath(ctx, q.FromID, q.ToID, q.MaxDepth)
			results[index] = &PathResult{
				Query: q,
				Path:  path,
				Error: err,
			}
		}(i, query)
	}
	
	wg.Wait()
	return results, nil
}

// Utility functions

// reverse reverses a slice of strings
func reverse(slice []string) []string {
	reversed := make([]string, len(slice))
	for i, v := range slice {
		reversed[len(slice)-1-i] = v
	}
	return reversed
}

// hasCycle checks if a path has any cycles (duplicate family IDs)
func hasCycle(path []string) bool {
	seen := make(map[string]bool)
	for _, familyID := range path {
		if seen[familyID] {
			return true
		}
		seen[familyID] = true
	}
	return false
}

// pathKey creates a unique key for a path
func pathKey(path []string) string {
	key := ""
	for i, familyID := range path {
		if i > 0 {
			key += "->"
		}
		key += familyID
	}
	return key
}

// PathCache provides caching for frequently accessed paths
type PathCache struct {
	cache map[string]*CachedPath
	mutex sync.RWMutex
	ttl   time.Duration
}

type CachedPath struct {
	Path      *models.ConnectionPath
	CachedAt  time.Time
	ExpiresAt time.Time
}

// NewPathCache creates a new path cache
func NewPathCache(ttl time.Duration) *PathCache {
	return &PathCache{
		cache: make(map[string]*CachedPath),
		ttl:   ttl,
	}
}

// Get retrieves a path from cache if it exists and is not expired
func (pc *PathCache) Get(fromID, toID string) (*models.ConnectionPath, bool) {
	pc.mutex.RLock()
	defer pc.mutex.RUnlock()
	
	key := fmt.Sprintf("%s->%s", fromID, toID)
	cached, exists := pc.cache[key]
	
	if !exists || time.Now().After(cached.ExpiresAt) {
		return nil, false
	}
	
	return cached.Path, true
}

// Set stores a path in the cache
func (pc *PathCache) Set(fromID, toID string, path *models.ConnectionPath) {
	pc.mutex.Lock()
	defer pc.mutex.Unlock()
	
	key := fmt.Sprintf("%s->%s", fromID, toID)
	now := time.Now()
	
	pc.cache[key] = &CachedPath{
		Path:      path,
		CachedAt:  now,
		ExpiresAt: now.Add(pc.ttl),
	}
}

// CachedPathFinder wraps a PathFinder with caching capabilities
type CachedPathFinder struct {
	pathFinder PathFinder
	cache      *PathCache
}

// NewCachedPathFinder creates a new cached path finder
func NewCachedPathFinder(pathFinder PathFinder, cacheTTL time.Duration) *CachedPathFinder {
	return &CachedPathFinder{
		pathFinder: pathFinder,
		cache:      NewPathCache(cacheTTL),
	}
}

// FindPath finds a path with caching
func (cpf *CachedPathFinder) FindPath(ctx context.Context, fromID, toID string, maxDepth int) (*models.ConnectionPath, error) {
	// Try to get from cache first
	if cached, found := cpf.cache.Get(fromID, toID); found {
		return cached, nil
	}
	
	// Not in cache, find path
	path, err := cpf.pathFinder.FindPath(ctx, fromID, toID, maxDepth)
	if err != nil {
		return nil, err
	}
	
	// Cache the result if path was found
	if path != nil {
		cpf.cache.Set(fromID, toID, path)
	}
	
	return path, nil
}

// FindMultiplePaths finds multiple paths (not cached for complexity)
func (cpf *CachedPathFinder) FindMultiplePaths(ctx context.Context, fromID, toID string, maxDepth, maxPaths int) ([]*models.ConnectionPath, error) {
	return cpf.pathFinder.FindMultiplePaths(ctx, fromID, toID, maxDepth, maxPaths)
}