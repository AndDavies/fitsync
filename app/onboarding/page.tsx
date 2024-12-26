// /app/onboarding/page.tsx

export const dynamic = "force-dynamic";
// ^ Prevents Next.js from statically generating or caching this route

import OnboardingClient from "../components/OnboardingClient";

// Define the props signature that matches Next.js App Router expectations
type OnboardingPageProps = {
  // Next.js can provide an object `searchParams` with strings or string arrays.
  searchParams?: {
    gym_id?: string | string[];
    [key: string]: string | string[] | undefined;
  };
};

export default function OnboardingPage({ searchParams = {} }: OnboardingPageProps) {
  // Safely parse gym_id, which might be a string, an array, or undefined
  let gymIdFromQuery: string | null = null;

  if (Array.isArray(searchParams.gym_id)) {
    // If we got an array, use its first element or fallback to null
    gymIdFromQuery = searchParams.gym_id[0] ?? null;
  } else if (typeof searchParams.gym_id === "string") {
    gymIdFromQuery = searchParams.gym_id;
  }

  return <OnboardingClient />;
}
