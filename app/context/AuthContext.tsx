// context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Session } from '@supabase/supabase-js';

type UserData = {
  display_name: string | null;
  current_gym_id: string | null;
};

type AuthContextType = {
  session: Session | null;
  userData: UserData | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('display_name, current_gym_id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message);
      } else if (data) {
        setUserData({
          display_name: data.display_name,
          current_gym_id: data.current_gym_id,
        });
      }
    };

    const setUpSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error.message);
      } else {
        setSession(data.session);
        if (data.session) {
          await fetchUserProfile(data.session.user.id);
        }
      }
      setIsLoading(false);
    };

    setUpSession();

    // Set up an auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(true);
      if (session) {
        fetchUserProfile(session.user.id).then(() => setIsLoading(false));
      } else {
        setUserData(null);
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, userData, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
