import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import axios from 'axios';

const XAI_API_KEY = process.env.XAI_API_KEY;

if (!XAI_API_KEY) {
    throw new Error('Missing XAI_API_KEY environment variable');
}

export async function GET() {
    const supabase = createRouteHandlerClient({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user goals from the database
    const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('goals')
        .eq('user_id', userId)
        .maybeSingle();

    if (profileError) {
        console.error('Error fetching user goals:', profileError.message);
        return NextResponse.json({ error: 'Error fetching user goals' }, { status: 500 });
    }

    const userGoal = profileData?.goals || 'general_health';

    // Fetch recent workouts
    const now = new Date();
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    const { data: recentWorkouts, error: workoutsError } = await supabase
        .from('workout_results')
        .select('id, date_logged, result')
        .eq('user_profile_id', userId)
        .gte('date_logged', sevenDaysAgo.toISOString());

    if (workoutsError) {
        console.error('Error fetching recent workouts:', workoutsError.message);
        return NextResponse.json({ error: 'Error fetching recent workouts' }, { status: 500 });
    }

    const completedWorkoutsCount = recentWorkouts ? recentWorkouts.length : 0;

    // Construct prompt for xAI
    const prompt = `
        User goal: ${userGoal}.
        Number of workouts completed in the last 7 days: ${completedWorkoutsCount}.
        Recent workouts: ${recentWorkouts.map(w => `${w.result}`).join(', ') || 'None'}.
        Provide a motivational and actionable suggestion for the user based on their goal and recent activity.
    `;

    try {
        // Call xAI API
        const xaiResponse = await axios.post(
            'https://api.x.ai/v1/chat/completions', // Correct API endpoint
            {
                messages: [
                    { role: 'system', content: 'You are a motivational fitness assistant.' },
                    { role: 'user', content: prompt },
                ],
                model: 'grok-2-1212', // Use the cost-effective model
                stream: false,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${XAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const suggestion = xaiResponse.data?.choices?.[0]?.message?.content || 'Keep pushing forward!';
        return NextResponse.json({ suggestion });
    } catch (error) {
        // Cast error safely and log details
        const err = error as any;

        console.error(
            'Error calling xAI API:',
            err?.response?.data || err?.message || 'Unknown error occurred'
        );

        return NextResponse.json(
            { error: 'Failed to generate suggestion. Please try again later.' },
            { status: 500 }
        );
    }
}
