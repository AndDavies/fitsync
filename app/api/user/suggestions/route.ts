import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import axios from 'axios';
import https from 'https'; // Only needed if you're dealing with self-signed certs

const XAI_API_KEY = process.env.XAI_API_KEY;

if (!XAI_API_KEY) {
    throw new Error('Missing XAI_API_KEY environment variable');
}

// If you previously encountered self-signed certificate errors, you can use this agent in dev only
// const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function GET() {
    const supabase = createRouteHandlerClient({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch the user's goals and onboarding data
    const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('goals, onboarding_data')
        .eq('user_id', userId)
        .maybeSingle();

    if (userProfileError) {
        console.error('Error fetching user profile:', userProfileError.message);
        return NextResponse.json({ error: 'Error fetching user profile' }, { status: 500 });
    }

    const userGoal = userProfile?.goals || 'general_health';
    const onboardingData = userProfile?.onboarding_data || {};

    // Fetch recent workouts from the last 7 days
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

    // Construct the prompt with onboarding and workout data
    const prompt = `
    User Onboarding Data:
    - Primary Goal: ${onboardingData.primaryGoal || 'not specified'}
    - Activity Level: ${onboardingData.activityLevel || 'not specified'}
    - Lifestyle Note: ${onboardingData.lifestyleNote || 'no notes'}

    Recent Activity (Last 7 Days):
    - Total Workouts Completed: ${completedWorkoutsCount}
    - Recent Workout Types: ${recentWorkouts.map(w => w.result).join(', ') || 'None'}

    Based on the user's primary goal and recent activity, provide a motivational and actionable suggestion to help them progress. It should be short, concise. Provide insight. any recommendations should be bullet points. 
    `;

    try {
        // Call the xAI API
        const xaiResponse = await axios.post(
            'https://api.x.ai/v1/chat/completions',
            {
                messages: [
                    { role: 'system', content: 'You are a motivational fitness assistant.' },
                    { role: 'user', content: prompt },
                ],
                model: 'grok-2-1212', // cost-effective model choice
                stream: false,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${XAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                // httpsAgent, // Uncomment if needed for local SSL issues (dev only)
            }
        );

        const suggestion = xaiResponse.data?.choices?.[0]?.message?.content || 'Keep pushing forward!';
        return NextResponse.json({ suggestion });
    } catch (error) {
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
