"use client";

import { useEffect, useState } from "react";

interface ClassSchedule {
  id: string;
  class_name: string;
  start_time: string;
  end_time: string;
  max_participants: number;
}

interface ClassRegistration {
  id: string;
  user_profile_id: string;
  status: string;
  registration_date: string;
  class_schedules: ClassSchedule | null;
}

export default function UserRegistrationsWidget() {
  const [registrations, setRegistrations] = useState<ClassRegistration[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/classes/user-registered");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch user-registered classes");
        }
        const json = await res.json();
        setRegistrations(json.registrations || []);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchData();
  }, []);

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (registrations.length === 0) {
    return <p className="text-gray-400">No classes found.</p>;
  }

  return (
    <div className="bg-gray-800 p-4 text-gray-200 rounded-md">
      <h2 className="text-xl font-bold mb-4">Your Class Registrations</h2>
      <ul className="space-y-4 list-none">
        {registrations.map((reg) => {
          const cls = reg.class_schedules;
          if (!cls) return null;

          return (
            <li key={reg.id} className="bg-gray-700 p-4 rounded-md shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{cls.class_name}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(cls.start_time).toLocaleString()} -{" "}
                    {new Date(cls.end_time).toLocaleTimeString()}
                  </p>
                </div>
                <span className="text-sm">
                  Status:{" "}
                  <span className="font-medium text-pink-400">{reg.status}</span>
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Max participants: {cls.max_participants}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
