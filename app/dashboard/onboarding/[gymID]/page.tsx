// /app/onboarding/[gymID]/page.tsx

import OnboardingClient from "@/app/components/OnboardingClient";

// Prevent static generation or caching
export const dynamic = "force-dynamic";

// Let Next.js pass in whatever shape it wants and destructure from `params`
export default function OnboardingPage({ params }: any) {
  const { gymID } = params || {}; 
  return <OnboardingClient gymId={gymID} />;
}
