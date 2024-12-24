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

  const userId = session.user.id;

  // Query class_registrations, then join class_schedules via class_schedule_id
  // Remove date filters for now so you can confirm you get rows back
  const { data: registrations, error } = await supabase
    .from("class_registrations")
    .select(`
      id,
      user_profile_id,
      status,
      registration_date,
      class_schedules (
        id,
        class_name,
        start_time,
        end_time,
        max_participants
      )
    `)
    .eq("user_profile_id", userId)
    // Sort by start_time of the joined class
    .order("start_time", { ascending: true, foreignTable: "class_schedules" });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // This will return an array of registrations like:
  // [
  //   {
  //     id: "f5e32d72-6b83-43d1-b2db-892853d6d12c",
  //     user_profile_id: "...",
  //     status: "...",
  //     registration_date: "...",
  //     class_schedules: {
  //       id: "ce426cb5-c9d0-4f91-942c-8a352376719e",
  //       class_name: "WOD",
  //       start_time: "2024-12-11 11:00:00+00",
  //       ...
  //     }
  //   },
  //   ...
  // ]

  return NextResponse.json({ registrations });
}
