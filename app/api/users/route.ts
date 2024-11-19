import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gymId = searchParams.get('gym_id');

  if (!gymId) {
    return NextResponse.json({ error: 'Invalid or missing gym_id' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, name, email, role')
    .eq('current_gym_id', gymId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}