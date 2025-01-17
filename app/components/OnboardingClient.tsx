"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface UserProfile {
  user_id: string;
  display_name?: string;
  phone_number?: string;
  onboarding_completed?: boolean;
  onboarding_data?: any;
  current_gym_id?: string;
}

interface OnboardingClientProps {
  userProfile: UserProfile | null;
  gymId: string;
}

export default function OnboardingClient({ userProfile, gymId }: OnboardingClientProps) {
  // -----------------------------
  // 1) Define all hooks at top-level (unconditionally).
  // -----------------------------

  // Basic router for navigation
  const router = useRouter();

  // Our supabase “browser client”
  const supabase = createClient();

  // Local steps
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [lifestyleNote, setLifestyleNote] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // 2) If we do not have a userProfile,
  //    we show a fallback or redirect, but do so *after* hook definitions.
  // -----------------------------
  if (!userProfile) {
    return (
      <div className="text-red-600 p-4">
        No user profile found. Please log in or refresh.
      </div>
    );
  }

  // -----------------------------
  // 3) Initialize local state from userProfile
  //    (one-time, e.g. in a useEffect)
  // -----------------------------
  useEffect(() => {
    setDisplayName(userProfile.display_name || "");
    setPhoneNumber(userProfile.phone_number || "");

    // If already onboarded, skip
    if (userProfile.onboarding_completed) {
      router.push("/dashboard");
    }
    // If no user ID, we might redirect to login
    else if (!userProfile.user_id) {
      router.push("/login");
    }
  }, [userProfile, router]);

  // -----------------------------
  // 4) Handler for going forward in the multi-step wizard
  // -----------------------------
  const handleNext = async () => {
    // Suppose final step is 4
    if (step === 4) {
      if (!userProfile.user_id) return;

      setLoading(true);

      // Build an onboarding object
      const onboardingData = {
        primaryGoal,
        activityLevel,
        lifestyleNote,
      };

      // Call Supabase
      const { error } = await supabase
        .from("user_profiles")
        .update({
          display_name: displayName,
          phone_number: phoneNumber,
          onboarding_data: onboardingData,
          onboarding_completed: true,
          current_gym_id: gymId,
        })
        .eq("user_id", userProfile.user_id);

      setLoading(false);

      if (!error) {
        router.push("/dashboard");
      } else {
        alert("Error completing onboarding. Please try again.");
      }
    } else {
      // Not on final step, just go forward
      setStep((prev) => prev + 1);
    }
  };

  // -----------------------------
  // 5) Handler for going backward in the multi-step wizard
  // -----------------------------
  const handleBack = () => {
    setStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  // -----------------------------
  // 6) Return the UI
  // -----------------------------
  // If you’re truly “loading,” you can show a spinner
  // (this is optional logic).
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  // Motion variants, multi-step wizard, etc.
  // For brevity, we’ll just show a simple snippet:
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white p-6 rounded shadow-md relative">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Basic Info</h2>
            <label className="block text-sm font-semibold mb-1">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Your name"
            />

            <label className="block text-sm font-semibold mb-1">
              Phone Number *
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Your phone number"
            />

            <button
              onClick={handleNext}
              disabled={!displayName.trim() || !phoneNumber.trim()}
              className={`w-full py-2 ${
                displayName.trim() && phoneNumber.trim()
                  ? "bg-pink-600 text-white hover:bg-pink-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              } rounded`}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Primary Fitness Goal</h2>
            <select
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select a goal</option>
              <option value="improve_strength">Improve Strength</option>
              <option value="lose_weight">Lose Weight</option>
              <option value="increase_endurance">Increase Endurance</option>
              <option value="general_health">General Health</option>
            </select>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!primaryGoal}
                className={`py-2 px-4 ${
                  primaryGoal
                    ? "bg-pink-600 text-white hover:bg-pink-700"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                } rounded`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Steps 3 and 4 omitted for brevity... */}
      </div>
    </div>
  );
}