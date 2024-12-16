"use client";

import Header from "../components/Header";
import UserFilter from "../components/UserFilter";

export default function UserManagementPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Global Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow p-6 sm:p-8 lg:p-10">
        
        <div className="max-h-full mx-auto bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
          <UserFilter />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-center py-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}