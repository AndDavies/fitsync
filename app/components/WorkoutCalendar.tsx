// components/WorkoutCalendar.tsx
"use client";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/CalendarStyles.css"; // Optional custom styles (create this file if needed)


const localizer = momentLocalizer(moment);

type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
};

const events: Event[] = [
  {
    id: "1",
    title: "CrossFit Class",
    start: new Date(),
    end: new Date(),
    allDay: true,
  },
  {
    id: "2",
    title: "Running Session",
    start: new Date(),
    end: new Date(),
  },
];

const WorkoutCalendar: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        views={["month", "week", "day"]}
        defaultView="month"
      />
    </div>
  );
};

export default WorkoutCalendar;
