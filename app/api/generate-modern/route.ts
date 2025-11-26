import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId } = body

    // Load legacy files from /tmp/{projectId}
    const tmpDir = path.join(process.cwd(), 'tmp', projectId)
    const files = getAllFiles(tmpDir)
    const codeFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      const valid = ['.js', '.jsx', '.ts', '.tsx', '.php']
      return valid.includes(ext)
    })

    for (const file of codeFiles) {
      const code = fs.readFileSync(file, 'utf-8')
      const filename = path.relative(tmpDir, file)
      const prompt = `Convert the following legacy code to a modern best-practice equivalent. 
Only return code, no explanation. Filename: ${filename}

CODE:
${code}`

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      const result = await model.generateContent(prompt)
      const modern = (await result.response).text()

      // Store transformation
      await supabase.from('code_transformations').insert({
        project_id: projectId,
        file_path: filename,
        original_code: code,
        modernized_code: modern
      })
    }

    return NextResponse.json({ success: true, files: codeFiles.length })

  } catch (error: any) {
    console.error('Modernization error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath)
  for (const file of files) {
    const filePath = path.join(dirPath, file)
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles)
    } else {
      arrayOfFiles.push(filePath)
    }
  }
  return arrayOfFiles
}
