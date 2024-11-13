// components/DailyView.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

type Workout = {
  id: string;
  workout_details: string;
  scoring_set: string;
  scoring_type: string;
  advanced_scoring: string;
  notes: string | null;
};

type Track = {
  id: string;
  name: string;
};

const DailyView: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const [scoringEnabled, setScoringEnabled] = useState(false);

  useEffect(() => {
    if (date) {
      console.log("Fetching workouts for date:", date);
      fetchWorkoutsForDate(date);
      fetchTracks();
    } else {
      console.warn("No date provided in query parameters.");
    }
  }, [date]);

  const fetchWorkoutsForDate = async (selectedDate: string) => {
    console.log("Starting fetchWorkoutsForDate with date:", selectedDate);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData) {
      console.error("User not authenticated:", userError?.message);
      return;
    }
    const user = userData.user;

    console.log("Authenticated user ID:", user.id);

    const { data, error } = await supabase
      .from('scheduled_workouts')
      .select(`
        id,
        workout_details,
        scoring_set,
        scoring_type,
        advanced_scoring,
        workout_id,
        workouts (notes)
      `)
      .eq('user_id', user.id)
      .eq('date', selectedDate);

    if (error) {
      console.error('Error fetching workouts:', error.message);
    } else if (data && data.length > 0) {
      const formattedData = data.map((item: {
        id: string;
        workout_details: string;
        scoring_set: string;
        scoring_type: string;
        advanced_scoring: string;
        workouts: { notes: string }[] | null;
      }) => ({
        id: item.id,
        workout_details: item.workout_details,
        scoring_set: item.scoring_set,
        scoring_type: item.scoring_type,
        advanced_scoring: item.advanced_scoring,
        notes: item.workouts && item.workouts[0] ? item.workouts[0].notes : null, // Access first element if available
      }));

      console.log("Fetched workouts with notes:", formattedData);
      setWorkouts(formattedData);
    } else {
      console.log("No workouts found for the specified date:", selectedDate);
      setWorkouts([]);
    }
  };

  const fetchTracks = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData) return;
    const user = userData.user;

    const { data, error } = await supabase
      .from('user_tracks')
      .select('track_id, tracks(name)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching tracks:', error.message);
    } else {
      const fetchedTracks = (data || []).map((item: {
        track_id: string;
        tracks: { name: string }[] | null;
      }) => ({
        id: item.track_id,
        name: item.tracks && item.tracks[0] ? item.tracks[0].name : 'Unnamed Track', // Access first element if available
      }));

      console.log("Fetched tracks:", fetchedTracks);
      setTracks(fetchedTracks);
      if (fetchedTracks.length === 1) {
        setSelectedTrack(fetchedTracks[0].id); // Auto-select if only one track
      }
    }
  };

  const handleLogResultClick = () => {
    setScoringEnabled(true);
  };

  const handleSaveResult = async () => {
    setScoringEnabled(false);
    console.log("Score logged (placeholder)");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Workouts for {date}</h2>
        <button 
          onClick={() => router.push('/plan')}
          className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-400 transition"
        >
          Back to Calendar
        </button>
      </div>

      {/* Track Selection */}
      {tracks.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Select Track:</label>
          <select
            value={selectedTrack || ''}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="p-2 border border-gray-300 bg-gray-100 rounded text-sm text-gray-800"
          >
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {workouts.length > 0 ? (
        workouts.map((workout) => (
          <div key={workout.id} className="mb-8">
            <div className="mb-4">
              <h3 className="text-xl font-bold">Workout Details</h3>
              <div className="bg-black text-white p-4 rounded font-semibold text-lg">
                {workout.workout_details}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold">Scoring Method:</h4>
              <div className="flex items-center space-x-4">
                <p className="text-gray-700">
                  {workout.scoring_set}, {workout.scoring_type}, {workout.advanced_scoring}
                </p>
                <button
                  onClick={handleLogResultClick}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Log Result
                </button>
              </div>

              {scoringEnabled && (
                <div className="mt-4 space-y-2">
                  <input
                    type="number"
                    placeholder="Enter score"
                    className="p-2 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={handleSaveResult}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    Save Result
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4 p-4 border rounded bg-gray-50">
              <h4 className="font-semibold">Coach&apos;s Notes:</h4>
              <p>{workout.notes || "No coach's notes available."}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No workouts scheduled for this date.</p>
      )}
    </div>
  );
};

export default DailyView;
