'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Database } from '@/lib/supabase/database.types'

type Container = Database['public']['Tables']['containers']['Row']

interface ContainerFiltersProps {
  containers: Container[]
  currentFilters: { status?: string; carrier?: string; search?: string }
}

export function ContainerFilters({ containers, currentFilters }: ContainerFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentFilters.search || '')

  // Get unique statuses and carriers
  const uniqueStatuses = Array.from(new Set(containers.map(c => c.status)))
  const uniqueCarriers = Array.from(new Set(containers.map(c => c.carrier).filter((carrier): carrier is string => Boolean(carrier))))

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    
    router.push(`/dashboard/containers?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', search)
  }

  useEffect(() => {
    setSearch(currentFilters.search || '')
  }, [currentFilters.search])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search containers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {/* Status Filter */}
        <select
          value={currentFilters.status || 'all'}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        {/* Carrier Filter */}
        <select
          value={currentFilters.carrier || 'all'}
          onChange={(e) => updateFilter('carrier', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Carriers</option>
          {uniqueCarriers.map(carrier => (
            <option key={carrier} value={carrier}>{carrier}</option>
          ))}
        </select>

        {/* Clear Filters */}
        <button
          onClick={() => router.push('/dashboard/containers')}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {containers.length} containers
      </div>
    </div>
  )
}