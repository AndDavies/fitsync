import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { format } from 'date-fns';
import { LiaBarsSolid } from 'react-icons/lia';

type WorkoutLine = {
  id: string;
  content: string;
  isFixed?: boolean;
};

type WorkoutBuilderProps = {
  workoutText: string;
  setWorkoutText: (text: string) => void;
};

const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({ workoutText, setWorkoutText }) => {
  const [workoutDate, setWorkoutDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [parsedLines, setParsedLines] = useState<WorkoutLine[]>([]);

  const handleParseWorkout = () => {
    const lines = workoutText
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line, index) => ({
        id: `item-${index}`,
        content: line,
        isFixed: index === 0,
      }));

    setParsedLines(lines);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.source.index === 0) return;

    const items = Array.from(parsedLines);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setParsedLines(items);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-md shadow-md max-w-3xl mx-auto text-gray-800 antialiased">
      <h2 className="text-2xl font-semibold mb-4 text-gray-600">Build Your Workout</h2>
      <div className="mb-4">
        <label htmlFor="workout-date" className="block text-sm font-semibold mb-1 text-gray-500">
          Date
        </label>
        <input
          type="date"
          id="workout-date"
          value={workoutDate}
          onChange={(e) => setWorkoutDate(e.target.value)}
          className="w-full p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="workout-input" className="block text-sm font-semibold mb-1 text-gray-500">
          Workout Details
        </label>
        <textarea
          id="workout-input"
          value={workoutText}
          onChange={(e) => setWorkoutText(e.target.value)}
          placeholder="Enter your workout details here..."
          className="w-full p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 h-28"
        />
      </div>
      <div className="flex space-x-2 mt-3">
        <button
          onClick={handleParseWorkout}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded hover:bg-gray-300 transition text-sm"
        >
          Continue
        </button>
        <button
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-400 transition text-sm"
        >
          Plan It
        </button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="workout-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-1 mt-6"
            >
              {parsedLines.map((line, index) => (
                line.isFixed ? (
                  <div
                    key={line.id}
                    className="p-2 border-b border-gray-200 bg-gray-200 font-bold text-sm text-gray-700"
                  >
                    <span>{line.content}</span>
                  </div>
                ) : (
                  <Draggable
                    key={line.id}
                    draggableId={line.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-2 border-b border-gray-200 bg-gray-50 text-sm text-gray-700 flex items-center ${
                          snapshot.isDragging ? 'bg-gray-100' : ''
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                          transition: 'transform 0.1s ease',
                        }}
                      >
                        <LiaBarsSolid className="text-gray-400 mr-2" />
                        <span>{line.content}</span>
                      </div>
                    )}
                  </Draggable>
                )
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default WorkoutBuilder;
