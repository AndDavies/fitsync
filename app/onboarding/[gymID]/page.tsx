// app/onboarding/[gymId]/page.tsx
export const dynamic = "force-dynamic";
// ^ Tells Next.js not to statically generate or cache this route.

import OnboardingClient from "@/app/components/OnboardingClient";

interface OnboardingPageProps {
  // Next.js App Router automatically provides 'params'
  // matching the dynamic segment "[gymId]" in the route.
  params: {
    gymId: string; // The segment from the URL, e.g. "gym_123"
  };
}

export default function OnboardingPage({ params }: OnboardingPageProps) {
  const { gymId } = params;

  // Just pass it as a prop to your client component
  return <OnboardingClient gymId={gymId} />;
}
