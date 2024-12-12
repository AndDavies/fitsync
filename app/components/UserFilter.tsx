"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "../context/AuthContext";
import SideDrawer from "./SideDrawer";
import EditUserDrawer from "./EditUserDrawer";
import AsyncSelect from 'react-select/async';

const isValidUUID = (id: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

type User = {
  user_id: string;
  display_name: string;
  role: string;
  email: string;
  subscription_plan: string | null;
  activity_level: string | null;
  join_date: string | null;
  last_login: string | null;
};

// React Select option type
type OptionType = { label: string; value: string };

const UserFilter: React.FC = () => {
  const { userData, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const currentGymId = userData?.current_gym_id;

  const fetchUsers = useCallback(async (query?: string): Promise<OptionType[]> => {
    setError(null);
    setIsLoadingUsers(true);

    if (authLoading || !currentGymId || !isValidUUID(currentGymId)) {
      setIsLoadingUsers(false);
      return [];
    }

    let q = supabase
      .from("user_profiles")
      .select("user_id, display_name, role, email, subscription_plan, activity_level, join_date, last_login")
      .eq("current_gym_id", currentGymId);

    if (query && query.trim().length > 0) {
      q = q.or(`display_name.ilike.%${query.trim()}%,email.ilike.%${query.trim()}%`);
    }

    const { data, error: fetchError } = await q;

    if (fetchError) {
      setError("Error fetching users: " + fetchError.message);
      setIsLoadingUsers(false);
      return [];
    } else {
      const fetchedUsers = data || [];
      setUsers(fetchedUsers);
      const options = fetchedUsers.map(u => ({
        label: `${u.display_name} (${u.email})`,
        value: u.user_id
      }));
      setIsLoadingUsers(false);
      return options;
    }
  }, [authLoading, currentGymId]);

  // Initially load all users without query (just to populate the table)
  useEffect(() => {
    if (!authLoading && currentGymId) {
      // Just call fetchUsers once without query to populate initial data
      fetchUsers();
    }
  }, [authLoading, currentGymId, fetchUsers]);

  const handleSelectChange = (option: OptionType | null) => {
    if (!option) return;
    const user = users.find(u => u.user_id === option.value);
    if (user) {
      setSelectedUser(user);
      setIsDrawerOpen(true);
    }
  };

  const refreshUsers = async () => {
    // Refresh current list, fetch all without query
    await fetchUsers();
  };

  if (authLoading || isLoadingUsers && users.length === 0) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // Filtered users for the table can be the same 'users' array, or if you want to reflect the query typed by the user:
  // but since AsyncSelect handles loading, let's just show all `users` fetched initially or after searches.
  const filteredUsers = users; 

  return (
    <div className="p-6 bg-white rounded-md shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6">User Management</h2>
      <p className="text-sm text-gray-700 mb-4">
        Search and manage users associated with your gym. Select a user to view/edit details.
      </p>

      <div className="mb-4 max-w-md">
        <div className="w-full">
          <AsyncSelect
            cacheOptions
            loadOptions={fetchUsers}
            defaultOptions // Load initial options on mount if desired
            placeholder="Search users by name or email"
            onChange={handleSelectChange}
            isClearable
          />
        </div>
      </div>

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
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.user_id}
                className="border-t hover:bg-gray-100 transition duration-150"
              >
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{user.display_name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.join_date || "N/A"}</td>
                <td className="px-4 py-3">{user.subscription_plan || "None"}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">{user.last_login || "N/A"}</td>
                <td className="px-4 py-3">{user.activity_level || "Inactive"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDrawerOpen(true);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center p-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {selectedUser && (
          <EditUserDrawer
            user={selectedUser}
            onClose={() => setIsDrawerOpen(false)}
            refreshUsers={refreshUsers}
          />
        )}
      </SideDrawer>
    </div>
  );
};

export default UserFilter;
