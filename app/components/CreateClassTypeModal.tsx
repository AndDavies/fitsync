import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface CreateClassTypeModalProps {
  onClose: () => void;
  currentGymId: string;
  isVisible: boolean;
  refreshClassTypes: () => void;
}

const CreateClassTypeModal: React.FC<CreateClassTypeModalProps> = ({ onClose, currentGymId, isVisible, refreshClassTypes }) => {
  const [className, setClassName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [color, setColor] = useState<string>("#000000");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCreateClassType = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!className) {
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
    } catch (e) {
      setError("Unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    isVisible && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded shadow-lg w-96">
          <h2 className="text-xl font-semibold mb-4">Create New Class Type</h2>
          <form onSubmit={handleCreateClassType}>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Class Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Enter class name"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Description</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter class description (optional)"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Class Color</label>
              <input
                type="color"
                className="w-full p-2 border border-gray-300 rounded"
                value={color}
                onChange={(e) => setColor(e.target.value)}
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
    )
  );
};

export default CreateClassTypeModal;
