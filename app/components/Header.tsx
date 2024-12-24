"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "@geist-ui/icons";

import { useAuth } from "../context/AuthContext";
import { supabase } from "@/utils/supabase/client";

// Updated import from the new simplified NavigationMenu
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "./NavigationMenu";

import { cn } from "@/utils/utils";

function ListItem({
  title,
  href,
  description,
}: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <li className="list-none">
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none space-y-1 rounded-md p-3 no-underline transition-colors
                     hover:bg-gray-800 hover:text-pink-400 focus:bg-gray-800 focus:text-pink-400"
        >
          <div className="text-sm font-medium leading-none text-gray-200">{title}</div>
          <p className="text-sm leading-snug text-gray-400">{description}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userData, refreshUserData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      await refreshUserData();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const canManageUsers =
    userData?.role === "admin" || userData?.role === "coach";

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    {
      label: "Workouts",
      children: [
        { href: "/workouts", label: "Explore Workouts" },
        { href: "/benchmarks", label: "Benchmarks" },
        { href: "/workouts/logged-results", label: "Logged Results" },
      ],
    },
    { href: "/plan", label: "Programming Calendar" },
    { href: "/classes", label: "Class Calendar" },
    { href: "/profile", label: "Profile" },
    ...(canManageUsers
      ? [
          {
            label: "Admin",
            children: [
              { href: "/users", label: "User Management" },
              { href: "/gym-dashboard", label: "Gym Dashboard" },
            ],
          },
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-5">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item, idx) => {
                if (item.children) {
                  return (
                    <NavigationMenuItem key={idx}>
                      <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        {/* Use list-none here too */}
                        <ul className="list-none">
                          {item.children.map((child, i) => (
                            <ListItem
                              key={i}
                              title={child.label}
                              href={child.href}
                              description={`Go to ${child.label}`}
                            />
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                }

                const isActive = pathname === item.href;
                return (
                  <NavigationMenuItem key={idx}>
                    <Link href={item.href!} passHref legacyBehavior>
                      <NavigationMenuLink
                        className={cn(
                          "px-4 py-2 text-sm font-medium text-gray-300 rounded-md transition-colors hover:bg-gray-800 hover:text-pink-400",
                          isActive ? "text-pink-500" : ""
                        )}
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

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
          {/* Mobile Menu Toggle */}
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
          <ul className="flex flex-col space-y-3 p-3 list-none">
            {navItems.map((item, idx) => {
              if (item.children) {
                return item.children.map((child, cidx) => {
                  const isActive = pathname === child.href;
                  return (
                    <li key={`${idx}-${cidx}`} className="list-none">
                      <Link href={child.href}>
                        <span
                          className={cn(
                            "block text-sm font-medium text-gray-300 hover:text-pink-400",
                            isActive ? "text-pink-500" : ""
                          )}
                        >
                          {child.label}
                        </span>
                      </Link>
                    </li>
                  );
                });
              } else {
                const isActive = pathname === item.href;
                return (
                  <li key={idx} className="list-none">
                    <Link href={item.href!}>
                      <span
                        className={cn(
                          "block text-sm font-medium text-gray-300 hover:text-pink-400",
                          isActive ? "text-pink-500" : ""
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              }
            })}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
