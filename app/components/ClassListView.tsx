"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import "../styles/CalendarStyles.css";
import WeekSelector from "./WeekSelector";
import Accordion from "./Accordion";
import ClassTypeWidget from "./ClassTypeWidget";
import SlotWidget from "./SlotWidget";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { useAuth } from "../context/AuthContext";

interface ClassSchedule {
  id: string;
  class_name: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  instructor_id: string | null;
  registered_count?: number;
  class_registrations?: { user_profile_id: string }[];
}

interface ListViewProps {
  currentGymId: string;
}

export type ClassType = {
  id: string;
  class_name: string;
  description?: string | null; // Optional field
  color: string;
};

const ClassListView: React.FC<ListViewProps> = ({ currentGymId }) => {
  const [schedules, setSchedules] = useState<{ [key: string]: ClassSchedule[] }>({});
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const { userData } = useAuth();
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [selectedClassType, setSelectedClassType] = useState<ClassType | null>(null);
  const [isClassTypeModalOpen, setIsClassTypeModalOpen] = useState(false);
  const [isNewSlotModalOpen, setIsNewSlotModalOpen] = useState(false);
  const [isTypicalWeekModalOpen, setIsTypicalWeekModalOpen] = useState(false);

  const fetchSchedules = useCallback(async () => {
    const startDate = new Date(
      startOfWeek(weekStartDate, { weekStartsOn: 0 }).setHours(0, 0, 0, 0)
    ).toISOString();

    const endDate = new Date(
      addDays(startOfWeek(weekStartDate, { weekStartsOn: 0 }), 6).setHours(23, 59, 59, 999)
    ).toISOString();

    try {
      const { data, error } = await supabase
        .from("class_schedules")
        .select("id, class_name, start_time, end_time, max_participants, instructor_id, class_registrations(user_profile_id)")
        .eq("current_gym_id", currentGymId)
        .gte("start_time", startDate)
        .lte("start_time", endDate);

      if (error) {
        console.error("Error fetching class schedules:", error.message);
        return;
      }

      const groupedSchedules: { [key: string]: ClassSchedule[] } = {};
      data?.forEach((schedule) => {
        const dayOfWeek = format(parseISO(schedule.start_time), "EEEE").toLowerCase();
        if (!groupedSchedules[dayOfWeek]) {
          groupedSchedules[dayOfWeek] = [];
        }
        groupedSchedules[dayOfWeek].push({
          ...schedule,
          registered_count: schedule.class_registrations ? schedule.class_registrations.length : 0,
        });
      });

      // Sort schedules by start time for each day
      Object.keys(groupedSchedules).forEach((day) => {
        groupedSchedules[day] = groupedSchedules[day].sort((a, b) => {
          return parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime();
        });
      });

      setSchedules(groupedSchedules);
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }, [weekStartDate, currentGymId]);

  useEffect(() => {
    const initializeWeekDates = () => {
      const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn: 0 });
      const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
      setWeekDates(dates);
    };

    initializeWeekDates();
    fetchSchedules();
  }, [weekStartDate, currentGymId, fetchSchedules]);

  const goToPreviousWeek = () => setWeekStartDate((prevDate) => addDays(prevDate, -7));
  const goToNextWeek = () => setWeekStartDate((prevDate) => addDays(prevDate, 7));

  const handleRegister = async (classId: string) => {
    try {
      const userId = userData?.user_id;
      if (!userId) {
        alert("You need to be logged in to register for a class.");
        return;
      }

      const { data, error } = await supabase
        .from("class_registrations")
        .insert({
          class_schedule_id: classId,
          user_profile_id: userId,
          registration_date: new Date().toISOString(),
        });

      if (error) {
        console.error("Error registering for class:", error.message);
        alert("Could not register for the class. Please try again.");
        return;
      }

      alert("Successfully registered for the class!");
      fetchSchedules(); // Refresh the schedules to reflect updated registration counts
    } catch (error) {
      console.error("Unexpected error while registering:", error);
    }
  };

  const handleLeaveClass = async (classId: string) => {
    try {
      const userId = userData?.user_id;
      if (!userId) {
        alert("You need to be logged in to leave a class.");
        return;
      }

      const { error } = await supabase
        .from("class_registrations")
        .delete()
        .eq("class_schedule_id", classId)
        .eq("user_profile_id", userId);

      if (error) {
        console.error("Error leaving class:", error.message);
        alert("Could not leave the class. Please try again.");
        return;
      }

      alert("Successfully left the class!");
      fetchSchedules(); // Refresh the schedules to reflect updated registration counts
    } catch (error) {
      console.error("Unexpected error while leaving class:", error);
    }
  };

  return (
    <div className="class-list-view-container p-6 border-6">
      {/* Week Selector */}
      <WeekSelector
        weekStartDate={weekStartDate}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onToday={() => setWeekStartDate(new Date())}
      />
      <ClassTypeWidget
        classTypes={classTypes}
        selectedClassType={selectedClassType}
        onSelect={setSelectedClassType}
        onCreateNew={() => setIsClassTypeModalOpen(true)}
      />
      <SlotWidget
        selectedClassType={selectedClassType}
        onNewSlot={() => setIsNewSlotModalOpen(true)}
        onTypicalWeek={() => setIsTypicalWeekModalOpen(true)}
      />

      {/* List View of Classes for the Week */}
      <div className="class-list mt-6">
        {weekDates.map((date, index) => {
          const dayKey = format(date, "EEEE").toLowerCase();
          const formattedDate = format(date, "EEEE - MM/dd");
          return (
            <div key={index} className="day-schedule mb-6">
              {/* Header Row Styling */}
              <Accordion title={formattedDate}>
              {schedules[dayKey] && schedules[dayKey].length > 0 ? (
                <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="text-left py-2 px-4 font-semibold">Start Time</th>
                      <th className="text-left py-2 px-4 font-semibold">End Time</th>
                      <th className="text-left py-2 px-4 font-semibold">Class Name</th>
                      <th className="text-left py-2 px-4 font-semibold">Registered/Max</th>
                      <th className="text-left py-2 px-4 font-semibold">Instructor</th>
                      <th className="text-left py-2 px-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules[dayKey].map((schedule) => {
                      const isUserRegistered = schedule.class_registrations?.some(
                        (registration) => registration.user_profile_id === userData?.user_id
                      );
                      return (
                        <tr
                          key={schedule.id}
                          className="border-b hover:bg-gray-100 transition duration-300 ease-in-out"
                        >
                          <td className="py-2 px-4">{format(parseISO(schedule.start_time), "h:mm a")}</td>
                          <td className="py-2 px-4">{format(parseISO(schedule.end_time), "h:mm a")}</td>
                          <td className="py-2 px-4">{schedule.class_name}</td>
                          <td className="py-2 px-4">
                            {schedule.registered_count || 0}/{schedule.max_participants}
                          </td>
                          <td className="py-2 px-4">{schedule.instructor_id ? schedule.instructor_id : "TBD"}</td>
                          <td className="py-2 px-4">
                            {isUserRegistered ? (
                              <button
                                className="px-4 py-1 text-white bg-red-500 rounded-md"
                                onClick={() => handleLeaveClass(schedule.id)}
                              >
                                Leave Class
                              </button>
                            ) : schedule.registered_count && schedule.registered_count >= schedule.max_participants ? (
                              <button className="px-4 py-1 text-white bg-gray-400 rounded-md cursor-not-allowed" disabled>
                                Full
                              </button>
                            ) : (
                              <button
                                className="px-4 py-1 text-white bg-blue-500 rounded-md"
                                onClick={() => handleRegister(schedule.id)}
                              >
                                Register
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No classes scheduled for this day.</p>
              )}
            </Accordion>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClassListView;
