import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { analyzeCodeWithAI, generateMigrationPlan } from '@/lib/ai-analysis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, code, filename } = body

    if (!projectId || !code) {
      return NextResponse.json(
        { error: 'Project ID and code are required' },
        { status: 400 }
      )
    }

    // Run AI analysis
    const analysis = await analyzeCodeWithAI(code, filename || 'unknown')

    // Store analysis results
    const { data: analysisRecord, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        project_id: projectId,
        analysis_type: 'code_analysis',
        results: analysis
      })
      .select()
      .single()

    if (analysisError) throw analysisError

    // Generate migration plan
    const migrationPlan = await generateMigrationPlan(analysis)

    // Store migration plan
    await supabase
      .from('migration_plans')
      .insert({
        project_id: projectId,
        plan_data: migrationPlan,
        estimated_hours: migrationPlan.totalHours || 0,
        risk_score: migrationPlan.riskScore || 5
      })

    // Update project status
    await supabase
      .from('projects')
      .update({ status: 'completed' })
      .eq('id', projectId)

    return NextResponse.json({
      success: true,
      analysis,
      migrationPlan
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}
