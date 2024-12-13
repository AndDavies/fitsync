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
import ClassRegistrationDrawer from "../components/ClassRegistrationDrawer";
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
  confirmed_count?: number;
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
  const [selectedClassForRegistration, setSelectedClassForRegistration] = useState<ClassSchedule | null>(null); 
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClassTypeModalOpen, setIsClassTypeModalOpen] = useState(false);
  const [isRegistrationDrawerOpen, setIsRegistrationDrawerOpen] = useState(false);

  const canManageUsers = userData?.role === 'admin' || userData?.role === 'coach';

  const fetchSchedules = useCallback(async () => {
    if (!userData?.current_gym_id) return;
    const currentGymId = userData.current_gym_id;
    const startDate = new Date(
      startOfWeek(weekStartDate, { weekStartsOn: 0 }).setHours(0, 0, 0, 0)
    ).toISOString();
  
    const endDate = new Date(
      addDays(startOfWeek(weekStartDate, { weekStartsOn: 0 }), 6).setHours(23, 59, 59, 999)
    ).toISOString();
  
    const { data: schedulesData, error: schedulesError } = await supabase
      .from("class_schedules")
      .select("id, class_name, start_time, end_time, max_participants, class_type_id")
      .eq("current_gym_id", currentGymId)
      .gte("start_time", startDate)
      .lte("start_time", endDate);
  
    if (schedulesError) {
      console.error("Error fetching class schedules:", schedulesError.message);
      return;
    }
  
    const classIds = (schedulesData || []).map(cls => cls.id);
    
    let countsMap = new Map<string, number>();
    if (classIds.length > 0) {
      const { data: regData, error: regError } = await supabase
        .from('class_registrations')
        .select('class_schedule_id, status')
        .eq('status', 'confirmed')
        .in('class_schedule_id', classIds);
  
      if (regError) {
        console.error("Error fetching registrations:", regError.message);
      } else {
        regData?.forEach(row => {
          const prevCount = countsMap.get(row.class_schedule_id) || 0;
          countsMap.set(row.class_schedule_id, prevCount + 1);
        });
      }
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
  
    schedulesData?.forEach((schedule) => {
      if (schedule.start_time) {
        const dayStr = format(new Date(schedule.start_time), "EEEE").toLowerCase() as keyof WeeklySchedule;
        const color = classTypeColorMap[schedule.class_type_id] || "#000000";
        groupedSchedules[dayStr].push({
          ...schedule,
          color,
          confirmed_count: countsMap.get(schedule.id) || 0
        });
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

  const handleClassClick = (cls: ClassSchedule) => {
    setSelectedClassForRegistration(cls);
    setIsRegistrationDrawerOpen(true);
  };

  if (isLoading) {
    return <div className="bg-gray-900 text-gray-200 h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!userData) {
    return (
      <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-grow">
          <LeftNav />
          <main className="flex flex-grow items-center justify-center font-medium">
            You are not logged in.
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow">
        <LeftNav />
        <main className="flex flex-grow flex-col p-8 space-y-8">
          {/* Week Selector */}
          <div className="widget-container flex justify-between items-start gap-6">
          
            <WeekSelector
              weekStartDate={weekStartDate}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              onToday={() => setWeekStartDate(new Date())}
            />

            {/* Class Type Widget */}
            <div className="class-type-widget bg-gray-800 text-gray-200 p-4 rounded-xl shadow w-1/2 h-32 flex flex-col justify-between border border-gray-700">
              <h3 className="text-md font-semibold mb-2 border-b border-gray-700 pb-2">Class Types</h3>
              <ul className="flex flex-wrap items-center space-x-3">
                {classTypes.map((ct) => {
                  const isSelected = selectedClassType?.id === ct.id;
                  return (
                    <li
                      key={ct.id}
                      onClick={() => {
                        if (canManageUsers) {
                          setSelectedClassType(isSelected ? null : ct);
                        }
                      }}
                      className={`cursor-pointer px-3 py-1 rounded-full border-2 transition duration-300 ease-in-out text-sm font-medium ${
                        isSelected ? "text-white bg-pink-600 border-pink-600" : "text-gray-200 border-gray-600 hover:border-pink-500 hover:text-pink-300"
                      }`}
                      style={{
                        borderColor: isSelected ? ct.color : undefined,
                        backgroundColor: isSelected ? ct.color : undefined,
                      }}
                    >
                      {ct.class_name}
                    </li>
                  );
                })}
                {canManageUsers && (
                  <li
                    className="cursor-pointer text-pink-400 hover:text-pink-300 transition text-sm font-medium"
                    onClick={() => setIsClassTypeModalOpen(true)}
                  >
                    + new type
                  </li>
                )}
              </ul>
            </div>

            <div className="w-1/4 h-32 flex items-center justify-center">
              {selectedClassType && canManageUsers && (
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-4 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                >
                  Schedule Classes
                </button>
              )}
            </div>
          </div>

          {/* Calendar Display */}
          <div className="flex-grow bg-gray-800 rounded-xl shadow p-4 border border-gray-700">
            <GymGuard>
              <ClassCalendar schedules={schedules} weekDates={weekDates} onClassClick={handleClassClick} />
            </GymGuard>
          </div>
        </main>
      </div>

      <footer className="bg-gray-800 text-center py-4 shadow-inner text-sm text-gray-400 border-t border-gray-700">
        &copy; 2024 FitSync. All rights reserved.
      </footer>

      {/* Side Drawer for Adding Classes */}
      {canManageUsers && (
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
      )}

      {/* Class Type Modal */}
      {canManageUsers && isClassTypeModalOpen && (
        <CreateClassTypeModal
          onClose={() => setIsClassTypeModalOpen(false)}
          currentGymId={userData.current_gym_id!}
          isVisible={isClassTypeModalOpen}
          refreshClassTypes={() => fetchClassTypes()}
        />
      )}

      {/* Class Registration Drawer */}
      {selectedClassForRegistration && (
        <ClassRegistrationDrawer
          classSchedule={selectedClassForRegistration}
          userData={userData}
          isOpen={isRegistrationDrawerOpen}
          onClose={() => setIsRegistrationDrawerOpen(false)}
          refreshSchedules={refreshSchedules}
        />
      )}
    </div>
  );
}
