"use client";

export default function ResultLookupPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 px-4 py-50">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-indigo-400/20 bg-slate-900/70 p-10 text-center shadow-[0_24px_80px_rgba(30,64,175,0.35)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-indigo-200/80">TSE Results</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Coming Soon</h1>
        <p className="mt-3 text-sm text-slate-300 md:text-base">
           Jaldi hi yahan live result aa jayega.
        </p>
      </section>
    </main>
  );
}

/*
  Previous result lookup UI (kept for later):

  "use client";

  import { useState } from "react";
  import { resultService, type TseresultRow } from "@/services/resultService";

  export default function ResultLookupPage() {
    const [rollNumber, setRollNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<TseresultRow | null>(null);

    const handleLookup = async () => {
      try {
        setLoading(true);
        setError("");
        setResult(null);

        if (!rollNumber.trim()) {
          throw new Error("Enter roll number");
        }

        const row = await resultService.getTseResult(rollNumber.trim());
        if (!row) {
          throw new Error("Result not found for this roll number");
        }
        setResult(row);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unable to fetch result");
      } finally {
        setLoading(false);
      }
    };

    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 px-4 py-12">
        <section className="mx-auto w-full max-w-3xl rounded-3xl border border-indigo-400/20 bg-slate-900/70 p-6 shadow-[0_24px_80px_rgba(30,64,175,0.35)] backdrop-blur md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white md:text-3xl">TSE Result</h1>
            <p className="mt-2 text-sm text-slate-300 md:text-base">
              Roll number डालकर अपना TSE result देखें.
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Roll Number</label>
              <input
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter roll number"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={handleLookup}
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking..." : "Check Result"}
            </button>
          </div>

          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

          {!result && !loading && !error && (
            <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-300">
              Enter roll number to view result.
            </div>
          )}

          {result && (
            <div className="mt-6 bg-white text-slate-900 rounded-2xl shadow p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-indigo-700">{result.examName ?? "TSE"}</h3>
                  <p className="text-sm text-gray-500">Date: {result.testDate ? String(result.testDate).slice(0, 10) : "-"}</p>
                </div>
                <div className="text-sm text-gray-600">
                  Roll: <span className="font-semibold">{result.rollNumber}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                  <p className="text-xs uppercase text-indigo-600">Name</p>
                  <p className="font-semibold">{result.name || "-"}</p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                  <p className="text-xs uppercase text-indigo-600">Rank</p>
                  <p className="font-semibold">{result.rank ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                  <p className="text-xs uppercase text-indigo-600">Percentage</p>
                  <p className="font-semibold">{result.percentage ?? "-"}%</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-xs uppercase text-gray-500">Right</p>
                  <p className="text-lg font-semibold">{result.rightCount ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-xs uppercase text-gray-500">Wrong</p>
                  <p className="text-lg font-semibold">{result.wrongCount ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-xs uppercase text-gray-500">Total</p>
                  <p className="text-lg font-semibold">{result.total ?? "-"}</p>
                </div>
              </div>

              <div className="mt-5">
                <a
                  href={result.certificateUrl || `/api/certificates/tse?roll=${encodeURIComponent(result.rollNumber)}`}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download Certificate
                </a>
              </div>
            </div>
          )}
        </section>
      </main>
    );
  }
*/
