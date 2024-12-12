"use client";

import React from "react";
import { format, parseISO, isValid } from "date-fns";

type ClassSchedule = {
  id: string;
  class_name: string;
  start_time: string | null;
  end_time: string | null;
  max_participants: number;
  color: string;
};

type WeeklySchedule = {
  [key: string]: ClassSchedule[];
};

interface ClassCalendarProps {
  schedules: WeeklySchedule;
  weekDates: Date[];
}

const ClassCalendar: React.FC<ClassCalendarProps> = ({ schedules, weekDates }) => {
  const formatTime = (time: string | null) => {
    if (!time) return "Time not provided";
    const date = parseISO(time);
    return isValid(date) ? format(date, "h:mm a") : "Invalid time";
  };

  return (
    <div className="calendar-grid mt-6 overflow-auto">
      <div className="grid grid-cols-8 auto-rows-auto text-sm antialiased border border-gray-300 rounded-md">
        {/* Header Row: Empty top-left cell + Days of the week */}
        <div className="bg-white p-3 border-b border-gray-300"></div>
        {weekDates.map((date, index) => (
          <div
            key={index}
            className="bg-white p-3 border-b border-gray-300 text-center font-semibold"
          >
            {format(date, "EEE MM/dd")}
          </div>
        ))}

        {/* Rows for Time Slots (6 AM to 8 PM = 15 slots if that's your choice) */}
        {Array.from({ length: 15 }, (_, i) => {
          const hour = 6 + i;
          const formattedHour = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
          return (
            <React.Fragment key={i}>
              {/* Time Slot Column */}
              <div className="time-slot p-3 border-r border-gray-300 bg-gray-50 text-gray-700 text-center">
                {formattedHour}
              </div>
              {/* Day Columns for Each Time Slot */}
              {weekDates.map((date, index) => {
                const dayStr = format(date, "EEEE").toLowerCase();
                const daySchedules = schedules[dayStr as keyof WeeklySchedule].filter(
                  (schedule) => {
                    const st = schedule.start_time ? parseISO(schedule.start_time) : null;
                    return st && isValid(st) && st.getHours() === hour;
                  }
                );

                return (
                  <div
                    key={`${i}-${index}`}
                    className="day-slot p-2 border-b border-gray-300 bg-white h-20 relative"
                  >
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="schedule-item mb-2 rounded bg-gray-50 p-2 text-sm"
                        style={{
                          borderLeft: `4px solid ${schedule.color || "#000"}`,
                        }}
                      >
                        <div style={{ color: schedule.color }} className="font-semibold">
                          {schedule.class_name}
                        </div>
                        <div className="text-gray-700 text-xs">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </div>
                        <div className="text-gray-700 text-xs">Max: {schedule.max_participants}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ClassCalendar;
