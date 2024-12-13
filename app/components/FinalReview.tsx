import React from 'react';
import WorkoutDisplay from './WorkoutDisplay';
import { ParsedWorkout } from './types';

type FinalReviewProps = {
  parsedWorkout: ParsedWorkout;
  onBack: () => void;
  onConfirm: () => void;
};

const FinalReview: React.FC<FinalReviewProps> = ({ parsedWorkout, onBack, onConfirm }) => {
  return (
    <div className="space-y-4 bg-gray-800 text-gray-100 p-4 rounded-md border border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-100">Review & Confirm</h2>
      <p className="text-sm text-gray-300">Here’s the final version of your workout. Review and confirm when ready.</p>

      <div className="bg-gray-700 p-4 rounded-md border border-gray-600">
        <WorkoutDisplay workoutData={parsedWorkout} />
      </div>

      <p className="text-sm text-gray-400 italic">[AI suggestions placeholder]</p>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-gray-300 rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          Plan Workout
        </button>
      </div>
    </div>
  );
};

export default FinalReview;
