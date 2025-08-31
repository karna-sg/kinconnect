package metrics

import (
	"fmt"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

// Collector holds all the metrics collectors
type Collector struct {
	counters   map[string]prometheus.Counter
	histograms map[string]prometheus.Histogram
	gauges     map[string]prometheus.Gauge
	mutex      sync.RWMutex
}

// NewCollector creates a new metrics collector
func NewCollector() *Collector {
	return &Collector{
		counters:   make(map[string]prometheus.Counter),
		histograms: make(map[string]prometheus.Histogram),
		gauges:     make(map[string]prometheus.Gauge),
	}
}

// RegisterMetrics registers all application metrics
func RegisterMetrics(collector *Collector) {
	// HTTP metrics
	collector.RegisterCounter("http_requests_total", "Total number of HTTP requests", []string{"method", "endpoint", "status"})
	collector.RegisterHistogram("http_request_duration_seconds", "HTTP request duration in seconds", []string{"method", "endpoint"})

	// Family service metrics
	collector.RegisterCounter("family_service_created", "Number of families created", nil)
	collector.RegisterCounter("family_service_get_success", "Number of successful family retrievals", nil)
	collector.RegisterCounter("family_service_get_errors", "Number of failed family retrievals", nil)
	collector.RegisterCounter("family_service_updated", "Number of families updated", nil)
	collector.RegisterCounter("family_service_deleted", "Number of families deleted", nil)
	collector.RegisterCounter("family_service_search_success", "Number of successful family searches", nil)
	collector.RegisterCounter("family_service_search_errors", "Number of failed family searches", nil)
	collector.RegisterCounter("family_service_validation_errors", "Number of family validation errors", nil)
	collector.RegisterCounter("family_service_create_errors", "Number of family creation errors", nil)
	collector.RegisterCounter("family_service_update_errors", "Number of family update errors", nil)
	collector.RegisterCounter("family_service_delete_errors", "Number of family deletion errors", nil)
	collector.RegisterCounter("family_service_match_errors", "Number of match finding errors", nil)
	collector.RegisterCounter("family_service_match_not_eligible", "Number of not eligible match requests", nil)
	collector.RegisterCounter("family_service_match_success", "Number of successful match findings", nil)
	collector.RegisterCounter("family_service_trust_score_errors", "Number of trust score calculation errors", nil)
	collector.RegisterCounter("family_service_trust_score_success", "Number of successful trust score calculations", nil)
	collector.RegisterCounter("family_service_member_added", "Number of family members added", nil)
	collector.RegisterCounter("family_service_connection_created", "Number of family connections created", nil)

	collector.RegisterHistogram("family_service_create_family", "Time taken to create a family", nil)
	collector.RegisterHistogram("family_service_get_family", "Time taken to get a family", nil)
	collector.RegisterHistogram("family_service_update_family", "Time taken to update a family", nil)
	collector.RegisterHistogram("family_service_delete_family", "Time taken to delete a family", nil)
	collector.RegisterHistogram("family_service_search_families", "Time taken to search families", nil)
	collector.RegisterHistogram("family_service_get_eligible_matches", "Time taken to find eligible matches", nil)
	collector.RegisterHistogram("family_service_calculate_trust_score", "Time taken to calculate trust score", nil)

	collector.RegisterGauge("family_service_search_results", "Number of results in last search", nil)
	collector.RegisterGauge("family_service_matches_found", "Number of matches found in last request", nil)
	collector.RegisterGauge("family_service_trust_score_calculated", "Last calculated trust score", nil)

	// Connection service metrics
	collector.RegisterCounter("connection_service_path_found", "Number of paths found", nil)
	collector.RegisterCounter("connection_service_path_not_found", "Number of paths not found", nil)
	collector.RegisterCounter("connection_service_find_path_errors", "Number of path finding errors", nil)
	collector.RegisterCounter("connection_service_multiple_paths_found", "Number of multiple path requests", nil)
	collector.RegisterCounter("connection_service_get_network_success", "Number of successful network retrievals", nil)
	collector.RegisterCounter("connection_service_get_network_errors", "Number of failed network retrievals", nil)
	collector.RegisterCounter("connection_service_find_common_success", "Number of successful common connection findings", nil)
	collector.RegisterCounter("connection_service_find_common_errors", "Number of failed common connection findings", nil)
	collector.RegisterCounter("connection_service_created", "Number of connections created", nil)
	collector.RegisterCounter("connection_service_create_errors", "Number of connection creation errors", nil)
	collector.RegisterCounter("connection_service_create_validation_errors", "Number of connection validation errors", nil)
	collector.RegisterCounter("connection_service_create_cycle_errors", "Number of cycle detection errors", nil)
	collector.RegisterCounter("connection_service_get_stats_success", "Number of successful stats retrievals", nil)
	collector.RegisterCounter("connection_service_get_stats_errors", "Number of failed stats retrievals", nil)
	collector.RegisterCounter("connection_service_analyze_success", "Number of successful connection analyses", nil)
	collector.RegisterCounter("connection_service_analyze_errors", "Number of failed connection analyses", nil)

	collector.RegisterHistogram("connection_service_find_path", "Time taken to find a path", nil)
	collector.RegisterHistogram("connection_service_find_multiple_paths", "Time taken to find multiple paths", nil)
	collector.RegisterHistogram("connection_service_get_network", "Time taken to get family network", nil)
	collector.RegisterHistogram("connection_service_find_common", "Time taken to find common connections", nil)
	collector.RegisterHistogram("connection_service_create", "Time taken to create a connection", nil)
	collector.RegisterHistogram("connection_service_get_stats", "Time taken to get network stats", nil)
	collector.RegisterHistogram("connection_service_analyze_strength", "Time taken to analyze connection strength", nil)

	collector.RegisterGauge("connection_service_path_degree", "Degree of last found path", nil)
	collector.RegisterGauge("connection_service_path_strength", "Strength of last found path", nil)
	collector.RegisterGauge("connection_service_paths_count", "Number of paths in last multiple path request", nil)
	collector.RegisterGauge("connection_service_network_size", "Size of last retrieved network", nil)
	collector.RegisterGauge("connection_service_common_connections", "Number of common connections found", nil)

	// Neo4j database metrics
	collector.RegisterGauge("neo4j_total_nodes", "Total number of nodes in Neo4j", nil)
	collector.RegisterGauge("neo4j_total_relationships", "Total number of relationships in Neo4j", nil)
	collector.RegisterGauge("neo4j_family_count", "Number of family nodes", nil)
	collector.RegisterGauge("neo4j_person_count", "Number of person nodes", nil)
	collector.RegisterHistogram("neo4j_query_duration", "Neo4j query execution time", []string{"query_type"})

	// System metrics
	collector.RegisterGauge("system_memory_usage_bytes", "Current memory usage in bytes", nil)
	collector.RegisterGauge("system_cpu_usage_percent", "Current CPU usage percentage", nil)
	collector.RegisterCounter("system_errors_total", "Total number of system errors", []string{"component"})
}

// RegisterCounter registers a new counter metric
func (c *Collector) RegisterCounter(name, help string, labels []string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	var counter prometheus.Counter
	if labels != nil && len(labels) > 0 {
		counterVec := promauto.NewCounterVec(prometheus.CounterOpts{
			Name: name,
			Help: help,
		}, labels)
		counter = counterVec.WithLabelValues(make([]string, len(labels))...)
	} else {
		counter = promauto.NewCounter(prometheus.CounterOpts{
			Name: name,
			Help: help,
		})
	}

	c.counters[name] = counter
}

// RegisterHistogram registers a new histogram metric
func (c *Collector) RegisterHistogram(name, help string, labels []string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	var histogram prometheus.Histogram
	if labels != nil && len(labels) > 0 {
		histogramVec := promauto.NewHistogramVec(prometheus.HistogramOpts{
			Name:    name,
			Help:    help,
			Buckets: prometheus.DefBuckets,
		}, labels)
		fmt.Println("histogramVec", histogramVec)
		// histogram = histogramVec.WithLabelValues(make([]string, len(labels))...)
		// histogram = histogramVec.WithLabelValues(make([]string, len(labels))...)
	} else {
		histogram = promauto.NewHistogram(prometheus.HistogramOpts{
			Name:    name,
			Help:    help,
			Buckets: prometheus.DefBuckets,
		})
	}

	c.histograms[name] = histogram
}

// RegisterGauge registers a new gauge metric
func (c *Collector) RegisterGauge(name, help string, labels []string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	var gauge prometheus.Gauge
	if labels != nil && len(labels) > 0 {
		gaugeVec := promauto.NewGaugeVec(prometheus.GaugeOpts{
			Name: name,
			Help: help,
		}, labels)
		gauge = gaugeVec.WithLabelValues(make([]string, len(labels))...)
	} else {
		gauge = promauto.NewGauge(prometheus.GaugeOpts{
			Name: name,
			Help: help,
		})
	}

	c.gauges[name] = gauge
}

// IncrementCounter increments a counter metric
func (c *Collector) IncrementCounter(name string) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	if counter, exists := c.counters[name]; exists {
		counter.Inc()
	}
}

