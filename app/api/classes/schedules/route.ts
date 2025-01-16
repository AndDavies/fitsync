// app/api/classes/schedules/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Minimal interface for rows in class_schedules, 
 * matching your provided schema (no color column).
 */
interface ClassSchedulesRow {
  id: string;
  current_gym_id: string;
  track_id: string | null;
  class_name: string | null;
  start_time: string | null;
  end_time: string | null;
  max_participants: number | null;
  instructor_id: string | null;
  created_at: string | null;
  class_type_id: string | null;
}

/**
 * GET /api/classes/schedules?gymId=f5731c57-4206-43a7-bce1-583f2a72238e&start=YYYY-MM-DD&end=YYYY-MM-DD
 */
export async function GET(request: Request) {
  try {
    // 1) Parse the URL query params
    const { searchParams } = new URL(request.url);
    const gymId = searchParams.get("gymId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!gymId || !start || !end) {
      return NextResponse.json(
        { error: "Missing 'gymId', 'start', or 'end' query parameter." },
        { status: 400 },
      );
    }

    // 2) Create the SSR Supabase client
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => allCookies,
        setAll: () => {}, // no-op for setting cookies
      },
    });

    // 3) Check user authentication
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }
    if (!userData?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 4) Optionally check the user's role if needed
    // e.g. fetch user_profiles and see if role is "admin" or "coach"
    // if you want to limit who can see schedules:
    // const { data: profile } = await supabase
    //   .from("user_profiles")
    //   .select("role")
    //   .eq("user_id", userData.user.id)
    //   .maybeSingle();
    // if (!profile || (profile.role !== "admin" && profile.role !== "coach")) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // 5) Query the class_schedules table
    //    No "color" column is selected, since your schema doesn’t have it
    //    We do a typed cast afterwards.
    const { data, error } = await supabase
      .from("class_schedules")
      .select(`
        id,
        current_gym_id,
        track_id,
        class_name,
        start_time,
        end_time,
        max_participants,
        instructor_id,
        created_at,
        class_type_id
      `)
      .eq("current_gym_id", gymId)
      .gte("start_time", start)
      .lte("start_time", end)
      .order("start_time", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no rows, return an empty array
    if (!data) {
      return NextResponse.json({ schedules: [] }, { status: 200 });
    }

    // 6) Cast the rows to our local interface
    const schedulesData = data as ClassSchedulesRow[];

    // 7) Return them directly, or transform if you want
    // For now, we just pass them back
    return NextResponse.json({ schedules: schedulesData }, { status: 200 });

  } catch (err: any) {
    console.error("[GET /api/classes/schedules] Internal error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}