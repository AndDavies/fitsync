// app/onboarding/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/utils/supabase/client';

export default function OnboardingPage() {
  const { userData, isLoading, session } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  
  // Onboarding fields
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [lifestyleNote, setLifestyleNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If userData is loaded and user is already onboarded or not logged in, redirect
    if (!isLoading && session && userData?.onboarding_completed) {
      router.push('/dashboard');
    }
  }, [isLoading, session, userData, router]);

  const handleNext = async () => {
    if (step === 3) {
      // Final step: save data to user_profiles
      if (!userData?.user_id) return; // ensure user is known

      setLoading(true);
      const { error } = await supabase
        .from('user_profiles')
        .update({
          goals: primaryGoal, 
          activity_level: activityLevel,
          // You can store lifestyleNote in bio or metrics JSON, or add a new column
          bio: lifestyleNote, 
          onboarding_completed: true
        })
        .eq('user_id', userData.user_id);

      setLoading(false);
      if (!error) {
        router.push('/dashboard');
      } else {
        alert("Error completing onboarding. Please try again.");
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  if (isLoading || !session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white p-6 rounded shadow-md">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Welcome! Let's Get Started</h2>
            <p className="mb-4 text-gray-700">We’d like to know your primary fitness goal.</p>
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
            <button 
              onClick={handleNext} 
              disabled={!primaryGoal}
              className={`w-full py-2 ${primaryGoal ? 'bg-pink-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'} rounded`}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Activity Level</h2>
            <p className="mb-4 text-gray-700">How active are you currently?</p>
            <select 
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
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
                className={`py-2 px-4 ${activityLevel ? 'bg-pink-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'} rounded`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Lifestyle & Preferences</h2>
            <p className="mb-4 text-gray-700">Any special considerations or preferences? (Optional)</p>
            <textarea 
              value={lifestyleNote}
              onChange={(e) => setLifestyleNote(e.target.value)}
              placeholder="E.g. 'I have a knee injury', 'I prefer workouts under 30 min', etc."
              className="w-full p-2 border border-gray-300 rounded mb-4"
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
                className={`py-2 px-4 bg-pink-600 text-white rounded ${loading && 'opacity-50 cursor-wait'}`}
              >
                {loading ? "Saving..." : "Finish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
