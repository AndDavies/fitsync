"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "@geist-ui/icons";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userData, refreshUserData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      await refreshUserData();
      router.push("/login"); // Redirect to login
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const canManageUsers = userData?.role === "admin" || userData?.role === "coach";

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/workouts", label: "Explore Workouts" },
    { href: "/benchmarks", label: "Benchmarks" },
    { href: "/workouts/logged-results", label: "Logged Results" },
    { href: "/plan", label: "Programming Calendar" },
    { href: "/classes", label: "Class Calendar" },
    { href: "/profile", label: "Profile" },
    ...(canManageUsers
      ? [
          { href: "/users", label: "User Management" },
          { href: "/gym-dashboard", label: "Gym Dashboard" },
        ]
      : []),
  ];

  return (
    <header className="bg-gray-900 text-gray-100 shadow-md border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/images/Ascent_Logo_trans.png"
            alt="FitSync Logo"
            width={100}
            height={35}
            className="cursor-pointer"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-5 items-center">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link key={idx} href={item.href}>
                <span
                  className={`cursor-pointer text-sm font-medium ${
                    isActive ? "text-pink-500" : "text-gray-300"
                  } hover:text-pink-400`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <span className="hidden md:block text-xs text-gray-300">
            Welcome, {userData?.display_name || "User"}
          </span>
          <button
            onClick={handleSignOut}
            className="px-3 py-1 bg-red-500 text-xs text-white rounded-full hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Log Out
          </button>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="md:hidden focus:outline-none"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-gray-800 border-t border-gray-700">
          <ul className="flex flex-col space-y-3 p-3">
            {navItems.map((item, idx) => (
              <li key={idx}>
                <Link href={item.href}>
                  <span
                    className={`block text-sm font-medium ${
                      pathname === item.href ? "text-pink-500" : "text-gray-300"
                    } hover:text-pink-400`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
