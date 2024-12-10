import { supabase } from '@/utils/supabase/client';

interface UserData {
  user_id: string | null;
  current_gym_id: string | null;
  role: string | null;
}

export async function getAvailableTracks(userData: UserData) {
  // Always start with an empty array.
  let availableTracks: { id: string; name: string }[] = [];

  // If user_data is not fully loaded, just return empty
  if (!userData || !userData.user_id) return availableTracks;

  // If user has a gym and is a coach, fetch gym tracks
  if (userData.role === 'coach' && userData.current_gym_id) {
    const { data: gymTracks, error: gymError } = await supabase
      .from('tracks')
      .select('id, name')
      .eq('gym_id', userData.current_gym_id);

    if (gymError) console.error("Error fetching gym tracks:", gymError.message);
    if (gymTracks) availableTracks.push(...gymTracks);
  }

  // Fetch personal track(s) for the user
  let { data: personalTracks, error: personalError } = await supabase
    .from('tracks')
    .select('id, name')
    .eq('user_id', userData.user_id);

  if (personalError) console.error("Error fetching personal tracks:", personalError.message);

  // If no personal track found, create one
  if (!personalTracks || personalTracks.length === 0) {
    const { data: newTrack, error: createError } = await supabase
      .from('tracks')
      .insert({ user_id: userData.user_id, name: "Personal Track" })
      .select('id, name')
      .single();
    
    if (createError) {
      console.error("Error creating personal track:", createError.message);
    } else if (newTrack) {
      personalTracks = [newTrack];
    }
  }

  // Push personal track(s) into the availableTracks array
  if (personalTracks) availableTracks.push(...personalTracks);

  // In the future, if coaches should see their athletes’ tracks, add logic here
  // For now, we just return gym + personal tracks

  return availableTracks;
}
