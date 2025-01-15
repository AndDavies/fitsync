import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * GET /api/workouts/ideas?category=Hero
 * Optionally checks for user auth (if you want only logged-in users to see ideas).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "";

  // SSR-based Supabase client
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => allCookies,
        setAll: () => {},
      },
    }
  );

  // (Optional) If you want these ideas only for logged-in users, do an auth check:
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    // Or skip this if you want the ideas to be publicly available
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Query 'workouts' table
  const { data, error } = await supabase
    .from("workouts")
    .select("workoutid, title, description")
    .eq("category", category)
    .neq("title", "Warm Up")
    .neq("title", "warm up")
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ workouts: data || [] });
}