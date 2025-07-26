import { Database } from '@/lib/supabase/database.types'
import { format } from 'date-fns'

type ContainerHistory = Database['public']['Tables']['container_history']['Row']

interface ContainerHistoryProps {
  history: ContainerHistory[]
}

export function ContainerHistory({ history }: ContainerHistoryProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Tracking History</h2>
      </div>

      <div className="p-6">
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tracking history available yet.
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {history.map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== history.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <span className="text-white text-xs">📍</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            <strong>{event.status}</strong>
                            {event.location && ` at ${event.location}`}
                          </p>
                          {event.delay_hours && event.delay_hours > 0 && (
                            <p className="text-sm text-red-600">
                              {event.delay_hours}h delay
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={event.recorded_at}>
                            {format(new Date(event.recorded_at), 'MMM d, p')}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}