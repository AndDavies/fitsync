type Movement = {
    name: string;
    common_aliases: string[];
    default_reps?: number;
  };
  
  type ParsedWorkout = {
    workout_type: string | null;
    duration: number | null;
    movements: { name: string; reps: number }[];
    unparsed_lines: string[];
  };
  
  export function parseWorkout(inputText: string, movementDatabase: Movement[], defaultReps: number = 10): ParsedWorkout {
    const cleanedText = inputText.toLowerCase().trim();
    const lines = cleanedText.split('\n');
  
    const workoutTypeRegex = /(amrap|emom|rounds\s?ft|for time|tabata|chipper)/i;
    const movementRegex = /^(\d+)?\s*([\w\s-]+)/;
  
    let workout: ParsedWorkout = {
      workout_type: null,
      duration: null,
      movements: [],
      unparsed_lines: []
    };
  
    const aliasLookup = buildAliasLookup(movementDatabase);
  
    lines.forEach(line => {
      const workoutTypeMatch = line.match(workoutTypeRegex);
      const movementMatch = line.match(movementRegex);
  
      if (workoutTypeMatch) {
        workout.workout_type = workoutTypeMatch[1].toUpperCase();
        const durationMatch = line.match(/\d+/);
        workout.duration = durationMatch ? parseInt(durationMatch[0]) : null;
      } else if (movementMatch) {
        const [, repsStr, movementName] = movementMatch;
        const matchedMovement = findMovement(movementName, aliasLookup);
        if (matchedMovement) {
          const reps = repsStr ? parseInt(repsStr) : matchedMovement.default_reps || defaultReps;
          workout.movements.push({
            name: matchedMovement.name,
            reps: reps,
          });
        } else {
          workout.unparsed_lines.push(line.trim());
        }
      } else {
        workout.unparsed_lines.push(line.trim());
      }
    });
  
    return workout;
  }
  
  function buildAliasLookup(database: Movement[]): Map<string, Movement> {
    const lookup = new Map<string, Movement>();
    database.forEach(movement => {
      lookup.set(movement.name.toLowerCase(), movement);
      (movement.common_aliases || []).forEach(alias => lookup.set(alias.toLowerCase(), movement));
    });
    return lookup;
  }
  
  function findMovement(input: string, aliasLookup: Map<string, Movement>): Movement | null {
    return aliasLookup.get(input.trim().toLowerCase()) || null;
  }