"use client";

import React, { useState } from "react";

interface CreateClassTypeModalProps {
  onClose: () => void;
  currentGymId: string;
  isVisible: boolean;
  refreshClassTypes: () => void;
}

export default function CreateClassTypeModal({
  onClose,
  currentGymId,
  isVisible,
  refreshClassTypes,
}: CreateClassTypeModalProps) {
  const [className, setClassName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [color, setColor] = useState<string>("#6b5b95");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ... handleCreateClassType logic ...

  return (
    isVisible && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-card p-5 rounded-md text-card-foreground w-full max-w-md border border-border">
          <h2 className="text-lg font-semibold mb-4">Create New Class Type</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // handleCreateClassType();
            }}
          >
            {/* Class Name */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-foreground">
                Class Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                className="w-full p-2 border border-border rounded text-sm bg-secondary text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Enter class name"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                className="w-full p-2 border border-border rounded text-sm bg-secondary text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter class description (optional)"
              />
            </div>

            {/* Choose color */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-foreground">
                Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="border border-border rounded bg-secondary p-1 cursor-pointer"
              />
            </div>

            {error && <div className="text-destructive text-sm mb-4">{error}</div>}

            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                className="px-3 py-1 text-sm rounded border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-accent"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1 text-sm rounded bg-accent text-accent-foreground hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {isSubmitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}