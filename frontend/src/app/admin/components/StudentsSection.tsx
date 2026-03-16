"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSearch } from "react-icons/fa";
import { studentService, type StudentRow } from "@/services/studentService";
import { classService, type ClassItem } from "@/services/classService";
import toast from "react-hot-toast";

export default function StudentsSection() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    classId: "",
    phone: "",
    status: "Active" as "Active" | "Inactive",
  });

  const load = async (force = false) => {
    try {
      setLoading(true);
      const [studentRows, classRows] = await Promise.all([
        studentService.getStudents(force),
        classService.getClasses(force),
      ]);
      setStudents(studentRows);
      setClasses(classRows);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addStudent = async () => {
    try {
      if (!form.name.trim() || !form.classId.trim()) {
        toast.error("Name and class are required");
        return;
      }

      await studentService.createStudent(form);
      toast.success("Student added");
      setForm({ name: "", classId: "", phone: "", status: "Active" });
      await load(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to add student");
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await studentService.deleteStudent(id);
      toast.success("Student deleted");
      await load(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to delete student");
    }
  };

  const startEdit = (student: StudentRow) => {
    setEditingId(student.id);
    const classMatch = classes.find((item) => item.name === student.className);
    setForm({
      name: student.name,
      classId: classMatch?.id ?? "",
      phone: student.phone,
      status: student.status,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      await studentService.updateStudent(editingId, {
        name: form.name,
        phone: form.phone,
        status: form.status,
      });
      toast.success("Student updated");
      setEditingId(null);
      setForm({ name: "", classId: "", phone: "", status: "Active" });
      await load(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to update student");
    }
  };

  const classNames = useMemo(
    () => Array.from(new Set(students.map((s) => s.className))).filter(Boolean).sort((a, b) => a.localeCompare(b)),
    [students]
  );

  const displayedStudents = selectedClass
    ? students.filter((s) => s.className === selectedClass)
    : students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <motion.div className="p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Students Management</h2>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-md border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input type="text" placeholder="Full Name" className="border rounded-lg p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="border rounded-lg p-2" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
            <option value="">Select Class</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <input type="text" placeholder="Phone Number" className="border rounded-lg p-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select className="border rounded-lg p-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "Active" | "Inactive" })}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          {editingId ? (
            <>
              <button onClick={saveEdit} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><FaSave /> Save</button>
              <button onClick={() => { setEditingId(null); setForm({ name: "", classId: "", phone: "", status: "Active" }); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"><FaTimes /> Cancel</button>
            </>
          ) : (
            <button onClick={addStudent} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><FaPlus /> Add Student</button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <FaSearch className="text-gray-500" />
        <input type="text" placeholder="Search by name or roll number" className="border rounded-lg p-2 flex-1" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {classNames.map((cls) => (
          <div key={cls} onClick={() => setSelectedClass(cls)} className="p-4 bg-indigo-100 rounded-lg shadow hover:shadow-lg cursor-pointer text-center font-semibold text-indigo-700">
            {cls} <br />
            {students.filter((s) => s.className === cls).length} Students
          </div>
        ))}
      </div>

      {selectedClass && (
        <div className="mb-6 relative">
          <button onClick={() => setSelectedClass(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl" title="Close">x</button>

          <div className="overflow-x-auto bg-white rounded-lg shadow-md border mt-10">
            <table className="min-w-[600px] md:min-w-full w-full text-sm border-collapse">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="p-3 text-left">Roll No</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedStudents.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 md:p-3">{s.rollNo || "-"}</td>
                    <td className="p-2 md:p-3">{s.name}</td>
                    <td className="p-2 md:p-3">{s.phone || "-"}</td>
                    <td className="p-2 md:p-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${s.status === "Active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-2 md:p-3 text-center flex justify-center gap-2">
                      <button onClick={() => startEdit(s)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                      <button onClick={() => void deleteStudent(s.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
                {!loading && displayedStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">No students found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
