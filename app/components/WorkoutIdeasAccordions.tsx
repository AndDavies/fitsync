"use client";
import React, { useState } from "react";
import WorkoutCategoryAccordion from "./WorkoutCategoryAccordion";

interface WorkoutIdeasAccordionsProps {
  setWorkoutBuilderText: (text: string) => void;
  setWorkoutBuilderId: (id: string | null) => void;
}

/**
 * If the category in DB is NULL, we treat it as "GPP"
 * We can define a known category list if we want a certain order:
 */
const categories = ["Hero", "Metcon", "Benchmark", "GPP"];

export default function WorkoutIdeasAccordions({
  setWorkoutBuilderText,
  setWorkoutBuilderId,
}: WorkoutIdeasAccordionsProps) {
  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <WorkoutCategoryAccordion
          key={category}
          category={category}
          setWorkoutBuilderText={setWorkoutBuilderText}
          setWorkoutBuilderId={setWorkoutBuilderId}
        />
      ))}
    </div>
  );
}