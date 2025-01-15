"use client";

import React, { Suspense, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import WeekSelector from "../../components/WeekSelector";
import WorkoutCalendar from "../../components/WorkoutCalendar";
import { format, subWeeks, addWeeks } from "date-fns";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";  // ShadCN skeleton
import { UserProfile } from "@/utils/supabase/fetchUserProfile";

interface PlanClientProps {
  userProfile: UserProfile; // passed from server component
}

/**
 * Client Component for plan page
 * - Renders the "Header", "Footer", "WeekSelector", and "WorkoutCalendar"
 * - Uses a ShadCN Skeleton for loading fallback if needed
 */
export default function PlanClient({ userProfile }: PlanClientProps) {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date") || undefined;
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    dateParam ? new Date(dateParam) : new Date()
  );

  const goToPreviousWeek = () => setWeekStartDate((prevDate) => subWeeks(prevDate, 1));
  const goToNextWeek = () => setWeekStartDate((prevDate) => addWeeks(prevDate, 1));
  const goToToday = () => setWeekStartDate(new Date());

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      {/* Recommended: keep SSR approach for user checks, but we can display the userProfile if needed */}
      <Header />

      {/* Suspense boundary with ShadCN skeleton fallback */}
      <main className="flex-grow flex flex-col space-y-8 p-4 sm:p-6 lg:p-8">
        <Suspense
          fallback={
            <div className="p-6">
              {/* ShadCN Skeleton (you can also place multiple skeleton blocks to mock your calendar UI) */}
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-6 w-full" />
            </div>
          }
        >
          <div className="flex flex-wrap lg:flex-nowrap justify-between items-start gap-6">
            <WeekSelector
              weekStartDate={weekStartDate}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              onToday={goToToday}
            />
          </div>

          <div className="flex-grow bg-gray-800 rounded-xl shadow p-4 border border-gray-700">
            <WorkoutCalendar defaultDate={format(weekStartDate, "yyyy-MM-dd")} />
          </div>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}