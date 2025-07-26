import { AIService } from '@/lib/ai/ai-service'

async function testAIProviders() {
  console.log('🧪 Testing AI Providers...\n')

  const testContainer = {
    container_id: 'TEST1234567',
    status: 'In Transit',
    current_location: 'Port of Singapore',
    origin_port: 'Shanghai',
    destination_port: 'Rotterdam',
    delay_hours: 6,
    carrier: 'Test Carrier',
    issues: ['Weather delay'],
  }

  const providers: ('claude' | 'openai')[] = ['claude', 'openai']

  for (const provider of providers) {
    console.log(`Testing ${provider.toUpperCase()}...`)
    
    try {
      const startTime = Date.now()
      const result = await AIService.generateStatusSummary(testContainer, provider)
      const endTime = Date.now()
      
      console.log(`✅ ${provider.toUpperCase()} Success (${endTime - startTime}ms)`)
      console.log(`Response: ${result.slice(0, 100)}...\n`)
    } catch (error) {
      console.log(`❌ ${provider.toUpperCase()} Failed`)
      console.log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
    }
  }

  console.log('Available providers:', AIService.getAvailableProviders())
  console.log('Current provider:', AIService.getCurrentProvider())
}

if (require.main === module) {
  testAIProviders().catch(console.error)
}

export { testAIProviders }