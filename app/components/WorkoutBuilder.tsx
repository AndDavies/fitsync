// components/WorkoutBuilder.tsx

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '../context/AuthContext';

type WorkoutLine = {
  id: string;
  content: string;
  type: 'focus' | 'sets' | 'intensity' | 'details';
  isFixed?: boolean;
};

type Track = {
  id: string;  // UUID for track ID
  name: string;
};

// Helper function to validate UUID format
const isValidUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

// Updated function to parse workout text and ensure correct types
const parseWorkoutText = (workoutText: string): WorkoutLine[] => {
  const lines = workoutText.split('\n').filter((line) => line.trim());
  const parsedLines: WorkoutLine[] = [];

  lines.forEach((line, index) => {
    let type: WorkoutLine['type'];  // Define type as one of the allowed values

    if (index === 0) {
      type = 'focus';
    } else if (/^\d+(-\d+)+$/.test(line.trim())) {
      type = 'sets';
    } else if (/RPE\s*\d+(-\d+)?/.test(line)) {
      type = 'intensity';
    } else {
      type = 'details';
    }

    parsedLines.push({
      id: `item-${index}`,
      content: line.trim(),
      type,  // Explicitly use the specific type
      isFixed: index === 0,
    });
  });

  return parsedLines;
};

const WorkoutBuilder: React.FC<{ workoutText: string; setWorkoutText: (text: string) => void }> = ({ workoutText, setWorkoutText }) => {
  const { currentGymId, isLoading: authLoading } = useAuth();  // Access currentGymId from context
  const [workoutDate, setWorkoutDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [parsedLines, setParsedLines] = useState<WorkoutLine[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch tracks based on currentGymId
  useEffect(() => {
    if (!authLoading && currentGymId && isValidUUID(currentGymId)) {
      const fetchTracks = async () => {
        try {
          const { data } = await supabase
            .from('tracks')
            .select('id, name')
            .eq('gym_id', currentGymId);

          //if (error) throw error;

          setTracks(data || []);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching tracks:');
        }
      };

      fetchTracks();
    } else if (!authLoading) {
      console.warn("currentGymId is either undefined or not a valid UUID:", currentGymId);
      setIsLoading(false);
    }
  }, [currentGymId, authLoading]);

  const handleParseWorkout = () => {
    const lines = parseWorkoutText(workoutText);
    setParsedLines(lines);
    setIsValidated(lines.length > 0);
  };

  const handlePlanWorkout = async () => {
    if (!isValidated || !selectedTrackId) return;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      alert('You need to be logged in to plan a workout.');
      return;
    }

    const { data: workoutData } = await supabase
      .from('workouts')
      .select('workoutid')
      .eq('description', workoutText)
      .single();

    let workoutId = workoutData?.workoutid;
    if (!workoutId) {
      const { data: newWorkout, error: insertError } = await supabase
        .from('workouts')
        .insert({ description: workoutText, title: "Untitled Workout" })
        .select('workoutid')
        .single();

      if (insertError) {
        alert(`Error creating the workout: ${insertError.message}`);
        return;
      }
      workoutId = newWorkout?.workoutid;
    }

    const { error: scheduleError } = await supabase
      .from('scheduled_workouts')
      .insert({
        user_id: user.id,
        date: workoutDate,
        workout_details: workoutText,
        status: 'planned',
        workout_id: workoutId,
        track_id: selectedTrackId,
      });

    if (scheduleError) {
      alert(`Error scheduling the workout: ${scheduleError.message}`);
    } else {
      router.push(`/plan/daily?date=${workoutDate}`);
    }
  };

  // Display a loading message until currentGymId is validated and tracks are fetched
  if (isLoading) {
    return <p>Loading workout builder...</p>;
  }

  return (
    <div className="p-6 bg-gray-50 rounded-md shadow-md max-w-3xl mx-auto text-gray-800 antialiased">
      <h2 className="text-2xl font-semibold mb-4 text-gray-600">Build Your Workout</h2>
      <div className="mb-4">
        <label htmlFor="workout-date" className="block text-sm font-semibold mb-1 text-gray-500">
          Date
        </label>
        <input
          type="date"
          id="workout-date"
          value={workoutDate}
          onChange={(e) => setWorkoutDate(e.target.value)}
          className="w-full p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>

      {/* Track selection dropdown */}
      <div className="mb-4">
        <label htmlFor="track-select" className="block text-sm font-semibold mb-1 text-gray-500">
          Select Track
        </label>
        <select
          id="track-select"
          value={selectedTrackId || ""}
          onChange={(e) => setSelectedTrackId(e.target.value || null)}
          className="w-full p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="" disabled>Select a track</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="workout-input" className="block text-sm font-semibold mb-1 text-gray-500">
          Workout Details
        </label>
        <textarea
          id="workout-input"
          value={workoutText}
          onChange={(e) => {
            setWorkoutText(e.target.value);
            setIsValidated(false);
          }}
          placeholder="Enter your workout details here..."
          className="w-full p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 h-28"
        />
      </div>
      <div className="flex space-x-2 mt-3">
        <button
          onClick={handleParseWorkout}
          className={`flex-1 px-4 py-2 font-semibold rounded transition text-sm ${
            !isValidated ? 'bg-pink-200 text-gray-700 hover:bg-pink-300' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Validate
        </button>
        <button
          onClick={handlePlanWorkout}
          disabled={!isValidated || !selectedTrackId}
          className={`flex-1 px-4 py-2 font-semibold rounded transition text-sm ${
            isValidated && selectedTrackId ? 'bg-pink-500 text-white hover:bg-pink-600' : 'bg-gray-300 text-gray-700 cursor-not-allowed'
          }`}
        >
          Plan It
        </button>
      </div>

      <div className="space-y-1 mt-6">
        {parsedLines.map((line) => (
          <div key={line.id} className="p-2 border-b border-gray-200 bg-gray-50 text-sm text-gray-700">
            {line.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutBuilder;
