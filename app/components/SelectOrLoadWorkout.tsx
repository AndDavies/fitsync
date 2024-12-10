// app/components/SelectOrLoadWorkout.tsx

"use client";

import React, { useState } from "react";
import WorkoutIdeasPanel from "./WorkoutIdeasPanel";
import { WorkoutTemplate } from "./types";

type SelectOrLoadWorkoutProps = {
  onCreateNew: () => void;
  onSelectTemplate: (templateData: Partial<WorkoutTemplate>) => void;
  userRole: string;
  navigateToEdit: () => void; // Added this prop to navigate to the next step
};

const SelectOrLoadWorkout: React.FC<SelectOrLoadWorkoutProps> = ({
  onCreateNew,
  onSelectTemplate,
  userRole,
  navigateToEdit, // Destructuring the new prop
}) => {
  const [showIdeas, setShowIdeas] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Select or Load a Workout</h2>
      <p className="text-gray-700">You can start from scratch or load a template from our library.</p>

      <div className="flex space-x-4">
        <button
          onClick={() => {
            console.log("Create New Workout clicked.");
            onCreateNew(); // Reset the state
            navigateToEdit(); // Navigate to the "Edit Workout Details" step
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Create New Workout
        </button>
        <button
          onClick={() => setShowIdeas(true)}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
        >
          Load from Template
        </button>
      </div>

      {showIdeas && (
        <WorkoutIdeasPanel
          onClose={() => setShowIdeas(false)}
          onSelect={(tpl: Partial<WorkoutTemplate>) => {
            onSelectTemplate(tpl);
            setShowIdeas(false);
          }}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default SelectOrLoadWorkout;
