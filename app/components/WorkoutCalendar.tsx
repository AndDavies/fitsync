"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import { format, startOfWeek, addDays, parseISO, isToday } from "date-fns";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import WorkoutDisplay from "./WorkoutDisplay";
import { ParsedWorkout } from "./types"; // Ensure this matches the JSON structure from workout_details

type Workout = {
  id: string;
  trackName: string;
  // Now workoutDetails is a ParsedWorkout (JSON object), not a string
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
  defaultDate?: string;
};

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ defaultDate }) => {
  const { userData, isLoading: authLoading } = useAuth();
  const [workouts, setWorkouts] = useState<WeeklyWorkouts>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const startOnMonday = true;
  const weekStartsOn = startOnMonday ? 1 : 0;

  const [weekStartDate, setWeekStartDate] = useState<Date>(
    defaultDate ? parseISO(defaultDate) : new Date()
  );

  const fetchWorkoutsWithTracks = useCallback(async () => {
    if (authLoading || !userData) return;

    const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn });
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
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };

      workoutData?.forEach((workout) => {
        const workoutDate = new Date(workout.date);
        const dayOfWeek = format(workoutDate, "EEEE").toLowerCase() as keyof WeeklyWorkouts;
        
        // workout.workout_details is now JSON (ParsedWorkout)
        groupedWorkouts[dayOfWeek].push({
          id: workout.id,
          trackName: trackMap.get(workout.track_id) || "Personal Track",
          workoutDetails: workout.workout_details, // already JSON, not a string
          warmUp: workout.warm_up || "",
          coolDown: workout.cool_down || "",
          date: workout.date,
        });
      });

      setWorkouts(groupedWorkouts);
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }, [authLoading, userData, weekStartDate, weekStartsOn]);

  useEffect(() => {
    const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    setWeekDates(dates);
    fetchWorkoutsWithTracks();
  }, [weekStartDate, weekStartsOn, fetchWorkoutsWithTracks]);

  return (
    <div className="calendar-grid mt-4 overflow-auto">
      <div className="grid grid-cols-7 auto-rows-auto text-sm antialiased border border-gray-700 rounded-xl">
        {/* Header Row */}
        {weekDates.map((date, index) => {
          const today = isToday(date);
          return (
            <div
              key={index}
              className={`bg-gray-700 p-3 border-b border-gray-600 text-center font-semibold text-gray-200 ${
                index < 6 ? "border-r border-gray-600" : ""
              } ${today ? "text-pink-300" : ""}`}
            >
              {format(date, "EEE MM/dd")}
            </div>
          );
        })}

        {/* Workouts Row */}
        {weekDates.map((date, index) => {
          const dayKey = format(date, "EEEE").toLowerCase() as keyof WeeklyWorkouts;
          const dayWorkouts = workouts[dayKey];

          return (
            <div
              key={index}
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
                    {/* Display the structured workout details with WorkoutDisplay */}
                    <WorkoutDisplay workoutData={workout.workoutDetails} workoutName={workout.trackName} />

                    {workout.warmUp && workout.warmUp.trim() !== "" && (
                      <pre className="text-xs text-gray-400 mt-1">
                        Warm-Up: {workout.warmUp}
                      </pre>
                    )}
                    {workout.coolDown && workout.coolDown.trim() !== "" && (
                      <pre className="text-xs text-gray-400 mt-1">
                        Cool-Down: {workout.coolDown}
                      </pre>
                    )}
                    <div className="flex space-x-2 mt-2">
                      {userData?.role === "athlete" || userData?.role === "member" ? (
                        <Link
                          href={`/workouts/log-result/${workout.id}`}
                          className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none"
                        >
                          Log Result
                        </Link>
                      ) : (
                        <>
                          <Link
                            href={`/workouts/log-result/${workout.id}`}
                            className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none"
                          >
                            Log Result
                          </Link>
                          <Link
                            href={`/edit-workout/${workout.id}`}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
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
  );
};

export default WorkoutCalendar;