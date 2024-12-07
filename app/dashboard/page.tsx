"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import LeftNav from "../components/LeftNav";
import { useAuth } from "../context/AuthContext";
import ClassesTodayWidget from "../components/widgets/ClassesTodayWidget";
import CompletedWorkoutsWidget from "../components/widgets/CompletedWorkoutsWidget";
import RSSFeedWidget from "../components/widgets/RSSFeedWidget";
import WorkoutsToday from "../components/widgets/WorkoutsToday";

export default function Dashboard() {
  const router = useRouter();
  const { session, isLoading, userData } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login"); // Redirect if not logged in
    }
  }, [isLoading, session, router]);

  if (isLoading || !userData) {
    return <div>Loading your dashboard...</div>; // Show loading state while data is fetched
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-grow ">
        <LeftNav />
        <main className="flex-grow p-6">
  
          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Widgets */}
            <WorkoutsToday />
            <CompletedWorkoutsWidget />
            <ClassesTodayWidget />
            <RSSFeedWidget />
          </div>
        </main>
      </div>
      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
