"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import "../styles/CalendarStyles.css";
import { format, startOfWeek, addDays, subWeeks, addWeeks, isToday, isValid, parseISO } from "date-fns";
import CreateClassModal from "./CreatClassModal";
import CreateClassTypeModal from "./CreateClassTypeModal";

type ClassSchedule = {
  id: string;
  class_name: string;
  start_time: string | null;
  end_time: string | null;
  max_participants: number;
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
  const [isTypicalWeekMode, setIsTypicalWeekMode] = useState(false);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);

  const fetchSchedules = async () => {
    const startDate = format(startOfWeek(weekStartDate, { weekStartsOn: 0 }), "yyyy-MM-dd");
    const endDate = format(addDays(new Date(startDate), 6), "yyyy-MM-dd");

    try {
      const { data, error } = await supabase
        .from("class_schedules")
        .select("id, class_name, start_time, end_time, max_participants")
        .eq("current_gym_id", currentGymId)
        .gte("start_time", startDate)
        .lte("start_time", endDate);

      if (error) {
        console.error("Error fetching class schedules:", error.message);
        return;
      }

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
          groupedSchedules[dayOfWeek].push(schedule);
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

  const formatTime = (time: string | null) => {
    if (!time) return "Time not provided";
    const date = parseISO(time);
    return isValid(date) ? format(date, "hh:mm a") : "Invalid time";
  };

  const handleRefreshClassTypes = () => {
    fetchClassTypes();
  };

  return (
    <div className="class-calendar-container">
      {/* Widgets */}
      <div className="widget-container flex justify-between items-center py-4 px-6">
        {/* Week Selection Widget */}
        <div className="week-selection-widget">
          <button onClick={goToPreviousWeek} className="text-blue-500 hover:text-blue-700 transition">
            &#8592; Previous Week
          </button>
          <span className="week-label mx-4">
            {isTypicalWeekMode ? "Typical Week Setup" : `Week of ${format(weekStartDate, "MMMM d, yyyy")}`}
          </span>
          <button onClick={goToNextWeek} className="text-blue-500 hover:text-blue-700 transition">
            Next Week &#8594;
          </button>
        </div>

        {/* Class Type Widget */}
        <div className="class-type-widget">
          <div className="bg-white p-4 rounded shadow-lg w-full">
            <h3 className="text-lg font-semibold mb-2">Class Types</h3>
            <ul>
              {classTypes.map((classType) => (
                <li key={classType.id} style={{ color: classType.color }}>
                  {classType.class_name}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsClassTypeModalOpen(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition mt-2"
            >
              Create New Class Type
            </button>
          </div>
        </div>

        {/* Slot Widget */}
        <div className="slot-widget">
          <button
            onClick={toggleTypicalWeekMode}
            className={`px-4 py-2 rounded ${
              isTypicalWeekMode ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
            } transition`}
          >
            {isTypicalWeekMode ? "Exit Typical Week" : "Typical Week"}
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid grid grid-cols-8 gap-2 p-4">
        {/* Time Slots on the Left */}
        <div className="time-slot-column border-2">
          {Array.from({ length: 15 }, (_, i) => {
            const hour = 6 + i;
            const formattedHour = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
            return (
              <div key={i} className="time-slot p-2 text-gray-500 border-b">
                {formattedHour}
              </div>
            );
          })}
        </div>

        {/* Day Columns */}
        {weekDates.map((date, index) => (
          <div
            key={index}
            className={`day-column border p-2 rounded h-full flex flex-col justify-between ${
              isToday(date) ? "bg-blue-100" : ""
            }`}
          >
            <div className="date-container">
              <div className="day-header font-bold">
                {format(date, "EEE")}
                {isTypicalWeekMode ? "" : ` - ${format(date, "dd MMM")}`}
              </div>
            </div>
            <div className="day-content-wrapper mt-2 flex-1 overflow-y-auto">
              {schedules[format(date, "EEEE").toLowerCase() as keyof WeeklySchedule]?.length > 0 ? (
                schedules[format(date, "EEEE").toLowerCase() as keyof WeeklySchedule].map((schedule) => (
                  <div key={schedule.id} className="schedule-item">
                    <div className="section">
                      <div className="section-header font-semibold text-purple-700">
                        {schedule.class_name}
                      </div>
                      <pre className="section-content text-sm">
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </pre>
                      <pre className="section-content text-sm">
                        Max Participants: {schedule.max_participants}
                      </pre>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-schedules text-sm text-gray-400">No classes</div>
              )}
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
};

export default ClassCalendar;
