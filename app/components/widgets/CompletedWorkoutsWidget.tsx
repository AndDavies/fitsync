import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "../../context/AuthContext";
import { format, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear } from "date-fns";
import { useRouter } from 'next/navigation';

type WorkoutResult = {
  id: string;
  date_performed: string;
};

const CompletedWorkoutsWidget: React.FC = () => {
  const { userData, isLoading } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        const { data, error } = await supabase
          .from("workout_results")
          .select(`
            id,
            date_performed
          `)
          .eq("user_profile_id", userData.user_id)
          .order("date_performed", { ascending: false });

        if (error) {
          console.error("Error fetching workout results:", error);
          setError("Failed to load workout results.");
          return;
        }

        if (!data || data.length === 0) {
          setError("No completed workouts found.");
        } else {
          setWorkouts(data as WorkoutResult[]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(`An unexpected error occurred: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedWorkouts();
  }, [isLoading, userData]);

  const calculateStats = () => {
    const now = new Date();
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 0 });
    const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 0 });
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const startOfCurrentYear = startOfYear(now);
    const endOfCurrentYear = endOfYear(now);

    const workoutsThisWeek = workouts.filter(workout =>
      new Date(workout.date_performed) >= startOfCurrentWeek &&
      new Date(workout.date_performed) <= endOfCurrentWeek
    ).length;

    const workoutsThisMonth = workouts.filter(workout =>
      new Date(workout.date_performed) >= startOfCurrentMonth &&
      new Date(workout.date_performed) <= endOfCurrentMonth
    ).length;

    const workoutsYearToDate = workouts.filter(workout =>
      new Date(workout.date_performed) >= startOfCurrentYear &&
      new Date(workout.date_performed) <= endOfCurrentYear
    ).length;

    return { workoutsThisWeek, workoutsThisMonth, workoutsYearToDate };
  };

  const stats = calculateStats();

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
    <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-md flex flex-col items-start h-auto">
      <div className="mb-4 w-full">
        <h2 className="text-lg font-bold mb-2">Completed Workouts</h2>
        <p className="text-md font-semibold mb-1">
          {format(new Date(), "MMMM yyyy")}
        </p>
      </div>

      {/* Stats Display */}
      <div className="flex flex-col items-start space-y-3 mb-4 w-full">
        <div className="bg-gray-800 p-3 rounded-lg w-full shadow-md">
          <span className="text-sm font-semibold">This Week:</span>
          <span className="block text-lg font-bold">{stats.workoutsThisWeek}</span>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg w-full shadow-md">
          <span className="text-sm font-semibold">This Month:</span>
          <span className="block text-lg font-bold">{stats.workoutsThisMonth}</span>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg w-full shadow-md">
          <span className="text-sm font-semibold">Year to Date:</span>
          <span className="block text-lg font-bold">{stats.workoutsYearToDate}</span>
        </div>
      </div>

      {/* Link to logged results page */}
      <button
        onClick={() => router.push('/workouts/logged-results')}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
      >
        View Logged Results
      </button>
    </div>
  );
};

export default CompletedWorkoutsWidget;
