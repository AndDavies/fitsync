"use client";

import { useEffect, useState } from "react";

interface ClassRegistration {
  id: string;
  user_profile_id: string;
  registration_date: string;
  status: string;
  user_profiles?: {
    display_name?: string;
  };
}

interface ClassSchedule {
  id: string;
  class_name: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  // Use 'class_registrations' to match your new API data:
  class_registrations?: ClassRegistration[];
}

export default function ClassDashboardWidget() {
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes/fetch");
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch classes");
        }
        const jsonData = await res.json();
        setClasses(jsonData.classes || []);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchClasses();
  }, []);

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (classes.length === 0) {
    return <p>No upcoming classes.</p>;
  }

  return (
    <div className="bg-gray-800 p-4 text-gray-200 rounded-md">
      <h2 className="text-xl font-bold mb-4">Upcoming Classes</h2>
      <ul className="space-y-4">
        {classes.map((cls) => {
          // Safely get the array from 'class_registrations' (fallback to empty array).
          const registrations = cls.class_registrations ?? [];
          const currentParticipants = registrations.filter(
            (r) => r.status === "confirmed"
          );

          return (
            <li key={cls.id} className="bg-gray-700 p-4 rounded-md shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{cls.class_name}</h3>
                <span className="text-sm text-gray-400">
                  {new Date(cls.start_time).toLocaleString()} -{" "}
                  {new Date(cls.end_time).toLocaleTimeString()}
                </span>
              </div>

              <p className="text-sm text-gray-400">
                Max participants: {cls.max_participants}
              </p>

              {currentParticipants.length > 0 ? (
                <div className="mt-2 text-sm">
                  <p className="font-medium mb-1">
                    {currentParticipants.length} attendees
                  </p>
                  <ul className="list-none space-y-1 pl-2">
                    {currentParticipants.map((reg) => (
                      <li key={reg.id} className="text-gray-300">
                        -{" "}
                        {reg.user_profiles?.display_name
                          ? reg.user_profiles.display_name
                          : reg.user_profile_id}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-400">
                  No confirmed registrations yet
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
