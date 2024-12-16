import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  const protectedRoutes = ['/dashboard', '/onboarding'];

  // Check if the request is for a protected route
  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    // Redirect to login if session is not valid
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Sync the session from the request's cookies to the response's cookies
  return res;
}
