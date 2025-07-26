import { requireAuth } from '@/lib/auth/auth-helpers'
import { ContainerService } from '@/lib/services/container-service'
import { ContainerTable } from '@/components/container-table'
import { ContainerFilters } from '@/components/container-filters'
import { AddContainerButton } from '@/components/add-container-button'

export default async function ContainersPage({
  searchParams,
}: {
  searchParams: { status?: string; carrier?: string; search?: string }
}) {
  const user = await requireAuth()
  const containerService = new ContainerService()
  const containers = await containerService.getContainers(user.id)

  // Filter containers based on search params
  let filteredContainers = containers

  if (searchParams.status && searchParams.status !== 'all') {
    filteredContainers = filteredContainers.filter(
      c => c.status.toLowerCase() === searchParams.status?.toLowerCase()
    )
  }

  if (searchParams.carrier && searchParams.carrier !== 'all') {
    filteredContainers = filteredContainers.filter(
      c => c.carrier?.toLowerCase() === searchParams.carrier?.toLowerCase()
    )
  }

  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase()
    filteredContainers = filteredContainers.filter(c =>
      c.container_id.toLowerCase().includes(searchTerm) ||
      c.current_location?.toLowerCase().includes(searchTerm) ||
      c.carrier?.toLowerCase().includes(searchTerm)
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Containers</h1>
          <p className="text-gray-600">
            Manage and track all your container shipments
          </p>
        </div>
        <AddContainerButton />
      </div>

      <div className="space-y-6">
        <ContainerFilters 
          containers={containers}
          currentFilters={searchParams}
        />
        <ContainerTable containers={filteredContainers} />
      </div>
    </div>
  )
}