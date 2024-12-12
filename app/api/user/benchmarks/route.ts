// app/api/user/benchmarks/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session }, error: authError } = await supabase.auth.getSession()

  if (authError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch all benchmarks
  const { data: benchmarksData, error: benchmarksError } = await supabase
    .from('benchmarks')
    .select('id, name, category, units, description')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (benchmarksError) {
    return NextResponse.json({ error: benchmarksError.message }, { status: 500 });
  }

  // Fetch user results for these benchmarks
  // Assuming a `user_benchmark_results` table with: id, user_id, benchmark_id, result_value, date_recorded
  const benchmarkIds = benchmarksData?.map(b => b.id) || [];
  const { data: resultsData, error: resultsError } = await supabase
    .from('user_benchmark_results')
    .select('benchmark_id, result_value')
    .eq('user_id', userId)
    .in('benchmark_id', benchmarkIds);

  if (resultsError) {
    return NextResponse.json({ error: resultsError.message }, { status: 500 });
  }

  const userResultsMap = new Map(resultsData?.map(r => [r.benchmark_id, r.result_value]));

  const responseData = (benchmarksData || []).map(b => ({
    ...b,
    user_result: userResultsMap.get(b.id) || null
  }));

  return NextResponse.json({ benchmarks: responseData });
}
