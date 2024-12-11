// PlanWorkoutPage.tsx
"use client";
import React, { useReducer, useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '../context/AuthContext';
import BasicInfoForm from './BasicInfoForm';
import FinalReview from './FinalReview';
import WorkoutDisplay from './WorkoutDisplay';
import WorkoutIdeas from './WorkoutIdeas';
import { basicParseWorkout } from './parseWorkout';
import { ParsedWorkout } from './types';
import toast from 'react-hot-toast';
import { Card, Text, Grid, Dot } from '@geist-ui/core'; // Keeping Geist for other components

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

const PlanWorkoutPage: React.FC = () => {
  const { userData } = useAuth();
  const [workoutDraft, dispatch] = useReducer(workoutReducer, initialWorkoutState);
  const [step, setStep] = useState(1);
  const [parsedWorkout, setParsedWorkout] = useState<ParsedWorkout>({
    type: 'Unknown',
    notes: [],
    workoutBlocks: [],
  });
  const [tracks, setTracks] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchTracks = async () => {
      if (!userData) return;

      let fetchedTracks: { id: string; name: string }[] = [];
      if (userData.current_gym_id) {
        const { data: gymTracks, error: gymError } = await supabase
          .from("tracks")
          .select("id, name")
          .eq("gym_id", userData.current_gym_id);

        if (gymError) console.error("Error fetching gym tracks:", gymError.message);
        if (gymTracks) fetchedTracks.push(...gymTracks);
      } else {
        const { data: personalTracks, error: personalError } = await supabase
          .from("tracks")
          .select("id, name")
          .eq("user_id", userData.user_id);

        if (personalError) console.error("Error fetching personal tracks:", personalError.message);
        if (personalTracks && personalTracks.length) {
          fetchedTracks.push(...personalTracks);
        } else {
          const { data: newTrack, error: trackError } = await supabase
            .from("tracks")
            .insert({ user_id: userData.user_id, name: "Personal Track" })
            .select("id, name")
            .single();

          if (trackError) console.error("Error creating personal track:", trackError.message);
          if (newTrack) fetchedTracks.push(newTrack);
        }
      }

      setTracks(fetchedTracks);
    };
    fetchTracks();
  }, [userData]);

  const handleSetWorkoutDetails = (text: string) => {
    dispatch({ type: "UPDATE", updates: { workoutDetails: text } });
  };

  const handleNextFromStep1 = () => {
    const { date, workoutName, trackId, workoutDetails, scoringSet, scoringType } = workoutDraft;
    if (!trackId || !date || !workoutName.trim() || !workoutDetails.trim() || scoringSet < 1 || scoringType === '') {
      toast.error("Please complete all required fields");
      return;
    }
    const parsed = basicParseWorkout(workoutDetails);
    setParsedWorkout(parsed);
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    setStep(3);
  };

  const handleConfirm = async () => {
    if (!userData || !userData.user_id) {
      console.error("Cannot plan workout without a valid user. userData:", userData);
      toast.error("You must be logged in to plan a workout.");
      return;
    }

    if (!workoutDraft.trackId || !workoutDraft.workoutName.trim()) {
      toast.error("Cannot plan workout without required fields.");
      return;
    }

    try {
      const { error } = await supabase.from("scheduled_workouts").insert({
        user_id: userData.user_id,
        date: workoutDraft.date,
        track_id: workoutDraft.trackId,
        workout_details: workoutDraft.workoutDetails,
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
      });

      if (error) {
        console.error("Error scheduling workout:", error.message);
        toast.error(`Failed to schedule workout: ${error.message}`);
        return;
      }

      toast.success("Workout successfully scheduled!");
    } catch (err: any) {
      console.error("Unexpected error inserting workout:", err);
      toast.error("An error occurred. Please try again.");
    }
  };

  // Step Indicator
  const StepIndicator = () => {
    const stepsInfo = [
      { number: 1, label: 'Basic Info' },
      { number: 2, label: 'Refine' },
      { number: 3, label: 'Review' }
    ];

    return (
      <Grid.Container gap={2}>
        {stepsInfo.map(s => {
          const isActive = s.number === step;
          return (
            <Grid key={s.number}>
              <div className="flex flex-col items-center">
                <Dot type={isActive ? 'success' : 'default'}>{s.number}</Dot>
                <Text small style={{ marginTop: '4px', color: isActive ? '#EC4899' : '#9CA3AF', fontWeight: isActive ? 600 : 400 }}>
                  {s.label}
                </Text>
              </div>
            </Grid>
          );
        })}
      </Grid.Container>
    );
  };

  return (
    <div className="p-4 min-h-screen bg-gray-800 text-gray-100">
      <div className="max-w-7xl mx-auto mb-6">
        <StepIndicator />
      </div>
      <Grid.Container gap={2} className="max-w-7xl mx-auto">
        <Grid xs={24} sm={step === 1 ? 16 : 24}> 
          <Card shadow style={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}>
            <Card.Content>
              {step === 1 && (
                <>
                  <Text h2 style={{ color: '#F9FAFB', marginBottom: '8px' }}>Basic Info</Text>
                  <Text small type="secondary" style={{ marginBottom: '16px' }}>
                    Select your track, date, and name your workout. Enter or copy a template into the text area, then select scoring.
                  </Text>
                  <BasicInfoForm
                    workout={{
                      date: workoutDraft.date,
                      workoutName: workoutDraft.workoutName,
                      trackId: workoutDraft.trackId,
                      workoutDetails: workoutDraft.workoutDetails,
                      scoringSet: workoutDraft.scoringSet,
                      scoringType: workoutDraft.scoringType
                    }}
                    tracks={tracks}
                    onChange={(updates) => dispatch({ type: "UPDATE", updates })}
                    onNext={handleNextFromStep1}
                  />
                </>
              )}

              {step === 2 && (
                <Grid.Container gap={2}>
                  <Grid xs={24} sm={16}>
                    <Card shadow style={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}>
                      <Card.Content>
                        <Text h2 style={{ marginBottom: '8px' }}>Refine Your Workout</Text>
                        <Text small type="secondary" style={{ marginBottom: '16px' }}>
                          Add warm-up, cool-down, and coach notes if desired. These are optional.
                        </Text>

                        <div className="space-y-4">
                          <div>
                            <Text small b>Warm Up (optional)</Text>
                            <textarea
                              value={workoutDraft.warmUp}
                              onChange={(e) => dispatch({ type: "UPDATE", updates: { warmUp: e.target.value } })}
                              placeholder="Optional warm-up details"
                              className="w-full p-2 border border-gray-600 rounded h-20 bg-gray-700 text-gray-100 focus:outline-none"
                            />
                          </div>
                          <div>
                            <Text small b>Cool Down (optional)</Text>
                            <textarea
                              value={workoutDraft.coolDown}
                              onChange={(e) => dispatch({ type: "UPDATE", updates: { coolDown: e.target.value } })}
                              placeholder="Optional cool-down details"
                              className="w-full p-2 border border-gray-600 rounded h-20 bg-gray-700 text-gray-100 focus:outline-none"
                            />
                          </div>
                          <div>
                            <Text small b>Coach Notes (optional)</Text>
                            <textarea
                              value={workoutDraft.coachNotes}
                              onChange={(e) => dispatch({ type: "UPDATE", updates: { coachNotes: e.target.value } })}
                              placeholder="Optional notes for coaches"
                              className="w-full p-2 border border-gray-600 rounded h-20 bg-gray-700 text-gray-100 focus:outline-none"
                            />
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => setStep(1)}
                              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                              Back
                            </button>
                            <button
                              onClick={handleNextFromStep2}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>
                  </Grid>
                  <Grid xs={24} sm={8}>
                    <Card shadow style={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}>
                      <Card.Content>
                        <WorkoutDisplay workoutData={parsedWorkout} workoutName={workoutDraft.workoutName} />
                      </Card.Content>
                    </Card>
                  </Grid>
                </Grid.Container>
              )}

              {step === 3 && (
                <FinalReview
                  parsedWorkout={parsedWorkout}
                  onBack={() => setStep(2)}
                  onConfirm={handleConfirm}
                />
              )}
            </Card.Content>
          </Card>
        </Grid>

        {step === 1 && (
          
          <Grid xs={24} sm={8}>
            <Grid.Container direction="column" gap={2}>
              <Grid>
                <Card shadow style={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}>
                  <Card.Content>
                    <Text b style={{ marginBottom: '8px' }}>Hero Workouts</Text>
                    <WorkoutIdeas
                      category="Hero"
                      setWorkoutBuilderText={handleSetWorkoutDetails}
                    />
                  </Card.Content>
                </Card>
              </Grid>
              <Grid>
                <Card shadow style={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}>
                  <Card.Content>
                    <Text b style={{ marginBottom: '8px' }}>Metcon Workouts</Text>
                    <WorkoutIdeas
                      category="Metcon"
                      setWorkoutBuilderText={handleSetWorkoutDetails}
                    />
                  </Card.Content>
                </Card>
              </Grid>
              <Grid>
                <Card shadow style={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}>
                  <Card.Content>
                    <Text b style={{ marginBottom: '8px' }}>Benchmark Workouts</Text>
                    <WorkoutIdeas
                      category="Benchmark"
                      setWorkoutBuilderText={handleSetWorkoutDetails}
                    />
                  </Card.Content>
                </Card>
              </Grid>
            </Grid.Container>
          </Grid>
        )}
      </Grid.Container>
    </div>
  );
};

export default PlanWorkoutPage;
