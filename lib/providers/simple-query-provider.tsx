'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Simple QueryClient without global instance
export function SimpleQueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Create a new QueryClient instance each time
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,
        retry: 2,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}