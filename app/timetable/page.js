export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { timetable, students } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function TimetablePage({ searchParams }) {
  const params = await searchParams;
  const selectedClass = params?.class || "";

  const allStudents = await db.select().from(students);
  const classes = [...new Set(allStudents.map((s) => s.class))].sort();

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let schedule = [];
  if (selectedClass) {
    schedule = await db.select().from(timetable).where(eq(timetable.class, selectedClass));
  }

  const scheduleMap = {};
  days.forEach((day) => { scheduleMap[day] = {}; });
  schedule.forEach((entry) => {
    if (!scheduleMap[entry.day]) scheduleMap[entry.day] = {};
    scheduleMap[entry.day][entry.period] = entry;
  });

  const maxPeriods = schedule.length > 0 ? Math.max(...schedule.map((s) => s.period)) : 8;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-500 text-sm mt-1">Class-wise weekly schedule</p>
        </div>
        {selectedClass && (
          <Link href={`/timetable/add?class=${selectedClass}`}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
            + Add Period
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <form className="flex gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Select Class</label>
            <select name="class" defaultValue={selectedClass}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">-- Select Class --</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button type="submit"
            className="bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-gray-700">
            Show
          </button>
        </form>
      </div>

      {!selectedClass ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          Please select a class to view its timetable.
        </div>
      ) : schedule.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          No timetable found for {selectedClass}.{" "}
          <Link href={`/timetable/add?class=${selectedClass}`} className="text-indigo-600 hover:underline">
            Add periods
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                {Array.from({ length: maxPeriods }, (_, i) => (
                  <th key={i + 1} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Period {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {days.map((day) => (
                <tr key={day} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{day}</td>
                  {Array.from({ length: maxPeriods }, (_, i) => {
                    const entry = scheduleMap[day]?.[i + 1];
                    return (
                      <td key={i + 1} className="px-4 py-3 text-center">
                        {entry ? (
                          <div className="bg-indigo-50 rounded-lg p-2">
                            <div className="text-xs font-semibold text-indigo-700">{entry.subject}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{entry.teacher_name}</div>
                            <div className="text-xs text-gray-400">{entry.start_time}–{entry.end_time}</div>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}