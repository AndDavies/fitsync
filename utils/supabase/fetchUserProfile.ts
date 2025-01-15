// utils/supabase/fetchUserProfile.ts

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * Interface describing the user_profiles row shape.
 * You can adapt field types (string | null) as needed based on your DB schema.
 */
export interface UserProfile {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  created_at: string | null;
  role: string | null;
  current_gym_id: string | null;
  email: string | null;
  profile_picture: string | null;
  join_date: string | null;
  last_login: string | null;
  activity_level: string | null;
  phone_number: string | null;
  emergency_contact: string | null;
  subscription_plan: string | null;
  trainer_id: string | null;
  goals: string | null;
  weight: number | null;
  height: number | null;
  metrics: Record<string, any> | null;
  notifications_enabled: boolean;
  onboarding_completed: boolean;
  age: number | null;
  gender: string | null;
  postal_code: string | null;
  occupation: string | null;
  onboarding_data: {
    primaryGoal?: string;
    activityLevel?: string;
    lifestyleNote?: string;
  } | null;
  emergency_contact_name: string | null;
  last_name: string | null;
}

/**
 * fetchUserProfile:
 * 1) Creates a server-side Supabase client.
 * 2) Fetches the current user session (auth.getUser()).
 * 3) If no user found, optionally redirect or return { user: null, profile: null }.
 * 4) Fetches the matching row from user_profiles, cast to UserProfile.
 */
export async function fetchUserProfile(options?: { redirectIfNoUser?: boolean }) {
  // 1) Create the server client
  const supabase = await createClient();

  // 2) Get user session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (options?.redirectIfNoUser) {
      redirect("/login");
      // No code runs after redirect()
    }
    // If not redirecting automatically, just return null data
    return { user: null, profile: null };
  }

  // 3) Fetch the user_profiles row
  //    If no row is found, 'profile' can be null
  const { data: rawProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching user profile:", profileError.message);
  }

  // Cast the returned data to our UserProfile interface or null
  const profile = rawProfile ? (rawProfile as UserProfile) : null;

  // 4) Return the user + profile objects
  return { user, profile };
}