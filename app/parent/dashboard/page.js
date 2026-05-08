export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { parents, students, fees, attendance, results, exams } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ParentDashboardPage() {
  const cookieStore = await cookies();
  const parentSession = cookieStore.get("parent_session")?.value;

  if (!parentSession) redirect("/parent/login");

  const parentResult = await db.select().from(parents).where(eq(parents.id, parseInt(parentSession)));
  if (parentResult.length === 0) redirect("/parent/login");
  const parent = parentResult[0];

  const studentResult = await db.select().from(students).where(eq(students.id, parent.student_id));
  if (studentResult.length === 0) redirect("/parent/login");
  const student = studentResult[0];

  const studentFees = await db.select().from(fees)
    .where(eq(fees.student_id, student.id))
    .orderBy(desc(fees.due_date));

  const pendingFees = studentFees.filter((f) => f.status === "pending");

  const recentAttendance = await db.select().from(attendance)
    .where(eq(attendance.student_id, student.id))
    .orderBy(desc(attendance.date))
    .limit(30);

  const presentCount = recentAttendance.filter((a) => a.status === "present").length;
  const absentCount = recentAttendance.filter((a) => a.status === "absent").length;

  const studentResults = await db
    .select({
      marks_obtained: results.marks_obtained,
      grade: results.grade,
      exam_name: exams.name,
      subject: exams.subject,
      max_marks: exams.max_marks,
      exam_date: exams.exam_date,
    })
    .from(results)
    .leftJoin(exams, eq(results.exam_id, exams.id))
    .where(eq(results.student_id, student.id))
    .orderBy(desc(exams.exam_date));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-900 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <div className="text-xl font-bold">निशांत स्कूल</div>
          <div className="text-indigo-300 text-xs">अभिभावक पोर्टल</div>
        </div>
        <a href="/api/parent-logout"
          className="text-indigo-300 hover:text-white text-sm">
          🚪 Logout
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">🎓</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-500 text-sm">{student.class}{student.section && ` — ${student.section}`}</p>
              <p className="text-gray-400 text-xs mt-0.5">Roll No: {student.roll_number || "—"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-red-500">
              ₹{pendingFees.reduce((s, f) => s + f.amount, 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Pending Fees</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <div className="text-xs text-gray-500 mt-1">Present (Last 30 days)</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-red-400">{absentCount}</div>
            <div className="text-xs text-gray-500 mt-1">Absent (Last 30 days)</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">💰 Fee Details</h2>
          {studentFees.length === 0 ? (
            <p className="text-sm text-gray-400">No fee records found.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentFees.map((fee) => (
                  <tr key={fee.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{fee.amount}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(fee.due_date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {fee.paid_date ? new Date(fee.paid_date).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        fee.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {fee.status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">✅ Recent Attendance (Last 30 days)</h2>
          {recentAttendance.length === 0 ? (
            <p className="text-sm text-gray-400">No attendance records found.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recentAttendance.map((a) => (
                <div key={a.id} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  a.status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {a.date}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">📝 Exam Results</h2>
          {studentResults.length === 0 ? (
            <p className="text-sm text-gray-400">No results found.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentResults.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.exam_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.marks_obtained} / {r.max_marks}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.grade === "A+" || r.grade === "A" ? "bg-green-100 text-green-700" :
                        r.grade === "B" ? "bg-blue-100 text-blue-700" :
                        r.grade === "C" ? "bg-yellow-100 text-yellow-700" :
                        r.grade === "D" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {r.grade || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}