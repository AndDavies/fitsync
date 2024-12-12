// components/BaseModal.tsx
"use client";

import React, { useEffect } from "react";

interface BaseModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({ isVisible, onClose, children }) => {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-md p-6 rounded-md shadow-xl z-10 focus:outline-none">
        {children}
      </div>
    </div>
  );
};

export default BaseModal;
