import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Force dynamic runtime for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 403 })
    }

    // Create SSE response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const initialMessage = {
          type: 'connection',
          message: 'Alert stream connected',
          timestamp: new Date().toISOString()
        }
        
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(initialMessage)}\n\n`)
        )

        // Set up database subscription for new alerts
        const alertsSubscription = supabase
          .channel(`alerts_${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'alerts',
              filter: `user_id=eq.${userId}`
            },
            (payload) => {
              console.log('New alert received for user:', userId, payload.new)
              
              const alertMessage = {
                type: 'new_alert',
                alert: payload.new,
                timestamp: new Date().toISOString()
              }
              
              try {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(alertMessage)}\n\n`)
                )
              } catch (error) {
                console.error('Error sending alert via SSE:', error)
              }
            }
          )
          .subscribe()

        // Keep-alive ping every 30 seconds
        const keepAlive = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': ping\n\n'))
          } catch (error) {
            console.error('Keep-alive failed:', error)
            clearInterval(keepAlive)
          }
        }, 30000)

        // Clean up when connection closes
        request.signal.addEventListener('abort', () => {
          console.log('Alert stream connection closed for user:', userId)
          clearInterval(keepAlive)
          alertsSubscription.unsubscribe()
          controller.close()
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Error setting up alert stream:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}