import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Session } from '@supabase/supabase-js';

type UserData = {
  user_id: string | null; // Include user_id
  display_name: string | null;
  current_gym_id: string | null;
  role: string | null;
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
    const initializeSession = async () => {
      try {
        setIsLoading(true); // Start loading
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {
          setSession(data.session); // Store session
          await fetchUserData(data.session); // Fetch user profile
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    initializeSession();

    // Listen for session changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        setSession(newSession);
        fetchUserData(newSession);
      } else {
        setSession(null);
        setUserData(null); // Clear on logout
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (session: Session) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, current_gym_id, role') // Include user_id in the query
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;

      setUserData({
        user_id: session.user.id, // Add user_id from the session
        display_name: data?.display_name ?? null,
        current_gym_id: data?.current_gym_id ?? null,
        role: data?.role ?? null,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, userData, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
