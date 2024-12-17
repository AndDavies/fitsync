"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function SignUpPage() {
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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setErrorMessage(authError.message);
      setIsSigningUp(false);
      return;
    }

    if (authData.user) {
      const userId = authData.user.id;
      const { error: userProfileError } = await supabase.from("user_profiles").insert({
        user_id: userId,
        email,
        role: "member",
        created_at: new Date(),
        onboarding_completed: false,
      });

      if (userProfileError) {
        setErrorMessage(userProfileError.message);
        setIsSigningUp(false);
        return;
      }

      const { error: trackError } = await supabase
        .from("tracks")
        .insert({
          user_id: userId,
          name: "Personal Track",
          description: "Your personal track for individual programming.",
          created_at: new Date(),
        });

      if (trackError) {
        setErrorMessage(`Account created, but failed to create personal track: ${trackError.message}`);
      } else {
        setSuccessMessage("Account created! Please check your email to confirm.");
      }
    }

    setIsSigningUp(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      <div className="w-full max-w-md flex flex-col space-y-6">
        <h2 className="text-3xl font-semibold text-gray-800">Get Started</h2>

        {errorMessage && (
          <p className="text-red-600 font-medium">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-600 font-medium">{successMessage}</p>
        )}

        {isSigningUp ? (
          <div className="flex flex-col items-center">
            <LoadingSpinner />
            <p className="text-gray-700 mt-2">Creating your account...</p>
          </div>
        ) : (
          <form className="flex flex-col space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Email Field */}
            <div className="flex flex-col">
              <input
                type="email"
                placeholder="Email"
                className="w-full text-xl text-gray-800 border-b border-gray-300 focus:border-pink-300 focus:outline-none py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col">
              <input
                type="password"
                placeholder="Password"
                className="w-full text-xl text-gray-800 border-b border-gray-300 focus:border-pink-300 focus:outline-none py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Button Container */}
            <div>
              <button
                type="button"
                onClick={handleSignUp}
                className="w-full py-3 text-white font-semibold rounded bg-pink-600 hover:bg-pink-700 focus:ring-4 focus:ring-pink-300 transition"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-pink-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>

      {/* Powered by PeakMetrix */}
      <div className="absolute bottom-4 right-4 text-sm text-gray-500">
        <span className="opacity-80">Powered by </span>
        <span className="text-pink-600 font-medium">PeakMetrix</span>
      </div>
    </div>
  );
}
