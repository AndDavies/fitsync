"use client";

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
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from '@geist-ui/icons';

const LeftNav: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true); 
  const [isClient, setIsClient] = useState(false);
  const { userData, refreshUserData } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await refreshUserData(); 
    router.replace('/login'); 
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

  const canManageUsers = userData?.role === 'admin' || userData?.role === 'coach';

  const navItems = [
    { href: '/dashboard', icon: <HomeIcon />, label: 'Dashboard' },
    { href: '/workouts/logged-results/', icon: <GaugeIcon />, label: 'Logged Results' },
    { href: '/workouts', icon: <ChartColumnIncreasingIcon />, label: 'Plan a Workout' },
    { href: '/benchmarks', icon: <ChartColumnIncreasingIcon />, label: 'Benchmarks' },
    { href: '/plan', icon: <CalendarCogIcon />, label: 'Programming Calendar' },
    { href: '/classes', icon: <GaugeIcon />, label: 'Class Calendar' },
    { href: '/profile', icon: <SettingsGearIcon />, label: 'Profile' },
  ];

  if (canManageUsers) {
    navItems.push({ href: '/users', icon: <SettingsGearIcon />, label: 'User Management' });
    navItems.push({ href: '/gym-dashboard', icon: <ChartColumnIncreasingIcon />, label: 'Gym Dashboard' });
  }

  return (
    <nav
      className={`flex flex-col ${
        isExpanded ? 'items-start w-60' : 'items-center w-14'
      } bg-gray-800 py-3 shadow-md space-y-3 border-r border-gray-700 text-gray-300 transition-all duration-300 ease-in-out`}
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
        className={`self-end mr-2 mb-2 p-2 text-gray-400 rounded-full hover:text-gray-100 hover:bg-gray-700 focus:outline-none transition duration-200 ${
          isExpanded ? 'bg-gray-700' : ''
        }`}
        title="Toggle Navigation"
      >
        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      <div className={`flex-1 flex flex-col ${isExpanded ? 'pl-2' : 'items-center'} space-y-1`}>
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href; 
          return (
            <Link href={item.href} key={idx}>
              <div
                className={`
                  flex items-center w-full text-sm rounded p-2 
                  transition-colors duration-200 cursor-pointer
                  ${isExpanded ? 'justify-start' : 'justify-center'}
                  ${isActive ? 'bg-pink-700 text-white font-bold' : 'text-gray-300'}
                  hover:bg-pink-600 hover:text-white
                `}
              >
                {item.icon}
                {isExpanded && <span className="ml-2">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      <div className={`${isExpanded ? 'pl-2' : 'flex justify-center'} mb-3`}>
        <button
          onClick={handleSignOut}
          className="px-3 py-1 bg-red-500 text-xs text-white rounded hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default LeftNav;
