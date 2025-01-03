import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '../context/AuthContext';

// A simple spinner component
const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    <p className="ml-3 text-gray-700">Loading...</p>
  </div>
);

// Types
type WorkoutLine = {
  id: string;
  content: string;
  type: 'focus' | 'sets' | 'intensity' | 'details';
  isFixed?: boolean;
};

type Track = {
  id: string;
  name: string;
};

// Helper function for UUID validation
const isValidUUID = (id: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

// Parsing workout details
const parseWorkoutText = (workoutText: string): WorkoutLine[] => {
  const lines = workoutText.split('\n').filter((line) => line.trim());
  return lines.map((line, index) => ({
    id: `item-${index}`,
    content: line.trim(),
    type:
      index === 0
        ? 'focus'
        : /^\d+(-\d+)+$/.test(line.trim())
        ? 'sets'
        : /RPE\s*\d+(-\d+)?/.test(line)
        ? 'intensity'
        : 'details',
    isFixed: index === 0,
  }));
};

const WorkoutBuilder: React.FC<{ workoutText: string; setWorkoutText: (text: string) => void }> = ({
  workoutText,
  setWorkoutText,
}) => {
  const { userData, isLoading: authLoading } = useAuth();
  const [workoutName, setWorkoutName] = useState<string>('');
  const [workoutDate, setWorkoutDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [parsedLines, setParsedLines] = useState<WorkoutLine[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [scoringSet, setScoringSet] = useState<number>(1);
  const [scoringType, setScoringType] = useState<string | null>(null);
  const [advancedScoring, setAdvancedScoring] = useState<string>('Maximum');
  const [orderType, setOrderType] = useState<string>('Descending');
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [coachNotes, setCoachNotes] = useState<string>('');
  const [warmUp, setWarmUp] = useState<string>('');
  const [coolDown, setCoolDown] = useState<string>('');
  const [showWarmUp, setShowWarmUp] = useState(false);
  const [showCoolDown, setShowCoolDown] = useState(false);
  const router = useRouter();

  // Update advanced scoring based on scoring type
  useEffect(() => {
    if (scoringType) {
      setAdvancedScoring(scoringType === 'Time' ? 'Minimum' : 'Maximum');
    }
  }, [scoringType]);

  // Fetch tracks when user data is available
  useEffect(() => {
    const fetchTracks = async () => {
      if (authLoading || !userData) return;

      try {
        setIsLoadingTracks(true);

        let tracksData: Track[] = [];

        if (userData.current_gym_id) {
          const { data, error } = await supabase
            .from('tracks')
            .select('id, name')
            .eq('gym_id', userData.current_gym_id);

          if (error) {
            console.error('Error fetching gym tracks:', error.message);
          } else if (data) {
            tracksData = data;
          }
        } else if (userData.user_id) {
          const { data, error } = await supabase
            .from('tracks')
            .select('id, name')
            .eq('user_id', userData.user_id);

          if (error) {
            console.error('Error fetching personal track:', error.message);
          } else if (data?.length) {
            tracksData = data;
          } else {
            // If no personal track exists, create one
            const { data: newTrack, error: createError } = await supabase
              .from('tracks')
              .insert({
                user_id: userData.user_id,
                name: 'Personal Track',
              })
              .select('id, name')
              .single();

            if (createError) {
              console.error('Error creating personal track:', createError.message);
            } else if (newTrack) {
              tracksData = [newTrack];
            }
          }
        }

        setTracks(tracksData);
      } catch (error) {
        console.error('Unexpected error fetching tracks:', error);
      } finally {
        setIsLoadingTracks(false);
      }
    };

    fetchTracks();
  }, [authLoading, userData]);

  // Debounced function to avoid rapid re-renders during typing
  const handleDebouncedSetWorkoutText = useCallback(
    (text: string) => {
      // You can implement an actual debounce here using a ref or a debounce utility if needed.
      setWorkoutText(text);
      setIsValidated(false);
    },
    [setWorkoutText]
  );

  const handleParseWorkout = useCallback(() => {
    const lines = parseWorkoutText(workoutText);
    setParsedLines(lines);
    setIsValidated(lines.length > 0 && workoutName.trim() !== '');
    if (!selectedTrackId || !scoringType || workoutName.trim() === '') setShowTooltip(true);
  }, [workoutText, workoutName, selectedTrackId, scoringType]);

  const handlePlanWorkout = useCallback(async () => {
    if (!isValidated || !selectedTrackId || !scoringType || workoutName.trim() === '') return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
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
        .insert({ description: workoutText, title: workoutName })
        .select('workoutid')
        .single();

      if (insertError) {
        alert('There was an error creating the workout. Please try again.');
        return;
      }
      workoutId = newWorkout?.workoutid;
    }

    const { error: scheduleError } = await supabase
      .from('scheduled_workouts')
      .insert({
        user_id: user.id,
        date: workoutDate,
        name: workoutName,
        warm_up: warmUp,
        workout_details: workoutText,
        cool_down: coolDown,
        status: 'planned',
        workout_id: workoutId,
        track_id: selectedTrackId,
        scoring_set: scoringSet,
        scoring_type: scoringType,
        advanced_scoring: advancedScoring,
        order_type: orderType,
        notes: coachNotes,
      });

    if (scheduleError) {
      alert('There was an error scheduling the workout. Please try again.');
    } else {
      router.push(`/plan/daily?date=${workoutDate}`);
    }
  }, [
    isValidated,
    selectedTrackId,
    scoringType,
    workoutName,
    workoutDate,
    warmUp,
    workoutText,
    coolDown,
    advancedScoring,
    orderType,
    coachNotes,
    scoringSet,
    router,
  ]);

  // Show a unified loading spinner if still loading auth or tracks
  if (authLoading || isLoadingTracks) {
    return <Spinner />;
  }

  return (
    <div className={`p-6 bg-gray-50 rounded-md shadow-md max-w-3xl mx-auto text-gray-800 antialiased transition-all duration-300`}>
      <h2 className="text-2xl font-semibold mb-4 text-gray-600">Build Your Workout</h2>

      {/* Date Input */}
      <div className="mb-4">
        <label htmlFor="workout-date" className="block text-sm font-semibold mb-1 text-gray-500">
          Date
          {workoutDate && <span className="text-green-500 ml-2">&#x2713;</span>}
        </label>
        <input
          type="date"
          id="workout-date"
          value={workoutDate}
          onChange={(e) => setWorkoutDate(e.target.value)}
          className={`w-1/2 p-2 border ${showTooltip && !workoutDate ? 'border-red-500' : 'border-gray-300'} bg-gray-100 text-sm text-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-gray-300`}
        />
      </div>

      {/* Workout Name Input */}
      <div className="mb-4">
        <label htmlFor="workout-name" className="block text-sm font-semibold mb-1 text-gray-500">
          Workout Name
          {workoutName && <span className="text-green-500 ml-2">&#x2713;</span>}
        </label>
        <input
          type="text"
          id="workout-name"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Enter the workout name"
          className="w-full p-2 border border-gray-300 bg-gray-100 rounded"
        />
      </div>

      {/* Track Selection Dropdown */}
      <div className="mb-4 relative">
        <label htmlFor="track-select" className="block text-sm font-semibold mb-1 text-gray-500">
          Select Track
          {selectedTrackId && <span className="text-green-500 ml-2">&#x2713;</span>}
        </label>
        <select
          id="track-select"
          value={selectedTrackId || ''}
          onChange={(e) => setSelectedTrackId(e.target.value || null)}
          className={`w-1/2 p-2 border ${showTooltip && !selectedTrackId ? 'border-red-500' : 'border-gray-300'} bg-gray-100 text-sm text-gray-800 rounded`}
        >
          <option value="" disabled>
            Select a track
          </option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
        {showTooltip && !selectedTrackId && (
          <div className="absolute text-xs bg-yellow-100 border border-yellow-300 text-yellow-800 p-1 rounded -top-7 left-0">
            <span>&#128073;</span> Please select a track.
          </div>
        )}
      </div>

      {/* Warm Up Toggle and Input */}
      <div className="mb-4">
        <label htmlFor="warm-up-toggle" className="block text-sm font-semibold mb-1 text-gray-500">
          <button onClick={() => setShowWarmUp(!showWarmUp)} className="text-blue-500">
            {showWarmUp ? 'Hide Warm Up' : 'Add Warm Up'}
          </button>
        </label>
        {showWarmUp && (
          <textarea
            id="warm-up"
            value={warmUp}
            onChange={(e) => setWarmUp(e.target.value)}
            placeholder="Enter your warm-up details here..."
            className="w-full p-2 border border-gray-300 bg-gray-100 rounded"
          />
        )}
      </div>

      {/* Workout Details */}
      <div className="mb-4">
        <label htmlFor="workout-input" className="block text-sm font-semibold mb-1 text-gray-500">
          Workout Details
          {workoutText && <span className="text-green-500 ml-2">&#x2713;</span>}
        </label>
        <textarea
          id="workout-input"
          value={workoutText}
          onChange={(e) => handleDebouncedSetWorkoutText(e.target.value)}
          placeholder="Enter your workout details here..."
          className={`w-full p-2 border ${showTooltip && !workoutText ? 'border-red-500' : 'border-gray-300'} bg-gray-100 text-sm text-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 h-28`}
        />
      </div>

      {/* Cool Down Toggle and Input */}
      <div className="mb-4">
        <label htmlFor="cool-down-toggle" className="block text-sm font-semibold mb-1 text-gray-500">
          <button onClick={() => setShowCoolDown(!showCoolDown)} className="text-blue-500">
            {showCoolDown ? 'Hide Cool Down' : 'Add Cool Down'}
          </button>
        </label>
        {showCoolDown && (
          <textarea
            id="cool-down"
            value={coolDown}
            onChange={(e) => setCoolDown(e.target.value)}
            placeholder="Enter your cool-down details here..."
            className="w-full p-2 border border-gray-300 bg-gray-100 rounded"
          />
        )}
      </div>

      {/* Scoring Options */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-500">Scoring</label>
        <div className="flex space-x-2">
          <select
            value={scoringSet}
            onChange={(e) => setScoringSet(parseInt(e.target.value))}
            className="w-1/4 p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((set) => (
              <option key={set} value={set}>{`${set} set${set > 1 ? 's' : ''}`}</option>
            ))}
          </select>
          <span>of</span>
          <select
            value={scoringType || ''}
            onChange={(e) => setScoringType(e.target.value)}
            className={`w-1/2 p-2 border ${showTooltip && !scoringType ? 'border-red-500' : 'border-gray-300'} bg-gray-100 text-sm text-gray-800 rounded`}
          >
            <option value="" disabled>
              Select type
            </option>
            {['Time', 'Rounds + Reps', 'Reps', 'Load', 'Calories', 'Metres', 'Check Box', 'Not Scored'].map(
              (type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Advanced Scoring Options */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-500">Advanced Scoring Options</label>
        <div className="flex space-x-2">
          <select
            value={advancedScoring}
            disabled
            className="w-1/2 p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded"
          >
            <option value="Minimum">Minimum</option>
            <option value="Maximum">Maximum</option>
          </select>
          <span>of</span>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-1/2 p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded"
          >
            <option value="Descending">Descending ("bigger scores first")</option>
            <option value="Ascending">Ascending ("smaller scores first")</option>
          </select>
        </div>
      </div>

      {/* Add Coach's Notes Button and Modal */}
      <div className="mb-4">
        <button
          onClick={() => setShowNotesModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Add Coach's Notes
        </button>
      </div>

      {showNotesModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Coach's Notes</h3>
            <textarea
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              placeholder="Enter any notes or instructions here..."
              className="w-full p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded h-28 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan It and Validate Buttons */}
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
          disabled={!isValidated || !selectedTrackId || !scoringType || workoutName.trim() === ''}
          className={`flex-1 px-4 py-2 font-semibold rounded transition text-sm ${
            isValidated && selectedTrackId && scoringType && workoutName.trim() !== ''
              ? 'bg-pink-500 text-white hover:bg-pink-600'
              : 'bg-gray-300 text-gray-700 cursor-not-allowed'
          }`}
        >
          Plan It
        </button>
      </div>

      {/* Parsed Workout Lines Display */}
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
