// parseWorkout.ts
import { ParsedWorkout } from './types';

function formatWeightForUI(weight: any): string | undefined {
  if (!weight) return undefined;
  if (typeof weight === 'string') return weight;
  if (weight.rx && weight.scaled) {
    return `(${weight.rx}/${weight.scaled})`;
  } else if (weight.rx) {
    return `(${weight.rx})`;
  }
  return undefined;
}

/**
 * basicParseWorkout
 * -----------------
 * This function is for user-typed raw text from Step 1.
 * It tries to detect AMRAP, EMOM, MetCon rounds, etc., from plain text.
 */
export function basicParseWorkout(details: string): ParsedWorkout {
  const lines = details.trim().split('\n').map(l => l.trim()).filter(l => l !== '');
  
  let type = 'Unknown';
  const notes: string[] = [];
  const workoutBlocks: any[] = [];
  let rounds: number | undefined;
  let duration: string | undefined;

  if (lines.length > 0) {
    const firstLine = lines[0].toLowerCase();

    if (firstLine.includes('hero wod')) {
      type = 'Hero WOD';
    } else if (firstLine.includes('amrap')) {
      type = 'AMRAP';
      const match = firstLine.match(/amrap\s+(\d+)/i);
      if (match) duration = `${match[1]} minutes`;
    } else if (firstLine.match(/\d+\s+rounds/i)) {
      type = 'MetCon';
      const match = firstLine.match(/(\d+)\s+rounds/i);
      if (match) rounds = parseInt(match[1]);
    } else if (firstLine.includes('emom')) {
      type = 'EMOM';
      const match = firstLine.match(/emom\s+(\d+)/i);
      if (match) duration = `${match[1]} minutes`;
    }
  }

  let movementLines = lines;
  if (type !== 'Unknown') {
    movementLines = lines.slice(1); // remove descriptor line
  }

  const movementObjects = movementLines.map(line => ({ name: line }));
  workoutBlocks.push({ rounds, lines: movementObjects });

  return {
    type,
    notes,
    workoutBlocks,
    scalingGuidelines: undefined,
    duration
  };
}

/**
 * parseWorkoutDescription
 * -----------------------
 * This function is for database-stored template descriptions.
 * It takes a structured JSON `description` with `type`, `duration`, `workout` blocks,
 * and converts it into a ParsedWorkout object suitable for WorkoutDisplay.
 */
export function parseWorkoutDescription(jsonData: any): ParsedWorkout {
  if (!jsonData) {
    return {
      type: 'Unknown',
      notes: [],
      workoutBlocks: [],
    };
  }

  const { type, notes, workout, duration, priority, scaling_guidelines } = jsonData;
  const parsedNotes = Array.isArray(notes) ? notes : [];

  const workoutBlocks = Array.isArray(workout)
    ? workout.map((block: any) => {
        const lines = [];
        if (block.movements && Array.isArray(block.movements)) {
          for (const mov of block.movements) {
            // Convert reps if it's just a single number into that number,
            // if it's an array or 'Max', keep as is.
            let repsVal: number | number[] | 'Max' | undefined = mov.reps;
            if (typeof mov.reps === 'number') {
              repsVal = mov.reps;
            } else if (Array.isArray(mov.reps)) {
              repsVal = mov.reps;
            } else if (mov.reps === 'Max') {
              repsVal = 'Max';
            }

            lines.push({
              name: mov.name || 'Unknown Movement',
              reps: repsVal,
              weight: formatWeightForUI(mov.weight),
              notes: Array.isArray(mov.notes) ? mov.notes : [],
              modality: mov.modality,
              minute: mov.minute,
              distance: mov.distance,
              duration_seconds: mov.duration_seconds,
              scaling: Array.isArray(mov.scaling) ? mov.scaling : undefined, // capture scaling arrays
            });
          }
        } else if (block.name && block.reps) {
          let repsVal: number | number[] | 'Max' | undefined = block.reps;
          if (typeof block.reps === 'number') {
            repsVal = block.reps;
          } else if (Array.isArray(block.reps)) {
            repsVal = block.reps;
          } else if (block.reps === 'Max') {
            repsVal = 'Max';
          }

          lines.push({
            name: block.name,
            reps: repsVal,
            weight: formatWeightForUI(block.weight),
            notes: Array.isArray(block.notes) ? block.notes : [],
            modality: block.modality,
          });
        }

        return {
          title: block.name,
          rounds: block.rounds,
          format: block.format,
          lines,
        };
      })
    : [];

  return {
    type: type || 'Unknown',
    notes: parsedNotes,
    workoutBlocks,
    scalingGuidelines: scaling_guidelines || undefined,
    duration: duration || undefined,
    priority: priority || undefined, // include priority if present
  };
}

