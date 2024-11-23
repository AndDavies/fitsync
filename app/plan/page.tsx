// app/plan/page.tsx
"use client";

import React, { Suspense } from 'react';
import Header from "../components/Header";
import LeftNav from "../components/LeftNav";
import WorkoutCalendar from "../components/WorkoutCalendar";
import { useSearchParams } from 'next/navigation';

const PlanContent: React.FC = () => {
  const searchParams = useSearchParams();
  const date = searchParams.get('date') || undefined; // Convert null to undefined

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-grow">
        <LeftNav />
        <main className="flex flex-grow p-6 space-x-4">
          <div className="flex-grow">
            <WorkoutCalendar defaultDate={date} />
          </div>
        </main>
      </div>
      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default function PlanPage() {
  return (
    <Suspense fallback={<div>Loading Plan...</div>}>
      <PlanContent />
    </Suspense>
  );
}
