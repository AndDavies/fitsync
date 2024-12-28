"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { format, parseISO, isValid, addWeeks, addMinutes } from "date-fns";

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

/** 
 * Common start times in 15-min increments from 5:00 to 22:00 (10 PM).
 */
const possibleStartTimes = [
  "05:00","05:15","05:30","05:45",
  "06:00","06:15","06:30","06:45",
  "07:00","07:15","07:30","07:45",
  "08:00","08:15","08:30","08:45",
  "09:00","09:15","09:30","09:45",
  "10:00","10:15","10:30","10:45",
  "11:00","11:15","11:30","11:45",
  "12:00","12:15","12:30","12:45",
  "13:00","13:15","13:30","13:45",
  "14:00","14:15","14:30","14:45",
  "15:00","15:15","15:30","15:45",
  "16:00","16:15","16:30","16:45",
  "17:00","17:15","17:30","17:45",
  "18:00","18:15","18:30","18:45",
  "19:00","19:15","19:30","19:45",
  "20:00","20:15","20:30","20:45",
  "21:00","21:15","21:30","21:45",
  "22:00",
];

/** Durations in minutes to offer, e.g. 45, 60, 90, 120. */
const possibleDurations = [45, 50, 60, 90, 120];

const AddClassesDrawer: React.FC<AddClassesDrawerProps> = ({
  classType,
  currentGymId,
  onClose,
  refreshSchedules,
}) => {
  // Wizard steps
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // Error & loading state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Single vs recurring
  const [occurrenceType, setOccurrenceType] = useState<"single" | "recurring">("single");

  // Single fields
  const [singleDate, setSingleDate] = useState<string>("");
  const [singleStartTime, setSingleStartTime] = useState<string>("06:00");
  const [singleDuration, setSingleDuration] = useState<number>(60);
  const [singleEndTime, setSingleEndTime] = useState<string>("07:00");

  // Recurring fields
  const [startDate, setStartDate] = useState<string>("");
  const [recurringStartTime, setRecurringStartTime] = useState<string>("06:00");
  const [recurringDuration, setRecurringDuration] = useState<number>(60);
  const [recurringEndTime, setRecurringEndTime] = useState<string>("07:00");
  const [weeksCount, setWeeksCount] = useState<number>(1);
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });

  // Common field
  const [maxParticipants, setMaxParticipants] = useState<number>(10);

  // Recompute singleEndTime whenever singleStartTime / singleDuration changes
  useEffect(() => {
    const newEnd = computeEndTime(singleStartTime, singleDuration);
    setSingleEndTime(newEnd);
  }, [singleStartTime, singleDuration]);

  // Recompute recurringEndTime whenever recurringStartTime / recurringDuration changes
  useEffect(() => {
    const newEnd = computeEndTime(recurringStartTime, recurringDuration);
    setRecurringEndTime(newEnd);
  }, [recurringStartTime, recurringDuration]);

  /** 
   * Helper: parse "HH:mm" + duration (mins) → new "HH:mm" 
   */
  function computeEndTime(start: string, durationMins: number): string {
    const [hh, mm] = start.split(":");
    const dateObj = new Date();
    dateObj.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
    const plus = addMinutes(dateObj, durationMins);
    const endHH = plus.getHours().toString().padStart(2, "0");
    const endMM = plus.getMinutes().toString().padStart(2, "0");
    return `${endHH}:${endMM}`;
  }

  function handleDayToggle(day: string) {
    setSelectedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  }

  // Basic validation per step
  function validateFieldsForCurrentStep(): boolean {
    setError(null);
    if (currentStep === 1) {
      return true;
    } else if (currentStep === 2) {
      return true;
    } else if (currentStep === 3) {
      if (occurrenceType === "single") {
        if (!singleDate) {
          setError("Please select a date for the single class.");
          return false;
        }
      } else {
        if (!startDate) {
          setError("Please select the start date for recurring classes.");
          return false;
        }
        const anyDaySelected = Object.values(selectedDays).some((v) => v);
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
      return true;
    }
    return true;
  }

  function goNext() {
    if (validateFieldsForCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  }

  function goBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  // Submit to supabase
  async function handleCreateClasses() {
    setIsSubmitting(true);
    setError(null);

    try {
      const inserts: any[] = [];

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
        // recurring
        const startDateObj = parseISO(startDate);
        if (!isValid(startDateObj)) {
          setError("Invalid start date. Please enter a valid date.");
          setIsSubmitting(false);
          return;
        }

        const dayToIndex: Record<string, number> = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };

        const daysSelected = Object.entries(selectedDays)
          .filter(([_, val]) => val)
          .map(([day]) => day);

        for (let week = 0; week < weeksCount; week++) {
          const newWeekDate = addWeeks(startDateObj, week);
          for (const day of daysSelected) {
            const dayIndex = dayToIndex[day];
            const tempDate = new Date(newWeekDate);
            // shift to correct day of that week
            tempDate.setDate(tempDate.getDate() + (dayIndex - tempDate.getDay()));

            const classDate = format(tempDate, "yyyy-MM-dd");
            const startDateTime = `${classDate}T${recurringStartTime}`;
            const endDateTime = `${classDate}T${recurringEndTime}`;

            inserts.push({
              current_gym_id: currentGymId,
              class_name: classType.class_name,
              start_time: startDateTime,
              end_time: endDateTime,
              max_participants: maxParticipants,
              class_type_id: classType.id,
            });
          }
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
    } catch (err) {
      setError("Unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Step content
  function renderStepContent() {
    if (currentStep === 1) {
      return (
        <div className="space-y-1">
          <h3 className="text-md font-semibold text-pink-400">
            Step 1: Confirm Class Type
          </h3>
          <p className="text-sm text-gray-300">
            You have selected:{" "}
            <span className="font-bold text-white">{classType.class_name}</span>
          </p>
          {classType.description && (
            <p className="text-xs text-gray-400">{classType.description}</p>
          )}
          <p className="text-xs text-gray-500">Click “Next” to proceed.</p>
        </div>
      );
    } else if (currentStep === 2) {
      return (
        <div className="space-y-3">
          <h3 className="text-md font-semibold text-pink-400">
            Step 2: Single vs Recurring
          </h3>
          <p className="text-sm text-gray-300">
            Create a single class or schedule multiple recurring ones.
          </p>
          <div className="flex items-center space-x-6 mt-2">
            <label className="flex items-center space-x-2 text-sm text-gray-300">
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
            <label className="flex items-center space-x-2 text-sm text-gray-300">
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
      // Single vs. Recurring
      if (occurrenceType === "single") {
        return (
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-pink-400">
              Step 3: Date & Time (Single)
            </h3>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Date
              </label>
              <input
                type="date"
                className="w-full max-w-xs p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  Start Time
                </label>
                <select
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={singleStartTime}
                  onChange={(e) => setSingleStartTime(e.target.value)}
                >
                  {possibleStartTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              {/* Removed the <br /> that broke the grid layout */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  Duration (minutes)
                </label>
                <select
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={singleDuration}
                  onChange={(e) => setSingleDuration(Number(e.target.value))}
                >
                  {possibleDurations.map((d) => (
                    <option key={d} value={d}>
                      {d} min
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                End Time (auto-calculated)
              </label>
              <input
                type="text"
                readOnly
                className="w-full max-w-xs p-2 border border-gray-600 rounded bg-gray-700 text-gray-300 text-sm cursor-not-allowed"
                value={singleEndTime}
              />
            </div>
          </div>
        );
      } else {
        // recurring
        const days = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
        return (
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-pink-400">
              Step 3: Recurring Details
            </h3>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                className="w-full max-w-xs p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  Start Time
                </label>
                <select
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={recurringStartTime}
                  onChange={(e) => setRecurringStartTime(e.target.value)}
                >
                  {possibleStartTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  Duration (minutes)
                </label>
                <select
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={recurringDuration}
                  onChange={(e) => setRecurringDuration(Number(e.target.value))}
                >
                  {possibleDurations.map((d) => (
                    <option key={d} value={d}>
                      {d} min
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                End Time (auto-calculated)
              </label>
              <input
                type="text"
                readOnly
                className="w-full max-w-xs p-2 border border-gray-600 rounded bg-gray-700 text-gray-300 text-sm cursor-not-allowed"
                value={recurringEndTime}
              />
            </div>

            <div className="border-2">
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Days of the Week
              </label>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-200">
                {days.map((day) => (
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
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Number of Weeks
              </label>
              <input
                type="number"
                className="w-full max-w-xs p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={weeksCount}
                onChange={(e) => setWeeksCount(Number(e.target.value))}
                min={1}
              />
              <p className="text-xs text-gray-400 mt-1">
                E.g., picking Monday &amp; Wednesday for 4 weeks = 8 total
                classes.
              </p>
            </div>
          </div>
        );
      }
    } else if (currentStep === 4) {
      return (
        <div className="space-y-3">
          <h3 className="text-md font-semibold text-pink-400">
            Step 4: Max Participants
          </h3>
          <input
            type="number"
            className="w-full max-w-xs p-2 border border-gray-600 rounded bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            min={1}
          />
          <p className="text-xs text-gray-400">
            The maximum number of people who can register for this class.
          </p>
        </div>
      );
    } else if (currentStep === 5) {
      return (
        <div className="space-y-3">
          <h3 className="text-md font-semibold text-pink-400">
            Step 5: Review &amp; Confirm
          </h3>
          {renderPreview()}
          <p className="text-sm text-gray-400">
            If everything looks correct, click "Create Classes".
          </p>
        </div>
      );
    }
    return null;
  }

  function renderPreview() {
    if (occurrenceType === "single") {
      return (
        <div className="text-sm text-gray-300 space-y-1">
          <p>
            Class: <span className="text-white">{classType.class_name}</span>
          </p>
          <p>Date: {singleDate || "N/A"}</p>
          <p>
            Time: {singleStartTime} - {singleEndTime}
          </p>
          <p>Max Participants: {maxParticipants}</p>
        </div>
      );
    } else {
      const daysSelected = Object.entries(selectedDays)
        .filter(([_, val]) => val)
        .map(([day]) => day)
        .join(", ");
      return (
        <div className="text-sm text-gray-300 space-y-1">
          <p>
            Class: <span className="text-white">{classType.class_name}</span>
          </p>
          <p>Start Date: {startDate || "N/A"}</p>
          <p>Days: {daysSelected || "None"}</p>
          <p>
            Time: {recurringStartTime} - {recurringEndTime}
          </p>
          <p>Number of Weeks: {weeksCount}</p>
          <p>Max Participants: {maxParticipants}</p>
          <p className="text-xs text-gray-400">
            This will create multiple classes. E.g., 2 days/week for 4 weeks =
            8 classes.
          </p>
        </div>
      );
    }
  }

  // Step indicator
  const StepIndicator = () => (
    <div className="mb-4">
      <p className="text-sm text-gray-400 font-semibold">
        Step {currentStep} of {totalSteps}
      </p>
      <div className="flex space-x-1 mt-2">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`h-2 flex-grow rounded-full ${
              idx < currentStep ? "bg-pink-500" : "bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );

  return (
    // Add classes for full-height, no extra padding
    <div className="w-full h-full bg-gray-900 text-gray-200 flex flex-col overflow-y-auto p-2">
      <StepIndicator />

      {renderStepContent()}

      {error && <div className="text-red-500 text-sm mt-4">{error}</div>}

      <div className="flex justify-between mt-6">
        {currentStep > 1 && (
          <button
            type="button"
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
