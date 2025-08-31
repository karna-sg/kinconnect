package main

import (
	"context"
	"families-linkedin/internal/config"
	"families-linkedin/internal/database"
	"families-linkedin/internal/seeder"
	"flag"
	"fmt"
	"log"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func main() {
	// Command line flags
	familyCount := flag.Int("families", 1000, "Number of families to generate")
	avgPersons := flag.Int("avg-persons", 4, "Average number of persons per family")
	batchSize := flag.Int("batch-size", 100, "Batch size for database operations")
	probability := flag.Float64("connection-prob", 0.003, "Connection probability between families")
	maxConnections := flag.Int("max-connections", 15, "Maximum connections per family")
	createIndexes := flag.Bool("create-indexes", true, "Create database indexes and constraints")
	clearExisting := flag.Bool("clear", false, "Clear existing data before seeding")
	verbose := flag.Bool("verbose", true, "Enable verbose logging")

	flag.Parse()

	fmt.Printf("Family Matrimony Platform - Data Seeder\n")
	fmt.Printf("========================================\n\n")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	// Connect to Neo4j
	driver, err := database.NewNeo4jConnection(cfg.Neo4j)
	if err != nil {
		log.Fatal("Failed to connect to Neo4j:", err)
	}
	defer driver.Close(context.Background())

	// Verify database connection
	if err := database.VerifyConnection(driver); err != nil {
		log.Fatal("Failed to verify Neo4j connection:", err)
	}

	ctx := context.Background()

	// Clear existing data if requested
	if *clearExisting {
		if *verbose {
			fmt.Println("Clearing existing data...")
		}
		if err := clearDatabase(ctx, driver); err != nil {
			log.Fatal("Failed to clear database:", err)
		}
		if *verbose {
			fmt.Println("Database cleared successfully")
		}
	}

	// Create indexes and constraints
	if *createIndexes {
		if *verbose {
			fmt.Println("Creating database constraints and indexes...")
		}
		if err := database.CreateConstraintsAndIndexes(driver); err != nil {
			log.Fatal("Failed to create constraints and indexes:", err)
		}
		if *verbose {
			fmt.Println("Constraints and indexes created successfully")
		}
	}

	// Configure seeder
	seederConfig := seeder.SeederConfig{
		FamilyCount:             *familyCount,
		AvgPersonsPerFamily:     *avgPersons,
		ConnectionProbability:   *probability,
		MaxConnectionsPerFamily: *maxConnections,
		BatchSize:               *batchSize,
		EnableProgressLogging:   *verbose,
	}

	// Create and run seeder
	dataSeeder := seeder.NewDataSeeder(driver, seederConfig)

	start := time.Now()
	if err := dataSeeder.SeedData(ctx); err != nil {
		log.Fatal("Failed to seed data:", err)
	}
	duration := time.Since(start)

	// Print summary
	fmt.Printf("\n=== Data Seeding Summary ===\n")
	fmt.Printf("Families Generated: %d\n", *familyCount)
	fmt.Printf("Estimated Persons: %d\n", *familyCount**avgPersons)
	fmt.Printf("Connection Probability: %.3f\n", *probability)
	fmt.Printf("Max Connections per Family: %d\n", *maxConnections)
	fmt.Printf("Batch Size: %d\n", *batchSize)
	fmt.Printf("Total Time: %v\n", duration)
	fmt.Printf("Average Time per Family: %v\n", duration/time.Duration(*familyCount))

	// Verify seeded data
	if *verbose {
		fmt.Println("\nVerifying seeded data...")
		if err := verifySeededData(ctx, driver); err != nil {
			log.Printf("Warning: Data verification failed: %v", err)
		}
	}

	fmt.Println("\nData seeding completed successfully!")
}

// clearDatabase removes all existing data
func clearDatabase(ctx context.Context, driver neo4j.DriverWithContext) error {
	session := driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	queries := []string{
		"MATCH ()-[r]-() DELETE r", // Delete all relationships first
		"MATCH (n) DELETE n",       // Delete all nodes
	}

	for _, query := range queries {
		_, err := database.ExecuteWithTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
			_, err := tx.Run(ctx, query, nil)
			return nil, err
		})

		if err != nil {
			return fmt.Errorf("failed to execute query '%s': %w", query, err)
		}
	}

	return nil
}

// verifySeededData performs basic verification of seeded data
func verifySeededData(ctx context.Context, driver neo4j.DriverWithContext) error {
	session := driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := database.ExecuteReadTransaction(ctx, session, func(ctx context.Context, tx neo4j.ManagedTransaction) (interface{}, error) {
		query := `
			MATCH (f:Family) 
			OPTIONAL MATCH (p:Person)-[:BELONGS_TO]->(f)
			OPTIONAL MATCH (f)-[r:FAMILY_RELATION]-(connected:Family)
			RETURN COUNT(DISTINCT f) as family_count,
				   COUNT(DISTINCT p) as person_count,
				   COUNT(DISTINCT r) as relationship_count
		`

		result, err := tx.Run(ctx, query, nil)
		if err != nil {
			return nil, err
		}

		if result.Next(ctx) {
			record := result.Record()
			return map[string]interface{}{
				"families":      record.Values[0],
				"persons":       record.Values[1],
				"relationships": record.Values[2],
			}, nil
		}

		return nil, fmt.Errorf("no results returned from verification query")
	})

	if err != nil {
		return err
	}

	stats := result.(map[string]interface{})

	fmt.Printf("\n=== Database Statistics ===\n")
	fmt.Printf("Total Families: %v\n", stats["families"])
	fmt.Printf("Total Persons: %v\n", stats["persons"])
	fmt.Printf("Total Relationships: %v\n", stats["relationships"])

	// Basic validation
	familyCount := stats["families"].(int64)
	personCount := stats["persons"].(int64)
	relationshipCount := stats["relationships"].(int64)

	if familyCount == 0 {
		return fmt.Errorf("no families found in database")
	}

	if personCount == 0 {
		return fmt.Errorf("no persons found in database")
	}

	avgPersonsPerFamily := float64(personCount) / float64(familyCount)
	if avgPersonsPerFamily < 2.0 || avgPersonsPerFamily > 8.0 {
		return fmt.Errorf("unusual average persons per family: %.2f", avgPersonsPerFamily)
	}

	fmt.Printf("Average Persons per Family: %.2f\n", avgPersonsPerFamily)

	if relationshipCount > 0 {
		avgConnectionsPerFamily := float64(relationshipCount) / float64(familyCount)
		fmt.Printf("Average Connections per Family: %.2f\n", avgConnectionsPerFamily)
	}

	return nil
}
