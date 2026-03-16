"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaSearch } from "react-icons/fa";
import { paymentService, type PaymentRow } from "@/services/paymentService";
import toast from "react-hot-toast";

export default function PaymentsSection() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    rollNo: "",
    name: "",
    className: "",
    amount: "",
    type: "Monthly",
    mode: "Online",
    details: "",
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<PaymentRow | null>(null);

  const load = async (force = false) => {
    try {
      setLoading(true);
      const data = await paymentService.getPayments(force);
      setPayments(data);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addPayment = async () => {
    try {
      if (!form.rollNo.trim() || !form.amount.trim()) {
        toast.error("Roll number and amount are required");
        return;
      }

      await paymentService.createPayment({
        rollNo: form.rollNo,
        amount: parseFloat(form.amount),
        mode: form.mode,
        status: "Pending",
      });
      toast.success("Payment record created");
      setForm({ rollNo: "", name: "", className: "", amount: "", type: "Monthly", mode: "Online", details: "" });
      await load(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to add payment");
    }
  };

  const toggleStatus = async (id: string, current: "Paid" | "Pending") => {
    try {
      const next = current === "Paid" ? "Pending" : "Paid";
      await paymentService.updatePaymentStatus(id, next);
      await load(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to update status");
    }
  };

  const filtered = useMemo(() => {
    return payments.filter(
      (p) =>
        (filter === "All" || p.status === filter) &&
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.className.toLowerCase().includes(search.toLowerCase()) ||
          p.rollNo.toLowerCase().includes(search.toLowerCase()))
    );
  }, [payments, filter, search]);

  return (
    <motion.div className="p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Payments Management</h2>

      <div className="bg-white p-4 rounded-lg shadow-md border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input type="text" placeholder="Roll Number" className="border rounded-lg p-2" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} />
          <input type="number" placeholder="Amount (Rs)" className="border rounded-lg p-2" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <select className="border rounded-lg p-2" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            <option>Online</option>
            <option>Offline</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button onClick={() => void addPayment()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><FaPlus /> Add Payment</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white shadow-sm flex-1">
          <FaSearch className="text-gray-500" />
          <input type="text" placeholder="Search by name, class or roll no" className="outline-none flex-1" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="border rounded-lg p-2 bg-white shadow-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {!loading && filtered.length === 0 && <p className="col-span-full text-center text-gray-500 py-6">No payments found</p>}
        {filtered.map((p) => (
          <motion.div key={p.id} className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition flex flex-col gap-2" onClick={() => setSelected(p)} whileHover={{ scale: 1.03 }}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-indigo-700">{p.name === "-" ? p.rollNo : p.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${p.status === "Paid" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span>
            </div>
            <p className="text-gray-600">Class: {p.className}</p>
            <p className="text-gray-600">Roll No: {p.rollNo}</p>
            <p className="text-gray-600">Amount: Rs {p.amount}</p>
            <p className="text-gray-600">Mode: {p.mode}</p>
            <p className="text-gray-500 text-sm">{p.date}</p>
            <button onClick={(e) => { e.stopPropagation(); void toggleStatus(p.id, p.status); }} className="text-xs rounded bg-indigo-50 text-indigo-700 px-2 py-1 self-start">
              Mark {p.status === "Paid" ? "Pending" : "Paid"}
            </button>
          </motion.div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 md:w-1/2 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">Payment Details</h3>
            <p><strong>Roll No:</strong> {selected.rollNo}</p>
            <p><strong>Name:</strong> {selected.name}</p>
            <p><strong>Class:</strong> {selected.className}</p>
            <p><strong>Amount:</strong> Rs {selected.amount}</p>
            <p><strong>Mode:</strong> {selected.mode}</p>
            <p><strong>Date:</strong> {selected.date}</p>
            <p><strong>Status:</strong> {selected.status}</p>
            <button onClick={() => setSelected(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black">x</button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
