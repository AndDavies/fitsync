// app/middleware.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

export async function middleware(req: Request) {
  // Get the session asynchronously
  const { data: session } = await supabase.auth.getSession();

  // If no session and trying to access a protected route, redirect to login
  if (!session && req.url.includes('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Allow the request to continue if session exists
  return NextResponse.next();
}

export const config = {
  // Specify protected routes
  matcher: ['/dashboard', '/workouts'], // Add any other routes you want to protect
};
