'use client'

// Absolutely minimal test page without any providers
export default function MinimalTestPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Minimal Test Page</h1>
      <p>This page has no providers, no hooks, no complex components.</p>
      <p>If this page works, the issue is with a specific provider or component.</p>
    </div>
  )
}