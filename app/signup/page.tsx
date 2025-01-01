// app/signup/page.tsx (Server Component)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import SignUpForm from "@/app/components/SignUpForm";

export default async function SignUpPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <SignUpForm />
    </div>
  );
}