"use client";

import Header from "../components/Header";
import LeftNav from '../components/LeftNav';
import UserFilter from '../components/UserFilter';

export default function UserManagementPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-grow">
        <LeftNav />
        <main className="flex flex-grow p-4">
          <div className="flex-grow">
            <UserFilter />
          </div>
        </main>
      </div>
      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
