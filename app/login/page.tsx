"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error logging in:", error.message); // Just adding a comment for Git
    } else {
      router.push("/dashboard"); // Redirect to the dashboard on successful login
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white shadow-md rounded-md">
        <h2 className="text-3xl font-bold mb-6">Sign In</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-sm">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
