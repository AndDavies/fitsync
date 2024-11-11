// app/middleware.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

export async function middleware(req: Request) {
  const { url } = req;

  // Allow access to login and signup pages without authentication
  if (url.includes('/login') || url.includes('/signup')) {
    return NextResponse.next();
  }

  // Get the session asynchronously
  const { data: session } = await supabase.auth.getSession();

  // If no session and trying to access a protected route, redirect to login
  if (!session && (url.includes('/dashboard') || url.includes('/workouts'))) {
    return NextResponse.redirect(new URL('/login', url));
  }

  // Allow the request to continue if session exists
  return NextResponse.next();
}

export const config = {
  // Specify protected routes
  matcher: ['/dashboard/:path*', '/workouts/:path*'], // Add any other routes you want to protect
};
