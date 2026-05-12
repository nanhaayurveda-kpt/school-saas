export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students, fee_concessions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteStudent, addConcession, deleteConcession } from "@/app/actions";

export default async function StudentDetailPage({ params }) {
  const { id } = await params;

  const result = await db.select().from(students).where(eq(students.id, Number(id)));
  if (result.length === 0) notFound();
  const s = result[0];

  const concessions = await db.select().from(fee_concessions).where(eq(fee_concessions.student_id, Number(id)));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Student Details</h1>
          <p className="text-gray-500 text-sm mt-1">{s.name}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/students/${id}/edit`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Edit</Link>
          <form action={deleteStudent}>
            <input type="hidden" name="id" value={s.id} />
            <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Delete</button>
          </form>
          <Link href="/students" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">← Back</Link>
        </div>
      </div>

      {/* Student Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Full Name</p><p className="text-gray-900 font-medium">{s.name}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Roll Number</p><p className="text-gray-900 font-medium">{s.roll_number || "—"}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Class</p><p className="text-gray-900 font-medium">{s.class} — {s.section}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Fee Status</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${s.fee_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{s.fee_status}</span>
          </div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Father Name</p><p className="text-gray-900 font-medium">{s.father_name || "—"}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Phone</p><p className="text-gray-900 font-medium">{s.phone || "—"}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Admission Date</p><p className="text-gray-900 font-medium">{s.admission_date ? new Date(s.admission_date).toLocaleDateString("en-IN") : "—"}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Admission No.</p><p className="text-gray-900 font-medium">{s.admission_no || "—"}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Gender</p><p className="text-gray-900 font-medium">{s.gender || "—"}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Date of Birth</p><p className="text-gray-900 font-medium">{s.dob || "—"}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Mother Name</p><p className="text-gray-900 font-medium">{s.mother_name || "—"}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Aadhaar No.</p><p className="text-gray-900 font-medium">{s.aadhaar || "—"}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Religion</p><p className="text-gray-900 font-medium">{s.religion || "—"}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Caste</p><p className="text-gray-900 font-medium">{s.caste || "—"}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Academic Year</p><p className="text-gray-900 font-medium">{s.academic_year || "—"}</p></div>
          <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Address</p><p className="text-gray-900 font-medium">{s.address || "—"}</p></div>
        </div>
      </div>

      {/* Fee Concession */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <h2 className="text-sm font-bold text-gray-900 mb-4">💸 Fee Concession</h2>

        {concessions.length > 0 ? (
          <div className="space-y-2 mb-4">
            {concessions.map((c) => (
              <div key={c.id} className="flex justify-between items-center bg-green-50 border border-green-100 rounded-lg px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {c.discount_type === "percent" ? `${c.discount_value}% discount` : `₹${c.discount_value} off`}
                  </p>
                  {c.reason && <p className="text-xs text-gray-500 mt-0.5">{c.reason}</p>}
                </div>
                <form action={deleteConcession}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="student_id" value={s.id} />
                  <button type="submit" className="text-xs text-red-500 font-medium">Remove</button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-4">No concession set.</p>
        )}

        <form action={addConcession} className="space-y-3">
          <input type="hidden" name="student_id" value={s.id} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select name="discount_type" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="amount">Fixed Amount (₹)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
              <input type="number" name="discount_value" required min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
            <input type="text" name="reason" placeholder="e.g. Staff child, Merit, Poor family" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium">Add Concession</button>
        </form>
      </div>
    </div>
  );
}