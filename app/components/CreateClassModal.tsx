import React, { useState } from "react";

interface CreateClassModalProps {
  onClose: () => void;
  currentGymId: string;
  isVisible: boolean; // Controls slide-in and slide-out animations
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({
  onClose,
  currentGymId,
  isVisible,
}) => {
  const [className, setClassName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [isRecurring, setIsRecurring] = useState(false);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating class:", {
      className,
      startDate,
      endDate,
      maxParticipants,
      isRecurring,
      currentGymId,
    });

    // Implement your API call to save the class here

    onClose();
  };

  return (
    <>
      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div
        className={`fixed right-0 top-0 bg-white w-full max-w-md p-6 rounded-l-lg shadow-xl transition-transform duration-300 z-50 ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Create Class</h2>
        <form onSubmit={handleCreateClass}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Class Name</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Class Name"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Start Time</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">End Time</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Max Participants</label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
              min="1"
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              id="recurring"
              className="mr-2"
            />
            <label htmlFor="recurring" className="font-medium">
              Recurring Class
            </label>
          </div>

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
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateClassModal;
