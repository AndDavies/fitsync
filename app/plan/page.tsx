"use client";

import React, { Suspense, useState } from "react";
import Header from "../components/Header";
import WorkoutCalendar from "../components/WorkoutCalendar";
import { useSearchParams } from "next/navigation";
import { format, subWeeks, addWeeks } from "date-fns";
import WeekSelector from "../components/WeekSelector";

// By handling week navigation in the page, we mimic how classes/page.tsx works.
export default function PlanPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date") || undefined;

  // Initialize weekStartDate from dateParam if provided
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    dateParam ? new Date(dateParam) : new Date()
  );

  const goToPreviousWeek = () => setWeekStartDate((prevDate) => subWeeks(prevDate, 1));
  const goToNextWeek = () => setWeekStartDate((prevDate) => addWeeks(prevDate, 1));
  const goToToday = () => setWeekStartDate(new Date());

  return (
    <Suspense fallback={<div className="text-gray-300 p-6">Loading Plan...</div>}>
      <div className="bg-gray-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col space-y-8 p-4 sm:p-6 lg:p-8">
          {/* Top controls: 
              Just like in classes page, we have a WeekSelector on the left. */}
          <div className="flex flex-wrap lg:flex-nowrap justify-between items-start gap-6">
            <WeekSelector
              weekStartDate={weekStartDate}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              onToday={goToToday}
            />
          </div>

          {/* Calendar Display */}
          <div className="flex-grow bg-gray-800 rounded-xl shadow p-4 border border-gray-700">
            <WorkoutCalendar defaultDate={format(weekStartDate, "yyyy-MM-dd")} />
          </div>
        </main>
        <footer className="bg-gray-800 text-center py-4 shadow-inner text-sm text-gray-400 border-t border-gray-700">
          &copy; 2024 FitSync. All rights reserved.
        </footer>
      </div>
    </Suspense>
  );
}