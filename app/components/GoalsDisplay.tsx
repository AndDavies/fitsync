"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";

function startOfCurrentWeek(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // Sunday=0, Monday=1...
  const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0,0,0,0);

  const weekStart = monday.toISOString();
  const weekEnd = new Date(monday.getTime() + 7*24*60*60*1000).toISOString();
  return { start: weekStart, end: weekEnd };
}

interface Goals {
  primaryGoal?: string;
  activityLevel?: string;
  lifestyleNote?: string;
  weekly_class_goal?: number;
  weekly_workout_goal?: number;
}

const GoalsDisplay: React.FC = () => {
  const { userData } = useAuth();
  const [classProgress, setClassProgress] = useState<{goal: number|null, completed: number}>({goal: null, completed: 0});
  const [workoutProgress, setWorkoutProgress] = useState<{goal: number|null, completed: number}>({goal: null, completed: 0});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  // Future AI suggestion placeholder:
  const [aiSuggestion, setAiSuggestion] = useState<string|null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userData || !userData.user_id) {
        setLoading(false);
        return;
      }

      let goalsData: Goals = {};
      if (userData?.goals) {
        goalsData = userData.goals; // userData.goals is now correctly typed as OnboardingData
      }

      // Set defaults if not present
      const weeklyClassGoal = goalsData.weekly_class_goal ?? 3; // or derive logic from activityLevel
      const weeklyWorkoutGoal = goalsData.weekly_workout_goal ?? 3; // same logic as above

      const { start, end } = startOfCurrentWeek();
      try {
        // Fetch class registrations
        const { data: classData, error: classError } = await supabase
          .from("class_registrations")
          .select("id")
          .eq("user_profile_id", userData.user_id)
          .eq("status", "confirmed")
          .gte("registration_date", start)
          .lt("registration_date", end);

        if (classError) throw new Error(classError.message);
        const classCount = classData?.length ?? 0;

        // Fetch logged workouts
        // Assuming we have a 'logged_workouts' table with a 'user_id' and 'workout_date'.
        // If we don’t, we can just skip this for now or mock it.
        const { data: workoutData, error: workoutError } = await supabase
          .from("workout_results")
          .select("id")
          .eq("user_profile_id", userData.user_id)
          .gte("date_logged", start)
          .lt("date_logged", end);

        if (workoutError) throw new Error(workoutError.message);
        const workoutCount = workoutData?.length ?? 0;

        setClassProgress({ goal: weeklyClassGoal, completed: classCount });
        setWorkoutProgress({ goal: weeklyWorkoutGoal, completed: workoutCount });

        // Future: fetch AI suggestion (commented out for now)
        // const aiRes = await fetch("/api/ai/advice");
        // if (aiRes.ok) {
        //   const aiData = await aiRes.json();
        //   setAiSuggestion(aiData.suggestion);
        // }

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching progress:", err.message);
        setError("Unable to fetch weekly progress.");
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userData]);

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100">Weekly Goals</h3>
        <p className="text-sm text-gray-400 mt-2">Loading your progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100">Weekly Goals</h3>
        <p className="text-sm text-red-400 mt-2">{error}</p>
      </div>
    );
  }

  // If no goals are set at all (both null), prompt user:
  if (classProgress.goal === null && workoutProgress.goal === null) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Set Your Weekly Goals</h3>
        <p className="text-sm text-gray-300 mb-4">
          You haven’t set any weekly goals yet. Set them now to stay on track.
        </p>
        <Link href="/goals" className="text-sm text-blue-400 hover:underline">
          Set Weekly Goals
        </Link>
      </div>
    );
  }

  // Helper function for the circular progress
  const CircleProgress = ({ goal, completed }: {goal: number; completed: number}) => {
    const ratio = goal > 0 ? completed / goal : 0;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (ratio * circumference);

    return (
      <div className="relative" style={{ width: "100px", height: "100px" }}>
        <svg className="transform -rotate-90" width="100" height="100">
          <circle cx="50" cy="50" r={radius} stroke="#2d2d2d" strokeWidth="10" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#00b894"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">
            {completed} / {goal}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-gray-100">
      <h3 className="text-lg font-semibold mb-4">Your Weekly Goals</h3>
      <div className="flex space-x-8">
        {classProgress.goal !== null && (
          <div className="flex flex-col items-center">
            <CircleProgress goal={classProgress.goal} completed={classProgress.completed} />
            <p className="text-sm text-gray-300 mt-2">Classes Attended</p>
          </div>
        )}
        {workoutProgress.goal !== null && (
          <div className="flex flex-col items-center">
            <CircleProgress goal={workoutProgress.goal} completed={workoutProgress.completed} />
            <p className="text-sm text-gray-300 mt-2">Workouts Logged</p>
          </div>
        )}
      </div>

      {aiSuggestion && (
        <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-blue-500 text-blue-400">
          <h3 className="text-lg font-semibold mb-2">Coach’s AI Tip</h3>
          <p className="text-sm">{aiSuggestion}</p>
        </div>
      )}
    </div>
  );
};

export default GoalsDisplay;
