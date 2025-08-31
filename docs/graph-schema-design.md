# Graph Schema Design for Family Connector Matrimony Platform

## 1. Core Entity Design

### Node Types

#### Family Node
```cypher
CREATE CONSTRAINT family_id FOR (f:Family) REQUIRE f.family_id IS UNIQUE;

(:Family {
  family_id: "FAM_001",
  family_name: "Sharma Family",
  primary_surname: "Sharma",
  location: {
    city: "Mumbai",
    state: "Maharashtra", 
    country: "India",
    coordinates: [19.0760, 72.8777]
  },
  community: {
    caste: "Brahmin",
    sub_caste: "Kashmiri Pandit",
    religion: "Hindu",
    language: ["Hindi", "Kashmiri"]
  },
  contact_info: {
    primary_phone: "+91-XXXXXXXXXX",
    email: "sharma.family@example.com",
    address: "Mumbai, Maharashtra"
  },
  verification: {
    status: "VERIFIED",
    verified_by: "community_leader",
    verification_date: "2024-01-15"
  },
  trust_score: 8.5,
  privacy_settings: {
    profile_visibility: "NETWORK_ONLY",
    contact_sharing: "MUTUAL_CONNECTIONS"
  },
  created_at: "2024-01-10T10:00:00Z",
  updated_at: "2024-01-15T15:30:00Z",
  active_status: "ACTIVE"
})
```

#### Person Node
```cypher
CREATE CONSTRAINT person_id FOR (p:Person) REQUIRE p.person_id IS UNIQUE;

(:Person {
  person_id: "PER_001",
  family_id: "FAM_001",
  first_name: "Rahul",
  last_name: "Sharma",
  gender: "Male",
  date_of_birth: "1995-03-15",
  age: 29,
  marital_status: "SINGLE",
  eligible_for_marriage: true,
  education: {
    highest_degree: "MBA",
    institution: "IIM Bangalore",
    field_of_study: "Finance",
    graduation_year: 2020
  },
  profession: {
    job_title: "Senior Analyst",
    company: "Goldman Sachs",
    industry: "Investment Banking",
    experience_years: 4,
    annual_income: 2500000
  },
  physical_attributes: {
    height: 175,
    complexion: "Fair",
    body_type: "Athletic"
  },
  preferences: {
    preferred_age_range: [24, 30],
    preferred_education: ["Graduate", "Post-Graduate"],
    preferred_profession: ["Finance", "Technology", "Medicine"],
    preferred_location: ["Mumbai", "Delhi", "Bangalore"]
  },
  hobbies: ["Reading", "Cricket", "Traveling"],
  profile_visibility: "NETWORK_VISIBLE",
  created_at: "2024-01-10T10:00:00Z",
  updated_at: "2024-01-15T15:30:00Z"
})
```

### Relationship Types

#### 1. FAMILY_RELATION
```cypher
CREATE (:Family {family_id: "FAM_001"})-[:FAMILY_RELATION {
  relation_type: "RELATIVE",
  specific_relation: "MATERNAL_UNCLE", // PATERNAL_UNCLE, COUSIN, etc.
  degree: 2,
  verified: true,
  verified_by: "both_families",
  strength: 0.8, // Connection strength 0-1
  established_date: "2024-01-10",
  mutual_events: ["wedding_2023", "festival_2024"],
  notes: "Close family friends for 20+ years"
}]-(:Family {family_id: "FAM_002"})
```

#### 2. COMMUNITY_RELATION  
```cypher
CREATE (:Family {family_id: "FAM_001"})-[:COMMUNITY_RELATION {
  relation_type: "CASTE_COMMUNITY",
  community_name: "Kashmiri Pandit Association Mumbai",
  verified: true,
  strength: 0.6,
  established_date: "2024-01-10",
  shared_events: ["community_gathering_2024"],
  notes: "Active members of same community organization"
}]-(:Family {family_id: "FAM_003"})
```

#### 3. SOCIAL_RELATION
```cypher
CREATE (:Family {family_id: "FAM_001"})-[:SOCIAL_RELATION {
  relation_type: "FAMILY_FRIEND",
  context: "WORKPLACE_CONNECTION", // NEIGHBOR, SCHOOL_FRIEND, etc.
  verified: true,
  strength: 0.7,
  established_date: "2024-01-10",
  duration_years: 5,
  mutual_friends: 3,
  notes: "Families became friends through workplace"
}]-(:Family {family_id: "FAM_004"})
```

#### 4. BELONGS_TO (Person to Family)
```cypher
CREATE (:Person {person_id: "PER_001"})-[:BELONGS_TO {
  role: "SON",
  primary_member: true,
  added_date: "2024-01-10"
}]-(:Family {family_id: "FAM_001"})
```

#### 5. INTRODUCED_BY (Connection facilitation)
```cypher
CREATE (:Family {family_id: "FAM_001"})-[:INTRODUCED_BY {
  introducer_family: "FAM_005",
  introduction_date: "2024-02-01",
  context: "MARRIAGE_PROPOSAL",
  status: "ACTIVE",
  notes: "Introduction made for marriage discussion"
}]-(:Family {family_id: "FAM_002"})
```

## 2. Advanced Schema Features

### Trust Score Calculation Nodes
```cypher
(:TrustScore {
  family_id: "FAM_001",
  overall_score: 8.5,
  components: {
    network_density: 7.8,
    verification_level: 9.2,
    community_standing: 8.1,
    mutual_connections: 8.8,
    longevity: 7.5
  },
  calculated_at: "2024-01-15T10:00:00Z",
  valid_until: "2024-04-15T10:00:00Z"
})
```

