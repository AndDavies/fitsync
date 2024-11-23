// context/NavContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavContextProps {
  isNavExpanded: boolean;
  toggleNav: () => void;
}

const NavContext = createContext<NavContextProps | undefined>(undefined);

export const NavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNavExpanded, setIsNavExpanded] = useState<boolean>(() => {
    // Retrieve persisted state from localStorage on initial load
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem('isNavExpanded');
      return savedState !== null ? JSON.parse(savedState) : true; // Default to expanded
    }
    return true;
  });

  useEffect(() => {
    // Persist state in localStorage when it changes
    if (typeof window !== "undefined") {
      localStorage.setItem('isNavExpanded', JSON.stringify(isNavExpanded));
    }
  }, [isNavExpanded]);

  const toggleNav = () => {
    setIsNavExpanded((prev) => !prev);
  };

  return (
    <NavContext.Provider value={{ isNavExpanded, toggleNav }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNavContext = () => {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error('useNavContext must be used within a NavProvider');
  }
  return context;
};
