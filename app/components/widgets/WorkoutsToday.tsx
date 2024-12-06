"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Workout = {
  id: string;
  workout_details: string;
  warm_up?: string;
  cool_down?: string;
  date: string;
};

const WorkoutsTodayWidget: React.FC = () => {
  const { userData, isLoading } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchWorkoutsForToday = useCallback(async () => {
    if (!userData) return;

    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    //console.log(today);

    try {
      let tracksData;
      let tracksError;

      // Fetch tracks for the user
      if (!userData.current_gym_id) {
        ({ data: tracksData, error: tracksError } = await supabase
          .from("tracks")
          .select("id")
          .eq("user_id", userData.user_id));
      } else {
        ({ data: tracksData, error: tracksError } = await supabase
          .from("tracks")
          .select("id")
          .eq("gym_id", userData.current_gym_id));
      }

      if (tracksError) {
        setError("Error fetching tracks.");
        return;
      }

      const trackIds = tracksData?.map((track: { id: string }) => track.id);

      // Fetch workouts for today
      const { data: workoutData, error: workoutError } = await supabase
        .from("scheduled_workouts")
        .select("id, workout_details, warm_up, cool_down, date")
        .in("track_id", trackIds || [])
        .eq("date", today);

      if (workoutError) {
        setError("Error fetching today's workouts.");
        return;
      }

      if (!workoutData || workoutData.length === 0) {
        setError("No workouts scheduled for today.");
      } else {
        setWorkouts(workoutData);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (!isLoading) {
      fetchWorkoutsForToday();
    }
  }, [isLoading, fetchWorkoutsForToday]);

  if (isLoading || loading) {
    return (
      <div className="bg-gray-900 text-slate-900 p-4 rounded-3xl shadow-md flex flex-col items-center justify-center w-1/4 h-32">
        <p>Loading workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-200 text-slate-900 p-4 rounded-3xl shadow-md flex flex-col items-center justify-center w-1/4 h-32">
        <p className="text-red-400">{error}</p>
        {error === "No workouts scheduled for today." && (
          <button
            onClick={() => router.push("/workoutbuilder")}
            className="bg-pink-500 text-slate-900 px-4 py-2 mt-4 rounded-md hover:bg-pink-600 transition"
          >
            Go to Workout Builder
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-200 text-slate-900 p-4 rounded-3xl shadow-md flex flex-col items-center align-top justify-between">
      <div className="flex flex-col items-center mb-2">
        <span className="text-md font-semibold">Workouts Scheduled For</span>
        <span className="text-lg font-bold">{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
      </div>
      <ul className="w-full px-4 space-y-2">
        {workouts.map((workout) => (
          <li
            key={workout.id}
            className="bg-gray-800 p-6 rounded-3xl shadow-sm flex flex-col"
          >
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {workout.workout_details}
            </pre>
            {workout.warm_up && (
              <pre className="text-xs text-green-500 mt-2">Warm-Up: {workout.warm_up}</pre>
            )}
            {workout.cool_down && (
              <pre className="text-xs text-blue-500 mt-2">Cool-Down: {workout.cool_down}</pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkoutsTodayWidget;
