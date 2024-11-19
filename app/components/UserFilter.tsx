"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "../context/AuthContext";
import InviteModal from "../components/InviteModal";

// Helper function for UUID validation
const isValidUUID = (id: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

type User = {
  user_id: string;
  display_name: string;
  email: string;
  join_date: string | null;
  subscription_plan: string | null;
  role: string;
  activity_level: string | null;
  last_login: string | null;
};

const UserFilter: React.FC = () => {
  const { userData, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      setError(null);
      setIsLoadingUsers(true);

      if (authLoading) return;

      const currentGymId = userData?.current_gym_id;

      if (!currentGymId || !isValidUUID(currentGymId)) {
        setError("Invalid or missing gym ID.");
        setIsLoadingUsers(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select(
            "user_id, display_name, email, join_date, subscription_plan, role, activity_level, last_login"
          )
          .eq("current_gym_id", currentGymId);

        if (error) {
          setError("Error fetching users: " + error.message);
        } else {
          setUsers(data || []);
        }
      } catch (fetchError) {
        setError("Unexpected error: " + fetchError);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [userData, authLoading]);

  const filteredUsers = users.filter(
    (user) =>
      user.display_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || isLoadingUsers) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 bg-white rounded-md shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6">User Management</h2>

      {/* Invite Users Button */}
      <button
        onClick={() => setIsInviteModalOpen(true)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Invite Users
      </button>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <InviteModal onClose={() => setIsInviteModalOpen(false)} />
      )}

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-3 border border-gray-300 rounded-lg w-full"
      />

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">#</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
              <th className="px-4 py-3 text-left font-medium">Plan</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Last Login</th>
              <th className="px-4 py-3 text-left font-medium">Activity Level</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.user_id}
                className="border-t hover:bg-gray-100 cursor-pointer transition duration-150"
                onClick={() => router.push(`/users/${user.user_id}`)}
              >
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{user.display_name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.join_date || "N/A"}</td>
                <td className="px-4 py-3">{user.subscription_plan || "None"}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">{user.last_login || "N/A"}</td>
                <td className="px-4 py-3">{user.activity_level || "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserFilter;