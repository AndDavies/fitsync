import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TallyScore from './TallyScore';
import { HomeIcon } from './icons/home';
import { CalendarCogIcon } from './icons/calendar-cog';
import { ChartColumnIncreasingIcon } from './icons/chart-column-increasing';
import { GaugeIcon } from './icons/gauge';
import { BellIcon } from './icons/bell';
import { SettingsGearIcon } from './icons/settings-gear';

const LeftNav: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const savedState = localStorage.getItem('isExpanded');
      if (savedState !== null) {
        setIsExpanded(JSON.parse(savedState));
      } else {
        setIsExpanded(true); // Default state: expanded
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient && isExpanded !== undefined) {
      localStorage.setItem('isExpanded', JSON.stringify(isExpanded));
    }
  }, [isExpanded, isClient]);

  const toggleNav = () => {
    setIsExpanded((prev) => !prev);
  };

  // Don't render until `isExpanded` has been set to avoid mismatch
  if (!isClient || isExpanded === undefined) return null;

  // Placeholder data for the TallyScore component
  const totalScore = 6452.75;
  const percentage = 5;
  const metrics = {
    weeklyIncrease: 120,
    loadIncrease: 20,
    streak: 4,
    restWarning: true,
  };

  return (
    <nav
      className={`flex flex-col ${
        isExpanded ? 'items-start w-60' : 'items-center w-14'
      } bg-gray-800 py-3 shadow-md space-y-3 border-r border-gray-700 text-gray-500 transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-center w-full mb-4">
        <Image
          src={isExpanded ? "/images/Ascent_Logo_trans.png" : "/images/Ascent_Logo_collapsed.png"}
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
      <Link href="/workouts" prefetch>
        <button className={`flex items-center w-full hover:text-gray-200 transition ${isExpanded ? 'pl-4' : 'justify-center'}`}>
          <ChartColumnIncreasingIcon />
          {isExpanded && <span className="text-sm ml-2 text-left">Program Planning</span>}
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
          {isExpanded && <span className="text-sm ml-2 text-left">Class Management</span>}
        </button>
      </Link>
      <Link href="/notifications" prefetch>
        <button className={`flex items-center w-full hover:text-gray-200 transition ${isExpanded ? 'pl-4' : 'justify-center'}`}>
          <BellIcon />
          {isExpanded && <span className="text-sm ml-2 text-left">Notifications</span>}
        </button>
      </Link>
      <Link href="/users" prefetch>
        <button className={`flex items-center w-full hover:text-gray-200 transition ${isExpanded ? 'pl-4' : 'justify-center'}`}>
          <SettingsGearIcon />
          {isExpanded && <span className="text-sm ml-2 text-left">User Management</span>}
        </button>
      </Link>
      {/* TallyScore component with placeholder data */}
      {isExpanded && (
        <TallyScore totalScore={totalScore} percentage={percentage} metrics={metrics} />
      )}
    </nav>
  );
};

export default LeftNav;
