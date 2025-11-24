import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, repoUrl } = body

    // Basic validation
    if (!name || !repoUrl) {
      return NextResponse.json(
        { error: 'Name and repository URL are required' },
        { status: 400 }
      )
    }

    // Create project in database
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        repo_url: repoUrl,
        status: 'analyzing'
      })
      .select()
      .single()

    if (error) throw error

    // Return project ID for tracking
    return NextResponse.json({ 
      success: true,
      projectId: project.id,
      message: 'Project created successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
