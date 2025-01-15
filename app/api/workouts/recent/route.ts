// app/api/workouts/your-route/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  // 1) Prepare your Supabase URL & Key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // 2) In Next.js 15, `cookies()` is async
  const cookieStore = await cookies();
  // we can store them in a synchronous variable
  const allCookies = cookieStore.getAll();

  // 3) Create the server client from @supabase/ssr
  //    (requires 3 arguments: url, anon key, options with cookies)
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return allCookies;
      },
      setAll() {
        // no-op if you don't need to set cookies in this route
      },
    },
  });

  // 4) Attempt to get the user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }
  if (!userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 5) Now we have a validated user. 
  //    Perform your query (the “7 days workouts completed” example).
  const userId = userData.user.id;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

  // Use select with { count: 'exact', head: true } to get only the count, no rows
  const { count, error } = await supabase
    .from("workout_results")
    .select("id", { count: "exact", head: true })
    .eq("user_profile_id", userId)
    .gte("date_logged", sevenDaysAgo.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const workoutsCompleted = count || 0;
  return NextResponse.json({ workouts_completed_past_7_days: workoutsCompleted });
}