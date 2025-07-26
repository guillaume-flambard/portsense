'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { containers as Container } from '@/lib/generated/prisma'
import { toast } from 'sonner'

// Types
interface ContainerUpdate {
  status?: string
  current_location?: string
  latitude?: number
  longitude?: number
  eta?: string
  delay_hours?: number
  risk_level?: 'Low' | 'Medium' | 'High'
  vessel_name?: string
  voyage_number?: string
}

interface ContainerSummary {
  total: number
  inTransit: number
  delayed: number
  highRisk: number
  activeAlerts: number
  recentUpdates: Array<{
    id: string
    container_id: string
    status: string
    current_location: string | null
    delay_hours: number
    risk_level: string | null
    last_updated: string | null
    alerts: number
  }>
}

// Query Keys
export const containerKeys = {
  all: ['containers'] as const,
  lists: () => [...containerKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...containerKeys.lists(), { filters }] as const,
  details: () => [...containerKeys.all, 'detail'] as const,
  detail: (id: string) => [...containerKeys.details(), id] as const,
  summary: () => [...containerKeys.all, 'summary'] as const,
}

// API Functions
async function fetchContainers(): Promise<Container[]> {
  const response = await fetch('/api/containers')
  if (!response.ok) {
    throw new Error(`Failed to fetch containers: ${response.statusText}`)
  }
  return response.json()
}

async function fetchContainer(id: string): Promise<Container> {
  const response = await fetch(`/api/containers/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch container: ${response.statusText}`)
  }
  return response.json()
}

async function fetchContainerSummary(): Promise<ContainerSummary> {
  const response = await fetch('/api/containers/bulk-update')
  if (!response.ok) {
    throw new Error(`Failed to fetch container summary: ${response.statusText}`)
  }
  const data = await response.json()
  return data.summary
}

async function updateContainer(id: string, updates: ContainerUpdate): Promise<Container> {
  const response = await fetch(`/api/containers/${id}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update container')
  }

  const data = await response.json()
  return data.container
}

async function bulkUpdateContainers(updates: Array<{ container_id: string } & ContainerUpdate>) {
  const response = await fetch('/api/containers/bulk-update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ updates }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to bulk update containers')
  }

  return response.json()
}

// Hooks
export function useContainers() {
  return useQuery({
    queryKey: containerKeys.lists(),
    queryFn: fetchContainers,
    staleTime: 1000 * 30, // 30 seconds
  })
}

export function useContainer(id: string) {
  return useQuery({
    queryKey: containerKeys.detail(id),
    queryFn: () => fetchContainer(id),
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds
  })
}

export function useContainerSummary() {
  return useQuery({
    queryKey: containerKeys.summary(),
    queryFn: fetchContainerSummary,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}

export function useUpdateContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ContainerUpdate }) =>
      updateContainer(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: containerKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: containerKeys.lists() })

      // Snapshot the previous value
      const previousContainer = queryClient.getQueryData(containerKeys.detail(id))
      const previousContainers = queryClient.getQueryData(containerKeys.lists())

      // Optimistically update the cache
      if (previousContainer) {
        queryClient.setQueryData(containerKeys.detail(id), {
          ...previousContainer,
          ...updates,
          last_updated: new Date().toISOString(),
        })
      }

      // Update the list cache
      if (previousContainers) {
        queryClient.setQueryData(containerKeys.lists(), (old: Container[]) =>
          old.map((container) =>
            container.id === id
              ? { ...container, ...updates, last_updated: new Date().toISOString() }
              : container
          )
        )
      }

      // Return a context object with the snapshotted value
      return { previousContainer, previousContainers }
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousContainer) {
        queryClient.setQueryData(containerKeys.detail(id), context.previousContainer)
      }
      if (context?.previousContainers) {
        queryClient.setQueryData(containerKeys.lists(), context.previousContainers)
      }
      
      toast.error('Failed to update container', {
        description: err.message,
      })
    },
    onSuccess: (updatedContainer, { id }) => {
      // Update the cache with the server response
      queryClient.setQueryData(containerKeys.detail(id), updatedContainer)
      
      // Invalidate and refetch summary
      queryClient.invalidateQueries({ queryKey: containerKeys.summary() })
      
      toast.success('Container updated successfully', {
        description: `${updatedContainer.container_id} has been updated`,
      })
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: containerKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: containerKeys.lists() })
    },
  })
}

export function useBulkUpdateContainers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkUpdateContainers,
    onSuccess: (data) => {
      // Invalidate all container queries
      queryClient.invalidateQueries({ queryKey: containerKeys.all })
      
      toast.success('Bulk update completed', {
        description: `Updated ${data.updated} of ${data.total} containers`,
      })
    },
    onError: (err) => {
      toast.error('Bulk update failed', {
        description: err.message,
      })
    },
  })
}