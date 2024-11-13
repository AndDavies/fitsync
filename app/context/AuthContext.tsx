// app/context/AuthContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../utils/supabase/client';
import { Session } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  userData: { display_name: string | null } | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{ display_name: string | null } | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      }
      setSession(data.session);
      setIsLoading(false);

      if (data.session) {
        console.log("Session exists. Fetching user data.");
        fetchUserData(data.session.user.id);
      }
    };

    const fetchUserData = async (userId: string) => {
      try {
        console.log("Attempting to fetch data for user_id:", userId);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('user_id', userId)  // Use 'user_id' here
          .single();

        if (error) {
          console.error('Error fetching user data from user_profiles:', error.message || error);
        } else if (data) {
          console.log("Successfully fetched user data:", data);
          setUserData(data);
        } else {
          console.warn("User data not found for user_id:", userId);
        }
      } catch (err) {
        console.error("Unexpected error fetching user data:", err);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);

      if (session) {
        fetchUserData(session.user.id);
      } else {
        setUserData(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, userData }}>
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
