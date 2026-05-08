// app/students/[id]/edit/page.js

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { db } from "@/lib/db-drizzle";
import { students } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { setFlash } from "@/lib/flash";
import { updateStudent } from "@/app/actions";

export default async function EditStudentPage({ params }) {
  const { id } = await params;

  const result = await db
    .select()
    .from(students)
    .where(eq(students.id, Number(id)));
  if (result.length === 0) notFound();
  const s = result[0];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
        <p className="text-gray-500 text-sm mt-1">{s.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <form action={updateStudent} className="space-y-6">
          <input type="hidden" name="id" value={s.id} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={s.name}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="class"
                required
                defaultValue={s.class}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="section"
                required
                defaultValue={s.section}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="roll_number"
              required
              defaultValue={s.roll_number}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission No.
            </label>
            <input
              type="text"
              name="admission_no"
              defaultValue={s.admission_no || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                defaultValue={s.gender || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                defaultValue={s.dob || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Father Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="father_name"
                required
                defaultValue={s.father_name}
                
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mother Name
              </label>
              <input
                type="text"
                name="mother_name"
                defaultValue={s.mother_name || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
              <input type="text" name="guardian_name" defaultValue={s.guardian_name || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input type="tel" name="phone" required defaultValue={s.phone}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aadhaar No.
              </label>
              <input
                type="text"
                name="aadhaar"
                defaultValue={s.aadhaar || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Religion
              </label>
              <input
                type="text"
                name="religion"
                defaultValue={s.religion || ""}
                placeholder="e.g. Hindu"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caste
              </label>
              <input
                type="text"
                name="caste"
                defaultValue={s.caste || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              rows={2}
              defaultValue={s.address || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <input
              type="text"
              name="academic_year"
              defaultValue={s.academic_year || ""}
              placeholder="e.g. 2024-25"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee Status
            </label>
            <select
              name="fee_status"
              defaultValue={s.fee_status}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Portal Password
              <span className="text-gray-400 font-normal ml-1">
                (leave empty to keep existing)
              </span>
            </label>
            <input
              type="text"
              name="password"
              placeholder="Set new password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium"
            >
              Update Student
            </button>
            <a
              href={`/students/${s.id}`}
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
