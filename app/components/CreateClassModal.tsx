// components/CreateClassModal.tsx
"use client";

import React, { useState } from "react";
import BaseModal from "./BaseModal";

interface CreateClassModalProps {
  onClose: () => void;
  currentGymId: string;
  isVisible: boolean;
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
    // TODO: Implement API logic here and show toast on success/error
    onClose();
  };

  return (
    <BaseModal isVisible={isVisible} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">Create Class</h2>
      <form onSubmit={handleCreateClass}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Class Name</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Class Name"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">Start Time</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">End Time</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">Max Participants</label>
          <input
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            min="1"
          />
        </div>
        
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            id="recurring"
            className="mr-2 focus:ring-pink-500"
          />
          <label htmlFor="recurring" className="font-medium">Recurring Class</label>
        </div>
        
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
          >
            Create
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default CreateClassModal;
