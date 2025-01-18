"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import SideDrawer from "./SideDrawer";
import EditUserDrawer from "./EditUserDrawer";
import AsyncSelect from "react-select/async";

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

interface UserFilterProps {
  gymId: string | null; // from your SSR or parent page
}

export default function UserFilter({ gymId }: UserFilterProps) {
  const supabase = createClient();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /**
   * Optionally, you can do a permission check here:
   * if (!gymId) { ...some fallback or error message... }
   */

  const fetchUsers = useCallback(
    async (query?: string): Promise<OptionType[]> => {
      setError(null);
      setIsLoadingUsers(true);

      // If no gym, or invalid gymId, bail out
      if (!gymId || !isValidUUID(gymId)) {
        setIsLoadingUsers(false);
        return [];
      }

      let q = supabase
        .from("user_profiles")
        .select(
          "user_id, display_name, role, email, subscription_plan, activity_level, join_date, last_login"
        )
        .eq("current_gym_id", gymId);

      if (query && query.trim().length > 0) {
        // Searching by display_name OR email
        q = q.or(`display_name.ilike.%${query.trim()}%,email.ilike.%${query.trim()}%`);
      }

      const { data, error: fetchError } = await q;

      if (fetchError) {
        setError("Error fetching users: " + fetchError.message);
        setIsLoadingUsers(false);
        return [];
      } else {
        const fetchedUsers = (data as User[]) || [];
        setUsers(fetchedUsers);

        const options: OptionType[] = fetchedUsers.map((u) => ({
          label: `${u.display_name} (${u.email})`,
          value: u.user_id,
        }));

        setIsLoadingUsers(false);
        return options;
      }
    },
    [gymId, supabase]
  );

  // Load all users once on mount
  useEffect(() => {
    if (gymId) {
      // If you want to fetch initial user list without a query
      fetchUsers();
    } else {
      setIsLoadingUsers(false);
    }
  }, [gymId, fetchUsers]);

  // Called when user selects something from the AsyncSelect
  const handleSelectChange = (option: OptionType | null) => {
    if (!option) return;
    const user = users.find((u) => u.user_id === option.value);
    if (user) {
      setSelectedUser(user);
      setIsDrawerOpen(true);
    }
  };

  // Refresh the user list (e.g. after editing)
  const refreshUsers = async () => {
    await fetchUsers();
  };

  if (isLoadingUsers && users.length === 0) {
    return <p className="text-gray-300">Loading users...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const filteredUsers = users;

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">User Management</h2>
      <p className="text-sm text-gray-400 mb-4">
        Search and manage users associated with your gym. Select a user to view/edit details.
      </p>

      <div className="mb-4 max-w-md">
        <AsyncSelect
          cacheOptions
          loadOptions={fetchUsers}
          defaultOptions
          placeholder="Search users by name or email"
          onChange={handleSelectChange}
          isClearable
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: "#2D2D2D",
              borderColor: "#555",
              color: "#FFF",
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: "#2D2D2D",
              color: "#FFF",
            }),
            singleValue: (base) => ({
              ...base,
              color: "#FFF",
            }),
            input: (base) => ({
              ...base,
              color: "#FFF",
            }),
            placeholder: (base) => ({
              ...base,
              color: "#9CA3AF",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? "#3B3B3B" : "#2D2D2D",
              color: "#FFF",
            }),
          }}
        />
      </div>

      <div className="overflow-x-auto border border-gray-700 rounded-xl">
        <table className="w-full table-auto text-sm text-gray-200">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium border-b border-gray-600">#</th>
              <th className="px-4 py-3 text-left font-medium border-b border-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium border-b border-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium border-b border-gray-600">Joined</th>
              <th className="px-4 py-3 text-left font-medium border-b border-gray-600">Plan</th>
              <th className="px-4 py-3 text-left font-medium border-b border-gray-600">Role</th>
              <th className="px-4 py-3 text-left font-medium border-b border-gray-600">Last Login</th>
              <th className="px-4 py-3 text-left font-medium border-b border-gray-600">
                Activity Level
              </th>
              <th className="px-4 py-3 font-medium border-b border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.user_id}
                className="border-b border-gray-700 hover:bg-gray-800 transition duration-150"
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
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
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

      {/* Drawer for user editing */}
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {selectedUser && (
          <EditUserDrawer user={selectedUser} onClose={() => setIsDrawerOpen(false)} refreshUsers={refreshUsers} />
        )}
      </SideDrawer>
    </div>
  );
}