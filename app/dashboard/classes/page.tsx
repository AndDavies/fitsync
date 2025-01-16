import { fetchUserProfile, UserProfile } from "@/utils/supabase/fetchUserProfile";
import ClassesClient from "./ClassesClient";

/**
 * SSR Server Component for /dashboard/classes
 */
export default async function ClassesPage() {
  const { user, profile } = await fetchUserProfile({ redirectIfNoUser: true });
  // 'profile' is of type UserProfile | null

  if (!profile) {
    return <div className="text-gray-300 p-6">No profile found or not logged in</div>;
  }

  // Pass the profile to ClassesClient
  // Make sure 'ClassesClient' also expects { userProfile: UserProfile } with the same definition.
  return <ClassesClient userProfile={profile} />;
}