'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'

// Create a single global query client instance
let globalQueryClient: QueryClient | null = null

function getQueryClient() {
  if (!globalQueryClient) {
    globalQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 30, // 30 seconds
          gcTime: 1000 * 60 * 5, // 5 minutes
          retry: (failureCount, error: any) => {
            if (error?.status === 404 || error?.status === 403) {
              return false
            }
            return failureCount < 3
          },
          refetchOnWindowFocus: true,
          refetchOnReconnect: true,
        },
        mutations: {
          retry: (failureCount, error: any) => {
            if (error?.status >= 400 && error?.status < 500) {
              return false
            }
            return failureCount < 1
          },
        },
      },
    })
  }
  return globalQueryClient
}

export function QueryClientProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false)
  const queryClient = getQueryClient()

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Temporarily disable DevTools to debug */}
      {/* {isClient && (
        <ReactQueryDevtools 
          initialIsOpen={false}
        />
      )} */}
    </QueryClientProvider>
  )
}