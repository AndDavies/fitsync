// app/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // your new browser client
import Image from "next/image";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  // Create the Supabase browser client instance
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    setIsLoggingIn(true);

    // Attempt sign-in with email/password
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoggingIn(false);
      return;
    }

    // If successful, navigate to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Column (Dark) */}
      <div className="relative bg-black text-white px-8 py-6 flex flex-col">
        {/* Brand + Logo */}
        <div className="flex items-center justify-start mb-auto">
          <Image
            src="/images/Ascent_Logo_trans.png"
            alt="FitSync Logo"
            width={100}
            height={35}
            className="cursor-pointer"
          />
        </div>

        {/* Quote / Body */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-300 max-w-sm">
            Fitness is a skill. It can be learned and improved upon.
          </p>
        </div>
      </div>

      {/* Right Column (White) */}
      <div className="bg-white flex flex-col justify-center relative px-8 py-10">
        {/* Top-right link */}
        <div className="absolute top-4 right-4">
          <a href="/signup" className="text-sm font-medium text-gray-600 hover:underline">
            Sign Up
          </a>
        </div>

        <div className="max-w-sm mx-auto w-full space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Sign In</h1>
            <p className="text-gray-600 text-sm mt-2">
              Enter your credentials below to access your account
            </p>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          <div className="flex items-center space-x-2">
            <Mail size={20} className="text-gray-500" />
            <Input
              type="email"
              placeholder="name@example.com"
              className="flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Lock size={20} className="text-gray-500" />
            <Input
              type="password"
              placeholder="Your Password"
              className="flex-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-black hover:bg-gray-900"
          >
            {isLoggingIn ? "Signing In..." : "Sign In with Email"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline hover:text-gray-600">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-gray-600">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}