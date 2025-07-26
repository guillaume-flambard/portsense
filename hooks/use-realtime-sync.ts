'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { containerKeys } from './use-containers-query'
import { containers as Container } from '@/lib/generated/prisma'
import { toast } from 'sonner'

interface ContainerUpdate {
  container: Partial<Container>
  previousStatus: string
  newStatus: string
  changeType: 'location' | 'status' | 'delay' | 'risk'
  timestamp: string
}

interface StreamMessage {
  type: 'connection' | 'container_update' | 'heartbeat'
  message?: string
  timestamp: string
  userId?: string
  data?: ContainerUpdate
}

export function useRealtimeSync() {
  const queryClient = useQueryClient()
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const handleContainerUpdate = useCallback((update: ContainerUpdate) => {
    const { container, changeType } = update
    
    if (!container.id) return

    // Update individual container cache
    queryClient.setQueryData(
      containerKeys.detail(container.id),
      (oldData: Container | undefined) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          ...container,
          last_updated: update.timestamp,
        }
      }
    )

    // Update containers list cache
    queryClient.setQueryData(
      containerKeys.lists(),
      (oldData: Container[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(c => 
          c.id === container.id 
            ? { ...c, ...container, last_updated: update.timestamp }
            : c
        )
      }
    )

    // Invalidate summary to trigger refetch
    queryClient.invalidateQueries({ queryKey: containerKeys.summary() })

    // Show notification based on change type
    showUpdateNotification(update)
  }, [queryClient])

  const showUpdateNotification = useCallback((update: ContainerUpdate) => {
    const { container, changeType, newStatus } = update

    switch (changeType) {
      case 'location':
        toast.info('📍 Location Update', {
          description: `${container.container_id} is now at ${container.current_location}`,
          action: {
            label: 'View',
            onClick: () => {
              // You can add navigation logic here
              console.log('Navigate to container', container.id)
            }
          }
        })
        break

      case 'status':
        const isGoodStatus = ['Delivered', 'At destination'].includes(newStatus)
        const isBadStatus = ['Delayed', 'Lost'].includes(newStatus)
        
        if (isGoodStatus) {
          toast.success('✅ Status Update', {
            description: `${container.container_id} is now ${newStatus}`,
          })
        } else if (isBadStatus) {
          toast.error('❌ Status Alert', {
            description: `${container.container_id} is now ${newStatus}`,
          })
        } else {
          toast.info('🔄 Status Update', {
            description: `${container.container_id} is now ${newStatus}`,
          })
        }
        break

      case 'delay':
        if (container.delay_hours && container.delay_hours > 0) {
          toast.warning('⏰ Delay Alert', {
            description: `${container.container_id} is delayed by ${container.delay_hours} hours`,
          })
        }
        break

      case 'risk':
        if (container.risk_level === 'High') {
          toast.error('⚠️ High Risk Alert', {
            description: `${container.container_id} has been marked as high risk`,
          })
        } else if (container.risk_level === 'Medium') {
          toast.warning('⚠️ Medium Risk Alert', {
            description: `${container.container_id} risk level increased to medium`,
          })
        }
        break
    }
  }, [])

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return // Already connected
    }

    try {
      const eventSource = new EventSource('/api/containers/stream')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('Real-time sync connected')
        reconnectAttempts.current = 0
      }

      eventSource.onmessage = (event) => {
        try {
          const message: StreamMessage = JSON.parse(event.data)
          
          switch (message.type) {
            case 'connection':
              console.log('Real-time sync confirmed:', message.message)
              break
              
            case 'container_update':
              if (message.data) {
                handleContainerUpdate(message.data)
              }
              break
              
            case 'heartbeat':
              // Silent heartbeat
              break
              
            default:
              console.log('Unknown message type:', message.type)
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('Real-time sync error:', error)
        
        if (eventSource.readyState === EventSource.CLOSED) {
          // Attempt to reconnect with exponential backoff
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.pow(2, reconnectAttempts.current) * 1000
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++
              console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`)
              connect()
            }, delay)
          } else {
            toast.error('Real-time connection lost', {
              description: 'Failed to reconnect after multiple attempts',
              action: {
                label: 'Retry',
                onClick: () => {
                  reconnectAttempts.current = 0
                  connect()
                }
              }
            })
          }
        }
      }

    } catch (error) {
      console.error('Failed to create EventSource:', error)
      toast.error('Failed to establish real-time connection')
    }
  }, [handleContainerUpdate])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    reconnectAttempts.current = 0
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    connect()
    
    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is now hidden, disconnect to save resources
        disconnect()
      } else {
        // Page is now visible, reconnect
        connect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [connect, disconnect])

  return {
    connect,
    disconnect,
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
  }
}