# Path-Finding Algorithms for Social Graph Networks

## 1. Core Algorithms for Family Relationship Discovery

### 1.1 Breadth-First Search (BFS) - Foundation Algorithm

```python
def find_connection_path_bfs(graph, source_family, target_family, max_depth=3):
    """
    Basic BFS for finding shortest path between families
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if source_family == target_family:
        return [source_family]
    
    queue = [(source_family, [source_family])]
    visited = {source_family}
    
    while queue:
        current_family, path = queue.pop(0)
        
        if len(path) > max_depth:
            continue
            
        for neighbor in graph.get_neighbors(current_family):
            if neighbor not in visited:
                new_path = path + [neighbor]
                
                if neighbor == target_family:
                    return new_path
                    
                visited.add(neighbor)
                queue.append((neighbor, new_path))
    
    return None  # No path found
```

### 1.2 Bidirectional BFS - Optimized for Large Graphs

```python
def bidirectional_bfs(graph, source, target, max_depth=3):
    """
    Bidirectional BFS - searches from both ends simultaneously
    Time Complexity: O(b^(d/2)) vs O(b^d) for regular BFS
    Significant improvement for longer paths
    """
    if source == target:
        return [source]
    
    # Forward search from source
    forward_queue = [(source, [source])]
    forward_visited = {source: [source]}
    
    # Backward search from target  
    backward_queue = [(target, [target])]
    backward_visited = {target: [target]}
    
    depth = 0
    
    while forward_queue or backward_queue and depth <= max_depth:
        depth += 1
        
        # Expand forward frontier
        if forward_queue:
            for _ in range(len(forward_queue)):
                current, path = forward_queue.pop(0)
                
                for neighbor in graph.get_neighbors(current):
                    if neighbor in backward_visited:
                        # Connection found!
                        return path + backward_visited[neighbor][::-1]
                    
                    if neighbor not in forward_visited:
                        new_path = path + [neighbor]
                        forward_visited[neighbor] = new_path
                        forward_queue.append((neighbor, new_path))
        
        # Expand backward frontier
        if backward_queue:
            for _ in range(len(backward_queue)):
                current, path = backward_queue.pop(0)
                
                for neighbor in graph.get_neighbors(current):
                    if neighbor in forward_visited:
                        # Connection found!
                        return forward_visited[neighbor] + path[::-1]
                    
                    if neighbor not in backward_visited:
                        new_path = path + [neighbor]
                        backward_visited[neighbor] = new_path
                        backward_queue.append((neighbor, new_path))
    
    return None
```

### 1.3 A* Algorithm with Social Distance Heuristics

```python
import heapq

def astar_family_connection(graph, source, target, max_depth=3):
    """
    A* algorithm with social distance heuristics for family networks
    Uses community similarity and geographical distance as heuristic
    """
    
    def heuristic(family1, family2):
        """
        Heuristic function considering:
        - Community similarity (caste, religion)
        - Geographical proximity
        - Mutual connections count
        """
        community_score = calculate_community_similarity(family1, family2)
        geo_score = calculate_geographical_proximity(family1, family2)
        mutual_score = count_mutual_connections(family1, family2)
        
        # Lower score = better heuristic (closer families)
        return (3.0 - community_score - geo_score - mutual_score) / 3.0
    
    heap = [(0, source, [source])]
    visited = set()
    g_score = {source: 0}
    
    while heap:
        f_score, current, path = heapq.heappop(heap)
        
        if current == target:
            return path
            
        if current in visited or len(path) > max_depth:
            continue
            
        visited.add(current)
        
        for neighbor in graph.get_neighbors(current):
            tentative_g = g_score[current] + graph.get_edge_weight(current, neighbor)
            
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                g_score[neighbor] = tentative_g
                f_score = tentative_g + heuristic(neighbor, target)
                new_path = path + [neighbor]
                heapq.heappush(heap, (f_score, neighbor, new_path))
    
    return None
```

## 2. Advanced Path-Finding for Matrimony Platform

### 2.1 Multi-Constraint Path Finding

