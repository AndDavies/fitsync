// app/api/parse-workout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Import your parsed workout interfaces
import { ParsedWorkout, ParsedWorkoutBlock, ParsedMovement } from "@/app/components/types";

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

/**
 * POST /api/parse-workout
 * 
 * Requires a JSON body:
 * {
 *    "workoutText": string
 * }
 * 
 * Returns a structured workout JSON object if successful.
 */
export async function POST(req: NextRequest) {
  console.log("[parse-workout] endpoint hit");

  // 1) Gather cookies for the SSR-based client
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // 2) Create the Supabase server client (no manual cookie parsing)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {},
    },
  });

  // 3) (Optional) Check if user is authenticated
  //    Remove this if you want parse-workout open to everyone.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.warn("[parse-workout] Not authenticated");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 4) Parse the request body
  let workoutText: string | undefined;
  try {
    const jsonBody = await req.json();
    workoutText = jsonBody.workoutText;
  } catch (err) {
    console.error("[parse-workout] Error reading request body:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  console.log("[parse-workout] Received workoutText:", workoutText);

  if (!workoutText || typeof workoutText !== "string") {
    console.warn("[parse-workout] No valid workoutText provided");
    return NextResponse.json({ error: "No workoutText provided" }, { status: 400 });
  }

  // 5) Fetch movements from DB (using the SSR client)
  console.log("[parse-workout] Fetching movements from DB...");
  const { data: movements, error: fetchError } = await supabase.from("movements").select("*");

  if (fetchError) {
    console.error("[parse-workout] Error fetching movements:", fetchError);
    return NextResponse.json({ error: "Failed to fetch movements" }, { status: 500 });
  }

  if (!movements || movements.length === 0) {
    console.warn("[parse-workout] No movements found in the database");
    return NextResponse.json({ error: "No movements found" }, { status: 404 });
  }

  console.log(`[parse-workout] Fetched ${movements.length} movements from DB`, movements.map((m) => m.name));

  // 6) Attempt to parse the workout text
  try {
    console.log("[parse-workout] Parsing workout text...");
    const structuredWorkout = await parseWorkoutText(workoutText, movements);
    console.log("[parse-workout] Structured Workout:", structuredWorkout);

    return NextResponse.json({ structuredWorkout }, { status: 200 });
  } catch (err: any) {
    console.error("[parse-workout] Error parsing workout:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * ----------------------
 * Parsing Logic Below
 * ----------------------
 */

/**
 * Identifies lines that are likely section headers (all uppercase, > 3 chars).
 */
function isSectionHeader(line: string): boolean {
  return line === line.toUpperCase() && line.length > 3;
}

/**
 * Parses a single movement line, attempts to map it to a known movement from DB,
 * and returns a ParsedMovement or null.
 */
function parseMovementLine(line: string, movementsFromDB: MovementEntry[]): ParsedMovement | null {
  let [movementPart, setsPart] = line.split(":").map((s) => s.trim());

  // If we don't see a ":" pattern, try detecting a "3x10" style pattern
  if (!setsPart) {
    const regex = /(.+?)\s+(\d+x\d+)(.*)/;
    const match = line.match(regex);
    if (match) {
      movementPart = match[1].trim();
      const repScheme = match[2];
      setsPart = repSchemeToString(repScheme);

      let intensity: string | undefined;
      const remainder = match[3].trim();
      if (remainder.includes("@")) {
        intensity = remainder.split("@")[1].trim();
      }

      const parsedReps = parseReps(setsPart);
      const { matchedName, movementId } = bestMatchMovementName(movementPart, movementsFromDB);
      return {
        name: matchedName,
        reps: parsedReps,
        weight: intensity,
        ...(movementId && { movement_id: movementId }),
      };
    }

    // If there's no match for that pattern, just do a name match with no reps
    const { matchedName, movementId } = bestMatchMovementName(movementPart, movementsFromDB);
    return { name: matchedName, ...(movementId && { movement_id: movementId }) };
  }

  // If we do have setsPart from the "movement: sets" pattern
  const parsedReps = parseReps(setsPart);
  const { matchedName, movementId } = bestMatchMovementName(movementPart, movementsFromDB);
  return {
    name: matchedName,
    reps: parsedReps,
    ...(movementId && { movement_id: movementId }),
  };
}

/**
 * Converts "3x10" to "10-10-10", for example.
 */
function repSchemeToString(repScheme: string): string {
  const match = repScheme.match(/(\d+)x(\d+)/);
  if (match) {
    const sets = parseInt(match[1], 10);
    const reps = parseInt(match[2], 10);
    return Array(sets).fill(reps).join("-");
  }
  return repScheme;
}

/**
 * Parses a hyphen-separated string (e.g. "10-10-10") into an array of numbers.
 */
function parseReps(setsPart: string): number[] {
  return setsPart
    .split("-")
    .map((r) => parseInt(r.trim(), 10))
    .filter((n) => !isNaN(n));
}

/**
 * Attempts to match a movement name from the DB, either exact or from aliases.
 * Returns a standardized name and an optional movementId if matched.
 */
function bestMatchMovementName(
  inputName: string,
  movementsFromDB: MovementEntry[],
): { matchedName: string; movementId?: number } {
  const lowerInput = inputName.toLowerCase().replace(/s$/, ""); // strip trailing "s"
  let found = movementsFromDB.find((m) => m.name.toLowerCase() === lowerInput);

  if (!found) {
    found = movementsFromDB.find(
      (m) => m.common_aliases && m.common_aliases.some((a) => a.toLowerCase() === lowerInput),
    );
  }

  const titleCased = inputName
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  return found
    ? { matchedName: found.name, movementId: found.id }
    : { matchedName: titleCased };
}

/**
 * Main parser function: splits the workout text by lines, identifies sections,
 * detects "HERO WOD"/"AMRAP"/"EMOM"/"MetCon" from the first line, etc.
 */
async function parseWorkoutText(rawText: string, movementsFromDB: MovementEntry[]): Promise<ParsedWorkout> {
  console.log("[parseWorkoutText] called with text:", rawText);
  let lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const parsedWorkout: ParsedWorkout = {
    type: "Unknown",
    notes: [],
    workoutBlocks: [],
  };

  // Check first line for a known workout type
  if (lines.length > 0) {
    const firstLineLower = lines[0].toLowerCase();
    if (firstLineLower.includes("hero wod")) {
      parsedWorkout.type = "Hero WOD";
      lines.shift(); // remove from lines
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
  }

  const workoutBlocks: ParsedWorkoutBlock[] = [];
  let currentBlock: ParsedWorkoutBlock = { lines: [] };

  for (const line of lines) {
    console.log("[parseWorkoutText] Processing line:", line);
    if (isSectionHeader(line)) {
      // If the current block has content, push it
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
      // If no match, store it as a raw line
      currentBlock.lines.push({ name: line });
    }
  }

  // Push the final block if non-empty
  if (currentBlock.lines.length > 0 || currentBlock.title) {
    workoutBlocks.push(currentBlock);
  }

  parsedWorkout.workoutBlocks = workoutBlocks;
  return parsedWorkout;
}