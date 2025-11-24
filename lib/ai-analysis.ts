import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function analyzeCodeWithAI(code: string, filename: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `Analyze this legacy code file and provide:
1. Language/framework detected
2. Outdated patterns found
3. Modern alternative recommendations
4. Migration complexity (1-10 scale)
5. Specific modernization suggestions

Filename: ${filename}

Code:
${code}

Respond in JSON format.
`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function generateMigrationPlan(analysis: any) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `Based on this code analysis, create a step-by-step migration roadmap:

Analysis: ${JSON.stringify(analysis)}

Provide a detailed migration plan with:
1. Steps in order
2. Estimated hours per step
3. Risk level (low/medium/high)
4. Required tools/libraries
5. Potential issues to watch for

Respond in JSON format with array of steps.
`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}
