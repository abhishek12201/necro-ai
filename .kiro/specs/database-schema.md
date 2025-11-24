# Necro AI - Database Schema

## Tables

### projects
Stores uploaded legacy codebases

- id: UUID (primary key)
- name: VARCHAR(255)
- description: TEXT
- repo_url: TEXT
- created_at: TIMESTAMP
- status: VARCHAR(50) - 'analyzing', 'completed', 'failed'
- language: VARCHAR(100)
- framework: VARCHAR(100)
- total_files: INT
- total_lines: INT

### analyses
Stores AI analysis results

- id: UUID (primary key)
- project_id: UUID (foreign key)
- analysis_type: VARCHAR(100)
- results: JSONB
- created_at: TIMESTAMP

### dependencies
Stores dependency data

- id: UUID (primary key)
- project_id: UUID (foreign key)
- package_name: VARCHAR(255)
- version: VARCHAR(100)
- is_outdated: BOOLEAN
- modern_alternative: VARCHAR(255)

### migration_plans
Stores AI-generated migration roadmaps

- id: UUID (primary key)
- project_id: UUID (foreign key)
- plan_data: JSONB
- estimated_hours: INT
- risk_score: INT

### code_transformations
Stores before/after code examples

- id: UUID (primary key)
- project_id: UUID (foreign key)
- file_path: TEXT
- original_code: TEXT
- modernized_code: TEXT
- transformation_type: VARCHAR(100)
