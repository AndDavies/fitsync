// app/profile/page.tsx
import { redirect } from "next/navigation";
import { fetchUserProfile } from "@/utils/supabase/fetchUserProfile";
import ProfileClient from "./ProfileClient";

/**
 * Server Component for /profile:
 * - SSR-based user check
 * - Pass userProfile to the client
 */
export default async function ProfilePage() {
  // 1) Fetch user + profile from server
  //    If no user, redirect
  const { user, profile } = await fetchUserProfile({ redirectIfNoUser: true });

  // 2) If there's no user_profiles row, you can optionally handle that here
  // e.g. redirect("/onboarding") or show an error
  if (!profile) {
    // If your logic requires an actual profile row to exist:
    redirect("/onboarding");
  }

  // 3) Pass userProfile to the client code
  return <ProfileClient userProfile={profile} />;
}