// app/api/classes/user-registered/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * This endpoint retrieves class registration information for the
 * authenticated user. It leverages SSR-based cookie handling so
 * we don’t rely on a hardcoded "sb:token" cookie name.
 */
export async function GET() {
  // 1) Retrieve cookies from the Next.js request context.
  const cookieStore = await cookies();
  //    Gather them all into an array for the Supabase SSR client to detect auth tokens.
  const allCookies = cookieStore.getAll();

  // 2) Create a Supabase server client with @supabase/ssr.
  //    This checks all cookies for a valid Supabase session automatically.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Return all cookies so the library can parse the appropriate auth token
      getAll: () => allCookies,
      // No-op if we don’t need to set or refresh cookies in this route
      setAll: () => {},
    },
  });

  // 3) Attempt to retrieve the authenticated user.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  //    Optionally log for debugging:
 // console.log("Supabase user data:", JSON.stringify(userData, null, 2));

  // 4) Handle authentication errors or missing session.
  if (userError) {
    //console.log("[user-registered] Auth error:", userError.message);
    return NextResponse.json(
      { error: userError.message || "Not authenticated" },
      { status: 401 },
    );
  }
  if (!userData?.user) {
    //console.log("[user-registered] No user found in session.");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 },
    );
  }

  // 5) Extract the logged-in user ID from the Supabase auth object.
  const userId = userData.user.id;
  //console.log("[user-registered] Authenticated user ID:", userId);

  // 6) Query the "class_registrations" table to find classes for which this user is registered.
  //    Also include related data from the "class_schedules" foreign table.
  const { data: registrations, error: dbError } = await supabase
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
    .order("start_time", { ascending: true, foreignTable: "class_schedules" });

  // 7) Handle any database errors during the query.
  if (dbError) {
   //console.error("[user-registered] DB error:", dbError.message);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // 8) Return the registrations as JSON.
  return NextResponse.json({ registrations });
}