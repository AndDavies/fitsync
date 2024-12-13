"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase/client';
import { MdOutlineContentCopy } from 'react-icons/md';
import { parseWorkoutDescription } from './parseWorkout';
import WorkoutDisplay from './WorkoutDisplay';
import { Card, Text, Spacer } from '@geist-ui/core';

type Workout = {
  title: string;
  description: Record<string, any> | null;
};

type WorkoutIdeasProps = {
  setWorkoutBuilderText: (text: string) => void;
  category: string;
};

function formatReps(reps: any) {
  if (Array.isArray(reps)) {
    return reps.join('-');
  }
  return reps ?? '';
}

function formatWeight(weight: any) {
  if (!weight) return '';
  if (typeof weight === 'string') return weight;
  if (weight.rx && weight.scaled) {
    return `(${weight.rx}/${weight.scaled})`;
  } else if (weight.rx) {
    return `(${weight.rx})`;
  }
  return '';
}

function formatMovements(movements: any[]): string[] {
  return movements.map((mov) => {
    let line = '';

    if (mov.minute) {
      line += `${mov.minute.toUpperCase()}: `;
    }

    if (mov.duration_seconds) {
      line += `${mov.duration_seconds}s `;
    }

    if (mov.distance) {
      line += `${mov.distance} `;
    } else if (mov.reps !== undefined && mov.reps !== 'Max') {
      line += `${formatReps(mov.reps)} `;
    } else if (mov.reps === 'Max') {
      line += `Max `;
    }

    if (mov.name) {
      line += mov.name;
    }

    if (mov.weight) {
      line += ` ${formatWeight(mov.weight)}`;
    }

    return line.trim();
  });
}

function formatWorkoutBlock(block: any): string[] {
  const lines: string[] = [];
  if (block.movements && Array.isArray(block.movements)) {
    lines.push(...formatMovements(block.movements));
  } else if (block.name && block.reps) {
    const repsString = Array.isArray(block.reps) ? block.reps.join('-') : block.reps;
    let line = `${block.name}: ${repsString}`;
    if (block.weight) {
      line += ` ${formatWeight(block.weight)}`;
    }
    lines.push(line);
  }
  return lines;
}

function formatDescription(description: Record<string, any> | null): string {
  if (!description) return '';

  const { type, duration, workout } = description;
  let lines: string[] = [];

  const shortDuration = duration ? duration.replace(' minutes', '') : '';

  switch (type) {
    case 'Strength':
      lines.push('STRENGTH');
      if (workout && Array.isArray(workout)) {
        for (const block of workout) {
          lines.push(...formatWorkoutBlock(block));
        }
      }
      break;

    case 'EMOM':
      lines.push(`EMOM ${shortDuration}`);
      if (workout && Array.isArray(workout)) {
        for (const block of workout) {
          if (block.movements) lines.push(...formatMovements(block.movements));
        }
      }
      break;

    case 'Accessory':
      lines.push('ACCESSORY');
      if (workout && Array.isArray(workout)) {
        for (const block of workout) {
          if (block.rounds) lines.push(`${block.rounds} ROUNDS:`);
          if (block.movements) lines.push(...formatMovements(block.movements));
        }
      }
      break;

    case 'Hero WOD':
      lines.push('HERO WOD');
      if (workout && Array.isArray(workout)) {
        for (const block of workout) {
          if (block.movements) lines.push(...formatMovements(block.movements));
        }
      }
      break;

    case 'Conditioning':
      lines.push('CONDITIONING');
      if (workout && Array.isArray(workout)) {
        for (const block of workout) {
          if (block.rounds) lines.push(`${block.rounds} ROUNDS:`);
          if (block.movements) lines.push(...formatMovements(block.movements));
        }
      }
      break;

    case 'MetCon':
      lines.push('METCON');
      if (workout && Array.isArray(workout)) {
        for (const block of workout) {
          if (block.rounds) lines.push(`${block.rounds} ROUNDS:`);
          if (block.movements) lines.push(...formatMovements(block.movements));
        }
      }
      break;

    case 'AMRAP':
      lines.push(`AMRAP ${shortDuration || ''}`.trim());
      if (workout && Array.isArray(workout)) {
        for (const block of workout) {
          if (block.movements) lines.push(...formatMovements(block.movements));
        }
      }
      break;

    case 'Weightlifting':
      lines.push(`WEIGHTLIFTING ${shortDuration}`);
      if (workout && Array.isArray(workout)) {
        for (const block of workout) {
          if (block.format) lines.push(block.format.toUpperCase());
          if (block.movements) lines.push(...formatMovements(block.movements));
        }
      }
      break;

    case 'Interval Training':
      lines.push('INTERVAL TRAINING');
      if (workout && Array.isArray(workout)) {
        for (const block of workout) {
          if (block.rounds) lines.push(`${block.rounds} ROUNDS:`);
          if (block.movements) lines.push(...formatMovements(block.movements));
        }
      }
      break;

    default:
      return JSON.stringify(description, null, 2);
  }

  return lines.join('\n');
}

