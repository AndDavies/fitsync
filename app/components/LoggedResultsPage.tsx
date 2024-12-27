"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "../context/AuthContext";
import { format, subWeeks } from "date-fns"; // date-fns for 1week/4week calculations

interface LoggedWorkout {
  id: string;
  scheduled_workout_id: string;
  date_logged: string;
  result: string | Record<string, unknown> | Record<string, unknown>[];
  scoring_type: string;
  perceived_exertion: number;
  workout_focus: string | null;
}

export default function LoggedResultsPage() {
  const { userData, isLoading } = useAuth();
  const [loggedWorkouts, setLoggedWorkouts] = useState<LoggedWorkout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // NEW: Store computed training loads
  const [weeklyLoad, setWeeklyLoad] = useState<number>(0);
  const [monthlyLoad, setMonthlyLoad] = useState<number>(0);

  useEffect(() => {
    const fetchLoggedWorkouts = async () => {
      if (isLoading) return;

      if (!userData?.user_id) {
        setError("No user data available.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("workout_results")
          .select(`
            id,
            scheduled_workout_id,
            date_logged,
            result,
            scoring_type,
            perceived_exertion,
            workout_focus
          `)
          .eq("user_profile_id", userData.user_id)
          .order("date_logged", { ascending: false });

        if (error) {
          setError("Failed to load workout results.");
          return;
        }

        if (!data || data.length === 0) {
          setError("No workouts logged.");
        } else {
          setLoggedWorkouts(data as LoggedWorkout[]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoggedWorkouts();
  }, [isLoading, userData?.user_id]);

  // Whenever loggedWorkouts changes, compute the training load metrics
  useEffect(() => {
    if (!loggedWorkouts || loggedWorkouts.length === 0) {
      setWeeklyLoad(0);
      setMonthlyLoad(0);
      return;
    }

    // Calculate "score" * "perceived_exertion"
    // then sum them for the last 1 week (7 days) and last 4 weeks (28 days).
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const fourWeeksAgo = subWeeks(now, 4);

    let sumWeekly = 0;
    let sumMonthly = 0;

    for (const workout of loggedWorkouts) {
      const dateLogged = new Date(workout.date_logged);
      const numericScore = computeScore(workout.scoring_type, workout.result);
      const rpe = workout.perceived_exertion || 5;
      const load = numericScore * rpe;

      // If date is within 1 week, add to sumWeekly
      if (dateLogged >= oneWeekAgo) {
        sumWeekly += load;
      }
      // If date is within 4 weeks, add to sumMonthly
      if (dateLogged >= fourWeeksAgo) {
        sumMonthly += load;
      }
    }

    setWeeklyLoad(sumWeekly);
    setMonthlyLoad(sumMonthly);
  }, [loggedWorkouts]);

  const handleExpandRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-300 bg-gray-900 w-full">
        <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full mb-4"></div>
        <p>Loading logged workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-md flex flex-col items-center w-full">
        <h2 className="text-2xl font-bold mb-4">Your Logged Workouts</h2>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-md w-full max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Your Logged Workouts</h2>

      {/* Display 1-week and 4-week training load summary */}
      <div className="flex space-x-6 mb-4">
        <div className="p-4 bg-gray-800 rounded-md">
          <h3 className="text-md font-semibold text-pink-400 mb-2">1-Week Load</h3>
          <p className="text-gray-200 text-sm">{weeklyLoad.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-md">
          <h3 className="text-md font-semibold text-pink-400 mb-2">4-Week Load</h3>
          <p className="text-gray-200 text-sm">{monthlyLoad.toFixed(2)}</p>
        </div>
      </div>

      {loggedWorkouts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-gray-800 rounded-md overflow-hidden">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-4 py-2 font-semibold">Date Logged</th>
                <th className="px-4 py-2 font-semibold">Result</th>
                <th className="px-4 py-2 font-semibold">Scoring Type</th>
                <th className="px-4 py-2 font-semibold">Exertion</th>
                <th className="px-4 py-2 font-semibold">Focus</th>
                <th className="px-4 py-2 font-semibold">Training Load</th>
                <th className="px-4 py-2 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {loggedWorkouts.map((workout) => {
                // For each workout, compute the load
                const numericScore = computeScore(workout.scoring_type, workout.result);
                const rpe = workout.perceived_exertion || 5;
                const loadValue = numericScore * rpe;

                return (
                  <React.Fragment key={workout.id}>
                    <tr className="border-b border-gray-600 hover:bg-gray-700 transition duration-300 ease-in-out">
                      <td className="px-4 py-2">
                        {format(new Date(workout.date_logged), "MMMM d, yyyy")}
                      </td>
                      <td className="px-4 py-2">
                        {renderResult(workout.scoring_type, workout.result)}
                      </td>
                      <td className="px-4 py-2">{workout.scoring_type}</td>
                      <td className="px-4 py-2">{workout.perceived_exertion}/10</td>
                      <td className="px-4 py-2">{workout.workout_focus || "General"}</td>
                      <td className="px-4 py-2 text-pink-300">{loadValue.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleExpandRow(workout.id)}
                          className="px-2 py-1 text-pink-400 border border-pink-400 rounded-md hover:bg-pink-400 hover:text-white transition duration-300 text-sm"
                        >
                          {expandedRowId === workout.id ? "Hide" : "Expand"}
                        </button>
                      </td>
                    </tr>
                    {expandedRowId === workout.id && (
                      <tr className="bg-gray-700">
                        <td colSpan={7} className="p-4 border-t border-gray-600">
                          <div className="space-y-4">
                            <div className="p-3 bg-gray-800 rounded-lg">
                              <h3 className="font-semibold text-pink-300 mb-2">
                                Additional Workout Details
                              </h3>
                              <p className="text-sm text-gray-300">
                                Here we can show more specifics about this particular workout, 
                                including notes or progression over time.
                              </p>
                            </div>

                            <div className="p-3 bg-gray-800 rounded-lg">
                              <h3 className="font-semibold text-pink-300 mb-2">
                                AI Coach Insights (Coming Soon)
                              </h3>
                              <p className="text-sm text-gray-300">
                                Future enhancements will offer personalized feedback and suggestions 
                                based on your logged results history.
                              </p>
                              <p className="text-sm text-gray-400 mt-2 italic">
                                Example: "Compared to last week’s similar workout, you've improved 
                                your rounds by 10%. Next session, try increasing load slightly for 
                                continuous progress."
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-300">No workouts logged yet.</p>
      )}
    </div>
  );
}

/**
 * Convert a workout's result into a numeric score,
 * depending on the scoring_type.
 */
function computeScore(
  scoringType: string,
  result: string | Record<string, unknown> | Record<string, unknown>[]
): number {
  let total = 0;

  // 1) If result is a string, parse it if it's JSON or ignore
  let parsed: Array<Record<string, any>> = [];

  if (typeof result === "string") {
    try {
      parsed = JSON.parse(result);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }
    } catch {
      // If it's not JSON, return 0 or parse differently
      return 0;
    }
  } else if (Array.isArray(result)) {
    parsed = result as Array<Record<string, any>>;
  } else if (typeof result === "object") {
    parsed = [result as Record<string, any>];
  }

  // 2) For each set object, interpret scoring
  // We'll just sum them if multiple sets
  for (const setObj of parsed) {
    switch (scoringType) {
      case "Rounds + Reps":
        {
          const rounds = parseInt(setObj.rounds || "0", 10);
          const reps = parseInt(setObj.reps || "0", 10);
          // example formula
          total += rounds * 10 + reps;
        }
        break;
      case "Time":
        {
          const mins = parseInt(setObj.minutes || "0", 10);
          const secs = parseInt(setObj.seconds || "0", 10);
          // store total seconds
          total += mins * 60 + secs;
        }
        break;
      case "Load":
        {
          // If we track weight, maybe we treat the “Load” as is
          const weight = parseFloat(setObj.weight || "0");
          // Just sum if multiple sets
          total += weight;
        }
        break;
      case "Reps":
        {
          const repsCount = parseInt(setObj.reps || "0", 10);
          total += repsCount;
        }
        break;
      default:
        // fallback: do nothing or parse differently
        break;
    }
  }

  return total;
}

/**
 * A small helper to format the result for display in the table cell.
 */
function renderResult(
  scoringType: string,
  result: string | Record<string, unknown> | Record<string, unknown>[]
): React.ReactNode {
  if (typeof result === "string") {
    return <span className="text-sm text-pink-300">{result}</span>;
  }

  if (Array.isArray(result)) {
    return (
      <ul className="text-sm text-pink-300 list-disc list-inside">
        {result.map((setObj, idx) => (
          <li key={idx}>
            {formatSetResult(scoringType, setObj as Record<string, any>)}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof result === "object" && result !== null) {
    return (
      <span className="text-sm text-pink-300">
        {formatSetResult(scoringType, result as Record<string, any>)}
      </span>
    );
  }

  return <span className="text-sm text-pink-300">{JSON.stringify(result)}</span>;
}

function formatSetResult(
  scoringType: string,
  setData: Record<string, any>
): string {
  switch (scoringType) {
    case "Time":
      const minutes = setData.minutes as string | undefined;
      const seconds = setData.seconds as string | undefined;
      if (minutes !== undefined && seconds !== undefined) {
        return `${minutes}:${seconds.padStart(2, "0")} (MM:SS)`;
      }
      break;
    case "Rounds + Reps":
      const rounds = setData.rounds as string | undefined;
      const reps = setData.reps as string | undefined;
      if (rounds !== undefined && reps !== undefined) {
        return `${rounds} Rounds + ${reps} Reps`;
      }
      break;
    case "Load":
      const weight = setData.weight as number | undefined;
      const unit = setData.unit as string | undefined;
      if (weight !== undefined && unit !== undefined) {
        return `Load: ${weight} ${unit}`;
      }
      break;
    case "Reps":
      const repsCount = setData.reps as number | undefined;
      if (repsCount !== undefined) {
        return `Reps: ${repsCount}`;
      }
      break;
    // etc.
  }

  // fallback
  return JSON.stringify(setData);
}
