import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";

type ClassSchedule = {
  id: string;
  class_name: string;
  start_time: string;
  end_time: string;
  max_participants: number;
};

const ClassesTodayWidget: React.FC = () => {
  const { userData, isLoading } = useAuth();
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      if (isLoading) {
        return;
      }

      if (!userData?.current_gym_id) {
        setError("No gym associated with your account.");
        setLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split("T")[0]; // Get today's date (YYYY-MM-DD)

        const { data, error } = await supabase
          .from("class_schedules")
          .select(`
            id,
            class_name,
            start_time,
            end_time,
            max_participants
          `)
          .eq("current_gym_id", userData.current_gym_id)
          .gte("start_time", `${today}T00:00:00.000Z`)
          .lte("start_time", `${today}T23:59:59.999Z`);

        if (error) {
          setError("Failed to load class schedules.");
          return;
        }

        if (!data || data.length === 0) {
          setError("No classes found for today.");
        } else {
          setClasses(data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [isLoading, userData?.current_gym_id]);

  if (isLoading || loading) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-3xl shadow-md flex flex-col items-center justify-center w-1/4 h-32">
        <p>Loading classes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-3xl shadow-md flex flex-col items-center justify-center w-1/4 h-32">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white p-4 rounded-3xl shadow-md flex flex-col items-center justify-between w-1/4 h-56">
      <div className="flex flex-col items-center mb-2">
        <span className="text-md font-semibold">Classes Scheduled For</span>
        <span className="text-lg font-bold">{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
      </div>
      <ul className="w-full px-4 overflow-y-auto space-y-2">
        {classes.map((cls) => (
          <li
            key={cls.id}
            className="bg-gray-800 p-3 rounded-lg shadow-sm flex flex-col"
          >
            <div className="text-lg font-bold">{cls.class_name}</div>
            <div className="text-sm text-gray-400">
              {format(new Date(cls.start_time), "h:mm a")} -{" "}
              {format(new Date(cls.end_time), "h:mm a")}
            </div>
            <div className="text-sm">Max Participants: {cls.max_participants}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassesTodayWidget;
