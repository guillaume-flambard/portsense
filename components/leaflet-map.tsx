'use client'

import { useEffect, useRef, useMemo, memo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { formatDistanceToNow } from 'date-fns'
import { MapContainer as MapContainerType } from './container-map'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, MapPin, Clock, AlertTriangle } from 'lucide-react'

// Fix default markers in Leaflet
import 'leaflet/dist/leaflet.css'
import './leaflet-map.css'

// Custom marker icons - Enhanced visibility and click area
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
        position: relative;
        z-index: 1000;
      "
      >
        ${icon}
      </div>
    `,
    className: 'custom-marker-enhanced',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

// Component to capture map instance and handle events
interface MapInitializerProps {
  center: [number, number]
  zoom: number
  setMapInstance: (map: L.Map) => void
}

const MapInitializer = memo(function MapInitializer({ 
  center, 
  zoom, 
  setMapInstance 
}: MapInitializerProps) {
  const map = useMap()
  const prevCenter = useRef<[number, number] | null>(null)
  const prevZoom = useRef<number | null>(null)
  const isInitialized = useRef(false)

  // Capture map instance and initialize
  useEffect(() => {
    setMapInstance(map)
    
    // Force invalidate size multiple times to ensure proper rendering
    const timers = [
      setTimeout(() => map.invalidateSize(), 50),
      setTimeout(() => map.invalidateSize(), 150),
      setTimeout(() => map.invalidateSize(), 300)
    ]

    // Remove automatic popup closing to preserve marker positions

    // Set initialized flag
    isInitialized.current = true

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [map, setMapInstance])

  // Handle view changes with better bounds checking and popup management
  useEffect(() => {
    if (!map || !isInitialized.current) return

    // Validate coordinates are within world bounds
    if (Math.abs(center[0]) > 85 || Math.abs(center[1]) > 180) {
      console.warn('Invalid coordinates provided:', center)
      return
    }

    // Check if the new center/zoom is significantly different (much higher thresholds)
    const centerChanged = !prevCenter.current || 
      Math.abs(prevCenter.current[0] - center[0]) > 1.0 ||
      Math.abs(prevCenter.current[1] - center[1]) > 1.0

    const zoomChanged = !prevZoom.current || Math.abs(prevZoom.current - zoom) > 2

    if (centerChanged || zoomChanged) {
      const distance = prevCenter.current ? 
        Math.sqrt(
          Math.pow(center[0] - prevCenter.current[0], 2) + 
          Math.pow(center[1] - prevCenter.current[1], 2)
        ) : 0

      // Only change view for large distances to preserve marker positions
      if (distance > 2) {
        map.setView(center, zoom, { 
          animate: false // No animation to preserve markers
        })
        
        prevCenter.current = center
        prevZoom.current = zoom
      }
    }
  }, [map, center, zoom])

  return null
})

// MapViewController removed - functionality integrated into MapInitializer

interface LeafletMapProps {
  containers: MapContainerType[]
  center: [number, number]
  zoom: number
  getContainerColor: (container: MapContainerType) => string
  getStatusIcon: (container: MapContainerType) => string
}

const LeafletMap = memo(function LeafletMap({
  containers,
  center,
  zoom,
  getContainerColor,
  getStatusIcon
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)
  
  // Force map invalidation on mount (WITHOUT fitBounds to avoid displacement)
  useEffect(() => {
    if (mapInstance) {
      // Force invalidate size to fix gray zones
      setTimeout(() => {
        mapInstance.invalidateSize()
        // Removed automatic fitBounds to prevent unwanted movement
      }, 100)
    }
  }, [mapInstance]) // Only trigger on mapInstance change, not containers

  // Memoize container markers with stable references
  const containerMarkers = useMemo(() => {
    const validContainers = containers.filter(c => c.latitude && c.longitude)
    
    return validContainers.map((container) => {
      const color = getContainerColor(container)
      const icon = getStatusIcon(container)
      
      // Create stable marker data
      return {
        id: container.id,
        position: [container.latitude!, container.longitude!] as [number, number],
        container,
        color,
        icon,
        // Use container ID for stable key
        key: `marker-${container.id}`
      }
    })
  }, [containers, getContainerColor, getStatusIcon])

  // Create icons separately to avoid recreation on each render
  const createMarkerIcon = useMemo(() => {
    const iconCache = new Map<string, L.DivIcon>()
    
    return (color: string, icon: string) => {
      const cacheKey = `${color}-${icon}`
      if (!iconCache.has(cacheKey)) {
        iconCache.set(cacheKey, createCustomIcon(color, icon))
      }
      return iconCache.get(cacheKey)!
    }
  }, [])

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

  const getRiskBadgeColor = (risk: string | null) => {
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

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
      className="z-0 rounded-lg overflow-hidden"
      ref={mapRef}
      scrollWheelZoom={true}
      touchZoom={true}
      doubleClickZoom={true}
      dragging={true}
      zoomControl={true}
      minZoom={2}
      maxZoom={18}
      bounds={[[-85, -180], [85, 180]]} // Prevent map from going too far
      maxBounds={[[-90, -180], [90, 180]]} // World bounds
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        crossOrigin={true}
      />
      
      <MapInitializer 
        center={center} 
        zoom={zoom} 
        setMapInstance={setMapInstance}
      />

      {containerMarkers.map((markerData) => {
        const { position, container, color, icon, key } = markerData
        const markerIcon = createMarkerIcon(color, icon)

        return (
          <Marker
            key={key}
            position={position}
            icon={markerIcon}
          >
            <Popup 
              maxWidth={400}
              minWidth={320}
              maxHeight={500}
              autoPan={false}
              autoClose={false}
              closeOnEscapeKey={true}
              closeOnClick={false}
              closeButton={true}
              className="container-popup"
              keepInView={true}
            >
              <div className="p-3 w-full max-w-[380px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <h3 className="font-semibold text-base">{container.container_id}</h3>
                  </div>
                  <Badge className={getStatusBadgeColor(container.status)}>
                    {container.status}
                  </Badge>
                </div>

                {/* Container Details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Carrier</p>
                      <p className="font-medium">{container.carrier || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vessel</p>
                      <p className="font-medium">{container.vessel_name || 'Unknown'}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-sm">Current Location</p>
                      <p className="font-medium">{container.current_location || 'Unknown'}</p>
                    </div>
                  </div>

                  {/* ETA */}
                  {container.eta && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-sm">Estimated Arrival</p>
                        <p className="font-medium">
                          {new Date(container.eta).toLocaleDateString('en-US', {
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
                  {container.delay_hours > 0 && (
                    <div className="flex items-start gap-2 p-2 bg-red-50 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-red-700 font-medium text-sm">
                          Delayed by {container.delay_hours} hours
                        </p>
                        {container.issues && (
                          <p className="text-red-600 text-xs mt-1">
                            {Array.isArray(container.issues) ? container.issues.join(', ') : container.issues}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Risk Level */}
                  {container.risk_level && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Risk Level</span>
                      <Badge variant="outline" className={getRiskBadgeColor(container.risk_level)}>
                        {container.risk_level}
                      </Badge>
                    </div>
                  )}

                  {/* Last Updated */}
                  {container.last_updated && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Updated {formatDistanceToNow(new Date(container.last_updated))} ago
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        window.open(`/dashboard/containers/${container.id}`, '_blank')
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
})

export default LeafletMap