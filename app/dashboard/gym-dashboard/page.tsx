import { redirect } from "next/navigation";
import { fetchUserProfile } from "@/utils/supabase/fetchUserProfile";
import GymDashboardClient from "./GymDashboardClient";

/**
 * Server Component for /dashboard/gym-dashboard
 */
export default async function GymDashboardPage() {
  const { user, profile } = await fetchUserProfile({ redirectIfNoUser: true });
  if (!profile) {
    redirect("/login");
  }

  // If you want only admin/coach access:
  if (profile.role !== "admin" && profile.role !== "coach") {
    redirect("/login");
  }

  return <GymDashboardClient userProfile={profile} />;
}