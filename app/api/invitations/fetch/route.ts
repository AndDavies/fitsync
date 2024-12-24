// app/api/invitations/fetch/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const gymId = searchParams.get("gym_id");

  if (!gymId) {
    // Always return JSON, even on errors
    return NextResponse.json({ error: "Missing gym_id" }, { status: 400 });
  }

  // Query
  const { data: invitations, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("gym_id", gymId);

  if (error) {
    // Must return JSON if there's an error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If no invites, invitations will be []
  // This is still valid JSON
  return NextResponse.json({ invitations: invitations || [] });
}
