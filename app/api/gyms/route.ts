import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  let q = supabase.from('gyms').select('id,name');

  if (query && query.trim().length > 0) {
    q = q.ilike('name', `%${query.trim()}%`);
  }

  const { data, error } = await q;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ gyms: data || [] }, { status: 200 });
}
