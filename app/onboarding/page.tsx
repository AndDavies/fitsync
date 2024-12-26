// /app/onboarding/page.tsx (Server Component)

// Ensure this route is treated dynamically, not statically generated
export const dynamic = "force-dynamic";

import OnboardingClient from "../components/OnboardingClient";

interface OnboardingPageProps {
  searchParams: Record<string, any>;
}

// By default, page.tsx in the App Router is a Server Component (no "use client" here).
export default function OnboardingPage({ searchParams }: OnboardingPageProps) {
  // Read gym_id query param from server side
  const gymIdFromQuery = searchParams.gym_id ?? null;

  // Pass gymIdFromQuery to the client component as a prop
  return <OnboardingClient gymId={gymIdFromQuery} />;
}
