"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import LeftNav from "../components/LeftNav";

export default function Dashboard() {
  const { session, isLoading, userData } = useAuth();
  const router = useRouter();
  const [workoutsCompleted, setWorkoutsCompleted] = useState<number | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null); // New state for suggestion
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  // Redirect logic:
  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.push("/login");
      } else if (userData && !userData.onboarding_completed) {
        router.push("/onboarding");
      }
    }
  }, [isLoading, session, userData, router]);

  // Fetch metrics once the user is fully authenticated and onboarded:
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/user/metrics", {
          credentials: 'include' // Ensure cookies are sent
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch metrics");
        }
        const data = await res.json();
        if (typeof data.workouts_completed_past_7_days === "number") {
          setWorkoutsCompleted(data.workouts_completed_past_7_days);
        } else {
          setMetricsError("Metrics data format is unexpected.");
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

  // Fetch suggestion after metrics are loaded or once user is ready
  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        const res = await fetch('/api/user/suggestions', { credentials: 'include' });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch suggestion");
        }
        const data = await res.json();
        setSuggestion(data.suggestion || null);
      } catch (err: any) {
        console.error("Error fetching suggestion:", err.message);
        setSuggestionError("Could not load suggestions. Please try again later.");
      }
    };

    // Only fetch suggestions if userData is loaded and onboarding is completed
    // and there's no metrics error blocking view
    if (!isLoading && userData?.onboarding_completed && !metricsError) {
      fetchSuggestion();
    }
  }, [isLoading, userData, metricsError]);

  if (isLoading || !session || !userData) {
    return <div>Loading your dashboard...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-grow">
        <LeftNav />
        <main className="flex-grow p-6">
          <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow space-y-4">
            <h2 className="text-2xl font-bold">
              Welcome, {userData.display_name || "Athlete"}!
            </h2>
            <p className="text-gray-700">
              Your primary goal:{" "}
              <span className="font-semibold text-pink-600">
                {userData.goals || "General Health"}
              </span>.
              We’ll help you track progress towards this goal by logging your workouts and monitoring trends over time.
            </p>

            <div className="p-4 bg-gray-50 rounded border">
              <h3 className="text-lg font-semibold">Key Metric This Week</h3>
              {metricsError ? (
                <p className="text-red-500 text-sm mt-2">{metricsError}</p>
              ) : workoutsCompleted === null ? (
                <p className="text-gray-500 text-sm mt-2">Loading metrics...</p>
              ) : (
                <p className="text-gray-700 text-sm mt-2">
                  Workouts Completed:{" "}
                  <span className="font-bold">{workoutsCompleted}</span>
                </p>
              )}

              {!metricsError && workoutsCompleted !== null && (
                <p className="text-gray-500 text-xs mt-1">
                  Aim for 3 this week to stay on track!
                </p>
              )}
            </div>

            {/* Coach's Tip / Suggestion Section */}
            {suggestionError && (
              <div className="p-4 bg-red-50 rounded border text-red-700 text-sm">
                {suggestionError}
              </div>
            )}
            {suggestion && !suggestionError && (
              <div className="p-4 bg-blue-50 rounded border text-blue-800">
                <h3 className="text-lg font-semibold mb-2">Coach’s Tip</h3>
                <p className="text-sm">{suggestion}</p>
              </div>
            )}

            <p className="text-gray-700">
              As you progress, we’ll show you more insights—like your strength improvements,
              conditioning levels, and suggestions from our AI coach. For now, let’s keep it simple.
              When you’re ready, you can explore more data by visiting the <strong>Workouts</strong> or <strong>Plan</strong> pages.
            </p>

            <p className="text-sm text-gray-500 italic">
              Hover over metrics on other pages to see tooltips and learn more about what they mean.
            </p>
          </div>
        </main>
      </div>
      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
