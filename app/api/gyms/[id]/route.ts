// app/api/gyms/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1) Retrieve cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // 2) Create supabase server client with SSR
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {},
    },
  });

  // 3) Await the dynamic param
  const { id } = await params;
  const gymId = id;

  // 4) Query the "gyms" table by gymId
  const { data, error } = await supabase
    .from("gyms")
    .select("id, name, member_code")
    .eq("id", gymId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Gym not found" }, { status: 404 });
  }

  return NextResponse.json({ ...data }, { status: 200 });
}