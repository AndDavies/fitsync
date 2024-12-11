"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

type Benchmark = {
  id: string;
  benchmark_name: string;
  benchmark_value: string;
  date_recorded: string;
};

export default function ProfilePage() {
  const { session, isLoading, userData } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [goals, setGoals] = useState<string>('');
  
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [benchmarkName, setBenchmarkName] = useState<string>('');
  const [benchmarkValue, setBenchmarkValue] = useState<string>('');

  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [addingBenchmark, setAddingBenchmark] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle auth redirects:
  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.push('/login');
      } else if (userData && !userData.onboarding_completed) {
        router.push('/onboarding');
      }
    }
  }, [isLoading, session, userData, router]);

  // Fetch profile and benchmarks
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoading && userData?.onboarding_completed) {
        setLoadingProfile(true);
        setError(null);
        try {
          const res = await fetch('/api/user/profile');
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to load profile');
          }
          const data = await res.json();
          setDisplayName(data.profile.display_name || '');
          setBio(data.profile.bio || '');
          setGoals(data.profile.goals || '');
          setBenchmarks(data.benchmarks || []);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    fetchProfile();
  }, [isLoading, userData]);

  const saveProfile = async () => {
    setSavingProfile(true);
    setError(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName, bio, goals })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save profile');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const addNewBenchmark = async () => {
    setAddingBenchmark(true);
    setError(null);
    try {
      const res = await fetch('/api/user/benchmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benchmark_name: benchmarkName, benchmark_value: benchmarkValue })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add benchmark');
      }
      // Refresh profile/benchmarks
      setBenchmarkName('');
      setBenchmarkValue('');
      const refreshRes = await fetch('/api/user/profile');
      const refreshData = await refreshRes.json();
      setBenchmarks(refreshData.benchmarks || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingBenchmark(false);
    }
  };

  if (isLoading || loadingProfile || !session || !userData) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-lg mx-auto bg-white p-6 rounded shadow space-y-4">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-semibold mb-1">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded h-24"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Goals</label>
          <input
            type="text"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          onClick={saveProfile}
          disabled={savingProfile}
          className={`px-4 py-2 rounded ${savingProfile ? 'bg-gray-300' : 'bg-pink-500 text-white hover:bg-pink-600'}`}
        >
          {savingProfile ? 'Saving...' : 'Save Profile'}
        </button>

        <hr className="my-6" />

        <h2 className="text-xl font-bold">Your Benchmarks</h2>
        <div className="space-y-2">
          {benchmarks.map((b) => (
            <div key={b.id} className="p-2 border-b text-sm">
              <strong>{b.benchmark_name}:</strong> {b.benchmark_value} <span className="text-gray-500 text-xs">({new Date(b.date_recorded).toLocaleDateString()})</span>
            </div>
          ))}
          {benchmarks.length === 0 && <p className="text-gray-500 text-sm">No benchmarks recorded yet.</p>}
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-semibold">Add a New Benchmark</h3>
          <input
            type="text"
            placeholder="Benchmark Name (e.g., '5K Run')"
            value={benchmarkName}
            onChange={(e) => setBenchmarkName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Benchmark Value (e.g., '25:30')"
            value={benchmarkValue}
            onChange={(e) => setBenchmarkValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            onClick={addNewBenchmark}
            disabled={addingBenchmark}
            className={`px-4 py-2 rounded ${addingBenchmark ? 'bg-gray-300' : 'bg-green-500 text-white hover:bg-green-600'}`}
          >
            {addingBenchmark ? 'Adding...' : 'Add Benchmark'}
          </button>
        </div>
      </div>
    </div>
  );
}
