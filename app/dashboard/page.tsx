"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "../components/Header";
import LeftNav from '../components/LeftNav';
import { useAuth } from '../context/AuthContext'; // Custom hook from AuthContext

export default function Dashboard() {
  const router = useRouter();
  const { session, isLoading } = useAuth(); // Using session and loading state from Supabase AuthContext

  // Log session data for debugging
  console.log('Session data:', session);
  console.log('Loading status:', isLoading);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login');
    }
  }, [isLoading, session, router]);

  // Show a loading state while checking session
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Left Navigation */}
        <LeftNav />

        {/* Main Dashboard Container */}
        <main className="flex flex-grow p-6 space-x-4">
          <h2>Welcome, {session?.user?.email}!</h2>
          <p>Dashboard content goes here.</p>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
