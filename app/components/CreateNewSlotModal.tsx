import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface CreateNewSlotModalProps {
  onClose: () => void;
  currentGymId: string;
  classType: {
    id: string;
    class_name: string;
    color: string;
  };
  refreshSchedules: () => void; // To refresh schedules after adding new slots
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

    // Ensure all required fields are filled
    if (!date || !startTime || !endTime) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const startDateTime = `${date}T${startTime}`;
      const endDateTime = `${date}T${endTime}`;

      // Insert the new class slot into the `class_schedules` table
      const { error } = await supabase
        .from("class_schedules")
        .insert([{
          current_gym_id: currentGymId,
          class_name: classType.class_name,
          start_time: startDateTime,
          end_time: endDateTime,
          max_participants: maxParticipants,
          class_type_id: classType.id,
        }]);

      if (error) {
        setError(error.message);
      } else {
        refreshSchedules(); // Refresh calendar after successful creation
        onClose(); // Close the modal upon success
      }
    } catch {
      setError("Unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Create a New Slot</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleCreateSlot();
        }}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Date</label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Start Time</label>
            <input
              type="time"
              className="w-full p-2 border border-gray-300 rounded"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">End Time</label>
            <input
              type="time"
              className="w-full p-2 border border-gray-300 rounded"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Max Participants</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              min="1"
            />
          </div>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNewSlotModal;
