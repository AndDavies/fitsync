import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type WorkoutEditorProps = {
  workoutId: string;
};

type Track = {
  id: string;
  name: string;
};

// Helper function for UUID validation
const isValidUUID = (id: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ workoutId }) => {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState<string>("");
  const [workoutDate, setWorkoutDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [workoutText, setWorkoutText] = useState<string>("");
  const [warmUp, setWarmUp] = useState<string>("");
  const [coolDown, setCoolDown] = useState<string>("");
  const [coachNotes, setCoachNotes] = useState<string>("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isValidUUID(workoutId)) {
      console.error("Invalid workout ID.");
      return;
    }

    const fetchWorkout = async () => {
      const { data, error } = await supabase
        .from("scheduled_workouts")
        .select("*")
        .eq("id", workoutId)
        .single();

      if (error) {
        console.error("Error fetching workout:", error.message);
        return;
      }

      setWorkoutName(data.name || "");
      setWorkoutDate(data.date || format(new Date(), "yyyy-MM-dd"));
      setWorkoutText(data.workout_details || "");
      setWarmUp(data.warm_up || "");
      setCoolDown(data.cool_down || "");
      setCoachNotes(data.notes || "");
      setSelectedTrackId(data.track_id || null);
      setIsLoading(false);
    };

    fetchWorkout();
  }, [workoutId]);

  useEffect(() => {
    const fetchTracks = async () => {
      const { data, error } = await supabase.from("tracks").select("id, name");
      if (error) {
        console.error("Error fetching tracks:", error.message);
      } else {
        setTracks(data || []);
      }
    };

    fetchTracks();
  }, []);

  const validateForm = () => {
    const isFormValid =
      workoutName.trim() !== "" &&
      workoutDate.trim() !== "" &&
      workoutText.trim() !== "" &&
      selectedTrackId !== null;

    setIsValidated(isFormValid);
    setShowTooltip(!isFormValid); // Tooltip appears if form is invalid
  };

  const handleSaveChanges = async () => {
    validateForm();

    if (!isValidated) return;

    const { error } = await supabase
      .from("scheduled_workouts")
      .update({
        name: workoutName,
        date: workoutDate,
        workout_details: workoutText,
        warm_up: warmUp,
        cool_down: coolDown,
        notes: coachNotes,
        track_id: selectedTrackId,
      })
      .eq("id", workoutId);

    if (error) {
      alert("Error saving changes. Please try again.");
      console.error(error.message);
    } else {
      alert("Workout updated successfully!");
      router.push("/plan"); // Redirect to calendar after saving
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 rounded-md shadow-md max-w-3xl mx-auto text-gray-800 antialiased">
      <h2 className="text-2xl font-semibold mb-4 text-gray-600">Edit Your Workout</h2>

      {/* Date Input */}
      <div className="mb-4">
        <label htmlFor="workout-date" className="block text-sm font-semibold mb-1 text-gray-500">
          Date
          {workoutDate && <span className="text-green-500 ml-2">&#x2713;</span>}
        </label>
        <input
          type="date"
          id="workout-date"
          value={workoutDate}
          onChange={(e) => {
            setWorkoutDate(e.target.value);
            setIsValidated(false); // Re-validate after changes
          }}
          className={`w-1/2 p-2 border ${showTooltip && !workoutDate ? "border-red-500" : "border-gray-300"} bg-gray-100 text-sm text-gray-800 rounded`}
        />
      </div>

      {/* Workout Name Input */}
      <div className="mb-4">
        <label htmlFor="workout-name" className="block text-sm font-semibold mb-1 text-gray-500">
          Workout Name
          {workoutName && <span className="text-green-500 ml-2">&#x2713;</span>}
        </label>
        <input
          type="text"
          id="workout-name"
          value={workoutName}
          onChange={(e) => {
            setWorkoutName(e.target.value);
            setIsValidated(false);
          }}
          placeholder="Enter the workout name"
          className="w-full p-2 border border-gray-300 bg-gray-100 rounded"
        />
      </div>

      {/* Track Selection Dropdown */}
      <div className="mb-4">
        <label htmlFor="track-select" className="block text-sm font-semibold mb-1 text-gray-500">
          Select Track
          {selectedTrackId && <span className="text-green-500 ml-2">&#x2713;</span>}
        </label>
        <select
          id="track-select"
          value={selectedTrackId || ""}
          onChange={(e) => {
            setSelectedTrackId(e.target.value || null);
            setIsValidated(false);
          }}
          className={`w-1/2 p-2 border ${showTooltip && !selectedTrackId ? "border-red-500" : "border-gray-300"} bg-gray-100 text-sm text-gray-800 rounded`}
        >
          <option value="" disabled>
            Select a track
          </option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
      </div>

      {/* Workout Details */}
      <div className="mb-4">
        <label htmlFor="workout-input" className="block text-sm font-semibold mb-1 text-gray-500">
          Workout Details
          {workoutText && <span className="text-green-500 ml-2">&#x2713;</span>}
        </label>
        <textarea
          id="workout-input"
          value={workoutText}
          onChange={(e) => {
            setWorkoutText(e.target.value);
            setIsValidated(false);
          }}
          className={`w-full p-2 border ${showTooltip && !workoutText ? "border-red-500" : "border-gray-300"} bg-gray-100 rounded h-28`}
        />
      </div>

      {/* Warm-Up */}
      <div className="mb-4">
        <label htmlFor="warm-up" className="block text-sm font-semibold mb-1 text-gray-500">
          Warm-Up
        </label>
        <textarea
          id="warm-up"
          value={warmUp}
          onChange={(e) => setWarmUp(e.target.value)}
          placeholder="Enter warm-up details"
          className="w-full p-2 border border-gray-300 bg-gray-100 rounded h-20"
        />
      </div>

      {/* Cool-Down */}
      <div className="mb-4">
        <label htmlFor="cool-down" className="block text-sm font-semibold mb-1 text-gray-500">
          Cool Down
        </label>
        <textarea
          id="cool-down"
          value={coolDown}
          onChange={(e) => setCoolDown(e.target.value)}
          placeholder="Enter cool-down details"
          className="w-full p-2 border border-gray-300 bg-gray-100 rounded h-20"
        />
      </div>

      {/* Coach Notes */}
      <div className="mb-4">
        <label htmlFor="coach-notes" className="block text-sm font-semibold mb-1 text-gray-500">
          Coach Notes
        </label>
        <textarea
          id="coach-notes"
          value={coachNotes}
          onChange={(e) => setCoachNotes(e.target.value)}
          placeholder="Enter coach notes"
          className="w-full p-2 border border-gray-300 bg-gray-100 rounded h-20"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={validateForm}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Validate
        </button>
        <button
          onClick={handleSaveChanges}
          disabled={!isValidated}
          className={`px-4 py-2 rounded transition text-sm ${
            isValidated ? "bg-pink-500 text-white hover:bg-pink-600" : "bg-gray-300 text-gray-700 cursor-not-allowed"
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default WorkoutEditor;