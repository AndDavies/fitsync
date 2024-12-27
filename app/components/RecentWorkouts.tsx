"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

// Shape for the JSON returned by /api/workouts/recent
type RecentWorkout = {
  date_performed: string;
  user_display_name: string | null;
  workout_title: string | null;
  scoring_type?: string;
  result?: string | Record<string, any> | Record<string, any>[];
};

const RecentWorkouts: React.FC = () => {
  const { userData } = useAuth();
  const [workouts, setWorkouts] = useState<RecentWorkout[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = "/api/workouts/recent";
        if (userData && userData.current_gym_id) {
          url += `?gym_id=${userData.current_gym_id}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch recent workouts");
        }
        const data = await res.json();
        setWorkouts(data.workouts || []);
      } catch (err: any) {
        console.error("Error fetching recent workouts:", err.message);
        setError("Could not load recent workouts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [userData]);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading workouts...</p>;
  }
  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }
  if (!workouts || workouts.length === 0) {
    return <p className="text-sm text-gray-500 italic">No recent workouts found.</p>;
  }

  return (
    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
      <h3 className="text-lg font-semibold mb-2 text-gray-100">
        Recent Workouts from Your Community
      </h3>

      <ul className="space-y-3">
        {workouts.map((wo, idx) => {
          // Only parse & format if scoring_type is "Load" (case-insensitive).
          const resultString = formatWorkoutResult(
            wo.scoring_type,
            wo.result
          );

          return (
            <li
              key={idx}
              className="bg-gray-800 p-3 rounded border border-gray-600"
            >
              <p className="text-pink-400 font-semibold text-sm">
                {wo.user_display_name || "An Athlete"}
              </p>

              {/* Show the formatted “Load” sets if any */}
              {resultString && (
                <p className="text-pink-300 text-sm">
                  {resultString}
                </p>
              )}

              <p className="text-xs text-gray-400 mt-1">
                Logged on: {new Date(wo.date_performed).toLocaleString()}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/**
 * For a workout with "Load" scoring_type, parse the JSON array (or object/string) 
 * and display each set's "weight unit" (like "225 lbs").
 * Otherwise, return null or adapt for other scoring types.
 */
function formatWorkoutResult(
  scoringType?: string,
  rawResult?: string | Record<string, any> | Record<string, any>[]
): string | null {
  if (!scoringType || !rawResult) return null;

  // Check case-insensitively
  if (scoringType.toLowerCase() !== "load") {
    return null;
  }

  let parsed: Array<Record<string, any>> = [];

  // 1) If rawResult is a string, parse JSON
  if (typeof rawResult === "string") {
    try {
      parsed = JSON.parse(rawResult);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }
    } catch {
      // Not valid JSON
      return rawResult;
    }
  } else if (Array.isArray(rawResult)) {
    parsed = rawResult;
  } else if (typeof rawResult === "object" && rawResult !== null) {
    parsed = [rawResult];
  }

  if (parsed.length === 0) return null;

  // If multiple sets
  if (parsed.length > 1) {
    return parsed
      .map((setObj, i) => {
        const w = setObj.weight || 0;
        const u = setObj.unit || "";
        return `Set ${i + 1}: ${w} ${u}`;
      })
      .join(" | ");
  } else {
    // Single set
    const first = parsed[0];
    const w = first.weight || 0;
    const u = first.unit || "";
    return `${w} ${u}`;
  }
}

export default RecentWorkouts;
