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
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <Header />
        <div className="flex flex-grow">
          <LeftNav />
          <main className="flex flex-grow p-6">
            <div className="flex-grow">
              <p className="text-gray-300">No workout ID provided. Please select a workout to edit.</p>
            </div>
          </main>
        </div>
        <footer className="bg-gray-800 text-center py-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">&copy; 2024 FitSync. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />
      <div className="flex flex-grow">
        <LeftNav />
        <main className="flex flex-grow p-6">
          <div className="w-full max-w-3xl mx-auto">
            <WorkoutEditor workoutId={workoutId} />
          </div>
        </main>
      </div>
      <footer className="bg-gray-800 text-center py-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
