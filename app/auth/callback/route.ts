import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const type = requestUrl.searchParams.get('type')
  const tokenHash = requestUrl.searchParams.get('token_hash')

  // If this is a password recovery flow, pass the token to update-password
  if (type === 'recovery' && tokenHash) {
    return NextResponse.redirect(new URL(`/update-password?token_hash=${tokenHash}&type=recovery`, requestUrl.origin))
  }

  // For other auth flows, just redirect home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}