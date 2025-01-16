"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import SideDrawer from "./SideDrawer";

type ClassSchedule = {
  id: string;
  class_name: string;
  start_time: string | null;
  end_time: string | null;
  max_participants: number;
};

interface ClassRegistrationDrawerProps {
  classSchedule: ClassSchedule;
  userData: {
    user_id: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
  refreshSchedules: () => void;
}

export default function ClassRegistrationDrawer({
  classSchedule,
  userData,
  isOpen,
  onClose,
  refreshSchedules,
}: ClassRegistrationDrawerProps) {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);
  const [userStatus, setUserStatus] = useState<"confirmed" | "waitlisted" | "none">("none");

  useEffect(() => {
    if (classSchedule) {
      fetchConfirmedCount();
      fetchUserStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classSchedule]);

  const fetchConfirmedCount = async () => {
    if (!classSchedule?.id) return;
    const { data, error } = await supabase
      .from("class_registrations")
      .select("id", { count: "exact" })
      .eq("class_schedule_id", classSchedule.id)
      .eq("status", "confirmed");

    if (!error && data) {
      setConfirmedCount(data.length);
    }
  };

  const fetchUserStatus = async () => {
    if (!userData.user_id) return;
    if (!classSchedule?.id) return;

    const { data, error } = await supabase
      .from("class_registrations")
      .select("status")
      .eq("class_schedule_id", classSchedule.id)
      .eq("user_profile_id", userData.user_id)
      .maybeSingle();

    if (error && error.code === "PGRST116") {
      // no record found
      setUserStatus("none");
    } else if (!error && data) {
      setUserStatus(data.status === "confirmed" ? "confirmed" : "waitlisted");
    } else {
      setUserStatus("none");
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    const res = await fetch("/api/class/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ class_schedule_id: classSchedule.id }),
    });

    const result = await res.json();
    setLoading(false);
    if (res.ok) {
      setUserStatus(result.status); // 'confirmed' or 'waitlisted'
      refreshSchedules();
    } else {
      alert(result.error || "Failed to register");
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    const res = await fetch("/api/class/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ class_schedule_id: classSchedule.id }),
    });

    const result = await res.json();
    setLoading(false);
    if (res.ok) {
      setUserStatus("none");
      refreshSchedules();
    } else {
      alert(result.error || "Failed to cancel registration");
    }
  };

  const spotsAvailable =
    confirmedCount !== null && confirmedCount < classSchedule.max_participants;

  return (
    <SideDrawer isOpen={isOpen} onClose={onClose}>
      <div className="p-4 bg-background text-foreground h-full flex flex-col">
        <h2 className="text-xl font-bold mb-2">{classSchedule.class_name}</h2>
        {classSchedule.start_time && (
          <p className="text-sm text-muted-foreground">
            {new Date(classSchedule.start_time).toLocaleString()}
          </p>
        )}
        {confirmedCount !== null && (
          <p className="text-sm text-muted-foreground mt-1">
            {confirmedCount} / {classSchedule.max_participants} confirmed
          </p>
        )}

        <div className="mt-4">
          {userStatus === "none" && (
            <>
              {spotsAvailable ? (
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition"
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition"
                >
                  {loading ? "Joining Waitlist..." : "Join Waitlist"}
                </button>
              )}
            </>
          )}

          {userStatus === "confirmed" && (
            <div className="mt-3">
              <p className="text-sm text-accent">You are confirmed!</p>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition mt-2"
              >
                {loading ? "Cancelling..." : "Cancel Registration"}
              </button>
            </div>
          )}

          {userStatus === "waitlisted" && (
            <div className="mt-3">
              <p className="text-sm text-accent">You are waitlisted.</p>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition mt-2"
              >
                {loading ? "Cancelling..." : "Cancel Registration"}
              </button>
            </div>
          )}
        </div>
      </div>
    </SideDrawer>
  );
}