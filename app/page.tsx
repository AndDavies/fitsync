"use client";

import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <>
      {/* Inject Google Font */}
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className="bg-gray-100 min-h-screen"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {/* Header */}
        <nav className="flex justify-between items-center px-6 bg-gray-100 shadow-md">
        <div className="flex items-center justify-center w-full">
          <Image src="/images/Ascent_Logo_trans.png" alt="ASCENT Logo" width={200} height={50} />
          {/* <a href="#" className="text-gray-800 hover:text-pink-500 font-bold">
            Home
          </a>
          <a href="#" className="text-gray-800 hover:text-pink-500 font-bold">
            Services
          </a>
          <a href="#" className="text-gray-800 hover:text-pink-500 font-bold">
            About Us
          </a>
          <a href="#" className="text-gray-800 hover:text-pink-500 font-bold">
            Contact
          </a> */}
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
        <div className="flex flex-col lg:flex-row items-center justify-between px-8 lg:px-16 py-12 bg-gray-100">
          {/* Text Content */}
          <div className="lg:w-1/2 text-left mb-8 lg:mb-0">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
              SIMPLIFY YOUR <br />
              PATH TO PEAK <br />
              PERFORMANCE
            </h1>
            <p className="text-lg font-semibold text-gray-700 mb-4">
              SMARTER WORKOUTS, SEAMLESS PROGRESS, PROVEN RESULTS.
            </p>
            <p className="text-base text-gray-600 mb-6">
              Built for <span className="font-bold">CrossFit</span>,{" "}
              <span className="font-bold">Hyrox</span>, and athletes committed
              to their health, ASCENT takes the complexity out of workout
              management, delivering powerful insights and world-class
              programming in the most user-friendly way possible.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-bold text-lg">
              REGISTER NOW
            </button>
          </div>

          {/* Placeholder for Woman and Pink Dot */}
          <div className="lg:w-1/2 relative flex justify-center items-center">
            <Image
              src="/images/pink_dot_background.png"
              alt="Fitness Woman and Pink Dot"
              width={900}
              height={900}
              className="relative z-10 rounded-md"
            />
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2 mt-4">
          <div className="h-2 w-2 bg-blue-800 rounded-full"></div>
          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </>
  );
}
