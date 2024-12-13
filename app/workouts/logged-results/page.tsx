"use client";
import React from 'react';
import Header from "../../components/Header";
import LeftNav from '../../components/LeftNav';
import LoggedResultsPage from '@/app/components/LoggedResultsPage';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Left Navigation */}
        <LeftNav />

        <main className="flex flex-grow p-4">
          <LoggedResultsPage />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-center py-4 shadow-inner border-t border-gray-700">
        <p className="text-sm text-gray-400">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
