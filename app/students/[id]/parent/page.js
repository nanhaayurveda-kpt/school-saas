export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students, parents } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { setFlash } from "@/lib/flash";
import { saveParent } from '@/app/actions'

export default async function CreateParentPage({ params }) {
  const { id } = await params;

  const result = await db.select().from(students).where(eq(students.id, parseInt(id)));
  if (result.length === 0) notFound();
  const student = result[0];

  const parentResult = await db.select().from(parents).where(eq(parents.student_id, student.id));
  const existingParent = parentResult[0] || null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Parent Account</h1>
        <p className="text-gray-500 text-sm mt-1">{student.name} — {student.class}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-lg">
        {existingParent && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 mb-6">
            ✅ Parent account already exists. Update details below if needed.
          </div>
        )}

        <form action={saveParent} className="space-y-5">
          <input type="hidden" name="student_id" value={student.id} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Name <span className="text-red-500">*</span>
            </label>
            <input type="text" name="name" required
              defaultValue={existingParent?.name || student.parent_name || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(used for login)</span>
            </label>
            <input type="tel" name="phone" required
              defaultValue={existingParent?.phone || student.parent_phone || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email"
              defaultValue={existingParent?.email || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(share this with the parent)</span>
            </label>
            <input type="text" name="password" required
              defaultValue={existingParent?.password || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium">
              {existingParent ? "Update Account" : "Create Account"}
            </button>
            <a href="/students"
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}