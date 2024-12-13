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

  const fetchUserData = async (currentSession: Session) => {
    try {
      const { data, error } = await supabaseClient
        .from('user_profiles')
        .select('user_id, display_name, current_gym_id, role, onboarding_completed, goals')
        .eq('user_id', currentSession.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user data:", error.message);
        setUserData(null);
        return;
      }

      if (data) {
        setUserData({
          user_id: currentSession.user.id,
          display_name: data.display_name ?? null,
          current_gym_id: data.current_gym_id ?? null,
          role: data.role ?? null,
          onboarding_completed: data.onboarding_completed ?? false,
          goals: data.goals ?? null,
        });
      } else {
        // No user profile found, ensure userData is null
        setUserData(null);
      }
    } catch (err: any) {
      console.error("Unexpected error fetching user data:", err.message);
      setUserData(null);
    }
  };

  const refreshUserData = async () => {
    setIsLoading(true);
    if (session) {
      await fetchUserData(session);
    } else {
      // If no session, ensure user data is cleared
      setUserData(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const initialize = async () => {
      if (!isAuthLoading) {
        if (session) {
          setIsLoading(true);
          await fetchUserData(session);
          setIsLoading(false);
        } else {
          // Not logged in, ensure userData is cleared
          setUserData(null);
          setIsLoading(false);
        }
      }
    };
    initialize();
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
