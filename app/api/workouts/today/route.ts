// app/api/workouts/today/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Helper to format today's date as 'YYYY-MM-DD'
 */
function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET() {
  // 1) Retrieve cookies from Next.js
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // 2) Create our Supabase server client using @supabase/ssr
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {},
    },
  });

  // 3) Check if user is authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser();
  //console.log("Supabase user data:", JSON.stringify(userData, null, 2));

  if (userError) {
    //console.log("User error:", userError.message);
    return NextResponse.json(
      { error: userError.message || "Not authenticated" },
      { status: 401 },
    );
  }

  if (!userData?.user) {
    //console.log("User not authenticated");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Extract userId
  const userId = userData.user.id;

  // 4) Fetch the user’s profile (e.g., to get current_gym_id)
  //console.log("Fetching profile for userId:", userId);
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  //console.log("Profile data:", JSON.stringify(profile, null, 2));

  if (profileError) {
    //console.log("Profile error:", profileError.message);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profile) {
    //console.log("Profile not found for user:", userId);
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // 5) Build the query for scheduled_workouts table
  const today = getTodayDateString(); // e.g. '2025-01-14'
  //console.log("Querying scheduled_workouts for date:", today);

  // Prepare the Supabase query
  let query = supabase
    .from("scheduled_workouts")
    .select("id, date, workout_details, name, warm_up, cool_down")
    .eq("date", today);

  // Build a string describing our filters for debugging:
  let filterString = `date = '${today}'`;

  // If user has current_gym_id, we do an OR
  if (profile.current_gym_id) {
    query = query.or(`user_id.eq.${userId},gym_id.eq.${profile.current_gym_id}`);
    // Build a pseudo-SQL debug string
    filterString += ` AND (user_id = '${userId}' OR gym_id = '${profile.current_gym_id}')`;
  } else {
    query = query.eq("user_id", userId);
    // Build a pseudo-SQL debug string
    filterString += ` AND user_id = '${userId}'`;
  }

  // Log out the pseudo-SQL so we can see precisely what is being queried
  // console.log(
  //   `Constructed query: SELECT id, date, workout_details, name, warm_up, cool_down
  //    FROM scheduled_workouts
  //    WHERE ${filterString}`
  // );

  // 6) Execute the query
  const { data: scheduledWorkouts, error: workoutsError } = await query;

  if (workoutsError) {
    //console.log("Workouts error:", workoutsError.message);
    return NextResponse.json(
      { error: workoutsError.message || "Failed to fetch workouts" },
      { status: 500 },
    );
  }

  // If nothing was found, return an empty array
  if (!scheduledWorkouts || scheduledWorkouts.length === 0) {
    //console.log("No scheduled workouts found for user:", userId);
    return NextResponse.json({ scheduledWorkouts: [] });
  }

  // 7) Return the workouts
  return NextResponse.json({ scheduledWorkouts });
}