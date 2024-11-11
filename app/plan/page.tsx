import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Import default styles
import './CustomCalendar.css'; // Custom styles file

// Set up the localizer for moment.js
const localizer = momentLocalizer(moment);

type Event = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
};

const events: Event[] = [
  {
    title: 'Workout A',
    start: new Date(2024, 10, 15, 9, 0, 0),
    end: new Date(2024, 10, 15, 11, 0, 0),
  },
  {
    title: 'Workout B',
    start: new Date(2024, 10, 17, 14, 0, 0),
    end: new Date(2024, 10, 17, 15, 30, 0),
  },
];

const CustomCalendar: React.FC = () => {
  return (
    <div className="custom-calendar-container p-4 bg-gray-900 text-white rounded-md shadow-lg">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={['month', 'week', 'day']}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent,
        }}
      />
    </div>
  );
};

// Custom Toolbar Component for custom header styling
const CustomToolbar: React.FC<any> = ({ label, onNavigate }) => {
  return (
    <div className="flex justify-between items-center bg-gray-800 p-3 rounded-md">
      <button
        onClick={() => onNavigate('PREV')}
        className="text-lg font-bold hover:bg-gray-700 p-2 rounded-md"
      >
        {'<'}
      </button>
      <h1 className="text-2xl font-extrabold">{label}</h1>
      <button
        onClick={() => onNavigate('NEXT')}
        className="text-lg font-bold hover:bg-gray-700 p-2 rounded-md"
      >
        {'>'}
      </button>
    </div>
  );
};

// Custom Event Component for event display styling
const CustomEvent: React.FC<any> = ({ event }) => {
  return (
    <div className="bg-gray-700 p-2 rounded-md shadow-sm">
      <span className="font-semibold">{event.title}</span>
    </div>
  );
};

export default CustomCalendar;
