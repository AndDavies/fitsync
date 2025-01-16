// app/api/gyms/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
  // 1) Retrieve cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // 2) Create supabase server client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {},
    },
  });

  // 3) Parse search param
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";

  // 4) Build query
  let q = supabase.from("gyms").select("id, name");
  if (query.trim().length > 0) {
    q = q.ilike("name", `%${query.trim()}%`);
  }

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ gyms: data || [] }, { status: 200 });
}