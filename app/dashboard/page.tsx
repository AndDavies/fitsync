"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

const AthleteDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login"); // Redirect to login if not authenticated
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.email || "Athlete"}!
        </h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm">🔥 3-Day Streak</div>
          <img
            src="/path-to-profile-icon.jpg"
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="space-y-4">
        {/* Workout Generator Widget */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Workout Generator</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Generate Workout
          </button>
          <div className="mt-2 text-sm">
            <p>5 Rounds for Time: 10 Burpees, 15 Kettlebell Swings</p>
          </div>
          <button className="bg-green-500 text-white mt-2 px-4 py-2 rounded">
            Log Workout
          </button>
        </div>

        {/* Performance Tracking Widget */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Performance Tracking</h2>
          <ul className="text-sm space-y-1">
            <li>Back Squat: 3x5 @ 200 lbs</li>
            <li>Deadlift PR: 315 lbs</li>
          </ul>
          <a
            href="/full-history"
            className="text-blue-500 text-sm mt-2 block"
          >
            View Full History
          </a>
        </div>

        {/* Goal Progress Widget */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Goal Progress</h2>
          <div className="w-full bg-gray-300 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{ width: "80%" }}
            ></div>
          </div>
          <p className="text-sm mt-1">Squat 250 lbs - 80% complete</p>
          <button className="bg-yellow-500 text-white mt-2 px-4 py-2 rounded">
            Add New Goal
          </button>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 w-full bg-white p-4 shadow-inner flex justify-around">
        <button>🏠 Home</button>
        <button>🏋️ Workouts</button>
        <button>👥 Community</button>
        <button>⚙️ Profile</button>
      </footer>
    </div>
  );
};

export default AthleteDashboard;
