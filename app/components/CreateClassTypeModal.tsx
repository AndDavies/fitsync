// components/CreateClassTypeModal.tsx
"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import BaseModal from "./BaseModal";

interface CreateClassTypeModalProps {
  onClose: () => void;
  currentGymId: string;
  isVisible: boolean;
  refreshClassTypes: () => void;
}

const availableColors = [
  "#8e44ad", "#a29bfe", "#74b9ff", "#55efc4",
  "#b2bec3", "#ffeaa7", "#fed330", "#ff7675",
  "#fab1a0", "#fdcb6e",
];

const CreateClassTypeModal: React.FC<CreateClassTypeModalProps> = ({
  onClose,
  currentGymId,
  isVisible,
  refreshClassTypes,
}) => {
  const [className, setClassName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [color, setColor] = useState<string>("#6b5b95");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCreateClassType = async () => {
    setIsSubmitting(true);
    setError(null);

    if (!className.trim()) {
      setError("Class name is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("class_types")
        .insert([{ class_name: className, description, color, gym_id: currentGymId }]);

      if (error) {
        setError(error.message);
      } else {
        refreshClassTypes();
        onClose();
      }
    } catch {
      setError("Unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal isVisible={isVisible} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Create New Class Type</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleCreateClassType();
      }}>
        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">Class Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Enter class name"
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">Description</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter class description (optional)"
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">Color</label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((availableColor) => (
              <button
                key={availableColor}
                type="button"
                onClick={() => setColor(availableColor)}
                className={`w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  color === availableColor
                    ? "border-white ring-2 ring-offset-2 ring-blue-500"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: availableColor }}
              />
            ))}
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
        <div className="flex justify-end">
          <button
            type="button"
            className="mr-2 px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default CreateClassTypeModal;
