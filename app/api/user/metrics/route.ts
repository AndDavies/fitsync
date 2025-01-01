import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"
// ^ Tells Next.js this route is fully dynamic, if needed

export async function GET() {
  // 1) Properly retrieve cookies for a dynamic route
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // 2) Guaranteed validated user data
  //    This calls the Supabase Auth server to confirm the user's identity
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    // If there's an error contacting Supabase Auth,
    // return a 500 or handle as you prefer
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

  const user = userData?.user
  if (!user) {
    // Means the user is not authenticated (or token is invalid)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // 3) We have a validated user, proceed with query
  const userId = user.id
  const now = new Date()
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)

  const { data: results, error } = await supabase
    .from("workout_results")
    .select("id, date_logged")
    .eq("user_profile_id", userId)
    .gte("date_logged", sevenDaysAgo.toISOString())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const workoutsCompleted = results ? results.length : 0
  return NextResponse.json({ workouts_completed_past_7_days: workoutsCompleted })
}