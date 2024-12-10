// FinalReview.tsx
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
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Review & Confirm</h2>
      <p className="text-gray-700">Here’s the final version of your workout. Review and confirm when ready.</p>

      <WorkoutDisplay workoutData={parsedWorkout} />

      <p className="text-sm text-gray-600">[AI suggestions placeholder]</p>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Plan Workout
        </button>
      </div>
    </div>
  );
};

export default FinalReview;
