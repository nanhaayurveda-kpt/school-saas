// app/students/[id]/page.js

export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StudentDetailPage({ params }) {
  const { id } = await params;

  const result = await db.select().from(students).where(eq(students.id, Number(id)));
  if (result.length === 0) notFound();
  const s = result[0];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
          <p className="text-gray-500 text-sm mt-1">{s.name}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/students/${id}/edit`}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium">
            Edit
          </Link>
          <Link href="/students"
            className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium">
            ← Back
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Full Name</p>
            <p className="text-gray-900 font-medium">{s.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Roll Number</p>
            <p className="text-gray-900 font-medium">{s.roll_number || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Class</p>
            <p className="text-gray-900 font-medium">{s.class} — {s.section}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Fee Status</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
              s.fee_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {s.fee_status}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Parent Name</p>
            <p className="text-gray-900 font-medium">{s.parent_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Parent Phone</p>
            <p className="text-gray-900 font-medium">{s.parent_phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Admission Date</p>
            <p className="text-gray-900 font-medium">
              {s.admission_date ? new Date(s.admission_date).toLocaleDateString("en-IN") : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Admission No.</p>
            <p className="text-gray-900 font-medium">{s.admission_no || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Gender</p>
            <p className="text-gray-900 font-medium">{s.gender || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Date of Birth</p>
            <p className="text-gray-900 font-medium">{s.dob || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Mother Name</p>
            <p className="text-gray-900 font-medium">{s.mother_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Aadhaar No.</p>
            <p className="text-gray-900 font-medium">{s.aadhaar || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Religion</p>
            <p className="text-gray-900 font-medium">{s.religion || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Caste</p>
            <p className="text-gray-900 font-medium">{s.caste || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Academic Year</p>
            <p className="text-gray-900 font-medium">{s.academic_year || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Address</p>
            <p className="text-gray-900 font-medium">{s.address || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}