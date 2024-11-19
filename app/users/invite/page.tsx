"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const InviteUsers: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInvite = async () => {
    setError(null);
    setSuccess(false);

    const response = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        gym_id: "4e851b62-4d8a-4081-8dd2-08bb8c2a50a8", // Replace with dynamic gym ID
        invited_by: "20cfd815-65b8-4b00-b972-8e62f8cdc411", // Replace with dynamic user ID
      }),
    });

    if (response.ok) {
      setSuccess(true);
      setEmail("");
      setMessage("");
    } else {
      const data = await response.json();
      setError(data.error || "Failed to send invite");
    }
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-6">Invite Users</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">Invite sent successfully!</p>}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          User Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user email"
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message (Optional)
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a custom message (optional)"
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>
      <button
        onClick={handleInvite}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Send Invite
      </button>
      <button
        onClick={() => router.back()}
        className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition mt-4"
      >
        Back to User Management
      </button>
    </div>
  );
};

export default InviteUsers;
