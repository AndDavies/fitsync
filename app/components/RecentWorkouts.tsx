"use client";

import React, { useEffect, useState } from "react";

// The shape your updated route returns
type RecentWorkout = {
  date_performed: string;
  user_display_name: string | null;
  workout_title: string | null;
  scoring_type?: string;
  result?: string | Record<string, any> | Record<string, any>[];
};

export default function RecentWorkouts() {
  const [workouts, setWorkouts] = useState<RecentWorkout[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        setLoading(true);
        setError(null);

        // Call our updated route
        const res = await fetch("/api/workouts/recent");
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
    }

    fetchWorkouts();
  }, []);

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
          const resultString = formatWorkoutResult(wo.scoring_type, wo.result);

          return (
            <li
              key={idx}
              className="bg-gray-800 p-3 rounded border border-gray-600"
            >
              <p className="text-pink-400 font-semibold text-sm">
                {wo.user_display_name || "An Athlete"}
              </p>
              {resultString && (
                <p className="text-pink-300 text-sm">{resultString}</p>
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
}

/**
 * If a workout has "Load" scoring_type, parse the JSON 
 * and display each set's weight & unit. Otherwise returns null
 */
function formatWorkoutResult(
  scoringType?: string,
  rawResult?: string | Record<string, any> | Record<string, any>[]
): string | null {
  if (!scoringType || !rawResult) return null;
  if (scoringType.toLowerCase() !== "load") {
    return null;
  }

  let parsed: Array<Record<string, any>> = [];

  // If rawResult is a JSON string, parse it
  if (typeof rawResult === "string") {
    try {
      parsed = JSON.parse(rawResult);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }
    } catch {
      return rawResult;
    }
  } else if (Array.isArray(rawResult)) {
    parsed = rawResult;
  } else if (typeof rawResult === "object") {
    parsed = [rawResult];
  }

  if (parsed.length === 0) return null;

  if (parsed.length > 1) {
    return parsed
      .map((setObj, i) => {
        const w = setObj.weight || 0;
        const u = setObj.unit || "";
        return `Set ${i + 1}: ${w} ${u}`;
      })
      .join(" | ");
  } else {
    const first = parsed[0];
    const w = first.weight || 0;
    const u = first.unit || "";
    return `${w} ${u}`;
  }
}