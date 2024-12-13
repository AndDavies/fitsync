"use client";
import React, { useState } from 'react';
import PlanWorkoutPage from '../components/PlanWorkoutPage';
import Header from "../components/Header";
import { Toaster } from 'react-hot-toast';
import LeftNav from '../components/LeftNav';

export default function Dashboard() {
  const [workoutBuilderText, setWorkoutBuilderText] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-gray-800 text-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Left Navigation */}
        <LeftNav />

        <main className="flex flex-grow p-4">
          {/* Just a single column: We show the PlanWorkoutPage in a card with a dark style */}
          <div className="w-full max-w-7xl mx-auto">
            <Toaster position="top-right" />
            <PlanWorkoutPage />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-center py-4 shadow-inner border-t border-gray-700">
        <p className="text-sm text-gray-400">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
