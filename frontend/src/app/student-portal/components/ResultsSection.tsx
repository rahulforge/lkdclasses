"use client";

import { useEffect, useMemo, useState } from "react";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
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

export default function ResultsSection() {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [selectedTestIndex, setSelectedTestIndex] = useState<number>(0);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const run = async () => {
      const session = authService.getStoredSession();
      if (!session?.rollNumber) return;
      const rows = await resultService.getMyResults(session.rollNumber);
      setResults(rows);
    };

    void run();
  }, []);

  const testResults: TestResult[] = useMemo(() => {
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

    return Array.from(grouped.values());
  }, [results]);

  if (!testResults.length) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg text-gray-600">No results uploaded yet.</div>
    );
  }

  const selectedTest = testResults[Math.min(selectedTestIndex, testResults.length - 1)];
  const sortedSubjects = [...selectedTest.subjects].sort((a, b) => (sortAsc ? a.obtained - b.obtained : b.obtained - a.obtained));

  const totalObtained = sortedSubjects.reduce((sum, s) => sum + s.obtained, 0);
  const totalMarks = sortedSubjects.reduce((sum, s) => sum + s.total, 0);
  const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h2 className="text-2xl font-bold text-indigo-700">Test Results</h2>
        <div className="flex items-center gap-3">
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" value={selectedTestIndex} onChange={(e) => setSelectedTestIndex(Number(e.target.value))}>
            {testResults.map((test, idx) => (
              <option key={`${test.testName}-${idx}`} value={idx}>{test.testName}</option>
            ))}
          </select>

          <button onClick={() => setSortAsc(!sortAsc)} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-100">
            {sortAsc ? <FaSortAmountDown /> : <FaSortAmountUp />}
            Sort
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-indigo-600">{selectedTest.testName}</h3>
          <span className="text-sm text-gray-500">{selectedTest.date}</span>
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
              {sortedSubjects.map((subj, i) => (
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
    </div>
  );
}
