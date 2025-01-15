"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "../../components/Header";
import GymGuard from "../../components/GymGuard";
import ClassCalendar from "../../components/ClassCalendar";
import SideDrawer from "../../components/SideDrawer";
import AddClassesDrawer from "../../components/AddClassesDrawer";
import CreateClassTypeModal from "../../components/CreateClassTypeModal";
import ClassRegistrationDrawer from "../../components/ClassRegistrationDrawer";
import { createClient } from "@/utils/supabase/client"; // Browser Supabase client
import { format, startOfWeek, addDays, subWeeks, addWeeks } from "date-fns";
import WeekSelector from "../../components/WeekSelector";

type UserProfile = {
  user_id: string;
  role?: string;
  current_gym_id?: string;
  [key: string]: any; // other fields as needed
};

type ClassSchedule = {
  id: string;
  class_name: string;
  start_time: string | null;
  end_time: string | null;
  max_participants: number;
  color: string;
  confirmed_count?: number;
  class_type_id?: string;
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

interface ClassesClientProps {
  userProfile: UserProfile;
}

export default function ClassesClient({ userProfile }: ClassesClientProps) {
  const supabase = createClient(); // Our browser client instance

  // Local state
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
  const [selectedClassType, setSelectedClassType] = useState<ClassType | null>(
    null
  );
  const [selectedClassForRegistration, setSelectedClassForRegistration] =
    useState<ClassSchedule | null>(null);
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClassTypeModalOpen, setIsClassTypeModalOpen] = useState(false);
  const [isRegistrationDrawerOpen, setIsRegistrationDrawerOpen] = useState(false);

  const canManageUsers =
    userProfile.role === "admin" || userProfile.role === "coach";

  // 1) Fetch class schedules
  const fetchSchedules = useCallback(async () => {
    if (!userProfile?.current_gym_id) return;

    const currentGymId = userProfile.current_gym_id;
    const startDate = new Date(
      startOfWeek(weekStartDate, { weekStartsOn: 0 }).setHours(0, 0, 0, 0)
    ).toISOString();
    const endDate = new Date(
      addDays(startOfWeek(weekStartDate, { weekStartsOn: 0 }), 6).setHours(
        23,
        59,
        59,
        999
      )
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

    const classIds = (schedulesData || []).map((cls) => cls.id);
    let countsMap = new Map<string, number>();

    if (classIds.length > 0) {
      const { data: regData, error: regError } = await supabase
        .from("class_registrations")
        .select("class_schedule_id, status")
        .eq("status", "confirmed")
        .in("class_schedule_id", classIds);

      if (!regError && regData) {
        regData.forEach((row) => {
          const prevCount = countsMap.get(row.class_schedule_id) || 0;
          countsMap.set(row.class_schedule_id, prevCount + 1);
        });
      } else if (regError) {
        console.error("Error fetching registrations:", regError.message);
      }
    }

    // 2) fetch class types for color mapping
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

    // 3) Group schedules by day
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
        const color =
          classTypeColorMap[schedule.class_type_id || ""] || "#000000";

        groupedSchedules[dayStr].push({
          ...schedule,
          color,
          confirmed_count: countsMap.get(schedule.id) || 0,
        });
      }
    });

    setSchedules(groupedSchedules);
  }, [weekStartDate, userProfile, supabase]);

  // 4) Fetch class types
  const fetchClassTypes = useCallback(async () => {
    if (!userProfile?.current_gym_id) return;

    const { data, error } = await supabase
      .from("class_types")
      .select("id, class_name, description, color")
      .eq("gym_id", userProfile.current_gym_id);

    if (!error) {
      setClassTypes(data || []);
    } else {
      console.error("Error fetching class types:", error.message);
    }
  }, [userProfile, supabase]);

  // 5) Initialize the array of 7 dates for the chosen week
  const initializeWeekDates = useCallback(() => {
    const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn: 0 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    setWeekDates(dates);
  }, [weekStartDate]);

  // 6) On mount or when userProfile changes
  useEffect(() => {
    if (userProfile?.user_id) {
      initializeWeekDates();
      fetchSchedules();
      fetchClassTypes();
    }
  }, [
    userProfile,
    weekStartDate,
    initializeWeekDates,
    fetchSchedules,
    fetchClassTypes,
  ]);

  // 7) Next/prev week
  const goToPreviousWeek = () => setWeekStartDate((prev) => subWeeks(prev, 1));
  const goToNextWeek = () => setWeekStartDate((prev) => addWeeks(prev, 1));

  // For use after scheduling or canceling classes
  const refreshSchedules = () => {
    fetchSchedules();
  };

  // Clicking a class on the calendar
  const handleClassClick = (cls: ClassSchedule) => {
    setSelectedClassForRegistration(cls);
    setIsRegistrationDrawerOpen(true);
  };

  // If for some reason the user has no user_id, fallback:
  if (!userProfile?.user_id) {
    return (
      <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center font-medium">
          You are not logged in.
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Top row: Week Selector, Class Types, and (optionally) Schedule Button */}
        <div className="flex flex-wrap lg:flex-nowrap items-start gap-6">
          {/* WEEK SELECTOR */}
          <div className="flex-initial bg-gray-900 rounded-xl shadow">
            <WeekSelector
              weekStartDate={weekStartDate}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              onToday={() => setWeekStartDate(new Date())}
            />
          </div>

          {/* CLASS TYPES */}
          <div className="flex-1 bg-gray-800 text-gray-200 p-4 h-32 rounded-xl shadow border border-gray-700">
            <h3 className="text-sm font-semibold border-b border-gray-700 pb-2">
              Class Types
            </h3>
            <ul className="flex flex-wrap gap-2 mt-2">
              {classTypes.map((ct) => (
                <li
                  key={ct.id}
                  onClick={() =>
                    canManageUsers &&
                    setSelectedClassType(
                      selectedClassType?.id === ct.id ? null : ct
                    )
                  }
                  className={`cursor-pointer px-3 py-1 rounded-full border-2 transition duration-300 ease-in-out text-sm font-medium ${
                    selectedClassType?.id === ct.id
                      ? "text-white bg-pink-600 border-pink-600"
                      : "text-gray-200 border-gray-600 hover:border-pink-500 hover:text-pink-300"
                  }`}
                  style={{
                    borderColor:
                      selectedClassType?.id === ct.id ? ct.color : undefined,
                    backgroundColor:
                      selectedClassType?.id === ct.id ? ct.color : undefined,
                  }}
                >
                  {ct.class_name}
                </li>
              ))}
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

          {/* SCHEDULE CLASSES BUTTON (if admin/coach & classType selected) */}
          {selectedClassType && canManageUsers && (
            <div className="flex-initial flex items-center justify-center">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
              >
                Schedule Classes
              </button>
            </div>
          )}
        </div>

        {/* CALENDAR DISPLAY */}
        <div className="flex-grow bg-gray-800 rounded-xl shadow p-4 border border-gray-700">
          <GymGuard userProfile={userProfile}>
            <ClassCalendar
              schedules={schedules}
              weekDates={weekDates}
              onClassClick={handleClassClick}
            />
          </GymGuard>
        </div>
      </main>

      <footer className="bg-gray-800 text-center py-4 shadow-inner text-sm text-gray-400 border-t border-gray-700">
        &copy; 2024 FitSync. All rights reserved.
      </footer>

      {/* Side Drawer for Adding Classes */}
      {canManageUsers && (
        <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
          {selectedClassType && (
            <AddClassesDrawer
              classType={selectedClassType}
              currentGymId={userProfile.current_gym_id!}
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
          currentGymId={userProfile.current_gym_id!}
          isVisible={isClassTypeModalOpen}
          refreshClassTypes={fetchClassTypes}
        />
      )}

      {/* Class Registration Drawer */}
      {selectedClassForRegistration && (
        <ClassRegistrationDrawer
          classSchedule={selectedClassForRegistration}
          userData={{ user_id: userProfile.user_id }}
          isOpen={isRegistrationDrawerOpen}
          onClose={() => setIsRegistrationDrawerOpen(false)}
          refreshSchedules={refreshSchedules}
        />
      )}
    </div>
  );
}