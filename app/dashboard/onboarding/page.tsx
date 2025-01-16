// app/onboarding/page.tsx (Server Component)

import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OnboardingClient from "@/app/components/OnboardingClient";

export default async function OnboardingPage() {
  // 1) Build a Supabase client (SSR)
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {},
    },
  });

  // 2) Confirm user session
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    // If not logged in, redirect to login
    redirect("/login");
  }

  // 3) Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("user_id, display_name, phone_number, onboarding_completed, onboarding_data, current_gym_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (profileError) {
    // handle error or redirect
    redirect("/error?msg=ProfileFetchFailed");
  }
  if (!profile) {
    // Possibly the user is brand new
    // We can create a skeleton row if needed, or just proceed
  }

  // If user is already onboarded, redirect
  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  // Pass gymId from the profile (or route param) if needed
  const gymId = profile?.current_gym_id || "";

  // 4) Render the client component
  return (
    <OnboardingClient
    userProfile={profile} // profile might be null
    gymId={gymId || ""}
  />
  );
}