// WorkoutRefinementForm.tsx
import React from 'react';
import EditWorkoutDetails from './EditWorkoutDetails';
import { ParsedWorkout } from './types';
import WorkoutDisplay from './WorkoutDisplay';

type WorkoutRefinementFormProps = {
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
  tracks: { id: string; name: string }[];
  onChange: (updates: Partial<WorkoutRefinementFormProps["workout"]>) => void;
  parsedWorkout: ParsedWorkout;
  onBack: () => void;
  onNext: () => void;
};

const WorkoutRefinementForm: React.FC<WorkoutRefinementFormProps> = ({ workout, tracks, onChange, parsedWorkout, onBack, onNext }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Refine Your Workout</h2>
      <p className="text-gray-700">Below is the parsed version of your workout. Add warm-up, cool-down, scoring, and notes as needed.</p>

      <WorkoutDisplay workoutData={parsedWorkout} />

      <EditWorkoutDetails
        workout={workout}
        userRole="member"
        tracks={tracks}
        onChange={onChange}
      />

      <div className="flex space-x-2 mt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default WorkoutRefinementForm;
