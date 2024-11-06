"use client";
import Image from "next/image";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="flex justify-between items-center bg-white px-6 py-4 shadow-md">
        <div className="flex items-center space-x-4">
          <Image
            src="/images/EB_05189_avatar.jpg" // Replace with your path
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full"
          />
          <h1 className="text-xl font-bold">Welcome back, DisplayName!</h1>
        </div>
        <div className="text-sm">Ready to Crush Todays Workout?</div>
      </header>

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Left Navigation */}
        <nav className="flex flex-col items-center bg-white w-20 py-4 shadow-md space-y-6">
          <button>🏠</button>
          <button>📊</button>
          <button>🏆</button>
          <button>🔔</button>
          <button>⚙️</button>
        </nav>

        {/* Main Dashboard Container */}
        <main className="flex-grow p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Widgets */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="font-bold">Recent Activity</h2>
            <ul className="text-sm mt-2">
              <li>5:32 Fran</li>
              <li>205# Clean & Jerk PR</li>
              <li>Other Scores or Highlights</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="font-bold">Goal Tracker</h2>
            <p>415# Deadlift</p>
            {/* Include chart or progress indicator here */}
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="font-bold">Streak Indicator</h2>
            <p>17 Consistent Days! 🔥</p>
            <p>You’ve earned a Badge: 75%</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md col-span-2">
            <h2 className=" text-2xl font-extra-bold">WOD</h2>
            <h3 className="text-lg font-bold">Warm Up</h3>
            <p>2 Sets:
                Hip Floss x 5 Reps<br />
                Frog Hops x 20m<br />
                Duck Walk x 20m<br />
            </p>
            <h3 className="text-lg font-bold">Strength: Back Squat</h3>
            <p>Back Squat</p>
            <p>Work to a 5 Rep Max</p>
            <p>Time Cap: 10 Minutes</p>
            <h3 className="text-lg font-bold">METCON</h3>
            <p>50 D-Ball or Sandbag OTS...</p>
            <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded">
              Log Workout
            </button>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="font-bold">Progress Trackers</h2>
            <p>
                <ul>
                    <li>Weight</li>
                    <li>Body Fat</li>
                    <li>VO2 Max</li>
                </ul>
            </p>
            <a href="#" className="text-blue-500 text-sm">View Full Progress</a>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="font-bold">Community</h2>
            {/* Community widget placeholder */}
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="font-bold">Connect with a Gym/Coach Near You</h2>
            {/* Additional widget placeholder */}
            <p>
                <ul>
                    <li><a href="#" className="text-blue-500 text-sm">CrossFit Bytown</a></li>
                    <li>613-222-9817</li>
                </ul>
            </p>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
