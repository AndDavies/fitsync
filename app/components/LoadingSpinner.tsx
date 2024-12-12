// components/LoadingSpinner.tsx
"use client";

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-pink-500"></div>
    </div>
  );
};

export default LoadingSpinner;
