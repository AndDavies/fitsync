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

export default function DailyWOD() {
  const [scheduledWorkouts, setScheduledWorkouts] = useState<LocalScheduledWorkout[]>([]);
  const [crossfitWOD, setCrossfitWOD] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodayWorkouts() {
      setLoading(true);
      try {
        const res = await fetch("/api/workouts/today", {
          credentials: "include",
        });
        if (!res.ok) {
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
        setCrossfitWOD("Unable to load today’s CrossFit WOD.");
      } finally {
        setLoading(false);
      }
    }

    fetchTodayWorkouts();
  }, []);

  return (
    <div className="p-6 bg-card rounded-xl border border-border text-card-foreground">
      <h4 className="text-md font-bold text-accent mb-4">Today’s Workout</h4>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

      {!loading && scheduledWorkouts.length > 0 ? (
        <div className="space-y-4">
          {scheduledWorkouts.map((workout) => (
            <div key={workout.id} className="border border-border p-4 rounded bg-secondary">
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
            <p className="text-sm text-muted-foreground mb-4">
              {crossfitWOD || "No scheduled workouts found for today."}
            </p>
            <Link href="/workouts" className="text-sm text-accent hover:underline">
              Plan Your Workout for Today
            </Link>
          </div>
        )
      )}
    </div>
  );
}