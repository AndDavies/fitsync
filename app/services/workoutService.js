// services/workoutService.js
import { supabase } from '@/utils/supabase/client';

// Fetch tracks by gym ID
export const fetchTracksByGymId = async (gymId) => {
  if (!gymId) return [];
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('id, name')
      .eq('gym_id', gymId);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching tracks:", error.message);
    return [];
  }
};

// Fetch a workout by description
export const fetchWorkoutByDescription = async (description) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('workoutid')
      .eq('description', description)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching workout:", error.message);
    return null;
  }
};

// Insert a new workout
export const insertNewWorkout = async (description, title) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .insert({ description, title })
      .select('workoutid')
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error inserting new workout:", error.message);
    return null;
  }
};

// Schedule a workout
export const scheduleWorkout = async (workoutDetails) => {
  try {
    const { error } = await supabase.from('scheduled_workouts').insert(workoutDetails);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error scheduling workout:", error.message);
    return false;
  }
};
