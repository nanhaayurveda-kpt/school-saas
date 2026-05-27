"use client";

import { useState } from "react";

export default function FeeAddForm({
  allStudents,
  feeStructures,
  concessions,
  today,
  currentMonth,
  currentAcademicYear,
  months,
}) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedFeeType, setSelectedFeeType] = useState("monthly");
  const [amount, setAmount] = useState("");
  const [concessionInfo, setConcessionInfo] = useState(null);
  const [netAmount, setNetAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleStudentChange(e) {
    const studentId = parseInt(e.target.value);
    setSelectedStudentId(studentId);
    const conc = concessions.find((c) => c.student_id === studentId) || null;
    setConcessionInfo(conc);
    fillAmount(studentId, selectedFeeType, conc);
  }

  function handleFeeTypeChange(e) {
    const feeType = e.target.value;
    setSelectedFeeType(feeType);
    const conc =
      concessions.find((c) => c.student_id === selectedStudentId) || null;
    fillAmount(selectedStudentId, feeType, conc);
  }

  function fillAmount(studentId, feeType, conc) {
    if (!studentId || !feeType) return;
    const student = allStudents.find((s) => s.id === studentId);
    if (!student) return;
    const structure = feeStructures.find(
      (fs) => fs.class === student.class && fs.fee_type === feeType,
    );
    if (structure) {
      const base = structure.amount;
      setAmount(String(base));
      if (conc) {
        const discount =
          conc.discount_type === "percent"
            ? Math.round((base * conc.discount_value) / 100)
            : conc.discount_value;
        setNetAmount(String(Math.max(0, base - discount)));
      } else {
        setNetAmount(String(base));
      }
    } else {
      setAmount("");
      setNetAmount("");
    }
  }

  function handleAmountChange(e) {
    const base = parseInt(e.target.value) || 0;
    setAmount(e.target.value);
    if (concessionInfo) {
      const discount =
        concessionInfo.discount_type === "percent"
          ? Math.round((base * concessionInfo.discount_value) / 100)
          : concessionInfo.discount_value;
      setNetAmount(String(Math.max(0, base - discount)));
    } else {
      setNetAmount(e.target.value);
    }
  }

  return (
    <form
      method="POST"
      action="/api/fees/add"
      onSubmit={() => setSubmitting(true)}
      className="space-y-4"
    >
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
            Total Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount"
            required
            min="1"
            step="1"
            value={amount}
            onChange={handleAmountChange}
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

      {concessionInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-green-700 mb-1">
            💸 Concession Applied
          </p>
          <p className="text-xs text-green-600">
            {concessionInfo.discount_type === "percent"
              ? `${concessionInfo.discount_value}% discount`
              : `₹${concessionInfo.discount_value} off`}
            {concessionInfo.reason ? ` — ${concessionInfo.reason}` : ""}
          </p>
          {netAmount && amount && (
            <p className="text-xs text-green-700 font-bold mt-1">
              Net Payable: ₹{netAmount}
            </p>
          )}
        </div>
      )}

      <input type="hidden" name="net_amount" value={netAmount || amount} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Month
          </label>
          <select
            name="month"
            defaultValue={currentMonth}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select...</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year
          </label>
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
            <span className="text-gray-400 font-normal text-xs ml-1">
              (empty = pending)
            </span>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Mode{" "}
          <span className="text-gray-400 font-normal text-xs">(if paid)</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {["cash", "online", "upi", "cheque"].map((mode) => (
            <label
              key={mode}
              className="flex items-center justify-center border border-gray-300 rounded-lg px-2 py-2 text-xs font-medium cursor-pointer has-[:checked]:bg-indigo-600 has-[:checked]:text-white has-[:checked]:border-indigo-600"
            >
              <input
                type="radio"
                name="payment_mode"
                value={mode}
                defaultChecked={mode === "cash"}
                className="sr-only"
              />
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Receipt No.
        </label>
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
          disabled={submitting}
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Save Payment"}
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