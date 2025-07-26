import { requireAuth } from '@/lib/auth/auth-helpers'
import { Navigation } from '@/components/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-8">
        {children}
      </main>
    </div>
  )
}