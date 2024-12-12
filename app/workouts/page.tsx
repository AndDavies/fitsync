"use client";
import React, { useState } from 'react';
import PlanWorkoutPage from '../components/PlanWorkoutPage';
import Header from "../components/Header";
import { Toaster } from 'react-hot-toast';
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

        <main className="flex flex-grow p-6 text-gray-800">
          {/* Full-width container, just a background and some padding */}
          <div className="w-full bg-white p-6 rounded shadow-md space-y-4">
            <Toaster position="top-right" />
            <PlanWorkoutPage />
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
