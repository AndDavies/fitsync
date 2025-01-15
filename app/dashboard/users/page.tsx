import { redirect } from "next/navigation";
import { fetchUserProfile } from "@/utils/supabase/fetchUserProfile";
import UsersClient from "./UsersClient";

/**
 * Server Component for /dashboard/users
 * - SSR-based user check with fetchUserProfile
 * - If no user or not an admin/coach, redirect
 */
export default async function UserManagementPage() {
  const { user, profile } = await fetchUserProfile({ redirectIfNoUser: true });
  // If profile doesn't exist, handle or redirect:
  if (!profile) {
    redirect("/login"); 
  }

  // If you want to ensure only admins/coaches can access:
  if (profile.role !== "admin" && profile.role !== "coach") {
    redirect("/login");
  }

  return <UsersClient userProfile={profile} />;
}