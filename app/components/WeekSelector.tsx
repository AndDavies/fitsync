import React from "react";
import { format } from "date-fns";

const WeekSelector: React.FC<{
  weekStartDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}> = ({ weekStartDate, onPreviousWeek, onNextWeek, onToday }) => (
  <div className="week-selection-widget bg-gray-800 border border-gray-700 rounded-xl shadow p-4 flex flex-col items-center justify-center w-1/4 h-32 space-y-2">
    <div className="flex items-center justify-between w-full px-4">
      <button
        onClick={onPreviousWeek}
        className="text-gray-400 hover:text-pink-400 transition text-lg font-bold focus:outline-none"
      >
        &lt;
      </button>
      <div className="flex flex-col items-center">
        <span className="week-label font-semibold text-sm mb-1 text-gray-300">Week Of</span>
        <span className="week-date text-lg font-bold text-gray-100">{format(weekStartDate, "dd MMM yy")}</span>
      </div>
      <button
        onClick={onNextWeek}
        className="text-gray-400 hover:text-pink-400 transition text-lg font-bold focus:outline-none"
      >
        &gt;
      </button>
    </div>
    <button
      onClick={onToday}
      className="text-pink-400 hover:underline text-sm font-medium focus:outline-none"
    >
      Today
    </button>
  </div>
);

export default WeekSelector;
