"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-white text-gray-800">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-6 py-4 shadow-md">
        <div className="flex items-center space-x-6">
          <h1 className="text-lg font-bold">FitSync</h1>
          <a href="#" className="hover:underline">
            Home
          </a>
          <a href="#" className="hover:underline">
            Services
          </a>
          <a href="#" className="hover:underline">
            About Us
          </a>
          <a href="#" className="hover:underline">
            Contact
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/signup")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Join
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 text-gray-700 border rounded-md"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Image Row Under Navbar */}
      <div className="flex justify-center space-x-4 mt-8 px-8">
        <Image
          src="/images/landing_1.jpg"
          alt="Workout Example 1"
          width={300}
          height={300}
          className="rounded-md"
        />
        <Image
          src="/images/landing_2.jpg"
          alt="Workout Example 2"
          width={300}
          height={300}
          className="rounded-md"
        />
        <Image
          src="/images/landing_3.jpg"
          alt="Workout Example 3"
          width={300}
          height={300}
          className="rounded-md"
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center text-center px-8 lg:px-24 py-16">
        <h2 className="text-4xl font-bold mb-4">
          PERSONALIZED WORKOUT PLANS,
          <br />
          NO COACH NEEDED
        </h2>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl">
          Get gym-quality workout programming tailored to you in seconds.
          Answer a few questions, set your goals, and watch FitSync craft
          custom CrossFit, strength, or hypertrophy workouts—designed for
          home, gym, or on the go. Start leveling up your fitness today.
        </p>
        <button
          onClick={() => router.push("/signup")}
          className="px-6 py-3 bg-orange-500 text-white text-lg rounded-md hover:bg-orange-600"
        >
          Create your workout plan now
        </button>
        <div className="mt-4 text-sm text-gray-500">
          Rated 4.8 out of 5 by our users
        </div>
      </div>
    </div>
  );
}
