export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { students, teachers } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

export default async function TeacherStudentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("teacher_session")?.value;
  if (!token) redirect("/teacher-login");

  let payload;
  try {
    const verified = await jwtVerify(token, SECRET);
    payload = verified.payload;
  } catch {
    redirect("/teacher-login");
  }

  const teacherResult = await db
    .select()
    .from(teachers)
    .where(eq(teachers.id, payload.teacherId));
  const teacher = teacherResult[0];

  const myStudents = teacher
    ? await db
        .select()
        .from(students)
        .where(eq(students.user_id, teacher.user_id))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-700 px-4 py-4 flex justify-between items-center">
        <div>
          <p className="text-white font-bold">{payload.teacherName}</p>
          <p className="text-indigo-200 text-xs">Teacher Portal</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/teacher/dashboard" className="text-indigo-200 text-sm">
            ← Back
          </Link>
          <a href="/api/teacher-logout" className="text-red-300 text-sm">
            Logout
          </a>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Students</h1>
          <Link
            href="/teacher/students/add"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Student
          </Link>
        </div>

        {myStudents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
            No students found.
          </div>
        ) : (
          <div className="space-y-2">
            {myStudents.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-gray-100 px-4 py-3"
              >
                <p className="text-sm font-medium text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-400">
                  Class {s.class} {s.section ? `— ${s.section}` : ""} · Roll{" "}
                  {s.roll_number || "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}