"use client";
import React from "react";

type Track = {
  id: string;
  name: string;
};

type EditWorkoutDetailsProps = {
  workout: {
    date: string;
    workoutName: string;
    trackId: string | null;
    warmUp: string;
    workoutDetails: string;
    coolDown: string;
    scoringSet: number;
    scoringType: string;
    advancedScoring: string;
    orderType: string;
    coachNotes: string;
    origin: string;
    is_template: boolean;
  };
  userRole: string;
  tracks: Track[];
  onChange: (updates: Partial<EditWorkoutDetailsProps["workout"]>) => void;
};

const EditWorkoutDetails: React.FC<EditWorkoutDetailsProps> = ({ workout, userRole, tracks, onChange }) => {
  const isCoach = userRole === "coach";

  return (
    <div className="space-y-4 bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold">Edit Workout Details</h2>

      <div>
        <label className="block text-sm font-semibold mb-1">Date</label>
        <input
          type="date"
          value={workout.date}
          onChange={(e) => onChange({ date: e.target.value })}
          className="w-1/2 p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Workout Name</label>
        <input
          type="text"
          value={workout.workoutName}
          onChange={(e) => onChange({ workoutName: e.target.value })}
          placeholder="Enter the workout name"
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Select Track</label>
        <select
          value={workout.trackId || ""}
          onChange={(e) => onChange({ trackId: e.target.value || null })}
          className="w-1/2 p-2 border border-gray-300 rounded"
        >
          <option value="">Select a track</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
      </div>

      {/* Warm-Up */}
      <button
        type="button"
        className="text-blue-500 text-sm"
        onClick={() => onChange({ warmUp: workout.warmUp ? "" : "..." })}
      >
        {workout.warmUp ? "Hide Warm Up" : "Add Warm Up"}
      </button>
      {workout.warmUp && (
        <textarea
          value={workout.warmUp}
          onChange={(e) => onChange({ warmUp: e.target.value })}
          placeholder="Enter warm-up details"
          className="w-full p-2 border border-gray-300 rounded"
        />
      )}

      <div>
        <label className="block text-sm font-semibold mb-1">Workout Details</label>
        <textarea
          value={workout.workoutDetails}
          onChange={(e) => onChange({ workoutDetails: e.target.value })}
          placeholder="Enter workout details"
          className="w-full p-2 border border-gray-300 rounded h-28"
        />
      </div>

      <button
        type="button"
        className="text-blue-500 text-sm"
        onClick={() => onChange({ coolDown: workout.coolDown ? "" : "..." })}
      >
        {workout.coolDown ? "Hide Cool Down" : "Add Cool Down"}
      </button>
      {workout.coolDown && (
        <textarea
          value={workout.coolDown}
          onChange={(e) => onChange({ coolDown: e.target.value })}
          placeholder="Enter cool-down details"
          className="w-full p-2 border border-gray-300 rounded"
        />
      )}

      <div>
        <label className="block text-sm font-semibold mb-1">Scoring</label>
        <div className="flex space-x-2">
          <select
            value={workout.scoringSet}
            onChange={(e) => onChange({ scoringSet: parseInt(e.target.value) })}
            className="w-1/4 p-2 border border-gray-300 rounded"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((set) => (
              <option key={set} value={set}>
                {`${set} set${set > 1 ? "s" : ""}`}
              </option>
            ))}
          </select>
          <span>of</span>
          <select
            value={workout.scoringType}
            onChange={(e) => onChange({ scoringType: e.target.value })}
            className="w-1/2 p-2 border border-gray-300 rounded"
          >
            <option value="" disabled>Select scoring type</option>
            {["Time", "Rounds + Reps", "Reps", "Load", "Calories", "Metres", "Not Scored"].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {isCoach && (
        <div>
          <label className="block text-sm font-semibold mb-1">Advanced Scoring</label>
          <select
            value={workout.advancedScoring}
            onChange={(e) => onChange({ advancedScoring: e.target.value })}
            className="w-1/2 p-2 border border-gray-300 rounded"
          >
            <option value="Maximum">Maximum</option>
            <option value="Minimum">Minimum</option>
          </select>
        </div>
      )}

      {isCoach && (
        <div>
          <label className="block text-sm font-semibold mb-1">Coach Notes</label>
          <textarea
            value={workout.coachNotes}
            onChange={(e) => onChange({ coachNotes: e.target.value })}
            placeholder="Enter coach notes"
            className="w-full p-2 border border-gray-300 rounded h-28"
          />
        </div>
      )}
    </div>
  );
};

export default EditWorkoutDetails;
