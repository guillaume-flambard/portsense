import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PublicContainerView } from '@/components/public-container-view'
import { format } from 'date-fns'

// Generate sharing tokens in your container service
export default async function PublicContainerPage({
  params,
}: {
  params: { token: string }
}) {
  const supabase = createServerClient()
  
  // In a real implementation, you'd have a sharing_tokens table
  // For now, we'll decode a simple base64 token with container ID
  let containerId: string
  try {
    containerId = Buffer.from(params.token, 'base64').toString('utf-8')
  } catch {
    notFound()
  }

  const { data: container, error } = await supabase
    .from('containers')
    .select('*')
    .eq('id', containerId)
    .eq('is_active', true)
    .single()

  if (error || !container) {
    notFound()
  }

  const { data: history } = await supabase
    .from('container_history')
    .select('*')
    .eq('container_id', containerId)
    .order('recorded_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🚢 Container Tracking
              </h1>
              <p className="text-gray-600">Real-time shipment status</p>
            </div>
            <div className="text-sm text-gray-500">
              Powered by PortSense
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PublicContainerView container={container} history={history || []} />
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>This tracking page was generated on {format(new Date(), 'PPP')}</p>
            <p className="mt-1">
              Want your own container tracking solution? Visit{' '}
              <a href="/" className="text-blue-600 hover:text-blue-500">
                PortSense
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}