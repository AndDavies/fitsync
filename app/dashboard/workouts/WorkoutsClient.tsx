"use client";

import React, { useReducer, useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js 13+ router
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import BasicInfoForm from "@/app/components/BasicInfoForm";
import FinalReview from "@/app/components/FinalReview";
import WorkoutIdeasAccordions from "@/app/components/WorkoutIdeasAccordions";
import { ParsedWorkout } from "@/app/components/types";

// Import shadcn/ui components for a consistent card/wrapper
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type UserProfile = {
  user_id: string;
  current_gym_id?: string | null;
};

type WorkoutsClientProps = {
  userProfile: UserProfile;
};

// Initial state for the multi-step planner
const initialWorkoutState = {
  date: new Date().toISOString().split("T")[0],
  workoutName: "",
  trackId: null as string | null,
  warmUp: "",
  workoutDetails: "",
  coolDown: "",
  scoringSet: 1,
  scoringType: "",
  advancedScoring: "Maximum",
  orderType: "Descending",
  coachNotes: "",
  origin: "user",
  is_template: false,
  workout_id: null as string | null,
};

type WorkoutState = typeof initialWorkoutState;
type WorkoutAction =
  | { type: "RESET" }
  | { type: "UPDATE"; updates: Partial<WorkoutState> };

function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case "RESET":
      return initialWorkoutState;
    case "UPDATE":
      return { ...state, ...action.updates };
    default:
      return state;
  }
}

