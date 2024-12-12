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
    <div className="space-y-4 text-gray-800">
      <div>
        <label className="block text-sm font-semibold mb-1">Track (required)</label>
        <select
          value={trackId || ""}
          onChange={(e) => onChange({ trackId: e.target.value || null })}
          className="w-1/2 p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">Select a track</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Date (required)</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onChange({ date: e.target.value })}
          className="w-1/2 p-2 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Workout Name (required)</label>
        <input
          type="text"
          value={workoutName}
          onChange={(e) => onChange({ workoutName: e.target.value })}
          placeholder="Enter the workout name"
          className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Workout Details (Raw Text) (required)</label>
        <textarea
          value={workoutDetails}
          onChange={(e) => onChange({ workoutDetails: e.target.value })}
          placeholder="Enter or copy your workout details"
          className="w-full p-2 border border-gray-300 rounded h-48 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Scoring Fields */}
      <div>
        <label className="block text-sm font-semibold mb-1">Scoring (required)</label>
        <div className="flex space-x-2 items-center">
          {/* Sets dropdown */}
          <select
            value={scoringSet}
            onChange={(e) => onChange({ scoringSet: parseInt(e.target.value) })}
            className="w-1/4 p-2 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((set) => (
              <option key={set} value={set}>
                {`${set} set${set > 1 ? 's' : ''}`}
              </option>
            ))}
          </select>
          <span>of</span>
          <select
            value={scoringType}
            onChange={(e) => onChange({ scoringType: e.target.value })}
            className="w-1/2 p-2 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
          onClick={onNext}
          className={`px-4 py-2 rounded transition ${
            allRequiredFilled
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-800 cursor-not-allowed'
          } focus:outline-none focus:ring-2 focus:ring-pink-500`}
          disabled={!allRequiredFilled}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BasicInfoForm;
