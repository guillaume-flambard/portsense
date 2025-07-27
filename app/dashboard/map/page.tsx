'use client'

import { ContainerMap } from '@/components/container-map'

export default function MapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Container Map</h1>
        <p className="text-gray-600">Real-time locations of your tracked containers</p>
      </div>

      <ContainerMap height="700px" showControls={true} />
    </div>
  )
}