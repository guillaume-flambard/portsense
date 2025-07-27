import { NextRequest, NextResponse } from 'next/server'

// Force dynamic runtime for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Return available AI providers
    const providers = [
      {
        id: 'openai',
        name: 'OpenAI GPT',
        available: !!process.env.OPENAI_API_KEY,
        default: true
      },
      {
        id: 'anthropic',
        name: 'Anthropic Claude',
        available: !!process.env.ANTHROPIC_API_KEY,
        default: false
      }
    ]

    // Find the default provider or fallback to the first available
    const defaultProvider = providers.find(p => p.default && p.available) || 
                           providers.find(p => p.available) ||
                           providers[0]

    return NextResponse.json({ 
      providers,
      default: defaultProvider?.id || 'openai'
    })
  } catch (error) {
    console.error('Error fetching AI providers:', error)
    return NextResponse.json({ 
      providers: [{ id: 'openai', name: 'OpenAI GPT', available: false, default: true }],
      default: 'openai'
    }, { status: 500 })
  }
}