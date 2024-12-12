"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";

export default function LandingPage() {
  const router = useRouter();
  const { isLoading, session } = useAuth(); // assuming AuthContext provides this

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  // If user is logged in (session) redirect or show a different link
  // Otherwise show the landing page
  // ... no changes needed if the logic is correct.

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        {/* Header */}
        <nav className="flex justify-between items-center px-6 bg-gray-100 shadow-md">
          <div className="flex items-center justify-center w-full">
            <Image
              src="/images/Ascent_Logo_500x200.png"
              alt="ASCENT Logo"
              width={200}
              height={10}
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/signup")}
              className="px-4 py-2 bg-pink-500 text-white font-bold rounded-md hover:bg-pink-600"
            >
              Join
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 text-gray-800 border border-pink-500 font-bold rounded-md hover:bg-pink-500 hover:text-white"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div
          className="relative bg-cover bg-center w-full"
          style={{
            backgroundImage: `url('/images/hero_background.png')`,
          }}
        >
          <div className="w-full flex items-start justify-between px-6 py-12">
            {/* Left Section */}
            <div className="w-3/5 bg-white bg-opacity-0 p-8 rounded-md flex flex-col items-center text-center font-poppins">
              <h1 className="text-7xl font-extrabold text-gray-900 mb-6 tracking-tighter">
                SIMPLIFY YOUR <br />
                PATH TO PEAK <br />
                PERFORMANCE
              </h1>
              <p className="text-gray-700 text-xl mb-8 leading-relaxed">
                Make movement a part of your daily life with mini workouts and easy exercises
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push("/login")}
                  className="bg-pink-500 text-white px-8 py-4 text-lg font-bold rounded-md hover:bg-pink-600 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/Get Started")}
                  className="bg-pink-500 text-white px-8 py-4 text-lg font-bold rounded-md hover:bg-pink-600 transition"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Right Section */}
            <div className="w-2/5 hidden lg:block">
              <Image
                src="/images/hero_right_ascent.png"
                alt="Hero Image"
                height={900}
                width={500}
                className="rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
