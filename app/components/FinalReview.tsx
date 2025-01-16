import React, { useState } from "react";
import { ParsedWorkout } from "./types";

// You can remove @geist-ui/core if not needed or replace with a shadcn component
// For now, we'll remove the use of <Text> from Geist and just use standard HTML.

type FinalReviewProps = {
  parsedWorkout: ParsedWorkout;
  workoutDraft: {
    date: string;
    trackId: string | null;
    workoutName: string;
    workoutDetails: any; // Possibly a string or object
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

const FinalReview: React.FC<FinalReviewProps> = ({
  workoutDraft,
  tracks,
  onBack,
  onConfirm,
  parsedWorkout,
}) => {
  const {
    date,
    trackId,
    workoutName,
    workoutDetails,
    scoringSet,
    scoringType,
    warmUp,
    coolDown,
    coachNotes,
  } = workoutDraft;

  const trackName = trackId
    ? tracks.find((t) => t.id === trackId)?.name || "Unknown Track"
    : "No Track Selected";

  const [showWarmUp, setShowWarmUp] = useState(false);
  const [showCoolDown, setShowCoolDown] = useState(false);
  const [showCoachNotes, setShowCoachNotes] = useState(false);

  let detailsToDisplay: string;
  if (typeof workoutDetails === "string") {
    detailsToDisplay = workoutDetails;
  } else {
    // If it's not a string, we’ll display the parsed data
    detailsToDisplay = JSON.stringify(parsedWorkout, null, 2);
  }

  return (
    <div className="space-y-4 bg-card text-card-foreground p-4 rounded-md border border-border">
      <h2 className="text-2xl font-semibold">Review & Confirm</h2>
      <p className="text-sm text-muted-foreground">
        Here’s the final version of your workout. Review and confirm when ready.
      </p>

      <div className="space-y-3 text-sm">
        <div>
          <p className="font-bold">Date</p>
          <p className="text-muted-foreground">{date}</p>
        </div>

        <div>
          <p className="font-bold">Track</p>
          <p className="text-muted-foreground">{trackName}</p>
        </div>

        <div>
          <p className="font-bold">Workout Name</p>
          <p className="text-muted-foreground">
            {workoutName || "Untitled Workout"}
          </p>
        </div>

        <div>
          <p className="font-bold">Workout Details</p>
          <div className="bg-background border border-border rounded-md p-3 mt-1 overflow-auto max-h-60">
            {detailsToDisplay.trim() ? (
              <pre className="whitespace-pre-wrap text-sm">
                {detailsToDisplay}
              </pre>
            ) : (
              <div className="italic text-muted-foreground">
                No details provided
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="font-bold">Scoring</p>
          <p className="text-muted-foreground">
            {scoringSet} set(s) of {scoringType}
          </p>
        </div>

        <div>
          <p className="font-bold">Warm Up</p>
          {warmUp.trim() ? (
            <>
              <button
                onClick={() => setShowWarmUp((prev) => !prev)}
                className="text-sm text-accent hover:underline ml-2 focus:outline-none"
              >
                {showWarmUp ? "Hide" : "Show"}
              </button>
              {showWarmUp && (
                <div className="mt-1 bg-background border border-border p-3 rounded-md whitespace-pre-wrap">
                  {warmUp}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground italic">
              No Warm Up provided
            </p>
          )}
        </div>

        <div>
          <p className="font-bold">Cool Down</p>
          {coolDown.trim() ? (
            <>
              <button
                onClick={() => setShowCoolDown((prev) => !prev)}
                className="text-sm text-accent hover:underline ml-2 focus:outline-none"
              >
                {showCoolDown ? "Hide" : "Show"}
              </button>
              {showCoolDown && (
                <div className="mt-1 bg-background border border-border p-3 rounded-md whitespace-pre-wrap">
                  {coolDown}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground italic">
              No Cool Down provided
            </p>
          )}
        </div>

        <div>
          <p className="font-bold">Coach Notes</p>
          {coachNotes.trim() ? (
            <>
              <button
                onClick={() => setShowCoachNotes((prev) => !prev)}
                className="text-sm text-accent hover:underline ml-2 focus:outline-none"
              >
                {showCoachNotes ? "Hide" : "Show"}
              </button>
              {showCoachNotes && (
                <div className="mt-1 bg-background border border-border p-3 rounded-md whitespace-pre-wrap">
                  {coachNotes}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground italic">
              No Coach Notes provided
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground italic mt-4">
        [AI suggestions placeholder]
      </p>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Plan Workout
        </button>
      </div>
    </div>
  );
};

export default FinalReview;