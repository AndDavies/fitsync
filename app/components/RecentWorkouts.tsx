"use client";

import React, { useEffect, useState } from "react";

type RecentWorkout = {
  date_performed: string;
  user_display_name: string | null;
  workout_title: string | null;
  scoring_type?: string;
  result?: string | Record<string, any> | Record<string, any>[];
};

export default function RecentWorkouts() {
  const [workouts, setWorkouts] = useState<RecentWorkout[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/workouts/recent");
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
    }
    fetchWorkouts();
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading workouts...</p>;
  }
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }
  if (!workouts || workouts.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No recent workouts found.</p>;
  }

  return (
    <div className="p-4 bg-card rounded-xl border border-border text-card-foreground">
      <h3 className="text-lg font-semibold mb-2">Recent Workouts from Your Community</h3>

      <ul className="space-y-3">
        {workouts.map((wo, idx) => {
          const resultString = formatWorkoutResult(wo.scoring_type, wo.result);

          return (
            <li key={idx} className="bg-secondary p-3 rounded border border-border">
              <p className="text-accent font-semibold text-sm">
                {wo.user_display_name || "An Athlete"}
              </p>
              {resultString && (
                <p className="text-accent text-sm">{resultString}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Logged on: {new Date(wo.date_performed).toLocaleString()}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatWorkoutResult(
  scoringType?: string,
  rawResult?: string | Record<string, any> | Record<string, any>[]
): string | null {
  if (!scoringType || !rawResult) return null;
  if (scoringType.toLowerCase() !== "load") {
    return null;
  }

  let parsed: Array<Record<string, any>> = [];

  if (typeof rawResult === "string") {
    try {
      parsed = JSON.parse(rawResult);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }
    } catch {
      return rawResult;
    }
  } else if (Array.isArray(rawResult)) {
    parsed = rawResult;
  } else if (typeof rawResult === "object") {
    parsed = [rawResult];
  }

  if (parsed.length === 0) return null;

  if (parsed.length > 1) {
    return parsed
      .map((setObj, i) => {
        const w = setObj.weight || 0;
        const u = setObj.unit || "";
        return `Set ${i + 1}: ${w} ${u}`;
      })
      .join(" | ");
  } else {
    const first = parsed[0];
    const w = first.weight || 0;
    const u = first.unit || "";
    return `${w} ${u}`;
  }
}