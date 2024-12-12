// components/GymGuard.tsx
"use client";
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const GymGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userData } = useAuth();
  const router = useRouter();

  if (!userData) {
    return <div>Loading user data...</div>; 
    // Could be a <LoadingSpinner/> component
  }

  if (!userData.current_gym_id) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-gray-700">
        <h2 className="text-xl font-semibold mb-2">No Gym Associated</h2>
        <p className="text-sm mb-4">You currently have no gym associated with your account. Join or add a gym to view these features.</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
          onClick={() => router.push('/profile')}
        >
          Update Profile
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default GymGuard;
