import { redirect } from "next/navigation";
import { fetchUserProfile } from "@/utils/supabase/fetchUserProfile";
import ClassesClient from "./ClassesClient";

/**
 * Server Component:
 * 1. Fetches user + profile from server
 * 2. Redirects if not logged in
 * 3. Passes userProfile to the client component
 */
export default async function ClassesPage() {
  // By default, we want to redirect if there's no user
  const { user, profile } = await fetchUserProfile({ redirectIfNoUser: true });

  // If there's no user_profiles row, you can handle that scenario:
  if (!profile) {
    // For example, redirect to onboarding or profile
    redirect("/profile");
  }

  return <ClassesClient userProfile={profile} />;
}