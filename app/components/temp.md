<div className="p-6 bg-gray-50 rounded-md shadow-md max-w-3xl mx-auto text-gray-800 antialiased">
      <h2 className="text-2xl font-semibold mb-4 text-gray-600">Build Your Workout</h2>
      {/* Date Input */}
      <div className="mb-4">
        <label htmlFor="workout-date" className="block text-sm font-semibold mb-1 text-gray-500">
          Date
          {workoutDate && <span className="text-green-500 ml-2">&#x2713;</span>}
        </label>
        <input
          type="date"
          id="workout-date"
          value={workoutDate}
          onChange={(e) => setWorkoutDate(e.target.value)}
          className={`w-1/2 p-2 border ${showTooltip && !workoutDate ? 'border-red-500' : 'border-gray-300'} bg-gray-100 text-sm text-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-gray-300`}
        />
      </div>
      
      {/* Workout Name Input */}
      <div className="mb-4">
        <label htmlFor="workout-name" className="block text-sm font-semibold mb-1 text-gray-500">
          Workout Name
          {workoutName && <span className="text-green-500 ml-2">&#x2713;</span>}
        </label>
        <input
          type="text"
          id="workout-name"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Enter the workout name"
          className="w-full p-2 border border-gray-300 bg-gray-100 rounded"
        />
      </div>

      {/* Track Selection Dropdown */}
      <div className="mb-4 relative">
        <label htmlFor="track-select" className="block text-sm font-semibold mb-1 text-gray-500">
          Select Track
          {selectedTrackId && <span className="text-green-500 ml-2">&#x2713;</span>}
        </label>
        <select
          id="track-select"
          value={selectedTrackId || ""}
          onChange={(e) => setSelectedTrackId(e.target.value || null)}
          className={`w-1/2 p-2 border ${showTooltip && !selectedTrackId ? 'border-red-500' : 'border-gray-300'} bg-gray-100 text-sm text-gray-800 rounded`}
        >
          <option value="" disabled>Select a track</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>{track.name}</option>
          ))}
       
       </select>
        {showTooltip && !selectedTrackId && (
          <div className="absolute text-xs bg-yellow-100 border border-yellow-300 text-yellow-800 p-1 rounded -top-7 left-0">
            <span>&#128073;</span> Please select a track.
          </div>
        )}
      </div>
      
      {/* Warm Up Toggle and Input */}
      <div className="mb-4">
        <label htmlFor="warm-up-toggle" className="block text-sm font-semibold mb-1 text-gray-500">
          <button onClick={() => setShowWarmUp(!showWarmUp)} className="text-blue-500">
            {showWarmUp ? "Hide Warm Up" : "Add Warm Up"}
          </button>
        </label>
        {showWarmUp && (
          <textarea
            id="warm-up"
            value={warmUp}
            onChange={(e) => setWarmUp(e.target.value)}
            placeholder="Enter your warm-up details here..."
            className="w-full p-2 border border-gray-300 bg-gray-100 rounded"
          />
        )}
      </div>

      {/* Workout Details */}
      <div className="mb-4">
        <label htmlFor="workout-input" className="block text-sm font-semibold mb-1 text-gray-500">
          Workout Details
          {workoutText && <span className="text-green-500 ml-2">&#x2713;</span>}
        </label>
        <textarea
          id="workout-input"
          value={workoutText}
          onChange={(e) => {
            setWorkoutText(e.target.value);
            setIsValidated(false);
          }}
          placeholder="Enter your workout details here..."
          className={`w-full p-2 border ${showTooltip && !workoutText ? 'border-red-500' : 'border-gray-300'} bg-gray-100 text-sm text-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 h-28`}
        />
      </div>

      {/* Cool Down Toggle and Input */}
      <div className="mb-4">
        <label htmlFor="cool-down-toggle" className="block text-sm font-semibold mb-1 text-gray-500">
          <button onClick={() => setShowCoolDown(!showCoolDown)} className="text-blue-500">
            {showCoolDown ? "Hide Cool Down" : "Add Cool Down"}
          </button>
        </label>
        {showCoolDown && (
          <textarea
            id="cool-down"
            value={coolDown}
            onChange={(e) => setCoolDown(e.target.value)}
            placeholder="Enter your cool-down details here..."
            className="w-full p-2 border border-gray-300 bg-gray-100 rounded"
          />
        )}
      </div>

      {/* Scoring Options */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-500">Scoring</label>
        <div className="flex space-x-2">
          <select
            value={scoringSet}
            onChange={(e) => setScoringSet(parseInt(e.target.value))}
            className="w-1/4 p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((set) => (
              <option key={set} value={set}>{`${set} set${set > 1 ? 's' : ''}`}</option>
            ))}
          </select>
          <span>of</span>
          <select
            value={scoringType || ""}
            onChange={(e) => setScoringType(e.target.value)}
            className={`w-1/2 p-2 border ${showTooltip && !scoringType ? 'border-red-500' : 'border-gray-300'} bg-gray-100 text-sm text-gray-800 rounded`}
          >
            <option value="" disabled>Select type</option>
            {["Time", "Rounds + Reps", "Reps", "Load", "Calories", "Metres", "Check Box", "Not Scored"].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Scoring Options */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-500">Advanced Scoring Options</label>
        <div className="flex space-x-2">
          <select value={advancedScoring} disabled className="w-1/2 p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded">
            <option value="Minimum">Minimum</option>
            <option value="Maximum">Maximum</option>
          </select>
          <span>of</span>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-1/2 p-2 border border-gray-300 bg-gray-100 text-sm text-gray-800 rounded"
          >
            <option value="Descending">Descending ("bigger scores first")</option>
            <option value="Ascending">Ascending ("smaller scores first")</option>
          </select>
        </div>
      </div>

      {/* Add Coach's Notes Button and Modal */}
      <div className="mb-4">
        <button
          onClick={() => setShowNotesModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Add Coach's Notes
        </button>
      </div>

      {showNotesModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Coach's Notes</h3>
            <textarea
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              placeholder="Enter any notes or instructions here..."
              className="w-full p-2 border boloadrder-gray-300 bg-gray-100 text-sm text-gray-800 rounded h-28 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={() => setShowNotesModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">Cancel</button>
              <button onClick={() => setShowNotesModal(false)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Plan It and Validate Buttons */}
      <div className="flex space-x-2 mt-3">
        <button
          onClick={handleParseWorkout}
          className={`flex-1 px-4 py-2 font-semibold rounded transition text-sm ${!isValidated ? 'bg-pink-200 text-gray-700 hover:bg-pink-300' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Validate
        </button>
        <button
          onClick={handlePlanWorkout}
          disabled={!isValidated || !selectedTrackId || !scoringType || workoutName.trim() === ""}
          className={`flex-1 px-4 py-2 font-semibold rounded transition text-sm ${isValidated && selectedTrackId && scoringType && workoutName.trim() !== "" ? 'bg-pink-500 text-white hover:bg-pink-600' : 'bg-gray-300 text-gray-700 cursor-not-allowed'}`}
        >
          Plan It
        </button>
      </div>

      {/* Parsed Workout Lines Display */}
      <div className="space-y-1 mt-6">
        {parsedLines.map((line) => (
          <div key={line.id} className="p-2 border-b border-gray-200 bg-gray-50 text-sm text-gray-700">
            {line.content}
          </div>
        ))}
      </div>
    </div>