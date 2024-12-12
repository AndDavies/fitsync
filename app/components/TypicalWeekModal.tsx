// components/TypicalWeekModal.tsx
"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { format, addWeeks, parseISO, isValid } from "date-fns";
import BaseModal from "./BaseModal";

interface TypicalWeekModalProps {
  onClose: () => void;
  currentGymId: string;
  classType: {
    id: string;
    class_name: string;
    color: string;
  };
  refreshSchedules: () => void;
}

const TypicalWeekModal: React.FC<TypicalWeekModalProps> = ({
  onClose,
  currentGymId,
  classType,
  refreshSchedules,
}) => {
  const [startDate, setStartDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [maxParticipants, setMaxParticipants] = useState<number>(10);
  const [weeksCount, setWeeksCount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTypicalWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!startDate || !startTime || !endTime || weeksCount <= 0) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const startDateObject = parseISO(startDate);

      if (!isValid(startDateObject)) {
        setError("Invalid start date. Please enter a valid date.");
        setIsSubmitting(false);
        return;
      }

      let encounteredError = null;
      for (let i = 0; i < weeksCount; i++) {
        const newWeekDate = addWeeks(startDateObject, i);
        const startDateTime = `${format(newWeekDate, "yyyy-MM-dd")}T${startTime}`;
        const endDateTime = `${format(newWeekDate, "yyyy-MM-dd")}T${endTime}`;

        const { error: insertError } = await supabase
          .from("class_schedules")
          .insert([{
            current_gym_id: currentGymId,
            class_name: classType.class_name,
            start_time: startDateTime,
            end_time: endDateTime,
            max_participants: maxParticipants,
            class_type_id: classType.id,
          }]);

        if (insertError) {
          encounteredError = insertError.message;
          break;
        }
      }

      if (encounteredError) {
        setError(encounteredError);
      } else {
        refreshSchedules();
        onClose();
      }
    } catch {
      setError("Unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal isVisible={true} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">Create Typical Week Slots</h2>
      <form onSubmit={handleCreateTypicalWeek}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Start Date</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">Start Time</label>
          <input
            type="time"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">End Time</label>
          <input
            type="time"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">Max Participants</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            min="1"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">Number of Weeks</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={weeksCount}
            onChange={(e) => setWeeksCount(Number(e.target.value))}
            min="1"
          />
        </div>
        
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        
        <div className="flex justify-end">
          <button
            type="button"
            className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default TypicalWeekModal;
