"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabaseClient = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    setIsLoggingIn(true);

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoggingIn(false);
      return;
    }

    // Login success
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Column (Dark) */}
      <div className="relative bg-black text-white px-8 py-6 flex flex-col">
        {/* Brand + Logo */}
        <div className="flex items-center justify-start mb-auto">
          {/* Replace with your actual logo/icon if desired */}
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
        {/* Top-right "Login" link or any nav link you want */}
        <div className="absolute top-4 right-4">
          {/* In the screenshot, it says "Login" top-right. 
              If you want this to link to Signup instead, switch the href. */}
          <a href="/signup" className="text-sm font-medium text-gray-600 hover:underline">
            Sign Up
          </a>
        </div>

        {/* Main Form Container */}
        <div className="max-w-sm mx-auto w-full space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Sign In</h1>
            <p className="text-gray-600 text-sm mt-2">
              Enter your credentials below to access your account
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          {/* Email Field */}
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

          {/* Password Field */}
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

          {/* Sign In Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-black hover:bg-gray-900"
          >
            {isLoggingIn ? "Signing In..." : "Sign In with Email"}
          </Button>

          {/*  */}

          {/* Terms and Policy */}
          <p className="text-xs text-gray-500 text-center">
            By clicking continue, you agree to our{" "}
            <a
              href="#"
              className="underline hover:text-gray-600"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline hover:text-gray-600"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}