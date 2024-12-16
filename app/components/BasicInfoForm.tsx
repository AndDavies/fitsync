// app/workouts/components/BasicInfoForm.tsx
import React, { useMemo } from 'react';

type BasicInfoFormProps = {
  workout: {
    date: string;
    workoutName: string;
    trackId: string | null;
    workoutDetails: string;
    scoringSet: number;
    scoringType: string;
  };
  tracks: { id: string; name: string }[];
  onChange: (updates: Partial<BasicInfoFormProps["workout"]>) => void;
  onNext: () => void;
};

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ workout, tracks, onChange, onNext }) => {
  const { date, workoutName, trackId, workoutDetails, scoringSet, scoringType } = workout;

  const allRequiredFilled = useMemo(() => {
    return trackId && date && workoutName.trim() !== '' && workoutDetails.trim() !== '' && scoringSet > 0 && scoringType !== '';
  }, [trackId, date, workoutName, workoutDetails, scoringSet, scoringType]);

  return (
    <div className="space-y-4 text-gray-200">
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-100">Track (required)</label>
        <select
          value={trackId || ""}
          onChange={(e) => onChange({ trackId: e.target.value || null })}
          className="w-1/2 p-2 border border-gray-600 rounded bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
        >
          <option value="" disabled>Select a track</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-100">Date (required)</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onChange({ date: e.target.value })}
          className="w-1/2 p-2 border border-gray-600 rounded bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-100">Workout Name (required)</label>
        <input
          type="text"
          value={workoutName}
          onChange={(e) => onChange({ workoutName: e.target.value })}
          placeholder="Enter the workout name"
          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-100">Workout Details (Raw Text) (required)</label>
        <textarea
          value={workoutDetails}
          onChange={(e) => onChange({ workoutDetails: e.target.value })}
          placeholder="Enter or copy your workout details"
          className="w-full p-2 border border-gray-600 rounded h-48 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-100">Scoring (required)</label>
        <div className="flex space-x-2 items-center">
          <select
            value={scoringSet}
            onChange={(e) => onChange({ scoringSet: parseInt(e.target.value) })}
            className="w-1/4 p-2 border border-gray-600 rounded bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((set) => (
              <option key={set} value={set}>
                {`${set} set${set > 1 ? 's' : ''}`}
              </option>
            ))}
          </select>
          <span className="text-gray-300">of</span>
          <select
            value={scoringType}
            onChange={(e) => onChange({ scoringType: e.target.value })}
            className="w-1/2 p-2 border border-gray-600 rounded bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
          >
            <option value="" disabled>Select scoring type</option>
            {["Time", "Rounds + Reps", "Reps", "Load", "Calories", "Metres", "Not Scored"].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => {
            console.log("Next button in BasicInfoForm clicked");
            onNext();
          }}
          className={`px-4 py-2 rounded transition focus:outline-none focus:ring-2 focus:ring-pink-400 ${
            allRequiredFilled
              ? 'bg-pink-500 text-white hover:bg-pink-600'
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
          disabled={!allRequiredFilled}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BasicInfoForm;