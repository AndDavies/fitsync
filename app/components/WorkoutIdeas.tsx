import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MdOutlineContentCopy } from 'react-icons/md';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type WorkoutIdeasProps = {
  setWorkoutBuilderText: (text: string) => void;
  category: string;
};

const WorkoutIdeas: React.FC<WorkoutIdeasProps> = ({ setWorkoutBuilderText, category }) => {
  const [workouts, setWorkouts] = useState<{ title: string; description: string | undefined; }[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('title, description')
        .eq('category', category)
        .neq('title', 'Warm Up')
        .neq('title', 'warm up')
        .limit(10);

      if (error) {
        console.error('Error fetching workouts:', error);
      } else {
        setWorkouts(data);
      }
    };

    fetchWorkouts();
  }, [category]);

  const calculateHeight = (text: string) => {
    const lineHeight = 1.5; // Line height in 'em'
    const lineCount = Math.max(3, text.split('\n').length); // Ensure a minimum height for readability
    return `${lineCount * lineHeight}em`;
  };

  const parseDescription = (text: string) => {
    return text.split('\\n').join('\n');
  };

  return (
    <div className="p-4 bg-gray-200 rounded-sm shadow-md h-96 overflow-y-auto text-gray-900">
      <input
        type="text"
        placeholder="Search movements..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 p-2 border border-gray-400 rounded-sm w-full text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 bg-gray-100 text-gray-900 placeholder-gray-600"
      />
      <div className="workout-list space-y-2">
        {workouts
          .filter((workout) =>
            workout.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((workout, index) => (
            <div key={index} className="workout-item border border-gray-400 rounded-sm p-2 bg-gray-100">
              <textarea
                readOnly
                value={parseDescription(workout.description || '')}
                className="workout-description w-full p-1.5 border border-gray-300 rounded-sm focus:outline-none resize-none overflow-hidden text-sm bg-gray-50 text-gray-800"
                style={{ height: calculateHeight(workout.description || '') }}
              />
              <button
                onClick={() => setWorkoutBuilderText(parseDescription(workout.description ?? ''))}
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
