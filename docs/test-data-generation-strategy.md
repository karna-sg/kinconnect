# Test Data Generation Strategy for Millions of Family Nodes

## 1. Data Generation Architecture

### 1.1 Scalable Data Generation Framework

```python
import random
import uuid
from dataclasses import dataclass
from typing import List, Dict, Set
import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor
import json
import csv

@dataclass
class GenerationConfig:
    """Configuration for test data generation"""
    total_families: int = 1_000_000
    avg_family_size: int = 4
    connection_probability: float = 0.003  # 0.3% chance of connection
    max_connections_per_family: int = 50
    geographic_clusters: int = 100
    community_groups: int = 200
    batch_size: int = 10_000
    output_format: str = "neo4j_csv"  # neo4j_csv, json, parquet
    
class FamilyDataGenerator:
    """High-performance family data generator"""
    
    def __init__(self, config: GenerationConfig):
        self.config = config
        self.indian_surnames = self._load_indian_surnames()
        self.indian_cities = self._load_indian_cities()
        self.castes = self._load_caste_data()
        self.professions = self._load_profession_data()
        
    def generate_families_parallel(self) -> None:
        """Generate families using parallel processing"""
        
        # Calculate batches
        num_batches = (self.config.total_families + self.config.batch_size - 1) // self.config.batch_size
        
        with ProcessPoolExecutor(max_workers=mp.cpu_count()) as executor:
            futures = []
            
            for batch_id in range(num_batches):
                start_idx = batch_id * self.config.batch_size
                end_idx = min(start_idx + self.config.batch_size, self.config.total_families)
                batch_size = end_idx - start_idx
                
                future = executor.submit(
                    self._generate_batch, 
                    batch_id, 
                    batch_size,
                    start_idx
                )
                futures.append(future)
            
            # Wait for all batches to complete
            for future in futures:
                future.result()
                
        print(f"Generated {self.config.total_families} families in {num_batches} batches")
```

### 1.2 Realistic Family Data Generation

```python
def _generate_batch(self, batch_id: int, batch_size: int, start_idx: int):
    """Generate a batch of realistic family data"""
    
    families = []
    persons = []
    
    for i in range(batch_size):
        family_id = f"FAM_{start_idx + i:08d}"
        
        # Select geographic cluster and community
        geo_cluster = random.randint(0, self.config.geographic_clusters - 1)
        community_group = random.randint(0, self.config.community_groups - 1)
        
        family = self._generate_single_family(
            family_id, 
            geo_cluster, 
            community_group
        )
        
        families.append(family)
        
        # Generate family members
        family_persons = self._generate_family_members(family_id, family)
        persons.extend(family_persons)
    
    # Save batch to files
    self._save_batch_data(batch_id, families, persons)
    
    return len(families)

def _generate_single_family(self, family_id: str, geo_cluster: int, community_group: int) -> Dict:
    """Generate realistic family with Indian cultural context"""
    
    # Select surname and corresponding cultural background
    surname_data = random.choice(self.indian_surnames)
    surname = surname_data['surname']
    likely_caste = surname_data.get('caste', 'General')
    likely_region = surname_data.get('region', 'North')
    
    # Select city based on region preference
    city_data = self._select_city_by_region(likely_region, geo_cluster)
    
    # Generate family data
    family = {
        'family_id': family_id,
        'family_name': f"{surname} Family",
        'primary_surname': surname,
        'location': {
            'city': city_data['city'],
            'state': city_data['state'],
            'region': city_data['region'],
            'coordinates': city_data['coordinates'],
            'geo_cluster': geo_cluster
        },
        'community': {
            'caste': likely_caste,
            'sub_caste': self._get_subcaste(likely_caste),
            'religion': self._get_religion_by_caste(likely_caste),
            'language': city_data['primary_language'],
            'community_group': community_group
        },
        'economic_status': self._generate_economic_status(),
        'family_size': random.randint(2, 8),
        'trust_score': round(random.uniform(3.0, 9.5), 1),
        'verification_status': random.choices(
            ['VERIFIED', 'PENDING', 'UNVERIFIED'],
            weights=[70, 20, 10]
        )[0],
        'created_at': self._random_date_last_year(),
        'active_status': 'ACTIVE'
    }
    
    return family
```

### 1.3 Family Member Generation

