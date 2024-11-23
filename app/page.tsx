// app/page.tsx
"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-gray-100 text-gray-900">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-100 shadow-md">
        <div className="flex items-center space-x-6">
          <Image src="/images/Ascent_Logo_trans.png" alt="ASCENT Logo" width={100} height={50} />
          <a href="#" className="text-gray-800 hover:text-pink-500 font-bold">
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
          </a>
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
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section with Image on the Left and Content on the Right */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start px-8 py-16 lg:space-x-8">
        {/* Hero Image */}
        <div className="lg:w-1/2 flex justify-center">
          <Image
            src="/images/landing_hero_image.jpg"
            alt="Hero Workout Image"
            width={700}
            height={300}
            className="rounded-md shadow-lg"
          />
        </div>

        {/* Content Column */}
        <div className="lg:w-1/2 text-left mt-8 lg:mt-0">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Where Elite Fitness Meets Personalization
          </h2>
          <p className="text-lg text-gray-700 mb-6 max-w-lg">
            ASCENT brings you an unparalleled package for developing and programming workout plans.
          </p>
          <p className="text-lg text-gray-700 mb-6 max-w-lg">
            Leveraging CrossFit, StrongFit, and Functional Bodybuilding methodologies, our bespoke package connects you to elite training programs and coaches.
          </p>
          <p className="text-lg text-gray-700 mb-6 max-w-lg">
            With a unique AI coach to guide your progress and backlinks to your gym and trainers, ASCENT helps you elevate your health and fitness to levels you&apos;ve never imagined.
          </p>

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
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {/* <div className="flex justify-center space-x-4 mt-8 px-8">
        <Image
          src="/images/landing_1.jpg"
          alt="Workout Example 1"
          width={250}
          height={250}
          className="rounded-md shadow-md"
        />
        <Image
          src="/images/landing_2.jpg"
          alt="Workout Example 2"
          width={250}
          height={250}
          className="rounded-md shadow-md"
        />
        <Image
          src="/images/landing_3.jpg"
          alt="Workout Example 3"
          width={250}
          height={250}
          className="rounded-md shadow-md"
        />
      </div> */}
    </div>
  );
}
