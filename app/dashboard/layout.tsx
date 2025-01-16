// app/dashboard/layout.tsx
"use client"; // if you need a client component for the theme
import React from "react";
import { ThemeProvider } from "next-themes";
import "../globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // DO NOT wrap <html> or <body> here:
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Header />
      <main>{children}</main>
      <Footer />
    </ThemeProvider>
  );
}