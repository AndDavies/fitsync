// components/Header.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';  // Use useAuth from your context
import { supabase } from '@/utils/supabase/client'; // Import supabase client

const Header: React.FC = () => {
  const { session, isLoading } = useAuth();  // Get session from AuthContext

  // Show loading or session data
  if (isLoading) {
    return <div>Loading...</div>;  // Or any loading state you prefer
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();  // Use Supabase's signOut method
  };

  return (
    <header className="flex justify-between items-center bg-gray-900 px-4 py-3 shadow-lg border-b border-gray-700 text-gray-100">
      <div className="flex items-center space-x-3">
        <Image
          src="/images/EB_05189_avatar.jpg" // Replace with your path
          alt="Profile"
          width={36}
          height={36}
          className="rounded-full border border-gray-700"
        />
        <h1 className="text-lg font-semibold">
          Welcome back, {session?.user?.email || 'Guest'}!
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-xs font-light">Ready to crush a workout?</span>
        {session ? (
          <button
            onClick={handleSignOut}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
          >
            Log Out
          </button>
        ) : (
          <span className="text-xs">Not logged in</span>
        )}
      </div>
    </header>
  );
};

export default Header;
