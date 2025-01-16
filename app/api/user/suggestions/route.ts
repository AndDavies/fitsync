// app/api/user/suggestions/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import axios from "axios";
import https from "https";

const XAI_API_KEY = process.env.XAI_API_KEY;
if (!XAI_API_KEY) {
  throw new Error("Missing XAI_API_KEY environment variable");
}

// If you use self-signed certs, you might define an httpsAgent, but typically not needed
// const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function GET() {
  // 1) Grab cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // 2) Create the supabase server client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {},
    },
  });

  // 3) Confirm user session
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: userError?.message || "Not authenticated" }, { status: 401 });
  }

  const userId = userData.user.id;

  // 4) Fetch user goals + onboarding_data
  const { data: userProfile, error: userProfileError } = await supabase
    .from("user_profiles")
    .select("goals, onboarding_data")
    .eq("user_id", userId)
    .maybeSingle();

  if (userProfileError) {
    console.error("Error fetching user profile:", userProfileError.message);
    return NextResponse.json({ error: "Error fetching user profile" }, { status: 500 });
  }

  const userGoal = userProfile?.goals || "general_health";
  const onboardingData = userProfile?.onboarding_data || {};

  // 5) Fetch recent workouts (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

  const { data: recentWorkouts, error: workoutsError } = await supabase
    .from("workout_results")
    .select("id, date_logged, result")
    .eq("user_profile_id", userId)
    .gte("date_logged", sevenDaysAgo.toISOString());

  if (workoutsError) {
    console.error("Error fetching recent workouts:", workoutsError.message);
    return NextResponse.json({ error: "Error fetching recent workouts" }, { status: 500 });
  }

  const completedWorkoutsCount = recentWorkouts ? recentWorkouts.length : 0;

  // 6) Build the prompt for xAI
  const prompt = `
    User Onboarding Data:
    - Primary Goal: ${onboardingData.primaryGoal || "not specified"}
    - Activity Level: ${onboardingData.activityLevel || "not specified"}
    - Lifestyle Note: ${onboardingData.lifestyleNote || "no notes"}

    Recent Activity (Last 7 Days):
    - Total Workouts Completed: ${completedWorkoutsCount}
    - Recent Workout Types: ${recentWorkouts.map((w) => w.result).join(", ") || "None"}

    Provide a motivational, concise suggestion with bullet points.
  `;

  // 7) Call xAI API
  try {
    const xaiResponse = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        messages: [
          { role: "system", content: "You are a motivational fitness assistant." },
          { role: "user", content: prompt },
        ],
        model: "grok-2-1212",
        stream: false,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${XAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        // httpsAgent, // if needed for local SSL
      }
    );

    const suggestion =
      xaiResponse.data?.choices?.[0]?.message?.content || "Keep pushing forward!";
    return NextResponse.json({ suggestion });
  } catch (error) {
    const err = error as any;
    console.error(
      "Error calling xAI API:",
      err?.response?.data || err?.message || "Unknown error occurred"
    );

    return NextResponse.json(
      { error: "Failed to generate suggestion. Please try again later." },
      { status: 500 }
    );
  }
}