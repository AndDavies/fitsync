import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase URL & Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gym_id = searchParams.get('gym_id');

  if (!gym_id) {
    return NextResponse.json({ error: 'gym_id is required' }, { status: 400 });
  }

  // We'll use RPC calls for the new metrics:
  // Assuming the following functions exist in your database:
  // total_active_members(gymid uuid) returns int
  // new_memberships_month(gymid uuid) returns int
  // calculate_average_tenure(gymid uuid) returns double precision
  // monthly_churn(gymid uuid) returns double precision
  // avg_classes_per_member_month(gymid uuid) returns double precision
  // average_satisfaction(gymid uuid) returns double precision

  // 1. Total Active Members
  const { data: totalActiveMembersData, error: totalActiveMembersError } = await supabase
    .rpc('total_active_members', { gymid: gym_id })
    .single();

  if (totalActiveMembersError) {
    console.error('Error fetching total_active_members:', totalActiveMembersError.message);
  }

  // 2. New Memberships This Month
  const { data: newMembershipsData, error: newMembershipsError } = await supabase
    .rpc('new_memberships_month', { gymid: gym_id })
    .single();

  if (newMembershipsError) {
    console.error('Error fetching new_memberships_month:', newMembershipsError.message);
  }

  // 3. Average Membership Tenure
  const { data: avgTenureData, error: avgTenureError } = await supabase
    .rpc('calculate_average_tenure', { gymid: gym_id })
    .single();

  if (avgTenureError) {
    console.error('Error fetching calculate_average_tenure:', avgTenureError.message);
  }

  // 4. Monthly Churn Rate
  const { data: monthlyChurnData, error: monthlyChurnError } = await supabase
    .rpc('monthly_churn', { gymid: gym_id })
    .single();

  if (monthlyChurnError) {
    console.error('Error fetching monthly_churn:', monthlyChurnError.message);
  }

  // 5. Avg Classes per Member this Month
  const { data: avgClassesData, error: avgClassesError } = await supabase
    .rpc('avg_classes_per_member_month', { gymid: gym_id })
    .single();

  if (avgClassesError) {
    console.error('Error fetching avg_classes_per_member_month:', avgClassesError.message);
  }

  // 6. Average Satisfaction Score
  const { data: avgSatisfactionData, error: avgSatisfactionError } = await supabase
    .rpc('average_satisfaction', { gymid: gym_id })
    .single();

  if (avgSatisfactionError) {
    console.error('Error fetching average_satisfaction:', avgSatisfactionError.message);
  }

  return NextResponse.json({
    total_active_members: totalActiveMembersData ?? 0,
    new_memberships_month: newMembershipsData ?? 0,
    average_tenure_days: avgTenureData ?? 0,
    monthly_churn: monthlyChurnData ?? 0,
    average_classes_per_member: avgClassesData ?? 0,
    average_satisfaction: avgSatisfactionData ?? null,
  });
}
