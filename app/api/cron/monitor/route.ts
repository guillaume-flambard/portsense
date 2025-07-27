import { NextRequest, NextResponse } from 'next/server'
import { MonitoringService } from '@/lib/services/monitoring-service'

// Force dynamic runtime for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify that this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Starting automated monitoring cycle...')
    
    const monitoringService = new MonitoringService()
    await monitoringService.runMonitoringCycle()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Monitoring cycle completed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron monitoring job failed:', error)
    return NextResponse.json({ 
      error: 'Monitoring cycle failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also allow GET for manual triggering in development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'GET method not allowed in production' }, { status: 405 })
  }
  
  // In development, allow manual triggering without auth
  return POST(request)
}