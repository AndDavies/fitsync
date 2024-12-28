// File: app/api/class/cancel/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Create a Supabase client tied to server-side session
    const supabase = createRouteHandlerClient({ cookies });

    // 2. Get current session to find out which user is logged in
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - no user session found' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 3. Parse the incoming JSON body for class_schedule_id
    const { class_schedule_id } = await request.json();

    // 4. Remove (or update) the user's registration from the table
    //    If you prefer "soft" cancellations, do .update({ status: 'cancelled' }) instead.
    const { error: deleteError } = await supabase
      .from('class_registrations')
      .delete()
      .eq('class_schedule_id', class_schedule_id)
      .eq('user_profile_id', userId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      );
    }

    // 5. Return success
    return NextResponse.json({ success: true, message: 'Registration canceled' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
