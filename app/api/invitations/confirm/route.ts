// app/api/invitations/confirm/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  // Optional: check admin role
  const body = await req.json();
  const { invitation_id, user_id, gym_id } = body;

  if (!invitation_id || !user_id || !gym_id) {
    return NextResponse.json(
      { error: "Missing invitation_id, user_id, or gym_id" },
      { status: 400 }
    );
  }

  // 1) Update the invitation's status to "confirmed"
  const { error: inviteError } = await supabase
    .from("invitations")
    .update({ status: "confirmed" })
    .eq("id", invitation_id);

  if (inviteError) {
    return NextResponse.json(
      { error: inviteError.message },
      { status: 500 }
    );
  }

  // 2) Update user_profiles to set current_gym_id
  const { error: userProfileError } = await supabase
    .from("user_profiles")
    .update({ current_gym_id: gym_id })
    .eq("id", user_id) // or eq("user_id", user_id) depending on your schema

  if (userProfileError) {
    return NextResponse.json(
      { error: userProfileError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
