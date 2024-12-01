import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";

type WorkoutResult = {
  id: string;
  scheduled_workout_id: string;
  result: string;
  date_performed: string;
  notes: string;
  perceived_exertion: number;
};

const CompletedWorkoutsWidget: React.FC = () => {
  const { userData, isLoading } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedWorkouts = async () => {
      if (isLoading) {
        return;
      }

      if (!userData?.user_id) {
        setError("No user found.");
        setLoading(false);
        return;
      }

      try {
        // Debug: Log the userData to ensure user_id is correctly retrieved
        console.log("userData:", userData);

        const { data, error } = await supabase
          .from("workout_results")
          .select(`
            id,
            scheduled_workout_id,
            result,
            date_performed,
            notes,
            perceived_exertion
          `)
          .eq("user_profile_id", userData.user_id)
          .order("date_performed", { ascending: false });

        if (error) {
          console.error("Error fetching workout results:", error);
          setError("Failed to load workout results.");
          return;
        }

        // Debug: Log fetched data to check if it returns anything
        console.log("Fetched workout data:", data);

        if (!data || data.length === 0) {
          setError("No completed workouts found.");
        } else {
          setWorkouts(data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(`An unexpected error occurred: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedWorkouts();
  }, [isLoading, userData?.user_id]);

  if (isLoading || loading) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-3xl shadow-md flex flex-col items-center justify-center w-1/4 h-32">
        <p>Loading completed workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-3xl shadow-md flex flex-col items-center justify-center w-1/4 h-32">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white p-4 rounded-3xl shadow-md flex flex-col items-center justify-between w-1/4 h-80 overflow-hidden">
      <div className="flex flex-col items-center mb-2">
        <span className="text-md font-semibold">Completed Workouts</span>
        <span className="text-lg font-bold">{format(new Date(), "MMMM yyyy")}</span>
      </div>
      <ul className="w-full px-4 overflow-y-auto space-y-2">
        {workouts.map((workout) => (
          <li
            key={workout.id}
            className="bg-gray-800 p-3 rounded-lg shadow-sm flex flex-col"
          >
            <div className="text-lg font-bold">
              {workout.result.split(",")[0]} {/* Display a part of the result for a summary */}
            </div>
            <div className="text-sm text-gray-400">
              {format(new Date(workout.date_performed), "EEEE, MMM d, yyyy")}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Perceived Exertion: {workout.perceived_exertion} / 10
            </div>
            {workout.notes && (
              <div className="text-sm italic text-gray-400 mt-1">"{workout.notes}"</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompletedWorkoutsWidget;
