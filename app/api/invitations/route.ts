import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();
  const { gym_id, member_code } = body;

  if (!gym_id || !member_code) {
    return NextResponse.json({ error: 'Missing gym_id or member_code' }, { status: 400 });
  }

  // Check if user already has a pending invitation
  const { data: existingInvitations, error: existingError } = await supabase
    .from('invitations')
    .select('id, status, gym_id')
    .eq('user_id', session.user.id)
    .eq('status', 'pending');

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existingInvitations && existingInvitations.length > 0) {
    // User already has a pending request
    return NextResponse.json({ error: 'You already have a pending request.', status: 'pending' }, { status: 409 });
  }

  // Fetch the gym and check member_code
  const { data: gymData, error: gymError } = await supabase
    .from('gyms')
    .select('id, member_code')
    .eq('id', gym_id)
    .maybeSingle();

  if (gymError || !gymData) {
    return NextResponse.json({ error: gymError?.message || 'Gym not found' }, { status: 404 });
  }

  // Convert both sides to string to ensure correct comparison
  const gymMemberCodeStr = String(gymData.member_code).trim();
  const inputMemberCodeStr = String(member_code).trim();

  if (gymMemberCodeStr !== inputMemberCodeStr) {
    return NextResponse.json({ error: 'Invalid member code' }, { status: 400 });
  }

  // Insert invitation record
  const { error: inviteError } = await supabase
    .from('invitations')
    .insert({
      user_id: session.user.id,
      gym_id,
      status: 'pending'
    });

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Membership request pending approval.', status: 'pending' }, { status: 200 });
}
