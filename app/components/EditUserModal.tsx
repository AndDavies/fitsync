import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";

type EditUserModalProps = {
  user: {
    user_id: string;
    display_name: string;
    bio: string | null;
    role: string;
    email: string;
    phone_number: string | null;
    emergency_contact: string | null;
    subscription_plan: string | null;
    goals: string | null;
    notifications_enabled: boolean;
  };
  onClose: () => void;
  onUpdate: () => void;
};

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    display_name: user.display_name,
    bio: user.bio || "",
    role: user.role,
    email: user.email,
    phone_number: user.phone_number || "",
    emergency_contact: user.emergency_contact || "",
    subscription_plan: user.subscription_plan || "",
    goals: user.goals || "",
    notifications_enabled: user.notifications_enabled,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, notifications_enabled: e.target.checked });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          role: formData.role,
          email: formData.email,
          phone_number: formData.phone_number,
          emergency_contact: formData.emergency_contact,
          subscription_plan: formData.subscription_plan,
          goals: formData.goals,
          notifications_enabled: formData.notifications_enabled,
        })
        .eq("user_id", user.user_id);

      if (error) {
        setError("Error updating user: " + error.message);
      } else {
        onUpdate();
        onClose();
      }
    } catch (updateError) {
      setError("Unexpected error: " + updateError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Edit User</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleSelectChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="member">Member</option>
              <option value="coach">Coach</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Emergency Contact</label>
            <input
              type="text"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subscription Plan</label>
            <input
              type="text"
              name="subscription_plan"
              value={formData.subscription_plan}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Goals</label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              <input
                type="checkbox"
                name="notifications_enabled"
                checked={formData.notifications_enabled}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              Notifications Enabled
            </label>
          </div>
        </form>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded ${
              isLoading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
            } transition`}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
