export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { students } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { setFlash } from "@/lib/flash";
import { promoteStudents } from "@/app/actions";

export default async function PromotePage() {
  const allStudents = await db.select().from(students);
  const classes = [
    "Nursery",
    "LKG",
    "UKG",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  const now = new Date();
  const baseYear =
    now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const nextAcademicYear = `${baseYear + 1}-${String(baseYear + 2).slice(-2)}`;

  const classCounts = {};
  allStudents.forEach((s) => {
    classCounts[s.class] = (classCounts[s.class] || 0) + 1;
  });

  const allClassOptions = [
    "Nursery",
    "LKG",
    "UKG",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Student Promotion</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Class-wise bulk promotion — new academic year
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-xs text-yellow-800">
        ⚠️ This action will move all students of the selected class to the next
        class. This cannot be undone.
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <p className="text-xs font-medium text-gray-600 mb-3">
          Current Classes
        </p>
        <div className="grid grid-cols-3 gap-2">
          {classes.map((c) => (
            <div
              key={c}
              className="bg-indigo-50 border border-indigo-100 rounded-lg p-2 text-center"
            >
              <p className="text-sm font-bold text-indigo-700">Class {c}</p>
              <p className="text-xs text-indigo-500">
                {classCounts[c]} students
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-medium text-gray-600 mb-3">
          Promote Students
        </p>
        <form action={promoteStudents} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Class <span className="text-red-500">*</span>
            </label>
            <select
              name="from_class"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select class to promote...</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  Class {c} ({classCounts[c]} students)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Class <span className="text-red-500">*</span>
            </label>
            <select
              name="to_class"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select destination class...</option>
              {allClassOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Academic Year <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="new_academic_year"
              required
              defaultValue={nextAcademicYear}
              placeholder="e.g. 2025-26"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium"
          >
            Promote Students →
          </button>
        </form>
      </div>
    </div>
  );
}
