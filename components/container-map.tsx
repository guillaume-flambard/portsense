'use client'

import { useEffect, useState, useMemo } from 'react'
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

// Dynamic import to avoid SSR issues with Mapbox
const MapboxContainerMap = dynamic(() => import('./mapbox-container-map').then(mod => mod.MapboxContainerMap), {
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
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  const [mapFilters, setMapFilters] = useState({
    showInTransit: true,
    showDelayed: true,
    showDelivered: false,
    showAll: true
  })

  // Hooks must be called unconditionally
  const {
    data: queryContainers = [],
    isLoading = false,
    error = null,
    refetch,
    isRefetching = false
  } = useContainers()

  const { isConnected = false } = useRealtimeSync()

  // Use prop containers if provided, otherwise use query containers
  const containers = propContainers || queryContainers || []

  // Transform containers with stable mock coordinates for demo
  // In production, these would come from actual GPS/AIS data
  const mapContainers: MapContainer[] = useMemo(() => {
    if (!Array.isArray(containers)) return []
    
    // Major shipping routes and ports for more realistic positioning
    const shippingRoutes = [
      { name: 'North Atlantic', lat: 50.0, lng: -30.0 },
      { name: 'Mediterranean', lat: 36.0, lng: 15.0 },
      { name: 'Suez Canal', lat: 30.0, lng: 32.0 },
      { name: 'Singapore Strait', lat: 1.3, lng: 103.8 },
      { name: 'Panama Canal', lat: 9.0, lng: -79.5 },
      { name: 'English Channel', lat: 50.5, lng: 1.0 },
      { name: 'North Sea', lat: 56.0, lng: 3.0 },
      { name: 'South China Sea', lat: 15.0, lng: 115.0 }
    ]
    
    return containers.map((container, index) => {
      // Create stable coordinates based on container ID to prevent trembling
      const hashCode = container.id ? container.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0) : index * 1000
      
      // Pick a shipping route based on container index
      const routeIndex = Math.abs(hashCode) % shippingRoutes.length
      const baseRoute = shippingRoutes[routeIndex]
      
      // Add small random offset around the route (±2 degrees max)
      const latOffset = ((hashCode % 400) - 200) / 100 // -2 to +2
      const lngOffset = (((hashCode * 3) % 400) - 200) / 100 // -2 to +2
      
      return {
        ...container,
        latitude: container.latitude || (baseRoute.lat + latOffset),
        longitude: container.longitude || (baseRoute.lng + lngOffset),
      }
    })
  }, [containers])

  // Filter containers based on current filters - memoized to prevent re-computation
  const filteredContainers = useMemo(() => {
    return mapContainers.filter(container => {
      if (mapFilters.showAll) return true
      
      const status = container.status.toLowerCase()
      if (mapFilters.showInTransit && status === 'in transit') return true
      if (mapFilters.showDelayed && container.delay_hours > 0) return true
      if (mapFilters.showDelivered && (status === 'delivered' || status === 'at destination')) return true
      
      return false
    })
  }, [mapContainers, mapFilters])


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
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    {isConnected ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-sm">
                    <div className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {isConnected ? 'Live Updates' : 'Offline'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isConnected ? 'Real-time tracking active' : 'Connection lost'}
                    </div>
                  </div>
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
          <div style={{ height }} className="map-wrapper relative">
            {isLoading ? (
              <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Loading container locations...
                </div>
              </div>
            ) : (
              <MapboxContainerMap
                containers={filteredContainers}
                height={height}
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