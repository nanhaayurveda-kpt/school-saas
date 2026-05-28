"use client";

import { useState, useMemo } from "react";

const FEE_TYPES = [
  { value: "monthly", label: "Monthly Fee" },
  { value: "admission", label: "Admission Fee" },
  { value: "exam", label: "Exam Fee" },
  { value: "transport", label: "Transport Fee" },
  { value: "misc", label: "Miscellaneous" },
];

export default function PackageForm({ feeStructures, currentAcademicYear }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [academicYear, setAcademicYear] = useState(currentAcademicYear);
  const [checkedTypes, setCheckedTypes] = useState({});
  const [amounts, setAmounts] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const months = [
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December", "January", "February", "March",
  ];

  // Classes from fee_structures
  const classOptions = useMemo(() => {
    const set = new Set(feeStructures.map((s) => s.class));
    return [...set].sort((a, b) => {
      const na = parseInt(a), nb = parseInt(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [feeStructures]);

  // When class changes, auto-fill amounts from fee_structures
  function handleClassChange(e) {
    const cls = e.target.value;
    setSelectedClass(cls);
    setCheckedTypes({});
    const newAmounts = {};
    feeStructures
      .filter((s) => s.class === cls)
      .forEach((s) => {
        newAmounts[s.fee_type] = s.amount;
      });
    setAmounts(newAmounts);
  }

  function handleCheck(feeType) {
    setCheckedTypes((prev) => ({
      ...prev,
      [feeType]: !prev[feeType],
    }));
  }

  function handleAmountChange(feeType, val) {
    setAmounts((prev) => ({ ...prev, [feeType]: val }));
  }

  const total = useMemo(() => {
    return FEE_TYPES.filter((ft) => checkedTypes[ft.value])
      .reduce((sum, ft) => sum + (parseInt(amounts[ft.value]) || 0), 0);
  }, [checkedTypes, amounts]);

  const checkedCount = FEE_TYPES.filter((ft) => checkedTypes[ft.value]).length;

  return (
    <form
      method="POST"
      action="/api/fee-structure/packages/add"
      onSubmit={() => setSubmitting(true)}
      className="space-y-4"
    >
      {/* Class */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Class <span className="text-red-500">*</span>
        </label>
        <select
          name="class"
          required
          value={selectedClass}
          onChange={handleClassChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select class...</option>
          {classOptions.map((c) => (
            <option key={c} value={c}>Class {c}</option>
          ))}
        </select>
      </div>

      {/* Month & Academic Year */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Month <span className="text-red-500">*</span>
          </label>
          <select
            name="month"
            required
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select...</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="academic_year"
            required
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Fee Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fee Types <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {FEE_TYPES.map((ft) => (
            <div
              key={ft.value}
              className={`border rounded-lg px-3 py-2.5 flex items-center gap-3 ${
                checkedTypes[ft.value]
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <input
                type="checkbox"
                id={ft.value}
                checked={!!checkedTypes[ft.value]}
                onChange={() => handleCheck(ft.value)}
                className="w-4 h-4 accent-indigo-600"
              />
              <label
                htmlFor={ft.value}
                className="flex-1 text-sm font-medium text-gray-700 cursor-pointer"
              >
                {ft.label}
              </label>
              {checkedTypes[ft.value] && (
                <>
                  <input type="hidden" name={`fee_type_${ft.value}`} value={ft.value} />
                  <input
                    type="number"
                    name={`amount_${ft.value}`}
                    value={amounts[ft.value] || ""}
                    onChange={(e) => handleAmountChange(ft.value, e.target.value)}
                    min="1"
                    required
                    placeholder="₹"
                    className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </>
              )}
              {!checkedTypes[ft.value] && amounts[ft.value] && (
                <span className="text-xs text-gray-400">₹{amounts[ft.value]}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      {checkedCount > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-medium text-indigo-700">
            Total ({checkedCount} types)
          </span>
          <span className="text-lg font-bold text-indigo-700">₹{total}</span>
        </div>
      )}

      <input type="hidden" name="total_amount" value={total} />

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || checkedCount === 0 || !selectedClass || !selectedMonth}
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Save Package"}
        </button>
        <a
          href="/fee-structure?tab=packages"
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}