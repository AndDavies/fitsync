import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

export async function POST(req: Request) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = user.id;
  const body = await req.json();
  const { benchmark_name, benchmark_value } = body;

  if (!benchmark_name || !benchmark_value) {
    return NextResponse.json({ error: 'Missing benchmark_name or benchmark_value' }, { status: 400 });
  }

  const { error: insertError } = await supabase
    .from('user_benchmarks')
    .insert({
      user_id: userId,
      benchmark_name,
      benchmark_value
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
