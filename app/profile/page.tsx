"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import SideDrawer from "../components/SideDrawer";

// Types for gym search results
type Gym = {
  id: string;
  name: string;
};

export default function ProfilePage() {
  const { session, isLoading, userData } = useAuth();
  const router = useRouter();

  // Profile fields
  const [displayName, setDisplayName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [emergencyContactName, setEmergencyContactName] = useState<string>("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State for loading/saving
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Gym association states
  const [currentGymName, setCurrentGymName] = useState<string | null>(null);
  const [showGymDrawer, setShowGymDrawer] = useState<boolean>(false);
  const [gymQuery, setGymQuery] = useState<string>("");
  const [gymResults, setGymResults] = useState<Gym[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [memberCode, setMemberCode] = useState<string>("");
  const [invitationPending, setInvitationPending] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.push("/login");
      } else if (userData && !userData.onboarding_completed) {
        router.push("/onboarding");
      }
    }
  }, [isLoading, session, userData, router]);

  const fetchProfile = useCallback(async () => {
    if (!isLoading && userData?.onboarding_completed) {
      setLoadingProfile(true);
      setError(null);
      try {
        const res = await fetch("/api/user/profile", {
          credentials: "include",
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to load profile");
        }
        const data = await res.json();
        setDisplayName(data.profile.display_name || "");
        setBio(data.profile.bio || "");
        setPhone(data.profile.phone_number || "");
        setEmergencyContactName(data.profile.emergency_contact_name || "");
        setEmergencyContactPhone(data.profile.emergency_contact || "");

        // Fetch current gym name if present
        if (userData.current_gym_id) {
          const gymRes = await fetch(`/api/gyms/${userData.current_gym_id}`);
          if (gymRes.ok) {
            const gymData = await gymRes.json();
            setCurrentGymName(gymData.name);
          } else {
            setCurrentGymName(null);
          }
        } else {
          setCurrentGymName(null);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingProfile(false);
      }
    }
  }, [isLoading, userData]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) {
      newErrors.displayName = "Display Name is required.";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }
    if (!emergencyContactName.trim()) {
      newErrors.emergencyContactName = "Emergency contact name is required.";
    }
    if (!emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = "Emergency contact phone is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!validate()) return;

    setSavingProfile(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          display_name: displayName,
          bio,
          phone_number: phone,
          emergency_contact_name: emergencyContactName,
          emergency_contact: emergencyContactPhone,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save profile");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const searchGyms = useCallback(async () => {
    if (!gymQuery.trim()) {
      setGymResults([]);
      return;
    }
    const res = await fetch(`/api/gyms?query=${encodeURIComponent(gymQuery)}`);
    if (res.ok) {
      const data = await res.json();
      setGymResults(data.gyms || []);
    }
  }, [gymQuery]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchGyms();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [gymQuery, searchGyms]);

  const handleSelectGym = (gym: Gym) => {
    setSelectedGym(gym);
    setMemberCode("");
  };

  const submitGymCode = async () => {
    if (!selectedGym || !memberCode.trim()) return;

    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ gym_id: selectedGym.id, member_code: memberCode }),
    });

    if (res.ok) {
      // Invitation created, pending approval
      setInvitationPending(true);
    } else {
      const errData = await res.json();
      alert(errData.error || "Failed to request gym association.");
    }
  };

  if ((isLoading || loadingProfile) && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Global Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow p-6 sm:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto bg-gray-800 p-6 rounded-xl shadow border border-gray-700 space-y-8">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Sign In Settings */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-200">Sign In Settings</h2>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-200">Email</label>
              <input
                type="text"
                value={userData?.email || ""}
                disabled
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300 cursor-not-allowed"
              />
            </div>
            <div className="flex space-x-4 text-sm text-pink-400">
              <span className="cursor-pointer hover:underline">Change Email</span>
              <span className="cursor-pointer hover:underline">Change Password</span>
            </div>
          </section>

          {/* Profile Info */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-200">Profile Info</h2>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-200">Display Name *</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`w-full p-2 rounded border ${
                  errors.displayName ? "border-red-500" : "border-gray-600"
                } bg-gray-700 text-gray-200`}
              />
              {errors.displayName && <p className="text-xs text-red-500">{errors.displayName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-200">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-200 h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-200">Phone *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full p-2 rounded border ${
                  errors.phone ? "border-red-500" : "border-gray-600"
                } bg-gray-700 text-gray-200`}
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-200">Emergency Contact Name *</label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className={`w-full p-2 rounded border ${
                  errors.emergencyContactName ? "border-red-500" : "border-gray-600"
                } bg-gray-700 text-gray-200`}
              />
              {errors.emergencyContactName && (
                <p className="text-xs text-red-500">{errors.emergencyContactName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-200">Emergency Contact Phone *</label>
              <input
                type="text"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className={`w-full p-2 rounded border ${
                  errors.emergencyContactPhone ? "border-red-500" : "border-gray-600"
                } bg-gray-700 text-gray-200`}
              />
              {errors.emergencyContactPhone && (
                <p className="text-xs text-red-500">{errors.emergencyContactPhone}</p>
              )}
            </div>

            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className={`px-4 py-2 rounded ${
                savingProfile ? "bg-gray-600 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-500"
              } text-white`}
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </section>

          {/* Gym Association */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-200">Gym Association</h2>
            {invitationPending && (
              <p className="text-sm text-gray-300">Your membership request is pending approval.</p>
            )}
            {currentGymName ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300">
                  Associated Gym: <span className="font-semibold text-gray-100">{currentGymName}</span>
                </p>
                {!invitationPending && (
                  <button
                    onClick={() => setShowGymDrawer(true)}
                    className="text-sm text-pink-400 hover:underline"
                  >
                    Change Gym
                  </button>
                )}
              </div>
            ) : (
              !invitationPending && (
                <button
                  onClick={() => setShowGymDrawer(true)}
                  className="text-sm text-pink-400 hover:underline"
                >
                  Set Gym Association
                </button>
              )
            )}
          </section>
        </div>
      </main>

      <SideDrawer
        isOpen={showGymDrawer}
        onClose={() => {
          setShowGymDrawer(false);
          setSelectedGym(null);
          setGymQuery("");
          setGymResults([]);
          setMemberCode("");
        }}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {selectedGym || invitationPending ? "Change Gym" : "Set Gym Association"}
        </h3>
        {!selectedGym && !invitationPending && (
          <>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Search for Gym</label>
            <input
              type="text"
              value={gymQuery}
              onChange={(e) => setGymQuery(e.target.value)}
              placeholder="Type a gym name..."
              className="w-full p-2 border border-gray-300 rounded mb-4 text-gray-900"
            />
            {gymResults.length === 0 && (
              <p className="text-sm text-gray-500">No gyms found.</p>
            )}
            <ul className="space-y-2">
              {gymResults.map((g) => (
                <li key={g.id}>
                  <button
                    onClick={() => handleSelectGym(g)}
                    className="block w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    {g.name}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {selectedGym && !invitationPending && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Selected Gym: <span className="font-semibold">{selectedGym.name}</span>
            </p>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Enter Member Code</label>
            <input
              type="text"
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              placeholder="6 digit code"
              className="w-full p-2 border border-gray-300 rounded text-gray-900"
            />
            <button
              onClick={submitGymCode}
              className="px-4 py-2 bg-pink-500 text-white hover:bg-pink-600 rounded"
            >
              Submit
            </button>
          </div>
        )}

        {invitationPending && (
          <p className="text-sm text-gray-500 mt-4">
            Your request has been submitted. Please wait for the gym to approve.
          </p>
        )}
      </SideDrawer>

      {/* Footer */}
      <footer className="bg-gray-800 text-center py-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
