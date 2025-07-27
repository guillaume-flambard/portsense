'use client'

import { useQuery } from '@tanstack/react-query'

// Simple test component to debug the query client issue
export function DebugTest() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      return { message: 'Hello World' }
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="p-4">
      <h2>Debug Test Component</h2>
      <p>Data: {JSON.stringify(data)}</p>
      <p>✅ TanStack Query is working!</p>
    </div>
  )
}