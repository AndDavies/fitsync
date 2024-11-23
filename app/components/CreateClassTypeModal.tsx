import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface CreateClassTypeModalProps {
  onClose: () => void;
  currentGymId: string;
  isVisible: boolean;
  refreshClassTypes: () => void;
}

const CreateClassTypeModal: React.FC<CreateClassTypeModalProps> = ({
  onClose,
  currentGymId,
  isVisible,
  refreshClassTypes,
}) => {
  const [className, setClassName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [color, setColor] = useState<string>("#6b5b95"); // Default to a predefined color
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const availableColors = [
    "#8e44ad", // Purple
    "#a29bfe", // Light Purple
    "#74b9ff", // Light Blue
    "#55efc4", // Mint Green
    "#b2bec3", // Soft Green
    "#ffeaa7", // Light Yellow
    "#fed330", // Yellow
    "#ff7675", // Red/Orange
    "#fab1a0", // Peach
    "#fdcb6e", // Orange
  ];

  const handleCreateClassType = async (e: React.FormEvent) => {
    //e.preventDefault();
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
      <>
        {/* Modal Overlay */}
        <div
          className={`fixed right-0 top-0 bg-white w-full max-w-md h-full p-6 shadow-2xl transition-all duration-1000 delay-100 ease-in-out transform z-50 ${
            isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        ></div>

        {/* Modal Container */}
        <div
          className={`fixed right-0 top-0 bg-white w-full max-w-md h-full p-6 shadow-2xl transition-transform duration-300 z-50 ${
            isVisible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <h2 className="text-lg font-semibold mb-4">Create New Class Type</h2>
          <form onSubmit={handleCreateClassType}>
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">Class Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded text-sm"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Enter class name"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">Description</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded text-sm"
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
                    className={`w-8 h-8 rounded-full border-2 ${
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
                className="mr-2 px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </>
    )
  );
};

export default CreateClassTypeModal;
