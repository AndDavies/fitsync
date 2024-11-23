import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
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
  fetchUserData: () => Promise<void>; // Lazy load user data function
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Fetch user profile data based on the session's user ID.
   */
  const fetchUserData = useCallback(async () => {
    if (session && !userData) {
      console.log("Attempting to fetch user data with session.user.id:", session.user.id);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('display_name, current_gym_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        console.log("Fetched user profile data:", data);

        if (error) {
          console.error("Error fetching user profile data:", error.message);
          throw error;
        }

        setUserData({
          display_name: data?.display_name ?? null,
          current_gym_id: data?.current_gym_id ?? null,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to fetch user data:", error.message);
        } else {
          console.error("An unknown error occurred while fetching user data.");
        }
      } finally {
        // Ensure isLoading is set to false once data is fetched
        setIsLoading(false);
      }
    }
  }, [session, userData]);

  /**
   * Set up session data and authentication listener.
   */
  useEffect(() => {
    const setUpSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        setSession(data.session);

        if (data.session) {
          console.log("Session exists in setUpSession, calling fetchUserData()");
          await fetchUserData();
        } else {
          console.warn("Session is null in setUpSession.");
          setIsLoading(false); // No session, set isLoading to false
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error getting session:", error.message);
        } else {
          console.error("An unknown error occurred while getting session.");
        }
      }
    };

    setUpSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed. New session:", session);
      setSession(session);
      setUserData(null); // Reset user data on session change
      setIsLoading(true);

      if (session) {
        await fetchUserData();
      } else {
        setIsLoading(false); // Ensure isLoading is reset on logout
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserData]);

  /**
   * Fetch user data when session is updated.
   */
  useEffect(() => {
    if (session && !userData) {
      fetchUserData();
    }
  }, [session, userData, fetchUserData]);

  return (
    <AuthContext.Provider value={{ session, userData, isLoading, fetchUserData }}>
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
