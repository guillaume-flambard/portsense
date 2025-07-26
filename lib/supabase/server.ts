import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export const createServerClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://znbyocclcriodiglopoo.supabase.co') {
    throw new Error('Supabase URL not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your environment variables.')
  }
  
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}