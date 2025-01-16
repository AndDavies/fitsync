"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Import your custom components
import DailyWOD from "../components/DailyWOD";
import UserUpcomingClassesWidget from "../components/UserUpcomingClassesWidget";
import CommunityResultsWidget from "../components/CommunityResultsWidget";
import RecentArticles from "../components/RecentArticles";
import RecentWorkouts from "../components/RecentWorkouts";

// Import shadcn/ui components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type UserProfile = {
  user_id: string;
  display_name: string | null;
  onboarding_completed: boolean;
  goals: string | null;
};

function formatGoal(goal: string) {
  return goal
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface DashboardClientProps {
  userProfile: UserProfile; // Received from SSR
}

export default function DashboardClient({ userProfile }: DashboardClientProps) {
  const router = useRouter();

  const [workoutsCompleted, setWorkoutsCompleted] = useState<number | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [hasFetchedSuggestion, setHasFetchedSuggestion] = useState(false);

  useEffect(() => {
    if (!userProfile) {
      router.push("/login");
    }
  }, [userProfile, router]);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/user/metrics", {
          credentials: "include",
        });
        if (!res.ok) {
          const errorData = await res.json();
          if (res.status === 401) {
            setMetricsError("You must be logged in to view metrics.");
            return;
          }
          throw new Error(errorData.error || "Failed to fetch metrics");
        }
        const data = await res.json();
        if (typeof data.workouts_completed_past_7_days === "number") {
          setWorkoutsCompleted(data.workouts_completed_past_7_days);
        } else {
          setMetricsError("Unexpected data format.");
        }
      } catch (err: any) {
        setMetricsError("Could not load metrics. Please try again later.");
      }
    }
    fetchMetrics();
  }, []);

  useEffect(() => {
    const storedSuggestion = localStorage.getItem("userSuggestion");
    if (storedSuggestion) {
      setSuggestion(storedSuggestion);
      setHasFetchedSuggestion(true);
    }
  }, []);

  const fetchSuggestion = async () => {
    try {
      const res = await fetch("/api/user/suggestions", {
        credentials: "include",
      });
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      if (data.suggestion) {
        setSuggestion(data.suggestion);
        localStorage.setItem("userSuggestion", data.suggestion);
        setHasFetchedSuggestion(true);
      }
    } catch (err) {
      // handle error if necessary
    }
  };

  const userGoal = userProfile?.goals ? formatGoal(userProfile.goals) : "General Health";

  const normalLines: string[] = [];
  const bullets: string[] = [];
  if (suggestion) {
    const lines = suggestion.split("\n").map((line) => line.trim()).filter(Boolean);
    lines.forEach((line) => {
      if (line.startsWith("- ")) {
        bullets.push(line.slice(2).trim());
      } else {
        normalLines.push(line);
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      <main className="flex-grow p-6 sm:p-8 lg:p-10 space-y-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <h2 className="scroll-m-20 text-2xl font-bold tracking-tight mb-2">
                  Welcome, {userProfile?.display_name || "Athlete"}!
                </h2>
                <p className="leading-7 text-muted-foreground">
                  Your primary goal:{" "}
                  <span className="font-semibold text-accent">{userGoal}</span>
                </p>
              </CardHeader>
              <CardContent>
                {suggestion ? (
                  <Alert variant="default" className="mt-4">
                    <AlertTitle>Coach’s Tip</AlertTitle>
                    {normalLines.map((line, i) => (
                      <p key={`line-${i}`} className="text-sm leading-6 mb-2">
                        {line}
                      </p>
                    ))}
                    {bullets.length > 0 && (
                      <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                        {bullets.map((bullet, i) => (
                          <li key={`bullet-${i}`}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          localStorage.removeItem("userSuggestion");
                          setHasFetchedSuggestion(false);
                          setSuggestion(null);
                        }}
                      >
                        Clear Suggestion
                      </Button>
                    </div>
                  </Alert>
                ) : (
                  <div className="mt-4">
                    {!hasFetchedSuggestion && (
                      <Button variant="secondary" size="sm" onClick={fetchSuggestion}>
                        Get Suggestion
                      </Button>
                    )}
                    {hasFetchedSuggestion && !suggestion && (
                      <p className="text-sm text-muted-foreground">No suggestion available.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="scroll-m-20 text-2xl font-bold tracking-tight mb-2">
                  Your WOD & Classes
                </h2>
                <CardDescription>
                  Stay on top of your daily workout and upcoming classes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DailyWOD />
                <UserUpcomingClassesWidget />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="scroll-m-20 text-2xl font-bold tracking-tight mb-2">
                  Your Snapshot
                </h2>
              </CardHeader>
              <CardContent>
                <CommunityResultsWidget />
                <Separator className="my-4" />
                {metricsError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{metricsError}</AlertDescription>
                  </Alert>
                ) : workoutsCompleted !== null ? (
                  <>
                    <div className="text-sm text-muted-foreground mt-2">
                      <span>Workouts Completed This Week: </span>
                      <Badge variant="secondary" className="font-bold ml-1">
                        {workoutsCompleted}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Aim for 3 this week to stay on track!
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading metrics...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="scroll-m-20 text-2xl font-bold tracking-tight">
                  Recent Articles
                </h2>
              </CardHeader>
              <CardContent>
                <RecentArticles />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="scroll-m-20 text-2xl font-bold tracking-tight">
                  Recent Workouts
                </h2>
              </CardHeader>
              <CardContent>
                <RecentWorkouts />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

    </div>
  );
}