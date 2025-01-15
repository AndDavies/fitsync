import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

// Utility function to validate UUIDs
const isValidUUID = (id: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

// GET: Fetch classes for a gym
export async function GET(request: Request) {
  const url = new URL(request.url);
  const gymId = url.searchParams.get("current_gym_id");

  if (!gymId || !isValidUUID(gymId)) {
    return NextResponse.json({ error: "Invalid or missing gym ID." }, { status: 400 });
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("class_schedules")
    .select("*")
    .eq("gym_id", gymId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST: Create a new class
export async function POST(request: Request) {
  const body = await request.json();

  const { gym_id, class_name, track_id, start_time, end_time, max_participants } = body;

  if (!gym_id || !isValidUUID(gym_id) || !class_name || !start_time || !end_time) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  const supabase = createClient();
  const { data, error } = await supabase.from("class_schedules").insert([
    {
      gym_id,
      class_name,
      track_id,
      start_time,
      end_time,
      max_participants,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE: Delete a class
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const classId = url.searchParams.get("id");

  if (!classId || !isValidUUID(classId)) {
    return NextResponse.json({ error: "Invalid or missing class ID." }, { status: 400 });
  }
  const supabase = createClient();
  const { error } = await supabase.from("class_schedules").delete().eq("id", classId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
