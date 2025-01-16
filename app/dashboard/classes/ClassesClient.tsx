"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format, startOfWeek, addDays, subWeeks, addWeeks } from "date-fns";

// If you want to use ShadCN UI:
import { Button } from "@/components/ui/button";

// Components that you already have:
import GymGuard from "../../components/GymGuard";
import ClassCalendar from "../../components/ClassCalendar";
import SideDrawer from "../../components/SideDrawer";
import AddClassesDrawer from "../../components/AddClassesDrawer";
import CreateClassTypeModal from "../../components/CreateClassTypeModal";
import ClassRegistrationDrawer from "../../components/ClassRegistrationDrawer";
import WeekSelector from "../../components/WeekSelector";
import { ClassSchedule, ClassType, WeeklySchedule } from "@/app/types/classes";

interface ClassCalendarProps {
  schedules: WeeklySchedule;
  weekDates: Date[];
  onClassClick: (cls: ClassSchedule) => void;
}

// ----- TYPES -----
interface UserProfile {
  user_id: string;
  role?: string | null; // 'admin' | 'coach' or null
  current_gym_id?: string | null;
  [key: string]: any;
}

interface ClassesClientProps {
  userProfile: UserProfile;
}

// ----- MAIN COMPONENT -----
export default function ClassesClient({ userProfile }: ClassesClientProps) {
  // 1) Determine if user can manage classes
  const canManageUsers = userProfile.role === "admin" || userProfile.role === "coach";

  // 2) Local state
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

  const [selectedClassForRegistration, setSelectedClassForRegistration] =
    useState<ClassSchedule | null>(null);

  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  // UI drawers / modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClassTypeModalOpen, setIsClassTypeModalOpen] = useState(false);
  const [isRegistrationDrawerOpen, setIsRegistrationDrawerOpen] = useState(false);

  // 3) Initialize the array of 7 dates for the chosen week
  const initializeWeekDates = useCallback(() => {
    const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn: 0 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    setWeekDates(dates);
  }, [weekStartDate]);

  // 4) Fetch class schedules from an SSR-based endpoint
  const fetchSchedules = useCallback(async () => {
    if (!userProfile?.current_gym_id) return;
    try {
      const gymId = userProfile.current_gym_id;
      // build date range for the selected week
      const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn: 0 });
      const startDate = new Date(currentWeekStart.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(
        addDays(currentWeekStart, 6).setHours(23, 59, 59, 999)
      ).toISOString();

      const res = await fetch(
        `/api/classes/schedules?gymId=${gymId}&start=${startDate}&end=${endDate}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        console.error("Error fetching schedules from SSR route");
        return;
      }

      const data = await res.json();
      const schedulesData: ClassSchedule[] = data.schedules || [];

      // Group them by day
      const grouped: WeeklySchedule = {
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
      };

      schedulesData.forEach((sch) => {
        if (sch.start_time) {
          const dayStr = format(new Date(sch.start_time), "EEEE").toLowerCase();
          if (!grouped[dayStr]) {
            grouped[dayStr] = [];
          }
          grouped[dayStr].push(sch);
        }
      });

      setSchedules(grouped);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  }, [weekStartDate, userProfile]);

  // 5) Fetch class types similarly
  const fetchClassTypes = useCallback(async () => {
    if (!userProfile?.current_gym_id) return;
    try {
      const res = await fetch(`/api/classes/types?gymId=${userProfile.current_gym_id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        console.error("Error fetching class types from SSR route");
        return;
      }
      const data = await res.json();
      setClassTypes(data.classTypes || []);
    } catch (err) {
      console.error("Error fetching class types:", err);
    }
  }, [userProfile]);

  // 6) useEffects
  useEffect(() => {
    initializeWeekDates();
    fetchSchedules();
    fetchClassTypes();
  }, [weekStartDate, initializeWeekDates, fetchSchedules, fetchClassTypes]);

  // 7) Week nav
  const goToPreviousWeek = () => setWeekStartDate((prev) => subWeeks(prev, 1));
  const goToNextWeek = () => setWeekStartDate((prev) => addWeeks(prev, 1));
  const goToToday = () => setWeekStartDate(new Date());

  // 8) Refresh schedules
  const refreshSchedules = () => {
    fetchSchedules();
  };

  // 9) Handler when the user clicks on a class in the calendar
  const handleClassClick = (cls: ClassSchedule) => {
    setSelectedClassForRegistration(cls);
    setIsRegistrationDrawerOpen(true);
  };

  // 10) If there's no user_id, fallback
  if (!userProfile?.user_id) {
    return (
      <div className="bg-background text-foreground min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center font-medium">
          You are not logged in.
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex flex-col text-foreground">
      <main className="flex-grow flex flex-col space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Top row: week selector, class types, schedule button */}
        <div className="flex flex-wrap lg:flex-nowrap items-start gap-6">
          {/* Week Selector */}
          <div className="flex-initial bg-card rounded-xl shadow border border-border">
            <WeekSelector
              weekStartDate={weekStartDate}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              onToday={goToToday}
            />
          </div>

          {/* Class Types Panel */}
          <div className="flex-1 bg-card text-card-foreground p-4 h-32 rounded-xl shadow border border-border">
            <h3 className="text-sm font-semibold border-b border-border pb-2">
              Class Types
            </h3>
            <ul className="flex flex-wrap gap-2 mt-2">
              {classTypes.map((ct) => (
                <li
                  key={ct.id}
                  onClick={() => {
                    if (canManageUsers) {
                      setSelectedClassType((prev) =>
                        prev?.id === ct.id ? null : ct
                      );
                    }
                  }}
                  className={`cursor-pointer px-3 py-1 rounded-full border-2 transition text-sm font-medium ${
                    selectedClassType?.id === ct.id
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border text-foreground hover:border-accent hover:text-accent"
                  }`}
                  style={{
                    backgroundColor:
                      selectedClassType?.id === ct.id ? ct.color : undefined,
                  }}
                >
                  {ct.class_name}
                </li>
              ))}
              {/* Option to create new type */}
              {canManageUsers && (
                <li
                  className="cursor-pointer text-accent hover:underline transition text-sm font-medium"
                  onClick={() => setIsClassTypeModalOpen(true)}
                >
                  + new type
                </li>
              )}
            </ul>
          </div>

          {/* Schedule Classes Button */}
          {selectedClassType && canManageUsers && (
            <div className="flex-initial flex items-center justify-center">
              <Button
                onClick={() => setIsDrawerOpen(true)}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Schedule Classes
              </Button>
            </div>
          )}
        </div>

        {/* The Calendar */}
        <div className="flex-grow bg-card text-card-foreground rounded-xl shadow p-4 border border-border">
          <GymGuard userProfile={userProfile}>
            <ClassCalendar
              schedules={schedules}
              weekDates={weekDates}
              onClassClick={handleClassClick}
            />
          </GymGuard>
        </div>
      </main>

      <footer className="bg-secondary text-secondary-foreground text-center py-4 shadow-inner text-sm border-t border-border">
        &copy; 2024 FitSync. All rights reserved.
      </footer>

      {/* Add Classes Drawer */}
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

      {/* Create Class Type Modal */}
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