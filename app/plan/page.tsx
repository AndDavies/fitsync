"use client";

import React, { Suspense, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WorkoutCalendar from "../components/WorkoutCalendar";
import { format, subWeeks, addWeeks } from "date-fns";
import WeekSelector from "../components/WeekSelector";
import { useSearchParams } from "next/navigation";

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="text-gray-300 p-6">Loading Plan...</div>}>
      <PlanContent />
    </Suspense>
  );
}

function PlanContent() {
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
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap lg:flex-nowrap justify-between items-start gap-6">sss
          <WeekSelector
            weekStartDate={weekStartDate}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            onToday={goToToday}
          />
        </div>
        <div className="flex-grow bg-gray-800 rounded-xl shadow p-4 border border-gray-700">
          {/* Pass weekStartDate as defaultDate */}
          <WorkoutCalendar defaultDate={format(weekStartDate, "yyyy-MM-dd")} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
