import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient({ req, res });

  // Get user session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to the login page
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Fetch the user's role from the database
  const { data: user, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error || !user?.role) {
    console.error("Error fetching user role:", error?.message);
    return NextResponse.redirect(new URL("/login", req.url)); // Default to redirect to login if role isn't available
  }

  const userRole = user.role;

  // Role-based route protection
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin") && userRole !== "admin") {
    // Redirect non-admin users trying to access admin routes
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/user") && userRole !== "user") {
    // Redirect non-regular users trying to access user-only routes
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow request to continue if role matches
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"], // Apply middleware to these routes
};
  