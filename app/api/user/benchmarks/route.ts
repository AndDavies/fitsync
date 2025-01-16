// app/api/user/benchmarks/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  // 1) Retrieve cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // 2) Create supabase server client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => allCookies,
      setAll: () => {},
    },
  });

  // 3) Confirm user session (this route seems to require the user)
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: userError?.message || "Not authenticated" }, { status: 401 });
  }

  const userId = userData.user.id;

  // 4) Fetch all benchmarks
  const { data: benchmarksData, error: benchmarksError } = await supabase
    .from("benchmarks")
    .select("id, name, category, units, description")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (benchmarksError) {
    return NextResponse.json({ error: benchmarksError.message }, { status: 500 });
  }

  // 5) If you want user results, fetch them from `user_benchmark_results`
  const benchmarkIds = (benchmarksData ?? []).map((b) => b.id);
  const { data: resultsData, error: resultsError } = await supabase
    .from("user_benchmark_results")
    .select("benchmark_id, result_value")
    .eq("user_id", userId)
    .in("benchmark_id", benchmarkIds);

  if (resultsError) {
    return NextResponse.json({ error: resultsError.message }, { status: 500 });
  }

  // 6) Merge user results
  const userResultsMap = new Map(resultsData?.map((r) => [r.benchmark_id, r.result_value]));
  const responseData = (benchmarksData ?? []).map((b) => ({
    ...b,
    user_result: userResultsMap.get(b.id) ?? null,
  }));

  return NextResponse.json({ benchmarks: responseData });
}