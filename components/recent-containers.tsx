import { Database } from '@/lib/supabase/database.types'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

type Container = Database['public']['Tables']['containers']['Row']

interface RecentContainersProps {
  containers: Container[]
}

export function RecentContainers({ containers }: RecentContainersProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Containers</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {containers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No containers tracked yet. Add your first container to get started.
          </div>
        ) : (
          containers.map((container) => (
            <div key={container.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {container.container_id}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      container.delay_hours > 0 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {container.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {container.current_location} • {container.carrier}
                  </p>
                  {container.ai_summary && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      {container.ai_summary}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Updated {formatDistanceToNow(new Date(container.last_updated))} ago
                  </p>
                </div>
                <div className="text-right">
                  {container.delay_hours > 0 && (
                    <p className="text-sm font-medium text-yellow-600">
                      +{container.delay_hours}h delay
                    </p>
                  )}
                  <Link 
                    href={`/dashboard/containers/${container.id}`}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
