export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { teachers, teacher_subjects } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addTeacherSubject, deleteTeacherSubject } from "@/app/actions";
import CopyPin from "./CopyPin";
import DeleteTeacher from "./DeleteTeacher";

export default async function TeacherDetailPage({ params }) {
  const { id } = await params;

  const result = await db
    .select()
    .from(teachers)
    .where(eq(teachers.id, Number(id)));
  if (result.length === 0) notFound();

  const t = result[0];
  const subjects = await db
    .select()
    .from(teacher_subjects)
    .where(eq(teacher_subjects.teacher_id, Number(id)));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Details</h1>
          <p className="text-gray-500 text-sm mt-1">{t.name}</p>
        </div>
        <Link
          href="/teachers"
          className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium"
        >
          ← Back
        </Link>
      </div>

      {/* Main Detail Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Full Name</p>
            <p className="text-gray-900 font-medium">{t.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Qualification</p>
            <p className="text-gray-900 font-medium">{t.qualification || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Phone</p>
            <p className="text-gray-900 font-medium">{t.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Email</p>
            <p className="text-gray-900 font-medium">{t.email || "—"}</p>
          </div>

          {/* PIN Box */}
          <div className="col-span-2">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Login PIN</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-widest text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
                {t.pin || "—"}
              </span>
              {t.pin && <CopyPin pin={t.pin} />}
              <span className="text-xs text-gray-400">Share this PIN with the teacher</span>
            </div>
          </div>

          {/* Subjects */}
          <div className="col-span-2">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Assigned Subjects</p>
            {subjects.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {subjects.map((s) => (
                  <span
                    key={s.id}
                    className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                  >
                    {s.subject} — Class {s.class}{" "}
                    {s.section ? `(${s.section})` : ""}
                    <form action={deleteTeacherSubject} className="inline">
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="text-red-400 ml-1 font-bold">×</button>
                    </form>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No subjects assigned yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Assign Subject */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Subject</h2>
        <form action={addTeacherSubject} className="space-y-4">
          <input type="hidden" name="teacher_id" value={t.id} />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                required
                placeholder="e.g. Mathematics"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                name="class"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select...</option>
                {["Nursery","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                name="section"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All</option>
                {["A","B","C","D","E"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            Assign Subject
          </button>
        </form>
      </div>

      {/* Delete Teacher */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 max-w-2xl mt-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Remove Teacher</h2>
        <p className="text-sm text-gray-500 mb-4">
          This will permanently delete <strong>{t.name}</strong> and all their assigned subjects. This cannot be undone.
        </p>
        <DeleteTeacher teacherId={t.id} teacherName={t.name} />
      </div>
    </div>
  );
}