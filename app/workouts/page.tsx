"use client";

import React, { useState } from "react";
import PlanWorkoutPage from "../components/PlanWorkoutPage";
import Header from "../components/Header";
import { Toaster } from "react-hot-toast";

export default function Dashboard() {
  const [workoutBuilderText, setWorkoutBuilderText] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-gray-800 text-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow p-6">
        {/* Content Container */}
        <div className="w-full bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 max-w-7xl mx-auto">
          <Toaster position="top-right" />
          <PlanWorkoutPage />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-center py-4 shadow-inner border-t border-gray-700">
        <p className="text-sm text-gray-400">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}