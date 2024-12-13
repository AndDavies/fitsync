"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

interface LoggedWorkout {
  id: string;
  scheduled_workout_id: string;
  date_logged: string;
  result: string | Record<string, unknown> | Record<string, unknown>[];
  scoring_type: string;
  perceived_exertion: number;
  workout_focus: string | null;
}

const LoggedResultsPage: React.FC = () => {
  const { userData, isLoading } = useAuth();
  const [loggedWorkouts, setLoggedWorkouts] = useState<LoggedWorkout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

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

  const handleExpandRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  function formatSetResult(scoringType: string, setData: Record<string, unknown>): string {
    switch (scoringType) {
      case "Time":
        // Expect { minutes: string, seconds: string }
        const minutes = setData.minutes as string | undefined;
        const seconds = setData.seconds as string | undefined;
        if (minutes !== undefined && seconds !== undefined) {
          return `${minutes}:${seconds.padStart(2, '0')} (MM:SS)`;
        }
        break;

      case "Rounds + Reps":
        // Expect { rounds: string, reps: string }
        const rounds = setData.rounds as string | undefined;
        const reps = setData.reps as string | undefined;
        if (rounds !== undefined && reps !== undefined) {
          return `${rounds} Rounds + ${reps} Reps`;
        }
        break;

      case "Load":
        // Expect { weight: number, unit: string }
        const weight = setData.weight as number | undefined;
        const unit = setData.unit as string | undefined;
        if (weight !== undefined && unit !== undefined) {
          return `Load: ${weight} ${unit}`;
        }
        break;

      case "Reps":
        // Expect { reps: number }
        const repsCount = setData.reps as number | undefined;
        if (repsCount !== undefined) {
          return `Reps: ${repsCount}`;
        }
        break;

      case "Calories":
        // Expect { calories: number }
        const calories = setData.calories as number | undefined;
        if (calories !== undefined) {
          return `Calories: ${calories}`;
        }
        break;

      case "Distance":
        // Expect { distance: number }
        const distance = setData.distance as number | undefined;
        if (distance !== undefined) {
          return `Distance: ${distance}`;
        }
        break;

      case "Check Box":
        // Expect { completed: boolean }
        const completed = setData.completed as boolean | undefined;
        if (completed !== undefined) {
          return completed ? "Completed: Yes" : "Completed: No";
        }
        break;
    }

    // If we can't parse based on known structure, fallback to JSON string
    return JSON.stringify(setData, null, 2);
  }

  // Function to format the entire result (which may have multiple sets)
  const formatLoggedResult = (scoringType: string, result: LoggedWorkout["result"]): string => {
    if (typeof result === "string") {
      return result;
    }

    // Check if result is an array of sets
    if (Array.isArray(result)) {
      // We have multiple sets, or possibly just one set but stored in an array
      return result.map((setObj, index) => {
        if (typeof setObj === 'object' && setObj !== null) {
          const setResult = formatSetResult(scoringType, setObj);
          return `Set ${index + 1}: ${setResult}`;
        } else {
          // If setObj is not an object, just stringify it
          return `Set ${index + 1}: ${JSON.stringify(setObj, null, 2)}`;
        }
      }).join('\n');
    }

    // If result is a single object (not array)
    if (typeof result === 'object' && result !== null) {
      // Treat this as a single set scenario
      const singleSetResult = formatSetResult(scoringType, result as Record<string, unknown>);
      return singleSetResult;
    }

    // Default fallback
    return JSON.stringify(result, null, 2);
  };

  const renderResult = (workout: LoggedWorkout) => {
    const formatted = formatLoggedResult(workout.scoring_type, workout.result);
    // If formatted looks like JSON or has multiple lines, show in <pre> for better formatting
    if (formatted.includes('\n') || formatted.trim().startsWith("{")) {
      return (
        <pre className="text-sm text-pink-300 whitespace-pre-wrap break-words">
          {formatted}
        </pre>
      );
    }
    return <span className="text-sm text-pink-300">{formatted}</span>;
  };

  if (loading || isLoading) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center w-full">
        <p>Loading logged workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white p-4 rounded-lg shadow-md flex flex-col items-center w-full bg-gray-900">
        <h2 className="text-xl font-semibold mb-4">Logged Workouts</h2>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="text-white p-6 rounded-lg shadow-md flex flex-col items-center w-full bg-gray-900">
      <h2 className="text-2xl font-bold mb-6">Your Logged Workouts</h2>
      {loggedWorkouts.length > 0 ? (
        <table className="w-full text-left bg-gray-800 rounded-md overflow-hidden">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="px-4 py-2 font-semibold">Date Logged</th>
              <th className="px-4 py-2 font-semibold">Result</th>
              <th className="px-4 py-2 font-semibold">Scoring Type</th>
              <th className="px-4 py-2 font-semibold">Exertion</th>
              <th className="px-4 py-2 font-semibold">Focus</th>
              <th className="px-4 py-2 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody>
            {loggedWorkouts.map((workout) => (
              <React.Fragment key={workout.id}>
                <tr className="border-b border-gray-600 hover:bg-gray-700 transition duration-300 ease-in-out">
                  <td className="px-4 py-2">
                    {format(new Date(workout.date_logged), "MMMM d, yyyy")}
                  </td>
                  <td className="px-4 py-2">
                    {renderResult(workout)}
                  </td>
                  <td className="px-4 py-2">{workout.scoring_type}</td>
                  <td className="px-4 py-2">
                    {workout.perceived_exertion}/10
                  </td>
                  <td className="px-4 py-2">
                    {workout.workout_focus || "General"}
                  </td>
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
                    <td colSpan={6} className="p-4 border-t border-gray-600">
                      <div className="text-white space-y-4">
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <h3 className="font-semibold text-pink-300 mb-2">
                            Additional Workout Details
                          </h3>
                          <p className="text-sm text-gray-300">
                            Here we can show more specifics about this particular workout, 
                            including notes you might have added, or comparing your result 
                            with previous attempts.
                          </p>
                        </div>

                        <div className="p-3 bg-gray-800 rounded-lg">
                          <h3 className="font-semibold text-pink-300 mb-2">
                            AI Coach Insights (Coming Soon)
                          </h3>
                          <p className="text-sm text-gray-300">
                            The AI Coach will review your logged results over time 
                            and provide personalized feedback, tips, and progression advice.
                          </p>
                          <p className="text-sm text-gray-400 mt-2 italic">
                            Example: "Compared to last week’s similar workout, you've improved your rounds by 10%. 
                            Consider increasing the load slightly next time to continue progressing."
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-300">No workouts logged yet.</p>
      )}
    </div>
  );
};

export default LoggedResultsPage;
