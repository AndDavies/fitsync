import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Await the params to get the id
  const { id } = await params;
  const gymId = id;

  const { data, error } = await supabase
    .from('gyms')
    .select('id,name,member_code')
    .eq('id', gymId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
  }

  return NextResponse.json({ ...data }, { status: 200 });
}