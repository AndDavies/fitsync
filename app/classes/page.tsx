"use client";

import React from "react";
import ClassCalendar from "../components/ClassCalendar";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import LeftNav from '../components/LeftNav';

const ClassSchedulePage: React.FC = () => {
  const { userData, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!userData?.current_gym_id) {
    return <p>Error: No gym ID available for the current user.</p>;
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
      <main className="flex flex-grow space-x-4">
        {/* Workout Builder */}
        <div className="w-full">
          <ClassCalendar currentGymId={userData.current_gym_id} />
        </div>
      </main>
    </div>

    {/* Footer */}
    <footer className="bg-white text-center py-4 shadow-inner">
      <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
    </footer>
  </div>

  );
};

export default ClassSchedulePage;
