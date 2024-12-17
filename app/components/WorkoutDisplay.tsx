"use client";
import React, { useState } from 'react';
import { ParsedWorkout } from './types'; 

interface WorkoutDisplayProps {
  workoutData: ParsedWorkout; // Guaranteed to be parsed properly
  workoutName?: string;
  warmUp?: string;
  coolDown?: string;
}

function formatMovementLines(line: any): string[] {
  const lines: string[] = [];

  if (Array.isArray(line.reps)) {
    // Multiple sets
    line.reps.forEach((repCount: number | string, i: number) => {
      let setStr = `Set ${i + 1}: `;
      if (repCount === 'Max') {
        setStr += 'Max ';
      } else if (typeof repCount === 'number') {
        setStr += `${repCount} `;
      }

      if (line.name) {
        setStr += line.name;
      }

      if (line.distance) {
        setStr += `, ${line.distance}`;
      }

      if (line.weight) {
        setStr += ` @ ${line.weight}`;
      }

      lines.push(setStr.trim());
    });
  } else {
    // Single set or no reps array
    let lineStr = '';
    if (line.minute) {
      lineStr += line.minute.toUpperCase() + ': ';
    }

    if (line.reps !== undefined) {
      if (line.reps === 'Max') {
        lineStr += 'Max ';
      } else if (typeof line.reps === 'number') {
        lineStr += line.reps + ' ';
      }
    }

    if (line.name) {
      lineStr += line.name;
    }

    if (line.distance) {
      lineStr += `, ${line.distance}`;
    }

    if (line.weight) {
      lineStr += ` @ ${line.weight}`;
    }

    lines.push(lineStr.trim());
  }

  return lines;
}

const WorkoutDisplay: React.FC<WorkoutDisplayProps> = ({ workoutData, workoutName, warmUp = "", coolDown = "" }) => {
  const { type, notes, workoutBlocks, priority, scalingGuidelines } = workoutData;
  const safeBlocks = Array.isArray(workoutBlocks) ? workoutBlocks : [];

  const [showWarmUp, setShowWarmUp] = useState(false);
  const [showCoolDown, setShowCoolDown] = useState(false);

  return (
    <div className="space-y-4 p-4 bg-gray-700 rounded-md border border-gray-600 text-gray-100">
      {workoutName && (
        <h2 className="text-2xl font-bold text-gray-100">{workoutName}</h2>
      )}

      {type && type !== 'Unknown' && (
        <h3 className="text-xl font-semibold text-gray-100">{type}</h3>
      )}

      {priority && (
        <div className="text-sm text-gray-300">Priority: {String(priority)}</div>
      )}

      {warmUp && warmUp.trim() && (
        <div>
          <button
            onClick={() => setShowWarmUp(!showWarmUp)}
            className="text-sm font-semibold text-pink-400 focus:outline-none"
          >
            {showWarmUp ? "Hide Warm-Up" : "Show Warm-Up"}
          </button>
          {showWarmUp && (
            <pre className="text-sm text-gray-300 mt-1 bg-gray-600 p-2 rounded border border-gray-500 whitespace-pre-wrap">
              {warmUp}
            </pre>
          )}
        </div>
      )}

      {safeBlocks.map((block, idx) => {
        const safeLines = Array.isArray(block.lines) ? block.lines : [];
        return (
          <div key={idx} className="space-y-1">
            {block.title && (
              <h4 className="text-md font-semibold text-gray-100">{block.title}</h4>
            )}
            <div className="space-y-1">
              {safeLines.map((line, lineIdx) => {
                const lineOutputs = formatMovementLines(line);
                return lineOutputs.map((lo, innerIdx) => (
                  <div key={`${lineIdx}-${innerIdx}`} className="flex items-start space-x-2">
                    <span className="text-gray-500">—</span>
                    <span className="text-sm text-gray-200">{lo}</span>
                  </div>
                ));
              })}
            </div>
          </div>
        );
      })}

      {notes && notes.length > 0 && (
        <div className="p-3 bg-gray-600 rounded space-y-1 border border-gray-500">
          <h4 className="text-sm font-semibold mb-1 text-gray-100">Additional Notes:</h4>
          <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
            {notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}

      {scalingGuidelines && typeof scalingGuidelines === 'object' && (
        <div className="p-3 bg-gray-600 border border-gray-500 rounded text-sm text-gray-200 space-y-1">
          <h4 className="font-semibold mb-1 text-gray-100">Scaling Guidelines:</h4>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(scalingGuidelines).map(([key, val], i) => (
              <li key={i}>{key.charAt(0).toUpperCase() + key.slice(1)}: {String(val)}</li>
            ))}
          </ul>
        </div>
      )}

      {coolDown && coolDown.trim() && (
        <div>
          <button
            onClick={() => setShowCoolDown(!showCoolDown)}
            className="text-sm font-semibold text-pink-400 focus:outline-none"
          >
            {showCoolDown ? "Hide Cool-Down" : "Show Cool-Down"}
          </button>
          {showCoolDown && (
            <pre className="text-sm text-gray-300 mt-1 bg-gray-600 p-2 rounded border border-gray-500 whitespace-pre-wrap">
              {coolDown}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutDisplay;
