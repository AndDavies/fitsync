"use client";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Welcome to FitSync!</h1>
      <p className="mb-8 text-gray-600">
        Your ultimate workout companion to stay on track and achieve your goals.
      </p>
      <div className="space-x-4">
        <button
          onClick={() => router.push("/login")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Log In
        </button>
        <button
          onClick={() => router.push("/signup")}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
