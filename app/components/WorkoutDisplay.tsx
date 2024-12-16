import React from 'react';
import { ParsedWorkout } from './types';

interface WorkoutDisplayProps {
  workoutData: ParsedWorkout;
  workoutName?: string; // if you want to show workout name too
}

function interpretWorkoutHeading(workoutData: ParsedWorkout): string {
  const { type, workoutBlocks, duration } = workoutData;
  let heading = '';

  const blockWithRounds = workoutBlocks.find(b => b.rounds);

  if (type === "MetCon" && blockWithRounds) {
    heading = `${blockWithRounds.rounds} Rounds for time of:`;
  } else if (type === "AMRAP" && duration) {
    heading = `AMRAP ${duration}:`;
  } else if (type === "EMOM" && duration) {
    heading = `EMOM ${duration}`;
  } else if (type.toLowerCase().includes('hero wod')) {
    heading = 'HERO WOD';
  }

  return heading;
}

/**
 * Format a single movement line. If `line.reps` is an array, we treat each entry as a separate set.
 * If `line.reps` is a single number or "Max", we just return one line.
 */
function formatMovementLines(line: any): string[] {
  const lines: string[] = [];

  // If reps is an array, we assume multiple sets
  if (Array.isArray(line.reps)) {
    line.reps.forEach((repCount: number | string, i: number) => {
      let setStr = `Set ${i + 1}: `;
      if (repCount === 'Max') {
        setStr += 'Max ';
      } else if (typeof repCount === 'number') {
        setStr += `${repCount} `;
      }

      if (line.name) {
        setStr += line.name;
      }

      if (line.distance) {
        setStr += `, ${line.distance}`;
      }

      // If there's a weight or intensity, we could append it here
      if (line.weight) {
        setStr += ` @ ${line.weight}`;
      }

      lines.push(setStr.trim());
    });
  } else {
    // Single set or no reps array
    let lineStr = '';
    if (line.minute) {
      lineStr += line.minute.toUpperCase() + ': ';
    }

    if (line.reps !== undefined) {
      if (line.reps === 'Max') {
        lineStr += 'Max ';
      } else if (typeof line.reps === 'number') {
        lineStr += line.reps + ' ';
      }
    }

    if (line.name) {
      lineStr += line.name;
    }

    if (line.distance) {
      lineStr += `, ${line.distance}`;
    }

    if (line.weight) {
      lineStr += ` @ ${line.weight}`;
    }

    lines.push(lineStr.trim());
  }

  return lines;
}

function humanizeKey(key: string): string {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const WorkoutDisplay: React.FC<WorkoutDisplayProps> = ({ workoutData, workoutName }) => {
  const { notes, workoutBlocks, priority, scalingGuidelines } = workoutData;
  const heading = interpretWorkoutHeading(workoutData);

  return (
    <div className="space-y-4 p-4 bg-gray-700 rounded-md border border-gray-600 text-gray-100">
      {workoutName && <h2 className="text-2xl font-bold text-gray-100">{workoutName}</h2>}
      {heading && <h3 className="text-xl font-semibold text-gray-100">{heading}</h3>}

      {priority && (
        <div className="text-sm text-gray-300">Priority: {priority}</div>
      )}

      {workoutBlocks.map((block, idx) => (
        <div key={idx} className="space-y-1">
          {block.title && (
            <h4 className="text-md font-semibold text-gray-100">{block.title}</h4>
          )}
          <div className="space-y-1">
            {block.lines.map((line, lineIdx) => {
              const lineOutputs = formatMovementLines(line);
              return lineOutputs.map((lo, innerIdx) => (
                <div key={lineIdx + '-' + innerIdx} className="flex items-start space-x-2">
                  <span className="text-gray-500">—</span>
                  <span className="text-sm text-gray-200">{lo}</span>
                </div>
              ));
            })}
          </div>
        </div>
      ))}

      {notes && notes.length > 0 && (
        <div className="p-3 bg-gray-600 rounded space-y-1 border border-gray-500">
          <h4 className="text-sm font-semibold mb-1 text-gray-100">Additional Notes:</h4>
          <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
            {notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}

      {scalingGuidelines && (
        <div className="p-3 bg-gray-600 border border-gray-500 rounded text-sm text-gray-200 space-y-1">
          <h4 className="font-semibold mb-1 text-gray-100">Scaling Guidelines:</h4>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(scalingGuidelines).map(([key, val], i) => (
              <li key={i}>{humanizeKey(key)}: {String(val)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WorkoutDisplay;