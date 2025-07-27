'use client'

import { useState, useMemo, useCallback } from 'react'
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, AlertTriangle, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { containers as Container } from '@/lib/generated/prisma'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapboxContainerMapProps {
  containers: Container[]
  height?: string
  showControls?: boolean
  showLegend?: boolean
}

interface MapContainer extends Container {
  // latitude and longitude are already defined in Container interface
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'

export function MapboxContainerMap({ 
  containers, 
  height = '600px', 
  showControls = false, 
  showLegend = false 
}: MapboxContainerMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 30,
    zoom: 2
  })
  const [selectedContainer, setSelectedContainer] = useState<MapContainer | null>(null)

  // Transform containers with stable mock coordinates
  const mapContainers: MapContainer[] = useMemo(() => {
    if (!Array.isArray(containers)) return []
    
    // Major shipping routes and ports for realistic positioning
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
      const hashCode = container.id ? container.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0) : index * 1000
      
      const routeIndex = Math.abs(hashCode) % shippingRoutes.length
      const baseRoute = shippingRoutes[routeIndex]
      
      const latOffset = ((hashCode % 400) - 200) / 100
      const lngOffset = (((hashCode * 3) % 400) - 200) / 100
      
      return {
        ...container,
        latitude: container.latitude || (baseRoute.lat + latOffset),
        longitude: container.longitude || (baseRoute.lng + lngOffset),
      }
    })
  }, [containers])

  const getContainerColor = (container: MapContainer) => {
    const status = container.status.toLowerCase()
    if (container.delay_hours > 0) return '#ef4444' // red
    if (status === 'delivered' || status === 'at destination') return '#22c55e' // green
    if (status === 'in transit') return '#3b82f6' // blue
    if (status === 'loading' || status === 'unloading') return '#f97316' // orange
    return '#6b7280' // gray
  }

  const getStatusIcon = (container: MapContainer) => {
    const status = container.status.toLowerCase()
    if (container.delay_hours > 0) return '⚠️'
    if (status === 'delivered' || status === 'at destination') return '✅'
    if (status === 'in transit') return '🚢'
    if (status === 'loading' || status === 'unloading') return '🏗️'
    return '📦'
  }

  const getStatusBadgeColor = (status: string) => {
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

  const centerOnContainers = useCallback(() => {
    if (mapContainers.length === 0) return

    const validContainers = mapContainers.filter(c => c.latitude && c.longitude)
    if (validContainers.length === 0) return

    const lats = validContainers.map(c => c.latitude!)
    const lngs = validContainers.map(c => c.longitude!)
    
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    
    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2
    
    const latDiff = maxLat - minLat
    const lngDiff = maxLng - minLng
    const maxDiff = Math.max(latDiff, lngDiff)
    
    let zoom = 2
    if (maxDiff < 0.5) zoom = 10
    else if (maxDiff < 2) zoom = 8
    else if (maxDiff < 5) zoom = 6
    else if (maxDiff < 15) zoom = 4
    else if (maxDiff < 50) zoom = 3
    else zoom = 2
    
    setViewState({
      longitude: centerLng,
      latitude: centerLat,
      zoom: zoom
    })
  }, [mapContainers])

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Container Locations</h3>
            <span className="text-sm text-muted-foreground">
              Showing {mapContainers.length} containers
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={centerOnContainers}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Center on Containers
          </Button>
        </div>
      )}

      {/* Map */}
      <div style={{ height }} className="rounded-lg overflow-hidden border">
        <Map
          {...viewState}
          onMove={(evt: any) => setViewState(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{width: '100%', height: '100%'}}
          mapStyle="mapbox://styles/mapbox/light-v11"
          attributionControl={false}
        >
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />
          
          {mapContainers.map((container) => {
            if (!container.latitude || !container.longitude) return null

            return (
              <Marker
                key={container.id}
                longitude={container.longitude}
                latitude={container.latitude}
                anchor="bottom"
                onClick={(e: any) => {
                  e.originalEvent.stopPropagation()
                  setSelectedContainer(container)
                }}
              >
                <div
                  className="cursor-pointer transform hover:scale-110 transition-transform"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: getContainerColor(container),
                    borderRadius: '50%',
                    border: '3px solid white',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}
                >
                  {getStatusIcon(container)}
                </div>
              </Marker>
            )
          })}

          {selectedContainer && (
            <Popup
              longitude={selectedContainer.longitude!}
              latitude={selectedContainer.latitude!}
              anchor="top"
              onClose={() => setSelectedContainer(null)}
              maxWidth="400px"
            >
              <div className="p-4 min-w-[300px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getStatusIcon(selectedContainer)}</span>
                    <h3 className="font-semibold text-lg">{selectedContainer.container_id}</h3>
                  </div>
                  <Badge className={getStatusBadgeColor(selectedContainer.status)}>
                    {selectedContainer.status}
                  </Badge>
                </div>

                {/* Container Details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Carrier</p>
                      <p className="font-medium">{selectedContainer.carrier || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vessel</p>
                      <p className="font-medium">{selectedContainer.vessel_name || 'Unknown'}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-sm">Current Location</p>
                      <p className="font-medium">{selectedContainer.current_location || 'Unknown'}</p>
                    </div>
                  </div>

                  {/* ETA */}
                  {selectedContainer.eta && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-sm">Estimated Arrival</p>
                        <p className="font-medium">
                          {new Date(selectedContainer.eta).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Delay Information */}
                  {selectedContainer.delay_hours > 0 && (
                    <div className="flex items-start gap-2 p-2 bg-red-50 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-red-700 font-medium text-sm">
                          Delayed by {selectedContainer.delay_hours} hours
                        </p>
                        {selectedContainer.issues && (
                          <p className="text-red-600 text-xs mt-1">
                            {Array.isArray(selectedContainer.issues) 
                              ? selectedContainer.issues.join(', ') 
                              : selectedContainer.issues}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  {selectedContainer.last_updated && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Updated {formatDistanceToNow(new Date(selectedContainer.last_updated))} ago
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        window.open(`/dashboard/containers/${selectedContainer.id}`, '_blank')
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Legend */}
      {showLegend && (
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
      )}
    </div>
  )
}