// app/api/community/workouts/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // In Next.js 15, cookies() is async:
  const cookieStore = await cookies();
  // Let's store them synchronously in a variable
  const allCookies = cookieStore.getAll();

  // Create minimal “sync” cookie interface:
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {
        // no-op if you don't need to set cookies from this route
        // or if you do, you can wire up next/headers writing logic here
      },
    },
  });

  // 1) Attempt to get user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }
  if (!userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2) Then do your DB query:
  const { data: results, error } = await supabase
    .from("workout_results")
    .select(`
      id,
      user_profile_id,
      result,
      scoring_type,
      date_logged,
      user_profiles (display_name)
    `)
    .order("date_logged", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results });
}