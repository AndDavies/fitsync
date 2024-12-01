"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import "../styles/CalendarStyles.css";
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

    const startDate = format(startOfWeek(weekStartDate, { weekStartsOn: 0 }), "yyyy-MM-dd");
    const endDate = format(addDays(new Date(startDate), 6), "yyyy-MM-dd");

    try {
      let tracksData;
      let tracksError;
      //console.log("Current Gym ID:", userData.current_gym_id);
      //console.log("User ID:", userData.user_id);

      if (!userData.current_gym_id) {
        ({ data: tracksData, error: tracksError } = await supabase
          .from("tracks")
          .select("id, name")
          .eq("user_id", userData.user_id)); 
          console.log("Current Gym ID:", userData.current_gym_id);
          console.log("User ID:", userData.user_id);
      } else {
        ({ data: tracksData, error: tracksError } = await supabase
          .from("tracks")
          .select("id, name")
          .eq("gym_id", userData.current_gym_id));   
          console.log("Current Gym ID:", userData.current_gym_id);
          console.log("User ID:", userData.user_id);
      }

      if (tracksError) {
        console.error("Error fetching tracks:", tracksError.message);
        return;
      }

      const trackIds = tracksData?.map((track) => track.id);

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

      const trackMap = new Map(tracksData?.map((track) => [track.id, track.name]));
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
    <div className="workout-calendar-container">
      <div className="widget-container flex justify-between items-start py-6 space-x-6">
        <WeekSelector
          weekStartDate={weekStartDate}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onToday={goToToday}
        />
      </div>
      <div className="calendar-grid mt-6 overflow-auto">
        <div
          className="grid grid-cols-7 text-sm antialiased"
          style={{ minWidth: "900px" }} // Set a fixed minimum width
        >
          {weekDates.map((date, index) => (
            <div key={index} className="header-slot bg-gray-800 text-white py-2 px-4 text-center">
              <div className="font-semibold">{format(date, "EEE")}</div>
              <div className="text-xs">{format(date, "MM/dd")}</div>
            </div>
          ))}

          {weekDates.map((date, index) => (
            <div key={index} className="day-slot border p-2 bg-white">
              {workouts[format(date, "EEEE").toLowerCase() as keyof WeeklyWorkouts]?.length > 0 ? (
                workouts[format(date, "EEEE").toLowerCase() as keyof WeeklyWorkouts].map((workout) => (
                  <div key={workout.id} className="workout-item p-2 border-l-4 rounded-md mb-2">
                    <div className="font-bold text-blue-500">{workout.trackName}</div>
                    <pre className="text-sm">{workout.workoutDetails}</pre>
                    {workout.warmUp && (
                      <pre className="text-xs text-gray-500 mt-1">Warm-Up: {workout.warmUp}</pre>
                    )}
                    {workout.coolDown && (
                      <pre className="text-xs text-gray-500 mt-1">Cool-Down: {workout.coolDown}</pre>
                    )}
                    {userData?.role === 'athlete' || userData?.role === 'member' ? (
                      <Link
                        href={`/workouts/log-result/${workout.id}`}
                        className="inline-block mt-2 text-sm text-green-600 hover:underline"
                      >
                        Log Result
                      </Link>
                    ) : (
                      <Link
                        href={`/edit-workout/${workout.id}`}
                        className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                      >
                        Edit Workout
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">No Workouts</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;
