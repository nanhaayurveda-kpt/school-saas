"use client";

import { useState } from "react";
import { addPayment } from "@/app/actions";

export default function FeeAddForm({ allStudents, feeStructures, today, currentMonth, currentAcademicYear, months }) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedFeeType, setSelectedFeeType] = useState("monthly");
  const [amount, setAmount] = useState("");

  function handleStudentChange(e) {
    const studentId = parseInt(e.target.value);
    setSelectedStudentId(studentId);
    fillAmount(studentId, selectedFeeType);
  }

  function handleFeeTypeChange(e) {
    const feeType = e.target.value;
    setSelectedFeeType(feeType);
    fillAmount(selectedStudentId, feeType);
  }

  function fillAmount(studentId, feeType) {
    if (!studentId || !feeType) return;
    const student = allStudents.find((s) => s.id === studentId);
    if (!student) return;
    const structure = feeStructures.find(
      (fs) => fs.class === student.class && fs.fee_type === feeType
    );
    if (structure) setAmount(String(structure.amount));
    else setAmount("");
  }

  return (
    <form action={addPayment} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Student <span className="text-red-500">*</span>
        </label>
        <select
          name="student_id"
          required
          value={selectedStudentId}
          onChange={handleStudentChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select student...</option>
          {allStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — Class {s.class} {s.section || ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount"
            required
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fee Type <span className="text-red-500">*</span>
          </label>
          <select
            name="fee_type"
            value={selectedFeeType}
            onChange={handleFeeTypeChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="monthly">Monthly Fee</option>
            <option value="admission">Admission Fee</option>
            <option value="exam">Exam Fee</option>
            <option value="transport">Transport Fee</option>
            <option value="misc">Miscellaneous</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <select
            name="month"
            defaultValue={currentMonth}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select...</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
          <input
            type="text"
            name="academic_year"
            defaultValue={currentAcademicYear}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="due_date"
            required
            defaultValue={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid Date
            <span className="text-gray-400 font-normal text-xs ml-1">(empty = pending)</span>
          </label>
          <input
            type="date"
            name="paid_date"
            defaultValue={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Receipt No.</label>
        <input
          type="text"
          name="receipt_no"
          placeholder="e.g. RCP/2024/001"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium"
        >
          Save Payment
        </button>
        <a
          href="/fees"
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}