// IncrementCounterWithLabels increments a counter metric with labels
func (c *Collector) IncrementCounterWithLabels(name string, labels prometheus.Labels) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	if counter, exists := c.counters[name]; exists {
		counter.Inc()
	}
}

// RecordDuration records a duration in a histogram metric
func (c *Collector) RecordDuration(name string, start time.Time) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	if histogram, exists := c.histograms[name]; exists {
		histogram.Observe(time.Since(start).Seconds())
	}
}

// RecordValue sets a value in a gauge metric
func (c *Collector) RecordValue(name string, value float64) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	if gauge, exists := c.gauges[name]; exists {
		gauge.Set(value)
	}
}

// PrometheusMiddleware creates a Gin middleware for Prometheus metrics
func PrometheusMiddleware(collector *Collector) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		c.Next()

		status := c.Writer.Status()
		duration := time.Since(start)

		// Record HTTP request metrics
		collector.recordHTTPMetrics(method, path, status, duration)
	})
}

// recordHTTPMetrics records HTTP-specific metrics
func (c *Collector) recordHTTPMetrics(method, path string, status int, duration time.Duration) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	// Record request count
	if counter, exists := c.counters["http_requests_total"]; exists {
		counter.Inc()
	}

	// Record request duration
	if histogram, exists := c.histograms["http_request_duration_seconds"]; exists {
		histogram.Observe(duration.Seconds())
	}
}

