"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from "../components/Header";
import LeftNav from "../components/LeftNav";

type Benchmark = {
  id: string;
  name: string;
  category: string;
  units: string;
  description: string | null;
  user_result: string | null;
};

export default function BenchmarksPage() {
  const { session, isLoading, userData } = useAuth();
  const router = useRouter();
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.push("/login");
      } else if (userData && !userData.onboarding_completed) {
        router.push("/onboarding");
      } else {
        // Fetch benchmarks
        const fetchBenchmarks = async () => {
          try {
            const res = await fetch('/api/user/benchmarks', { credentials: 'include' });
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || 'Failed to load benchmarks');
            }
            const data = await res.json();
            setBenchmarks(data.benchmarks || []);
          } catch (err: any) {
            console.error("Error fetching benchmarks:", err.message);
            setError("Could not load benchmarks. Please try again later.");
          }
        };
        fetchBenchmarks();
      }
    }
  }, [isLoading, session, userData, router]);

  // Extract categories from benchmarks
  const categories = useMemo(() => {
    const cats = new Set(benchmarks.map(b => b.category));
    return Array.from(cats).sort();
  }, [benchmarks]);

  const filteredBenchmarks = useMemo(() => {
    if (!selectedCategory) return benchmarks;
    return benchmarks.filter(b => b.category === selectedCategory);
  }, [benchmarks, selectedCategory]);

  if (isLoading || !session || !userData) {
    return <div>Loading benchmarks...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <Header />
      <div className="flex flex-grow">
        <LeftNav />

        <main className="flex-grow p-6">
          <h1 className="text-2xl font-bold mb-4">Benchmarks</h1>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Category Tabs */}
          <div className="flex space-x-4 mb-4">
            <button
              className={`px-3 py-1 rounded ${!selectedCategory ? 'bg-pink-500 text-white' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`px-3 py-1 rounded ${selectedCategory === cat ? 'bg-pink-500 text-white' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Benchmarks Table */}
          <div className="bg-white p-4 rounded border border-gray-300">
            {filteredBenchmarks.length === 0 ? (
              <p className="text-gray-700">No benchmarks found in this category.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2">Benchmark</th>
                    <th className="text-left py-2">Your Result</th>
                    <th className="text-left py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBenchmarks.map(b => (
                    <tr key={b.id} className="border-b border-gray-200">
                      <td className="py-2">
                        <div className="font-semibold text-gray-900">{b.name}</div>
                        {b.description && <div className="text-gray-600 text-xs">{b.description}</div>}
                      </td>
                      <td className="py-2">
                        {b.user_result ? (
                          <span className="text-gray-800">{b.user_result}</span>
                        ) : (
                          <span className="text-gray-500 text-xs">No Result</span>
                        )}
                      </td>
                      <td className="py-2">
                        {b.user_result ? (
                          <span className="text-gray-700 text-xs italic">Result Recorded</span>
                        ) : (
                          <button
                            onClick={() => router.push(`/benchmarks/${b.id}/post-result`)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                          >
                            Post a Result
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-sm text-gray-600">&copy; 2024 FitSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
