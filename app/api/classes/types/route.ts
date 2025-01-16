// app/api/classes/types/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * GET /api/classes/types?gymId=<ID>
 * POST /api/classes/types
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gymId = searchParams.get("gymId");

  if (!gymId) {
    return NextResponse.json({ error: "Missing gymId" }, { status: 400 });
  }

  // Build SSR Supabase client
  const cookieStore = await cookies(); // <= new approach
  const allCookies = cookieStore.getAll();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => allCookies,
        setAll: () => {},
      },
    }
  );

  // Check user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Query class_types by gym_id
  const { data: classTypes, error: ctError } = await supabase
    .from("class_types")
    .select("id, class_name, description, color")
    .eq("gym_id", gymId);

  if (ctError) {
    return NextResponse.json({ error: ctError.message }, { status: 500 });
  }

  return NextResponse.json({ classTypes });
}

// For creating a new class type
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => allCookies,
        setAll: () => {},
      },
    }
  );

  // Check user
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Check role from user_profiles
  const { data: profile, error: profErr } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (profErr || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (profile.role !== "admin" && profile.role !== "coach") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Insert
  const body = await request.json();
  const { class_name, description, color, gym_id } = body;

  const { error: insertError } = await supabase
    .from("class_types")
    .insert({ class_name, description, color, gym_id });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}