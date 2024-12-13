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
import { Card, Text, Grid, Dot } from '@geist-ui/core';

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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTracks = async () => {
      if (!userData) return; 
      setLoading(true);
      let fetchedTracks: { id: string; name: string }[] = [];
      try {
        if (userData.current_gym_id) {
          const { data: gymTracks, error: gymError } = await supabase
            .from("tracks")
            .select("id, name")
            .eq("gym_id", userData.current_gym_id);

          if (gymError) throw gymError;
          if (gymTracks) fetchedTracks.push(...gymTracks);
        } else {
          const { data: personalTracks, error: personalError } = await supabase
            .from("tracks")
            .select("id, name")
            .eq("user_id", userData.user_id);

          if (personalError) throw personalError;
          if (personalTracks && personalTracks.length) {
            fetchedTracks.push(...personalTracks);
          } else {
            const { data: newTrack, error: trackError } = await supabase
              .from("tracks")
              .insert({ user_id: userData.user_id, name: "Personal Track" })
              .select("id, name")
              .single();

            if (trackError) throw trackError;
            if (newTrack) fetchedTracks.push(newTrack);
          }
        }

        setTracks(fetchedTracks);
      } catch (error: any) {
        console.error("Error fetching tracks:", error.message);
        toast.error("Failed to load tracks. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchTracks();
    } else {
      if (!userData) setLoading(true);
    }
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

      {/* Two-column layout: main card on left, workout ideas on right */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:space-x-6">
        
        {/* Main Column */}
        <div className="flex-grow mb-6 md:mb-0">
          <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
                <p className="ml-3 text-sm text-gray-300">Loading...</p>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div className="space-y-4">
                    <Text h2 style={{ color: '#F9FAFB' }}>Basic Info</Text>
                    <Text small type="secondary" style={{ color: '#9CA3AF' }}>
                      Select your track, date, and name your workout. Enter or copy a template, then select scoring.
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
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                      <Text h2 style={{ color: '#F9FAFB', marginBottom: '8px' }}>Refine Your Workout</Text>
                      <Text small type="secondary" style={{ marginBottom: '16px', color: '#9CA3AF' }}>
                        Add warm-up, cool-down, and coach notes if desired. Optional.
                      </Text>
                      <div className="space-y-4">
                        <div>
                          <Text small b style={{ color: '#F9FAFB' }}>Warm Up (optional)</Text>
                          <textarea
                            value={workoutDraft.warmUp}
                            onChange={(e) => dispatch({ type: "UPDATE", updates: { warmUp: e.target.value } })}
                            placeholder="Optional warm-up details"
                            className="w-full p-2 border border-gray-600 rounded h-20 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                          />
                        </div>
                        <div>
                          <Text small b style={{ color: '#F9FAFB' }}>Cool Down (optional)</Text>
                          <textarea
                            value={workoutDraft.coolDown}
                            onChange={(e) => dispatch({ type: "UPDATE", updates: { coolDown: e.target.value } })}
                            placeholder="Optional cool-down details"
                            className="w-full p-2 border border-gray-600 rounded h-20 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                          />
                        </div>
                        <div>
                          <Text small b style={{ color: '#F9FAFB' }}>Coach Notes (optional)</Text>
                          <textarea
                            value={workoutDraft.coachNotes}
                            onChange={(e) => dispatch({ type: "UPDATE", updates: { coachNotes: e.target.value } })}
                            placeholder="Optional notes for coaches"
                            className="w-full p-2 border border-gray-600 rounded h-20 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                          />
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => setStep(1)}
                            className="px-4 py-2 bg-gray-600 text-gray-300 rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleNextFromStep2}
                            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                      <WorkoutDisplay workoutData={parsedWorkout} workoutName={workoutDraft.workoutName} />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <FinalReview
                    parsedWorkout={parsedWorkout}
                    onBack={() => setStep(2)}
                    onConfirm={handleConfirm}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Workout Ideas Panel */}
        {!loading && step === 1 && (
          <div className="w-full md:w-1/3 bg-gray-800 border border-gray-700 rounded-md p-4 max-h-[80vh] overflow-auto">
            <h3 className="text-pink-400 font-bold text-lg mb-4">Workout Ideas</h3>

            {/* Hero Workouts */}
            <div className="mb-8">
              <h4 className="text-gray-200 font-semibold mb-2">Hero Workouts</h4>
              <WorkoutIdeas category="Hero" setWorkoutBuilderText={handleSetWorkoutDetails} />
            </div>

            {/* Metcon Workouts */}
            <div className="mb-8">
              <h4 className="text-gray-200 font-semibold mb-2">Metcon Workouts</h4>
              <WorkoutIdeas category="Metcon" setWorkoutBuilderText={handleSetWorkoutDetails} />
            </div>

            {/* Benchmark Workouts */}
            <div className="mb-8">
              <h4 className="text-gray-200 font-semibold mb-2">Benchmark Workouts</h4>
              <WorkoutIdeas category="Benchmark" setWorkoutBuilderText={handleSetWorkoutDetails} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanWorkoutPage;
