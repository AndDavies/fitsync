"use client";

import { useRouter } from "next/navigation";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import LoginForm from "@/app/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { session, isLoading } = useSessionContext();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!isLoading && session) {
      router.push("/dashboard");
    }
  }, [session, isLoading, router]);

  // Show the login form if no session
  return <LoginForm />;
}