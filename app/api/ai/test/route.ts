import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { AIService } from '@/lib/ai/ai-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider } = await request.json()

    // Test data for AI providers
    const testContainer = {
      container_id: 'TEST1234567',
      status: 'In Transit',
      current_location: 'Port of Singapore',
      origin_port: 'Shanghai',
      destination_port: 'Rotterdam',
      delay_hours: 6,
      carrier: 'Test Carrier',
      issues: ['Weather delay'],
    }

    const startTime = Date.now()
    
    try {
      const summary = await AIService.generateStatusSummary(testContainer, provider)
      const endTime = Date.now()
      
      return NextResponse.json({
        success: true,
        provider,
        summary,
        responseTime: endTime - startTime,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      })
    }
  } catch (error) {
    console.error('AI test endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
