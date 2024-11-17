{/* Header Row */}
      <div className="calendar-header text-center py-4 border-b w-full">
        <h2 className="text-lg font-semibold text-gray-700">
          Week of {format(weekDates[0], "MMMM d, yyyy")}
        </h2>
      </div>


      {/* Navigation Buttons Row */}
      <div className="calendar-navigation flex justify-between items-center mt-4 px-4 border-t py-4">
        <button onClick={goToPreviousWeek} className="text-blue-500 hover:text-blue-700 transition">
          ← Previous Week
        </button>
        <button onClick={goToNextWeek} className="text-blue-500 hover:text-blue-700 transition">
          Next Week →
        </button>
      </div>
