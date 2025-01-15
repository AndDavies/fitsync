// /app/onboarding/page.tsx
export const dynamic = "force-dynamic";
// ^ Tells Next.js not to statically generate or cache this route

import OnboardingClient from "../components/OnboardingClient";

// Keep it extremely simple by using `props: any` or minimal checks
export default function OnboardingPage(props: any) {
  // If searchParams is provided, try to read gym_id
  const gymIdFromQuery = props?.searchParams?.gym_id ?? null;

  return <OnboardingClient gymId={gymIdFromQuery} />;
}
