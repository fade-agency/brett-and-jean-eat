import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const type = requestUrl.searchParams.get('type')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/login?error=Could not authenticate', requestUrl.origin))
    }
  }

  // If this is a password recovery flow, redirect to update-password
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/update-password', requestUrl.origin))
  }

  // Otherwise redirect to next or home
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}