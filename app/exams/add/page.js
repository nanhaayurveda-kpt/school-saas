export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { exams, students } from "@/lib/schema";
import { redirect } from "next/navigation";
import { setFlash } from "@/lib/flash";
import { createExam } from '@/app/actions'

export default async function AddExamPage() {
  const allStudents = await db.select().from(students);
  const classes = [...new Set(allStudents.map((s) => s.class))].sort();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Schedule New Exam</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the exam details below</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <form action={createExam} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Name <span className="text-red-500">*</span>
            </label>
            <input type="text" name="name" required placeholder="e.g., Half Yearly Exam 2025"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              {classes.length > 0 ? (
                <select name="class" required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select class</option>
                  {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input type="text" name="class" required placeholder="e.g., Class 10"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input type="text" name="subject" required placeholder="e.g., Mathematics"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Date <span className="text-red-500">*</span>
            </label>
            <input type="date" name="exam_date" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Marks <span className="text-red-500">*</span>
              </label>
              <input type="number" name="max_marks" required defaultValue={100} min={1}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Marks <span className="text-red-500">*</span>
              </label>
              <input type="number" name="passing_marks" required defaultValue={33} min={1}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium">
              Save Exam
            </button>
            <a href="/exams"
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}