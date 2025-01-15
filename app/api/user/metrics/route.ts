// app/api/user/metrics/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * This endpoint returns the number of workouts a user has completed in the past 7 days.
 *
 * - It checks the user's session via cookies (no "sb:token" hardcoded).
 * - If authenticated, it queries the "workout_results" table to count workouts for the last 7 days.
 */

export async function GET() {
  // 1) Retrieve cookies from the Next.js Request. 
  //    "cookies()" can be sync or async depending on Next.js version, but we’ll assume an up-to-date version.
  const cookieStore = await cookies();
  //    Collect all cookies into an array so that @supabase/ssr can scan them for an auth session token.
  const allCookies = cookieStore.getAll();

  // 2) Create a Supabase server client with @supabase/ssr.
  //    This automatically looks for any valid session cookie (no need to parse "sb:token").
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Provide the array of cookies so Supabase can detect the session
      getAll: () => allCookies,
      // If this route were to set or refresh cookies, define setAll. For now, a no-op is enough.
      setAll: () => {},
    },
  });

  // 3) Attempt to retrieve the authenticated user (if any).
  const { data: userData, error: userError } = await supabase.auth.getUser();

  // Optional: Log user data for debugging
  //console.log("Supabase user data:", JSON.stringify(userData, null, 2));

  // 4) Handle authentication errors or missing user sessions.
  if (userError) {
    console.log("User error:", userError.message);
    return NextResponse.json(
      { error: userError.message || "Not authenticated" },
      { status: 401 },
    );
  }
  if (!userData?.user) {
    // If user is null, that means no valid session or token
    console.log("User not authenticated");
    return NextResponse.json(
      { error: "Auth session missing!" },
      { status: 401 },
    );
  }

  // 5) Extract user ID from the session object. 
  //    We'll use this to filter the user's workout records.
  const userId = userData.user.id;
  console.log("Authenticated user ID:", userId);

  // 6) Calculate the date 7 days ago. 
  //    We'll use this to filter workout logs in the last 7 days.
  const now = new Date();
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

  // 7) Query the "workout_results" table to count how many workouts were completed in that date range.
  //    - We do a "select('id', { count: 'exact', head: true })" so we don't fetch the rows themselves, only the count.
  //    - We filter by "user_profile_id" == the user ID (assuming "user_profile_id" references the same ID as in auth.users).
  //    - We also check that "date_logged" >= sevenDaysAgo.
  const { count, error: workoutsError } = await supabase
    .from("workout_results")
    .select("id", { count: "exact", head: true })
    .eq("user_profile_id", userId)
    .gte("date_logged", sevenDaysAgo.toISOString());

  // 8) Handle any errors returned by the Supabase query.
  if (workoutsError) {
    console.log("Database error fetching workout_results:", workoutsError.message);
    return NextResponse.json({ error: workoutsError.message }, { status: 500 });
  }

  // 9) If no error, "count" may be null or a number. We default to 0 if null.
  const workouts_completed_past_7_days = count || 0;
  console.log(`User ${userId} completed ${workouts_completed_past_7_days} workouts in the past 7 days.`);

  // 10) Return the result as JSON, to be consumed by your client component (e.g., DashboardClient).
  return NextResponse.json({ workouts_completed_past_7_days });
}