export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students, attendance } from "@/lib/schema";
import { eq } from "drizzle-orm";
import AttendanceForm from './AttendanceForm'

export default async function MarkAttendancePage({ searchParams }) {
  const params = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = params?.date || today;
  const selectedClass = params?.class || "";

  const allStudents = await db.select().from(students);
  const classes = ["Nursery","KG","1","2","3","4","5","6","7","8","9","10","11","12"];

  const filteredStudents = selectedClass
    ? allStudents.filter((s) => s.class === selectedClass)
    : allStudents;

  const existing = await db.select().from(attendance).where(eq(attendance.date, selectedDate));
  const attendanceMap = {};
  existing.forEach((a) => { attendanceMap[a.student_id] = a.status; });

  const alreadyMarked = existing.length > 0;

  const grouped = {};
  filteredStudents.forEach((s) => {
    const cls = s.class || "—";
    const sec = s.section || "—";
    const key = `${cls}||${sec}`;
    if (!grouped[key]) grouped[key] = { cls, sec, students: [] };
    grouped[key].students.push(s);
  });

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const [ac, as_] = a.split("||");
    const [bc, bs] = b.split("||");
    const nc = parseInt(ac) - parseInt(bc);
    if (!isNaN(nc) && nc !== 0) return nc;
    return as_.localeCompare(bs);
  });

  const presentCount = filteredStudents.filter((s) => attendanceMap[s.id] === "present").length;
  const absentCount = filteredStudents.filter((s) => attendanceMap[s.id] === "absent").length;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 text-xs mt-0.5">{selectedDate}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <form className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input type="date" name="date" defaultValue={selectedDate}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Class</label>
              <select name="class" defaultValue={selectedClass}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Classes</option>
                {classes.map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium">
            Filter
          </button>
        </form>
      </div>

      {alreadyMarked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 text-xs text-yellow-800">
          ⚠️ Attendance already marked for this date — edit below and save again.
          <span className="ml-2 font-semibold">P: {presentCount} · A: {absentCount}</span>
        </div>
      )}

      <AttendanceForm
        selectedDate={selectedDate}
        attendanceMap={attendanceMap}
        sortedKeys={sortedKeys}
        grouped={grouped}
      />
    </div>
  );
}