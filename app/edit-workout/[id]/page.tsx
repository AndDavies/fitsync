"use client";

import { useParams } from "next/navigation";
import Header from "../../components/Header";
import LeftNav from "../../components/LeftNav";
import WorkoutEditor from "../../components/WorkoutEditor";

export default function EditWorkoutPage() {
  const params = useParams();
  const workoutId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  if (!workoutId || typeof workoutId !== "string") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <div className="flex flex-grow">
          <LeftNav />
          <main className="flex flex-grow p-6 space-x-4">
            <div className="flex-grow">
              <p className="text-gray-600">No workout ID provided. Please select a workout to edit.</p>
            </div>
          </main>
        </div>
        <footer className="bg-white text-center py-4 shadow-inner">
          <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-grow">
        <LeftNav />
        <main className="flex flex-grow space-x-4">
          <div className="flex-none w-2/3 p-4">
            <WorkoutEditor workoutId={workoutId} />
          </div>
        </main>
      </div>
      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}