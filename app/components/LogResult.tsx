import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "../context/AuthContext";
import { useRouter, useParams } from 'next/navigation';

const LogResult: React.FC = () => {
  const { userData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workoutId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // State for workout data
  const [scoringSet, setScoringSet] = useState<number>(1);
  const [scoringType, setScoringType] = useState<string>("");
  const [results, setResults] = useState<string[][]>([]);
  const [perceivedExertion, setPerceivedExertion] = useState<number>(5);
  const [notes, setNotes] = useState<string>("");
  const [logSuccess, setLogSuccess] = useState<string | null>(null);

  // Fetch scheduled workout details
  useEffect(() => {
    // Fetch workout info using `workoutId` to prepopulate scoring options
    const fetchWorkoutData = async () => {
      if (workoutId) {
        try {
          const { data, error } = await supabase
            .from('scheduled_workouts')
            .select('scoring_set, scoring_type')
            .eq('id', workoutId)
            .single();

          if (error) throw error;

          if (data) {
            const setCount = parseInt(data.scoring_set) || 1;
            setScoringSet(setCount);
            setScoringType(data.scoring_type || "");

            // Initialize results array with empty values based on the setCount and scoringType
            setResults(
              Array.from({ length: setCount }, () =>
                Array(getFieldCountForScoringType(data.scoring_type)).fill("")
              )
            );
          }
        } catch (err) {
          console.error("Error fetching workout data:", (err as any).message);
          alert("Unable to load workout details.");
          router.push('/workouts');
        }
      }
    };

    fetchWorkoutData();
  }, [workoutId]);

  // Helper to determine the number of input fields required based on the scoring type
  function getFieldCountForScoringType(scoringType: string) {
    switch (scoringType) {
      case "Time":
        return 2; // MM and SS
      case "Rounds + Reps":
        return 2; // Rounds and Reps
      case "Load":
        return 1; // Load
      default:
        return 1; // For Reps, Calories, Distance, CheckBox
    }
  }

  // Update specific input field in the results array
  const handleInputChange = (setIndex: number, valueIndex: number, value: string) => {
    setResults((prevResults) => {
      const updatedResults = [...prevResults];

      // Ensure the setIndex exists and is properly initialized
      if (!updatedResults[setIndex]) {
        updatedResults[setIndex] = Array(getFieldCountForScoringType(scoringType)).fill("");
      }

      updatedResults[setIndex][valueIndex] = value;
      return updatedResults;
    });
  };

  // Render input fields for each set based on scoring type
  const renderInputFields = (setIndex: number) => {
    if (!results[setIndex]) {
      // Initialize if not already done (additional safety check)
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
            <label className="text-gray-700">Time (MM:SS):</label>
            <input
              type="text"
              placeholder="MM"
              value={results[setIndex][0] || ""}
              onChange={(e) => handleInputChange(setIndex, 0, e.target.value)}
              className="w-16 p-2 border border-gray-300 rounded-md text-center bg-gray-800 text-white"
            />
            <span>:</span>
            <input
              type="text"
              placeholder="SS"
              value={results[setIndex][1] || ""}
              onChange={(e) => handleInputChange(setIndex, 1, e.target.value)}
              className="w-16 p-2 border border-gray-300 rounded-md text-center bg-gray-800 text-white"
            />
          </div>
        );
      case "Rounds + Reps":
        return (
          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Rounds + Reps:</label>
            <input
              type="number"
              placeholder="Rounds"
              value={results[setIndex][0] || ""}
              onChange={(e) => handleInputChange(setIndex, 0, e.target.value)}
              className="w-16 p-2 border border-gray-300 rounded-md text-center bg-gray-800 text-white"
            />
            <span>+</span>
            <input
              type="number"
              placeholder="Reps"
              value={results[setIndex][1] || ""}
              onChange={(e) => handleInputChange(setIndex, 1, e.target.value)}
              className="w-16 p-2 border border-gray-300 rounded-md text-center bg-gray-800 text-white"
            />
          </div>
        );
      case "Load":
        return (
          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Load:</label>
            <input
              type="number"
              placeholder="Load"
              value={results[setIndex][0] || ""}
              onChange={(e) => handleInputChange(setIndex, 0, e.target.value)}
              className="w-3/4 p-2 border border-gray-300 rounded-md bg-gray-800 text-white"
            />
            <select className="p-2 border border-gray-300 rounded-md bg-gray-800 text-white">
              <option value="lbs">Lbs</option>
              <option value="kg">Kg</option>
            </select>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2">
            <label className="text-gray-700">{scoringType}:</label>
            <input
              type="number"
              placeholder={scoringType}
              value={results[setIndex][0] || ""}
              onChange={(e) => handleInputChange(setIndex, 0, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-white"
            />
          </div>
        );
    }
  };

  // Handle submission of the logged workout results
  const handleSubmit = async () => {
    const resultString = results.map((set) => set.join(":")).join(", ");
    
    try {
      const userId = userData?.user_id;
      if (!userId) {
        alert("You need to be logged in to log workout results.");
        return;
      }

      // Assuming that `performed_at` should be the current date/time
      const performedAt = new Date().toISOString(); 

      const { error } = await supabase
        .from("workout_results")
        .insert({
          scheduled_workout_id: workoutId,
          user_profile_id: userId,
          result: resultString,
          perceived_exertion: perceivedExertion,
          notes,
          date_logged: new Date().toISOString(), // When the result was logged
          date_performed: performedAt // Adding the `performed_at` field
        });

      if (error) throw error;

      setLogSuccess("Successfully logged workout result!");
    } catch (err) {
      const error = err as Error;
      console.error("Error logging workout result:", error.message);
      alert("There was an issue logging your workout result. Please try again.");
    }
  };


  return (
    <div className="log-result-container p-6 max-w-lg mx-auto bg-gray-900 text-white rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Log Workout Result</h2>

      {/* Loop through each set and render input fields accordingly */}
      {Array.from({ length: scoringSet }, (_, setIndex) => (
        <div key={setIndex} className="set-container mb-6">
          <h3 className="text-lg font-medium mb-2">Set {setIndex + 1}</h3>
          <div className="input-group flex flex-col space-y-4">
            {renderInputFields(setIndex)}
          </div>
        </div>
      ))}

      {/* Perceived Exertion Input */}
      <div className="form-group mb-4">
        <label htmlFor="perceivedExertion" className="block text-sm font-medium text-white">
          Perceived Exertion (1-10)
        </label>
        <input
          type="range"
          id="perceivedExertion"
          min="1"
          max="10"
          value={perceivedExertion}
          onChange={(e) => setPerceivedExertion(Number(e.target.value))}
          className="w-full h-2 mt-1 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, red, yellow ${perceivedExertion * 10}%, green)`,
          }}
        />
        <div className="text-sm text-gray-400 mt-1">Rating: {perceivedExertion}</div>
      </div>

      {/* Notes Input */}
      <div className="form-group mb-4">
        <label htmlFor="notes" className="block text-sm font-medium text-white">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-gray-800 text-white"
          placeholder="Add any additional notes about the workout..."
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
      >
        Submit Result
      </button>

      {/* Success Message */}
      {logSuccess && <p className="text-green-500 mt-4">{logSuccess}</p>}
    </div>
  );
};

export default LogResult;
