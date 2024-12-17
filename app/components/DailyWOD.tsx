"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { ParsedWorkout } from "./types";
import WorkoutDisplay from "./WorkoutDisplay";

// Utility to format date as YYYY-MM-DD for database queries
function getFormattedDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Utility to get CrossFit date code: YYMMDD
function getCrossfitDateCode(date: Date): string {
  const year = date.getUTCFullYear().toString().slice(-2);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

interface ScheduledWorkout {
  id: string;
  name: string;
  workout_details: ParsedWorkout;
}

const DailyWOD: React.FC = () => {
  const [scheduledWorkout, setScheduledWorkout] = useState<ScheduledWorkout | null>(null);
  const [crossfitWOD, setCrossfitWOD] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    const fetchCrossfitWOD = async () => {
      const cfDate = getCrossfitDateCode(new Date());
      const link = `https://www.crossfit.com/${cfDate}`;
      setCrossfitWOD(`Visit CrossFit.com for today’s WOD: ${link}`);
      setLoading(false);
    };

    const fetchWorkout = async () => {
      const today = getFormattedDate(new Date());

      if (userData?.user_id) {
        try {
          const { data, error } = await supabase
            .from("scheduled_workouts") // Ensure correct table name
            .select("id, name, workout_details")
            .eq("user_id", userData.user_id)
            .eq("date", today)
            .maybeSingle();

          if (error) {
            console.error("Supabase error:", error);
            fetchCrossfitWOD();
            return;
          }

          if (data) {
            setScheduledWorkout(data);
          } else {
            fetchCrossfitWOD();
          }
        } catch (error) {
          console.error("Error fetching scheduled workout:", error);
          fetchCrossfitWOD();
        } finally {
          setLoading(false);
        }
      } else {
        fetchCrossfitWOD();
      }
    };

    if (userData) {
      fetchWorkout();
    } else {
      setLoading(true); // User data not yet loaded
    }
  }, [userData]);

  return (
    <div className="p-6 bg-gray-900 rounded-xl border border-gray-700 text-gray-300">
      <h4 className="text-md font-bold text-pink-500 mb-4">Today’s Workout</h4>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}

      {!loading && scheduledWorkout ? (
        <div>
          {/* Convert workout_details object to string before passing to WorkoutDisplay */}
          <WorkoutDisplay
            workoutData={JSON.stringify(scheduledWorkout.workout_details)}
            workoutName={scheduledWorkout.name}
          />
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-400 mb-4">
            {crossfitWOD || "Unable to load today’s CrossFit WOD."}
          </p>
          <Link href="/workouts" className="text-sm text-blue-400 hover:underline">
            Plan Your Workout for Today
          </Link>
        </div>
      )}
    </div>
  );
};

export default DailyWOD;
