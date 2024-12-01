"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

// Defining a type for the logged workout
interface LoggedWorkout {
  id: string;
  scheduled_workout_id: string;
  date_logged: string;
  result: string | { [key: string]: unknown }; // Result can either be a string or an object (JSONB)
  scoring_type: string;
  perceived_exertion: number;
  workout_focus: string;
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
          // Specify the data type explicitly to avoid using `any`
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

  // Function to safely render the result data
  const renderResult = (result: LoggedWorkout["result"]) => {
    if (typeof result === "string") {
      return result; // Render as-is if it is a string
    }

    if (typeof result === "object") {
      return (
        <pre className="text-sm text-white">
          {JSON.stringify(result, null, 2)}
        </pre>
      ); // Render the object as a formatted JSON string
    }

    return "N/A"; // Default fallback if result type is unknown
  };

  if (loading || isLoading) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-3xl shadow-md flex flex-col items-center justify-center w-full">
        <p>Loading logged workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-3xl shadow-md flex flex-col items-center justify-center w-full">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="text-white p-4 rounded-3xl shadow-md flex flex-col items-center w-full">
      <h2 className="text-2xl font-semibold mb-4">Logged Workouts</h2>
      {loggedWorkouts.length > 0 ? (
        <table className="w-full text-left bg-gray-800 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="px-4 py-2 font-semibold">Date Logged</th>
              <th className="px-4 py-2 font-semibold">Result</th>
              <th className="px-4 py-2 font-semibold">Scoring Type</th>
              <th className="px-4 py-2 font-semibold">Perceived Exertion</th>
              <th className="px-4 py-2 font-semibold">Workout Focus</th>
              <th className="px-4 py-2 font-semibold">Expand Details</th>
            </tr>
          </thead>
          <tbody>
            {loggedWorkouts.map((workout) => (
              <React.Fragment key={workout.id}>
                <tr
                  className="border-b hover:bg-gray-600 transition duration-300 ease-in-out cursor-pointer"
                >
                  <td className="px-4 py-2">
                    {format(new Date(workout.date_logged), "MMMM d, yyyy")}
                  </td>
                  <td className="px-4 py-2">
                    {renderResult(workout.result)}
                  </td>
                  <td className="px-4 py-2">{workout.scoring_type}</td>
                  <td className="px-4 py-2">{workout.perceived_exertion}</td>
                  <td className="px-4 py-2">{workout.workout_focus}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleExpandRow(workout.id)}
                      className="px-2 py-1 text-blue-500 border border-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition duration-300"
                    >
                      {expandedRowId === workout.id ? "Hide Details" : "Expand Details"}
                    </button>
                  </td>
                </tr>
                {expandedRowId === workout.id && (
                  <tr className="bg-gray-700">
                    <td colSpan={6} className="p-4">
                      {/* Placeholder for Expanded Details Component */}
                      <div className="text-white">
                        {/* Add further details or a component here */}
                        <p className="text-sm mb-2">Workout details coming soon...</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No workouts logged yet.</p>
      )}
    </div>
  );
};

export default LoggedResultsPage;
