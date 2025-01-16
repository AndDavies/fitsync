"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// Helpers
function startOfCurrentWeek() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const weekStart = monday.toISOString();
  const weekEnd = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return { start: weekStart, end: weekEnd };
}

interface Goals {
  primaryGoal?: string;
  activityLevel?: string;
  lifestyleNote?: string;
  weekly_class_goal?: number;
  weekly_workout_goal?: number;
}

interface UserProfile {
  user_id: string;
  goals?: Goals | null;
}

interface GoalsDisplayProps {
  userProfile: UserProfile;
}

const GoalsDisplay: React.FC<GoalsDisplayProps> = ({ userProfile }) => {
  const supabase = createClient();
  const [classProgress, setClassProgress] = useState({ goal: null as number | null, completed: 0 });
  const [workoutProgress, setWorkoutProgress] = useState({ goal: null as number | null, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userProfile || !userProfile.user_id) {
        setLoading(false);
        return;
      }

      let goalsData: Goals = userProfile.goals || {};
      const weeklyClassGoal = goalsData.weekly_class_goal ?? 3;
      const weeklyWorkoutGoal = goalsData.weekly_workout_goal ?? 3;
      const { start, end } = startOfCurrentWeek();

      try {
        // 1) class registrations
        const { data: classData, error: classError } = await supabase
          .from("class_registrations")
          .select("id")
          .eq("user_profile_id", userProfile.user_id)
          .eq("status", "confirmed")
          .gte("registration_date", start)
          .lt("registration_date", end);

        if (classError) throw new Error(classError.message);
        const classCount = classData?.length ?? 0;

        // 2) logged workouts
        const { data: workoutData, error: workoutError } = await supabase
          .from("workout_results")
          .select("id")
          .eq("user_profile_id", userProfile.user_id)
          .gte("date_logged", start)
          .lt("date_logged", end);

        if (workoutError) throw new Error(workoutError.message);
        const workoutCount = workoutData?.length ?? 0;

        setClassProgress({ goal: weeklyClassGoal, completed: classCount });
        setWorkoutProgress({ goal: weeklyWorkoutGoal, completed: workoutCount });

        // Possibly fetch AI suggestions
        // setAiSuggestion(aiData.suggestion);

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching progress:", err.message);
        setError("Unable to fetch weekly progress.");
        setLoading(false);
      }
    };
    fetchProgress();
  }, [userProfile, supabase]);

  if (loading) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border text-card-foreground">
        <h3 className="text-lg font-semibold">Weekly Goals</h3>
        <p className="text-sm text-muted-foreground mt-2">Loading your progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border text-card-foreground">
        <h3 className="text-lg font-semibold">Weekly Goals</h3>
        <p className="text-sm text-destructive mt-2">{error}</p>
      </div>
    );
  }

  // If no goals are set:
  if (classProgress.goal === null && workoutProgress.goal === null) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border text-card-foreground">
        <h3 className="text-lg font-semibold mb-2">Set Your Weekly Goals</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You haven’t set any weekly goals yet. Set them now to stay on track.
        </p>
        <Link href="/goals" className="text-sm text-accent hover:underline">
          Set Weekly Goals
        </Link>
      </div>
    );
  }

  const CircleProgress = ({ goal, completed }: { goal: number; completed: number }) => {
    const ratio = goal > 0 ? completed / goal : 0;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - ratio * circumference;

    return (
      <div className="relative" style={{ width: "100px", height: "100px" }}>
        <svg className="transform -rotate-90" width="100" height="100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="var(--muted-foreground)"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="var(--accent)"
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
    <div className="bg-card p-6 rounded-xl border border-border text-card-foreground">
      <h3 className="text-lg font-semibold mb-4">Your Weekly Goals</h3>
      <div className="flex space-x-8">
        {classProgress.goal !== null && (
          <div className="flex flex-col items-center">
            <CircleProgress goal={classProgress.goal} completed={classProgress.completed} />
            <p className="text-sm text-muted-foreground mt-2">Classes Attended</p>
          </div>
        )}
        {workoutProgress.goal !== null && (
          <div className="flex flex-col items-center">
            <CircleProgress goal={workoutProgress.goal} completed={workoutProgress.completed} />
            <p className="text-sm text-muted-foreground mt-2">Workouts Logged</p>
          </div>
        )}
      </div>

      {aiSuggestion && (
        <div className="mt-4 p-4 bg-background rounded-xl border border-accent text-accent-foreground">
          <h3 className="text-lg font-semibold mb-2">Coach’s AI Tip</h3>
          <p className="text-sm">{aiSuggestion}</p>
        </div>
      )}
    </div>
  );
};

export default GoalsDisplay;