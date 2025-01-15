import { redirect } from "next/navigation";
import { fetchUserProfile } from "@/utils/supabase/fetchUserProfile";
import WorkoutsClient from "./WorkoutsClient";

/**
 * Server Component for /dashboard/workouts
 * - Authenticates the user via SSR
 * - Fetches the user profile row
 * - Redirects if no user or no profile
 * - Passes userProfile to the client component for planning workouts
 */
export default async function DashboardWorkoutsPage() {
  // 1) Retrieve the user + profile via SSR
  const { user, profile } = await fetchUserProfile({ redirectIfNoUser: true });

  // 2) Handle missing profile
  if (!profile) {
    // Possibly the user exists but has not completed onboarding
    redirect("/onboarding");
  }

  // 3) Pass the userProfile to the client component
  //    You can rename "profile" to "userProfile" for clarity
  return <WorkoutsClient userProfile={profile} />;
}