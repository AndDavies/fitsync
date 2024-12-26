import OnboardingClient from "@/app/components/OnboardingClient";

// Stop Next.js from statically generating the route
export const dynamic = "force-dynamic"; 

// If your route is `onboarding/[gymID]`, Next.js automatically passes `{ gymID: string }` as `params`
export default function OnboardingPage({
  params,
}: {
  params: { gymID: string };
}) {
  // Destructure gymID from the route
  const { gymID } = params;

  // Pass it down to your client component
  return <OnboardingClient gymId={gymID} />;
}
