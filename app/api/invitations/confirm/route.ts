import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  // 1) Create the Supabase client
  const supabase = createRouteHandlerClient({ cookies });

  // 2) Parse JSON body
  const body = await req.json();
  const { invitation_id, user_id, gym_id } = body;

  // 3) Validate
  if (!invitation_id || !user_id || !gym_id) {
    return NextResponse.json(
      { error: "Missing invitation_id, user_id, or gym_id" },
      { status: 400 }
    );
  }

  // 4) (Optional) Check if the current user is an admin of `gym_id`
  //    or if userData has some role. For brevity, omitted here.

  // 5) Update the invitation’s status → "confirmed"
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

  // 6) Update the user_profile to set `current_gym_id`
  //    Make sure your DB column references match:
  //    - If your user_profiles PK is `id`, use eq("id", user_id).
  //    - If the PK is `user_id`, use eq("user_id", user_id).
  const { error: userProfileError } = await supabase
    .from("user_profiles")
    .update({ current_gym_id: gym_id })
    .eq("user_id", user_id); // or eq("user_id", user_id)

  if (userProfileError) {
    return NextResponse.json(
      { error: userProfileError.message },
      { status: 500 }
    );
  }

  // 7) All good
  return NextResponse.json({ success: true });
}
