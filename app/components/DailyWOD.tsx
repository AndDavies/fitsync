"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { ParsedWorkout } from "./types";
import WorkoutDisplay from "./WorkoutDisplay";

function getFormattedDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

interface LocalScheduledWorkout {
  id: string;
  name: string;
  workout_details: ParsedWorkout;
  warm_up?: string;
  cool_down?: string;
}

const DailyWOD: React.FC = () => {
  const [scheduledWorkouts, setScheduledWorkouts] = useState<LocalScheduledWorkout[]>([]);
  const [crossfitWOD, setCrossfitWOD] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    const fetchCrossfitWOD = async () => {
      // Fallback logic: real usage might fetch from CF route
      setCrossfitWOD("Unable to load today’s CrossFit WOD.");
      setLoading(false);
    };

    const fetchWorkouts = async () => {
      const today = getFormattedDate(new Date());
      const userId = userData?.user_id;
      const gymId = userData?.current_gym_id;

      // If no valid user, fallback
      if (!userId) {
        return fetchCrossfitWOD();
      }

      try {
        // Build OR condition
        let orCondition = `user_id.eq.${userId}`;
        if (gymId) {
          orCondition += `,gym_id.eq.${gymId}`;
        }

        // Remove .maybeSingle() and handle multiple results
        const { data, error } = await supabase
          .from("scheduled_workouts")
          .select("id, name, workout_details, warm_up, cool_down")
          .eq("date", today)
          .or(orCondition);

        if (error) {
          console.error("Supabase error (raw):", error);
          return fetchCrossfitWOD();
        }

        if (data && data.length > 0) {
          // Convert each to LocalScheduledWorkout
          const localWorkouts = data.map((row: any) => {
            let parsed: ParsedWorkout;
            if (typeof row.workout_details === "string") {
              parsed = JSON.parse(row.workout_details);
            } else {
              parsed = row.workout_details;
            }
            return {
              id: row.id,
              name: row.name,
              workout_details: parsed,
              warm_up: row.warm_up || "",
              cool_down: row.cool_down || "",
            } as LocalScheduledWorkout;
          });

          setScheduledWorkouts(localWorkouts);
          setLoading(false);
        } else {
          // No scheduled workouts
          fetchCrossfitWOD();
        }
      } catch (err) {
        console.error("Error fetching scheduled workouts:", err);
        fetchCrossfitWOD();
      }
    };

    if (userData) {
      fetchWorkouts();
    } else {
      setLoading(true);
    }
  }, [userData]);

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
};

export default DailyWOD;
