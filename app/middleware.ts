import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  // Create a middleware Supabase client from the request and response
  const supabase = createMiddlewareClient({ req, res })
  // This syncs the session from the request's cookies onto the response's cookies, ensuring server-side routes see the session.
  await supabase.auth.getSession()
  return res
}