```python
def find_trusted_path(graph, source, target, constraints):
    """
    Find path with multiple constraints for matrimony context:
    - Minimum trust score for intermediate families
    - Preferred relationship types (family > community > social)
    - Maximum geographical distance
    """
    
    def meets_constraints(path, constraints):
        for i in range(len(path) - 1):
            edge = graph.get_edge(path[i], path[i+1])
            
            # Check trust score constraint
            if edge.trust_score < constraints.min_trust_score:
                return False
                
            # Check relationship type preference
            if edge.relation_type not in constraints.allowed_relations:
                return False
                
            # Check geographical constraint
            if edge.geographical_distance > constraints.max_distance:
                return False
                
        return True
    
    queue = [(source, [source])]
    visited = set()
    valid_paths = []
    
    while queue:
        current, path = queue.pop(0)
        
        if current == target and meets_constraints(path, constraints):
            valid_paths.append(path)
            continue
            
        if len(path) >= constraints.max_depth:
            continue
            
        if current in visited:
            continue
            
        visited.add(current)
        
        for neighbor in graph.get_neighbors(current):
            new_path = path + [neighbor]
            if meets_constraints(new_path, constraints):
                queue.append((neighbor, new_path))
    
    # Sort by path quality (trust score, relationship strength)
    return sorted(valid_paths, key=lambda p: calculate_path_quality(p), reverse=True)
```

### 2.2 K-Shortest Paths with Relationship Strength

```python
def k_shortest_trusted_paths(graph, source, target, k=5, max_depth=4):
    """
    Find K shortest paths considering relationship strength
    Useful for showing multiple connection options to families
    """
    
    def path_cost(path):
        """Calculate path cost based on relationship strength and trust"""
        total_cost = 0
        for i in range(len(path) - 1):
            edge = graph.get_edge(path[i], path[i+1])
            # Lower cost for stronger relationships
            cost = 1.0 / (edge.trust_score * edge.relationship_strength)
            total_cost += cost
        return total_cost
    
    # Use Yen's algorithm for K-shortest paths
    paths = []
    potential_paths = []
    
    # Find shortest path using Dijkstra
    shortest_path = dijkstra_shortest_path(graph, source, target)
    if shortest_path:
        paths.append(shortest_path)
    
    for i in range(1, k):
        for j in range(len(paths[i-1]) - 1):
            # Create spur path by removing edges
            spur_node = paths[i-1][j]
            root_path = paths[i-1][:j+1]
            
            # Remove conflicting edges
            removed_edges = []
            for path in paths:
                if len(path) > j and path[:j+1] == root_path:
                    edge = (path[j], path[j+1])
                    if graph.has_edge(*edge):
                        graph.remove_edge(*edge)
                        removed_edges.append(edge)
            
            # Find spur path
            spur_path = dijkstra_shortest_path(graph, spur_node, target)
            if spur_path:
                total_path = root_path[:-1] + spur_path
                if len(total_path) <= max_depth:
                    potential_paths.append(total_path)
            
            # Restore removed edges
            for edge in removed_edges:
                graph.add_edge(*edge)
        
        if potential_paths:
            # Get path with lowest cost
            best_path = min(potential_paths, key=path_cost)
            paths.append(best_path)
            potential_paths.remove(best_path)
        else:
            break
    
    return paths
```

## 3. Performance Optimization Techniques

### 3.1 Precomputed Connection Matrix

```python
class PrecomputedConnections:
    """
    Precompute and cache common connection queries
    Especially useful for 1st and 2nd degree connections
    """
    
    def __init__(self, graph):
        self.graph = graph
        self.connection_cache = {}
        self.last_updated = {}
        self.cache_ttl = 3600  # 1 hour TTL
    
    def get_connections(self, family_id, degree=2):
        """Get precomputed connections up to specified degree"""
        cache_key = f"{family_id}_{degree}"
        
        if self._is_cache_valid(cache_key):
            return self.connection_cache[cache_key]
        
        # Compute and cache
        connections = self._compute_connections(family_id, degree)
        self.connection_cache[cache_key] = connections
        self.last_updated[cache_key] = time.time()
        
        return connections
    
    def _compute_connections(self, family_id, degree):
        """BFS to compute connections up to degree"""
        connections = {1: [], 2: [], 3: []}
        visited = {family_id}
        current_level = [family_id]
        
        for d in range(1, degree + 1):
            next_level = []
            for family in current_level:
                for neighbor in self.graph.get_neighbors(family):
                    if neighbor not in visited:
                        visited.add(neighbor)
                        next_level.append(neighbor)
                        connections[d].append({
                            'family_id': neighbor,
                            'path_length': d,
                            'trust_score': self.graph.get_family_trust_score(neighbor)
                        })
            current_level = next_level
        
        return connections
```

### 3.2 Bloom Filter for Fast Existence Checks

