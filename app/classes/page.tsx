"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import LeftNav from "../components/LeftNav";
import GymGuard from "../components/GymGuard";
import ClassCalendar from "../components/ClassCalendar";
import SideDrawer from "../components/SideDrawer";
import AddClassesDrawer from "../components/AddClassesDrawer";
import CreateClassTypeModal from "../components/CreateClassTypeModal";
import { supabase } from "@/utils/supabase/client";
import { format, startOfWeek, addDays, subWeeks, addWeeks } from "date-fns";
import WeekSelector from "../components/WeekSelector";

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

export default function ClassSchedulePage() {
  const { userData, isLoading } = useAuth();
  const [schedules, setSchedules] = useState<WeeklySchedule>({
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  });
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [selectedClassType, setSelectedClassType] = useState<ClassType | null>(null);
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClassTypeModalOpen, setIsClassTypeModalOpen] = useState(false);

  const fetchSchedules = useCallback(async () => {
    if (!userData?.current_gym_id) return;
    const currentGymId = userData.current_gym_id;
    const startDate = new Date(
      startOfWeek(weekStartDate, { weekStartsOn: 0 }).setHours(0, 0, 0, 0)
    ).toISOString();

    const endDate = new Date(
      addDays(startOfWeek(weekStartDate, { weekStartsOn: 0 }), 6).setHours(23, 59, 59, 999)
    ).toISOString();

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

    const { data: classTypesData, error: classTypesError } = await supabase
      .from("class_types")
      .select("id, color")
      .eq("gym_id", currentGymId);

    if (classTypesError) {
      console.error("Error fetching class types:", classTypesError.message);
      return;
    }

    const classTypeColorMap: { [key: string]: string } = {};
    classTypesData?.forEach((ct) => {
      classTypeColorMap[ct.id] = ct.color;
    });

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
      if (schedule.start_time) {
        const dayStr = format(new Date(schedule.start_time), "EEEE").toLowerCase() as keyof WeeklySchedule;
        const color = classTypeColorMap[schedule.class_type_id] || "#000000";
        groupedSchedules[dayStr].push({ ...schedule, color });
      }
    });

    setSchedules(groupedSchedules);
  }, [weekStartDate, userData]);

  const fetchClassTypes = useCallback(async () => {
    if (!userData?.current_gym_id) return;
    const { data, error } = await supabase
      .from("class_types")
      .select("id, class_name, description, color")
      .eq("gym_id", userData.current_gym_id);

    if (error) {
      console.error("Error fetching class types:", error.message);
      return;
    }

    setClassTypes(data || []);
  }, [userData]);

  const initializeWeekDates = useCallback(() => {
    const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn: 0 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    setWeekDates(dates);
  }, [weekStartDate]);

  useEffect(() => {
    if (!isLoading && userData) {
      initializeWeekDates();
      fetchSchedules();
      fetchClassTypes();
    }
  }, [isLoading, userData, weekStartDate, initializeWeekDates, fetchSchedules, fetchClassTypes]);

  const goToPreviousWeek = () => setWeekStartDate((prevDate) => subWeeks(prevDate, 1));
  const goToNextWeek = () => setWeekStartDate((prevDate) => addWeeks(prevDate, 1));

  const refreshSchedules = () => {
    fetchSchedules();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <div className="flex flex-grow">
          <LeftNav />
          <main className="flex flex-grow items-center justify-center">
            <p className="text-gray-700">You are not logged in.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-grow">
        <LeftNav />
        <main className="flex flex-grow flex-col p-6">
          {/* Week Selector */}
          <div className="widget-container flex justify-between items-start py-6 space-x-6">
            <WeekSelector
              weekStartDate={weekStartDate}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              onToday={() => setWeekStartDate(new Date())}
            />

            {/* Class Type Widget */}
            <div className="class-type-widget bg-white text-gray-800 p-6 rounded-md shadow-md w-1/2 h-32 flex flex-col justify-between border border-gray-300">
              <h3 className="text-lg font-semibold mb-2">Class Types</h3>
              <ul className="flex flex-wrap items-center space-x-4">
                {classTypes.map((ct) => {
                  const isSelected = selectedClassType?.id === ct.id;
                  return (
                    <li
                      key={ct.id}
                      onClick={() => setSelectedClassType(isSelected ? null : ct)}
                      className={`cursor-pointer px-2 py-1 rounded-full border-2 transition duration-300 ease-in-out text-sm font-medium ${
                        isSelected ? "text-white" : "text-gray-800"
                      }`}
                      style={{
                        borderColor: ct.color,
                        backgroundColor: isSelected ? ct.color : "transparent",
                      }}
                    >
                      {ct.class_name}
                    </li>
                  );
                })}
                <li
                  className="cursor-pointer text-blue-500 hover:text-blue-700 transition text-sm"
                  onClick={() => setIsClassTypeModalOpen(true)}
                >
                  + create new class type
                </li>
              </ul>
            </div>

            {/* Previously a slot widget? 
                We don't need separate 'New Slot' or 'Typical Week' buttons here now
                because we integrated into a single drawer approach.

                If you want a direct button, you can put a button here:
            */}
            <div className="w-1/4 h-32 flex items-center justify-center">
              {selectedClassType && (
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  Schedule Classes
                </button>
              )}
            </div>
          </div>

          {/* Calendar Display */}
          <div className="flex-grow">
            <GymGuard>
              <ClassCalendar schedules={schedules} weekDates={weekDates} />
            </GymGuard>
          </div>
        </main>
      </div>

      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>

      {/* Side Drawer for Adding Classes */}
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {selectedClassType && (
          <AddClassesDrawer
            classType={selectedClassType}
            currentGymId={userData.current_gym_id!}
            onClose={() => setIsDrawerOpen(false)}
            refreshSchedules={refreshSchedules}
          />
        )}
      </SideDrawer>

      {isClassTypeModalOpen && (
        <CreateClassTypeModal
          onClose={() => setIsClassTypeModalOpen(false)}
          currentGymId={userData.current_gym_id!}
          isVisible={isClassTypeModalOpen}
          refreshClassTypes={() => fetchClassTypes()}
        />
      )}
    </div>
  );
}
