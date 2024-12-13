"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";

type WorkoutEditorProps = {
  workoutId: string;
};

type Track = {
  id: string;
  name: string;
};

const isValidUUID = (id: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ workoutId }) => {
  const router = useRouter();
  const { userData } = useAuth();

  const [workoutName, setWorkoutName] = useState<string>("");
  const [workoutDate, setWorkoutDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [workoutText, setWorkoutText] = useState<string>("");
  const [warmUp, setWarmUp] = useState<string>("");
  const [coolDown, setCoolDown] = useState<string>("");
  const [coachNotes, setCoachNotes] = useState<string>("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(true); // Overall loading state
  const [tracksLoading, setTracksLoading] = useState(false); // Loading state for tracks

  useEffect(() => {
    if (!isValidUUID(workoutId)) {
      console.error("Invalid workout ID.");
      toast.error("Invalid workout ID.");
      return;
    }

    const fetchWorkout = async () => {
      try {
        const { data, error } = await supabase
          .from("scheduled_workouts")
          .select("*")
          .eq("id", workoutId)
          .single();

        if (error) throw error;
        if (data) {
          setWorkoutName(data.name || "");
          setWorkoutDate(data.date || format(new Date(), "yyyy-MM-dd"));
          setWorkoutText(data.workout_details || "");
          setWarmUp(data.warm_up || "");
          setCoolDown(data.cool_down || "");
          setCoachNotes(data.notes || "");
          setSelectedTrackId(data.track_id || null);
        }
      } catch (err: any) {
        console.error("Error fetching workout:", err.message);
        toast.error("Error loading workout. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId]);

  useEffect(() => {
    const fetchTracks = async () => {
      if (!userData) {
        return;
      }

      setTracksLoading(true);
      let fetchedTracks: { id: string; name: string }[] = [];

      try {
        if (userData.current_gym_id) {
          // Fetch gym tracks
          const { data: gymTracks, error: gymError } = await supabase
            .from("tracks")
            .select("id, name")
            .eq("gym_id", userData.current_gym_id);

          if (gymError) throw gymError;
          if (gymTracks) fetchedTracks.push(...gymTracks);
        } else {
          // Fetch personal tracks
          const { data: personalTracks, error: personalError } = await supabase
            .from("tracks")
            .select("id, name")
            .eq("user_id", userData.user_id);

          if (personalError) throw personalError;
          if (personalTracks && personalTracks.length) {
            fetchedTracks.push(...personalTracks);
          } else {
            // Create a personal track if none exists
            const { data: newTrack, error: trackError } = await supabase
              .from("tracks")
              .insert({ user_id: userData.user_id, name: "Personal Track" })
              .select("id, name")
              .single();

            if (trackError) throw trackError;
            if (newTrack) fetchedTracks.push(newTrack);
          }
        }

        setTracks(fetchedTracks);
      } catch (error: any) {
        console.error("Error fetching tracks:", error.message);
        toast.error("Failed to load tracks. Please refresh.");
      } finally {
        setTracksLoading(false);
      }
    };

    if (userData) {
      fetchTracks();
    } else {
      // If userData not ready, could still be loading
      if (!userData) setTracksLoading(true);
    }
  }, [userData]);

  const validateForm = () => {
    const isFormValid =
      workoutName.trim() !== "" &&
      workoutDate.trim() !== "" &&
      workoutText.trim() !== "" &&
      selectedTrackId !== null;
    setValidated(isFormValid);
    if (!isFormValid) {
      toast.error("Please fill in all required fields.");
    }
  };

  const handleSaveChanges = async () => {
    validateForm();
    if (!validated) return;

    try {
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

      if (error) throw error;

      toast.success("Workout updated successfully!");
      router.push("/plan");
    } catch (err: any) {
      console.error(err.message);
      toast.error("Error saving changes. Please try again.");
    }
  };

  if (loading || tracksLoading || !userData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-300">
        <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full mb-4"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 text-gray-100 rounded-md shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-4 text-pink-400">Edit Your Workout</h2>

      {/* Date Input */}
      <div className="mb-4">
        <label htmlFor="workout-date" className="block text-sm font-semibold mb-1 text-gray-300">
          Date <span className="text-pink-400">*</span>
        </label>
        <input
          type="date"
          id="workout-date"
          value={workoutDate}
          onChange={(e) => {
            setWorkoutDate(e.target.value);
            setValidated(false);
          }}
          className="w-1/2 p-2 border border-gray-600 bg-gray-700 text-sm text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* Workout Name Input */}
      <div className="mb-4">
        <label htmlFor="workout-name" className="block text-sm font-semibold mb-1 text-gray-300">
          Workout Name <span className="text-pink-400">*</span>
        </label>
        <input
          type="text"
          id="workout-name"
          value={workoutName}
          onChange={(e) => {
            setWorkoutName(e.target.value);
            setValidated(false);
          }}
          placeholder="Enter the workout name"
          className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* Track Selection Dropdown */}
      <div className="mb-4">
        <label htmlFor="track-select" className="block text-sm font-semibold mb-1 text-gray-300">
          Select Track <span className="text-pink-400">*</span>
        </label>
        <select
          id="track-select"
          value={selectedTrackId || ""}
          onChange={(e) => {
            setSelectedTrackId(e.target.value || null);
            setValidated(false);
          }}
          className="w-1/2 p-2 border border-gray-600 bg-gray-700 text-sm text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
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
        <label htmlFor="workout-input" className="block text-sm font-semibold mb-1 text-gray-300">
          Workout Details <span className="text-pink-400">*</span>
        </label>
        <textarea
          id="workout-input"
          value={workoutText}
          onChange={(e) => {
            setWorkoutText(e.target.value);
            setValidated(false);
          }}
          className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-100 rounded h-28 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* Warm-Up */}
      <div className="mb-4">
        <label htmlFor="warm-up" className="block text-sm font-semibold mb-1 text-gray-300">
          Warm-Up (optional)
        </label>
        <textarea
          id="warm-up"
          value={warmUp}
          onChange={(e) => setWarmUp(e.target.value)}
          placeholder="Enter warm-up details"
          className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-100 rounded h-20 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* Cool-Down */}
      <div className="mb-4">
        <label htmlFor="cool-down" className="block text-sm font-semibold mb-1 text-gray-300">
          Cool Down (optional)
        </label>
        <textarea
          id="cool-down"
          value={coolDown}
          onChange={(e) => setCoolDown(e.target.value)}
          placeholder="Enter cool-down details"
          className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-100 rounded h-20 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* Coach Notes */}
      <div className="mb-4">
        <label htmlFor="coach-notes" className="block text-sm font-semibold mb-1 text-gray-300">
          Coach Notes (optional)
        </label>
        <textarea
          id="coach-notes"
          value={coachNotes}
          onChange={(e) => setCoachNotes(e.target.value)}
          placeholder="Enter coach notes"
          className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-100 rounded h-20 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 mt-6">
        <button
          onClick={validateForm}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Validate
        </button>
        <button
          onClick={handleSaveChanges}
          className={`px-4 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 ${
            validated ? "bg-pink-500 text-white hover:bg-pink-600" : "bg-gray-500 text-gray-300 cursor-not-allowed"
          }`}
          disabled={!validated}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default WorkoutEditor;
