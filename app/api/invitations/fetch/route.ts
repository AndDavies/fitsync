// app/api/invitations/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  // Optional: check admin role
  const { searchParams } = new URL(req.url);
  const gymId = searchParams.get("gym_id");

  if (!gymId) {
    return NextResponse.json(
      { error: "Missing gym_id" },
      { status: 400 }
    );
  }

  // query invitations for that gym
  const { data: invitations, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("gym_id", gymId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invitations });
}
