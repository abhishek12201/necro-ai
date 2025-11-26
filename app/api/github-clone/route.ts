import { NextRequest, NextResponse } from 'next/server'
import simpleGit from 'simple-git'
import { supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repoUrl, projectName } = body

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      )
    }

    // Create project in database
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectName || 'GitHub Repository',
        repo_url: repoUrl,
        status: 'analyzing'
      })
      .select()
      .single()

    if (projectError) throw projectError

    // Clone repository to temp directory
    const tmpDir = path.join(process.cwd(), 'tmp', project.id)
    
    // Ensure tmp directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'tmp'))
    }

    const git = simpleGit()
    
    try {
      await git.clone(repoUrl, tmpDir)
    } catch (cloneError) {
      throw new Error('Failed to clone repository. Check URL and permissions.')
    }

    // Get all files in repo
    const files = getAllFiles(tmpDir)
    
    // Filter code files only (ignore node_modules, .git, etc)
    const codeFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.php', '.py', '.java', '.rb', '.go']
      return validExtensions.includes(ext) && 
             !file.includes('node_modules') && 
             !file.includes('.git')
    }).slice(0, 50) // Limit to 50 files for demo

    // Update project with file count
    await supabase
      .from('projects')
      .update({ 
        total_files: codeFiles.length,
        total_lines: 0 // Will calculate later
      })
      .eq('id', project.id)

    return NextResponse.json({
      success: true,
      projectId: project.id,
      filesFound: codeFiles.length,
      files: codeFiles.map(f => path.relative(tmpDir, f))
    })

  } catch (error: any) {
    console.error('Clone error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to clone repository' },
      { status: 500 }
    )
  }
}

// Helper function to recursively get all files
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath)

  files.forEach(file => {
    const filePath = path.join(dirPath, file)
    
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles)
    } else {
      arrayOfFiles.push(filePath)
    }
  })

  return arrayOfFiles
}
