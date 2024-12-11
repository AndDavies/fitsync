import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

export async function GET() {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = user.id;

  // Fetch user profile
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('display_name, bio, goals')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Fetch user benchmarks
  const { data: benchmarksData, error: benchmarksError } = await supabase
    .from('user_benchmarks')
    .select('id, benchmark_name, benchmark_value, date_recorded')
    .eq('user_id', userId);

  if (benchmarksError) {
    return NextResponse.json({ error: benchmarksError.message }, { status: 500 });
  }

  return NextResponse.json({
    profile: profileData || {},
    benchmarks: benchmarksData || []
  });
}

export async function PUT(req: Request) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = user.id;
  const body = await req.json();
  const { display_name, bio, goals } = body;

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      display_name,
      bio,
      goals
    })
    .eq('user_id', userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
