// app/signup/page.tsx
"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signup } from "./actions";

export default function SignUpPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    // Build a FormData object from the form
    const formData = new FormData(e.currentTarget);

    // Call the server action
    const result = await signup(formData);

    handleError(result);

    if ("error" in result) {
      // Show error inline
      setIsSubmitting(false);
      return;
    }

    // If success, redirect to /dashboard (or show a success message first)
    router.push("/dashboard");
  };

  const handleError = (result: { error?: string }) => {
    setErrorMessage(result.error ?? null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-md shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold">Create an account</h2>
        {errorMessage && (
          <p className="text-red-600 text-sm">{errorMessage}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <input
            type="email"
            name="email"
            required
            className="border border-gray-300 rounded w-full p-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Password</label>
          <input
            type="password"
            name="password"
            required
            className="border border-gray-300 rounded w-full p-2 mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded"
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>

        <p className="text-xs text-gray-500 text-center mt-2">
          Already have an account?{" "}
          <a href="/login" className="text-pink-600 hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}