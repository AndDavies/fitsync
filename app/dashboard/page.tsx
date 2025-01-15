import { redirect } from "next/navigation";
import { fetchUserProfile } from "@/utils/supabase/fetchUserProfile";
import DashboardClient from "./DashboardClient";

/**
 * Server Component for /dashboard
 * - SSR to ensure user is authenticated & fetch userProfile row
 */
export default async function DashboardPage() {
  const { user, profile } = await fetchUserProfile({ redirectIfNoUser: true });

  // If your logic says: if no 'profile', redirect or handle it
  if (!profile) {
    // possibly the user exists but no user_profiles row
    redirect("/onboarding");
  }

  // The Server Component passes the userProfile to your Client
  return <DashboardClient userProfile={profile} />;
}