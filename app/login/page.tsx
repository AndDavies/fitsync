// app/login/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

// This is your client form
import LoginForm from "@/app/components/LoginForm";

export default async function LoginPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there is a session, redirect server-side
  if (session) {
    redirect("/dashboard");
  }

  // If no session, show the login form
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <LoginForm />
    </div>
  );
}