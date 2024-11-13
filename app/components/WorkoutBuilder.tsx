// components/WorkoutBuilder.tsx

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { LiaBarsSolid } from 'react-icons/lia';

type WorkoutLine = {
  id: string;
  content: string;
  type: 'focus' | 'sets' | 'intensity' | 'details';
  isFixed?: boolean;
};

type WorkoutBuilderProps = {
  workoutText: string;
  setWorkoutText: (text: string) => void;
};

// Helper function to parse workout text
const parseWorkoutText = (workoutText: string): WorkoutLine[] => {
  const lines = workoutText.split('\n').filter((line) => line.trim());
  const parsedLines: WorkoutLine[] = [];

  lines.forEach((line, index) => {
    if (index === 0) {
      parsedLines.push({
        id: `item-${index}`,
        content: line.trim(),
        type: 'focus',
        isFixed: true,
      });
    } else if (/^\d+(-\d+)+$/.test(line.trim())) {
      parsedLines.push({
        id: `item-${index}`,
        content: line.trim(),
        type: 'sets',
        isFixed: false,
      });
    } else if (/RPE\s*\d+(-\d+)?/.test(line)) {
      parsedLines.push({
        id: `item-${index}`,
        content: line.trim(),
        type: 'intensity',
        isFixed: false,
      });
    } else {
      parsedLines.push({
        id: `item-${index}`,
        content: line.trim(),
        type: 'details',
        isFixed: false,
      });
    }
  });

  return parsedLines;
};

// Scoring and advanced options hard-coded as arrays
const SCORING_SETS_OPTIONS = Array.from({ length: 10 }, (_, i) => `${i + 1} sets`);
const SCORING_TYPES_OPTIONS = [
  'Time', 'Rounds + Reps', 'Reps', 'Load', 'Calories', 'Meters', 
  'Check Box', 'Other', 'Not Scored'
];
const ADVANCED_SCORING_OPTIONS = ['Minimum', 'Maximum', 'Average'];
const ORDER_TYPE_OPTIONS = ['Descending', 'Ascending'];

const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({ workoutText, setWorkoutText }) => {
  const [workoutDate, setWorkoutDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [parsedLines, setParsedLines] = useState<WorkoutLine[]>([]);
  const [scoringSet, setScoringSet] = useState(SCORING_SETS_OPTIONS[0]);
  const [scoreType, setScoreType] = useState(SCORING_TYPES_OPTIONS[0]);
  const [advancedScoring, setAdvancedScoring] = useState(ADVANCED_SCORING_OPTIONS[0]);
  const [orderType, setOrderType] = useState(ORDER_TYPE_OPTIONS[0]);

  const router = useRouter();

  const handleParseWorkout = () => {
    const lines = parseWorkoutText(workoutText);
    setParsedLines(lines);
  };

  const handlePlanWorkout = async () => {
    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert('You need to be logged in to plan a workout.');
      console.error('Error fetching user:', userError);
      return;
    }

    // First, check if the workout exists in the workouts table or insert it
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .select('workoutid')
      .eq('description', workoutText)
      .single();

    let workoutId;
    
    if (workoutError) {
      // If the workout does not exist, insert it into the workouts table
      const { data: newWorkout, error: insertError } = await supabase
        .from('workouts')
        .insert({
          description: workoutText,
          title: "Untitled Workout", // Default title
        })
        .select('workoutid')
        .single();

      if (insertError || !newWorkout) {
        console.error('Error inserting new workout:', insertError?.message);
        alert(`There was an error creating the workout: ${insertError?.message}`);
        return;
      }
      workoutId = newWorkout.workoutid;
    } else {
      // If it exists, use the existing workoutid
      workoutId = workoutData.workoutid;
    }

    // Now, insert the workout into the scheduled_workouts table with the workout_id
    const { error: scheduleError } = await supabase
      .from('scheduled_workouts')
      .insert({
        user_id: user.id,
        date: workoutDate,
        workout_details: workoutText,
        scoring_set: scoringSet,
        scoring_type: scoreType,
        advanced_scoring: advancedScoring,
        order_type: orderType,
        status: 'planned',
        workout_id: workoutId,  // Referencing the workout from workouts table
      });

    if (scheduleError) {
      console.error('Error scheduling workout:', scheduleError.message);
      alert(`There was an error scheduling the workout: ${scheduleError.message}`);
      return;
    }

    // Redirect to the daily page with the date parameter
    router.push(`/plan/daily?date=${workoutDate}`);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.source.index === 0) return;

    const items = Array.from(parsedLines);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setParsedLines(items);
  };

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
      <div className="mb-4">
        <label htmlFor="workout-input" className="block text-sm font-semibold mb-1 text-gray-500">
          Workout Details
        </label>
        <textarea
          id="workout-input"
          value={workoutText}
          onChange={(e) => setWorkoutText(e.target.value)}
          placeholder="Enter your workout details here..."
          className="w-full p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 h-28"
        />
      </div>
      <div className="flex space-x-2 mt-3">
        <button
          onClick={handleParseWorkout}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded hover:bg-gray-300 transition text-sm"
        >
          Continue
        </button>
        <button
          onClick={handlePlanWorkout}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-400 transition text-sm"
        >
          Plan It
        </button>
      </div>

      {/* Render parsed workout details */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="workout-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-1 mt-6"
            >
              {parsedLines.map((line, index) => (
                line.isFixed ? (
                  <div
                    key={line.id}
                    className="p-2 border-b border-gray-200 bg-gray-200 font-bold text-sm text-gray-700"
                  >
                    <span>{line.content}</span>
                  </div>
                ) : (
                  <Draggable
                    key={line.id}
                    draggableId={line.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-2 border-b border-gray-200 bg-gray-50 text-sm text-gray-700 flex items-center ${
                          snapshot.isDragging ? 'bg-gray-100' : ''
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                          transition: 'transform 0.1s ease',
                        }}
                      >
                        <LiaBarsSolid className="text-gray-400 mr-2" />
                        <span>{line.content}</span>
                      </div>
                    )}
                  </Draggable>
                )
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default WorkoutBuilder;
