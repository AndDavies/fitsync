"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

type RecentWorkout = {
  date_performed: string;
  user_display_name: string | null;
  workout_title: string | null;
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

  return (
    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
      <h3 className="text-lg font-semibold mb-2 text-gray-100">Recent Workouts from Your Community</h3>
      {loading && <p className="text-sm text-gray-400">Loading workouts...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {workouts && !loading && !error && workouts.length === 0 && (
        <p className="text-sm text-gray-500 italic">No recent workouts found.</p>
      )}
      {workouts && !loading && !error && workouts.length > 0 && (
        <ul className="space-y-3">
          {workouts.map((wo, idx) => (
            <li key={idx} className="bg-gray-800 p-3 rounded border border-gray-600">
              <p className="text-sm text-gray-200">
                <span className="font-medium text-pink-400">
                  {wo.user_display_name || "An Athlete"}
                </span>{" "}
                completed {wo.workout_title ? `"${wo.workout_title}"` : "a workout"} on{" "}
                {new Date(wo.date_performed).toLocaleDateString()}.
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentWorkouts;