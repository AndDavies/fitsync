"use client";

import React, { useState } from 'react';
import Header from "../components/Header";
import LeftNav from "../components/LeftNav";
import WorkoutCalendar from "../components/WorkoutCalendar"; // Assuming this is where you want the calendar to be displayed


export default function PlanPage() {
  const [selectedWorkout, setSelectedWorkout] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Left Navigation */}
        <LeftNav />

        {/* Main Plan Container */}
        <main className="flex flex-grow p-6 space-x-4">
          {/* Calendar Section */}
          <div className="flex-grow">
            <WorkoutCalendar />
          </div>

          {/* Right Section (Optional) */}
          <div className="flex-none w-1/3 space-y-4">
            {/* Placeholder for additional widgets or controls */}
            <div className="workout-details">
              <h2 className="text-lg font-semibold">Workout Details</h2>
              <p className="text-gray-600">
                {selectedWorkout || "Select a workout from the calendar"}
              </p>
              {/* Add other components here as needed */}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
