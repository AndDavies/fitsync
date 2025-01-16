// app/api/class/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
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

  // 2) Parse JSON body
  const { class_schedule_id } = await req.json();

  // 3) Check user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: userError?.message || "Not authenticated" }, { status: 401 });
  }
  const userId = userData.user.id;

  // 4) Check if user already registered
  const { data: existing, error: existingError } = await supabase
    .from("class_registrations")
    .select("id, status")
    .eq("class_schedule_id", class_schedule_id)
    .eq("user_profile_id", userId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }
  if (existing) {
    return NextResponse.json(
      { error: "Already registered", status: existing.status },
      { status: 400 }
    );
  }

  // 5) Get confirmed count
  const { count: confirmedCount, error: confirmedError } = await supabase
    .from("class_registrations")
    .select("id", { count: "exact" })
    .eq("class_schedule_id", class_schedule_id)
    .eq("status", "confirmed");

  if (confirmedError) {
    return NextResponse.json({ error: confirmedError.message }, { status: 400 });
  }

  // 6) Fetch schedule to see max_participants
  const { data: scheduleData, error: scheduleError } = await supabase
    .from("class_schedules")
    .select("max_participants")
    .eq("id", class_schedule_id)
    .maybeSingle();

  if (scheduleError || !scheduleData) {
    return NextResponse.json({ error: "Unable to fetch schedule data" }, { status: 400 });
  }

  // 7) Decide if the user is confirmed or waitlisted
  const confirmed = confirmedCount || 0;
  const status = confirmed < scheduleData.max_participants ? "confirmed" : "waitlisted";

  // 8) Insert new registration
  const { error: insertError } = await supabase
    .from("class_registrations")
    .insert({
      class_schedule_id,
      user_profile_id: userId,
      registration_date: new Date().toISOString(),
      status,
    });

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to register: " + insertError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ status }, { status: 200 });
}