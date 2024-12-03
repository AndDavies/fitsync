// app/workouts/page.tsx
"use client";
import React, { useState } from 'react';
import WorkoutBuilder from '../components/WorkoutBuilder';
import WorkoutIdeas from "../components/WorkoutIdeas";
import Header from "../components/Header";
import Accordion from '../components/widgets/Accordion';
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

        <main className="flex flex-grow items-start p-0">
          {/* Workout Builder Container */}
          <div className="flex-none border-4 w-1/2">
            <WorkoutBuilder workoutText={workoutBuilderText} setWorkoutText={setWorkoutBuilderText} />
          </div>

          {/* Accordion Container */}
          <div className="flex-none border-4 w-1/3">
            <Accordion title="Metcon">
              <WorkoutIdeas setWorkoutBuilderText={setWorkoutBuilderText} category="Metcon" />
            </Accordion>
            <Accordion title="Benchmarks">
              <WorkoutIdeas setWorkoutBuilderText={setWorkoutBuilderText} category="Benchmark" />
            </Accordion>
            <Accordion title="Hero WODs">
              <WorkoutIdeas setWorkoutBuilderText={setWorkoutBuilderText} category="Hero" />
            </Accordion>
            <Accordion title="Aerobic Capacity">
              <WorkoutIdeas setWorkoutBuilderText={setWorkoutBuilderText} category="Aerobic Capacity" />
            </Accordion>
            <Accordion title="Intervals">
              <WorkoutIdeas setWorkoutBuilderText={setWorkoutBuilderText} category="Intervals" />
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
