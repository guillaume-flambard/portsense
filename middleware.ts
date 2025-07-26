import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Skip middleware if Supabase URL is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
    console.warn('Supabase not configured - skipping auth middleware')
    return NextResponse.next()
  }

  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If user is signed in and the current path is /auth/login or /auth/signup redirect the user to /dashboard
    if (user && (req.nextUrl.pathname === '/auth/login' || req.nextUrl.pathname === '/auth/signup')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If user is not signed in and the current path is not /auth/login or /auth/signup redirect the user to /auth/login
    if (!user && !req.nextUrl.pathname.startsWith('/auth') && !req.nextUrl.pathname.startsWith('/share')) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}