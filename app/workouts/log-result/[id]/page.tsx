"use client";

import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import LogResult from "@/app/components/LogResult";

export default function EditWorkoutPage() {
  const params = useParams();
  const workoutId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  if (!workoutId || typeof workoutId !== "string") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <Header />
        <main className="flex-grow p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto">
          <p className="text-gray-300 text-sm">No workout ID provided. Please select a workout to edit.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />
      <main className="flex-grow p-6">
        <LogResult workoutId={workoutId as string} />
      </main>
      <Footer />
    </div>
  );
}