// app/api/parse-workout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';
import { parseWorkoutText } from '@/utils/workoutParser';

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
  const { data: movements, error } = await supabase
    .from('movements')
    .select('*');

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