# Family Matrimony Platform - Makefile

.PHONY: help dev prod stop clean seed test build

# Default target
help: ## Show this help message
	@echo "Family Matrimony Platform - Available Commands:"
	@echo "================================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# Development Environment
dev: ## Start development environment with Neo4j
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "⏳ Waiting for Neo4j to be ready..."
	@sleep 15
	@echo "🔧 Setting up database schema..."
	@bash scripts/setup-neo4j.sh || true
	@echo "✅ Development environment ready!"
	@echo "   Neo4j Browser: http://localhost:7474 (neo4j/dev123)"
	@echo "   Redis: localhost:6379"

# Production Environment  
prod: ## Start production environment
	@echo "🏭 Starting production environment..."
	@mkdir -p data/neo4j-prod logs/neo4j-prod backups-prod import-prod
	docker-compose -f docker-compose.prod.yml up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 30
	@echo "🔧 Setting up database schema..."
	@NEO4J_USER=neo4j NEO4J_PASSWORD=StrongMatrimonyPassword2024! bash scripts/setup-neo4j.sh || true
	@echo "✅ Production environment ready!"
	@echo "   Neo4j Browser: http://localhost:7474"
	@echo "   Prometheus: http://localhost:9090"
	@echo "   Grafana: http://localhost:3000 (admin/grafana_admin_2024)"

# Standard Environment (default)
up: ## Start standard Neo4j environment
	@echo "🚀 Starting Neo4j database..."
	@mkdir -p data/neo4j logs/neo4j import backups
	docker-compose up -d
	@echo "⏳ Waiting for Neo4j to be ready..."
	@sleep 15
	@echo "🔧 Setting up database schema..."
	@bash scripts/setup-neo4j.sh || true
	@echo "✅ Neo4j is ready!"
	@echo "   Neo4j Browser: http://localhost:7474 (neo4j/matrimony123)"

# Stop all services
stop: ## Stop all running containers
	@echo "🛑 Stopping all services..."
	docker-compose down
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.prod.yml down
	@echo "✅ All services stopped!"

# Clean everything (DESTRUCTIVE)
clean: ## Clean all data and containers (DESTRUCTIVE!)
	@echo "⚠️  This will DELETE ALL DATA! Press Ctrl+C to cancel..."
	@sleep 5
	@echo "🧹 Cleaning containers and volumes..."
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.prod.yml down -v
	docker system prune -f
	@sudo rm -rf data/ logs/ backups/ backups-prod/ || rm -rf data/ logs/ backups/ backups-prod/
	@echo "✅ Cleanup completed!"

# Application Commands
build: ## Build the Go application
	@echo "🔨 Building Go application..."
	go mod tidy
	go build -o bin/matrimony-platform main.go
	go build -o bin/seeder cmd/seed/main.go
	@echo "✅ Build completed!"

run: ## Run the Go application
	@echo "🚀 Starting matrimony platform..."
	go run main.go

# Data seeding commands
seed-small: ## Seed 1K families (development)
	@echo "🌱 Seeding 1K families..."
	go run cmd/seed/main.go -families 1000 -verbose

seed-medium: ## Seed 10K families (testing)
	@echo "🌱 Seeding 10K families..."
	go run cmd/seed/main.go -families 10000 -batch-size 200 -verbose

seed-large: ## Seed 100K families (load testing)
	@echo "🌱 Seeding 100K families..."
	go run cmd/seed/main.go -families 100000 -batch-size 500 -connection-prob 0.005 -verbose

seed-clear: ## Clear existing data and seed 5K families
	@echo "🌱 Clearing data and seeding 5K families..."
	go run cmd/seed/main.go -families 5000 -clear -create-indexes -verbose

# Testing commands
test: ## Run all tests
	@echo "🧪 Running tests..."
	go test -v ./...

test-coverage: ## Run tests with coverage
	@echo "🧪 Running tests with coverage..."
	go test -v -cover ./...

test-benchmark: ## Run benchmark tests
	@echo "🏃 Running benchmarks..."
	go test -bench=. ./internal/algorithms/

test-load: ## Run load tests (requires seeded data)
	@echo "🏋️ Running load tests..."
	go test -tags=integration -run TestLoadTesting ./tests/

# Development helpers
logs: ## View Neo4j logs
	docker logs -f neo4j-matrimony

logs-dev: ## View development logs
	docker logs -f neo4j-matrimony-dev

logs-prod: ## View production logs  
	docker logs -f neo4j-matrimony-prod

shell: ## Access Neo4j Cypher shell
	docker exec -it neo4j-matrimony cypher-shell -u neo4j -p matrimony123

shell-dev: ## Access development Cypher shell
	docker exec -it neo4j-matrimony-dev cypher-shell -u neo4j -p dev123

shell-prod: ## Access production Cypher shell
	docker exec -it neo4j-matrimony-prod cypher-shell -u neo4j -p StrongMatrimonyPassword2024!

# Backup and restore
backup: ## Create database backup
	@echo "💾 Creating backup..."
	@mkdir -p backups
	docker exec neo4j-matrimony neo4j-admin database dump neo4j --to-path=/backups
	@echo "✅ Backup created in backups/ directory"

restore: ## Restore database from backup (requires backup file)
	@echo "📦 Restoring database..."
	@echo "⚠️  This will replace existing data!"
	@sleep 3
	docker exec neo4j-matrimony neo4j-admin database load neo4j --from-path=/backups --overwrite-destination=true
	@echo "✅ Database restored!"

# Monitoring
stats: ## Show database statistics
	@echo "📊 Database Statistics:"
	docker exec neo4j-matrimony cypher-shell -u neo4j -p matrimony123 "CALL db.stats.retrieve('GRAPH COUNTS') YIELD section, data RETURN section, data"

health: ## Check application health
	@echo "🏥 Health Check:"
	@curl -s http://localhost:8080/health | jq . || echo "Application not running"
	@echo "\n📊 Network Stats:"
	@curl -s http://localhost:8080/api/v1/connections/stats | jq . || echo "API not available"

# Environment setup
install-deps: ## Install Go dependencies
	@echo "📦 Installing dependencies..."
	go mod download
	go mod tidy
	@echo "✅ Dependencies installed!"

setup-dirs: ## Create necessary directories
	@echo "📁 Creating directories..."
	@mkdir -p data/neo4j logs/neo4j import backups scripts
	@mkdir -p data/neo4j-prod logs/neo4j-prod backups-prod import-prod
	@echo "✅ Directories created!"

# Quick start
quick-start: setup-dirs dev seed-small ## Quick start with development environment and sample data
	@echo ""
	@echo "🎉 Quick start completed!"
	@echo "   Neo4j Browser: http://localhost:7474 (neo4j/dev123)"
	@echo "   Start app: make run"
	@echo "   Test API: curl http://localhost:8080/health"

# Production deployment
deploy: prod ## Deploy to production environment
	@echo "🚀 Production deployment completed!"
	@echo "   Configure your reverse proxy to point to localhost:7474"
	@echo "   Update DNS records as needed"
	@echo "   Set up monitoring alerts"