const WorkoutIdeas: React.FC<WorkoutIdeasProps> = ({ setWorkoutBuilderText, category }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [search, setSearch] = useState('');
  const [detailedView, setDetailedView] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (!category) return;
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

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) =>
      w.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [workouts, search]);

  const handleCopyWorkout = useCallback(
    async (description: Record<string, any> | null) => {
      const text = formatDescription(description);
      setWorkoutBuilderText(text);
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.warn('Failed to copy to clipboard', err);
      }
    },
    [setWorkoutBuilderText]
  );

  const toggleViewMode = (index: number) => {
    setDetailedView((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <Card 
      width="100%" 
      style={{ maxHeight: '600px', overflowY: 'auto', backgroundColor: '#1F2937', border: '1px solid #374151' }} 
      className="text-gray-200"
    >
      <Card.Content>
        <input
          placeholder="Search workouts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-800 text-gray-200"
        />
      </Card.Content>
      <Card.Content>
        {filteredWorkouts.map((workout, index) => {
          const isDetailed = detailedView[index] || false;
          const parsed = isDetailed && workout.description
            ? parseWorkoutDescription(workout.description)
            : null;
          const workoutText = formatDescription(workout.description);

          return (
            <Card 
              key={index} 
              width="100%" 
              style={{ marginBottom: '16px', backgroundColor: '#1F2937', border: '1px solid #374151' }}
            >
              <Card.Content>
                <Text b style={{ color: '#F9FAFB' }}>{workout.title}</Text>
                <Spacer height="0.5rem" />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => toggleViewMode(index)}
                    className="text-xs py-1 px-2 rounded text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {isDetailed ? "View: Text" : "View: Detailed"}
                  </button>

                  <button
                    onClick={() => handleCopyWorkout(workout.description).catch(err => console.warn(err))}
                    className="text-xs py-1 px-2 bg-pink-500 hover:bg-pink-600 text-white rounded flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <MdOutlineContentCopy className="text-white" />
                    <span>Copy</span>
                  </button>
                </div>
              </Card.Content>
              <Card.Content>
                {isDetailed ? (
                  parsed ? (
                    <WorkoutDisplay workoutData={parsed} />
                  ) : (
                    <Text small type="secondary" style={{ color: '#9CA3AF' }}>No detailed data available.</Text>
                  )
                ) : (
                  <textarea
                    readOnly
                    value={workoutText}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #4B5563',
                      borderRadius: '4px',
                      resize: 'none',
                      overflow: 'hidden',
                      fontSize: '0.875rem',
                      backgroundColor: '#111827',
                      color: '#F9FAFB',
                      minHeight: '6em'
                    }}
                    className="focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                )}
              </Card.Content>
            </Card>
          );
        })}
      </Card.Content>
    </Card>
  );
};

export default WorkoutIdeas;
