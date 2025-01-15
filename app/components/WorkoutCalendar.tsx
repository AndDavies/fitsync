"use client";

import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays, parseISO, isToday } from "date-fns";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton"; // ShadCN Skeleton
import WorkoutDisplay from "./WorkoutDisplay";
import { ParsedWorkout } from "./types";

/** Types for grouping workouts by day-of-week */
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

  // Manages the starting date for the calendar’s displayed week.
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    defaultDate ? parseISO(defaultDate) : new Date()
  );

  // Store the 7 days for the current displayed week
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  // Loading state for ShadCN skeleton
  const [loading, setLoading] = useState<boolean>(true);

  // The final grouped workouts
  const [workouts, setWorkouts] = useState<WeeklyWorkouts>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  /**
   * Whenever defaultDate changes from props, reset the weekStartDate.
   */
  useEffect(() => {
    if (defaultDate) {
      setWeekStartDate(parseISO(defaultDate));
    }
  }, [defaultDate]);

  /**
   * Fetch workouts from /api/workouts/by-week?start=...&end=...,
   * then group them by day of the week.
   */
  async function fetchWorkoutsForWeek() {
    setLoading(true);

    // Start of the displayed week
    const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn });
    const startDate = format(currentWeekStart, "yyyy-MM-dd");
    const endDate = format(addDays(currentWeekStart, 6), "yyyy-MM-dd");

    try {
      // Make a request to your new SSR-based endpoint
      const res = await fetch(
        `/api/workouts/by-week?start=${startDate}&end=${endDate}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        // handle error if desired
        console.error("Failed to fetch workouts by week");
        setLoading(false);
        return;
      }

      const jsonData = await res.json();
      const fetchedWorkouts = jsonData.workouts || [];

      // Build a map for day-of-week -> array of workouts
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
        // date property is a string "yyyy-mm-dd"
        const woDate = parseISO(wo.date); 
        const dayKey = format(woDate, "EEEE").toLowerCase() as keyof WeeklyWorkouts;

        // Ensure workout_details is properly parsed
        let parsedDetails: ParsedWorkout;
        if (typeof wo.workout_details === "string") {
          parsedDetails = JSON.parse(wo.workout_details);
        } else {
          parsedDetails = wo.workout_details;
        }

        // If you store trackName in the DB, or need additional logic, adapt as needed
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
    // Build array of 7 days
    const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    setWeekDates(dates);

    // Fetch workouts for that range
    fetchWorkoutsForWeek();
  }, [weekStartDate, weekStartsOn]);

  /**
   * Render
   */
  return (
    <div className="calendar-grid mt-4 overflow-auto">
      {loading ? (
        /* ShadCN skeleton placeholders for the weekly calendar */
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ) : (
        <div className="grid grid-cols-7 auto-rows-auto text-sm antialiased border border-gray-700 rounded-xl">
          {/* Header Row: Day names & dates */}
          {weekDates.map((date, index) => {
            const today = isToday(date);
            return (
              <div
                key={`header-${index}`}
                className={`bg-gray-700 p-3 border-b border-gray-600 text-center font-semibold text-gray-200 ${
                  index < 6 ? "border-r border-gray-600" : ""
                } ${today ? "text-pink-300" : ""}`}
              >
                {format(date, "EEE MM/dd")}
              </div>
            );
          })}

          {/* Workouts Row(s) */}
          {weekDates.map((date, index) => {
            const dayKey = format(date, "EEEE").toLowerCase() as keyof WeeklyWorkouts;
            const dayWorkouts = workouts[dayKey];

            return (
              <div
                key={`col-${index}`}
                className={`p-2 bg-gray-800 relative ${
                  index < 6 ? "border-r border-gray-700" : ""
                }`}
              >
                {dayWorkouts && dayWorkouts.length > 0 ? (
                  dayWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="schedule-item mb-2 rounded bg-gray-700 p-2 text-sm border-l-4 border-pink-500 hover:scale-[1.01] transition-transform hover:bg-pink-700/20 cursor-pointer"
                    >
                      <div className="font-semibold mb-1 text-pink-400">
                        {workout.trackName}
                      </div>

                      <WorkoutDisplay
                        workoutData={workout.workoutDetails}
                        workoutName={workout.name}
                        warmUp={workout.warmUp}
                        coolDown={workout.coolDown}
                      />

                      {/* Log Result Link */}
                      <Link
                        href={`/workouts/log-result/${workout.id}`}
                        className="text-sm text-pink-400 mt-2 inline-block hover:underline"
                      >
                        Log Result
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">No Workouts</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}