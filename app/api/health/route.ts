import { NextResponse } from 'next/server'
import { AIService } from '@/lib/ai/ai-service'

export async function GET() {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'ok', // You could add actual DB health check
      ai_providers: AIService.getAvailableProviders(),
      current_ai_provider: AIService.getCurrentProvider(),
    },
    environment: {
      node_env: process.env.NODE_ENV,
      has_anthropic_key: !!process.env.ANTHROPIC_API_KEY,
      has_openai_key: !!process.env.OPENAI_API_KEY,
      has_resend_key: !!process.env.RESEND_API_KEY,
      has_twilio_keys: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    }
  }

  return NextResponse.json(healthCheck)
}