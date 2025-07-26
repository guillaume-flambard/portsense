// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...\n')

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log('1. Testing Supabase client connection...')
    
    // Test basic query
    const { data, error } = await supabase
      .from('containers')
      .select('count(*)')
      .limit(1)

    if (error) {
      console.log('❌ Supabase query error:', error.message)
    } else {
      console.log('✅ Supabase connection successful')
      console.log('📦 Containers count result:', data)
    }

    // Test raw SQL
    console.log('\n2. Testing raw SQL query...')
    const { data: rawData, error: rawError } = await supabase.rpc('exec_sql', {
      query: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' LIMIT 5'
    })

    if (rawError) {
      console.log('❌ Raw SQL failed:', rawError.message)
      
      // Try alternative approach
      console.log('\n3. Testing table existence...')
      const { data: tableData, error: tableError } = await supabase
        .from('containers')
        .select('id')
        .limit(1)
        
      if (tableError) {
        console.log('❌ Table access failed:', tableError.message)
      } else {
        console.log('✅ Table access successful')
      }
    } else {
      console.log('✅ Raw SQL successful:', rawData)
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error)
  }
}

testSupabaseConnection()