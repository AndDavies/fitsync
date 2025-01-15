// app/plan/daily/page.tsx
"use client";

import React, { Suspense, ReactNode } from 'react';
import Header from "../../../components/Header";
import LeftNav from "../../../components/LeftNav";
import DailyView from "../../../components/DailyView";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught in ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong loading this section.</div>;
    }
    return this.props.children;
  }
}

export default function DailyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Suspense fallback={<div>Loading header...</div>}>
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>
      </Suspense>

      <div className="flex flex-grow">
        <Suspense fallback={<div>Loading navigation...</div>}>
          <ErrorBoundary>
            <LeftNav />
          </ErrorBoundary>
        </Suspense>

        <main className="flex flex-grow p-6 space-x-4">
          <div className="flex-grow">
            <Suspense fallback={<div>Loading Daily View...</div>}>
              <ErrorBoundary>
                <DailyView />
              </ErrorBoundary>
            </Suspense>
          </div>
        </main>
      </div>

      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
