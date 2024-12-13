"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import WeekSelector from "./WeekSelector";
import { format, startOfWeek, addDays, parseISO, isToday, subWeeks, addWeeks } from "date-fns";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

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
  const { userData, isLoading: authLoading } = useAuth();
  const [workouts, setWorkouts] = useState<WeeklyWorkouts>({
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  });
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    defaultDate ? parseISO(defaultDate) : new Date()
  );
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  const fetchWorkoutsWithTracks = useCallback(async () => {
    if (authLoading || !userData) return;

    const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn: 0 });
    const startDate = format(currentWeekStart, "yyyy-MM-dd");
    const endDate = format(addDays(currentWeekStart, 6), "yyyy-MM-dd");

    try {
      let tracksData, tracksError;

      if (!userData.current_gym_id) {
        ({ data: tracksData, error: tracksError } = await supabase
          .from("tracks")
          .select("id, name")
          .eq("user_id", userData.user_id));
      } else {
        ({ data: tracksData, error: tracksError } = await supabase
          .from("tracks")
          .select("id, name")
          .eq("gym_id", userData.current_gym_id));
      }

      if (tracksError) {
        console.error("Error fetching tracks:", tracksError.message);
        return;
      }

      const trackIds = tracksData?.map((track: any) => track.id);

      const { data: workoutData, error: workoutError } = await supabase
        .from("scheduled_workouts")
        .select("id, date, workout_details, warm_up, cool_down, track_id")
        .in("track_id", trackIds || [])
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (workoutError) {
        console.error("Error fetching workouts:", workoutError.message);
        return;
      }

      const trackMap = new Map(tracksData?.map((track: any) => [track.id, track.name]));
      const groupedWorkouts: WeeklyWorkouts = {
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
      };

      workoutData?.forEach((workout) => {
        const workoutDate = new Date(workout.date);
        const dayOfWeek = format(workoutDate, "EEEE").toLowerCase() as keyof WeeklyWorkouts;

        groupedWorkouts[dayOfWeek].push({
          id: workout.id,
          trackName: trackMap.get(workout.track_id) || "Personal Track",
          workoutDetails: workout.workout_details,
          warmUp: workout.warm_up,
          coolDown: workout.cool_down,
          date: workout.date,
        });
      });

      setWorkouts(groupedWorkouts);
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }, [authLoading, userData, weekStartDate]);

  useEffect(() => {
    const initializeWeekDates = () => {
      const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn: 0 });
      const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
      setWeekDates(dates);
    };

    initializeWeekDates();
    fetchWorkoutsWithTracks();
  }, [weekStartDate, fetchWorkoutsWithTracks]);

  const goToPreviousWeek = () => setWeekStartDate((prevDate) => subWeeks(prevDate, 1));
  const goToNextWeek = () => setWeekStartDate((prevDate) => addWeeks(prevDate, 1));
  const goToToday = () => setWeekStartDate(new Date());

  return (
    <div className="w-full h-full flex flex-col items-center bg-gray-900 text-gray-100 p-4 overflow-hidden">
      <div className="w-full max-w-[1400px] flex flex-col space-y-6">
        {/* Week Selector */}
        <div className="bg-gray-800 rounded-md p-2">
          <WeekSelector
            weekStartDate={weekStartDate}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            onToday={goToToday}
          />
        </div>

        {/* Calendar Grid Container */}
        <div className="border border-gray-700 rounded-xl overflow-auto">
          <div className="grid grid-cols-7">
            {weekDates.map((date, index) => {
              const today = isToday(date);
              return (
                <div
                  key={index}
                  className={`py-3 text-center font-semibold border-b border-gray-600 ${
                    today ? 'bg-pink-700' : 'bg-gray-700'
                  } text-gray-200`}
                >
                  <div>{format(date, "EEE")}</div>
                  <div className="text-xs text-gray-300">{format(date, "MM/dd")}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7">
            {weekDates.map((date, index) => {
              const dayKey = format(date, "EEEE").toLowerCase() as keyof WeeklyWorkouts;
              const dayWorkouts = workouts[dayKey];
              const today = isToday(date);

              return (
                <div
                  key={index}
                  className={`p-2 border-r border-gray-600 min-h-[200px] ${
                    today ? 'bg-gray-800' : 'bg-gray-900'
                  }`}
                >
                  {dayWorkouts && dayWorkouts.length > 0 ? (
                    dayWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="p-3 bg-gray-800 rounded-md mb-2 border border-gray-700 hover:border-pink-500 transition"
                      >
                        <div className="font-bold text-pink-400">{workout.trackName}</div>
                        <pre className="text-sm text-gray-200 whitespace-pre-wrap break-words mt-1">
                          {workout.workoutDetails}
                        </pre>
                        {workout.warmUp && (
                          <pre className="text-xs text-gray-400 mt-1">Warm-Up: {workout.warmUp}</pre>
                        )}
                        {workout.coolDown && (
                          <pre className="text-xs text-gray-400 mt-1">Cool-Down: {workout.coolDown}</pre>
                        )}
                        <div className="flex space-x-2 mt-2">
                          {(userData?.role === 'athlete' || userData?.role === 'member') ? (
                            <Link
                              href={`/workouts/log-result/${workout.id}`}
                              className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                              Log Result
                            </Link>
                          ) : (
                            <>
                              <Link
                                href={`/workouts/log-result/${workout.id}`}
                                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                              >
                                Log Result
                              </Link>
                              <Link
                                href={`/edit-workout/${workout.id}`}
                                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                              >
                                Edit Workout
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">No Workouts</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;
