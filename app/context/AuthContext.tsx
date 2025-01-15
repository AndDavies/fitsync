"use client";

import React, { createContext, useContext } from "react";

type UserProfile = {
  user_id: string;
  display_name: string | null;
  // etc.
};

type AuthContextType = {
  userProfile: UserProfile | null;
};

// Make a minimal context:
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  userProfile: UserProfile | null;
}

export function AuthProvider({ children, userProfile }: AuthProviderProps) {
  // You do NOT handle tokens here or signIn/out. Just store the userProfile from SSR.
  return (
    <AuthContext.Provider value={{ userProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}