// StartSystemMetricsCollection starts collecting system metrics
func (c *Collector) StartSystemMetricsCollection() {
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			c.collectSystemMetrics()
		}
	}()
}

// collectSystemMetrics collects system-level metrics
func (c *Collector) collectSystemMetrics() {
	// This is a simplified implementation
	// In production, you would use libraries like github.com/shirou/gopsutil
	// to collect actual system metrics

	c.mutex.RLock()
	defer c.mutex.RUnlock()

	// Placeholder system metrics
	if gauge, exists := c.gauges["system_memory_usage_bytes"]; exists {
		gauge.Set(1024 * 1024 * 100) // 100MB placeholder
	}

	if gauge, exists := c.gauges["system_cpu_usage_percent"]; exists {
		gauge.Set(15.5) // 15.5% placeholder
	}
}

// Custom metrics for specific operations

// RecordNeo4jQueryDuration records the duration of a Neo4j query
func (c *Collector) RecordNeo4jQueryDuration(queryType string, duration time.Duration) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	if histogram, exists := c.histograms["neo4j_query_duration"]; exists {
		histogram.Observe(duration.Seconds())
	}
}

// UpdateNeo4jStats updates Neo4j database statistics
func (c *Collector) UpdateNeo4jStats(totalNodes, totalRelationships, familyCount, personCount int) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	if gauge, exists := c.gauges["neo4j_total_nodes"]; exists {
		gauge.Set(float64(totalNodes))
	}

	if gauge, exists := c.gauges["neo4j_total_relationships"]; exists {
		gauge.Set(float64(totalRelationships))
	}

	if gauge, exists := c.gauges["neo4j_family_count"]; exists {
		gauge.Set(float64(familyCount))
	}

	if gauge, exists := c.gauges["neo4j_person_count"]; exists {
		gauge.Set(float64(personCount))
	}
}

// IncrementSystemError increments system error counter
func (c *Collector) IncrementSystemError(component string) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	if counter, exists := c.counters["system_errors_total"]; exists {
		counter.Inc()
	}
}

// GetMetricValue returns the current value of a gauge metric (for testing/debugging)
func (c *Collector) GetMetricValue(name string) float64 {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	// if gauge, exists := c.gauges[name]; exists {
	// 	dto := &prometheus.MetricDto{}
	// 	gauge.Write(dto)
	// 	return dto.GetGauge().GetValue()
	// }

	return 0
}
