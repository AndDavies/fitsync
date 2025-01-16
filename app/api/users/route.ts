// app/api/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * If you want this route to be private, do auth.getUser() => 401 if not found.
 * If it's public, skip the auth check. For example, let's assume it's private:
 */
export async function GET(req: NextRequest) {
  // 1) Retrieve cookies + create SSR supabase client
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {},
    },
  });

  // 2) Optionally check user if this route is private:
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: userError?.message || "Not authenticated" }, { status: 401 });
  }

  // 3) Parse the 'gym_id' from the query string
  const { searchParams } = new URL(req.url);
  const gymId = searchParams.get("gym_id");

  if (!gymId) {
    return NextResponse.json({ error: "Invalid or missing gym_id" }, { status: 400 });
  }

  // 4) Query user_profiles for that gym
  //    If you also have RLS, this query must be allowed in your policy.
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, display_name, email, role") // updated column names if needed
    .eq("current_gym_id", gymId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}