export default function WorkoutsClient({ userProfile }: WorkoutsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [workoutDraft, dispatch] = useReducer(workoutReducer, initialWorkoutState);
  const [step, setStep] = useState(1);
  const [tracks, setTracks] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // For parse-workout
  const [parsedWorkout, setParsedWorkout] = useState<ParsedWorkout | null>(null);

  // Track submission state for the final step
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1) Load the tracks on mount
  useEffect(() => {
    async function fetchTracks() {
      if (!userProfile) return;
      setLoading(true);
      try {
        const fetchedTracks: { id: string; name: string }[] = [];

        if (userProfile.current_gym_id) {
          // Gym tracks
          const { data: gymTracks, error: gymError } = await supabase
            .from("tracks")
            .select("id, name")
            .eq("gym_id", userProfile.current_gym_id);
          if (gymError) throw gymError;
          if (gymTracks) fetchedTracks.push(...gymTracks);
        } else {
          // Personal tracks
          const { data: personalTracks, error: personalError } = await supabase
            .from("tracks")
            .select("id, name")
            .eq("user_id", userProfile.user_id);
          if (personalError) throw personalError;

          if (personalTracks && personalTracks.length > 0) {
            fetchedTracks.push(...personalTracks);
          } else {
            // Create a personal track if none exist
            const { data: newTrack, error: trackError } = await supabase
              .from("tracks")
              .insert({ user_id: userProfile.user_id, name: "Personal Track" })
              .select("id, name")
              .single();
            if (trackError) throw trackError;
            if (newTrack) fetchedTracks.push(newTrack);
          }
        }
        setTracks(fetchedTracks);
      } catch (err: any) {
        console.error("Error fetching tracks:", err.message);
        toast.error("Failed to load tracks. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    fetchTracks();
  }, [supabase, userProfile]);

  // 2) Step 1: Validate + parse
  const handleNextFromStep1 = async () => {
    const { date, workoutName, trackId, workoutDetails, scoringSet, scoringType } = workoutDraft;

    if (!trackId || !date || !workoutName.trim() || !workoutDetails.trim() || scoringSet < 1 || !scoringType) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      const res = await fetch("/api/parse-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutText: workoutDetails }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        toast.error(`Failed to parse workout: ${error}`);
        return;
      }
      const { structuredWorkout } = await res.json();
      setParsedWorkout(structuredWorkout);
      setStep(2);
    } catch (err: any) {
      console.error("Error calling parse-workout API:", err);
      toast.error("Failed to parse workout. Please try again.");
    }
  };

  // 3) Step 2 -> Step 3
  const handleNextFromStep2 = () => {
    setStep(3);
  };

  // 4) Final confirm: call /api/workouts/create
  const handleConfirm = async () => {
    if (!userProfile?.user_id) {
      toast.error("You must be logged in to plan a workout.");
      return;
    }
    if (!parsedWorkout) {
      toast.error("No parsed workout data found. Please go back and re-parse the workout.");
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/workouts/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: workoutDraft.date,
          track_id: workoutDraft.trackId,
          workout_details: parsedWorkout,
          workout_id: workoutDraft.workout_id,
          scoring_type: workoutDraft.scoringType,
          advanced_scoring: workoutDraft.advancedScoring,
          origin: workoutDraft.origin,
          is_template: workoutDraft.is_template,
          warm_up: workoutDraft.warmUp,
          cool_down: workoutDraft.coolDown,
          notes: workoutDraft.coachNotes,
          name: workoutDraft.workoutName,
          order_type: workoutDraft.orderType,
          scoring_set: workoutDraft.scoringSet.toString(),
          gym_id: userProfile.current_gym_id,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Failed to schedule workout" }));
        toast.error(error || "Failed to schedule workout");
        setIsSubmitting(false);
        return;
      }

      toast.success("Workout successfully scheduled!");
      setIsSubmitting(false);
      router.push("/dashboard/plan");
    } catch (err: any) {
      console.error("Error scheduling workout:", err.message);
      toast.error("Failed to schedule workout. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow border border-border">
            <CardHeader>
              <CardTitle className="text-xl">Plan Your Workout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
                  <p className="ml-3 text-sm text-muted-foreground">Loading tracks...</p>
                </div>
              )}

              {!loading && step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BasicInfoForm
                    workout={{
                      date: workoutDraft.date,
                      workoutName: workoutDraft.workoutName,
                      trackId: workoutDraft.trackId,
                      workoutDetails: workoutDraft.workoutDetails,
                      scoringSet: workoutDraft.scoringSet,
                      scoringType: workoutDraft.scoringType,
                    }}
                    tracks={tracks}
                    onChange={(updates) => dispatch({ type: "UPDATE", updates })}
                    onNext={handleNextFromStep1}
                  />

                  <div className="border border-border rounded-md p-4 bg-card">
                    <h3 className="text-accent text-lg font-bold mb-3">Workout Ideas</h3>
                    <WorkoutIdeasAccordions
                      setWorkoutBuilderText={(text) => dispatch({ type: "UPDATE", updates: { workoutDetails: text } })}
                      setWorkoutBuilderId={(id) => dispatch({ type: "UPDATE", updates: { workout_id: id } })}
                    />
                  </div>
                </div>
              )}

              {!loading && step === 2 && parsedWorkout && (
                <div className="space-y-6">
                  <Card className="bg-background border border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Refine Your Workout</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1 text-foreground">
                          Warm Up (optional)
                        </label>
                        <textarea
                          value={workoutDraft.warmUp}
                          onChange={(e) =>
                            dispatch({ type: "UPDATE", updates: { warmUp: e.target.value } })
                          }
                          className="w-full p-2 bg-secondary text-secondary-foreground rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-1 text-foreground">
                          Cool Down (optional)
                        </label>
                        <textarea
                          value={workoutDraft.coolDown}
                          onChange={(e) =>
                            dispatch({ type: "UPDATE", updates: { coolDown: e.target.value } })
                          }
                          className="w-full p-2 bg-secondary text-secondary-foreground rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-1 text-foreground">
                          Coach Notes (optional)
                        </label>
                        <textarea
                          value={workoutDraft.coachNotes}
                          onChange={(e) =>
                            dispatch({ type: "UPDATE", updates: { coachNotes: e.target.value } })
                          }
                          className="w-full p-2 bg-secondary text-secondary-foreground rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => setStep(1)}
                          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleNextFromStep2}
                          className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90"
                        >
                          Next
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!loading && step === 3 && parsedWorkout && (
                <FinalReview
                  parsedWorkout={parsedWorkout}
                  workoutDraft={workoutDraft}
                  tracks={tracks}
                  onBack={() => setStep(2)}
                  onConfirm={handleConfirm}
                />
              )}

              {isSubmitting && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full" />
                    <p className="mt-4 text-accent text-sm">Scheduling your workout...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}