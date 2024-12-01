// app/workouts/page.tsx
"use client";
import React, { useState } from 'react';
import Header from "../../components/Header";
import LeftNav from '../../components/LeftNav';
import LoggedResultsPage from '@/app/components/LoggedResultsPage';

export default function Dashboard() {

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Left Navigation */}
        <LeftNav />

        {/* Main Dashboard Container */}
        <main className="flex flex-grow space-x-4">
            <LoggedResultsPage />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
