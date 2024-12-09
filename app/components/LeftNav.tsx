import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TallyScore from './TallyScore';
import { HomeIcon } from './icons/home';
import { CalendarCogIcon } from './icons/calendar-cog';
import { ChartColumnIncreasingIcon } from './icons/chart-column-increasing';
import { GaugeIcon } from './icons/gauge';
import { SettingsGearIcon } from './icons/settings-gear';
import { useAuth } from '../context/AuthContext'; 
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const LeftNav: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true); 
  const [isClient, setIsClient] = useState(false);
  const { userData } = useAuth(); 
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login'); 
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
      const savedState = localStorage.getItem('isExpanded');
      if (savedState !== null) {
        setIsExpanded(JSON.parse(savedState));
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      const timeout = setTimeout(() => {
        localStorage.setItem('isExpanded', JSON.stringify(isExpanded));
      }, 300); 
      return () => clearTimeout(timeout);
    }
  }, [isExpanded, isClient]);

  const toggleNav = () => {
    setIsExpanded((prev) => !prev);
  };

  if (!isClient) return null;

  // Placeholder data for the TallyScore component
  const totalScore = 6452.75;
  const percentage = 5;
  const metrics = {
    weeklyIncrease: 120,
    loadIncrease: 20,
    streak: 4,
    restWarning: true,
  };

  const canManageUsers = userData?.role === 'admin' || userData?.role === 'coach';

  return (
    <nav
      className={`flex flex-col ${
        isExpanded ? 'items-start w-60' : 'items-center w-14'
      } bg-gray-800 py-3 shadow-md space-y-3 border-r border-gray-700 text-gray-500 transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-center w-full mb-4">
        <Image
          src={isExpanded ? '/images/Ascent_Logo_trans.png' : '/images/Ascent_Logo_collapsed.png'}
          alt="ASCENT Logo"
          width={isExpanded ? 120 : 40}
          height={40}
          className="transition-all duration-300 ease-in-out"
        />
      </div>

      <button
        onClick={toggleNav}
        className="self-end mr-2 mb-2 p-2 text-lg font-bold text-gray-700 bg-pink-200 rounded-full hover:bg-pink-300 focus:outline-none"
      >
        {isExpanded ? '<' : '>'}
      </button>

      {/* Navigation Links */}
      <Link href="/dashboard" prefetch>
        <button className={`flex items-center w-full hover:text-gray-200 transition ${isExpanded ? 'pl-4' : 'justify-center'}`}>
          <HomeIcon />
          {isExpanded && <span className="text-sm ml-2 text-left">Dashboard</span>}
        </button>
      </Link>
      <Link href="/workouts/logged-results/" prefetch>
        <button className={`flex items-center w-full hover:text-gray-200 transition ${isExpanded ? 'pl-4' : 'justify-center'}`}>
          <GaugeIcon />
          {isExpanded && <span className="text-sm ml-2 text-left">Logged Results</span>}
        </button>
      </Link>
      <Link href="/workouts" prefetch>
        <button className={`flex items-center w-full hover:text-gray-200 transition ${isExpanded ? 'pl-4' : 'justify-center'}`}>
          <ChartColumnIncreasingIcon />
          {isExpanded && <span className="text-sm ml-2 text-left">Plan a Workout</span>}
        </button>
      </Link>
      <Link href="/benchmarks" prefetch>
        <button className={`flex items-center w-full hover:text-gray-200 transition ${isExpanded ? 'pl-4' : 'justify-center'}`}>
          <ChartColumnIncreasingIcon />
          {isExpanded && <span className="text-sm ml-2 text-left">Benchmarks</span>}
        </button>
      </Link>
      <Link href="/plan" prefetch>
        <button className={`flex items-center w-full hover:text-gray-200 transition ${isExpanded ? 'pl-4' : 'justify-center'}`}>
          <CalendarCogIcon />
          {isExpanded && <span className="text-sm ml-2 text-left">Programming Calendar</span>}
        </button>
      </Link>
      <Link href="/classes" prefetch>
        <button className={`flex items-center w-full hover:text-gray-200 transition ${isExpanded ? 'pl-4' : 'justify-center'}`}>
          <GaugeIcon />
          {isExpanded && <span className="text-sm ml-2 text-left">Class Calendar</span>}
        </button>
      </Link>

      {/* User Profile Link */}
      <Link href="/profile" prefetch>
        <button className={`flex items-center w-full hover:text-gray-200 transition ${isExpanded ? 'pl-4' : 'justify-center'}`}>
          <SettingsGearIcon />
          {isExpanded && <span className="text-sm ml-2 text-left">Profile</span>}
        </button>
      </Link>

      {/* Conditional User Management Link */}
      {canManageUsers && (
        <Link href="/users" prefetch>
          <button className={`flex items-center w-full hover:text-gray-200 transition ${isExpanded ? 'pl-4' : 'justify-center'}`}>
            <SettingsGearIcon />
            {isExpanded && <span className="text-sm ml-2 text-left">User Management</span>}
          </button>
        </Link>
      )}

      <button
        onClick={handleSignOut}
        className="px-3 py-1 bg-red-500 text-xs text-white rounded hover:bg-red-600 transition"
      >
        Log Out
      </button>

      {/* TallyScore component with placeholder data */}
      {isExpanded && <TallyScore totalScore={totalScore} percentage={percentage} metrics={metrics} />}
    </nav>
  );
};

export default LeftNav;
