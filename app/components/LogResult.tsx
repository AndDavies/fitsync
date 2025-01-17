/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */

"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LogResultProps {
  workoutId: string;
  userId: string | null; // SSR-provided user ID
}

// Example typed forms for various scoring:
type TimeResult = { minutes: string; seconds: string };
type RoundsRepsResult = { rounds: string; reps: string };
type LoadResult = { weight: number; unit: string };
type RepsResult = { reps: number };
type CaloriesResult = { calories: number };
type DistanceResult = { distance: number };
type CheckBoxResult = { completed: boolean };
type UnknownResult = string;

type FormattedResult =
  | TimeResult
  | RoundsRepsResult
  | LoadResult
  | RepsResult
  | CaloriesResult
  | DistanceResult
  | CheckBoxResult
  | UnknownResult;

export default function LogResult({ workoutId, userId }: LogResultProps) {
  const supabase = createClient();
  const router = useRouter();

  const [workoutName, setWorkoutName] = useState<string>("");
  const [workoutDate, setWorkoutDate] = useState<string>("");

  const [scoringSet, setScoringSet] = useState<number>(1);
  const [scoringType, setScoringType] = useState<string>("");
  const [advancedScoring, setAdvancedScoring] = useState<string>("");
  const [results, setResults] = useState<string[][]>([]);

  const [perceivedExertion, setPerceivedExertion] = useState<number>(5);
  const [notes, setNotes] = useState<string>("");

  const [logSuccess, setLogSuccess] = useState<string | null>(null);

  // If user not provided, handle error or redirect
  if (!userId) {
    return (
      <div className="p-6 bg-gray-900 text-white rounded-lg">
        <p className="text-red-400">User not authenticated. Please log in.</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!workoutId) {
        alert("No workout ID provided.");
        router.push("/workouts");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("scheduled_workouts")
          .select("name, date, scoring_set, scoring_type, advanced_scoring")
          .eq("id", workoutId)
          .single();

        if (error) throw error;

        if (data) {
          setWorkoutName(data.name || "Workout");
          setWorkoutDate(data.date || "");

          const setCount = parseInt(data.scoring_set) || 1;
          setScoringSet(setCount);
          setScoringType(data.scoring_type || "");
          setAdvancedScoring(data.advanced_scoring || "");

          // Initialize empty arrays for the user’s input
          setResults(
            Array.from({ length: setCount }, () =>
              Array(getFieldCountForScoringType(data.scoring_type)).fill("")
            )
          );
        }
      } catch (err) {
        alert("Unable to load workout details.");
        router.push("/workouts");
      }
    };

    fetchWorkoutData();
  }, [workoutId, router, supabase]);

  function getFieldCountForScoringType(type: string): number {
    switch (type) {
      case "Time":
        return 2;
      case "Rounds + Reps":
        return 2;
      case "Load":
        return 1;
      default:
        return 1;
    }
  }

  const handleInputChange = (setIndex: number, valueIndex: number, value: string) => {
    setResults((prev) => {
      const updated = [...prev];
      if (!updated[setIndex]) {
        updated[setIndex] = Array(getFieldCountForScoringType(scoringType)).fill("");
      }
      updated[setIndex][valueIndex] = value;
      return updated;
    });
  };

  const renderInputFields = (setIndex: number) => {
    if (!results[setIndex]) {
      setResults((prevResults) => {
        const newResults = [...prevResults];
        newResults[setIndex] = Array(getFieldCountForScoringType(scoringType)).fill("");
        return newResults;
      });
      return null;
    }

    switch (scoringType) {
      case "Time":
        return (
          <div className="flex items-center space-x-2">
            <label className="text-gray-300">Time (MM:SS):</label>
            <input
              type="text"
              placeholder="MM"
              value={results[setIndex][0] || ""}
              onChange={(e) => handleInputChange(setIndex, 0, e.target.value)}
              className="w-16 p-2 border border-gray-500 rounded-md text-center bg-gray-800 text-white"
            />
            <span>:</span>
            <input
              type="text"
              placeholder="SS"
              value={results[setIndex][1] || ""}
              onChange={(e) => handleInputChange(setIndex, 1, e.target.value)}
              className="w-16 p-2 border border-gray-500 rounded-md text-center bg-gray-800 text-white"
            />
          </div>
        );
      case "Rounds + Reps":
        return (
          <div className="flex items-center space-x-2">
            <label className="text-gray-300">Rounds + Reps:</label>
            <input
              type="number"
              placeholder="Rounds"
              value={results[setIndex][0] || ""}
              onChange={(e) => handleInputChange(setIndex, 0, e.target.value)}
              className="w-16 p-2 border border-gray-500 rounded-md text-center bg-gray-800 text-white"
            />
            <span>+</span>
            <input
              type="number"
              placeholder="Reps"
              value={results[setIndex][1] || ""}
              onChange={(e) => handleInputChange(setIndex, 1, e.target.value)}
              className="w-16 p-2 border border-gray-500 rounded-md text-center bg-gray-800 text-white"
            />
          </div>
        );
      case "Load":
        return (
          <div className="flex items-center space-x-2">
            <label className="text-gray-300">Load:</label>
            <input
              type="number"
              placeholder="Load"
              value={results[setIndex][0] || ""}
              onChange={(e) => handleInputChange(setIndex, 0, e.target.value)}
              className="w-24 p-2 border border-gray-500 rounded-md bg-gray-800 text-white"
            />
            <select className="p-2 border border-gray-500 rounded-md bg-gray-800 text-white">
              <option value="lbs">Lbs</option>
              <option value="kg">Kg</option>
            </select>
          </div>
        );
      default:
        // "Reps", "Calories", "Distance", or fallback
        return (
          <div className="flex items-center space-x-2">
            <label className="text-gray-300">{scoringType}:</label>
            <input
              type="number"
              placeholder={scoringType}
              value={results[setIndex][0] || ""}
              onChange={(e) => handleInputChange(setIndex, 0, e.target.value)}
              className="w-full p-2 border border-gray-500 rounded-md bg-gray-800 text-white"
            />
          </div>
        );
    }
  };

  const formatResults = (): FormattedResult[] => {
    return results.map((setArray) => {
      switch (scoringType) {
        case "Time":
          return { minutes: setArray[0], seconds: setArray[1] };
        case "Rounds + Reps":
          return { rounds: setArray[0], reps: setArray[1] };
        case "Load":
          return {
            weight: parseInt(setArray[0], 10),
            unit: "lbs",
          };
        case "Reps":
          return { reps: parseInt(setArray[0], 10) };
        case "Calories":
          return { calories: parseInt(setArray[0], 10) };
        case "Distance":
          return { distance: parseInt(setArray[0], 10) };
        case "Check Box":
          return { completed: setArray[0] === "1" };
        default:
          // Just store as a string
          return setArray.join(":");
      }
    });
  };

  const handleSubmit = async () => {
    const formattedResults = formatResults();

    // Check for missing fields
    const missing = formattedResults.some((res) => {
      if (scoringType === "Time" && typeof res !== "string") {
        const timeRes = res as TimeResult;
        return !timeRes.minutes || !timeRes.seconds;
      }
      if (scoringType === "Rounds + Reps" && typeof res !== "string") {
        const rrRes = res as RoundsRepsResult;
        return !rrRes.rounds || !rrRes.reps;
      }
      if (scoringType === "Load" && typeof res !== "string") {
        const loadRes = res as LoadResult;
        return isNaN(loadRes.weight);
      }
      if (["Reps", "Calories", "Distance"].includes(scoringType) && typeof res !== "string") {
        const val = Object.values(res)[0];
        return val === null || val === undefined || val === "" || isNaN(val as number);
      }
      return false;
    });

    if (missing) {
      alert("Please fill in all required fields for the workout result before submitting.");
      return;
    }

    try {
      const performedAt = new Date().toISOString();

      const { error } = await supabase
        .from("workout_results")
        .insert({
          scheduled_workout_id: workoutId,
          user_profile_id: userId,
          result: formattedResults,
          perceived_exertion: perceivedExertion,
          notes,
          date_logged: new Date().toISOString(),
          date_performed: performedAt,
          scoring_type: scoringType,
          advanced_scoring: advancedScoring,
          order_type: advancedScoring === "Max" ? "Descending" : "Ascending",
        });

      if (error) throw error;

      setLogSuccess("Successfully logged your workout result!");
    } catch (err) {
      const error = err as Error;
      console.error("Error logging workout result:", error.message);
      alert("There was an issue logging your workout result. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg space-y-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <Link href="/plan" className="text-sm text-pink-400 hover:text-pink-300 transition cursor-pointer">
          ← Back to Calendar
        </Link>
        {logSuccess && <p className="text-green-400 text-sm">{logSuccess}</p>}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-100">{workoutName || "Workout"}</h2>
        {workoutDate && (
          <p className="text-sm text-gray-300">
            Scheduled on {new Date(workoutDate).toLocaleDateString()}
          </p>
        )}
        <p className="text-sm text-gray-400">Enter your workout result below.</p>
      </div>

      {/* Input fields for each set */}
      <div className="bg-gray-800 p-4 rounded-md space-y-4">
        {Array.from({ length: scoringSet }, (_, setIndex) => (
          <div key={setIndex} className="bg-gray-700 p-3 rounded space-y-2">
            <h3 className="text-md font-semibold text-pink-400">Set {setIndex + 1}</h3>
            {renderInputFields(setIndex)}
          </div>
        ))}
      </div>

      {/* Additional optional fields */}
      <div className="bg-gray-800 p-4 rounded-md space-y-3">
        <label htmlFor="perceivedExertion" className="block text-sm font-medium text-gray-200">
          Perceived Exertion (1-10) <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <input
          type="range"
          id="perceivedExertion"
          min="1"
          max="10"
          value={perceivedExertion}
          onChange={(e) => setPerceivedExertion(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <div className="text-sm text-gray-400">Rating: {perceivedExertion}</div>

        <label htmlFor="notes" className="block text-sm font-medium text-gray-200 mt-4">
          Notes <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 p-2 border border-gray-500 rounded-md w-full bg-gray-700 text-white"
          placeholder="Any additional notes about your performance..."
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 text-center"
      >
        Submit Result
      </button>
    </div>
  );
}