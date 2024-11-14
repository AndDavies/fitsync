"use client";

import React, { useState, useEffect } from "react";
import { supabase } from '@/utils/supabase/client';
import "../styles/CalendarStyles.css";
import { format, startOfWeek, addDays, isToday, parseISO } from "date-fns";

type Workout = {
  id: string;
  trackName: string;
  workoutDetails: string;
  warmUp?: string;
  coolDown?: string;
  date: string;
};

type WorkoutLine = {
  id: string;
  content: string;
  type: 'focus' | 'sets' | 'intensity' | 'details';
};

type WeeklyWorkouts = {
  [key: string]: Workout[];
};

type WorkoutCalendarProps = {
  defaultDate?: string;
};

// Parsing workout details similar to WorkoutBuilder
const parseWorkoutText = (workoutText: string): WorkoutLine[] => {
  const lines = workoutText.split('\n').filter((line) => line.trim());
  return lines.map((line, index) => ({
    id: `item-${index}`,
    content: line.trim(),
    type: index === 0 ? 'focus' 
          : /^\d+(-\d+)+$/.test(line.trim()) ? 'sets' 
          : /RPE\s*\d+(-\d+)?/.test(line) ? 'intensity' 
          : 'details',
  }));
};

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ defaultDate }) => {
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
    const initializeWeekDates = () => {
      const initialDate = defaultDate ? parseISO(defaultDate) : new Date();
      const currentWeekStart = startOfWeek(initialDate, { weekStartsOn: 0 });
      const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
      setWeekDates(dates);
      return { startDate: format(currentWeekStart, "yyyy-MM-dd"), endDate: format(addDays(currentWeekStart, 6), "yyyy-MM-dd") };
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
          trackName: trackMap.get(workout.track_id) || "No Track Name",
          workoutDetails: parseWorkoutText(workout.workout_details).map(line => line.content).join('\n'),
          warmUp: workout.warm_up ? parseWorkoutText(workout.warm_up).map(line => line.content).join('\n') : undefined,
          coolDown: workout.cool_down ? parseWorkoutText(workout.cool_down).map(line => line.content).join('\n') : undefined,
          date: workout.date,
        });
      });

      setWorkouts(groupedWorkouts);
    };

    fetchWorkoutsWithTracks();
  }, [defaultDate]);

  if (weekDates.length === 0) return null;

  return (
    <div className="weekly-calendar">
      {Object.keys(workouts).map((day, index) => (
        <div
          key={day}
          className={`day-column ${isToday(weekDates[index]) ? "highlight-today" : ""}`}
          style={isToday(weekDates[index]) ? { backgroundColor: "#f7cbe6" } : {}}
        >
          <div className="date-container">
            <div className="day-header">
              {format(weekDates[index], "EEE")}
            </div>
            <div className="day-date">
              {format(weekDates[index], "dd MMM")}
            </div>
          </div>
          <div className="day-content-wrapper">
            {workouts[day as keyof WeeklyWorkouts].map((workout) => (
              <div key={workout.id} className="workout-item">
                {workout.warmUp && (
                  <div className="section">
                    <div className="section-header">Warm Up</div>
                    <pre className="section-content">{workout.warmUp}</pre>
                  </div>
                )}
                <div className="section">
                  <div className="section-header">{workout.trackName || "Workout Name"}</div>
                  <pre className="section-content">{workout.workoutDetails}</pre>
                </div>
                {workout.coolDown && (
                  <div className="section">
                    <div className="section-header">Cool Down</div>
                    <pre className="section-content">{workout.coolDown}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkoutCalendar;
