import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { RealTimeContainerService, ContainerStatusChange } from '@/lib/services/real-time-container-service'

// Force dynamic runtime for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Create SSE stream
    const encoder = new TextEncoder()
    
    const customReadable = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const connectionData = `data: ${JSON.stringify({
          type: 'connection',
          message: 'Connected to container updates stream',
          timestamp: new Date().toISOString(),
          userId: user.id
        })}\n\n`
        
        controller.enqueue(encoder.encode(connectionData))

        // Subscribe to container updates
        const unsubscribe = RealTimeContainerService.addUpdateListener((change: ContainerStatusChange) => {
          // Only send updates for containers owned by this user
          if (change.container.user_id === user.id) {
            const updateData = `data: ${JSON.stringify({
              type: 'container_update',
              data: {
                container: {
                  id: change.container.id,
                  container_id: change.container.container_id,
                  status: change.container.status,
                  current_location: change.container.current_location,
                  latitude: change.container.latitude,
                  longitude: change.container.longitude,
                  delay_hours: change.container.delay_hours,
                  risk_level: change.container.risk_level,
                  last_updated: change.container.last_updated,
                  eta: change.container.eta
                },
                previousStatus: change.previousStatus,
                newStatus: change.newStatus,
                changeType: change.changeType,
                timestamp: change.timestamp
              }
            })}\n\n`
            
            try {
              controller.enqueue(encoder.encode(updateData))
            } catch (error) {
              console.error('Error sending SSE update:', error)
            }
          }
        })

        // Send periodic heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
          try {
            const heartbeat = `data: ${JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            })}\n\n`
            
            controller.enqueue(encoder.encode(heartbeat))
          } catch (error) {
            console.error('Error sending heartbeat:', error)
            clearInterval(heartbeatInterval)
          }
        }, 30000) // Every 30 seconds

        // Clean up on connection close
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval)
          unsubscribe()
          try {
            controller.close()
          } catch (error) {
            console.error('Error closing SSE stream:', error)
          }
        })
      }
    })

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })

  } catch (error) {
    console.error('SSE stream error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}