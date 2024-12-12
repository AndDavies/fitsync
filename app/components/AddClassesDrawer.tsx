"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { format, parseISO, isValid, addWeeks } from "date-fns";

interface ClassType {
  id: string;
  class_name: string;
  description: string | null;
  color: string;
}

interface AddClassesDrawerProps {
  classType: ClassType;
  currentGymId: string;
  onClose: () => void;
  refreshSchedules: () => void;
}

const AddClassesDrawer: React.FC<AddClassesDrawerProps> = ({
  classType,
  currentGymId,
  onClose,
  refreshSchedules,
}) => {

  // Steps: 
  // 1: Confirm Class Type
  // 2: Single vs Recurring
  // 3: Based on choice:
  //    Single: Date, Start/End
  //    Recurring: Start Date, Days of Week, Times, Weeks
  // 4: Max Participants
  // 5: Preview & Confirm

  const [currentStep, setCurrentStep] = useState<number>(1);

  const [occurrenceType, setOccurrenceType] = useState<"single" | "recurring">("single");

  // Single occurrence fields
  const [singleDate, setSingleDate] = useState<string>("");
  const [singleStartTime, setSingleStartTime] = useState<string>("");
  const [singleEndTime, setSingleEndTime] = useState<string>("");

  // Recurring fields
  const [startDate, setStartDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [weeksCount, setWeeksCount] = useState<number>(1);
  const [selectedDays, setSelectedDays] = useState<{ [key: string]: boolean }>({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });

  const [maxParticipants, setMaxParticipants] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 5;

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const validateFieldsForCurrentStep = (): boolean => {
    setError(null);
    if (currentStep === 1) {
      // Step 1: Just confirm class type (already selected), always valid
      return true;
    } else if (currentStep === 2) {
      // Must have chosen occurrenceType
      return true; // always chosen by default single
    } else if (currentStep === 3) {
      if (occurrenceType === "single") {
        if (!singleDate || !singleStartTime || !singleEndTime) {
          setError("Please fill in date and start/end time for the single class.");
          return false;
        }
      } else {
        // recurring
        if (!startDate || !startTime || !endTime) {
          setError("For recurring classes, please fill in start date and times.");
          return false;
        }
        const anyDaySelected = Object.values(selectedDays).some(v => v);
        if (!anyDaySelected) {
          setError("Please select at least one day of the week.");
          return false;
        }
        if (weeksCount < 1) {
          setError("Weeks count must be at least 1.");
          return false;
        }
      }
      return true;
    } else if (currentStep === 4) {
      if (maxParticipants < 1) {
        setError("Max participants must be at least 1.");
        return false;
      }
      return true;
    } else if (currentStep === 5) {
      // Final preview step, no input to validate
      return true;
    }
    return true;
  };

  const goNext = () => {
    if (validateFieldsForCurrentStep()) {
      if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCreateClasses = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const inserts = [];

      if (occurrenceType === "single") {
        const startDateTime = `${singleDate}T${singleStartTime}`;
        const endDateTime = `${singleDate}T${singleEndTime}`;
        inserts.push({
          current_gym_id: currentGymId,
          class_name: classType.class_name,
          start_time: startDateTime,
          end_time: endDateTime,
          max_participants: maxParticipants,
          class_type_id: classType.id,
        });
      } else {
        // Recurring
        const startDateObj = parseISO(startDate);
        if (!isValid(startDateObj)) {
          setError("Invalid start date. Please enter a valid date.");
          setIsSubmitting(false);
          return;
        }

        const dayToIndex: { [key: string]: number } = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };

        const daysOfWeekSelected = Object.entries(selectedDays)
          .filter(([_, val]) => val)
          .map(([day]) => day);

        for (let week = 0; week < weeksCount; week++) {
          const newWeekDate = addWeeks(startDateObj, week);
          daysOfWeekSelected.forEach((day) => {
            const dayIndex = dayToIndex[day];
            const tempDate = new Date(newWeekDate);
            tempDate.setDate(tempDate.getDate() + (dayIndex - tempDate.getDay()));
            const classDate = format(tempDate, "yyyy-MM-dd");
            const startDateTime = `${classDate}T${startTime}`;
            const endDateTime = `${classDate}T${endTime}`;
            inserts.push({
              current_gym_id: currentGymId,
              class_name: classType.class_name,
              start_time: startDateTime,
              end_time: endDateTime,
              max_participants: maxParticipants,
              class_type_id: classType.id,
            });
          });
        }
      }

      const { error: insertError } = await supabase
        .from("class_schedules")
        .insert(inserts);

      if (insertError) {
        setError(insertError.message);
      } else {
        refreshSchedules();
        onClose();
      }
    } catch {
      setError("Unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step Indicator Component
  const StepIndicator = () => (
    <div className="mb-4">
      <p className="text-sm text-gray-700 font-semibold">Step {currentStep} of {totalSteps}</p>
      <div className="flex space-x-1 mt-1">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`h-2 flex-grow rounded-full ${idx < currentStep ? 'bg-pink-500' : 'bg-gray-300'}`}
          ></div>
        ))}
      </div>
    </div>
  );

  // Preview Logic
  const renderPreview = () => {
    if (occurrenceType === "single") {
      return (
        <div className="text-sm text-gray-700 space-y-1">
          <p>Class: {classType.class_name}</p>
          <p>Date: {singleDate}</p>
          <p>Time: {singleStartTime} - {singleEndTime}</p>
          <p>Max Participants: {maxParticipants}</p>
        </div>
      );
    } else {
      const daysSelected = Object.entries(selectedDays)
        .filter(([_, val]) => val)
        .map(([day]) => day)
        .join(", ");

      return (
        <div className="text-sm text-gray-700 space-y-1">
          <p>Class: {classType.class_name}</p>
          <p>Start Date: {startDate}</p>
          <p>Days: {daysSelected}</p>
          <p>Time: {startTime} - {endTime}</p>
          <p>Number of Weeks: {weeksCount}</p>
          <p>Max Participants: {maxParticipants}</p>
          <p>This will create multiple classes. For example, if you picked 2 days/week for 4 weeks, that’s 8 classes total.</p>
        </div>
      );
    }
  };

  // Render fields based on currentStep
  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Confirm Class Type</h3>
          <p className="text-sm text-gray-700">You have selected: <span className="font-bold">{classType.class_name}</span></p>
          {classType.description && <p className="text-xs text-gray-600">{classType.description}</p>}
          <p className="text-xs text-gray-500">Click "Next" to proceed.</p>
        </div>
      );
    } else if (currentStep === 2) {
      return (
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Single vs Recurring</h3>
          <p className="text-sm text-gray-700">
            Do you want to schedule a single class or create a recurring schedule over multiple weeks?
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="occurrence"
                value="single"
                checked={occurrenceType === "single"}
                onChange={() => setOccurrenceType("single")}
                className="focus:ring-pink-500"
              />
              <span>Single Class</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="occurrence"
                value="recurring"
                checked={occurrenceType === "recurring"}
                onChange={() => setOccurrenceType("recurring")}
                className="focus:ring-pink-500"
              />
              <span>Recurring Schedule</span>
            </label>
          </div>
        </div>
      );
    } else if (currentStep === 3) {
      if (occurrenceType === "single") {
        return (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Class Date & Time</h3>
            <div>
              <label className="block mb-1 font-medium">Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Start Time</label>
              <input
                type="time"
                title="Select class start time"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={singleStartTime}
                onChange={(e) => setSingleStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Time</label>
              <input
                type="time"
                title="Select class end time. Usually 1 hour after start."
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={singleEndTime}
                onChange={(e) => setSingleEndTime(e.target.value)}
              />
            </div>
          </div>
        );
      } else {
        // Recurring
        const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
        return (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Recurring Schedule Details</h3>
            <div>
              <label className="block mb-1 font-medium">Start Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Start Time</label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Time</label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Days of the Week</label>
              <div className="grid grid-cols-4 gap-2 text-sm">
                {days.map(day => (
                  <label key={day} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      className="focus:ring-pink-500"
                      checked={selectedDays[day]}
                      onChange={() => handleDayToggle(day)}
                    />
                    <span className="capitalize">{day}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Number of Weeks</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={weeksCount}
                onChange={(e) => setWeeksCount(Number(e.target.value))}
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                E.g., choosing M/W for 4 weeks creates 8 classes total.
              </p>
            </div>
          </div>
        );
      }
    } else if (currentStep === 4) {
      return (
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Max Participants</h3>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            min="1"
          />
          <p className="text-sm text-gray-700">Set the maximum number of participants for these classes.</p>
        </div>
      );
    } else if (currentStep === 5) {
      return (
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Review & Confirm</h3>
          {renderPreview()}
          <p className="text-sm text-gray-500">If everything looks correct, click "Create Classes" below.</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <StepIndicator />

      {renderStepContent()}

      {error && <div className="text-red-500 text-sm mt-4">{error}</div>}

      <div className="flex justify-between mt-6">
        {currentStep > 1 && (
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            onClick={goBack}
            disabled={isSubmitting}
          >
            Back
          </button>
        )}
        <div className="flex space-x-2">
          {currentStep < totalSteps && (
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              onClick={goNext}
              disabled={isSubmitting}
            >
              Next
            </button>
          )}
          {currentStep === totalSteps && (
            <button
              type="button"
              onClick={handleCreateClasses}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Classes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddClassesDrawer;
