'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bell, X, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Alert {
  id: string
  title: string
  message: string
  severity: string
  alert_type: string
  created_at: string
  container_id?: string
}

interface AlertNotificationsProps {
  userId?: string
}

export function AlertNotifications({ userId }: AlertNotificationsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!userId) return

    // Set up SSE connection for real-time alerts
    const eventSource = new EventSource(`/api/alerts/stream?userId=${userId}`)

    eventSource.onopen = () => {
      setIsConnected(true)
      console.log('✅ Alert notifications connected')
    }

    eventSource.onmessage = (event) => {
      try {
        const alertData = JSON.parse(event.data)
        
        if (alertData.type === 'new_alert') {
          const newAlert = alertData.alert
          setAlerts(prev => [newAlert, ...prev.slice(0, 4)]) // Keep only 5 most recent
          
          // Show toast notification
          showAlertToast(newAlert)
        }
      } catch (error) {
        console.error('Error parsing alert data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Alert notification connection error:', error)
      setIsConnected(false)
    }

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [userId])

  const showAlertToast = (alert: Alert) => {
    const icon = getSeverityIcon(alert.severity)
    const severity = alert.severity.toLowerCase()
    
    toast(alert.title, {
      description: alert.message,
      icon: icon,
      duration: severity === 'high' ? 10000 : 5000,
      action: {
        label: 'View',
        onClick: () => {
          // Navigate to alert details or container
          if (alert.container_id) {
            window.open(`/dashboard/containers/${alert.container_id}`, '_blank')
          }
        }
      }
    })
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      })
      dismissAlert(alertId)
      toast.success('Alert acknowledged')
    } catch (error) {
      console.error('Error acknowledging alert:', error)
      toast.error('Failed to acknowledge alert')
    }
  }

  if (!isConnected && alerts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {/* Connection status indicator */}
      {userId && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm p-2 rounded-md border">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {isConnected ? 'Live alerts active' : 'Alert connection lost'}
        </div>
      )}

      {/* Alert notifications */}
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4 animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getSeverityIcon(alert.severity)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">
                  {alert.title}
                </h4>
                <Badge variant="outline" className={`text-xs ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {alert.message}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(alert.created_at).toLocaleTimeString()}
                </span>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="h-6 px-2 text-xs"
                  >
                    Acknowledge
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissAlert(alert.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}