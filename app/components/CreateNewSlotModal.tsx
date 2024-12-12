"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import BaseModal from "./BaseModal";

interface CreateNewSlotModalProps {
  onClose: () => void;
  currentGymId: string;
  classType: {
    id: string;
    class_name: string;
    color: string;
  };
  refreshSchedules: () => void;
}

const CreateNewSlotModal: React.FC<CreateNewSlotModalProps> = ({
  onClose,
  currentGymId,
  classType,
  refreshSchedules,
}) => {
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [maxParticipants, setMaxParticipants] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSlot = async () => {
    setIsSubmitting(true);
    setError(null);

    if (!date || !startTime || !endTime) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const startDateTime = `${date}T${startTime}`;
      const endDateTime = `${date}T${endTime}`;

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
        setError(insertError.message);
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
      <h2 className="text-xl font-semibold mb-4">Create a New Slot</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleCreateSlot();
      }}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Date</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="YYYY-MM-DD"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">Start Time</label>
          <input
            type="time"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="HH:MM"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">End Time</label>
          <input
            type="time"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="HH:MM"
          />
          <p className="text-xs text-gray-500 mt-1">
            Select times in 24-hour or AM/PM format, depending on your browser’s time input support.
          </p>
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
        
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
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

export default CreateNewSlotModal;
