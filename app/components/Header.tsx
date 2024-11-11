import React from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

const Header: React.FC = () => {
  const { data: session } = useSession();

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
        {/* Safely handle the case when session is null */}
        <h1 className="text-lg font-semibold">
          Welcome back, {session?.user?.name || session?.user?.email || 'Guest'}!
        </h1>
      </div>
      <div className="text-xs font-light">Ready to crush today's workout?</div>
    </header>
  );
};

export default Header;
