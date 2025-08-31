#!/bin/bash

# Neo4j Setup Script for Family Matrimony Platform
# This script initializes the Neo4j database with necessary constraints and indexes

set -e

echo "🚀 Setting up Neo4j for Family Matrimony Platform..."

# Configuration
NEO4J_URI=${NEO4J_URI:-"bolt://localhost:7687"}
NEO4J_USER=${NEO4J_USER:-"neo4j"}
NEO4J_PASSWORD=${NEO4J_PASSWORD:-"matrimony123"}
ENVIRONMENT=${ENVIRONMENT:-"development"}

# Function to execute Cypher queries
execute_cypher() {
    local query="$1"
    echo "Executing: $query"
    docker exec neo4j-matrimony cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" "$query" || {
        echo "❌ Failed to execute: $query"
        return 1
    }
}

# Wait for Neo4j to be ready
echo "⏳ Waiting for Neo4j to be ready..."
for i in {1..30}; do
    if docker exec neo4j-matrimony cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" "RETURN 1" &>/dev/null; then
        echo "✅ Neo4j is ready!"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

echo "📋 Creating database constraints..."

# Create unique constraints
execute_cypher "CREATE CONSTRAINT family_id_unique IF NOT EXISTS FOR (f:Family) REQUIRE f.family_id IS UNIQUE;"
execute_cypher "CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.person_id IS UNIQUE;"

echo "🗂️  Creating performance indexes..."

# Family indexes for fast search and filtering
execute_cypher "CREATE INDEX family_location IF NOT EXISTS FOR (f:Family) ON (f.city, f.state);"
execute_cypher "CREATE INDEX family_community IF NOT EXISTS FOR (f:Family) ON (f.caste, f.sub_caste);"
execute_cypher "CREATE INDEX family_trust_score IF NOT EXISTS FOR (f:Family) ON (f.trust_score);"
execute_cypher "CREATE INDEX family_verification IF NOT EXISTS FOR (f:Family) ON (f.verification_status);"
execute_cypher "CREATE INDEX family_active_status IF NOT EXISTS FOR (f:Family) ON (f.active_status);"
execute_cypher "CREATE INDEX family_created_at IF NOT EXISTS FOR (f:Family) ON (f.created_at);"
execute_cypher "CREATE INDEX family_region IF NOT EXISTS FOR (f:Family) ON (f.region);"
execute_cypher "CREATE INDEX family_religion IF NOT EXISTS FOR (f:Family) ON (f.religion);"

# Person indexes for matrimony matching
execute_cypher "CREATE INDEX person_eligibility IF NOT EXISTS FOR (p:Person) ON (p.eligible_for_marriage, p.marital_status);"
execute_cypher "CREATE INDEX person_age_gender IF NOT EXISTS FOR (p:Person) ON (p.age, p.gender);"
execute_cypher "CREATE INDEX person_education IF NOT EXISTS FOR (p:Person) ON (p.highest_degree);"
execute_cypher "CREATE INDEX person_profession IF NOT EXISTS FOR (p:Person) ON (p.industry);"
execute_cypher "CREATE INDEX person_family IF NOT EXISTS FOR (p:Person) ON (p.family_id);"
execute_cypher "CREATE INDEX person_income IF NOT EXISTS FOR (p:Person) ON (p.annual_income);"
execute_cypher "CREATE INDEX person_height IF NOT EXISTS FOR (p:Person) ON (p.height);"

# Composite indexes for complex queries
execute_cypher "CREATE INDEX person_search_criteria IF NOT EXISTS FOR (p:Person) ON (p.gender, p.age, p.marital_status, p.eligible_for_marriage);"
execute_cypher "CREATE INDEX family_location_community IF NOT EXISTS FOR (f:Family) ON (f.city, f.caste, f.trust_score);"
execute_cypher "CREATE INDEX person_matrimony_search IF NOT EXISTS FOR (p:Person) ON (p.eligible_for_marriage, p.gender, p.age, p.highest_degree);"

# Relationship indexes for path finding
execute_cypher "CREATE INDEX rel_type_strength IF NOT EXISTS FOR ()-[r]-() ON (r.relation_type, r.strength);"
execute_cypher "CREATE INDEX rel_verified IF NOT EXISTS FOR ()-[r]-() ON (r.verified);"
execute_cypher "CREATE INDEX rel_established_date IF NOT EXISTS FOR ()-[r]-() ON (r.established_date);"

# Full-text search indexes for names and locations
echo "🔍 Creating full-text search indexes..."
execute_cypher "CREATE FULLTEXT INDEX family_names IF NOT EXISTS FOR (f:Family) ON EACH [f.family_name, f.primary_surname];"
execute_cypher "CREATE FULLTEXT INDEX person_names IF NOT EXISTS FOR (p:Person) ON EACH [p.first_name, p.last_name];"
execute_cypher "CREATE FULLTEXT INDEX family_locations IF NOT EXISTS FOR (f:Family) ON EACH [f.city, f.state, f.address];"

echo "📊 Verifying indexes..."
execute_cypher "SHOW INDEXES;"

echo "🧪 Running test queries..."

# Test basic functionality
execute_cypher "MATCH (n) RETURN count(n) as total_nodes;"

# Create a sample family for testing (if no data exists)
execute_cypher "
MERGE (f:Family {
    family_id: 'FAM_TEST_001',
    family_name: 'Test Family',
    primary_surname: 'TestSurname',
    city: 'TestCity',
    state: 'TestState',
    caste: 'TestCaste',
    trust_score: 7.5,
    verification_status: 'VERIFIED',
    active_status: 'ACTIVE',
    created_at: datetime()
})
RETURN f.family_id as test_family_created;
"

# Create a test person
execute_cypher "
MATCH (f:Family {family_id: 'FAM_TEST_001'})
MERGE (p:Person {
    person_id: 'PER_TEST_001',
    family_id: 'FAM_TEST_001',
    first_name: 'Test',
    last_name: 'Person',
    gender: 'Male',
    age: 28,
    marital_status: 'SINGLE',
    eligible_for_marriage: true,
    highest_degree: 'Graduate',
    industry: 'Technology',
    annual_income: 1000000,
    height: 175
})
CREATE (p)-[:BELONGS_TO {role: 'SON', primary_member: true}]->(f)
RETURN p.person_id as test_person_created;
"

echo "✅ Neo4j setup completed successfully!"
echo ""
echo "📝 Connection Details:"
echo "   URI: $NEO4J_URI"
echo "   Username: $NEO4J_USER"
echo "   Password: $NEO4J_PASSWORD"
echo "   Browser: http://localhost:7474"
echo ""
echo "🎯 Next Steps:"
echo "   1. Start your Go application: go run main.go"
echo "   2. Seed test data: go run cmd/seed/main.go -families 1000"
echo "   3. Test API: curl http://localhost:8080/health"
echo ""
echo "🔗 Useful Commands:"
echo "   - View logs: docker logs neo4j-matrimony"
echo "   - Cypher shell: docker exec -it neo4j-matrimony cypher-shell -u $NEO4J_USER -p $NEO4J_PASSWORD"
echo "   - Stop: docker-compose down"
echo ""