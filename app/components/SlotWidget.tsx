import React from "react";

type ClassType = {
  id: string;
  class_name: string;
  color: string;
};

interface SlotWidgetProps {
  selectedClassType: ClassType | null;
  onNewSlot: () => void;
  onTypicalWeek: () => void;
}

const SlotWidget: React.FC<SlotWidgetProps> = ({
  selectedClassType,
  onNewSlot,
  onTypicalWeek,
}) => {
  return (
    <div
      className={`slot-widget p-4 rounded-3xl shadow-md w-1/4 h-32 flex flex-col items-center justify-start space-y-4 border-2 ${
        selectedClassType ? "border-opacity-100" : "border-opacity-40"
      }`}
      style={{ borderColor: selectedClassType?.color || "gray" }}
    >
      <div className="class-type-header text-lg font-semibold mb-2">
        {selectedClassType ? selectedClassType.class_name : "Ascent"}
      </div>

      <div className="flex items-center space-x-4">
        <button
          disabled={!selectedClassType}
          onClick={onNewSlot}
          className="flex items-center text-sm font-semibold text-gray-700 hover:text-blue-500 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Slot
        </button>
        <button
          disabled={!selectedClassType}
          onClick={onTypicalWeek}
          className="flex items-center text-sm font-semibold text-gray-700 hover:text-blue-500 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18m-6 6h6m-6 6h6" />
          </svg>
          Typical Week
        </button>
      </div>
    </div>
  );
};

export default SlotWidget;
