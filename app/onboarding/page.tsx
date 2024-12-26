// /app/onboarding/page.tsx

// This tells Next.js not to statically build or cache the page
export const dynamic = "force-dynamic";

import OnboardingClient from "../components/OnboardingClient";

type OnboardingPageProps = {
  // By default, Next.js passes `searchParams` as an object containing
  // string or string[] values, or it could be undefined if none are present.
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
};

export default function OnboardingPage({ searchParams = {} }: OnboardingPageProps) {
  // Safe access to gym_id in case it's missing
  const gymIdFromQuery =
    typeof searchParams.gym_id === "string" ? searchParams.gym_id : null;

  return <OnboardingClient gymId={gymIdFromQuery} />;
}
