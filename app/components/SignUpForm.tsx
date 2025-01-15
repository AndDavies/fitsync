"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // <--- new import

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";

export default function SignUpForm() {
  const router = useRouter();
  const supabase = createClient(); // instantiate your new supabase browser client

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignUp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSigningUp(true);

    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      setIsSigningUp(false);
      return;
    }

    // 1) Attempt to sign up the user via Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      // Provide friendlier message if it's a duplicate key / email
      const msg = authError.message.toLowerCase();
      if (
        msg.includes("duplicate key") ||
        msg.includes("already registered") ||
        msg.includes("already exists")
      ) {
        setErrorMessage("An account with that email already exists. Please try logging in.");
      } else {
        setErrorMessage(authError.message);
      }
      setIsSigningUp(false);
      return;
    }

    // 2) If user created, insert into user_profiles
    if (authData.user) {
      const userId = authData.user.id;
      const { error: userProfileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: userId,
          email,
          role: "member",
          onboarding_completed: false,
          created_at: new Date(),
        });

      if (userProfileError) {
        if (
          userProfileError.message.toLowerCase().includes("duplicate key") ||
          userProfileError.message.toLowerCase().includes("already exists")
        ) {
          setErrorMessage("An account with that email already exists. Please try logging in.");
        } else {
          setErrorMessage(userProfileError.message);
        }
        setIsSigningUp(false);
        return;
      }

      // 3) Create a default personal track
      const { error: trackError } = await supabase
        .from("tracks")
        .insert({
          user_id: userId,
          name: "Personal Track",
          description: "Your personal track for individual programming.",
          created_at: new Date(),
        });

      if (trackError) {
        setErrorMessage(
          `Account created, but failed to create personal track: ${trackError.message}`
        );
      } else {
        setSuccessMessage("Account created! Please check your email to confirm.");
      }
    }

    setIsSigningUp(false);
  };

  return (
    <Card className="w-full max-w-md p-4">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Start your journey today</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <p className="text-red-600 font-medium">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-600 font-medium">{successMessage}</p>
        )}

        {isSigningUp ? (
          <div className="flex flex-col items-center space-y-2">
            <p className="text-gray-700">Creating your account...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <Mail className="text-gray-500" size={20} />
              <Input
                type="email"
                placeholder="Email"
                className="flex-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Lock className="text-gray-500" size={20} />
              <Input
                type="password"
                placeholder="Password"
                className="flex-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              className="w-full bg-pink-600 hover:bg-pink-700"
              onClick={handleSignUp}
            >
              Sign Up
            </Button>
          </>
        )}

        <p className="text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-pink-600 hover:underline">
            Sign in
          </a>
        </p>
      </CardContent>
    </Card>
  );
}