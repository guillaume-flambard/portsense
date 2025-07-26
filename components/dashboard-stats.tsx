import { Database } from '@/lib/supabase/database.types'

type Container = Database['public']['Tables']['containers']['Row']

interface DashboardStatsProps {
  containers: Container[]
}

export function DashboardStats({ containers }: DashboardStatsProps) {
  const totalContainers = containers.length
  const delayedContainers = containers.filter(c => c.delay_hours > 0).length
  const highRiskContainers = containers.filter(c => c.risk_level === 'High').length
  const onTimePercentage = totalContainers > 0 
    ? Math.round(((totalContainers - delayedContainers) / totalContainers) * 100)
    : 100

  const stats = [
    {
      name: 'Active Containers',
      value: totalContainers,
      icon: '📦',
      color: 'blue'
    },
    {
      name: 'On-Time Delivery',
      value: `${onTimePercentage}%`,
      icon: '✅',
      color: 'green'
    },
    {
      name: 'Delayed Shipments',
      value: delayedContainers,
      icon: '⏰',
      color: 'yellow'
    },
    {
      name: 'High Risk',
      value: highRiskContainers,
      icon: '⚠️',
      color: 'red'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">{stat.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}