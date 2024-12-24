"use client";

import React, { useState, useEffect } from "react";

/**
 * Shape of an invitation row from your invitations table
 */
interface Invitation {
  id: string;
  gym_id: string;
  user_id: string;
  status: string;
  created_at: string;
  expires_at: string | null;
}

/**
 * Minimal shape of the user profile so we can optionally show user email or name
 * if you decide to fetch more details in the future. For now, we only need user_id.
 */
interface UserProfile {
  id: string; // or user_id, matching your DB
  email?: string;
  display_name?: string;
}

type InvitationsListProps = {
  gymId: string;
};

export default function InvitationsList({ gymId }: InvitationsListProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all invitations for the given gym. 
   * If you only want pending or some additional filtering,
   * you can pass query params to your API as well.
   */
  const fetchInvitations = async () => {
    try {
      const res = await fetch(`/api/invitations/fetch?gym_id=${gymId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch invitations.");
      }
      const data = await res.json();
      setInvitations(data.invitations || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (gymId) {
      fetchInvitations();
    }
  }, [gymId]);

  /**
   * Handler for "Confirm" button on a pending invite:
   * - Calls an API route to update invite status to "confirmed".
   * - Also updates user_profiles for that user to set current_gym_id.
   */
  const handleConfirmInvite = async (invite: Invitation) => {
    try {
      const res = await fetch("/api/invitations/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          invitation_id: invite.id,
          user_id: invite.user_id,
          gym_id: invite.gym_id,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to confirm invitation.");
      }
      // If successful, update local state:
      setInvitations((prev) =>
        prev.map((i) => (i.id === invite.id ? { ...i, status: "confirmed" } : i))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter the invitations by "pending" if pendingOnly is true
  const displayedInvitations = pendingOnly
    ? invitations.filter((inv) => inv.status === "pending")
    : invitations;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-200">Invitations</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-300">Show Pending Only</label>
          <input
            type="checkbox"
            checked={pendingOnly}
            onChange={() => setPendingOnly(!pendingOnly)}
            className="form-checkbox h-4 w-4 text-pink-600"
          />
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {displayedInvitations.length === 0 ? (
        <p className="text-gray-400 text-sm">No invitations found.</p>
      ) : (
        <table className="w-full table-auto text-sm text-gray-200 bg-gray-800 border border-gray-700 rounded">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left border-b border-gray-600">ID</th>
              <th className="px-4 py-2 text-left border-b border-gray-600">User ID</th>
              <th className="px-4 py-2 text-left border-b border-gray-600">Status</th>
              <th className="px-4 py-2 text-left border-b border-gray-600">Created</th>
              <th className="px-4 py-2 border-b border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedInvitations.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-gray-700 transition border-b border-gray-600"
              >
                <td className="px-4 py-2 text-gray-300">{inv.id}</td>
                <td className="px-4 py-2 text-gray-300">{inv.user_id}</td>
                <td className="px-4 py-2 text-gray-300">{inv.status}</td>
                <td className="px-4 py-2 text-gray-300">
                  {new Date(inv.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  {inv.status === "pending" ? (
                    <button
                      onClick={() => handleConfirmInvite(inv)}
                      className="px-3 py-1 bg-pink-600 text-white rounded hover:bg-pink-500 transition"
                    >
                      Confirm
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
