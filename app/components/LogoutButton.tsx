"use client";

import { useRouter } from 'next/navigation';
import { useSessionContext } from '@supabase/auth-helpers-react';

export default function LogoutButton() {
  const { supabaseClient } = useSessionContext();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut(); // Invalidate session in Supabase
      localStorage.clear(); // Clear client-side cached session
      sessionStorage.clear(); // Clear additional session storage
      router.push('/login'); // Redirect to login
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button
      className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}