### Connection Path Cache
```cypher
(:ConnectionPath {
  from_family: "FAM_001",
  to_family: "FAM_100",
  degree: 2,
  path: ["FAM_001", "FAM_050", "FAM_100"],
  path_strength: 0.65,
  calculated_at: "2024-01-15T10:00:00Z",
  expires_at: "2024-01-16T10:00:00Z" // Cache for 24 hours
})
```

## 3. Indexing Strategy

### Primary Indexes
```cypher
// Core entity lookups
CREATE INDEX family_location FOR (f:Family) ON (f.location.city, f.location.state);
CREATE INDEX family_community FOR (f:Family) ON (f.community.caste, f.community.sub_caste);
CREATE INDEX family_trust_score FOR (f:Family) ON (f.trust_score);

// Person search indexes
CREATE INDEX person_eligibility FOR (p:Person) ON (p.eligible_for_marriage, p.marital_status);
CREATE INDEX person_age_gender FOR (p:Person) ON (p.age, p.gender);
CREATE INDEX person_education FOR (p:Person) ON (p.education.highest_degree);
CREATE INDEX person_profession FOR (p:Person) ON (p.profession.industry);

// Relationship indexes
CREATE INDEX relation_type FOR ()-[r:FAMILY_RELATION]-() ON (r.relation_type, r.degree);
CREATE INDEX relation_strength FOR ()-[r]-() ON (r.strength);
CREATE INDEX community_relation FOR ()-[r:COMMUNITY_RELATION]-() ON (r.community_name);
```

### Composite Indexes for Common Queries
```cypher
// Multi-criteria person search
CREATE INDEX person_search_criteria FOR (p:Person) ON (
  p.gender, 
  p.age, 
  p.marital_status, 
  p.eligible_for_marriage,
  p.education.highest_degree,
  p.profession.industry
);

// Geographic and community search
CREATE INDEX family_location_community FOR (f:Family) ON (
  f.location.city,
  f.community.caste,
  f.trust_score
);
```

## 4. Query Patterns

### Find Eligible Matches Within Network
```cypher
MATCH (seeker:Person {person_id: "PER_001"})-[:BELONGS_TO]-(seekerFamily:Family)
MATCH (seekerFamily)-[r1*1..3]-(connectedFamily:Family)
MATCH (connectedFamily)-[:BELONGS_TO]-(candidate:Person)
WHERE candidate.eligible_for_marriage = true
  AND candidate.gender <> seeker.gender
  AND candidate.age >= seeker.preferences.preferred_age_range[0]
  AND candidate.age <= seeker.preferences.preferred_age_range[1]
  AND candidate.education.highest_degree IN seeker.preferences.preferred_education
WITH seeker, candidate, connectedFamily, LENGTH([r IN r1 WHERE r.verified = true]) as verified_hops
WHERE verified_hops = LENGTH(r1) // All connections must be verified
RETURN candidate, connectedFamily, 
       LENGTH(r1) as degree_of_separation,
       connectedFamily.trust_score as family_trust_score
ORDER BY degree_of_separation ASC, family_trust_score DESC
LIMIT 20;
```

### Calculate Connection Path
```cypher
MATCH path = shortestPath((family1:Family {family_id: "FAM_001"})-[*1..4]-(family2:Family {family_id: "FAM_100"}))
WHERE ALL(r IN relationships(path) WHERE r.verified = true)
WITH path, reduce(strength = 1.0, r IN relationships(path) | strength * r.strength) as path_strength
RETURN nodes(path) as connection_path, 
       LENGTH(path) as degree,
       path_strength,
       [r IN relationships(path) | r.relation_type] as relation_types;
```

### Trust Score Calculation
```cypher
MATCH (family:Family {family_id: "FAM_001"})
OPTIONAL MATCH (family)-[r]-(connected:Family)
WHERE r.verified = true
WITH family, 
     COUNT(connected) as total_connections,
     AVG(r.strength) as avg_connection_strength,
     COUNT(CASE WHEN r.relation_type = "RELATIVE" THEN 1 END) as relative_connections,
     COUNT(CASE WHEN r.relation_type = "COMMUNITY" THEN 1 END) as community_connections
RETURN family.family_id,
       (total_connections * 0.3 + 
        avg_connection_strength * 0.4 + 
        (relative_connections * 2 + community_connections) * 0.3) as calculated_trust_score;
```

## 5. Performance Optimization Strategies

### Connection Degree Limitation
```cypher
// Limit search to 3 degrees for performance
MATCH (family1)-[*1..3]-(family2)
WHERE id(family1) < id(family2) // Avoid duplicate paths
```

### Materialized Views for Common Patterns
```cypher
// Pre-calculate 2nd degree connections for faster lookups
CREATE (f1:Family)-[:SECOND_DEGREE_CONNECTION {
  calculated_at: datetime(),
  path_strength: 0.65,
  common_connections: 3
}]-(f2:Family)
```

### Query Hints for Large Graph Traversals
```cypher
// Use index hints for better performance
MATCH (f:Family)
USING INDEX f:Family(location.city)
WHERE f.location.city = "Mumbai"
```

## 6. Schema Evolution Strategy

### Version Control for Schema Changes
```cypher
(:SchemaVersion {
  version: "1.0.0",
  applied_at: "2024-01-10T10:00:00Z",
  changes: ["Initial schema creation"],
  backward_compatible: true
})
```

### Migration Scripts
```cypher
// Example migration for adding new relationship properties
MATCH ()-[r:FAMILY_RELATION]-()
WHERE NOT EXISTS(r.strength)
SET r.strength = 0.5; // Default strength value
```

This schema design provides a robust foundation for handling millions of family nodes with efficient querying capabilities for 1st, 2nd, and 3rd degree connections while maintaining data integrity and performance.