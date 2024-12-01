"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '../context/AuthContext';

type ScoringType = 'Time' | 'Rounds + Reps' | 'Reps' | 'Load' | 'Calories' | 'Metres' | 'Check Box' | 'Not Scored';

interface LogResultProps {
  workoutId: string;
}

const LogResult: React.FC<LogResultProps> = ({ workoutId }) => {
  const { userData } = useAuth();
  const [scoringSet, setScoringSet] = useState<number>(1);
  const [scoringType, setScoringType] = useState<ScoringType>('Reps');
  const [advancedScoring, setAdvancedScoring] = useState<'Minimum' | 'Maximum'>('Maximum');
  const [results, setResults] = useState<string[]>([]);
  const [logSuccess, setLogSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Fetch workout info using `workoutId` to prepopulate scoring options
    const fetchWorkoutData = async () => {
      if (workoutId) {
        try {
          const { data, error } = await supabase
            .from('scheduled_workouts')
            .select('scoring_set, scoring_type, advanced_scoring, order_type')
            .eq('id', workoutId)
            .single();
  
          if (error) throw error;
  
          if (data) {
            setScoringSet(data.scoring_set);
            setScoringType(data.scoring_type);
            setAdvancedScoring(data.advanced_scoring);
          }
        } catch (err) {
          const error = err as any; // Type assertion for `error`
          console.error("Error fetching workout data:", error.message);
        }
      }
    };
  
    fetchWorkoutData();
  }, [workoutId]);

  const handleInputChange = (index: number, value: string) => {
    const newResults = [...results];
    newResults[index] = value;
    setResults(newResults);
  };

  const handleSubmit = async () => {
    const resultString = results.join(', ');
  
    try {
      const userId = userData?.user_id;
      if (!userId) {
        alert("You need to be logged in to log workout results.");
        return;
      }
  
      const { data, error } = await supabase
        .from('workout_results')
        .insert({
          workout_id: workoutId,
          user_profile_id: userId,
          result: resultString,
          logged_at: new Date().toISOString(),
        });
  
      if (error) throw error;
  
      setLogSuccess("Successfully logged workout result!");
    } catch (err) {
      // Typecasting err to Error to access its properties safely
      const error = err as Error;
      console.error("Error logging workout result:", error.message);
    }
  };
  

  return (
    <div className="p-6 bg-gray-50 rounded-md shadow-md max-w-3xl mx-auto text-gray-800 antialiased transition-all duration-300">
      <h2 className="text-2xl font-semibold mb-4 text-gray-600">Log Workout Result</h2>
      <div className="mb-4">
        <label htmlFor="scoring-set" className="block text-sm font-semibold mb-1 text-gray-500">
          Scoring Set
        </label>
        <p>{scoringSet} sets</p>
      </div>

      <div className="mb-4">
        <label htmlFor="scoring-type" className="block text-sm font-semibold mb-1 text-gray-500">
          Scoring Type
        </label>
        <p>{scoringType}</p>
      </div>

      {Array.from({ length: scoringSet }, (_, i) => (
        <div key={i} className="mb-4">
          <label htmlFor={`set-${i}`} className="block text-sm font-semibold mb-1 text-gray-500">
            Set {i + 1} - Enter Result
          </label>
          <input
            type="text"
            id={`set-${i}`}
            value={results[i] || ''}
            onChange={(e) => handleInputChange(i, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      ))}

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Log Result
        </button>
      </div>

      {logSuccess && (
        <p className="mt-4 text-green-500 font-semibold">{logSuccess}</p>
      )}
    </div>
  );
};

export default LogResult;
