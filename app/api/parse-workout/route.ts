// app/api/parse-workout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';
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

export async function POST(req: NextRequest) {
  console.log('parse-workout endpoint hit');
  
  let workoutText: string | undefined;
  try {
    const jsonBody = await req.json();
    workoutText = jsonBody.workoutText;
  } catch (err) {
    console.error('Error reading request body:', err);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  console.log('Received workoutText:', workoutText);

  if (!workoutText || typeof workoutText !== 'string') {
    console.warn('No valid workoutText provided');
    return NextResponse.json({ error: 'No workoutText provided' }, { status: 400 });
  }

  console.log('Fetching movements from DB...');
  const { data: movements, error } = await supabase.from('movements').select('*');

  if (error) {
    console.error('Error fetching movements:', error);
    return NextResponse.json({ error: 'Failed to fetch movements' }, { status: 500 });
  }

  if (!movements || movements.length === 0) {
    console.warn('No movements found in the database');
    return NextResponse.json({ error: 'No movements found' }, { status: 404 });
  }

  console.log(`Fetched ${movements.length} movements from DB`, movements.map(m => m.name));

  try {
    console.log('Parsing workout text...');
    const structuredWorkout = await parseWorkoutText(workoutText, movements);
    console.log('Structured Workout:', structuredWorkout);

    return NextResponse.json({ structuredWorkout }, { status: 200 });
  } catch (err: any) {
    console.error('Error parsing workout:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Parsing Logic Integrated Below
 */

function isSectionHeader(line: string): boolean {
  // Consider whether you want lines like "HERO WOD" to be a section header or a type trigger.
  // For now, treat section headers as fully uppercase and longer than 3 chars.
  return line === line.toUpperCase() && line.length > 3;
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

async function parseWorkoutText(rawText: string, movementsFromDB: MovementEntry[]): Promise<ParsedWorkout> {
  console.log("parseWorkoutText called with text:", rawText);
  let lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const parsedWorkout: ParsedWorkout = {
    type: 'Unknown',
    notes: [],
    workoutBlocks: []
  };

  // If the first line looks like a known workout type (e.g., "Hero WOD"), set type
  if (lines.length > 0) {
    const firstLineLower = lines[0].toLowerCase();
    if (firstLineLower.includes("hero wod")) {
      parsedWorkout.type = "Hero WOD";
      lines.shift(); // remove the first line so it won't be treated as a header or movement line
    } else if (firstLineLower.includes("amrap")) {
      parsedWorkout.type = "AMRAP";
      lines.shift();
    } else if (firstLineLower.includes("emom")) {
      parsedWorkout.type = "EMOM";
      lines.shift();
    } else if (firstLineLower.includes("metcon")) {
      parsedWorkout.type = "MetCon";
      lines.shift();
    }
    // Add more conditions if you have other recognizable workout types
  }

  const workoutBlocks: ParsedWorkoutBlock[] = [];
  let currentBlock: ParsedWorkoutBlock = { lines: [] };

  for (const line of lines) {
    console.log("Processing line:", line);
    if (isSectionHeader(line)) {
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
      currentBlock.lines.push({ name: line });
    }
  }

  if (currentBlock.lines.length > 0 || currentBlock.title) {
    workoutBlocks.push(currentBlock);
  }

  parsedWorkout.workoutBlocks = workoutBlocks;
  return parsedWorkout;
}
