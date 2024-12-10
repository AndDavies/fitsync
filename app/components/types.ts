// app/workouts/components/types.ts

export interface WorkoutTemplate {
  id: string;
  title?: string;            // Returned from DB
  workout_details?: string;
  warm_up?: string;
  cool_down?: string;
  scoring_type?: string;
  scoring_set?: number;
  advanced_scoring?: string;
  order_type?: string;
  notes?: string;
  origin?: string;
  is_template: boolean;
  track_id?: string;

  // Added field for our front-end consistency
  workoutName?: string; 
}

// types.ts
export interface ParsedMovement {
  name: string;
  reps?: number[] | number | 'Max';
  weight?: string;
  notes?: string[];
  modality?: string;
  minute?: string;
  distance?: string;
  duration_seconds?: number;
  scaling?: string[]; // Add scaling array if present
}

export interface ParsedWorkoutBlock {
  title?: string;
  lines: ParsedMovement[];
  rounds?: number;
  format?: string;
}

export interface ParsedWorkout {
  type: string;
  notes: string[];
  workoutBlocks: ParsedWorkoutBlock[];
  scalingGuidelines?: Record<string, any>;
  duration?: string;
  priority?: string; // Add priority field
}


