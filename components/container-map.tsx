'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useContainers } from '@/hooks/use-containers-query'
import { useRealtimeSync } from '@/hooks/use-realtime-sync'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Layers, 
  Wifi,
  WifiOff,
  RefreshCw,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react'
import { containers as Container } from '@/lib/generated/prisma'

// Dynamic import to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import('./leaflet-map').then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <RefreshCw className="h-5 w-5 animate-spin" />
        Loading interactive map...
      </div>
    </div>
  )
})

export interface MapContainer extends Container {
  // latitude and longitude are already defined in Container interface
}

interface ContainerMapProps {
  height?: string
  showControls?: boolean
  focusContainer?: string | null
  containers?: Container[]
}

export function ContainerMap({ 
  height = '600px', 
  showControls = true,
  focusContainer = null,
  containers: propContainers 
}: ContainerMapProps) {
  const [mapFilters, setMapFilters] = useState({
    showInTransit: true,
    showDelayed: true,
    showDelivered: false,
    showAll: true
  })
  const [mapView, setMapView] = useState({
    center: [51.505, -0.09] as [number, number],
    zoom: 2
  })

  const { data: queryContainers = [], isLoading, error, refetch, isRefetching } = useContainers()
  const { isConnected } = useRealtimeSync()

  // Use prop containers if provided, otherwise use query containers
  const containers = propContainers || queryContainers || []

  // Transform containers with mock coordinates for demo
  // In production, these would come from actual GPS/AIS data
  const mapContainers: MapContainer[] = Array.isArray(containers) ? containers.map((container, index) => ({
    ...container,
    latitude: container.latitude || (40 + (index * 5) + Math.random() * 10 - 5), // Mock lat between 35-55
    longitude: container.longitude || (-20 + (index * 15) + Math.random() * 20 - 10), // Mock lng spread across Atlantic
  })) : []

  // Filter containers based on current filters
  const filteredContainers = mapContainers.filter(container => {
    if (mapFilters.showAll) return true
    
    const status = container.status.toLowerCase()
    if (mapFilters.showInTransit && status === 'in transit') return true
    if (mapFilters.showDelayed && container.delay_hours > 0) return true
    if (mapFilters.showDelivered && (status === 'delivered' || status === 'at destination')) return true
    
    return false
  })

  const getContainerColor = (container: MapContainer) => {
    const status = container.status.toLowerCase()
    if (container.delay_hours > 0) return 'red'
    if (status === 'delivered' || status === 'at destination') return 'green'
    if (status === 'in transit') return 'blue'
    if (status === 'loading' || status === 'unloading') return 'orange'
    return 'gray'
  }

  const getStatusIcon = (container: MapContainer) => {
    const status = container.status.toLowerCase()
    if (container.delay_hours > 0) return '⚠️'
    if (status === 'delivered' || status === 'at destination') return '✅'
    if (status === 'in transit') return '🚢'
    if (status === 'loading' || status === 'unloading') return '🏗️'
    return '📦'
  }

  const toggleFilter = (filterKey: keyof typeof mapFilters) => {
    if (filterKey === 'showAll') {
      setMapFilters(prev => ({
        ...prev,
        showAll: !prev.showAll,
        showInTransit: !prev.showAll,
        showDelayed: !prev.showAll,
        showDelivered: !prev.showAll
      }))
    } else {
      setMapFilters(prev => ({
        ...prev,
        [filterKey]: !prev[filterKey],
        showAll: false
      }))
    }
  }

  // Focus on specific container if provided
  useEffect(() => {
    if (focusContainer) {
      const container = filteredContainers.find(c => c.id === focusContainer)
      if (container && container.latitude && container.longitude) {
        setMapView({
          center: [container.latitude, container.longitude],
          zoom: 8
        })
      }
    }
  }, [focusContainer, filteredContainers])

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-red-600 mb-2">
              Failed to load container locations
            </p>
            <p className="text-muted-foreground mb-4">
              {error.message}
            </p>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      {showControls && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Container Map
                {isRefetching && <RefreshCw className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
                {refetch && (
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Button
                variant={mapFilters.showAll ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter('showAll')}
              >
                {mapFilters.showAll ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                All ({mapContainers.length})
              </Button>
              
              <Button
                variant={mapFilters.showInTransit ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter('showInTransit')}
              >
                <Badge className="w-2 h-2 p-0 bg-blue-500 mr-2" />
                In Transit ({mapContainers.filter(c => c.status.toLowerCase() === 'in transit').length})
              </Button>
              
              <Button
                variant={mapFilters.showDelayed ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter('showDelayed')}
              >
                <Badge className="w-2 h-2 p-0 bg-red-500 mr-2" />
                Delayed ({mapContainers.filter(c => c.delay_hours > 0).length})
              </Button>
              
              <Button
                variant={mapFilters.showDelivered ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter('showDelivered')}
              >
                <Badge className="w-2 h-2 p-0 bg-green-500 mr-2" />
                Delivered ({mapContainers.filter(c => 
                  c.status.toLowerCase() === 'delivered' || 
                  c.status.toLowerCase() === 'at destination'
                ).length})
              </Button>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredContainers.length} of {mapContainers.length} containers
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Map */}
      <Card>
        <CardContent className="p-0">
          <div style={{ height }} className="relative">
            {isLoading ? (
              <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Loading container locations...
                </div>
              </div>
            ) : (
              <LeafletMap
                containers={filteredContainers}
                center={mapView.center}
                zoom={mapView.zoom}
                getContainerColor={getContainerColor}
                getStatusIcon={getStatusIcon}
                onMapViewChange={setMapView}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Legend */}
      {showControls && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Map Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>In Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Delayed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Delivered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Loading/Unloading</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}