"use client";

import React from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import LoggedResultsPage from "@/app/components/LoggedResultsPage";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Global Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow p-6 sm:p-8 lg:p-10">
        <div className="max-h-full mx-auto bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
          <LoggedResultsPage />
        </div>
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
