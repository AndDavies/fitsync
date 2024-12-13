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

// Helper to format each movement line with all meta
function formatMovementLine(line: any): string {
  let lineStr = '';

  // If minute is given (e.g., "Even", "Odd"), prepend it
  if (line.minute) {
    lineStr += line.minute.toUpperCase() + ': ';
  }

  // If reps is defined, handle arrays or numbers or 'Max'
  if (line.reps !== undefined) {
    if (Array.isArray(line.reps)) {
      lineStr += line.reps.join('-') + ' ';
    } else if (line.reps === 'Max') {
      lineStr += 'Max ';
    } else if (typeof line.reps === 'number') {
      lineStr += line.reps + ' ';
    }
  }

  // Add the movement name
  if (line.name) {
    lineStr += line.name;
  }

  // If distance present, append it
  if (line.distance) {
    lineStr += `, ${line.distance}`;
  }

  return lineStr.trim();
}

// Convert underscore keys to title-cased phrases: "partition_movements" -> "Partition Movements"
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
            {block.lines.map((line, lineIdx) => (
              <div key={lineIdx} className="flex items-start space-x-2">
                <span className="text-gray-500">—</span>
                <span className="text-sm text-gray-200">{formatMovementLine(line)}</span>
              </div>
            ))}
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
