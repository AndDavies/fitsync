import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase/client';
import { MdOutlineContentCopy } from 'react-icons/md';

type WorkoutIdeasProps = {
  setWorkoutBuilderText: (text: string) => void;
  category: string;
};

const WorkoutIdeas: React.FC<WorkoutIdeasProps> = ({ setWorkoutBuilderText, category }) => {
  const [workouts, setWorkouts] = useState<{ title: string; description: string | undefined }[]>([]);
  const [search, setSearch] = useState('');

  // Fetch workouts when the category changes
  useEffect(() => {
    if (!category) return; // Guard clause for invalid categories

    const fetchWorkouts = async () => {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('title, description')
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

  // Parse workout description
  const parseDescription = (text: string = '') => {
    return text.replace(/\\n/g, '\n');
  };

  // Calculate the height of the textarea
  const calculateHeight = (text: string) => {
    const lineHeight = 1.5; // Line height in 'em'
    const lineCount = Math.max(3, text.split('\n').length); // Ensure a minimum height
    const maxLines = 10; // Cap the maximum height
    return `${Math.min(lineCount, maxLines) * lineHeight}em`;
  };

  // Filter workouts based on search input
  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) =>
      workout.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [workouts, search]);

  // Copy button handler
  const handleCopyWorkout = useCallback(
    (description: string) => {
      setWorkoutBuilderText(parseDescription(description));
    },
    [setWorkoutBuilderText]
  );

  return (
    <div className="p-4 bg-gray-200 rounded-sm shadow-md h-96 overflow-y-auto text-gray-900">
      {/* Search input */}
      <input
        type="text"
        placeholder="Search movements..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 p-2 border border-gray-400 rounded-sm w-full text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 bg-gray-100 text-gray-900 placeholder-gray-600"
      />
      {/* Workout list */}
      <div className="workout-list space-y-2">
        {filteredWorkouts.map((workout, index) => (
          <div key={index} className="workout-item border border-gray-400 rounded-sm p-2 bg-gray-100">
            <textarea
              readOnly
              value={parseDescription(workout.description || '')}
              className="workout-description w-full p-1.5 border border-gray-300 rounded-sm focus:outline-none resize-none overflow-hidden text-sm bg-gray-50 text-gray-800"
              style={{ height: calculateHeight(workout.description || '') }}
            />
            <button
              onClick={() => handleCopyWorkout(workout.description || '')}
              className="copy-button flex items-center space-x-1 mt-1 text-gray-700 hover:text-gray-900 text-xs"
            >
              <MdOutlineContentCopy className="text-gray-500" />
              <span>Copy</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutIdeas;
