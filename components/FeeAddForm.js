"use client";

import { useState, useMemo } from "react";

export default function FeeAddForm({
  allStudents,
  feeStructures,
  concessions,
  today,
  currentMonth,
  currentAcademicYear,
  months,
}) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedFeeType, setSelectedFeeType] = useState("monthly");
  const [amount, setAmount] = useState("");
  const [concessionInfo, setConcessionInfo] = useState(null);
  const [netAmount, setNetAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Unique classes from all students
  const classOptions = useMemo(() => {
    const set = new Set(allStudents.map((s) => s.class));
    return [...set].sort((a, b) => {
      const na = parseInt(a), nb = parseInt(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [allStudents]);

  // Sections available for selected class
  const sectionOptions = useMemo(() => {
    if (!selectedClass) return [];
    const set = new Set(
      allStudents
        .filter((s) => s.class === selectedClass && s.section)
        .map((s) => s.section)
    );
    return [...set].sort();
  }, [allStudents, selectedClass]);

  // Filtered students based on class + section
  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      if (selectedClass && s.class !== selectedClass) return false;
      if (selectedSection && s.section !== selectedSection) return false;
      return true;
    });
  }, [allStudents, selectedClass, selectedSection]);

  function handleClassChange(e) {
    setSelectedClass(e.target.value);
    setSelectedSection("");
    setSelectedStudentId("");
    setAmount("");
    setNetAmount("");
    setConcessionInfo(null);
  }

  function handleSectionChange(e) {
    setSelectedSection(e.target.value);
    setSelectedStudentId("");
    setAmount("");
    setNetAmount("");
    setConcessionInfo(null);
  }

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
      (fs) => fs.class === student.class && fs.fee_type === feeType
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
      {/* Class & Section Filter Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedClass}
            onChange={handleClassChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select class...</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section
          </label>
          <select
            value={selectedSection}
            onChange={handleSectionChange}
            disabled={!selectedClass}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">All Sections</option>
            {sectionOptions.map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Dropdown (filtered) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Student <span className="text-red-500">*</span>
        </label>
        <select
          name="student_id"
          required
          value={selectedStudentId}
          onChange={handleStudentChange}
          disabled={!selectedClass}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">
            {selectedClass ? "Select student..." : "Select class first"}
          </option>
          {filteredStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — Class {s.class} {s.section || ""}
            </option>
          ))}
        </select>
        {selectedClass && filteredStudents.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            No students found for this class/section.
          </p>
        )}
      </div>

      {/* Amount & Fee Type */}
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

      {/* Concession Banner */}
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

      {/* Month & Academic Year */}
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

      {/* Due Date & Paid Date */}
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

      {/* Payment Mode */}
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

      {/* Receipt No */}
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

      {/* Submit */}
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