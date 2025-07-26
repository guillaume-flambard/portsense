'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { containers as Container } from '@/lib/generated/prisma'

export interface ContainerUpdate {
  container: Partial<Container>
  previousStatus: string
  newStatus: string
  changeType: 'location' | 'status' | 'delay' | 'risk'
  timestamp: string
}

export interface StreamMessage {
  type: 'connection' | 'container_update' | 'heartbeat'
  message?: string
  timestamp: string
  userId?: string
  data?: ContainerUpdate
}

export function useContainerStream() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<ContainerUpdate | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [updateCount, setUpdateCount] = useState(0)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return // Already connected
    }

    try {
      setConnectionError(null)
      const eventSource = new EventSource('/api/containers/stream')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('Container stream connected')
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttempts.current = 0
      }

      eventSource.onmessage = (event) => {
        try {
          const message: StreamMessage = JSON.parse(event.data)
          
          switch (message.type) {
            case 'connection':
              console.log('Container stream connection confirmed:', message.message)
              break
              
            case 'container_update':
              if (message.data) {
                setLastUpdate(message.data)
                setUpdateCount(prev => prev + 1)
                console.log('Container update received:', message.data)
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
        console.error('Container stream error:', error)
        setIsConnected(false)
        
        if (eventSource.readyState === EventSource.CLOSED) {
          setConnectionError('Connection closed by server')
          
          // Attempt to reconnect with exponential backoff
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.pow(2, reconnectAttempts.current) * 1000 // 1s, 2s, 4s, 8s, 16s
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++
              console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`)
              connect()
            }, delay)
          } else {
            setConnectionError('Failed to reconnect after multiple attempts')
          }
        }
      }

    } catch (error) {
      console.error('Failed to create EventSource:', error)
      setConnectionError('Failed to establish connection')
    }
  }, [])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    setIsConnected(false)
    reconnectAttempts.current = 0
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(connect, 1000) // Wait 1 second before reconnecting
  }, [connect, disconnect])

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
    isConnected,
    lastUpdate,
    connectionError,
    updateCount,
    connect,
    disconnect,
    reconnect
  }
}