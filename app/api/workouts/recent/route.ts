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

  const userId = session.user.id;
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

  // Use select with { count: 'exact', head: true } to get only the count, no rows
  const { count, error } = await supabase
    .from('workout_results')
    .select('id', { count: 'exact', head: true })
    .eq('user_profile_id', userId)
    .gte('date_logged', sevenDaysAgo.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const workoutsCompleted = count || 0;
  return NextResponse.json({ workouts_completed_past_7_days: workoutsCompleted });
}