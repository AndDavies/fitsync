// app/api/user/suggestions/route.ts
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

  // Fetch the user's goal from `user_profiles`
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('goals')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const userGoal = profileData?.goals || 'general_health';

  // Fetch recent workouts to see what they've done recently
  const now = new Date();
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

  const { data: recentWorkouts, error: workoutsError } = await supabase
    .from('workout_results')
    .select('id, date_logged, result')
    .eq('user_profile_id', userId)
    .gte('date_logged', sevenDaysAgo.toISOString());

  if (workoutsError) {
    return NextResponse.json({ error: workoutsError.message }, { status: 500 });
  }

  // Simple heuristic logic
  let suggestion = "Keep up the good work! Consider adding more variety if you feel stuck.";

  // Example heuristic: If user's goal is endurance and no workouts logged in the last 7 days that look like a run
  // (For simplicity, we’ll just say if no workouts at all, suggest a run.)
  const completedWorkoutsCount = recentWorkouts ? recentWorkouts.length : 0;

  if (userGoal.toLowerCase().includes('endurance') && completedWorkoutsCount === 0) {
    suggestion = "Your goal is endurance. Try adding a short run or cycle session this week!";
  } else if (userGoal.toLowerCase().includes('strength') && completedWorkoutsCount === 0) {
    suggestion = "Your goal is strength. Consider a strength workout session to boost your performance!";
  }

  // You can add more logic or check the workout results structure to differentiate between run/cycle/strength workouts later.

  return NextResponse.json({ suggestion });
}
