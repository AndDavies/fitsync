"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { format, subWeeks } from "date-fns";

interface LoggedWorkout {
  id: string;
  scheduled_workout_id: string;
  date_logged: string;
  result: string | Record<string, unknown> | Record<string, unknown>[];
  scoring_type: string;
  perceived_exertion: number;
  workout_focus: string | null;
}

interface LoggedResultsPageProps {
  userId: string | null;
}

export default function LoggedResultsPage({ userId }: LoggedResultsPageProps) {
  const supabase = createClient();

  const [loggedWorkouts, setLoggedWorkouts] = useState<LoggedWorkout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const [weeklyLoad, setWeeklyLoad] = useState<number>(0);
  const [monthlyLoad, setMonthlyLoad] = useState<number>(0);

  // If no user is provided, show some error or fallback
  if (!userId) {
    return (
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-md w-full">
        <h2 className="text-2xl font-bold mb-4">Your Logged Workouts</h2>
        <p className="text-red-400 text-sm">
          You must be logged in to view your logged workouts.
        </p>
      </div>
    );
  }

  useEffect(() => {
    const fetchLoggedWorkouts = async () => {
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
          .eq("user_profile_id", userId)
          .order("date_logged", { ascending: false });

        if (error) {
          setError("Failed to load workout results: " + error.message);
          setLoading(false);
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
  }, [userId, supabase]);

  useEffect(() => {
    if (loggedWorkouts.length === 0) {
      setWeeklyLoad(0);
      setMonthlyLoad(0);
      return;
    }

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

      if (dateLogged >= oneWeekAgo) {
        sumWeekly += load;
      }
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

  if (loading) {
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
                                More specifics about this workout, notes, or progression data.
                              </p>
                            </div>

                            <div className="p-3 bg-gray-800 rounded-lg">
                              <h3 className="font-semibold text-pink-300 mb-2">
                                AI Coach Insights (Coming Soon)
                              </h3>
                              <p className="text-sm text-gray-300">
                                Future enhancements will offer personalized feedback and suggestions.
                              </p>
                              <p className="text-sm text-gray-400 mt-2 italic">
                                Example: "Compared to last week’s similar workout, you’ve improved your
                                rounds by 10%. Next session, try increasing load for continuous progress."
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

  let parsed: Array<Record<string, any>> = [];

  if (typeof result === "string") {
    try {
      parsed = JSON.parse(result);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }
    } catch {
      return 0;
    }
  } else if (Array.isArray(result)) {
    parsed = result as Array<Record<string, any>>;
  } else if (result && typeof result === "object") {
    parsed = [result as Record<string, any>];
  }

  for (const setObj of parsed) {
    switch (scoringType) {
      case "Rounds + Reps": {
        // Safely cast to string, then parse
        const roundsStr = String(setObj.rounds ?? "0");
        const repsStr = String(setObj.reps ?? "0");
        const rounds = parseInt(roundsStr, 10);
        const reps = parseInt(repsStr, 10);
        total += rounds * 10 + reps;
        break;
      }
      case "Time": {
        const minsStr = String(setObj.minutes ?? "0");
        const secsStr = String(setObj.seconds ?? "0");
        const mins = parseInt(minsStr, 10);
        const secs = parseInt(secsStr, 10);
        total += mins * 60 + secs;
        break;
      }
      case "Load": {
        // If setObj.weight might be a number or string
        const weightStr = String(setObj.weight ?? "0");
        const weight = parseFloat(weightStr);
        total += weight;
        break;
      }
      case "Reps": {
        const repsStr = String(setObj.reps ?? "0");
        const repsCount = parseInt(repsStr, 10);
        total += repsCount;
        break;
      }
      default:
        // fallback for unknown scoring
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
          <li key={idx}>{formatSetResult(scoringType, setObj as Record<string, any>)}</li>
        ))}
      </ul>
    );
  }

  if (result && typeof result === "object") {
    return (
      <span className="text-sm text-pink-300">
        {formatSetResult(scoringType, result as Record<string, any>)}
      </span>
    );
  }

  return <span className="text-sm text-pink-300">{JSON.stringify(result)}</span>;
}

function formatSetResult(scoringType: string, setData: Record<string, any>): string {
  switch (scoringType) {
    case "Time": {
      const minutes = String(setData.minutes ?? "");
      const seconds = String(setData.seconds ?? "");
      if (minutes && seconds) {
        return `${minutes}:${seconds.padStart(2, "0")} (MM:SS)`;
      }
      break;
    }
    case "Rounds + Reps": {
      const rounds = String(setData.rounds ?? "");
      const reps = String(setData.reps ?? "");
      if (rounds && reps) {
        return `${rounds} Rounds + ${reps} Reps`;
      }
      break;
    }
    case "Load": {
      const weight = String(setData.weight ?? "0");
      const unit = String(setData.unit ?? "");
      return `Load: ${weight} ${unit}`;
    }
    case "Reps": {
      const reps = String(setData.reps ?? "");
      if (reps) {
        return `Reps: ${reps}`;
      }
      break;
    }
    // fallback
  }

  return JSON.stringify(setData);
}