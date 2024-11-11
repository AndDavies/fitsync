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
      .map((line, index) => {
        const isFixed = index === 0;
        return { id: `item-${index}`, content: line, isFixed };
      });

    setParsedLines(lines);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === 0) return;

    const items = Array.from(parsedLines);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setParsedLines(items);
  };

  return (
    <div className="p-6 bg-gray-200 rounded-md shadow-md max-w-3xl mx-auto text-gray-900">
      <h2 className="text-4xl font-extrabold mb-4 text-gray-800">Build Your Workout</h2>
      <div className="mb-4">
        <label htmlFor="workout-date" className="block text-base font-semibold mb-1 text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="workout-date"
          value={workoutDate}
          onChange={(e) => setWorkoutDate(e.target.value)}
          className="w-full p-2 border border-gray-400 bg-gray-100 text-sm text-gray-900 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="workout-input" className="block text-base font-semibold mb-1 text-gray-700">
          Workout Details
        </label>
        <textarea
          id="workout-input"
          value={workoutText}
          onChange={(e) => setWorkoutText(e.target.value)}
          placeholder="Enter your workout details here..."
          className="w-full p-2 border border-gray-400 bg-gray-100 text-sm text-gray-900 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-500 h-28"
        />
        <button
          onClick={handleParseWorkout}
          className="mt-3 px-5 py-1.5 bg-gray-700 text-white font-bold rounded-sm hover:bg-gray-600 transition text-sm"
        >
          Continue
        </button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="workout-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-1"
            >
              {parsedLines.map((line, index) => (
                line.isFixed ? (
                  <div
                    key={line.id}
                    className="p-2 border-b border-gray-400 bg-gray-300 font-bold text-sm text-gray-900"
                  >
                    <span>{line.content}</span>
                  </div>
                ) : (
                  <Draggable
                    key={line.id}
                    draggableId={line.id}
                    index={index}
                    isDragDisabled={!!line.isFixed}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-2 border-b border-gray-400 bg-gray-100 text-sm text-gray-900 flex items-center ${
                          snapshot.isDragging ? 'bg-gray-200' : ''
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                          transition: 'transform 0.1s ease',
                        }}
                      >
                        <LiaBarsSolid className="text-gray-600 mr-2" />
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
      <button className="mt-4 w-full px-5 py-1.5 bg-gray-700 text-white font-bold rounded-sm hover:bg-gray-600 transition text-sm">
        Plan It
      </button>
    </div>
  );
};

export default WorkoutBuilder;
