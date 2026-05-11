export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { teachers, teacher_attendance } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";

export default async function TeacherAttendancePage({ searchParams }) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");

  const params = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = params?.date || today;

  const allTeachers = await db.select().from(teachers);

  const existing = await db
    .select()
    .from(teacher_attendance)
    .where(eq(teacher_attendance.date, selectedDate));

  const attendanceMap = {};
  existing.forEach((a) => {
    attendanceMap[a.teacher_id] = { status: a.status, note: a.note };
  });

  const alreadyMarked = existing.length > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Teacher Attendance</h1>
          <p className="text-gray-500 text-xs mt-0.5">{selectedDate}</p>
        </div>
        <Link href="/dashboard" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
          ← Back
        </Link>
      </div>

      {/* Date Filter */}
      <form className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              name="date"
              defaultValue={selectedDate}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Filter
          </button>
        </div>
      </form>

      {alreadyMarked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 text-xs text-yellow-800">
          ⚠️ Attendance already marked for this date. Submitting again will update it.
        </div>
      )}

      {allTeachers.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">No teachers found.</p>
      ) : (
        <form action="/api/teacher-attendance/save" method="POST">
          <input type="hidden" name="date" value={selectedDate} />
          <div className="space-y-3 mb-5">
            {allTeachers.map((t) => {
              const current = attendanceMap[t.id];
              return (
                <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.phone || "—"}</p>
                    </div>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="radio"
                          name={`status_${t.id}`}
                          value="present"
                          defaultChecked={!current || current.status === "present"}
                          className="accent-green-600"
                        />
                        <span className="text-green-700 font-medium">Present</span>
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="radio"
                          name={`status_${t.id}`}
                          value="absent"
                          defaultChecked={current?.status === "absent"}
                          className="accent-red-600"
                        />
                        <span className="text-red-600 font-medium">Absent</span>
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="radio"
                          name={`status_${t.id}`}
                          value="half_day"
                          defaultChecked={current?.status === "half_day"}
                          className="accent-yellow-500"
                        />
                        <span className="text-yellow-600 font-medium">Half</span>
                      </label>
                    </div>
                  </div>
                  <input
                    type="text"
                    name={`note_${t.id}`}
                    defaultValue={current?.note || ""}
                    placeholder="Note (optional)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              );
            })}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition text-sm"
          >
            Save Attendance
          </button>
        </form>
      )}
    </div>
  );
}