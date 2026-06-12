"use client";

import { useState } from "react";

export default function PromoteForm({
  classes,
  classCounts,
  nextAcademicYear,
  students,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [fromCls, setFromCls] = useState("");

  const fromIndex = classes.indexOf(fromCls);
  const toCls =
    fromIndex >= 0 && fromIndex < classes.length - 1
      ? classes[fromIndex + 1]
      : "";
  const isFinalClass = fromCls && !toCls;
  const fromStudents = fromCls
    ? students.filter((s) => s.class === fromCls)
    : [];

  // students के मौजूदा academic year से +1 (जैसे 2025-26 → 2026-27)
  let suggestedYear = nextAcademicYear;
  const currentAY = fromStudents.find((s) => s.academic_year)?.academic_year;
  if (currentAY) {
    const startYear = parseInt(currentAY.slice(0, 4), 10);
    if (!isNaN(startYear)) {
      suggestedYear = `${startYear + 1}-${String(startYear + 2).slice(-2)}`;
    }
  }

  function handleSubmit(e) {
    if (!toCls) {
      e.preventDefault();
      return;
    }
    const fd = new FormData(e.currentTarget);
    const ids = fd.getAll("student_ids");
    if (ids.length === 0) {
      alert("Select at least one student to promote.");
      e.preventDefault();
      return;
    }
    if (
      !confirm(
        `Promote ${ids.length} of ${fromStudents.length} students: Class ${fromCls} → Class ${toCls}? This cannot be undone.`,
      )
    ) {
      e.preventDefault();
      return;
    }
    setSubmitting(true);
  }

  return (
    <form
      method="POST"
      action="/api/students/promote"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          From Class <span className="text-red-500">*</span>
        </label>
        <select
          name="from_class"
          required
          value={fromCls}
          onChange={(e) => setFromCls(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select class to promote...</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              Class {c} ({classCounts[c] || 0} students)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          To Class <span className="text-red-500">*</span>
        </label>
        <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-700">
          {toCls ? `Class ${toCls}` : isFinalClass ? "—" : "Select From class first"}
        </div>
        <input type="hidden" name="to_class" value={toCls} />
        {isFinalClass && (
          <p className="text-xs text-red-500 mt-1">
            Class 12 is the final class — students pass out, they are not
            promoted.
          </p>
        )}
      </div>

      {fromCls && toCls && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Students to Promote{" "}
            <span className="text-gray-400 font-normal text-xs">
              (fail/detain हुए students का ✓ हटा दो)
            </span>
          </label>
          {fromStudents.length === 0 ? (
            <div className="border border-gray-200 rounded-lg px-3 py-4 text-center text-xs text-gray-400">
              No students in Class {fromCls}.
            </div>
          ) : (
            <div
              key={fromCls}
              className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto"
            >
              {fromStudents.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    name="student_ids"
                    value={s.id}
                    defaultChecked
                    className="accent-indigo-600 w-4 h-4"
                  />
                  <span>
                    {s.name}
                    {s.roll_number ? ` · Roll ${s.roll_number}` : ""}
                    {s.section ? ` · Sec ${s.section}` : ""}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Academic Year <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="new_academic_year"
          required
          key={suggestedYear}
          defaultValue={suggestedYear}
          placeholder="e.g. 2026-27"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !toCls}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting
          ? "Promoting..."
          : toCls
            ? `Promote to Class ${toCls} →`
            : "Promote Students →"}
      </button>
    </form>
  );
}