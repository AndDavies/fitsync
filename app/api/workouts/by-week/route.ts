import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * GET /api/workouts/by-week?start=YYYY-MM-DD&end=YYYY-MM-DD
 *
 * SSR-based endpoint that returns the user's scheduled workouts
 * between `start` and `end` (inclusive).
 */
export async function GET(request: Request) {
  // 1) Retrieve cookies (async in newer Next.js versions)
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // 2) Create SSR-based Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {},
    },
  });

  // 3) Check user auth
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 4) Read query params: 'start' and 'end'
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  // Validate inputs
  if (!start || !end) {
    return NextResponse.json(
      { error: "Missing 'start' or 'end' query params" },
      { status: 400 },
    );
  }

  // 5) Perform the query to "scheduled_workouts"
  // Example logic: filter by user_id OR current_gym_id if needed
  // For simplicity, we only filter by date + user_id.
  // If you want to handle gym tracks or user tracks, adapt accordingly.
  const userId = userData.user.id;

  // This example assumes you store user_id in "scheduled_workouts.user_id"
  const { data: workouts, error: queryError } = await supabase
    .from("scheduled_workouts")
    .select(`
      id,
      date,
      name,
      workout_details,
      warm_up,
      cool_down,
      track_id
    `)
    .eq("user_id", userId)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (queryError) {
    return NextResponse.json(
      { error: queryError.message || "Failed to fetch workouts" },
      { status: 500 },
    );
  }

  // 6) Return the data
  // The client can then group by day-of-week or any other logic.
  return NextResponse.json({ workouts: workouts || [] });
}