```python
from bitarray import bitarray
import hashlib

class ConnectionBloomFilter:
    """
    Bloom filter to quickly check if connection might exist
    Reduces unnecessary graph traversals
    """
    
    def __init__(self, expected_elements, false_positive_rate=0.01):
        self.size = self._calculate_size(expected_elements, false_positive_rate)
        self.hash_count = self._calculate_hash_count(self.size, expected_elements)
        self.bit_array = bitarray(self.size)
        self.bit_array.setall(0)
    
    def add_connection(self, family1, family2, degree):
        """Add a connection to the bloom filter"""
        key = f"{family1}_{family2}_{degree}"
        for i in range(self.hash_count):
            hash_value = self._hash(key, i) % self.size
            self.bit_array[hash_value] = 1
    
    def might_be_connected(self, family1, family2, degree):
        """Check if families might be connected (no false negatives)"""
        key = f"{family1}_{family2}_{degree}"
        for i in range(self.hash_count):
            hash_value = self._hash(key, i) % self.size
            if self.bit_array[hash_value] == 0:
                return False
        return True
    
    def _hash(self, key, seed):
        """Hash function with seed"""
        return int(hashlib.md5(f"{key}_{seed}".encode()).hexdigest(), 16)
```

### 3.3 Parallel Path Finding

```python
import concurrent.futures
import threading

class ParallelPathFinder:
    """
    Parallel path finding for handling multiple queries simultaneously
    """
    
    def __init__(self, graph, max_workers=4):
        self.graph = graph
        self.max_workers = max_workers
        self.thread_local = threading.local()
    
    def find_multiple_paths(self, queries):
        """
        Find paths for multiple source-target pairs in parallel
        queries: List of (source, target, constraints) tuples
        """
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_query = {
                executor.submit(self._find_single_path, query): query 
                for query in queries
            }
            
            results = {}
            for future in concurrent.futures.as_completed(future_to_query):
                query = future_to_query[future]
                try:
                    path = future.result()
                    results[query] = path
                except Exception as exc:
                    results[query] = None
                    print(f'Query {query} generated an exception: {exc}')
        
        return results
    
    def _find_single_path(self, query):
        """Find single path with proper thread-local graph access"""
        source, target, constraints = query
        
        # Use thread-local graph copy if needed for thread safety
        if not hasattr(self.thread_local, 'graph'):
            self.thread_local.graph = self.graph.copy()
        
        return find_trusted_path(self.thread_local.graph, source, target, constraints)
```

## 4. Algorithm Performance Comparison

### 4.1 Time Complexity Analysis

| Algorithm | Time Complexity | Space Complexity | Best Use Case |
|-----------|----------------|------------------|---------------|
| BFS | O(V + E) | O(V) | Short paths, guaranteed shortest |
| Bidirectional BFS | O(b^(d/2)) | O(b^(d/2)) | Longer paths in dense graphs |
| A* with heuristic | O(b^d) worst case | O(b^d) | Guided search with good heuristic |
| Dijkstra | O((V + E) log V) | O(V) | Weighted shortest paths |
| K-shortest paths | O(K * V * (E + V log V)) | O(V + E) | Multiple path options |

### 4.2 Performance Benchmarks for Family Networks

```python
def benchmark_path_algorithms():
    """
    Performance benchmarks for different graph sizes
    """
    results = {}
    
    graph_sizes = [1000, 10000, 100000, 1000000]  # Number of families
    
    for size in graph_sizes:
        graph = generate_test_family_graph(size)
        
        # Test different algorithms
        algorithms = {
            'BFS': find_connection_path_bfs,
            'Bidirectional BFS': bidirectional_bfs,
            'A*': astar_family_connection,
            'Precomputed': lambda g, s, t: precomputed_connections.get_path(s, t)
        }
        
        results[size] = {}
        
        for name, algorithm in algorithms.items():
            start_time = time.time()
            
            # Run 100 random queries
            for _ in range(100):
                source = random.choice(graph.families)
                target = random.choice(graph.families)
                path = algorithm(graph, source, target)
            
            avg_time = (time.time() - start_time) / 100
            results[size][name] = avg_time
    
    return results
```

Expected performance results for 3-degree path finding:
- **1K families**: BFS ~0.1ms, Bidirectional ~0.05ms, A* ~0.08ms
- **10K families**: BFS ~1ms, Bidirectional ~0.3ms, A* ~0.5ms  
- **100K families**: BFS ~10ms, Bidirectional ~2ms, A* ~3ms
- **1M families**: BFS ~100ms, Bidirectional ~8ms, A* ~15ms

## 5. Implementation Recommendations

### For Matrimony Platform Scale:

1. **Primary Algorithm**: Bidirectional BFS for real-time queries
2. **Secondary**: Precomputed connections for 1st/2nd degree (90% of queries)
3. **Backup**: A* with social heuristics for complex constraint queries
4. **Optimization**: Bloom filters for quick non-existence checks
5. **Parallelization**: Multi-threaded processing for batch operations

This combination provides optimal performance for the expected query patterns in a matrimony platform while maintaining sub-second response times even at million-family scale.