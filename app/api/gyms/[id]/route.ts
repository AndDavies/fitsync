import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const gymId = params.id;

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

  // We might not want to return member_code here for security reasons,
  // but if needed, you can. Just be cautious.
  
  return NextResponse.json({ ...data }, { status: 200 });
}
