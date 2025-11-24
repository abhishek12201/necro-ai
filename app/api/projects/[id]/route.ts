import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError) throw projectError

    // Get analyses
    const { data: analyses } = await supabase
      .from('analyses')
      .select('*')
      .eq('project_id', projectId)

    // Get migration plan
    const { data: migrationPlan } = await supabase
      .from('migration_plans')
      .select('*')
      .eq('project_id', projectId)
      .single()

    // Get dependencies
    const { data: dependencies } = await supabase
      .from('dependencies')
      .select('*')
      .eq('project_id', projectId)

    return NextResponse.json({
      project,
      analyses: analyses || [],
      migrationPlan: migrationPlan || null,
      dependencies: dependencies || []
    })

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project data' },
      { status: 500 }
    )
  }
}
