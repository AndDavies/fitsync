"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DailyWOD from "../components/DailyWOD";
import GoalsDisplay from "../components/GoalsDisplay";
import RecentArticles from "../components/RecentArticles";
import RecentWorkouts from "../components/RecentWorkouts";

function formatGoal(goal: string): string {
  return goal
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Dashboard() {
  const { session, isLoading, userData } = useAuth();
  const router = useRouter();

  const [workoutsCompleted, setWorkoutsCompleted] = useState<number | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [hasFetchedSuggestion, setHasFetchedSuggestion] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.push("/login");
      } else if (userData && !userData.onboarding_completed) {
        router.push("/onboarding");
      }
    }
  }, [isLoading, session, userData, router]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/user/metrics", { credentials: "include" });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch metrics");
        }
        const data = await res.json();
        if (typeof data.workouts_completed_past_7_days === "number") {
          setWorkoutsCompleted(data.workouts_completed_past_7_days);
        } else {
          setMetricsError("Unexpected data format.");
        }
      } catch (err: any) {
        console.error("Error fetching metrics:", err.message);
        setMetricsError("Could not load metrics. Please try again later.");
      }
    };

    if (!isLoading && userData?.onboarding_completed) {
      fetchMetrics();
    }
  }, [isLoading, userData]);

  useEffect(() => {
    const storedSuggestion = localStorage.getItem("userSuggestion");
    if (storedSuggestion) {
      setSuggestion(storedSuggestion);
      setHasFetchedSuggestion(true);
    }
  }, []);

  const fetchSuggestion = async () => {
    try {
      const res = await fetch("/api/user/suggestions");
      const data = await res.json();
      if (data.suggestion) {
        setSuggestion(data.suggestion);
        localStorage.setItem("userSuggestion", data.suggestion);
        setHasFetchedSuggestion(true);
      } else {
        console.error("No suggestion returned:", data.error);
      }
    } catch (err) {
      console.error("Error fetching suggestion:", err);
    }
  };

  if (isLoading || !session || !userData) {
    return (
      <div className="bg-gray-900 text-gray-200 h-screen flex items-center justify-center">
        <p className="text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  const userGoal = typeof userData.goals === "string" ? formatGoal(userData.goals) : "General Health";

  // Process the suggestion for nicer formatting
  let normalLines: string[] = [];
  let bullets: string[] = [];
  if (suggestion) {
    const lines = suggestion.split("\n").map(line => line.trim()).filter(Boolean);
    lines.forEach(line => {
      if (line.startsWith("- ")) {
        bullets.push(line.slice(2).trim());
      } else {
        normalLines.push(line);
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />

      <main className="flex-grow p-6 sm:p-8 lg:p-10 space-y-6 bg-gray-900 text-gray-100">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome & Goals */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                Welcome, {userData.display_name || "Athlete"}!
              </h2>
              <p className="text-gray-300">
                Your primary goal:{" "}
                <span className="font-semibold text-pink-500">{userGoal}</span>.
              </p>

              {suggestion ? (
                <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-blue-500 text-blue-400">
                  <h3 className="text-lg font-semibold mb-2">Coach’s Tip</h3>
                  {normalLines.map((line, i) => (
                    <p key={`line-${i}`} className="text-sm mb-2">{line}</p>
                  ))}
                  {bullets.length > 0 && (
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-400">
                      {bullets.map((bullet, i) => (
                        <li key={`bullet-${i}`}>{bullet}</li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => {
                      localStorage.removeItem("userSuggestion");
                      setHasFetchedSuggestion(false);
                      setSuggestion(null);
                    }}
                    className="mt-2 text-xs text-red-400 hover:text-red-300"
                  >
                    Clear Suggestion
                  </button>
                </div>
              ) : (
                <div className="mt-4">
                  {!hasFetchedSuggestion && (
                    <button
                      onClick={fetchSuggestion}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
                    >
                      Get Suggestion
                    </button>
                  )}
                  {hasFetchedSuggestion && !suggestion && (
                    <p className="text-gray-400 text-sm">No suggestion available.</p>
                  )}
                </div>
              )}
            </div>

            {/* Daily WOD */}
            <DailyWOD />

            {/* Key Metrics */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <GoalsDisplay />
              {/* Uncomment if you want to show metrics
              <h3 className="text-lg font-semibold text-gray-100">Key Metrics This Week</h3>
              {metricsError ? (
                <p className="text-red-400 text-sm mt-2">{metricsError}</p>
              ) : workoutsCompleted === null ? (
                <p className="text-gray-400 text-sm mt-2">Loading metrics...</p>
              ) : (
                <>
                  <p className="text-gray-300 text-sm mt-2">
                    Workouts Completed:{" "}
                    <span className="font-bold text-gray-100">{workoutsCompleted}</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Aim for 3 this week to stay on track!
                  </p>
                </>
              )} */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentArticles />
            <RecentWorkouts />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
