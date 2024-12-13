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
  confirmed_count?: number;
};

type WeeklySchedule = {
  [key: string]: ClassSchedule[];
};

type ClassCalendarProps = {
  schedules: WeeklySchedule;
  weekDates: Date[];
  onClassClick?: (cls: ClassSchedule) => void;
};

const ClassCalendar: React.FC<ClassCalendarProps> = ({ schedules, weekDates, onClassClick }) => {
  const formatTime = (time: string | null) => {
    if (!time) return "Time not provided";
    const date = parseISO(time);
    return isValid(date) ? format(date, "h:mm a") : "Invalid time";
  };

  return (
    <div className="calendar-grid mt-4 overflow-auto">
      <div className="grid grid-cols-8 auto-rows-auto text-sm antialiased border border-gray-700 rounded-xl">
        {/* Header Row */}
        <div className="bg-gray-700 p-3 border-b border-gray-600"></div>
        {weekDates.map((date, index) => (
          <div
            key={index}
            className="bg-gray-700 p-3 border-b border-gray-600 text-center font-semibold text-gray-200"
          >
            {format(date, "EEE MM/dd")}
          </div>
        ))}

        {/* Time slots */}
        {Array.from({ length: 15 }, (_, i) => {
          const hour = 6 + i;
          const formattedHour = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
          return (
            <React.Fragment key={i}>
              {/* Time Slot Column */}
              <div className="time-slot p-3 border-r border-gray-600 bg-gray-800 text-gray-400 text-center font-medium">
                {formattedHour}
              </div>
              {weekDates.map((date, index) => {
                const dayStr = format(date, "EEEE").toLowerCase();
                const daySchedules = schedules[dayStr as keyof WeeklySchedule].filter((schedule) => {
                  const st = schedule.start_time ? parseISO(schedule.start_time) : null;
                  return st && isValid(st) && st.getHours() === hour;
                });

                return (
                  <div
                    key={`${i}-${index}`}
                    className="day-slot p-2 border-b border-gray-600 bg-gray-800 relative"
                  >
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="schedule-item mb-2 rounded bg-gray-700 p-2 text-sm cursor-pointer transition-transform duration-150 hover:scale-105 hover:bg-pink-700/20"
                        style={{
                          borderLeft: `4px solid ${schedule.color || "#fff"}`,
                        }}
                        onClick={() => onClassClick && onClassClick(schedule)}
                      >
                        <div
                          style={{ color: schedule.color }}
                          className="font-semibold mb-1"
                        >
                          {schedule.class_name}
                        </div>
                        <div className="text-gray-300 text-xs mb-1">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {(schedule.confirmed_count ?? 0)} / {schedule.max_participants} confirmed
                        </div>
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
