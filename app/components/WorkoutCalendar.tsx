"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import "../styles/CalendarStyles.css";
import { format, startOfWeek, addDays, isToday, parseISO, subWeeks, addWeeks } from "date-fns";
import Link from "next/link";

type Workout = {
  id: string;
  trackName: string;
  workoutDetails: string;
  warmUp?: string;
  coolDown?: string;
  date: string;
};

type WeeklyWorkouts = {
  [key: string]: Workout[];
};

type WorkoutCalendarProps = {
  defaultDate?: string;
};

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ defaultDate }) => {
  const [workouts, setWorkouts] = useState<WeeklyWorkouts>({
    sunday: [], monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [],
  });
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    defaultDate ? parseISO(defaultDate) : new Date()
  );
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    const initializeWeekDates = () => {
      const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn: 0 });
      const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
      setWeekDates(dates);
      return {
        startDate: format(currentWeekStart, "yyyy-MM-dd"),
        endDate: format(addDays(currentWeekStart, 6), "yyyy-MM-dd"),
      };
    };

    const fetchWorkoutsWithTracks = async () => {
      const { startDate, endDate } = initializeWeekDates();

      const { data: workoutData, error: workoutError } = await supabase
        .from("scheduled_workouts")
        .select("id, date, workout_details, warm_up, cool_down, track_id")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (workoutError) {
        console.error("Error fetching workouts:", workoutError.message);
        return;
      }

      const trackIds = Array.from(new Set(workoutData?.map((workout) => workout.track_id)));
      const { data: trackData, error: trackError } = await supabase
        .from("tracks")
        .select("id, name")
        .in("id", trackIds);

      if (trackError) {
        console.error("Error fetching tracks:", trackError.message);
        return;
      }

      const trackMap = new Map(trackData?.map((track) => [track.id, track.name]));
      const groupedWorkouts: WeeklyWorkouts = {
        sunday: [], monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [],
      };

      workoutData?.forEach((workout) => {
        const workoutDate = new Date(workout.date);
        const dayOfWeek = format(workoutDate, "EEEE").toLowerCase() as keyof WeeklyWorkouts;

        groupedWorkouts[dayOfWeek].push({
          id: workout.id,
          trackName: trackMap.get(workout.track_id) || "No Track Name",
          workoutDetails: workout.workout_details,
          warmUp: workout.warm_up,
          coolDown: workout.cool_down,
          date: workout.date,
        });
      });

      setWorkouts(groupedWorkouts);
    };

    fetchWorkoutsWithTracks();
  }, [weekStartDate]);

  const goToPreviousWeek = () => {
    setWeekStartDate((prevDate) => subWeeks(prevDate, 1));
  };

  const goToNextWeek = () => {
    setWeekStartDate((prevDate) => addWeeks(prevDate, 1));
  };

  if (weekDates.length === 0) return null;

  return (
    <div className="weekly-calendar">
      {/* Header Row */}
          <div className="calendar-header text-center py-4 border-b w-full">
        <h2 className="text-lg font-semibold text-gray-700">
          Week of {format(weekDates[0], "MMMM d, yyyy")}
        </h2>
      </div>
      {/* Calendar Days Row */}
      <div className="calendar-grid grid grid-cols-7 gap-2 p-4">
        {weekDates.map((date, index) => (
          <div 
            key={index}
            className={`day-column border p-2 rounded h-full flex flex-col justify-between`}
            style={isToday(date) ? { backgroundColor: "#f7cbe6" } : {}}
          >
            <div className="date-container">
              <div className="day-header font-bold">{format(date, "EEE")}</div>
              <div className="day-date text-sm">{format(date, "dd MMM")}</div>
            </div>
            <div className="day-content-wrapper mt-2 flex-1 overflow-y-auto">
              {workouts[format(date, "EEEE").toLowerCase() as keyof WeeklyWorkouts]?.length > 0 ? (
                workouts[format(date, "EEEE").toLowerCase() as keyof WeeklyWorkouts].map((workout) => (
                  <div key={workout.id} className="workout-item">
                    {workout.warmUp && (
                      <div className="section">
                        <div className="section-header font-semibold text-purple-700">Warm Up</div>
                        <pre className="section-content text-sm">{workout.warmUp}</pre>
                      </div>
                    )}
                    <div className="section">
                      <div className="section-header font-semibold text-purple-700">
                        {workout.trackName || "Workout Name"}
                      </div>
                        <pre className="section-content text-sm">{workout.workoutDetails}</pre>
                    </div>
                    {workout.coolDown && (
                      <div className="section">
                        <div className="section-header font-semibold text-purple-700">Cool Down</div>
                          <pre className="section-content text-sm">{workout.coolDown}</pre>
                      </div>
                    )}
                    <div className="section-content text-sm">
                      <Link
                        href={`/edit-workout/${workout.id}`}
                        className="inline-flex items-center justify-center p-3 text-base font-medium text-gray-500 rounded-lg bg-gray-50 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        Edit Workout
                      </Link>
                    </div>
                </div>
              ))
              ) : (
                <div className="no-workouts text-sm text-gray-400">No workouts</div>
              )}
            </div>
          </div>
        ))}
      </div>
        {/* Navigation Buttons Row */}
        <div className="calendar-navigation flex justify-between items-center mt-4 px-4 border-2 py-4">
          <button onClick={goToPreviousWeek} className="text-blue-500 hover:text-blue-700 transition">
            ← Previous Week
          </button>
          <button onClick={goToNextWeek} className="text-blue-500 hover:text-blue-700 transition">
            Next Week →
          </button>
        </div>
    </div>
  );
};

export default WorkoutCalendar;   