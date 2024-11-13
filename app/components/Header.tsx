// components/Header.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const { session, isLoading, userData } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login'); // Redirect to the login page after logging out
  };

  return (
    <header className="flex justify-between items-center bg-gray-900 px-6 py-2 shadow-md border-b border-gray-800 text-gray-100">
      <div className="flex items-center space-x-2">
        <Image
          src="/images/EB_05189_avatar.jpg"
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full border border-gray-600"
        />
        <h1 className="text-sm font-medium text-gray-300">
          Welcome back, {userData?.display_name || session?.user?.email || 'Guest'}!
        </h1>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-xs text-gray-400">Ready to crush a workout?</span>
        {session ? (
          <button
            onClick={handleSignOut}
            className="px-3 py-1 bg-red-500 text-xs text-white rounded hover:bg-red-600 transition"
          >
            Log Out
          </button>
        ) : (
          <span className="text-xs text-gray-400">Not logged in</span>
        )}
      </div>
    </header>
  );
};

export default Header;
