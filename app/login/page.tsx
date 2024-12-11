"use client";

import { useSessionContext } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { session, supabaseClient } = useSessionContext();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (session) {
      // Already logged in, redirect to dashboard
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleLogin = async () => {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow space-y-4 w-80">
        <h2 className="text-xl font-bold">Log In</h2>
        <input
          className="w-full border rounded p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}  
        />
        <input
          className="w-full border rounded p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}  
        />
        <button
          className="w-full bg-pink-500 text-white p-2 rounded"
          onClick={handleLogin}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
