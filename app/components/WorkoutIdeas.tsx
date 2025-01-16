"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MdOutlineContentCopy } from "react-icons/md";
import { Text } from "@geist-ui/core"; // If you still need this, or remove if not used

type Workout = {
  workoutid: string;
  title: string;
  description: Record<string, any> | null;
};

type WorkoutIdeasProps = {
  setWorkoutBuilderText: (text: string) => void;
  setWorkoutBuilderId: (id: string | null) => void;
  category: string;
};

function convertJsonToHumanReadable(json: any): string {
  if (!json) return "No details available.";

  const lines: string[] = [];
  if (json.type) lines.push(json.type);

  if (json.workout && Array.isArray(json.workout)) {
    for (const block of json.workout) {
      if (block.movements && Array.isArray(block.movements)) {
        for (const mov of block.movements) {
          // Skip if the movement name includes "notes"
          if (mov.name && mov.name.toLowerCase().includes("notes")) {
            continue;
          }

          let line = "";
          if (mov.reps) {
            if (Array.isArray(mov.reps)) {
              line += mov.reps.join("-") + " ";
            } else {
              line += mov.reps + " ";
            }
          }
          line += mov.name || "Unknown Movement";
          if (mov.distance) {
            line += ` ${mov.distance}`;
          }
          lines.push(line.trim());
        }
      } else if (block.name && block.reps) {
        const repsText = Array.isArray(block.reps)
          ? block.reps.join("-")
          : block.reps;
        lines.push(`${block.name}: ${repsText}`);
      }
    }
  }

  return lines.length > 0 ? lines.join("\n") : "No details available.";
}

const WorkoutIdeas: React.FC<WorkoutIdeasProps> = ({
  setWorkoutBuilderText,
  setWorkoutBuilderId,
  category,
}) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [search, setSearch] = useState("");

  // 1) Fetch from SSR endpoint
  useEffect(() => {
    if (!category) return;

    async function fetchWorkouts() {
      try {
        const res = await fetch(
          `/api/workouts/ideas?category=${encodeURIComponent(category)}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: "Failed" }));
          console.error("Error fetching workouts from SSR endpoint:", error);
          return;
        }
        const { workouts } = await res.json();
        setWorkouts(workouts || []);
      } catch (err) {
        console.error("Unexpected error fetching workouts:", err);
      }
    }

    fetchWorkouts();
  }, [category]);

  // 2) Filter
  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) =>
      w.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [workouts, search]);

  // 3) Use the returned data
  const handleUseWorkout = (workout: Workout) => {
    const humanReadableText = convertJsonToHumanReadable(workout.description);
    setWorkoutBuilderText(humanReadableText);
    setWorkoutBuilderId(workout.workoutid);
  };

  // 4) Render
  return (
    <div className="space-y-4">
      <input
        placeholder="Search workouts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-border rounded bg-secondary text-secondary-foreground 
          placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
      />

      {filteredWorkouts.map((workout) => {
        const humanReadable = workout.description
          ? convertJsonToHumanReadable(workout.description)
          : "No data";

        return (
          <div
            key={workout.workoutid}
            className="border border-border rounded p-4 bg-card hover:border-accent transition"
          >
            <div className="flex items-center justify-between mb-2">
              {/* If you no longer need <Text> from @geist-ui, 
                  just replace with <span> or <h3> etc. */}
              <Text b style={{ color: "var(--foreground)" }}>
                {workout.title}
              </Text>
              <button
                onClick={() => handleUseWorkout(workout)}
                className="text-xs py-1 px-2 bg-accent text-accent-foreground hover:bg-accent/90 
                  rounded flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-accent transition"
              >
                <MdOutlineContentCopy />
                <span>Use This Workout</span>
              </button>
            </div>
            <textarea
              readOnly
              value={humanReadable}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                resize: "none",
                overflow: "auto",
                fontSize: "0.875rem",
              }}
              className="border border-border bg-secondary text-secondary-foreground focus:outline-none 
                focus:ring-2 focus:ring-accent placeholder-muted-foreground mt-2 transition-colors duration-300"
            />
          </div>
        );
      })}
    </div>
  );
};

export default WorkoutIdeas;