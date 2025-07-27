'use client'

// Absolutely bare test - no hooks, no providers, no complex components
export default function BareTestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Bare Test Page</h1>
      <p>This page has absolutely nothing - no Tailwind, no hooks, no providers.</p>
      <p>If this works, the issue is with our specific components or hooks.</p>
      <button onClick={() => alert('Button works!')}>Test Button</button>
    </div>
  )
}