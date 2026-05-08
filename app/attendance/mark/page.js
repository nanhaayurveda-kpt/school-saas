export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students, attendance } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { setFlash } from "@/lib/flash";
import { saveAttendance } from '@/app/actions'

export default async function MarkAttendancePage({ searchParams }) {
  const params = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = params?.date || today;
  const selectedClass = params?.class || "";

  const allStudents = await db.select().from(students);
  const classes = [...new Set(allStudents.map((s) => s.class).filter(Boolean))].sort((a, b) => {
    const na = parseInt(a), nb = parseInt(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });

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

      {/* Filter Form */}
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

      {/* Already marked warning */}
      {alreadyMarked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 text-xs text-yellow-800">
          ⚠️ इस date की attendance पहले से mark है — नीचे changes करके फिर Save करें।
          <span className="ml-2 font-semibold">P: {presentCount} · A: {absentCount}</span>
        </div>
      )}

      {/* Attendance Form */}
      <form action={saveAttendance}>
        <input type="hidden" name="date" value={selectedDate} />

        {/* Mark All buttons */}
        {sortedKeys.length > 0 && (
          <div className="flex gap-2 mb-3">
            <button type="button"
              onClick={() => {
                document.querySelectorAll('input[name="present"]').forEach(cb => cb.checked = true);
              }}
              className="flex-1 bg-green-50 border border-green-200 text-green-700 py-2 rounded-lg text-xs font-medium">
              ✅ सभी Present
            </button>
            <button type="button"
              onClick={() => {
                document.querySelectorAll('input[name="present"]').forEach(cb => cb.checked = false);
              }}
              className="flex-1 bg-red-50 border border-red-200 text-red-700 py-2 rounded-lg text-xs font-medium">
              ❌ सभी Absent
            </button>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {sortedKeys.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
              No students found.
            </div>
          ) : sortedKeys.map((key) => {
            const { cls, sec, students: secStudents } = grouped[key];
            const sorted = [...secStudents].sort((a, b) => {
              const ra = parseInt(a.roll_number), rb = parseInt(b.roll_number);
              if (!isNaN(ra) && !isNaN(rb)) return ra - rb;
              return (a.name || "").localeCompare(b.name || "");
            });
            return (
              <div key={key} className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
                <div className="bg-indigo-600 px-4 py-2.5 flex justify-between items-center">
                  <span className="text-white font-bold text-sm">Class {cls} — Section {sec}</span>
                  <span className="bg-white text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {secStudents.length} students
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {sorted.map((student) => (
                    <div key={student.id} className="px-4 py-3 flex justify-between items-center">
                      <div className="flex items-center gap-3 min-w-0">
                        <input type="hidden" name="student_id" value={student.id} />
                        <input
                          type="checkbox"
                          name="present"
                          value={String(student.id)}
                          defaultChecked={attendanceMap[student.id] === "present"}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                          <p className="text-xs text-gray-400">Roll {student.roll_number || "—"}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${
                        attendanceMap[student.id] === "present" ? "bg-green-100 text-green-700" :
                        attendanceMap[student.id] === "absent" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-400"
                      }`}>
                        {attendanceMap[student.id] === "present" ? "✓ Present" :
                         attendanceMap[student.id] === "absent" ? "✗ Absent" : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {sortedKeys.length > 0 && (
          <button type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 text-sm font-medium">
            Save Attendance
          </button>
        )}
      </form>
    </div>
  );
}