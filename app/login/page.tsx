"use client";

import { useSessionContext } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function LoginPage() {
  const { session, supabaseClient, isLoading: sessionLoading } = useSessionContext();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && session) {
      // Already logged in, redirect to dashboard
      router.push('/dashboard');
    }
  }, [session, sessionLoading, router]);

  const handleLogin = async () => {
    setErrorMessage(null);
    setIsLoggingIn(true);
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error.message);
      setErrorMessage(error.message);
    } else {
      router.push('/dashboard');
    }
    setIsLoggingIn(false);
  };

  // If we are still loading session info, show spinner
  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  // If user is logged in already (handled in useEffect), or show form otherwise
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow space-y-4 w-80">
        <h2 className="text-xl font-bold">Log In</h2>
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
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
          className="w-full bg-pink-500 text-white p-2 rounded hover:bg-pink-600 disabled:bg-pink-300"
          onClick={handleLogin}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? "Signing In..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}
