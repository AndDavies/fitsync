// app/api/classes/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 1. Identify user’s gym (assuming user_profiles.gym_id)
  const userId = session.user.id;
  const { data: userProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("current_gym_id")
    .eq("user_id", userId)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }
  if (!userProfile?.current_gym_id) {
    return NextResponse.json({ classes: [] });
  }

  const gymId = userProfile.current_gym_id;

  // 2. Fetch upcoming classes for this gym
  //    and join on the "class_registrations" table.
  //    We'll use a Supabase relationship alias:
  //    "class_registrations" -> references "class_schedule_id".
  //    Within that, also join user_profiles to get display_name.
  const { data: classes, error: classesError } = await supabase
    .from("class_schedules")
    .select(`
      id,
      class_name,
      start_time,
      end_time,
      max_participants,
      class_registrations (
        id,
        user_profile_id,
        registration_date,
        status,
        user_profiles ( display_name )
      )
    `)
    .eq("current_gym_id", gymId)
    .gte("start_time", new Date().toISOString()) // only upcoming
    .order("start_time", { ascending: true })
    .limit(10);

  if (classesError) {
    console.error(classesError);
    return NextResponse.json({ error: classesError.message }, { status: 500 });
  }

  return NextResponse.json({ classes });
}
