// app/transport/students/add/page.js

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { transport, student_transport, students } from "@/lib/schema";
import { setFlash } from "@/lib/flash";
import { assignStudent } from '@/app/actions'

export default async function AssignTransportPage() {
  const allStudents = await db
    .select()
    .from(students)
    .orderBy(students.class, students.name);

  const allRoutes = await db
    .select()
    .from(transport)
    .orderBy(transport.route_name);

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const baseYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const academicYear = `${baseYear}-${String(baseYear + 1).slice(-2)}`;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Assign Transport</h1>
        <p className="text-gray-500 text-xs mt-0.5">Student को route assign करें</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form action={assignStudent} className="space-y-4">

          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student <span className="text-red-500">*</span>
            </label>
            <select
              name="student_id"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select student...</option>
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — Class {s.class} {s.section || ""}
                  {s.roll_number ? ` · Roll ${s.roll_number}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Route */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route / Stop <span className="text-red-500">*</span>
            </label>
            {allRoutes.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5 text-sm text-yellow-700">
                कोई route नहीं है।{" "}
                <a href="/transport/add" className="font-medium underline">
                  पहले route add करें
                </a>
              </div>
            ) : (
              <select
                name="transport_id"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select route...</option>
                {allRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.route_name} — {r.stop_name} · ₹{r.monthly_fee}/mo
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Academic Year & Joined Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                name="academic_year"
                defaultValue={academicYear}
                placeholder="e.g. 2024-25"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joined Date
              </label>
              <input
                type="date"
                name="joined_date"
                defaultValue={today}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium"
            >
              Assign
            </button>
            <a
              href="/transport"
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}