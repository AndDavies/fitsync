"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface User {
  user_id: string;
  display_name: string;
  role: string;
  email: string;
  subscription_plan: string | null;
  activity_level: string | null;
  join_date: string | null;
  last_login: string | null;
  // add more fields if needed
}

interface EditUserDrawerProps {
  user: User;
  onClose: () => void;
  refreshUsers: () => void;
}

export default function EditUserDrawer({ user, onClose, refreshUsers }: EditUserDrawerProps) {
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(user.display_name);
  const [role, setRole] = useState(user.role);
  const [subscriptionPlan, setSubscriptionPlan] = useState(user.subscription_plan || "");
  const [activityLevel, setActivityLevel] = useState(user.activity_level || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        display_name: displayName,
        role,
        subscription_plan: subscriptionPlan,
        activity_level: activityLevel,
      })
      .eq("user_id", user.user_id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await refreshUsers();
      onClose();
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold">Edit User Details</h3>

      <div className="text-sm text-gray-700 space-y-1">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Joined:</strong> {user.join_date || "N/A"}
        </p>
        <p>
          <strong>Last Login:</strong> {user.last_login || "N/A"}
        </p>
      </div>

      <div>
        <label className="block font-medium mb-1">Display Name</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Role</label>
        <select
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="member">Member</option>
          <option value="coach">Coach</option>
          <option value="owner">Owner</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Subscription Plan</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={subscriptionPlan}
          onChange={(e) => setSubscriptionPlan(e.target.value)}
          placeholder="e.g. Premium, Basic, etc."
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Activity Level</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value)}
          placeholder="e.g. Active, Inactive"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end space-x-2 mt-4">
        <button
          type="button"
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}