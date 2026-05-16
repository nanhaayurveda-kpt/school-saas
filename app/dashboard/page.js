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
    .where(eq(students.user_id, user.id));
  const [teacherCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(teachers)
    .where(eq(teachers.user_id, user.id));
  const [pendingFees] = await db
    .select({ total: sql`SUM(amount)`, count: sql`COUNT(*)` })
    .from(fees)
    .where(and(sql`status = 'pending'`, eq(fees.user_id, user.id)));
  const [paidFees] = await db
    .select({ total: sql`SUM(amount)` })
    .from(fees)
    .where(and(sql`status = 'paid'`, eq(fees.user_id, user.id)));
  const [todayPresent] = await db
    .select({ count: sql`COUNT(*)` })
    .from(attendance)
    .where(
      and(
        eq(attendance.user_id, user.id),
        sql`date = ${today} AND status = 'present'`,
      ),
    );
  const [todayAbsent] = await db
    .select({ count: sql`COUNT(*)` })
    .from(attendance)
    .where(
      and(
        eq(attendance.user_id, user.id),
        sql`date = ${today} AND status = 'absent'`,
      ),
    );
  const [examCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(exams)
    .where(eq(exams.user_id, user.id));
  const [noticeCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(notices)
    .where(eq(notices.user_id, user.id));

  const recentNotices = await db
    .select()
    .from(notices)
    .where(eq(notices.user_id, user.id))
    .orderBy(sql`created_at DESC`)
    .limit(3);
  const upcomingExams = await db
    .select()
    .from(exams)
    .where(and(sql`exam_date >= ${today}`, eq(exams.user_id, user.id)))
    .orderBy(sql`exam_date ASC`)
    .limit(3);

  const settingsRows = user
    ? await db
        .select()
        .from(school_settings)
        .where(eq(school_settings.user_id, user.id))
    : [];
  const settings = settingsRows[0] || null;
  const settingsIncomplete =
    !settings?.school_name || !settings?.principal_name;

  return (
    <div>
      {settings?.logo_url || settings?.school_name ? (
        <div className="flex items-center gap-3 mb-5 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
          {settings.logo_url && (
            <img
              src={settings.logo_url}
              alt="Logo"
              className="h-12 w-12 object-contain rounded"
            />
          )}
          <div>
            <p className="text-base font-bold text-gray-900">
              {settings.school_name}
            </p>
            {settings.principal_name && (
              <p className="text-xs text-gray-500">
                Principal: {settings.principal_name}
              </p>
            )}
          </div>
        </div>
      ) : null}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Link
          href="/students/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
        >
          + Student
        </Link>
      </div>

      {/* Settings warning */}
      {settingsIncomplete && (
        <Link
          href="/settings"
          className="block bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 mb-5"
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

      {/* Today attendance quick alert */}
      {Number(todayPresent?.count) === 0 &&
        Number(todayAbsent?.count) === 0 &&
        Number(studentCount?.count) > 0 && (
          <Link
            href={`/attendance/mark?date=${today}`}
            className="block bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-5"
          >
            <p className="text-sm font-semibold text-indigo-800">
              📋 Attendance not marked yet for today
            </p>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">
              Mark Now →
            </p>
          </Link>
        )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">🎓</div>
          <div className="text-2xl font-bold text-gray-900">
            {studentCount?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Total Students</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">👨‍🏫</div>
          <div className="text-2xl font-bold text-gray-900">
            {teacherCount?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Total Teachers</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">⚠️</div>
          <div className="text-2xl font-bold text-red-600">
            ₹{pendingFees?.total || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Pending Fees ({pendingFees?.count || 0})
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-bold text-green-600">
            ₹{paidFees?.total || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Fees Collected</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">🟢</div>
          <div className="text-2xl font-bold text-green-600">
            {todayPresent?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Present Today</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">🔴</div>
          <div className="text-2xl font-bold text-red-500">
            {todayAbsent?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Absent Today</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-2xl font-bold text-gray-900">
            {examCount?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Total Exams</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">📋</div>
          <div className="text-2xl font-bold text-gray-900">
            {noticeCount?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Notices</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/students/add", label: "➕ Add Student" },
              { href: "/fees/add", label: "💰 Record Fee" },
              {
                href: `/attendance/mark?date=${today}`,
                label: "✅ Student Attendance",
              },
              {
                href: `/teacher-attendance?date=${today}`,
                label: "👨‍🏫 Teacher Attendance",
              },
              { href: "/exams/add", label: "📝 Schedule Exam" },
              { href: "/notices/add", label: "📋 Post Notice" },
              { href: "/reports", label: "📊 Reports" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center text-xs text-indigo-600 font-medium bg-indigo-50 rounded-lg px-3 py-2.5 hover:bg-indigo-100"
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">
            Upcoming Exams
          </h2>
          {upcomingExams.length === 0 ? (
            <p className="text-xs text-gray-400">No upcoming exams.</p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {exam.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Class {exam.class} · {exam.subject}
                    </p>
                  </div>
                  <p className="text-xs text-indigo-600 font-medium">
                    {exam.exam_date}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">
            Recent Notices
          </h2>
          {recentNotices.length === 0 ? (
            <p className="text-xs text-gray-400">No notices yet.</p>
          ) : (
            <div className="space-y-3">
              {recentNotices.map((notice) => (
                <div key={notice.id}>
                  <p className="text-sm font-medium text-gray-900">
                    {notice.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {notice.category} ·{" "}
                    <span
                      className={
                        notice.priority === "urgent"
                          ? "text-red-500"
                          : notice.priority === "important"
                            ? "text-yellow-500"
                            : "text-gray-400"
                      }
                    >
                      {notice.priority}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
