// app/signup/actions.ts

"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Server Action: signup(formData)
 * 1) Create a new user in Auth.users via supabase.auth.signUp()
 * 2) Insert user_profiles row
 * 3) Create a personal track
 * 
 * Returns:
 *   { success: true }
 *   or { error: string } // displayed inline
 */
export async function signup(formData: FormData) {
  // For debugging, log the full formData keys
  console.log("[signup] FormData received:", Array.from(formData.keys()));

  // 1) Create a server-side Supabase client
  const supabase = await createClient();
  console.log("[signup] Supabase client created.");

  // 2) Extract email & password
  const email = formData.get("email") as string | undefined;
  const password = formData.get("password") as string | undefined;
  console.log("[signup] Attempting sign-up with email:", email);

  // Minimal check
  if (!email || !password) {
    console.warn("[signup] Missing email or password.");
    return { error: "Email and password are required." };
  }

  // 3) Attempt to sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

  console.log("[signup] supabase.auth.signUp result:", {
    user: authData?.user,
    authError: authError?.message,
  });

  // 3a) If there's a signUp error (e.g., duplicate email), return
  if (authError) {
    const lowerMsg = authError.message.toLowerCase();
    if (lowerMsg.includes("duplicate key")) {
      console.warn("[signup] Duplicate key error from supabase.auth.signUp - user may already exist");
      return {
        error: "An account with that email already exists. Please log in instead.",
      };
    }
    console.error("[signup] Unexpected authError:", authError.message);
    return { error: authError.message };
  }

  // 4) If user is returned from signUp
  if (!authData?.user) {
    // This would be unusual if no user object is returned but no authError
    console.warn("[signup] No user returned from signUp, but no error either.");
    return { error: "No user object returned. Please contact support." };
  }

  // Now we have a user, proceed to insert the user_profiles row
  const userId = authData.user.id;
  console.log("[signup] New user id:", userId, "Inserting into user_profiles...");

  // 5) Insert user_profiles row
  const { error: profileError } = await supabase
    .from("user_profiles")
    .insert({
      user_id: userId,
      email,
      role: "member",
      onboarding_completed: false,
      created_at: new Date(),
    });

  // If there's an error here, log it & return it
  if (profileError) {
    console.error("[signup] user_profiles insert error:", profileError.message);

    // Check if it complains about "duplicate key" on user_id
    if (profileError.message.toLowerCase().includes("duplicate key")) {
      console.warn("[signup] Looks like user_profiles already exists for user_id:", userId);
      return {
        error: "An account with this user ID already exists in user_profiles. Please try logging in.",
      };
    }
    return { error: profileError.message };
  }

  console.log("[signup] user_profiles inserted successfully for user_id:", userId);

  // 6) Create a default personal track
  console.log("[signup] Creating 'Personal Track' for user_id:", userId);
  const { error: trackError } = await supabase
    .from("tracks")
    .insert({
      user_id: userId,
      name: "Personal Track",
      description: "Your personal track for individual programming.",
      created_at: new Date(),
    });

  if (trackError) {
    console.error("[signup] tracks insert error:", trackError.message);
    return {
      error: `Account created, but failed to create personal track: ${trackError.message}`,
    };
  }

  console.log("[signup] Successfully created 'Personal Track' for user_id:", userId);

  // 7) If everything succeeded
  console.log("[signup] All steps succeeded, returning success.");
  return { success: true };
}