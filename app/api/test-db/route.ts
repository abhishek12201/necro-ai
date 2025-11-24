import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected successfully' 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Database connection failed' 
    }, { status: 500 })
  }
}
