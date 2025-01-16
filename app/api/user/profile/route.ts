// app/api/profile/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * GET /api/profile
 *  - Returns the user's profile data, including phone, emergency contacts,
 *    plus benchmarks from user_benchmarks.
 */
export async function GET() {
  // 1) Retrieve cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // 2) Create a Supabase server client with @supabase/ssr
  //    No more createRouteHandlerClient!
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {
        // no-op if you don't need to set cookies here
      },
    },
  });

  // 3) Confirm user session
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: userError?.message || "Not authenticated" }, { status: 401 });
  }

  const userId = userData.user.id;

  // 4) Fetch profile fields
  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("display_name, bio, goals, phone_number, emergency_contact_name, emergency_contact")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // 5) Fetch benchmarks
  const { data: benchmarksData, error: benchmarksError } = await supabase
    .from("user_benchmarks")
    .select("id, benchmark_name, benchmark_value, date_recorded")
    .eq("user_id", userId);

  if (benchmarksError) {
    return NextResponse.json({ error: benchmarksError.message }, { status: 500 });
  }

  return NextResponse.json({
    profile: {
      display_name: profileData?.display_name ?? "",
      bio: profileData?.bio ?? "",
      goals: profileData?.goals ?? "",
      phone_number: profileData?.phone_number ?? "",
      emergency_contact_name: profileData?.emergency_contact_name ?? "",
      emergency_contact: profileData?.emergency_contact ?? "",
    },
    benchmarks: benchmarksData ?? [],
  });
}

/**
 * PUT /api/profile
 *  - Updates user_profiles with fields like display_name, phone, etc.
 */
export async function PUT(req: Request) {
  // 1) Retrieve cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // 2) Create a Supabase server client with @supabase/ssr
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {},
    },
  });

  // 3) Confirm user session
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: userError?.message || "Not authenticated" }, { status: 401 });
  }

  // 4) Parse JSON body
  const body = await req.json();
  const {
    display_name,
    bio,
    goals,
    phone_number,
    emergency_contact_name,
    emergency_contact,
  } = body;

  // 5) Update user_profiles
  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      display_name,
      bio,
      goals,
      phone_number,
      emergency_contact_name,
      emergency_contact,
    })
    .eq("user_id", userData.user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}