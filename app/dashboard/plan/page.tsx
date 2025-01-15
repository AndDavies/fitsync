import { redirect } from "next/navigation";
import { fetchUserProfile } from "@/utils/supabase/fetchUserProfile";
import PlanClient from "./PlanClient";

/**
 * Server Component for /dashboard/plan
 * - Uses SSR to ensure the user is authenticated
 * - Fetches user profile row
 * - Passes user profile to a client component
 */
export default async function PlanPage() {
  // 1) Retrieve the user + profile via SSR
  const { user, profile } = await fetchUserProfile({ redirectIfNoUser: true });

  // 2) Handle missing profile
  if (!profile) {
    // Possibly the user exists but has not completed onboarding
    redirect("/onboarding");
  }

  // 3) Pass the userProfile to the client component
  return <PlanClient userProfile={profile} />;
}