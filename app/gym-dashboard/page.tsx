"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";

export default function GymDashboardPage() {
  const { userData, isLoading } = useAuth();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);

  // We'll handle fetching inside the child component once we know gym_id
  useEffect(() => {
    // No direct fetching here since we rely on searchParams in the child component
  }, [isLoading, userData, router]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <GymDashboardContent
        isLoading={isLoading}
        userData={userData}
        router={router}
        metrics={metrics}
        setMetrics={setMetrics}
        error={error}
        setError={setError}
        loadingMetrics={loadingMetrics}
        setLoadingMetrics={setLoadingMetrics}
      />
    </Suspense>
  );

  function LoadingFallback() {
    return (
      <div className="min-h-screen flex flex-col bg-gray-800 text-gray-100">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-300 text-sm">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }
}

interface GymDashboardContentProps {
  isLoading: boolean;
  userData: any; 
  router: ReturnType<typeof useRouter>;
  metrics: any;
  setMetrics: React.Dispatch<React.SetStateAction<any>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  loadingMetrics: boolean;
  setLoadingMetrics: React.Dispatch<React.SetStateAction<boolean>>;
}

function GymDashboardContent({
  isLoading,
  userData,
  router,
  metrics,
  setMetrics,
  error,
  setError,
  loadingMetrics,
  setLoadingMetrics,
}: GymDashboardContentProps) {

  const searchParams = useSearchParams();
  const gym_id = searchParams.get("gym_id") || userData?.current_gym_id || "";

  // Fetch metrics if conditions are met
  if (!isLoading && userData && loadingMetrics && gym_id) {
    fetch(`/api/gym-dashboard?gym_id=${gym_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setMetrics(data);
        }
      })
      .catch(() => setError("Failed to load metrics"))
      .finally(() => setLoadingMetrics(false));
  }

  if (!isLoading) {
    if (!userData || (userData.role !== "admin" && userData.role !== "coach")) {
      router.push("/login");
    }
  }

  function LoadingFallback() {
    return (
      <div className="min-h-screen flex flex-col bg-gray-800 text-gray-100">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-300 text-sm">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // Handle loading state
  if (isLoading || !userData || loadingMetrics) {
    return <LoadingFallback />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-800 text-gray-100">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-red-400">{error}</p>
        </main>
      </div>
    );
  }

  // Handle no metrics state
  if (!metrics) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-800 text-gray-100">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-300">No metrics available.</p>
        </main>
      </div>
    );
  }

  const {
    total_active_members,
    new_memberships_month,
    avg_tenure_days,
    average_classes_per_member,
    attendance_rate,
    average_satisfaction,
    monthly_churn,
    nps,
  } = metrics;

  return (
    <div className="min-h-screen flex flex-col bg-gray-800 text-gray-100">
      <Header />
      <main className="flex-grow flex flex-col p-6 md:p-8 lg:p=10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">Gym Owner Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-700 p-4 rounded shadow">
            <h2 className="text-sm font-semibold mb-2 text-gray-300">Total Active Members</h2>
            <p className="text-xl md:text-2xl font-bold text-pink-400">{total_active_members}</p>
          </div>

          <div className="bg-gray-700 p-4 rounded shadow">
            <h2 className="text-sm font-semibold mb-2 text-gray-300">New Memberships (This Month)</h2>
            <p className="text-xl md:text-2xl font-bold text-pink-400">{new_memberships_month}</p>
          </div>

          <div className="bg-gray-700 p-4 rounded shadow">
            <h2 className="text-sm font-semibold mb-2 text-gray-300">Avg Membership Tenure (Days)</h2>
            <p className="text-xl md:text-2xl font-bold text-pink-400">
              {avg_tenure_days ? avg_tenure_days.toFixed(1) : "N/A"}
            </p>
          </div>

          <div className="bg-gray-700 p-4 rounded shadow">
            <h2 className="text-sm font-semibold mb-2 text-gray-300">Avg Classes/Member (30d)</h2>
            <p className="text-xl md:text-2xl font-bold text-pink-400">
              {average_classes_per_member ? average_classes_per_member.toFixed(2) : "N/A"}
            </p>
          </div>

          <div className="bg-gray-700 p-4 rounded shadow">
            <h2 className="text-sm font-semibold mb-2 text-gray-300">Attendance Rate (30d)</h2>
            <p className="text-xl md:text-2xl font-bold text-pink-400">
              {attendance_rate ? `${attendance_rate.toFixed(2)}%` : "N/A"}
            </p>
          </div>

          <div className="bg-gray-700 p-4 rounded shadow">
            <h2 className="text-sm font-semibold mb-2 text-gray-300">Avg Satisfaction (30d)</h2>
            <p className="text-xl md:text-2xl font-bold text-pink-400">
              {average_satisfaction ? average_satisfaction.toFixed(1) : "N/A"}
            </p>
          </div>

          <div className="bg-gray-700 p-4 rounded shadow">
            <h2 className="text-sm font-semibold mb-2 text-gray-300">Monthly Churn</h2>
            <p className="text-xl md:text-2xl font-bold text-pink-400">
              {monthly_churn ? `${monthly_churn.toFixed(2)}%` : "N/A"}
            </p>
          </div>

          <div className="bg-gray-700 p-4 rounded shadow">
            <h2 className="text-sm font-semibold mb-2 text-gray-300">Net Promoter Score (NPS)</h2>
            <p className="text-xl md:text-2xl font-bold text-pink-400">
              {nps !== null && nps !== undefined ? nps.toFixed(0) : "N/A"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              NPS Guidelines:
              <br />• &gt;0 Good
              <br />• &gt;50 Excellent
              <br />• &gt;70 World-class
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
