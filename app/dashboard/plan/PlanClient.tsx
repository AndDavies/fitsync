"use client";

import React, { Suspense, useState } from "react";
import { format, subWeeks, addWeeks } from "date-fns";
import { useSearchParams } from "next/navigation";

import WeekSelector from "../../components/WeekSelector";
import WorkoutCalendar from "../../components/WorkoutCalendar";

// shadcn skeleton
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfile } from "@/utils/supabase/fetchUserProfile";

interface PlanClientProps {
  userProfile: UserProfile; // passed from server component
}

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
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col space-y-8 p-4 sm:p-6 lg:p-8">
        <Suspense
          fallback={
            <div className="p-6">
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

          <div className="flex-grow bg-card text-card-foreground rounded-xl shadow p-4 border border-border">
            <WorkoutCalendar
              defaultDate={format(weekStartDate, "yyyy-MM-dd")}
            />
          </div>
        </Suspense>
      </main>
    </div>
  );
}