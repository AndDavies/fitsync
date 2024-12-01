import React from "react";
import { format } from "date-fns"; // Ensure this import is included

const WeekSelector: React.FC<{
  weekStartDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}> = ({ weekStartDate, onPreviousWeek, onNextWeek, onToday }) => (
  <div className="week-selection-widget bg-gray-900 text-white p-4 rounded-3xl shadow-md flex flex-col items-center justify-center w-1/4 h-32">
    <div className="flex items-center justify-between w-full px-4">
      <button onClick={onPreviousWeek} className="text-blue-300 hover:text-blue-500 transition text-2xl">
        &lt;
      </button>
      <div className="flex flex-col items-center">
        <span className="week-label font-semibold text-md mb-1">Week Of</span>
        <span className="week-date text-lg font-bold">{format(weekStartDate, "dd MMM yy")}</span>
      </div>
      <button onClick={onNextWeek} className="text-blue-300 hover:text-blue-500 transition text-2xl">
        &gt;
      </button>
    </div>
    <button onClick={onToday} className="text-blue-300 hover:text-blue-500 transition text-sm mt-2">
      Today
    </button>
  </div>
);

export default WeekSelector;
