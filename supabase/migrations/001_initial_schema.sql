-- Necro AI Database Schema

CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  repo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'analyzing',
  language VARCHAR(100),
  framework VARCHAR(100),
  total_files INT DEFAULT 0,
  total_lines INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  analysis_type VARCHAR(100),
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dependencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  package_name VARCHAR(255) NOT NULL,
  version VARCHAR(100),
  is_outdated BOOLEAN DEFAULT FALSE,
  modern_alternative VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS migration_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  estimated_hours INT,
  risk_score INT
);

CREATE TABLE IF NOT EXISTS code_transformations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  original_code TEXT NOT NULL,
  modernized_code TEXT NOT NULL,
  transformation_type VARCHAR(100)
);

-- Indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_analyses_project_id ON analyses(project_id);
CREATE INDEX idx_dependencies_project_id ON dependencies(project_id);

-- Disable RLS for hackathon demo
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE dependencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE migration_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE code_transformations DISABLE ROW LEVEL SECURITY;
