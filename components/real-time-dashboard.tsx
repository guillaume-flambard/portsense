'use client'

import { useState, useEffect } from 'react'
import { useContainerStream } from '@/hooks/use-container-stream'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Container, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  Truck,
  Ship,
  Package
} from 'lucide-react'

interface ContainerSummary {
  total: number
  inTransit: number
  delayed: number
  highRisk: number
  activeAlerts: number
  recentUpdates: Array<{
    id: string
    container_id: string
    status: string
    current_location: string | null
    delay_hours: number
    risk_level: string | null
    last_updated: string | null
    alerts: number
  }>
}

export function RealTimeDashboard() {
  const { isConnected, lastUpdate, updateCount } = useContainerStream()
  const [summary, setSummary] = useState<ContainerSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Fetch initial summary
  const fetchSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/containers/bulk-update')
      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch container summary:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchSummary()
  }, [])

  // Update summary when real-time updates come in
  useEffect(() => {
    if (lastUpdate && summary) {
      // Refresh summary to get latest data
      fetchSummary()
    }
  }, [lastUpdate, summary]) // Add summary as dependency

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'at destination':
        return 'bg-green-100 text-green-800'
      case 'in transit':
        return 'bg-blue-100 text-blue-800'
      case 'delayed':
        return 'bg-red-100 text-red-800'
      case 'loading':
      case 'unloading':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Unable to load container summary
          </p>
          <Button onClick={fetchSummary} className="mt-4 w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with real-time status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Container Overview</h2>
          <p className="text-muted-foreground">
            Real-time tracking and monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Live' : 'Offline'}
            </span>
            {updateCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {updateCount} updates
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSummary}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Containers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">
              Active shipments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.inTransit}</div>
            <p className="text-xs text-muted-foreground">
              Currently moving
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.delayed}</div>
            <p className="text-xs text-muted-foreground">
              Behind schedule
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Updates
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest container status changes
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.recentUpdates.length > 0 ? (
              summary.recentUpdates.map((container) => (
                <div
                  key={container.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Container className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{container.container_id}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(container.status)}>
                          {container.status}
                        </Badge>
                        {container.risk_level && (
                          <Badge variant="outline" className={getRiskColor(container.risk_level)}>
                            {container.risk_level} Risk
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {container.current_location || 'Unknown'}
                    </div>
                    {container.delay_hours > 0 && (
                      <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                        <Clock className="h-3 w-3" />
                        {container.delay_hours}h delayed
                      </div>
                    )}
                    {container.alerts > 0 && (
                      <div className="flex items-center gap-1 text-sm text-orange-600 mt-1">
                        <AlertTriangle className="h-3 w-3" />
                        {container.alerts} alerts
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No recent updates
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  )
}