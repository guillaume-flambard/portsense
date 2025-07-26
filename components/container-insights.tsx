'use client'

import { useState } from 'react'
import { Database } from '@/lib/supabase/database.types'

type Container = Database['public']['Tables']['containers']['Row']

interface ContainerInsightsProps {
  container: Container
}

export function ContainerInsights({ container }: ContainerInsightsProps) {
  const [delayInsight, setDelayInsight] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const generateDelayInsight = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/containers/${container.id}/insights`, {
        method: 'POST',
      })
      const data = await response.json()
      if (response.ok) {
        setDelayInsight(data.insight)
      }
    } catch (error) {
      console.error('Error generating insight:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Card */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
        <div className="p-6">
          {container.delay_hours > 0 ? (
            <div className="space-y-4">
              <button
                onClick={generateDelayInsight}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Get Delay Analysis'}
              </button>
              
              {delayInsight && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-gray-800">{delayInsight}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Analysis by Claude AI
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">✅ Container is on schedule</p>
              <p className="text-sm text-gray-500 mt-1">
                No delays detected for this shipment
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6 space-y-3">
          <button className="w-full text-left px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            📧 Send status to client
          </button>
          <button className="w-full text-left px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            📱 Set up SMS alerts
          </button>
          <button className="w-full text-left px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            📊 Export tracking data
          </button>
          <button className="w-full text-left px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            🔗 Generate shareable link
          </button>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Delay Risk</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                container.delay_hours > 24 ? 'bg-red-100 text-red-800' :
                container.delay_hours > 0 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {container.delay_hours > 24 ? 'High' :
                 container.delay_hours > 0 ? 'Medium' : 'Low'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Weather Impact</span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                Low
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Port Congestion</span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                Medium
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
