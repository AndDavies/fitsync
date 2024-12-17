// app/utils/workoutParser.ts

import { ParsedWorkout, ParsedWorkoutBlock, ParsedMovement } from '@/app/components/types';

interface MovementEntry {
  id: number;
  name: string;
  description: string;
  common_aliases: string[];
  variations: Record<string, string>;
  equipment_required: boolean;
  default_reps: number;
  common_sets: number;
  common_weight_range: string;
}

export async function parseWorkoutText(rawText: string, movementsFromDB: MovementEntry[]): Promise<ParsedWorkout> {
  console.log("parseWorkoutText called with text:", rawText);
  let lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Create a basic ParsedWorkout first
  const parsedWorkout: ParsedWorkout = {
    type: 'Unknown',
    notes: [],
    workoutBlocks: []
  };

  // Check the first line for known keywords or patterns:
  if (lines.length > 0) {
    const firstLine = lines[0].toLowerCase();
    if (firstLine.includes("hero wod")) {
      parsedWorkout.type = "Hero WOD";
      lines.shift(); // Remove the line so it won't be treated as a section header
    } else if (firstLine.includes("amrap")) {
      parsedWorkout.type = "AMRAP";
      lines.shift();
    } else if (firstLine.includes("emom")) {
      parsedWorkout.type = "EMOM";
      lines.shift();
    } else if (firstLine.includes("metcon")) {
      parsedWorkout.type = "MetCon";
      lines.shift();
    }
    // Add other checks if needed for other types (Conditioning, Strength, etc.)
  }

  const workoutBlocks: ParsedWorkoutBlock[] = [];
  let currentBlock: ParsedWorkoutBlock = { lines: [] };

  for (const line of lines) {
    console.log("Processing line:", line);
    if (isSectionHeader(line)) {
      // If we hit a section header, finish the current block (if it has any lines or title)
      if (currentBlock.lines.length > 0 || currentBlock.title) {
        workoutBlocks.push(currentBlock);
      }
      currentBlock = { title: line, lines: [] };
      continue;
    }

    const parsedLine = parseMovementLine(line, movementsFromDB);
    if (parsedLine) {
      currentBlock.lines.push(parsedLine);
    } else {
      // If we can't parse it as a known movement line, just store it as a name-only movement
      currentBlock.lines.push({ name: line });
    }
  }

  if (currentBlock.lines.length > 0 || currentBlock.title) {
    workoutBlocks.push(currentBlock);
  }

  parsedWorkout.workoutBlocks = workoutBlocks;
  return parsedWorkout;
}

function isSectionHeader(line: string): boolean {
  // Consider adjusting logic if "HERO WOD" is meant to set type, not be a header
  return line === line.toUpperCase() && line.length > 3 && !line.toLowerCase().includes("hero wod");
}


function parseMovementLine(line: string, movementsFromDB: MovementEntry[]): ParsedMovement | null {
  let [movementPart, setsPart] = line.split(':').map(s => s.trim());

  if (!setsPart) {
    const regex = /(.+?)\s+(\d+x\d+)(.*)/;
    const match = line.match(regex);
    if (match) {
      movementPart = match[1].trim();
      const repScheme = match[2];
      setsPart = repSchemeToString(repScheme);

      let intensity: string | undefined;
      const remainder = match[3].trim();
      if (remainder.includes('@')) {
        intensity = remainder.split('@')[1].trim();
      }

      const parsedReps = parseReps(setsPart);
      const { matchedName, movementId } = bestMatchMovementName(movementPart, movementsFromDB);
      return {
        name: matchedName,
        reps: parsedReps,
        weight: intensity,
        ...(movementId && { movement_id: movementId })
      };
    }

    const { matchedName, movementId } = bestMatchMovementName(movementPart, movementsFromDB);
    return { name: matchedName, ...(movementId && { movement_id: movementId }) };
  }

  const parsedReps = parseReps(setsPart);
  const { matchedName, movementId } = bestMatchMovementName(movementPart, movementsFromDB);
  return {
    name: matchedName,
    reps: parsedReps,
    ...(movementId && { movement_id: movementId })
  };
}

function repSchemeToString(repScheme: string): string {
  const match = repScheme.match(/(\d+)x(\d+)/);
  if (match) {
    const sets = parseInt(match[1], 10);
    const reps = parseInt(match[2], 10);
    return Array(sets).fill(reps).join('-');
  }
  return repScheme;
}

function parseReps(setsPart: string): number[] {
  return setsPart.split('-').map(r => parseInt(r.trim(), 10)).filter(n => !isNaN(n));
}

function bestMatchMovementName(inputName: string, movementsFromDB: MovementEntry[]): { matchedName: string; movementId?: number } {
  const lowerInput = inputName.toLowerCase().replace(/s$/, '');
  let found = movementsFromDB.find(m => m.name.toLowerCase() === lowerInput);

  if (!found) {
    found = movementsFromDB.find(m => 
      m.common_aliases && m.common_aliases.some(a => a.toLowerCase() === lowerInput)
    );
  }

  const titleCased = inputName
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

  return found ? { matchedName: found.name, movementId: found.id } : { matchedName: titleCased };
}