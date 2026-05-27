"use client";

import { useState } from "react";

export default function AttendanceSnapshot({
  staffPresentList,
  staffAbsentList,
  classMap,
  classList,
}) {
  const [openStaff, setOpenStaff] = useState(null); // "present" | "absent" | null
  const [selectedClass, setSelectedClass] = useState("");

  const staffMarked =
    staffPresentList.length > 0 || staffAbsentList.length > 0;

  return (
    <div>
      {/* Staff Attendance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">
          Today's Staff Attendance
        </h2>
        {!staffMarked ? (
          <p className="text-xs text-gray-400">
            Staff attendance not marked yet for today.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setOpenStaff(openStaff === "present" ? null : "present")
              }
              className="bg-green-50 rounded-lg px-3 py-3 text-left"
            >
              <p className="text-xs font-semibold text-green-700">
                Present ({staffPresentList.length})
              </p>
              <p className="text-[10px] text-green-600 mt-0.5">
                {openStaff === "present" ? "Tap to hide" : "Tap to view names"}
              </p>
              {openStaff === "present" && (
                <div className="mt-2 space-y-0.5">
                  {staffPresentList.length === 0 ? (
                    <p className="text-xs text-gray-400">—</p>
                  ) : (
                    staffPresentList.map((n, i) => (
                      <p key={i} className="text-xs text-gray-800">
                        {n}
                      </p>
                    ))
                  )}
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                setOpenStaff(openStaff === "absent" ? null : "absent")
              }
              className="bg-red-50 rounded-lg px-3 py-3 text-left"
            >
              <p className="text-xs font-semibold text-red-600">
                Absent ({staffAbsentList.length})
              </p>
              <p className="text-[10px] text-red-500 mt-0.5">
                {openStaff === "absent" ? "Tap to hide" : "Tap to view names"}
              </p>
              {openStaff === "absent" && (
                <div className="mt-2 space-y-0.5">
                  {staffAbsentList.length === 0 ? (
                    <p className="text-xs text-gray-400">—</p>
                  ) : (
                    staffAbsentList.map((n, i) => (
                      <p key={i} className="text-xs text-gray-800">
                        {n}
                      </p>
                    ))
                  )}
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Class-wise Student Attendance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">
          Today's Attendance — Class-wise
        </h2>
        {classList.length === 0 ? (
          <p className="text-xs text-gray-400">
            Attendance not marked yet for today.
          </p>
        ) : (
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select class to view names...</option>
              {classList.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls} — Present {classMap[cls].present.length}, Absent{" "}
                  {classMap[cls].absent.length}
                </option>
              ))}
            </select>

            {selectedClass && classMap[selectedClass] && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-1">
                    Present ({classMap[selectedClass].present.length})
                  </p>
                  {classMap[selectedClass].present.length === 0 ? (
                    <p className="text-xs text-gray-400">—</p>
                  ) : (
                    classMap[selectedClass].present.map((n, i) => (
                      <p key={i} className="text-xs text-gray-800">
                        {n}
                      </p>
                    ))
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-600 mb-1">
                    Absent ({classMap[selectedClass].absent.length})
                  </p>
                  {classMap[selectedClass].absent.length === 0 ? (
                    <p className="text-xs text-gray-400">—</p>
                  ) : (
                    classMap[selectedClass].absent.map((n, i) => (
                      <p key={i} className="text-xs text-gray-800">
                        {n}
                      </p>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}