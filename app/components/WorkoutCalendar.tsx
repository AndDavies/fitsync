"use client";

import React, { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  addDays,
  parseISO,
  isToday,
} from "date-fns";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton"; // shadcn Skeleton
import WorkoutDisplay from "./WorkoutDisplay";
import { ParsedWorkout } from "./types";

type Workout = {
  id: string;
  trackName: string;
  name: string;
  workoutDetails: ParsedWorkout;
  warmUp?: string;
  coolDown?: string;
  date: string;
};

type WeeklyWorkouts = {
  monday: Workout[];
  tuesday: Workout[];
  wednesday: Workout[];
  thursday: Workout[];
  friday: Workout[];
  saturday: Workout[];
  sunday: Workout[];
};

type WorkoutCalendarProps = {
  /** If provided, the calendar starts on this date (yyyy-mm-dd). Otherwise, it starts on today's date. */
  defaultDate?: string;
};

export default function WorkoutCalendar({ defaultDate }: WorkoutCalendarProps) {
  const startOnMonday = true;
  const weekStartsOn = startOnMonday ? 1 : 0;

  const [weekStartDate, setWeekStartDate] = useState<Date>(
    defaultDate ? parseISO(defaultDate) : new Date()
  );
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [workouts, setWorkouts] = useState<WeeklyWorkouts>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  useEffect(() => {
    if (defaultDate) {
      setWeekStartDate(parseISO(defaultDate));
    }
  }, [defaultDate]);

  async function fetchWorkoutsForWeek() {
    setLoading(true);
    const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn });
    const startDate = format(currentWeekStart, "yyyy-MM-dd");
    const endDate = format(addDays(currentWeekStart, 6), "yyyy-MM-dd");

    try {
      const res = await fetch(
        `/api/workouts/by-week?start=${startDate}&end=${endDate}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        console.error("Failed to fetch workouts by week");
        setLoading(false);
        return;
      }

      const jsonData = await res.json();
      const fetchedWorkouts = jsonData.workouts || [];

      const grouped: WeeklyWorkouts = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };

      fetchedWorkouts.forEach((wo: any) => {
        const woDate = parseISO(wo.date);
        const dayKey = format(woDate, "EEEE").toLowerCase() as keyof WeeklyWorkouts;

        let parsedDetails: ParsedWorkout;
        if (typeof wo.workout_details === "string") {
          parsedDetails = JSON.parse(wo.workout_details);
        } else {
          parsedDetails = wo.workout_details;
        }

        const trackName = wo.trackName || "No Track";

        grouped[dayKey].push({
          id: wo.id,
          date: wo.date,
          trackName,
          name: wo.name,
          workoutDetails: parsedDetails,
          warmUp: wo.warm_up ?? "",
          coolDown: wo.cool_down ?? "",
        });
      });

      setWorkouts(grouped);
    } catch (err) {
      console.error("Error fetching weekly workouts:", err);
    } finally {
      setLoading(false);
    }
  }

  // On mount or when weekStartDate changes, recalc the 7 days + fetch data
  useEffect(() => {
    const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    setWeekDates(dates);

    fetchWorkoutsForWeek();
  }, [weekStartDate, weekStartsOn]);

  return (
    <div className="calendar-grid mt-4 overflow-auto">
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ) : (
        <div className="grid grid-cols-7 auto-rows-auto text-sm antialiased border border-border rounded-xl">
          {/* Header Row: Day names & dates */}
          {weekDates.map((date, index) => {
            const today = isToday(date);
            return (
              <div
                key={`header-${index}`}
                className={`bg-secondary text-secondary-foreground p-3 border-b border-border 
                  text-center font-semibold ${index < 6 ? "border-r" : ""} ${
                  today ? "text-accent" : ""
                }`}
              >
                {format(date, "EEE MM/dd")}
              </div>
            );
          })}

          {/* Workout Columns */}
          {weekDates.map((date, index) => {
            const dayKey = format(date, "EEEE").toLowerCase() as keyof WeeklyWorkouts;
            const dayWorkouts = workouts[dayKey];

            return (
              <div
                key={`col-${index}`}
                className={`p-2 bg-card text-card-foreground relative ${
                  index < 6 ? "border-r border-border" : ""
                }`}
              >
                {dayWorkouts && dayWorkouts.length > 0 ? (
                  dayWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="mb-2 rounded bg-secondary p-2 text-sm border-l-4 border-accent 
                        hover:scale-[1.01] transition-transform hover:bg-accent/10 cursor-pointer"
                    >

                      <WorkoutDisplay
                        workoutData={workout.workoutDetails}
                        workoutName={workout.name}
                        warmUp={workout.warmUp}
                        coolDown={workout.coolDown}
                      />

                      <Link
                        href={`/workouts/log-result/${workout.id}`}
                        className="text-sm text-accent mt-2 inline-block hover:underline"
                      >
                        Log Result
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    No Workouts
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}