```python
def _generate_family_members(self, family_id: str, family: Dict) -> List[Dict]:
    """Generate realistic family members with marriage eligibility"""
    
    members = []
    family_size = family['family_size']
    surname = family['primary_surname']
    
    # Generate parents (usually 2)
    parents = self._generate_parents(family_id, surname, family)
    members.extend(parents)
    
    # Generate children
    num_children = max(0, family_size - 2)
    children = self._generate_children(
        family_id, 
        surname, 
        family, 
        num_children,
        parents
    )
    members.extend(children)
    
    return members

def _generate_children(self, family_id: str, surname: str, family: Dict, 
                      num_children: int, parents: List[Dict]) -> List[Dict]:
    """Generate children with realistic age distribution and marriage eligibility"""
    
    children = []
    current_year = 2024
    
    for i in range(num_children):
        # Age distribution: more young adults (marriage age)
        age_distribution = random.choices(
            range(5, 45),
            weights=self._get_age_weights()  # Peak at 22-28 for marriage
        )[0]
        
        birth_year = current_year - age_distribution
        
        child = {
            'person_id': f"PER_{family_id}_{i+3:02d}",
            'family_id': family_id,
            'first_name': self._generate_first_name(
                family['community']['region'],
                random.choice(['Male', 'Female'])
            ),
            'last_name': surname,
            'gender': random.choice(['Male', 'Female']),
            'age': age_distribution,
            'date_of_birth': f"{birth_year}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
            'marital_status': self._determine_marital_status(age_distribution),
            'eligible_for_marriage': self._determine_marriage_eligibility(age_distribution),
            'education': self._generate_education(age_distribution),
            'profession': self._generate_profession(age_distribution),
            'preferences': self._generate_marriage_preferences(family['community']),
            'created_at': family['created_at']
        }
        
        children.append(child)
    
    return children

def _get_age_weights(self) -> List[int]:
    """Weight distribution favoring marriage-age population"""
    weights = []
    for age in range(5, 45):
        if 22 <= age <= 32:  # Prime marriage age
            weights.append(10)
        elif 18 <= age <= 35:  # Extended marriage age
            weights.append(7)
        elif 35 <= age <= 40:  # Late marriage
            weights.append(3)
        else:  # Children and older adults
            weights.append(1)
    return weights
```

## 2. Relationship Generation Strategy

### 2.1 Realistic Connection Patterns

```python
class RelationshipGenerator:
    """Generate realistic family connections based on cultural patterns"""
    
    def __init__(self, families: List[Dict], config: GenerationConfig):
        self.families = families
        self.config = config
        self.geo_clusters = self._build_geographic_clusters()
        self.community_groups = self._build_community_groups()
        
    def generate_connections(self) -> List[Dict]:
        """Generate realistic family connections"""
        
        connections = []
        
        # 1. Generate family relationships (blood relations)
        family_relations = self._generate_family_relationships()
        connections.extend(family_relations)
        
        # 2. Generate community connections
        community_relations = self._generate_community_relationships()
        connections.extend(community_relations)
        
        # 3. Generate social connections
        social_relations = self._generate_social_relationships()
        connections.extend(social_relations)
        
        return connections
    
    def _generate_family_relationships(self) -> List[Dict]:
        """Generate blood relationships between families"""
        
        relations = []
        
        # Create family clusters (extended families)
        family_clusters = self._create_family_clusters()
        
        for cluster in family_clusters:
            # Generate relationships within cluster
            cluster_relations = self._connect_families_in_cluster(cluster)
            relations.extend(cluster_relations)
        
        return relations
    
    def _create_family_clusters(self) -> List[List[str]]:
        """Create extended family clusters with same surname/region"""
        
        # Group families by surname and region
        surname_groups = {}
        
        for family in self.families:
            key = f"{family['primary_surname']}_{family['location']['state']}"
            if key not in surname_groups:
                surname_groups[key] = []
            surname_groups[key].append(family['family_id'])
        
        clusters = []
        for surname_group in surname_groups.values():
            if len(surname_group) >= 2:
                # Create smaller clusters of 3-8 families
                while len(surname_group) >= 3:
                    cluster_size = min(random.randint(3, 8), len(surname_group))
                    cluster = random.sample(surname_group, cluster_size)
                    clusters.append(cluster)
                    
                    # Remove selected families
                    for family_id in cluster:
                        surname_group.remove(family_id)
        
        return clusters
```

### 2.2 Geographic and Cultural Connection Patterns

