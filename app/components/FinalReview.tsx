import React, { useState } from 'react';
import { Text } from '@geist-ui/core';
import { ParsedWorkout } from './types';

type FinalReviewProps = {
  parsedWorkout: ParsedWorkout;
  workoutDraft: {
    date: string;
    trackId: string | null;
    workoutName: string;
    workoutDetails: any; // It might not be just a string now, handle gracefully
    scoringSet: number;
    scoringType: string;
    warmUp: string;
    coolDown: string;
    coachNotes: string;
  };
  tracks: { id: string; name: string }[];
  onBack: () => void;
  onConfirm: () => void;
};

const FinalReview: React.FC<FinalReviewProps> = ({ workoutDraft, tracks, onBack, onConfirm, parsedWorkout }) => {
  const { date, trackId, workoutName, workoutDetails, scoringSet, scoringType, warmUp, coolDown, coachNotes } = workoutDraft;

  const trackName = trackId ? tracks.find(t => t.id === trackId)?.name || "Unknown Track" : "No Track Selected";

  const [showWarmUp, setShowWarmUp] = useState(false);
  const [showCoolDown, setShowCoolDown] = useState(false);
  const [showCoachNotes, setShowCoachNotes] = useState(false);

  // Ensure workoutDetails is a string for rendering
  let detailsToDisplay: string;
  if (typeof workoutDetails === 'string') {
    detailsToDisplay = workoutDetails;
  } else {
    // If it's not a string, stringify the parsedWorkout or workoutDetails
    // parsedWorkout should always be an object, so let's display that
    detailsToDisplay = JSON.stringify(parsedWorkout, null, 2);
  }

  return (
    <div className="space-y-4 bg-gray-800 text-gray-100 p-4 rounded-md border border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-100">Review & Confirm</h2>
      <p className="text-sm text-gray-300">Here’s the final version of your workout. Review and confirm when ready.</p>

      <div className="space-y-3">
        <div>
          <Text small b style={{ color: '#F9FAFB' }}>Date</Text>
          <p className="text-sm text-gray-200">{date}</p>
        </div>

        <div>
          <Text small b style={{ color: '#F9FAFB' }}>Track</Text>
          <p className="text-sm text-gray-200">{trackName}</p>
        </div>

        <div>
          <Text small b style={{ color: '#F9FAFB' }}>Workout Name</Text>
          <p className="text-sm text-gray-200">{workoutName || "Untitled Workout"}</p>
        </div>

        <div>
          <Text small b style={{ color: '#F9FAFB' }}>Workout Details</Text>
          <div className="bg-gray-900 border border-gray-700 rounded-md p-3 mt-1">
            {detailsToDisplay.trim() ? (
              <pre className="text-sm text-gray-200 whitespace-pre-wrap">{detailsToDisplay}</pre>
            ) : (
              <div className="text-sm text-gray-500 italic">No details provided</div>
            )}
          </div>
        </div>

        <div>
          <Text small b style={{ color: '#F9FAFB' }}>Scoring</Text>
          <p className="text-sm text-gray-200">{scoringSet} set(s) of {scoringType}</p>
        </div>

        <div>
          <Text small b style={{ color: '#F9FAFB' }}>Warm Up</Text>{' '}
          {warmUp.trim() ? (
            <>
              <button
                onClick={() => setShowWarmUp(!showWarmUp)}
                className="text-sm text-pink-400 hover:underline ml-2 focus:outline-none"
              >
                {showWarmUp ? "Hide" : "Show"}
              </button>
              {showWarmUp && (
                <div className="mt-1 bg-gray-900 border border-gray-700 p-3 rounded-md text-sm text-gray-200 whitespace-pre-wrap">
                  {warmUp}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No Warm Up provided</p>
          )}
        </div>

        <div>
          <Text small b style={{ color: '#F9FAFB' }}>Cool Down</Text>{' '}
          {coolDown.trim() ? (
            <>
              <button
                onClick={() => setShowCoolDown(!showCoolDown)}
                className="text-sm text-pink-400 hover:underline ml-2 focus:outline-none"
              >
                {showCoolDown ? "Hide" : "Show"}
              </button>
              {showCoolDown && (
                <div className="mt-1 bg-gray-900 border border-gray-700 p-3 rounded-md text-sm text-gray-200 whitespace-pre-wrap">
                  {coolDown}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No Cool Down provided</p>
          )}
        </div>

        <div>
          <Text small b style={{ color: '#F9FAFB' }}>Coach Notes</Text>{' '}
          {coachNotes.trim() ? (
            <>
              <button
                onClick={() => setShowCoachNotes(!showCoachNotes)}
                className="text-sm text-pink-400 hover:underline ml-2 focus:outline-none"
              >
                {showCoachNotes ? "Hide" : "Show"}
              </button>
              {showCoachNotes && (
                <div className="mt-1 bg-gray-900 border border-gray-700 p-3 rounded-md text-sm text-gray-200 whitespace-pre-wrap">
                  {coachNotes}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No Coach Notes provided</p>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-400 italic mt-4">[AI suggestions placeholder]</p>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-gray-300 rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          Plan Workout
        </button>
      </div>
    </div>
  );
};

export default FinalReview;
