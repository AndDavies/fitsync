import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'  // if using auth-helpers with RLS

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { class_schedule_id } = await req.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Check if user already registered
  let { data: existing, error: existingError } = await supabase
    .from('class_registrations')
    .select('id, status')
    .eq('class_schedule_id', class_schedule_id)
    .eq('user_profile_id', user.id)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 })
  }

  if (existing) {
    return NextResponse.json({ error: 'Already registered', status: existing.status }, { status: 400 })
  }

  // Get confirmed count
  const { count: confirmedCount, error: confirmedError } = await supabase
    .from('class_registrations')
    .select('id', { count: 'exact' })
    .eq('class_schedule_id', class_schedule_id)
    .eq('status', 'confirmed')

  if (confirmedError) {
    return NextResponse.json({ error: confirmedError.message }, { status: 400 })
  }

  const { data: scheduleData, error: scheduleError } = await supabase
    .from('class_schedules')
    .select('max_participants')
    .eq('id', class_schedule_id)
    .maybeSingle()

  if (scheduleError || !scheduleData) {
    return NextResponse.json({ error: 'Unable to fetch schedule data' }, { status: 400 })
  }

  const confirmed = confirmedCount || 0
  const status = confirmed < scheduleData.max_participants ? 'confirmed' : 'waitlisted'

  const { error: insertError } = await supabase
    .from('class_registrations')
    .insert({
      class_schedule_id,
      user_profile_id: user.id,
      registration_date: new Date().toISOString(),
      status
    })
    
  if (insertError) {
    return NextResponse.json({ error: 'Failed to register: ' + insertError.message }, { status: 400 })
  }

  return NextResponse.json({ status }, { status: 200 })
}
