import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export type Project = {
  id: string
  name: string
  description?: string
  repo_url?: string
  created_at: string
  status: 'analyzing' | 'completed' | 'failed'
  language?: string
  framework?: string
  total_files: number
  total_lines: number
}

export type Analysis = {
  id: string
  project_id: string
  analysis_type: string
  results: any
  created_at: string
}

export type Dependency = {
  id: string
  project_id: string
  package_name: string
  version?: string
  is_outdated: boolean
  modern_alternative?: string
}
