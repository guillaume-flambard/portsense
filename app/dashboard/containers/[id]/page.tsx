import { requireAuth } from '@/lib/auth/auth-helpers'
import { ContainerService } from '@/lib/services/container-service'
import { ContainerDetails } from '@/components/container-details'
import { ContainerHistory } from '@/components/container-history'
import { ContainerInsights } from '@/components/container-insights'
import { notFound } from 'next/navigation'

export default async function ContainerDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await requireAuth()
  const containerService = new ContainerService()

  const [container, history] = await Promise.all([
    containerService.getContainer(params.id, user.id),
    containerService.getContainerHistory(params.id)
  ])

  if (!container) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Container {container.container_id}
        </h1>
        <p className="text-gray-600">Detailed tracking information and AI insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ContainerDetails container={container} />
          <ContainerHistory history={history} />
        </div>
        
        <div className="space-y-8">
          <ContainerInsights container={container} />
        </div>
      </div>
    </div>
  )
}