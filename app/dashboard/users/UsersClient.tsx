"use client";

import React from "react";
import UserFilter from "../../components/UserFilter";
import InvitationsList from "../../components/InvitationsList";

// shape of your user profile from DB
type UserProfile = {
  user_id: string;
  current_gym_id?: string | null;
  role?: string | null;
  // etc.
};

interface UsersClientProps {
  userProfile: UserProfile;
}

export default function UsersClient({ userProfile }: UsersClientProps) {
  // This is the admin’s current gym ID for the InvitationsList
  const gymId = userProfile?.current_gym_id || "";

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">

      {/* Main Content */}
      <main className="flex-grow p-6 sm:p-8 lg:p-10">
        <div className="max-h-full mx-auto bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
          <InvitationsList gymId={gymId} />
          <UserFilter gymId={gymId} />
        </div>
      </main>

    </div>
  );
}