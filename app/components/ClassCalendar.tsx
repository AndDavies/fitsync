"use client";

import React from "react";
import { format, parseISO, isValid } from "date-fns";
import { ClassSchedule, WeeklySchedule } from "@/app/types/classes";

interface ClassCalendarProps {
  schedules: WeeklySchedule;
  weekDates: Date[];
  onClassClick: (cls: ClassSchedule) => void;
}

export default function ClassCalendar({
  schedules,
  weekDates,
  onClassClick,
}: ClassCalendarProps) {
  const formatTime = (time: string | null) => {
    if (!time) return "Time not provided";
    const date = parseISO(time);
    return isValid(date) ? format(date, "h:mm a") : "Invalid time";
  };

  return (
    <div className="calendar-grid mt-4 overflow-auto">
      <div className="grid grid-cols-8 auto-rows-auto text-sm antialiased border border-border rounded-xl">
        {/* Header Row */}
        <div className="bg-secondary p-3 border-b border-border" />
        {weekDates.map((date, index) => (
          <div
            key={index}
            className="bg-secondary p-3 border-b border-border text-center font-semibold text-secondary-foreground"
          >
            {format(date, "EEE MM/dd")}
          </div>
        ))}

        {/* Time slots: from 6:00 AM to 8:00 PM (15 rows) */}
        {Array.from({ length: 15 }, (_, i) => {
          const hour = 6 + i;
          const formattedHour =
            hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;

          return (
            <React.Fragment key={i}>
              {/* Time slot column */}
              <div className="time-slot p-3 border-r border-border bg-card text-muted-foreground text-center font-medium">
                {formattedHour}
              </div>

              {weekDates.map((date, idx) => {
                const dayStr = format(date, "EEEE").toLowerCase();
                const daySchedules = schedules[dayStr as keyof WeeklySchedule].filter(
                  (schedule) => {
                    const st = schedule.start_time ? parseISO(schedule.start_time) : null;
                    return st && isValid(st) && st.getHours() === hour;
                  }
                );

                return (
                  <div
                    key={`${i}-${idx}`}
                    className="day-slot p-2 border-b border-border bg-card relative"
                  >
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="schedule-item mb-2 rounded bg-secondary p-2 text-sm cursor-pointer 
                                   transition-transform duration-150 hover:scale-105 hover:bg-accent/10"
                        style={{ borderLeft: `4px solid ${schedule.color || "#fff"}` }}
                        onClick={() => onClassClick?.(schedule)}
                      >
                        {/* If the schedule has a color, we can style text inline or rely on that color for borderLeft. */}
                        <div
                          style={{ color: schedule.color }}
                          className="font-semibold mb-1"
                        >
                          {schedule.class_name}
                        </div>
                        <div className="text-muted-foreground text-xs mb-1">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </div>
                        <div className="text-xs text-foreground/70">
                          {(schedule.confirmed_count ?? 0)} /{" "}
                          {schedule.max_participants} confirmed
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
}