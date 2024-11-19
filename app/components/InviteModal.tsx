import React, { useState } from "react";

type InviteModalProps = {
  onClose: () => void;
};

const InviteModal: React.FC<InviteModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState("");

  const handleInvite = async () => {
    // Add invite logic here
    console.log("Sending invite to:", email);
    onClose(); // Close the modal after sending the invite
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Invite a User</h2>
        <input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 p-3 border border-gray-300 rounded-lg w-full"
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
