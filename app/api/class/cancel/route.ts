// app/api/class/cancel/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
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

    // 2) Check user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: userError?.message || "Unauthorized" }, { status: 401 });
    }
    const userId = userData.user.id;

    // 3) Parse incoming JSON
    const { class_schedule_id } = await request.json();

    // 4) Delete or update the registration
    const { error: deleteError } = await supabase
      .from("class_registrations")
      .delete()
      .eq("class_schedule_id", class_schedule_id)
      .eq("user_profile_id", userId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    // 5) Return success
    return NextResponse.json({ success: true, message: "Registration canceled" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}