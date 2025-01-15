import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * POST /api/workouts/create
 * Inserts a new workout into the "scheduled_workouts" table.
 * Expects JSON in the request body with the fields needed.
 * Checks SSR-based auth with Supabase—no manual token parsing.
 */
export async function POST(request: Request) {
  // 1) Gather cookies for SSR
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

  // 3) Check authentication (must be logged in)
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 4) Parse the incoming JSON body for workout fields
  const body = await request.json();

  // You can destructure the fields, e.g.:
  // const {
  //   date, track_id, workout_details, ...
  // } = body;

  // 5) Insert into "scheduled_workouts"
  //    - You can add extra validations or error-checking if needed
  const { data, error: insertError } = await supabase
    .from("scheduled_workouts")
    .insert({
      // The authenticated user ID
      user_id: userData.user.id,
      gym_id: body.gym_id || null,
      date: body.date,
      track_id: body.track_id,
      workout_details: body.workout_details, // JSONB
      workout_id: body.workout_id,
      scoring_type: body.scoring_type,
      advanced_scoring: body.advanced_scoring,
      origin: body.origin || "user",
      is_template: body.is_template || false,
      warm_up: body.warm_up,
      cool_down: body.cool_down,
      notes: body.notes,
      name: body.name,
      order_type: body.order_type,
      scoring_set: body.scoring_set,
    })
    .single(); // if you want to return the inserted row

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 6) Return success and possibly the inserted row
  return NextResponse.json({
    success: true,
    insertedWorkout: data,
  });
}