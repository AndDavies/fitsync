import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { format, addWeeks, parseISO, isValid } from "date-fns";

interface TypicalWeekModalProps {
  onClose: () => void;
  currentGymId: string;
  classType: {
    id: string;
    class_name: string;
    color: string;
  };
  refreshSchedules: () => void; // To refresh schedules after adding slots
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

      for (let i = 0; i < weeksCount; i++) {
        const newWeekDate = addWeeks(startDateObject, i);
        const startDateTime = `${format(newWeekDate, "yyyy-MM-dd")}T${startTime}`;
        const endDateTime = `${format(newWeekDate, "yyyy-MM-dd")}T${endTime}`;

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
          break;
        }
      }

      if (!error) {
        refreshSchedules(); // Refresh calendar after successful creation
        onClose(); // Close the modal upon success
      }
    } catch (e) {
      setError("Unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Create Typical Week Slots</h2>
        <form onSubmit={handleCreateTypicalWeek}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Start Date</label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
          <div className="mb-4">
            <label className="block mb-2 font-medium">Number of Weeks</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded"
              value={weeksCount}
              onChange={(e) => setWeeksCount(Number(e.target.value))}
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

export default TypicalWeekModal;
