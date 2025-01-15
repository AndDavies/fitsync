// app/components/DailyWOD.tsx

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ParsedWorkout } from "./types";
import WorkoutDisplay from "./WorkoutDisplay";

interface LocalScheduledWorkout {
  id: string;
  name: string;
  workout_details: ParsedWorkout;
  warm_up?: string;
  cool_down?: string;
}

function getFormattedDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Make sure to export default here:
export default function DailyWOD() {
  const [scheduledWorkouts, setScheduledWorkouts] = useState<LocalScheduledWorkout[]>([]);
  const [crossfitWOD, setCrossfitWOD] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodayWorkouts() {
      setLoading(true);
      try {
        // This calls your new /api/workouts/today route
        const res = await fetch("/api/workouts/today", {
          credentials: "include",
        });
        if (!res.ok) {
          // fallback logic
          setCrossfitWOD("Unable to load today’s CrossFit WOD.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data?.scheduledWorkouts?.length > 0) {
          setScheduledWorkouts(data.scheduledWorkouts);
        } else {
          setCrossfitWOD("No scheduled workouts found for today.");
        }
      } catch (err) {
        //console.error("Error fetching scheduled workouts:", err);
        setCrossfitWOD("Unable to load today’s CrossFit WOD.");
      } finally {
        setLoading(false);
      }
    }

    fetchTodayWorkouts();
  }, []);

  return (
    <div className="p-6 bg-gray-900 rounded-xl border border-gray-700 text-gray-300">
      <h4 className="text-md font-bold text-pink-500 mb-4">Today’s Workout</h4>
      {loading && <p className="text-sm text-gray-400">Loading...</p>}

      {!loading && scheduledWorkouts.length > 0 ? (
        <div className="space-y-4">
          {scheduledWorkouts.map((workout) => (
            <div key={workout.id} className="border border-gray-600 p-4 rounded">
              <WorkoutDisplay
                workoutData={workout.workout_details}
                workoutName={workout.name}
                warmUp={workout.warm_up}
                coolDown={workout.cool_down}
              />
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              {crossfitWOD || "No scheduled workouts found for today."}
            </p>
            <Link href="/workouts" className="text-sm text-blue-400 hover:underline">
              Plan Your Workout for Today
            </Link>
          </div>
        )
      )}
    </div>
  );
}