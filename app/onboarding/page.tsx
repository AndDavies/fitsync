"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function OnboardingPage() {
  const { userData, isLoading, session, refreshUserData } = useAuth();
  const router = useRouter();

  // Suspense-wrapped SearchParams
  const searchParams = useSearchParams();
  const gymIdFromQuery = searchParams ? searchParams.get("gym_id") || null : null;

  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [lifestyleNote, setLifestyleNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && session && userData?.onboarding_completed) {
      router.push("/dashboard");
    }
  }, [isLoading, session, userData?.onboarding_completed, router]);

  const handleNext = async () => {
    if (step === 4) {
      const onboardingResponses = {
        primaryGoal,
        activityLevel,
        lifestyleNote,
      };

      if (!userData?.user_id) return;

      setLoading(true);

      const { error } = await supabase
        .from("user_profiles")
        .update({
          display_name: displayName,
          phone_number: phoneNumber,
          onboarding_data: onboardingResponses,
          onboarding_completed: true,
          current_gym_id: gymIdFromQuery,
        })
        .eq("user_id", userData.user_id);

      setLoading(false);

      if (!error) {
        await refreshUserData();
        router.push("/dashboard");
      } else {
        alert("Error completing onboarding. Please try again.");
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  const variants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <Suspense fallback={<LoadingSpinner />}>
        <div className="max-w-md w-full bg-white p-6 rounded shadow-md relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-4">Basic Info</h2>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Display Name *</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Your name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Your phone number"
                  />
                </div>
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
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-4">Primary Fitness Goal</h2>
                <p className="mb-4 text-gray-700">We’d like to know your primary fitness goal.</p>
                <select
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-pink-300"
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
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-4">Your Activity Level</h2>
                <p className="mb-4 text-gray-700">How active are you currently?</p>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly_active">Lightly Active</option>
                  <option value="moderately_active">Moderately Active</option>
                  <option value="very_active">Very Active</option>
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
                    disabled={!activityLevel}
                    className={`py-2 px-4 ${
                      activityLevel
                        ? "bg-pink-600 text-white hover:bg-pink-700"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    } rounded`}
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-4">Lifestyle & Preferences</h2>
                <p className="mb-4 text-gray-700">
                  Any special considerations or preferences? (Optional)
                </p>
                <textarea
                  value={lifestyleNote}
                  onChange={(e) => setLifestyleNote(e.target.value)}
                  placeholder="E.g. 'I have a knee injury', 'I prefer workouts under 30 min', etc."
                  className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className={`py-2 px-4 bg-pink-600 text-white rounded hover:bg-pink-700 ${
                      loading && "opacity-50 cursor-wait"
                    }`}
                  >
                    {loading ? <LoadingSpinner /> : "Finish"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Suspense>
    </div>
  );
}
