export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import {
  teachers,
  teacher_subjects,
  timetable,
  period_timings,
  users,
} from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { saveTeacherWeekSchedule } from "@/app/actions";
import Link from "next/link";

export default async function TeacherTimetablePage({ params }) {
  const { id } = await params;
  const teacherId = parseInt(id);
  if (!teacherId) notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");
  const session = await getSession(token);
  if (!session) redirect("/login");

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];
  if (!user) redirect("/login");

  // Fetch teacher
  const teacherResult = await db
    .select()
    .from(teachers)
    .where(and(eq(teachers.id, teacherId), eq(teachers.user_id, user.id)));
  const teacher = teacherResult[0];
  if (!teacher) notFound();

  // Fetch this teacher's assigned subjects (for dropdown suggestions)
  const subjects = await db
    .select()
    .from(teacher_subjects)
    .where(eq(teacher_subjects.teacher_id, teacherId));

  // Unique subject names
  const uniqueSubjects = [...new Set(subjects.map((s) => s.subject))];

  // Unique class-section combos
  const classCombos = subjects.map((s) => ({
    class: s.class,
    section: s.section || "",
  }));

  // Fetch period_timings for total periods count
  const timings = await db
    .select()
    .from(period_timings)
    .where(eq(period_timings.user_id, user.id))
    .orderBy(period_timings.period_no);

  const totalPeriods = timings.length;

  // Fetch existing timetable entries for this teacher (any one day, since all same)
  const existingEntries = await db
    .select()
    .from(timetable)
    .where(
      and(
        eq(timetable.user_id, user.id),
        eq(timetable.teacher_name, teacher.name),
        eq(timetable.day, "Monday"),
      ),
    );

  // Map period_no -> entry
  const existingMap = {};
  existingEntries.forEach((e) => {
    existingMap[e.period] = e;
  });

  // All classes Nursery to 12 for dropdown
  const allClasses = [
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

  const allSections = ["A", "B", "C", "D", "E"];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Timetable</h1>
          <p className="text-gray-500 text-sm mt-1">
            {teacher.name} — same schedule applies Mon to Sat
          </p>
        </div>
        <Link
          href={`/teachers/${teacherId}`}
          className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium"
        >
          ← Back
        </Link>
      </div>

      {totalPeriods === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-2xl">
          <p className="text-sm text-yellow-800 font-medium mb-2">
            ⚠ Period timings not set yet
          </p>
          <p className="text-xs text-yellow-700 mb-3">
            Please configure school-wide period timings first. This is a
            one-time setup.
          </p>
          <Link
            href="/settings/periods"
            className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700"
          >
            Go to Period Settings →
          </Link>
        </div>
      ) : (
        <>
          {uniqueSubjects.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 max-w-3xl">
              <p className="text-xs text-blue-700 font-medium mb-1">
                Assigned subjects (for reference)
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {subjects.map((s) => (
                  <span
                    key={s.id}
                    className="bg-white text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-200"
                  >
                    {s.subject} · Class {s.class}
                    {s.section ? ` (${s.section})` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl">
            <form action={saveTeacherWeekSchedule} className="space-y-4">
              <input type="hidden" name="teacher_id" value={teacherId} />
              <input
                type="hidden"
                name="total_periods"
                value={totalPeriods}
              />

              <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase pb-2 border-b border-gray-100">
                <div className="col-span-2">Period</div>
                <div className="col-span-4">Subject</div>
                <div className="col-span-3">Class</div>
                <div className="col-span-3">Section</div>
              </div>

              {timings.map((t) => {
                const p = t.period_no;
                const existing = existingMap[p];

                // Parse existing class+section from "5-A" or "5"
                let defaultClass = "";
                let defaultSection = "";
                if (existing?.class) {
                  const parts = existing.class.split("-");
                  defaultClass = parts[0] || "";
                  defaultSection = parts[1] || "";
                }
                const defaultSubject = existing?.subject || "";

                return (
                  <div
                    key={p}
                    className="grid grid-cols-12 gap-3 items-center py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="col-span-12 md:col-span-2">
                      <div className="text-sm font-semibold text-gray-700">
                        P{p}
                      </div>
                      <div className="text-xs text-gray-400">
                        {t.start_time}–{t.end_time}
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-4">
                      <input
                        type="text"
                        name={`subject_${p}`}
                        list={`subjects_${p}`}
                        placeholder="Free / Subject name"
                        defaultValue={defaultSubject}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <datalist id={`subjects_${p}`}>
                        {uniqueSubjects.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </div>

                    <div className="col-span-6 md:col-span-3">
                      <select
                        name={`class_${p}`}
                        defaultValue={defaultClass}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">— Class —</option>
                        {allClasses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-6 md:col-span-3">
                      <select
                        name={`section_${p}`}
                        defaultValue={defaultSection}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">— Section —</option>
                        {allSections.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  Save Weekly Schedule
                </button>
                <p className="text-xs text-gray-500 self-center">
                  Leave subject blank for free periods. Same schedule will apply
                  Mon–Sat.
                </p>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}