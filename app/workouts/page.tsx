// app/workouts/page.tsx
"use client";
// import Image from "next/image";
import React, { useState } from 'react';
import WorkoutBuilder from '../components/WorkoutBuilder';
import WorkoutIdeas from "../components/WorkoutIdeas";
import Header from "../components/Header";
import Accordion from '../components/Accordion';
import LeftNav from '../components/LeftNav';

export default function Dashboard() {
  const [workoutBuilderText, setWorkoutBuilderText] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Left Navigation */}
        <LeftNav />

        {/* Main Dashboard Container */}
        <main className="flex flex-grow p-6 space-x-4">
          {/* Workout Builder */}
          <div className="flex-none w-2/3">
            <WorkoutBuilder workoutText={workoutBuilderText} setWorkoutText={setWorkoutBuilderText} />
          </div>

          {/* Accordion Container */}
          <div className="flex-grow space-y-4">
            <Accordion title="Metcon">
              <WorkoutIdeas setWorkoutBuilderText={setWorkoutBuilderText} category="Metcon" />
            </Accordion>
            <Accordion title="Benchmarks">
              <WorkoutIdeas setWorkoutBuilderText={setWorkoutBuilderText} category="Benchmark" />
            </Accordion>
            {/* Additional accordion sections can be added here */}
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
