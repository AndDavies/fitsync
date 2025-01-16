"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "@geist-ui/icons";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "./NavigationMenu";

import { cn } from "@/utils/utils";
import { ModeToggle } from "./ModeToggle";

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
            hover:bg-secondary hover:text-accent-foreground focus:bg-secondary focus:text-accent-foreground"
        >
          <div className="text-sm font-medium leading-none text-foreground">
            {title}
          </div>
          <p className="text-xs leading-snug text-muted-foreground">
            {description}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const displayName = "User";
  const isAdminOrCoach = false;

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/login");
      } else {
        console.error("Failed to log out:", await res.json());
      }
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    {
      label: "Workouts",
      children: [
        { href: "/dashboard/workouts", label: "Explore Workouts" },
        { href: "/dashboard/benchmarks", label: "Benchmarks" },
        { href: "/dashboard/workouts/logged-results", label: "Logged Results" },
      ],
    },
    { href: "/dashboard/plan", label: "Programming Calendar" },
    { href: "/dashboard/classes", label: "Class Calendar" },
    { href: "/dashboard/profile", label: "Profile" },
    ...(isAdminOrCoach
      ? [
          {
            label: "Admin",
            children: [
              { href: "/dashboard/users", label: "User Management" },
              { href: "/dashboard/gym-dashboard", label: "Gym Dashboard" },
            ],
          },
        ]
      : []),
  ];

  return (
    <header
      className={cn(
        "bg-card text-card-foreground shadow-md border-b border-border"
      )}
    >
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
                      <NavigationMenuTrigger>
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="list-none p-2 space-y-1 bg-card rounded-md">
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
                          "px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-secondary hover:text-accent-foreground",
                          isActive
                            ? "text-accent font-semibold"
                            : "text-foreground"
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
          <span className="hidden md:block text-xs text-muted-foreground">
            Welcome, {displayName}
          </span>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-destructive",
              "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            )}
          >
            {loading ? "Logging Out..." : "Log Out"}
          </button>
          <ModeToggle />
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
        <nav className="md:hidden border-t border-border bg-card">
          <ul className="flex flex-col space-y-3 p-3 list-none">
            {navItems.map((item, idx) => {
              if (item.children) {
                return item.children.map((child, cidx) => {
                  const isActive = pathname === child.href;
                  return (
                    <li key={`${idx}-${cidx}`}>
                      <Link href={child.href}>
                        <span
                          className={cn(
                            "block text-sm font-medium transition-colors px-2 py-1 rounded hover:bg-secondary hover:text-accent-foreground",
                            isActive
                              ? "text-accent font-semibold"
                              : "text-foreground"
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
                  <li key={idx}>
                    <Link href={item.href!}>
                      <span
                        className={cn(
                          "block text-sm font-medium transition-colors px-2 py-1 rounded hover:bg-secondary hover:text-accent-foreground",
                          isActive
                            ? "text-accent font-semibold"
                            : "text-foreground"
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