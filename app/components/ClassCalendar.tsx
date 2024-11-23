"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import "../styles/CalendarStyles.css";
import CreateClassModal from "./CreateClassModal";
import CreateClassTypeModal from "./CreateClassTypeModal";
import CreateNewSlotModal from "./CreateNewSlotModal";
import TypicalWeekModal from "./TypicalWeekModal";

import {
  format,
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
  isToday,
  isValid,
  parseISO,
} from "date-fns";

type ClassSchedule = {
  id: string;
  class_name: string;
  start_time: string | null;
  end_time: string | null;
  max_participants: number;
  color: string;
};

type ClassType = {
  id: string;
  class_name: string;
  description: string | null;
  color: string;
};

type WeeklySchedule = {
  [key: string]: ClassSchedule[];
};

interface ClassCalendarProps {
  currentGymId: string;
}

const ClassCalendar: React.FC<ClassCalendarProps> = ({ currentGymId }) => {
  const [schedules, setSchedules] = useState<WeeklySchedule>({
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  });
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClassTypeModalOpen, setIsClassTypeModalOpen] = useState(false);
  const [isNewSlotModalOpen, setIsNewSlotModalOpen] = useState(false);
  const [isTypicalWeekModalOpen, setIsTypicalWeekModalOpen] = useState(false);
  const [isTypicalWeekMode, setIsTypicalWeekMode] = useState(false);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [selectedClassType, setSelectedClassType] = useState<ClassType | null>(null);
  const formatTime = (time: string | null) => {
    if (!time) return "Time not provided";
    const date = parseISO(time);
    return isValid(date) ? format(date, "h:mm a") : "Invalid time";
  };
  

  const fetchSchedules = async () => {
    const startDate = format(startOfWeek(weekStartDate, { weekStartsOn: 0 }), "yyyy-MM-dd");
    const endDate = format(addDays(new Date(startDate), 6), "yyyy-MM-dd");
  
    try {
      // Fetch schedules with reference to class_type_id
      const { data, error } = await supabase
        .from("class_schedules")
        .select("id, class_name, start_time, end_time, max_participants, class_type_id")
        .eq("current_gym_id", currentGymId)
        .gte("start_time", startDate)
        .lte("start_time", endDate);
  
      if (error) {
        console.error("Error fetching class schedules:", error.message);
        return;
      }
  
      // Fetch class types for color mapping
      const { data: classTypesData, error: classTypesError } = await supabase
        .from("class_types")
        .select("id, color")
        .eq("gym_id", currentGymId);
  
      if (classTypesError) {
        console.error("Error fetching class types:", classTypesError.message);
        return;
      }
  
      // Create a map of classTypeId to color for easy lookup
      const classTypeColorMap: { [key: string]: string } = {};
      classTypesData?.forEach((classType) => {
        classTypeColorMap[classType.id] = classType.color;
      });
  
      // Now enhance each schedule with the color from class types
      const groupedSchedules: WeeklySchedule = {
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
      };
  
      data?.forEach((schedule) => {
        const startTime = schedule.start_time ? parseISO(schedule.start_time) : null;
        if (startTime && isValid(startTime)) {
          const dayOfWeek = format(startTime, "EEEE").toLowerCase() as keyof WeeklySchedule;
          const color = classTypeColorMap[schedule.class_type_id] || "#000000"; // Default color if not found
          groupedSchedules[dayOfWeek].push({
            ...schedule,
            color, // Add the color to the schedule object
          });
        } else {
          console.warn("Skipping invalid schedule:", schedule);
        }
      });
  
      setSchedules(groupedSchedules);
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const fetchClassTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("class_types")
        .select("id, class_name, description, color")
        .eq("gym_id", currentGymId);

      if (error) {
        console.error("Error fetching class types:", error.message);
        return;
      }

      setClassTypes(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  useEffect(() => {
    const initializeWeekDates = () => {
      const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn: 0 });
      const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
      setWeekDates(dates);
    };

    initializeWeekDates();
    fetchSchedules();
    fetchClassTypes();
  }, [weekStartDate, currentGymId]);

  const goToPreviousWeek = () => setWeekStartDate((prevDate) => subWeeks(prevDate, 1));
  const goToNextWeek = () => setWeekStartDate((prevDate) => addWeeks(prevDate, 1));
  const toggleTypicalWeekMode = () => setIsTypicalWeekMode(!isTypicalWeekMode);

  const handleRefreshClassTypes = () => {
    fetchClassTypes();
  };

  const handleSelectClassType = (classType: ClassType) => {
    if (selectedClassType?.id === classType.id) {
      setSelectedClassType(null); // Deselect if clicking the same class type
    } else {
      setSelectedClassType(classType);
    }
  };

  return (
    <div className="class-calendar-container p-6">
      {/* Widgets */}
      {/* Widgets */}
      <div className="widget-container flex justify-between items-start py-6 space-x-6">
        
        {/* Week Selection Widget */}
        <div className="week-selection-widget bg-gray-900 text-white p-4 rounded-3xl shadow-md flex flex-col items-center justify-center w-1/4 h-32">
          <div className="flex items-center justify-between w-full px-4">
            <button onClick={goToPreviousWeek} className="text-blue-300 hover:text-blue-500 transition text-2xl">
              &lt;
            </button>
            <div className="flex flex-col items-center">
              <span className="week-label font-semibold text-md mb-1">Week Of</span>
              <span className="week-date text-lg font-bold">{format(weekStartDate, "dd MMM yy")}</span>
            </div>
            <button onClick={goToNextWeek} className="text-blue-300 hover:text-blue-500 transition text-2xl">
              &gt;
            </button>
          </div>
          <button
            onClick={() => setWeekStartDate(new Date())}
            className="text-blue-300 hover:text-blue-500 transition text-sm mt-2"
          >
            Today
          </button>
        </div>

        {/* Class Type Widget */}
        <div className="class-type-widget bg-gray-900 text-white p-6 rounded-3xl shadow-md w-1/2 h-32 flex flex-col justify-between">
          <h3 className="text-lg font-semibold mb-2">Class Types</h3>
          <ul className="flex flex-wrap items-center space-x-4">
            {classTypes.map((classType) => (
              <li
                key={classType.id}
                onClick={() => handleSelectClassType(classType)}
                className={`cursor-pointer px-2 py-1 rounded-full border-2 ${
                  selectedClassType?.id === classType.id
                    ? `border-${classType.color} bg-${classType.color} text-white`
                    : "border-transparent"
                } transition-all duration-300 ease-in-out`}
                style={{ borderColor: classType.color, color: selectedClassType?.id === classType.id ? "white" : classType.color }}
              >
                {classType.class_name}
              </li>
            ))}
            <li
              className="cursor-pointer text-blue-300 hover:text-blue-500 transition"
              onClick={() => setIsClassTypeModalOpen(true)}
            >
              + create new class type
            </li>
          </ul>
        </div>

        {/* Slot Widget */}
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
              onClick={() => setIsNewSlotModalOpen(true)}
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
              onClick={() => setIsTypicalWeekModalOpen(true)}
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

      </div>


      {/* Calendar Grid */}
      <div className="calendar-grid mt-6 overflow-auto">
        <div className="grid grid-cols-8 auto-rows-fr text-sm antialiased">
          {/* Header Row */}
          <div className="header-slot text-white p-4 text-center "></div>
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={`header-slot bg-gray-800 text-white p-4 text-center  ${
                index === 0 ? "rounded-tl-2xl" : index === 6 ? "rounded-tr-2xl" : ""
              }`} 
            >
              {format(date, "EEE MM/dd")}
            </div>
          ))}

          {/* Rows for Time Slots */}
          {Array.from({ length: 15 }, (_, i) => {
            const hour = 6 + i;
            const formattedHour = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
            return (
              <React.Fragment key={i}>
                {/* Time Slot */}
                <div className="time-slot p-4 border text-gray-500 text-center bg-gray-100 ">
                  {formattedHour}
                </div>
                {/* Day Columns for Each Time Slot */}
                {weekDates.map((date, index) => (
                  <div
                    key={`${i}-${index}`}
                    className="day-slot border h-20 bg-white "
                  >
                    {schedules[format(date, "EEEE").toLowerCase() as keyof WeeklySchedule]
                      .filter(
                        (schedule) =>
                          parseISO(schedule.start_time ?? "").getHours() === hour
                      )
                      .map((schedule) => (
                        <div
                          key={schedule.id}
                          className="schedule-item p-1 rounded mb-2"
                          style={{
                            borderLeftColor: schedule.color || "#000",
                            borderLeftWidth: "4px",
                            height: '100%'
                          }}
                        >
                          <div
                            className=""
                            style={{ color: schedule.color }}
                          >
                            {schedule.class_name}
                          </div>
                          <pre className="text-sm tracking-tighter">
                            {formatTime(schedule.start_time)} -{" "}
                            {formatTime(schedule.end_time)}
                          </pre>
                          <pre className="text-sm">
                            Max: {schedule.max_participants}
                          </pre>
                        </div>
                      ))}
                  </div>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Modal Components */}
      {isModalOpen && (
        <CreateClassModal onClose={() => setIsModalOpen(false)} currentGymId={currentGymId} isVisible={isModalOpen} />
      )}
      {isClassTypeModalOpen && (
        <CreateClassTypeModal
          onClose={() => setIsClassTypeModalOpen(false)}
          currentGymId={currentGymId}
          isVisible={isClassTypeModalOpen}
          refreshClassTypes={handleRefreshClassTypes}
        />
      )}
      {isNewSlotModalOpen && selectedClassType && (
        <CreateNewSlotModal
          onClose={() => setIsNewSlotModalOpen(false)}
          classType={selectedClassType}
          currentGymId={currentGymId}
          refreshSchedules={fetchSchedules}
        />
      )}
      {isTypicalWeekModalOpen && selectedClassType && (
        <TypicalWeekModal
          onClose={() => setIsTypicalWeekModalOpen(false)}
          classType={selectedClassType}
          currentGymId={currentGymId}
          refreshSchedules={fetchSchedules}
        />
      )}
    </div>
  );
};

export default ClassCalendar;
