"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaUpload, FaDownload, FaTrash, FaEdit } from "react-icons/fa";
import * as XLSX from "xlsx";
import { resultService, type ResultRow, type TseresultRow } from "@/services/resultService";
import toast from "react-hot-toast";

export default function ResultsSection() {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [tseResults, setTseResults] = useState<TseresultRow[]>([]);
  const [mode, setMode] = useState<"regular" | "tse">("regular");
  const [uploadingRegular, setUploadingRegular] = useState(false);
  const [uploadingTse, setUploadingTse] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [editing, setEditing] = useState<ResultRow | null>(null);

  const load = async (force = false) => {
    try {
      const data = await resultService.getResults(force);
      setResults(data);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load results");
    }
  };

  const loadTse = async () => {
    try {
      const data = await resultService.getTseResults();
      setTseResults(data);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load TSE results");
    }
  };

  useEffect(() => {
    if (mode === "regular") {
      void load();
    } else {
      void loadTse();
    }
  }, [mode]);

  const classes = useMemo(() => Array.from(new Set(results.map((r) => r.className))).filter(Boolean), [results]);

  const filteredResults = selectedClass ? results.filter((r) => r.className === selectedClass) : results;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingRegular(true);
      setStatusMessage("Uploading results...");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);

      const payload = rows
        .map((row) => ({
          rollNumber: String(row.roll_number ?? row.RollNumber ?? row.roll ?? "").trim(),
          name: String(row.student_name ?? row.Name ?? row.name ?? "").trim(),
          exam: String(row.exam ?? row.Exam ?? row.test_name ?? "").trim(),
          subject: String(row.subject ?? row.Subject ?? "General").trim(),
          marks: Number(row.obtained_marks ?? row.Marks ?? row.marks ?? 0),
          total: Number(row.total_marks ?? row.Total ?? row.total ?? 100),
        }))
        .filter((row) => row.rollNumber && row.name && row.exam);

      if (!payload.length) {
        toast.error("No valid rows found in file");
        return;
      }

      await resultService.upsertMany(payload);
      toast.success(`${payload.length} results uploaded`);
      setStatusMessage("Results uploaded successfully.");
      await load(true);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to upload results";
      toast.error(msg);
      setStatusMessage(msg);
    } finally {
      setUploadingRegular(false);
      e.target.value = "";
    }
  };

  const handleTseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingTse(true);
      setStatusMessage("Uploading TSE results...");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);

      const normalizeKey = (key: string) =>
        String(key).trim().toLowerCase().replace(/\s+/g, "_").replace(/\./g, "");

      const payload = rows
        .map((row) => {
          const normalized: Record<string, string | number> = {};
          Object.entries(row).forEach(([key, value]) => {
            normalized[normalizeKey(key)] = value as string | number;
          });

          return {
            className: String(
              normalized.class ?? normalized.grade ?? normalized.class_name ?? ""
            ).trim(),
            code: String(
              normalized.code ?? normalized.student_code ?? ""
            ).trim(),
            rollNumber: String(
              normalized.roll_no ?? normalized.roll_no_ ?? normalized.rollno ?? normalized.roll_number ?? normalized.roll ?? ""
            ).trim(),
            name: String(
              normalized.name ?? normalized.student_name ?? ""
            ).trim(),
            rank: normalized.rank ?? null,
            right: normalized.right ?? normalized.correct ?? null,
            wrong: normalized.wrong ?? normalized.incorrect ?? null,
            total: normalized.total ?? null,
            percentage: normalized.percent ?? normalized.percentage ?? normalized["%"] ?? null,
            certificateUrl: String(
              normalized.certificate_url ?? normalized.certificate ?? normalized.url ?? ""
            ).trim() || null,
            examName: String(normalized.exam_name ?? normalized.exam ?? "TSE").trim() || "TSE",
            testDate: String(normalized.test_date ?? normalized.date ?? "").trim() || null,
          };
        })
        .filter((row) => row.rollNumber && row.name);

      if (!payload.length) {
        toast.error("No valid rows found in file");
        return;
      }

      await resultService.upsertTseMany(payload);
      toast.success(`${payload.length} TSE results uploaded`);
      setStatusMessage("TSE results uploaded successfully.");
      await loadTse();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to upload TSE results";
      toast.error(msg);
      setStatusMessage(msg);
    } finally {
      setUploadingTse(false);
      e.target.value = "";
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, "results.xlsx");
  };

  const exportTseToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tseResults);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TSE Results");
    XLSX.writeFile(workbook, "tse_results.xlsx");
  };

  const deleteResult = async (id: string) => {
    try {
      await resultService.deleteResult(id);
      toast.success("Result deleted");
      await load(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete result");
    }
  };

  const updateResult = async () => {
    if (!editing) return;

    try {
      await resultService.updateResult(editing);
      toast.success("Result updated");
      setEditing(null);
      await load(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update result");
    }
  };

  return (
    <motion.div className="p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Results Management</h2>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex rounded-lg overflow-hidden border border-indigo-200">
          <button
            className={`px-4 py-2 text-sm font-semibold ${mode === "regular" ? "bg-indigo-600 text-white" : "bg-white text-indigo-700"}`}
            onClick={() => setMode("regular")}
          >
            Regular Results
          </button>
          <button
            className={`px-4 py-2 text-sm font-semibold ${mode === "tse" ? "bg-indigo-600 text-white" : "bg-white text-indigo-700"}`}
            onClick={() => setMode("tse")}
          >
            TSE Results
          </button>
        </div>

        {mode === "regular" && (
          <>
            <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
              <FaUpload /> {uploadingRegular ? "Uploading..." : "Upload Excel/CSV"}
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleUpload} className="hidden" />
            </label>
            <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <FaDownload /> Export to Excel
            </button>
            <select className="border rounded-lg p-2 bg-white shadow-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All Classes</option>
              {classes.map((cls) => (
                <option key={cls}>{cls}</option>
              ))}
            </select>
          </>
        )}

        {mode === "tse" && (
          <>
            <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
              <FaUpload /> {uploadingTse ? "Uploading..." : "Upload TSE Excel/CSV"}
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleTseUpload} className="hidden" />
            </label>
            <button onClick={exportTseToExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <FaDownload /> Export TSE
            </button>
          </>
        )}
      </div>

      {statusMessage && (
        <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          {statusMessage}
        </div>
      )}

      {mode === "regular" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {classes.filter((cls) => filter === "All" || filter === cls).map((cls) => {
            const count = results.filter((r) => r.className === cls).length;
            return (
              <motion.div key={cls} whileHover={{ scale: 1.03 }} className="bg-white p-4 rounded-xl shadow-md cursor-pointer flex justify-between items-center" onClick={() => setSelectedClass(cls)}>
                <div>
                  <p className="text-lg font-semibold">{cls}</p>
                  <p className="text-sm text-gray-500">{count} Papers</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setSelectedClass(null); }} className="text-gray-400 hover:text-gray-700">
                  <FaTimes />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {mode === "tse" && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-2 text-left">Roll</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Rank</th>
                <th className="p-2 text-left">Right</th>
                <th className="p-2 text-left">Wrong</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">%</th>
                <th className="p-2 text-left">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {tseResults.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-2">{r.rollNumber}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.rank ?? "-"}</td>
                  <td className="p-2">{r.rightCount ?? "-"}</td>
                  <td className="p-2">{r.wrongCount ?? "-"}</td>
                  <td className="p-2">{r.total ?? "-"}</td>
                  <td className="p-2">{r.percentage ?? "-"}</td>
                  <td className="p-2">
                    {r.certificateUrl ? (
                      <a href={r.certificateUrl} className="text-indigo-600 underline" target="_blank" rel="noreferrer">
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
              {tseResults.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={8}>No TSE results uploaded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedClass && (
        <div className="fixed inset-0 z-50 flex justify-center items-start pt-16 md:pt-10 bg-black bg-opacity-40 overflow-y-auto" onClick={() => setSelectedClass(null)}>
          <motion.div className="bg-white rounded-xl shadow-xl p-4 w-11/12 md:w-3/4 lg:w-2/3 relative" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-indigo-700">{selectedClass} - Results</h3>
              <button onClick={() => setSelectedClass(null)} className="text-gray-500 hover:text-black"><FaTimes /></button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Exam</th>
                    <th className="p-2 text-left">Subject</th>
                    <th className="p-2 text-left">Marks</th>
                    <th className="p-2 text-left">Total</th>
                    <th className="p-2 text-left">Grade</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">{r.exam}</td>
                      <td className="p-2">{r.subject}</td>
                      <td className="p-2">{r.marks}</td>
                      <td className="p-2">{r.total}</td>
                      <td className="p-2">{r.grade}</td>
                      <td className="p-2 text-center">
                        <button onClick={() => setEditing(r)} className="text-blue-600 hover:text-blue-800 mr-2"><FaEdit /></button>
                        <button onClick={() => void deleteResult(r.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-40" onClick={() => setEditing(null)}>
          <motion.div className="bg-white rounded-xl shadow-xl p-6 w-11/12 md:w-1/2" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">Edit Result</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="border rounded-lg p-2" placeholder="Name" />
              <input type="text" value={editing.exam} onChange={(e) => setEditing({ ...editing, exam: e.target.value })} className="border rounded-lg p-2" placeholder="Exam" />
              <input type="text" value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} className="border rounded-lg p-2" placeholder="Subject" />
              <input type="number" value={editing.marks} onChange={(e) => setEditing({ ...editing, marks: Number(e.target.value) })} className="border rounded-lg p-2" placeholder="Marks" />
              <input type="number" value={editing.total} onChange={(e) => setEditing({ ...editing, total: Number(e.target.value) })} className="border rounded-lg p-2" placeholder="Total" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={() => void updateResult()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Save Changes</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
