import { requireAuth } from '@/lib/auth/auth-helpers'
import { ContainerService } from '@/lib/services/container-service'
import { ContainerMap } from '@/components/container-map'

export default async function MapPage() {
  const user = await requireAuth()
  const containerService = new ContainerService()
  const containers = await containerService.getContainers(user.id)

  // Filter containers with valid coordinates
  const containersWithLocation = containers.filter(c => 
    c.latitude && c.longitude
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Container Map</h1>
        <p className="text-gray-600">Real-time locations of your tracked containers</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <ContainerMap containers={containersWithLocation} />
      </div>
    </div>
  )
}