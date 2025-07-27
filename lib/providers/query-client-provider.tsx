'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryClientProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  // Create a client instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 30 seconds
            staleTime: 1000 * 30,
            // 5 minutes
            gcTime: 1000 * 60 * 5,
            retry: (failureCount, error: any) => {
              // Don't retry on 404 or 403
              if (error?.status === 404 || error?.status === 403) {
                return false
              }
              // Retry up to 3 times for other errors
              return failureCount < 3
            },
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: (failureCount, error: any) => {
              // Don't retry mutations on client errors
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              // Retry once for server errors
              return failureCount < 1
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools 
        initialIsOpen={false}
      />
    </QueryClientProvider>
  )
}