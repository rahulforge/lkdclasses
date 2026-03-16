"use client";

import { useState } from "react";
import { authService } from "@/services/authService";
import { resultService, type ResultRow } from "@/services/resultService";

type SubjectResult = {
  subject: string;
  obtained: number;
  total: number;
};

type TestResult = {
  testName: string;
  date: string;
  subjects: SubjectResult[];
};

export default function ResultLookupPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<ResultRow[]>([]);

  const handleLookup = async () => {
    try {
      setLoading(true);
      setError("");
      setResults([]);

      if (!identifier.trim() || !password.trim()) {
        throw new Error("Enter mobile number and password");
      }

      const session = await authService.login(identifier.trim(), password.trim());
      if (!session?.rollNumber) {
        throw new Error("Roll number not found for this account");
      }

      const rows = await resultService.getMyResults(session.rollNumber, true);
      setResults(rows);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unable to fetch result");
    } finally {
      setLoading(false);
    }
  };

  const grouped = new Map<string, TestResult>();
  for (const row of results) {
    const key = `${row.exam}__${row.testDate}`;
    const existing = grouped.get(key);
    const subject: SubjectResult = {
      subject: row.subject,
      obtained: row.marks,
      total: row.total,
    };
    if (existing) {
      existing.subjects.push(subject);
    } else {
      grouped.set(key, {
        testName: row.exam,
        date: row.testDate?.slice(0, 10) || "-",
        subjects: [subject],
      });
    }
  }
  const testResults = Array.from(grouped.values());

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 px-4 py-12">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-indigo-400/20 bg-slate-900/70 p-6 shadow-[0_24px_80px_rgba(30,64,175,0.35)] backdrop-blur md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Check Result</h1>
          <p className="mt-2 text-sm text-slate-300 md:text-base">
            Mobile number aur password se result check karein.
          </p>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Mobile Number</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
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

        {results.length === 0 && !loading && !error && (
          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-300">
            No results found yet.
          </div>
        )}

        {testResults.map((test, idx) => {
          const totalObtained = test.subjects.reduce((sum, s) => sum + s.obtained, 0);
          const totalMarks = test.subjects.reduce((sum, s) => sum + s.total, 0);
          const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : "0.00";

          return (
            <div key={`${test.testName}-${idx}`} className="mt-6 bg-white text-slate-900 rounded-2xl shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-indigo-700">{test.testName}</h3>
                <span className="text-sm text-gray-500">{test.date}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-200 px-3 py-2">Subject</th>
                      <th className="border-b border-gray-200 px-3 py-2">Obtained</th>
                      <th className="border-b border-gray-200 px-3 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {test.subjects.map((subj, i) => (
                      <tr key={`${subj.subject}-${i}`} className="odd:bg-gray-50">
                        <td className="px-3 py-2">{subj.subject}</td>
                        <td className="px-3 py-2 font-semibold">{subj.obtained}</td>
                        <td className="px-3 py-2">{subj.total}</td>
                      </tr>
                    ))}
                    <tr className="bg-indigo-50 font-bold">
                      <td className="px-3 py-2">Total</td>
                      <td className="px-3 py-2">{totalObtained}</td>
                      <td className="px-3 py-2">{totalMarks}</td>
                    </tr>
                    <tr className="bg-indigo-100 font-bold text-indigo-700">
                      <td className="px-3 py-2">Percentage</td>
                      <td className="px-3 py-2" colSpan={2}>{percentage}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
