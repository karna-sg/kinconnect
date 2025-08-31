package config

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Environment string
	Server      ServerConfig
	Neo4j       Neo4jConfig
	Performance PerformanceConfig
}

type ServerConfig struct {
	Address      string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

type Neo4jConfig struct {
	URI                     string
	Username                string
	Password                string
	Database                string
	MaxConnections          int
	ConnectionTimeout       time.Duration
	MaxTransactionRetryTime time.Duration
}

type PerformanceConfig struct {
	MaxPathDepth int
	QueryTimeout time.Duration
	CacheEnabled bool
	CacheTTL     time.Duration
}

func Load() (*Config, error) {
	// Load .env file if it exists
	_ = godotenv.Load()

	cfg := &Config{
		Environment: getEnv("ENVIRONMENT", "development"),
		Server: ServerConfig{
			Address:      getEnv("SERVER_ADDRESS", ":8080"),
			ReadTimeout:  getDurationEnv("SERVER_READ_TIMEOUT", 10*time.Second),
			WriteTimeout: getDurationEnv("SERVER_WRITE_TIMEOUT", 10*time.Second),
			IdleTimeout:  getDurationEnv("SERVER_IDLE_TIMEOUT", 120*time.Second),
		},
		Neo4j: Neo4jConfig{
			URI:                     getEnv("NEO4J_URI", "bolt://localhost:7687"),
			Username:                getEnv("NEO4J_USERNAME", "neo4j"),
			Password:                getEnv("NEO4J_PASSWORD", "password"),
			Database:                getEnv("NEO4J_DATABASE", "neo4j"),
			MaxConnections:          getIntEnv("NEO4J_MAX_CONNECTIONS", 100),
			ConnectionTimeout:       getDurationEnv("NEO4J_CONNECTION_TIMEOUT", 30*time.Second),
			MaxTransactionRetryTime: getDurationEnv("NEO4J_MAX_TRANSACTION_RETRY_TIME", 30*time.Second),
		},
		Performance: PerformanceConfig{
			MaxPathDepth: getIntEnv("MAX_PATH_DEPTH", 4),
			QueryTimeout: getDurationEnv("QUERY_TIMEOUT", 30*time.Second),
			CacheEnabled: getBoolEnv("CACHE_ENABLED", true),
			CacheTTL:     getDurationEnv("CACHE_TTL", 5*time.Minute),
		},
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getBoolEnv(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
