"use client";
import React, { useState, useEffect } from "react";
import { MdOutlineContentCopy } from "react-icons/md";
import { Text } from "@geist-ui/core";

// Helper to convert JSON to plain text
function convertJsonToHumanReadable(json: any): string {
  // ... (same logic as your original function)
  if (!json) return "No details available.";

  const lines: string[] = [];
  // ... your existing logic
  return lines.length > 0 ? lines.join("\n") : "No details available.";
}

interface Workout {
  workoutid: string;
  title: string;
  description: Record<string, any> | null;
}

interface WorkoutCategoryAccordionProps {
  category: string; // e.g. "Hero", "Metcon", "Benchmark", "GPP"
  setWorkoutBuilderText: (text: string) => void;
  setWorkoutBuilderId: (id: string | null) => void;
}

export default function WorkoutCategoryAccordion({
  category,
  setWorkoutBuilderText,
  setWorkoutBuilderId,
}: WorkoutCategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

  // On mount or if category changes, fetch from /api/workouts/ideas
  useEffect(() => {
    async function fetchWorkouts() {
      setLoading(true);
      try {
        // For GPP, we can pass a query param, or treat it as ?category=GPP
        // or special-case "NULL" in the server route if needed
        const catParam = category === "GPP" ? "" : category; // or pass "GPP" if that's in DB
        const res = await fetch(
          `/api/workouts/ideas?category=${encodeURIComponent(catParam)}`,
          { credentials: "include" }
        );
        if (!res.ok) {
          console.error(`Failed to fetch workouts for category ${category}`);
          setLoading(false);
          return;
        }
        const json = await res.json();
        setWorkouts(json.workouts || []);
      } catch (err) {
        console.error("Error fetching workouts:", err);
      } finally {
        setLoading(false);
      }
    }

    // Only fetch when accordion is opened, for performance
    if (isOpen) {
      fetchWorkouts();
    }
  }, [isOpen, category]);

  const handleUseWorkout = (workout: Workout) => {
    const humanReadableText = convertJsonToHumanReadable(workout.description);
    setWorkoutBuilderText(humanReadableText);
    setWorkoutBuilderId(workout.workoutid);
  };

  return (
    <div className="border border-gray-700 rounded bg-gray-800">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-4 py-2 bg-gray-700 hover:bg-pink-500 hover:text-white transition"
      >
        <span className="font-semibold text-sm">
          {category === "GPP" ? "General Physical Preparedness" : category} Workouts
        </span>
        <span>{isOpen ? "–" : "+"}</span>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {loading && <p className="text-gray-400 text-sm">Loading {category} workouts...</p>}

          {!loading && workouts.length === 0 && (
            <p className="text-gray-500 text-sm italic">No workouts found for {category}.</p>
          )}

          {!loading &&
            workouts.map((workout) => {
              const humanReadable = convertJsonToHumanReadable(workout.description);

              return (
                <div
                  key={workout.workoutid}
                  className="border border-gray-700 rounded p-3 bg-gray-900"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Text b style={{ color: "#F9FAFB" }}>
                      {workout.title}
                    </Text>
                    <button
                      onClick={() => handleUseWorkout(workout)}
                      className="text-xs py-1 px-2 bg-pink-500 hover:bg-pink-600 text-white rounded flex items-center space-x-1 focus:outline-none transition"
                    >
                      <MdOutlineContentCopy className="text-white" />
                      <span>Use</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={humanReadable}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #4B5563",
                      borderRadius: "4px",
                      resize: "none",
                      overflow: "auto",
                      fontSize: "0.875rem",
                      backgroundColor: "#111827",
                      color: "#F9FAFB",
                      minHeight: "4em",
                    }}
                    className="focus:outline-none"
                  />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}