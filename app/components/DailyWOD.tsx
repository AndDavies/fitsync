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

function getCrossfitDateCode(date: Date): string {
  const year = date.getUTCFullYear().toString().slice(-2);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

interface LocalScheduledWorkout {
  id: string;
  name: string;
  workout_details: ParsedWorkout;
  warm_up?: string;
  cool_down?: string;
}

const DailyWOD: React.FC = () => {
  const [scheduledWorkout, setScheduledWorkout] = useState<LocalScheduledWorkout | null>(null);
  const [crossfitWOD, setCrossfitWOD] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    const fetchCrossfitWOD = async () => {

      //const cfDate = getCrossfitDateCode(new Date());
      //const apiUrl = `/api/fetchWOD?dateCode=${cfDate}`;

      try {
       // const res = await fetch(apiUrl);
       // const data = await res.json();
       // console.log("Received HTML:", data.html);
        // Now you can parse data.html as needed
      // setCrossfitWOD(`Visit CrossFit.com for today’s WOD: https://www.crossfit.com/${cfDate}`);
      } catch (error) {
       // console.error("Error fetching from our API route:", error);
       // setCrossfitWOD("Unable to load today’s CrossFit WOD.");
      }
    };

    const fetchWorkout = async () => {
      const today = getFormattedDate(new Date());

      if (userData?.user_id) {
        try {
          const { data, error } = await supabase
            .from("scheduled_workouts")
            .select("id, name, workout_details, warm_up, cool_down")
            .eq("user_id", userData.user_id)
            .eq("date", today)
            .maybeSingle();

          if (error) {
            console.error("Supabase error:", error);
            fetchCrossfitWOD();
            return;
          }

          if (data) {
            let parsedWorkout: ParsedWorkout;
            if (typeof data.workout_details === "string") {
              parsedWorkout = JSON.parse(data.workout_details) as ParsedWorkout;
            } else {
              parsedWorkout = data.workout_details as ParsedWorkout;
            }

            const localScheduledWorkout: LocalScheduledWorkout = {
              id: data.id,
              name: data.name,
              workout_details: parsedWorkout,
              warm_up: data.warm_up || "",
              cool_down: data.cool_down || "",
            };

            setScheduledWorkout(localScheduledWorkout);
            setLoading(false);
          } else {
            // No scheduled workout found, fetch CrossFit WOD
            fetchCrossfitWOD();
          }
        } catch (error) {
          console.error("Error fetching scheduled workout:", error);
          fetchCrossfitWOD();
        }
      } else {
        // If no userData, just fetch CrossFit WOD
        fetchCrossfitWOD();
      }
    };

    if (userData) {
      fetchWorkout();
    } else {
      setLoading(true);
    }
  }, [userData]);

  return (
    <div className="p-6 bg-gray-900 rounded-xl border border-gray-700 text-gray-300">
      <h4 className="text-md font-bold text-pink-500 mb-4">Today’s Workout</h4>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}

      {!loading && scheduledWorkout ? (
        <div>
          <WorkoutDisplay
            workoutData={scheduledWorkout.workout_details}
            workoutName={scheduledWorkout.name}
            warmUp={scheduledWorkout.warm_up}
            coolDown={scheduledWorkout.cool_down}
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
