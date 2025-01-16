// /middleware.ts (the final one)
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  const cookieStore = req.cookies.getAll();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore,
        setAll: () => {},
      },
    }
  );

  // Check user
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Possibly fetch user role, etc.
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", userData.user.id)
    .single();

  // If user tries /admin but not admin, redirect...
  // If user tries /user but not user, redirect...
  // If user tries /dashboard etc.

  return res;
}

export const config = {
  // Merge all matchers in 1 place:
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/dashboard/:path*",
    "/api/:path*",
  ],
};