```python
def _generate_community_relationships(self) -> List[Dict]:
    """Generate connections based on community/caste associations"""
    
    relations = []
    
    # Group families by community
    for community_group in range(self.config.community_groups):
        group_families = [
            f for f in self.families 
            if f['community']['community_group'] == community_group
        ]
        
        if len(group_families) < 2:
            continue
            
        # Connect families within community with higher probability
        for i, family1 in enumerate(group_families):
            for family2 in group_families[i+1:]:
                
                # Higher connection probability for same caste
                base_prob = 0.001
                if family1['community']['caste'] == family2['community']['caste']:
                    base_prob = 0.005
                
                # Distance factor
                distance = self._calculate_distance(
                    family1['location']['coordinates'],
                    family2['location']['coordinates']
                )
                
                distance_factor = max(0.1, 1.0 - (distance / 2000))  # 2000km max
                
                final_prob = base_prob * distance_factor
                
                if random.random() < final_prob:
                    relation = {
                        'from_family': family1['family_id'],
                        'to_family': family2['family_id'],
                        'relation_type': 'COMMUNITY_RELATION',
                        'specific_relation': 'CASTE_COMMUNITY',
                        'verified': True,
                        'strength': round(random.uniform(0.4, 0.8), 2),
                        'established_date': self._random_date_last_5_years(),
                        'community_name': f"Community_{community_group}"
                    }
                    relations.append(relation)
    
    return relations

def _generate_social_relationships(self) -> List[Dict]:
    """Generate social connections (friends, workplace, etc.)"""
    
    relations = []
    
    for family in self.families:
        # Each family gets 5-20 social connections on average
        num_connections = min(
            random.poisson(8),  # Poisson distribution with λ=8
            self.config.max_connections_per_family
        )
        
        potential_connections = self._get_potential_social_connections(family)
        
        if len(potential_connections) < num_connections:
            num_connections = len(potential_connections)
        
        selected_connections = random.sample(potential_connections, num_connections)
        
        for target_family in selected_connections:
            relation = {
                'from_family': family['family_id'],
                'to_family': target_family['family_id'],
                'relation_type': 'SOCIAL_RELATION',
                'specific_relation': random.choice([
                    'FAMILY_FRIEND',
                    'NEIGHBOR',
                    'WORKPLACE_CONNECTION',
                    'SCHOOL_FRIEND'
                ]),
                'verified': random.choice([True, False], weights=[80, 20]),
                'strength': round(random.uniform(0.3, 0.9), 2),
                'established_date': self._random_date_last_10_years(),
                'duration_years': random.randint(1, 15)
            }
            relations.append(relation)
    
    return relations
```

## 3. Data Export and Import Strategies

### 3.1 Neo4j Bulk Import Format

```python
class Neo4jExporter:
    """Export test data in Neo4j bulk import format"""
    
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        
    def export_families(self, families: List[Dict]):
        """Export families as CSV for Neo4j import"""
        
        fieldnames = [
            'family_id:ID(Family)',
            'family_name',
            'primary_surname', 
            'city',
            'state',
            'region',
            'caste',
            'sub_caste',
            'religion',
            'language',
            'trust_score:float',
            'verification_status',
            'created_at',
            ':LABEL'
        ]
        
        with open(f"{self.output_dir}/families.csv", 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for family in families:
                row = {
                    'family_id:ID(Family)': family['family_id'],
                    'family_name': family['family_name'],
                    'primary_surname': family['primary_surname'],
                    'city': family['location']['city'],
                    'state': family['location']['state'],
                    'region': family['location']['region'],
                    'caste': family['community']['caste'],
                    'sub_caste': family['community']['sub_caste'],
                    'religion': family['community']['religion'],
                    'language': ';'.join(family['community']['language']),
                    'trust_score:float': family['trust_score'],
                    'verification_status': family['verification_status'],
                    'created_at': family['created_at'],
                    ':LABEL': 'Family'
                }
                writer.writerow(row)
    
    def export_relationships(self, relationships: List[Dict]):
        """Export relationships as CSV for Neo4j import"""
        
        fieldnames = [
            ':START_ID(Family)',
            ':END_ID(Family)',
            'relation_type',
            'specific_relation',
            'verified:boolean',
            'strength:float',
            'established_date',
            ':TYPE'
        ]
        
        with open(f"{self.output_dir}/relationships.csv", 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for rel in relationships:
                row = {
                    ':START_ID(Family)': rel['from_family'],
                    ':END_ID(Family)': rel['to_family'],
                    'relation_type': rel['relation_type'],
                    'specific_relation': rel['specific_relation'],
                    'verified:boolean': rel['verified'],
                    'strength:float': rel['strength'],
                    'established_date': rel['established_date'],
                    ':TYPE': rel['relation_type']
                }
                writer.writerow(row)
```

### 3.2 Bulk Import Script

