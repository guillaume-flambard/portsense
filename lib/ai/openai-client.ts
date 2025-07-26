import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not found - OpenAI features will be disabled')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export { openai }