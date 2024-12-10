// app/workouts/components/ConfirmAndSchedule.tsx

"use client";

import React from "react";

type ConfirmAndScheduleProps = {
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
  };
  onPlan: () => void;
};

const ConfirmAndSchedule: React.FC<ConfirmAndScheduleProps> = ({ workout, onPlan }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Confirm and Schedule</h2>
      <p><strong>Date:</strong> {workout.date}</p>
      <p><strong>Workout Name:</strong> {workout.workoutName}</p>
      <p><strong>Track:</strong> {workout.trackId || "None Selected"}</p>
      {workout.warmUp && <p><strong>Warm Up:</strong> {workout.warmUp}</p>}
      <p><strong>Details:</strong> {workout.workoutDetails}</p>
      {workout.coolDown && <p><strong>Cool Down:</strong> {workout.coolDown}</p>}
      <p><strong>Scoring:</strong> {workout.scoringSet} set(s) of {workout.scoringType}</p>
      <p><strong>Advanced Scoring:</strong> {workout.advancedScoring} of {workout.orderType}</p>
      {workout.coachNotes && <p><strong>Coach's Notes:</strong> {workout.coachNotes}</p>}
      <p><strong>Origin:</strong> {workout.origin}</p>

      <button
        onClick={onPlan}
        className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
      >
        Plan It
      </button>
    </div>
  );
};

export default ConfirmAndSchedule;
