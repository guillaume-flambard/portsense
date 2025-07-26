import { NextRequest, NextResponse } from 'next/server'
import { MonitoringService } from '@/lib/services/monitoring-service'

export async function POST(request: NextRequest) {
  // Verify this is being called by an authorized source
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.MONITORING_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const monitoringService = new MonitoringService()
    await monitoringService.runMonitoringCycle()
    
    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    console.error('Monitoring API error:', error)
    return NextResponse.json({ 
      error: 'Monitoring cycle failed' 
    }, { status: 500 })
  }
}