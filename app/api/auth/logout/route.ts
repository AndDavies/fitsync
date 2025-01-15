import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // 1) Sign out to invalidate refresh token on Supabase
  await supabase.auth.signOut();

  // 2) Clear cookies. 
  // If you store access/refresh tokens in a 'sb:token' cookie, remove it:
  const res = NextResponse.json({ success: true });
  res.cookies.set("sb:token", "", { path: "/", maxAge: 0 }); // effectively clearing it
  return res;
}