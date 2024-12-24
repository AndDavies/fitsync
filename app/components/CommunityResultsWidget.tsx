"use client";

import { useEffect, useState } from "react";

// Define shape of each workout result from the API
interface WorkoutResult {
  id: string;
  user_profile_id: string;
  result: any[]; // because result could hold different shapes
  scoring_type: string;
  date_logged: string;
  user_profiles?: {
    display_name?: string;
  };
}

export default function CommunityResultsWidget() {
  const [results, setResults] = useState<WorkoutResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch("/api/community/workouts", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch community results");
        }
        const jsonData = await res.json();
        setResults(jsonData.results || []);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchResults();
  }, []);

  // Helper function to format the `result` field based on `scoring_type`
  function formatResult(scoringType: string, resultArr: any[]): string {
    if (!resultArr || resultArr.length === 0) return "N/A";
    const resultObj = resultArr[0];

    switch (scoringType) {
      case "Rounds + Reps":
        // e.g. { "reps": "2", "rounds": "20" }
        return `${resultObj.rounds || 0} rounds + ${resultObj.reps || 0} reps`;
      case "Time":
        // e.g. { "minutes": "33", "seconds": "33" }
        const m = resultObj.minutes || "0";
        const s = resultObj.seconds || "00";
        return `${m}:${s} (Time)`;
      // Handle any other scoring types if you have them
      default:
        // Fallback: maybe just JSON stringify the result
        return JSON.stringify(resultObj);
    }
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (results.length === 0) {
    return <p className="text-gray-400">No recent public results.</p>;
  }

  return (
    <div className="bg-gray-800 p-4 text-gray-200 rounded-md">
      <h2 className="text-lg font-semibold mb-4">Recent Workout Results</h2>
      <ul className="space-y-3 list-none">
        {results.map((resItem) => {
          const displayName = resItem.user_profiles?.display_name
            ? resItem.user_profiles.display_name
            : resItem.user_profile_id;

          const formattedScore = formatResult(
            resItem.scoring_type,
            resItem.result
          );

          return (
            <li key={resItem.id} className="bg-gray-700 p-3 rounded-md">
              <div className="flex flex-col">
                <span className="text-sm text-pink-400 font-medium">
                  {displayName}
                </span>
                <span className="text-sm text-slate-100">{formattedScore}</span>
                <span className="text-xs text-gray-400 mt-1">
                  Logged on: {new Date(resItem.date_logged).toLocaleString()}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
