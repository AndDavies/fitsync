import React from "react";
import { format } from "date-fns";

interface WeekSelectorProps {
  weekStartDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

/**
 * Simple widget to navigate weeks
 */
const WeekSelector: React.FC<WeekSelectorProps> = ({
  weekStartDate,
  onPreviousWeek,
  onNextWeek,
  onToday,
}) => {
  return (
    <div className="bg-card border border-border rounded-xl shadow p-4 flex flex-col items-center justify-center h-32 space-y-2">
      <div className="flex items-center justify-between w-full px-4">
        <button
          onClick={onPreviousWeek}
          className="text-muted-foreground hover:text-accent transition text-lg font-bold focus:outline-none"
        >
          &lt;
        </button>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-sm mb-1 text-muted-foreground">
            Week Of
          </span>
          <span className="text-lg font-bold text-foreground">
            {format(weekStartDate, "dd MMM yy")}
          </span>
        </div>
        <button
          onClick={onNextWeek}
          className="text-muted-foreground hover:text-accent transition text-lg font-bold focus:outline-none"
        >
          &gt;
        </button>
      </div>
      <button
        onClick={onToday}
        className="text-accent hover:underline text-sm font-medium focus:outline-none"
      >
        Today
      </button>
    </div>
  );
};

export default WeekSelector;