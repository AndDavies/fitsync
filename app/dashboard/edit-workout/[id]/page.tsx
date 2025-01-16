"use client";

import React from "react";
import WorkoutEditor from "@/app/components/WorkoutEditor";
// If you had `import { supabase } ...` remove that
// Use normal client approach or just pass ID to WorkoutEditor

type Props = {
  params: { id: string };
};

export default function EditWorkoutPage({ params }: Props) {
  const { id } = params;

  return (
    <div className="p-4">
      <WorkoutEditor workoutId={id} />
    </div>
  );
}