// app/api/community/workouts/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // Optional: If you only want authenticated users to see this feed,
  // you can check for a session:
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 1. Get recent results, join user profile (for display name)
  //    (Assuming user_profile_id -> user_profiles.id relationship)
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
    .limit(10); // last 10 results, for example

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results });
}
