package main

import (
	"context"
	"families-linkedin/internal/api"
	"families-linkedin/internal/config"
	"families-linkedin/internal/database"
	"families-linkedin/internal/metrics"
	"families-linkedin/internal/repository"
	"families-linkedin/internal/service"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}
	fmt.Println("Configuration loaded successfully")
	fmt.Println("Environment:", cfg.Environment)
	fmt.Println("Server address:", cfg.Server.Address)
	fmt.Println("Neo4j connection:", cfg.Neo4j.URI)
	fmt.Println("Neo4j username:", cfg.Neo4j.Username)
	fmt.Println("Neo4j password:", cfg.Neo4j.Password)
	fmt.Println("Neo4j database:", cfg.Neo4j.Database)
	fmt.Println("Neo4j max connections:", cfg.Neo4j.MaxConnections)
	fmt.Println("Neo4j connection timeout:", cfg.Neo4j.ConnectionTimeout)
	fmt.Println("Neo4j max transaction retry time:", cfg.Neo4j.MaxTransactionRetryTime)

	// Initialize metrics
	metricsCollector := metrics.NewCollector()
	metrics.RegisterMetrics(metricsCollector)

	// Connect to Neo4j
	neo4jDriver, err := database.NewNeo4jConnection(cfg.Neo4j)
	if err != nil {
		log.Fatal("Failed to connect to Neo4j:", err)
	}
	defer neo4jDriver.Close(context.Background())

	// Verify database connection
	if err := database.VerifyConnection(neo4jDriver); err != nil {
		log.Fatal("Failed to verify Neo4j connection:", err)
	}

	// Initialize repositories
	familyRepo := repository.NewFamilyRepository(neo4jDriver)
	personRepo := repository.NewPersonRepository(neo4jDriver)
	connectionRepo := repository.NewConnectionRepository(neo4jDriver)

	// Initialize services
	familyService := service.NewFamilyService(familyRepo, personRepo, connectionRepo, metricsCollector)
	connectionService := service.NewConnectionService(connectionRepo, familyRepo, metricsCollector)

	// Setup Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(metrics.PrometheusMiddleware(metricsCollector))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "timestamp": time.Now()})
	})

	// Metrics endpoint
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Initialize API handlers
	api.SetupRoutes(router, familyService, connectionService)

	// Start HTTP server
	server := &http.Server{
		Addr:           cfg.Server.Address,
		Handler:        router,
		ReadTimeout:    cfg.Server.ReadTimeout,
		WriteTimeout:   cfg.Server.WriteTimeout,
		IdleTimeout:    cfg.Server.IdleTimeout,
		MaxHeaderBytes: 1 << 20, // 1 MB
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting server on %s", cfg.Server.Address)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Failed to start server:", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}
