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
    <div className="pb-6">
      {/* ── Header: logo + school name + bell ── */}
      <div className="flex items-center gap-3 mb-4">
        {settings?.logo_url ? (
          <img
            src={settings.logo_url}
            alt="Logo"
            className="h-14 w-14 object-contain rounded-full border border-gray-100 shrink-0"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center text-2xl shrink-0">
            🏫
          </div>
        )}
        <h1 className="flex-1 text-center text-xl font-extrabold text-indigo-500 leading-snug px-1">
          {settings?.school_name || "DEMO ENGLISH SCHOOL"}
        </h1>
        <Link
          href="/notices"
          aria-label="Notices"
          className="text-3xl text-gray-700 shrink-0"
        >
          🔔
        </Link>
      </div>

      {/* ── Hero banner ── */}
      <div className="rounded-2xl overflow-hidden mb-7 border border-gray-100 bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-100">
        <div className="flex items-end justify-center gap-2 pt-8 text-6xl">
          <span>🧒</span>
          <span>👧</span>
          <span>🧑</span>
          <span>👧</span>
        </div>
        <div className="h-8 mt-3 bg-emerald-300/70" />
      </div>

      {/* ── Settings warning (demo me khaali na dikhe) ── */}
      {settingsIncomplete && (
        <Link
          href="/settings"
          className="block bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 mb-7"
        >
          <p className="text-sm font-semibold text-yellow-800">
            ⚠️ School Settings Incomplete
          </p>
          <p className="text-xs text-yellow-700 mt-0.5">
            Add school name, principal name and logo in Settings.
          </p>
        </Link>
      )}

      {/* ── Academic ── */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Academic</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link
          href="/teachers"
          className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition"
        >
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl shrink-0">
            👨‍🏫
          </div>
          <div className="min-w-0">
            <p className="text-base text-gray-800 leading-tight">Staff</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {teacherCount?.count || 0}
            </p>
          </div>
        </Link>
        <Link
          href="/students"
          className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition"
        >
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-3xl shrink-0">
            👧
          </div>
          <div className="min-w-0">
            <p className="text-base text-gray-800 leading-tight">Student</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {studentCount?.count || 0}
            </p>
          </div>
        </Link>
      </div>

      {/* ── Finance ── */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Finance</h2>
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Link
          href="/fees"
          className="flex flex-col items-center text-center active:scale-95 transition"
        >
          <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center text-4xl mb-2">
            💰
          </div>
          <p className="text-base font-medium text-gray-800">Income</p>
        </Link>
        <Link
          href="/reports"
          className="flex flex-col items-center text-center active:scale-95 transition"
        >
          <div className="h-20 w-20 rounded-full bg-orange-50 flex items-center justify-center text-4xl mb-2">
            📈
          </div>
          <p className="text-base font-medium text-gray-800">Expense</p>
        </Link>
        <Link
          href="/fees?status=pending"
          className="flex flex-col items-center text-center active:scale-95 transition"
        >
          <div className="h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center text-4xl mb-2">
            📅
          </div>
          <p className="text-base font-medium text-gray-800">Due</p>
        </Link>
      </div>

      {/* ── Attendance ── */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Attendance</h2>
      <div className="flex gap-6">
        <Link
          href={`/teacher-attendance?date=${today}`}
          className="flex flex-col items-center text-center active:scale-95 transition"
        >
          <div className="h-20 w-20 rounded-full bg-amber-50 flex items-center justify-center text-4xl">
            👨‍🏫
          </div>
        </Link>
        <Link
          href={`/attendance/mark?date=${today}`}
          className="flex flex-col items-center text-center active:scale-95 transition"
        >
          <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center text-4xl">
            👧
          </div>
        </Link>
      </div>
    </div>
  );
}