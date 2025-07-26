'use client'

import { useState, useEffect } from 'react'
import { useContainerStream, ContainerUpdate } from '@/hooks/use-container-stream'
import { toast } from 'sonner'
import { Bell, Wifi, WifiOff, Container, MapPin, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RealTimeNotificationsProps {
  showConnectionStatus?: boolean
  showNotificationHistory?: boolean
}

export function RealTimeNotifications({ 
  showConnectionStatus = true, 
  showNotificationHistory = false 
}: RealTimeNotificationsProps) {
  const { 
    isConnected, 
    lastUpdate, 
    connectionError, 
    updateCount, 
    reconnect 
  } = useContainerStream()
  
  const [notifications, setNotifications] = useState<ContainerUpdate[]>([])
  const [isEnabled, setIsEnabled] = useState(true)

  // Handle new updates
  useEffect(() => {
    if (lastUpdate && isEnabled) {
      // Add to notification history
      setNotifications(prev => [lastUpdate, ...prev.slice(0, 9)]) // Keep last 10

      // Show toast notification based on change type
      const container = lastUpdate.container
      const changeType = lastUpdate.changeType

      switch (changeType) {
        case 'location':
          toast.info(`📍 Location Update`, {
            description: `${container.container_id} is now at ${container.current_location}`,
            action: {
              label: 'View',
              onClick: () => window.open(`/dashboard/containers/${container.id}`, '_blank')
            }
          })
          break

        case 'status':
          const isGoodStatus = ['Delivered', 'At destination'].includes(lastUpdate.newStatus)
          const isBadStatus = ['Delayed', 'Lost'].includes(lastUpdate.newStatus)
          
          if (isGoodStatus) {
            toast.success(`✅ Status Update`, {
              description: `${container.container_id} is now ${lastUpdate.newStatus}`,
            })
          } else if (isBadStatus) {
            toast.error(`❌ Status Alert`, {
              description: `${container.container_id} is now ${lastUpdate.newStatus}`,
            })
          } else {
            toast.info(`🔄 Status Update`, {
              description: `${container.container_id} is now ${lastUpdate.newStatus}`,
            })
          }
          break

        case 'delay':
          if (container.delay_hours && container.delay_hours > 0) {
            toast.warning(`⏰ Delay Alert`, {
              description: `${container.container_id} is delayed by ${container.delay_hours} hours`,
            })
          }
          break

        case 'risk':
          if (container.risk_level === 'High') {
            toast.error(`⚠️ High Risk Alert`, {
              description: `${container.container_id} has been marked as high risk`,
            })
          } else if (container.risk_level === 'Medium') {
            toast.warning(`⚠️ Medium Risk Alert`, {
              description: `${container.container_id} risk level increased to medium`,
            })
          }
          break
      }
    }
  }, [lastUpdate, isEnabled])

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'location': return <MapPin className="h-4 w-4" />
      case 'status': return <Container className="h-4 w-4" />
      case 'delay': return <Clock className="h-4 w-4" />
      case 'risk': return <AlertTriangle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getChangeColor = (changeType: string, container: { status?: string; risk_level?: string | null }) => {
    switch (changeType) {
      case 'location': return 'bg-blue-100 text-blue-800'
      case 'status': 
        if (container.status && ['Delivered', 'At destination'].includes(container.status)) return 'bg-green-100 text-green-800'
        if (container.status && ['Delayed', 'Lost'].includes(container.status)) return 'bg-red-100 text-red-800'
        return 'bg-gray-100 text-gray-800'
      case 'delay': return 'bg-orange-100 text-orange-800'
      case 'risk': 
        if (container.risk_level === 'High') return 'bg-red-100 text-red-800'
        return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!showConnectionStatus && !showNotificationHistory) {
    return null // Component is invisible but still handles notifications
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      {showConnectionStatus && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              Real-time Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={isConnected ? 'default' : 'destructive'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                  {updateCount > 0 && (
                    <Badge variant="secondary">
                      {updateCount} updates
                    </Badge>
                  )}
                </div>
                {connectionError && (
                  <p className="text-sm text-red-600">{connectionError}</p>
                )}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEnabled(!isEnabled)}
                  >
                    {isEnabled ? 'Disable' : 'Enable'} Notifications
                  </Button>
                  {!isConnected && (
                    <Button variant="outline" size="sm" onClick={reconnect}>
                      Reconnect
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification History */}
      {showNotificationHistory && notifications.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className={`p-2 rounded-full ${getChangeColor(notification.changeType, notification.container)}`}>
                    {getChangeIcon(notification.changeType)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {notification.container.container_id}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {notification.changeType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.changeType === 'location' && 
                        `Now at ${notification.container.current_location}`}
                      {notification.changeType === 'status' && 
                        `Status changed to ${notification.newStatus}`}
                      {notification.changeType === 'delay' && 
                        `Delayed by ${notification.container.delay_hours} hours`}
                      {notification.changeType === 'risk' && 
                        `Risk level: ${notification.container.risk_level}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}