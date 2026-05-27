export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  students,
  teachers,
  fees,
  attendance,
  exams,
  notices,
  school_settings,
  users,
} from "@/lib/schema";
import { sql, eq, and } from "drizzle-orm";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];

  const [studentCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(students)
    .where(eq(students.user_id, 2));
  const [teacherCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(teachers)
    .where(eq(teachers.user_id, 2));
  const [pendingFees] = await db
    .select({ total: sql`SUM(amount)`, count: sql`COUNT(*)` })
    .from(fees)
    .where(and(sql`status = 'pending'`, eq(fees.user_id, 2)));
  const [paidFees] = await db
    .select({ total: sql`SUM(amount)` })
    .from(fees)
    .where(and(sql`status = 'paid'`, eq(fees.user_id, 2)));
  const [todayPresent] = await db
    .select({ count: sql`COUNT(*)` })
    .from(attendance)
    .where(
      and(
        eq(attendance.user_id, 2),
        sql`date = ${today} AND status = 'present'`,
      ),
    );
  const [todayAbsent] = await db
    .select({ count: sql`COUNT(*)` })
    .from(attendance)
    .where(
      and(
        eq(attendance.user_id, 2),
        sql`date = ${today} AND status = 'absent'`,
      ),
    );

  const settingsRows = user
    ? await db
        .select()
        .from(school_settings)
        .where(eq(school_settings.user_id, 2))
    : [];
  const settings = settingsRows[0] || null;
  const settingsIncomplete =
    !settings?.school_name || !settings?.principal_name;

  return (
    <div className="pb-4">
      {/* School header — logo + name + bell */}
      <div className="flex items-center gap-3 mb-5 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
        {settings?.logo_url ? (
          <img
            src={settings.logo_url}
            alt="Logo"
            className="h-12 w-12 object-contain rounded-full border border-gray-100 shrink-0"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl shrink-0">
            🏫
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-indigo-600 leading-tight truncate">
            {settings?.school_name || "School Name"}
          </p>
          {settings?.principal_name && (
            <p className="text-xs text-gray-500 truncate">
              Principal: {settings.principal_name}
            </p>
          )}
        </div>
        <Link
          href="/notices"
          className="text-2xl text-gray-700 shrink-0"
          aria-label="Notices"
        >
          🔔
        </Link>
      </div>

      {/* Hero banner */}
      <div className="rounded-2xl overflow-hidden mb-6 bg-gradient-to-b from-sky-50 to-emerald-50 border border-gray-100">
        <div className="flex items-end justify-center gap-1 px-4 pt-6 text-5xl">
          <span>🧑‍🎓</span>
          <span>👩‍🎓</span>
          <span>🧑‍🎓</span>
          <span>👩‍🎓</span>
        </div>
        <div className="h-6 bg-emerald-200/60" />
      </div>

      {/* Settings warning */}
      {settingsIncomplete && (
        <Link
          href="/settings"
          className="block bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 mb-6"
        >
          <p className="text-sm font-semibold text-yellow-800">
            ⚠️ School Settings Incomplete
          </p>
          <p className="text-xs text-yellow-700 mt-0.5">
            Fill in school name and Principal name — otherwise receipts and
            certificates will be blank.
          </p>
          <p className="text-xs text-yellow-600 font-medium mt-1">
            Go to Settings →
          </p>
        </Link>
      )}

      {/* Academic */}
      <h2 className="text-lg font-bold text-gray-900 mb-3">Academic</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          href="/teachers"
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
        >
          <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-2xl shrink-0">
            👨‍🏫
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-600 leading-tight">Staff</p>
            <p className="text-xl font-bold text-gray-900">
              {teacherCount?.count || 0}
            </p>
          </div>
        </Link>
        <Link
          href="/students"
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
        >
          <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-2xl shrink-0">
            👩‍🎓
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-600 leading-tight">Student</p>
            <p className="text-xl font-bold text-gray-900">
              {studentCount?.count || 0}
            </p>
          </div>
        </Link>
      </div>

      {/* Finance */}
      <h2 className="text-lg font-bold text-gray-900 mb-3">Finance</h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link href="/fees" className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center text-2xl mb-2">
            💰
          </div>
          <p className="text-sm font-medium text-gray-700">Income</p>
          <p className="text-xs text-emerald-600 font-semibold">
            ₹{paidFees?.total || 0}
          </p>
        </Link>
        <Link
          href="/reports"
          className="flex flex-col items-center text-center"
        >
          <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center text-2xl mb-2">
            📈
          </div>
          <p className="text-sm font-medium text-gray-700">Expense</p>
          <p className="text-xs text-gray-400 font-semibold">View</p>
        </Link>
        <Link
          href="/fees?status=pending"
          className="flex flex-col items-center text-center"
        >
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-2xl mb-2">
            📅
          </div>
          <p className="text-sm font-medium text-gray-700">Due</p>
          <p className="text-xs text-red-500 font-semibold">
            ₹{pendingFees?.total || 0}
          </p>
        </Link>
      </div>

      {/* Attendance */}
      <h2 className="text-lg font-bold text-gray-900 mb-3">Attendance</h2>
      <div className="grid grid-cols-2 gap-3 mb-2">
        <Link
          href={`/teacher-attendance?date=${today}`}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center"
        >
          <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center text-2xl mb-2">
            👨‍🏫
          </div>
          <p className="text-sm font-medium text-gray-700">Staff Attendance</p>
          <p className="text-xs text-gray-400 mt-0.5">Present {todayPresent?.count || 0} · Absent {todayAbsent?.count || 0}</p>
        </Link>
        <Link
          href={`/attendance/mark?date=${today}`}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center"
        >
          <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center text-2xl mb-2">
            👩‍🎓
          </div>
          <p className="text-sm font-medium text-gray-700">
            Student Attendance
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Mark today</p>
        </Link>
      </div>
    </div>
  );
}