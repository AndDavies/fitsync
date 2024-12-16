"use client";

import React, { useState } from 'react';
import { ParsedWorkout } from './types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface WorkoutEditorDisplayProps {
  workoutData: ParsedWorkout;
  onUpdate: (updatedWorkout: ParsedWorkout) => void;
}

const WorkoutEditorDisplay: React.FC<WorkoutEditorDisplayProps> = ({ workoutData, onUpdate }) => {
  const [editableWorkout, setEditableWorkout] = useState<ParsedWorkout>(workoutData);

  const handleRepsChange = (blockIndex: number, lineIndex: number, setIndex: number, newValue: string) => {
    const newWorkout = { ...editableWorkout };
    const repsArray = Array.isArray(newWorkout.workoutBlocks[blockIndex].lines[lineIndex].reps)
      ? [...(newWorkout.workoutBlocks[blockIndex].lines[lineIndex].reps as number[])]
      : [];

    const parsedValue = parseInt(newValue, 10);
    if (!isNaN(parsedValue)) {
      repsArray[setIndex] = parsedValue;
    }

    newWorkout.workoutBlocks[blockIndex].lines[lineIndex].reps = repsArray;
    setEditableWorkout(newWorkout);
    onUpdate(newWorkout);
  };

  const addSet = (blockIndex: number, lineIndex: number) => {
    const newWorkout = { ...editableWorkout };
    const repsArray = Array.isArray(newWorkout.workoutBlocks[blockIndex].lines[lineIndex].reps)
      ? [...(newWorkout.workoutBlocks[blockIndex].lines[lineIndex].reps as number[])]
      : [];

    repsArray.push(1); // Default new set
    newWorkout.workoutBlocks[blockIndex].lines[lineIndex].reps = repsArray;
    setEditableWorkout(newWorkout);
    onUpdate(newWorkout);
  };

  const removeSet = (blockIndex: number, lineIndex: number, setIndex: number) => {
    const newWorkout = { ...editableWorkout };
    const repsArray = Array.isArray(newWorkout.workoutBlocks[blockIndex].lines[lineIndex].reps)
      ? [...(newWorkout.workoutBlocks[blockIndex].lines[lineIndex].reps as number[])]
      : [];

    repsArray.splice(setIndex, 1);
    newWorkout.workoutBlocks[blockIndex].lines[lineIndex].reps = repsArray;
    setEditableWorkout(newWorkout);
    onUpdate(newWorkout);
  };

  const onDragEnd = (result: DropResult, blockIndex: number, lineIndex: number) => {
    if (!result.destination) return;

    const newWorkout = { ...editableWorkout };
    const repsArray = Array.isArray(newWorkout.workoutBlocks[blockIndex].lines[lineIndex].reps)
      ? [...(newWorkout.workoutBlocks[blockIndex].lines[lineIndex].reps as number[])]
      : [];

    const [moved] = repsArray.splice(result.source.index, 1);
    repsArray.splice(result.destination.index, 0, moved);
    newWorkout.workoutBlocks[blockIndex].lines[lineIndex].reps = repsArray;
    setEditableWorkout(newWorkout);
    onUpdate(newWorkout);
  };

  return (
    <div className="space-y-6">
      {editableWorkout.workoutBlocks.map((block, blockIndex) => (
        <div key={blockIndex} className="p-4 border border-gray-600 rounded bg-gray-800">
          {block.title && <h3 className="text-lg font-bold text-pink-400 mb-2">{block.title}</h3>}
          {block.lines.map((line, lineIndex) => (
            <div key={lineIndex} className="mb-4 p-3 border border-gray-700 rounded bg-gray-900">
              <h4 className="text-md font-semibold text-gray-100 mb-2">{line.name}</h4>
              <p className="text-sm text-gray-400 mb-2">Drag sets to reorder. Click '+' to add a set or 'x' to remove.</p>
              
              <DragDropContext onDragEnd={(result) => onDragEnd(result, blockIndex, lineIndex)}>
                <Droppable droppableId={`droppable-${blockIndex}-${lineIndex}`} direction="horizontal">
                  {(provided) => (
                    <div
                      className="flex space-x-2"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {Array.isArray(line.reps) && line.reps.map((repCount: number, setIndex: number) => (
                        <Draggable key={String(setIndex)} draggableId={`draggable-${blockIndex}-${lineIndex}-${setIndex}`} index={setIndex}>
                          {(providedDraggable) => (
                            <div
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                              className="flex items-center space-x-1 bg-gray-700 p-2 rounded"
                            >
                              <input
                                type="number"
                                value={repCount}
                                onChange={(e) => handleRepsChange(blockIndex, lineIndex, setIndex, e.target.value)}
                                className="w-12 text-center bg-gray-800 text-gray-100 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
                              />
                              <button
                                onClick={() => removeSet(blockIndex, lineIndex, setIndex)}
                                className="text-gray-300 hover:text-pink-400"
                              >
                                x
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <button
                onClick={() => addSet(blockIndex, lineIndex)}
                className="mt-2 px-2 py-1 bg-gray-600 text-gray-300 rounded hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-pink-400 text-sm"
              >
                + Add Set
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default WorkoutEditorDisplay;