```bash
#!/bin/bash
# Neo4j bulk import script for millions of families

NEO4J_HOME="/path/to/neo4j"
DATA_DIR="/path/to/test-data"

# Stop Neo4j if running
$NEO4J_HOME/bin/neo4j stop

# Clear existing database
rm -rf $NEO4J_HOME/data/databases/neo4j/*

# Run bulk import
$NEO4J_HOME/bin/neo4j-admin import \
    --database=neo4j \
    --nodes=Family="$DATA_DIR/families.csv" \
    --nodes=Person="$DATA_DIR/persons.csv" \
    --relationships="$DATA_DIR/relationships.csv" \
    --delimiter="," \
    --array-delimiter=";" \
    --ignore-missing-nodes=true \
    --skip-duplicate-nodes=true \
    --skip-bad-relationships=true

# Start Neo4j
$NEO4J_HOME/bin/neo4j start

echo "Bulk import completed. Database ready for testing."
```

## 4. Data Quality and Validation

### 4.1 Data Quality Checks

```python
class DataValidator:
    """Validate generated test data quality"""
    
    def validate_families(self, families: List[Dict]) -> Dict:
        """Validate family data quality"""
        
        validation_results = {
            'total_families': len(families),
            'unique_family_ids': len(set(f['family_id'] for f in families)),
            'duplicate_ids': 0,
            'geographic_distribution': {},
            'community_distribution': {},
            'trust_score_distribution': {},
            'issues': []
        }
        
        # Check for duplicates
        family_ids = [f['family_id'] for f in families]
        if len(family_ids) != len(set(family_ids)):
            validation_results['duplicate_ids'] = len(family_ids) - len(set(family_ids))
            validation_results['issues'].append("Duplicate family IDs found")
        
        # Analyze distributions
        for family in families:
            # Geographic distribution
            region = family['location']['region']
            validation_results['geographic_distribution'][region] = \
                validation_results['geographic_distribution'].get(region, 0) + 1
            
            # Community distribution
            caste = family['community']['caste']
            validation_results['community_distribution'][caste] = \
                validation_results['community_distribution'].get(caste, 0) + 1
            
            # Trust score distribution
            score_range = f"{int(family['trust_score'])}-{int(family['trust_score'])+1}"
            validation_results['trust_score_distribution'][score_range] = \
                validation_results['trust_score_distribution'].get(score_range, 0) + 1
        
        return validation_results
    
    def validate_relationships(self, relationships: List[Dict], families: List[Dict]) -> Dict:
        """Validate relationship data quality"""
        
        family_ids = set(f['family_id'] for f in families)
        
        validation_results = {
            'total_relationships': len(relationships),
            'valid_relationships': 0,
            'invalid_from_family': 0,
            'invalid_to_family': 0,
            'self_relationships': 0,
            'relationship_type_distribution': {},
            'strength_distribution': {},
            'issues': []
        }
        
        for rel in relationships:
            # Check if families exist
            if rel['from_family'] not in family_ids:
                validation_results['invalid_from_family'] += 1
                continue
                
            if rel['to_family'] not in family_ids:
                validation_results['invalid_to_family'] += 1
                continue
            
            # Check for self-relationships
            if rel['from_family'] == rel['to_family']:
                validation_results['self_relationships'] += 1
                continue
            
            validation_results['valid_relationships'] += 1
            
            # Distribution analysis
            rel_type = rel['relation_type']
            validation_results['relationship_type_distribution'][rel_type] = \
                validation_results['relationship_type_distribution'].get(rel_type, 0) + 1
            
            strength = round(rel['strength'], 1)
            validation_results['strength_distribution'][strength] = \
                validation_results['strength_distribution'].get(strength, 0) + 1
        
        return validation_results
```

## 5. Performance Testing Data Sets

### 5.1 Graduated Test Data Sets

```python
def generate_test_datasets():
    """Generate multiple dataset sizes for performance testing"""
    
    datasets = [
        {'name': 'small', 'families': 1_000, 'description': 'Development testing'},
        {'name': 'medium', 'families': 10_000, 'description': 'Integration testing'},
        {'name': 'large', 'families': 100_000, 'description': 'Load testing'},
        {'name': 'xlarge', 'families': 1_000_000, 'description': 'Stress testing'},
        {'name': 'production', 'families': 10_000_000, 'description': 'Production simulation'}
    ]
    
    for dataset in datasets:
        print(f"Generating {dataset['name']} dataset ({dataset['families']} families)...")
        
        config = GenerationConfig(
            total_families=dataset['families'],
            output_format="neo4j_csv"
        )
        
        generator = FamilyDataGenerator(config)
        generator.generate_families_parallel()
        
        print(f"Completed {dataset['name']} dataset")

# Expected generation times (8-core machine):
# Small (1K): ~10 seconds
# Medium (10K): ~1 minute  
# Large (100K): ~10 minutes
# XLarge (1M): ~2 hours
# Production (10M): ~20 hours
```

This comprehensive test data generation strategy provides realistic, scalable data for testing graph database performance with millions of family nodes while maintaining cultural authenticity and realistic relationship patterns.