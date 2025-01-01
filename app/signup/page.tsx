"use client";

import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import SignUpForm from "@/app/components/SignUpForm";

export default function SignUpPage() {
  const { session, isLoading } = useSessionContext();
  const router = useRouter();

  // OPTIONAL:
  // If you want to redirect an already-logged-in user to the dashboard, uncomment:
  // useEffect(() => {
  //   if (!isLoading && session) {
  //     router.push("/dashboard");
  //   }
  // }, [session, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <SignUpForm />
    </div>
  );
}