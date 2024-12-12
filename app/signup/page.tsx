"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignUp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSigningUp(true);

    if (!email || !password || !displayName) {
      setErrorMessage("Email, password, and display name are required.");
      setIsSigningUp(false);
      return;
    }

    // Sign up in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setErrorMessage(authError.message);
      setIsSigningUp(false);
      return;
    }

    // If signup is successful, insert into the user_profiles table
    if (authData.user) {
      const userId = authData.user.id; // Supabase Auth User ID
      const { error: userProfileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: userId,
          display_name: displayName,
          phone_number: phoneNumber,
          bio,
          email,
          role: "member",
          created_at: new Date(),
        });

      if (userProfileError) {
        setErrorMessage(userProfileError.message);
        setIsSigningUp(false);
        return;
      }

      // Insert a "Personal Track" for the user
      const { error: trackError } = await supabase
        .from("tracks")
        .insert({
          user_id: userId,
          name: "Personal Track",
          description: "This is your personal track for individual programming.",
          created_at: new Date(),
        });

      if (trackError) {
        setErrorMessage(`Account created, but failed to create personal track: ${trackError.message}`);
      } else {
        setSuccessMessage("Account created successfully! Please check your email to confirm.");
      }
    }

    setIsSigningUp(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white shadow-md rounded-md space-y-4">
        <h2 className="text-3xl font-bold">Sign Up</h2>
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        {successMessage && <p className="text-green-600">{successMessage}</p>}
        
        {isSigningUp ? (
          <div className="flex flex-col items-center">
            <LoadingSpinner />
            <p className="text-gray-700 mt-2">Creating your account...</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone (Optional)
              </label>
              <input
                type="text"
                id="phone"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium">
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                placeholder="Brief bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleSignUp}
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
            >
              Sign Up
            </button>
          </form>
        )}

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
