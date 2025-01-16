// app/api/classes/fetch/route.ts  (or /api/classes/fetch)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  // 1) Grab cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // 2) Create a Supabase server client with SSR
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {},
    },
  });

  // 3) Check user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: userError?.message || "Not authenticated" }, { status: 401 });
  }

  // 4) userId + fetch userProfile to get gymId
  const userId = userData.user.id;
  const { data: userProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("current_gym_id")
    .eq("user_id", userId)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!userProfile?.current_gym_id) {
    // user has no current_gym_id
    return NextResponse.json({ classes: [] });
  }
  const gymId = userProfile.current_gym_id;

  // 5) Fetch upcoming classes for this gym
  //    and join on class_registrations + user_profiles
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
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(10);

  if (classesError) {
    console.error(classesError);
    return NextResponse.json({ error: classesError.message }, { status: 500 });
  }

  return NextResponse.json({ classes });
}