// components/WorkoutCalendar.tsx
"use client";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/CalendarStyles.css";
import { useEffect, useState } from "react";

const localizer = momentLocalizer(moment);

type WorkoutCalendarProps = {
  defaultDate?: string; // Optional default date in 'YYYY-MM-DD' format
};

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ defaultDate }) => {
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (defaultDate) {
      setInitialDate(new Date(defaultDate)); // Set initial date based on query parameter
    } else {
      setInitialDate(new Date()); // Default to today if no date is provided
    }
  }, [defaultDate]);

  return (
    <div className="calendar-container bg-white rounded-lg shadow-xl p-6">
      <Calendar
        localizer={localizer}
        events={[]} // Ensure events are defined as all-day events if necessary
        startAccessor="start"
        endAccessor="end"
        style={{ height: "80vh" }}
        views={["month", "week", "day"]}
        defaultView="week" // Set week view as default
        date={initialDate} // Set the calendar date to the initialDate
        showMultiDayTimes={false} // Hide times for all-day events
        step={60} // Optional, define step interval for grid precision
      />
    </div>
  );
};

export default WorkoutCalendar;
