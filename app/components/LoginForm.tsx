"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const supabaseClient = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    setIsLoggingIn(true);

    // Attempt login
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoggingIn(false);
      return;
    }

    // Otherwise success
    router.push("/dashboard");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Please sign in to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}
        <div className="flex items-center space-x-2">
          <Mail size={20} className="text-gray-500" />
          <Input
            type="email"
            placeholder="Email"
            className="flex-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Lock size={20} className="text-gray-500" />
          <Input
            type="password"
            placeholder="Password"
            className="flex-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button
          disabled={isLoggingIn}
          onClick={handleLogin}
          className="w-full bg-pink-500 hover:bg-pink-600"
        >
          {isLoggingIn ? "Signing In..." : "Sign In"}
        </Button>
        <p className="text-sm text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-pink-600 hover:underline">
            Sign up
          </a>
        </p>
      </CardContent>
    </Card>
  );
}