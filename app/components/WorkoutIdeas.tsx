"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabase/client';
import { MdOutlineContentCopy } from 'react-icons/md';
import { Text } from '@geist-ui/core';

type Workout = {
  workoutid: string;
  title: string;
  description: Record<string, any> | null;
};

type WorkoutIdeasProps = {
  setWorkoutBuilderText: (text: string) => void;
  setWorkoutBuilderId: (id: string | null) => void;
  category: string;
};

function convertJsonToHumanReadable(json: any): string {
  if (!json) return "No details available.";

  const lines: string[] = [];
  if (json.type) lines.push(json.type);

  if (json.workout && Array.isArray(json.workout)) {
    for (const block of json.workout) {
      if (block.movements && Array.isArray(block.movements)) {
        for (const mov of block.movements) {
          // Skip if the movement name includes "notes"
          if (mov.name && mov.name.toLowerCase().includes("notes")) {
            continue;
          }

          let line = '';
          if (mov.reps) {
            if (Array.isArray(mov.reps)) {
              line += mov.reps.join('-') + ' ';
            } else {
              line += mov.reps + ' ';
            }
          }
          line += mov.name || 'Unknown Movement';
          if (mov.distance) {
            line += ` ${mov.distance}`;
          }
          lines.push(line.trim());
        }
      } else if (block.name && block.reps) {
        const repsText = Array.isArray(block.reps) ? block.reps.join('-') : block.reps;
        lines.push(`${block.name}: ${repsText}`);
      }
    }
  }

  return lines.length > 0 ? lines.join('\n') : "No details available.";
}

const WorkoutIdeas: React.FC<WorkoutIdeasProps> = ({ setWorkoutBuilderText, setWorkoutBuilderId, category }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!category) return;
    const fetchWorkouts = async () => {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('workoutid, title, description')
          .eq('category', category)
          .neq('title', 'Warm Up')
          .neq('title', 'warm up')
          .limit(10);

        if (error) {
          console.error('Error fetching workouts:', error.message);
        } else {
          setWorkouts(data || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching workouts:', err);
      }
    };

    fetchWorkouts();
  }, [category]);

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) =>
      w.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [workouts, search]);

  const handleUseWorkout = (workout: Workout) => {
    const humanReadableText = convertJsonToHumanReadable(workout.description);
    setWorkoutBuilderText(humanReadableText);
    setWorkoutBuilderId(workout.workoutid);
  };

  return (
    <div className="space-y-4">
      <input
        placeholder="Search workouts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
      />

      {filteredWorkouts.map((workout, index) => {
        const humanReadable = workout.description ? convertJsonToHumanReadable(workout.description) : 'No data';

        return (
          <div
            key={index}
            className="border border-gray-700 rounded p-4 bg-gray-800 hover:border-pink-500 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <Text b style={{ color: '#F9FAFB' }}>{workout.title}</Text>
              <button
                onClick={() => handleUseWorkout(workout)}
                className="text-xs py-1 px-2 bg-pink-500 hover:bg-pink-600 text-white rounded flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              >
                <MdOutlineContentCopy className="text-white" />
                <span>Use This Workout</span>
              </button>
            </div>
            <textarea
              readOnly
              value={humanReadable}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #4B5563',
                borderRadius: '4px',
                resize: 'none',
                overflow: 'auto',
                fontSize: '0.875rem',
                backgroundColor: '#111827',
                color: '#F9FAFB',
                minHeight: '6em'
              }}
              className="focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 mt-2 transition-colors duration-300"
            />
          </div>
        );
      })}
    </div>
  );
};

export default WorkoutIdeas;
