"use client";

import React, { useState, useEffect } from "react";
import { supabase } from '@/utils/supabase/client';
import "../styles/CalStyles.css";
import { format, startOfWeek, addDays, isToday } from "date-fns";

type Workout = {
  id: string;
  trackName: string;
  workoutDetails: string;
  date: string;
};

type WeeklyWorkouts = {
  [key: string]: Workout[];
};

const WorkoutCalendar: React.FC = () => {
  const [workouts, setWorkouts] = useState<WeeklyWorkouts>({
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  });
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchWorkoutsWithTracks = async () => {
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
      setWeekDates(dates);

      const startDate = format(currentWeekStart, "yyyy-MM-dd");
      const endDate = format(addDays(currentWeekStart, 6), "yyyy-MM-dd");

      // Step 1: Fetch workouts for the week with only track_id
      const { data: workoutData, error: workoutError } = await supabase
        .from("scheduled_workouts")
        .select("id, date, workout_details, track_id")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (workoutError) {
        console.error("Error fetching workouts:", workoutError.message);
        return;
      }

      // Collect all unique track_ids from the workouts
      const trackIds = Array.from(new Set(workoutData?.map((workout) => workout.track_id)));

      // Step 2: Fetch track names for the unique track_ids
      const { data: trackData, error: trackError } = await supabase
        .from("tracks")
        .select("id, name")
        .in("id", trackIds);

      if (trackError) {
        console.error("Error fetching tracks:", trackError.message);
        return;
      }

      // Create a map of track_id to track name for easy lookup
      const trackMap = new Map(trackData?.map((track) => [track.id, track.name]));

      // Group workouts by day and attach the track name
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
          trackName: trackMap.get(workout.track_id) || "No Track Name", // Look up track name in the map
          workoutDetails: workout.workout_details,
          date: workout.date,
        });
      });

      setWorkouts(groupedWorkouts);
    };

    fetchWorkoutsWithTracks();
  }, []);

  if (weekDates.length === 0) return null; // Ensure weekDates is populated before rendering

  return (
    <div className="weekly-calendar">
      {Object.keys(workouts).map((day, index) => (
        <div key={day} className={`day-column ${isToday(weekDates[index]) ? "highlight-today" : ""}`}>
          <div className="day-content-wrapper">
            <h3>
              {format(weekDates[index], "EEE")} <br />
              {format(weekDates[index], "dd MMM")}
            </h3>
            {workouts[day as keyof WeeklyWorkouts].map((workout) => (
              <div key={workout.id} className="workout-item">
                <strong>{workout.trackName}</strong>
                <p>{workout.workoutDetails}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkoutCalendar;
