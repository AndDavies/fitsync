"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Session } from '@supabase/supabase-js';

type UserData = {
  user_id: string | null; 
  display_name: string | null;
  current_gym_id: string | null;
  role: string | null;
  onboarding_completed: boolean;
  goals: string | null;
};

type AuthContextType = {
  session: Session | null;
  userData: UserData | null;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoading: isAuthLoading, session, supabaseClient } = useSessionContext();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = async (session: Session) => {
    const { data, error } = await supabaseClient
      .from('user_profiles')
      .select('user_id, display_name, current_gym_id, role, onboarding_completed, goals')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!error && data) {
      setUserData({
        user_id: session.user.id,
        display_name: data.display_name ?? null,
        current_gym_id: data.current_gym_id ?? null,
        role: data.role ?? null,
        onboarding_completed: data.onboarding_completed ?? false,
        goals: data.goals ?? null,
      });
    }
  };

  const refreshUserData = async () => {
    if (session) {
      setIsLoading(true);
      await fetchUserData(session);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (session) {
        (async () => {
          setIsLoading(true);
          await fetchUserData(session);
          setIsLoading(false);
        })();
      } else {
        setUserData(null);
        setIsLoading(false);
      }
    }
  }, [isAuthLoading, session]);

  return (
    <AuthContext.Provider value={{ session, userData, isLoading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
