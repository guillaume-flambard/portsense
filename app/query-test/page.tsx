'use client'

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

// Create a simple local QueryClient for this test
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: false,
    },
  },
})

function SimpleQueryTest() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['simple-test'],
    queryFn: async () => {
      return { message: 'Test successful' }
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {(error as Error).message}</div>

  return (
    <div>
      <h2>Query Test Result</h2>
      <p>Data: {JSON.stringify(data)}</p>
    </div>
  )
}

export default function QueryTestPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">TanStack Query Test</h1>
        <p>Testing TanStack Query with a local QueryClient provider</p>
        <SimpleQueryTest />
      </div>
    </QueryClientProvider>
  )
}