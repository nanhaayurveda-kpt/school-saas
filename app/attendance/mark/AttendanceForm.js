"use client";

import { useState } from "react";

export default function AttendanceForm({
  selectedDate,
  attendanceMap,
  sortedKeys,
  grouped,
}) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      method="POST"
      action="/api/attendance/save"
      onSubmit={() => setSubmitting(true)}
    >
      <input type="hidden" name="date" value={selectedDate} />

      <div className="space-y-4 mb-6">
        {sortedKeys.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
            No students found.
          </div>
        ) : (
          sortedKeys.map((key) => {
            const { cls, sec, students: secStudents } = grouped[key];
            const sorted = [...secStudents].sort((a, b) => {
              const ra = parseInt(a.roll_number),
                rb = parseInt(b.roll_number);
              if (!isNaN(ra) && !isNaN(rb)) return ra - rb;
              return (a.name || "").localeCompare(b.name || "");
            });
            return (
              <div
                key={key}
                className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden"
              >
                <div className="bg-indigo-600 px-4 py-2.5 flex justify-between items-center">
                  <span className="text-white font-bold text-sm">
                    Class {cls} — Section {sec}
                  </span>
                  <span className="bg-white text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {secStudents.length} students
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {sorted.map((student) => {
                    const status = attendanceMap[student.id];
                    const defaultPresent = status !== "absent";
                    return (
                      <div
                        key={student.id}
                        className="px-4 py-3 flex justify-between items-center gap-3"
                      >
                        <input
                          type="hidden"
                          name="student_id"
                          value={student.id}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Roll {student.roll_number || "—"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <label className="flex items-center gap-1.5 text-sm">
                            <input
                              type="radio"
                              name={`status_${student.id}`}
                              value="present"
                              defaultChecked={defaultPresent}
                              className="w-4 h-4 accent-green-600"
                            />
                            <span className="text-green-700 font-medium">
                              Present
                            </span>
                          </label>
                          <label className="flex items-center gap-1.5 text-sm">
                            <input
                              type="radio"
                              name={`status_${student.id}`}
                              value="absent"
                              defaultChecked={status === "absent"}
                              className="w-4 h-4 accent-red-500"
                            />
                            <span className="text-red-600 font-medium">
                              Absent
                            </span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {sortedKeys.length > 0 && (
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Save Attendance"}
        </button>
      )}
    </form>
  );
}