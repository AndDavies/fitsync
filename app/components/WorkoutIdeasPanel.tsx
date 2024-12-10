// app/components/WorkoutIdeasPanel.tsx

"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { WorkoutTemplate } from "./types";

type WorkoutIdeasPanelProps = {
  onClose: () => void;
  onSelect: (templateData: Partial<WorkoutTemplate>) => void;
  userRole: string;
};

const WorkoutIdeasPanel: React.FC<WorkoutIdeasPanelProps> = ({ onClose, onSelect }) => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("is_template", true)
        .limit(20);

      if (error) {
        console.error("Error fetching templates:", error.message);
      } else {
        setTemplates(data || []);
      }
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-24 z-50">
      <div className="bg-white w-full max-w-md rounded shadow-lg p-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-700 hover:text-gray-900">&times;</button>
        <h3 className="text-lg font-semibold mb-4">Select a Template</h3>
        {loading && <p>Loading templates...</p>}
        {!loading && templates.length === 0 && <p>No templates found.</p>}
        <ul className="space-y-2 max-h-96 overflow-auto">
          {templates.map((tpl) => (
            <li
              key={tpl.id}
              className="border p-2 hover:bg-gray-100 transition cursor-pointer"
              onClick={() =>
                onSelect({
                  workoutName: tpl.title, // Now valid because `WorkoutTemplate` allows workoutName
                  workout_details: tpl.workout_details,
                  warm_up: tpl.warm_up,
                  cool_down: tpl.cool_down,
                  scoring_type: tpl.scoring_type,
                  scoring_set: tpl.scoring_set,
                  advanced_scoring: tpl.advanced_scoring,
                  order_type: tpl.order_type,
                  notes: tpl.notes,
                  origin: tpl.origin || "coach",
                  is_template: tpl.is_template,
                  track_id: tpl.track_id || undefined
                })
              }
            >
              <strong>{tpl.title || "Untitled Template"}</strong>
              <div className="text-sm text-gray-600">{tpl.workout_details?.slice(0,50)}...</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WorkoutIdeasPanel;