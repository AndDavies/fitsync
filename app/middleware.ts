import { type NextRequest } from 'next/server'
import { updateSession } from './../utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Protect everything under /dashboard
    '/dashboard/:path*',

    // Also protect all /api routes
    '/api/:path*',

    // Or any other custom paths
  ],
}