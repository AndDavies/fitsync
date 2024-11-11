import React from 'react';
import Link from 'next/link';
import { FiHome, FiSettings, FiBell } from "react-icons/fi";
// import { GiProgression } from "react-icons/gi";
import { GoTrophy } from "react-icons/go";
import { CiCalendar } from "react-icons/ci";
import { GiStrong } from "react-icons/gi";

const LeftNav: React.FC = () => {
  return (
    <nav className="flex flex-col items-center bg-gray-900 w-16 py-4 shadow-lg space-y-4 border-r border-gray-700 text-gray-400">
      <Link href="/dashboard">
        <button className="hover:text-gray-200 transition">
          <FiHome size={24} />
        </button>
      </Link>
      <Link href="/plan">
        <button className="hover:text-gray-200 transition">
          <CiCalendar size={24} />
        </button>
      </Link>
      <Link href="/achievements">
        <button className="hover:text-gray-200 transition">
          <GoTrophy size={24} />
        </button>
      </Link>
      <Link href="/workouts">
        <button className="hover:text-gray-200 transition">
          <GiStrong size={24} />
        </button>
      </Link>
      <Link href="/notifications">
        <button className="hover:text-gray-200 transition">
          <FiBell size={24} />
        </button>
      </Link>
      <Link href="/settings">
        <button className="hover:text-gray-200 transition">
          <FiSettings size={24} />
        </button>
      </Link>
    </nav>
  );
};

export default LeftNav;
