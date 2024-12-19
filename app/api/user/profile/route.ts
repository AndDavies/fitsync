import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Fetch profile fields including phone and emergency contacts
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('display_name, bio, goals, phone_number, emergency_contact_name, emergency_contact')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Fetch benchmarks
  const { data: benchmarksData, error: benchmarksError } = await supabase
    .from('user_benchmarks')
    .select('id, benchmark_name, benchmark_value, date_recorded')
    .eq('user_id', session.user.id);

  if (benchmarksError) {
    return NextResponse.json({ error: benchmarksError.message }, { status: 500 });
  }

  return NextResponse.json({
    profile: {
      display_name: profileData?.display_name || '',
      bio: profileData?.bio || '',
      goals: profileData?.goals || '',
      phone_number: profileData?.phone_number || '',
      emergency_contact_name: profileData?.emergency_contact_name || '',
      emergency_contact: profileData?.emergency_contact || ''
    },
    benchmarks: benchmarksData || []
  });
}

export async function PUT(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();
  const {
    display_name,
    bio,
    goals,
    phone_number,
    emergency_contact_name,
    emergency_contact
  } = body;

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      display_name,
      bio,
      goals,
      phone_number,
      emergency_contact_name,
      emergency_contact
    })
    .eq('user_id', session.user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
