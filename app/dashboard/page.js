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
} from "@/lib/schema";
import { sql } from "drizzle-orm";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const [studentCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(students);
  const [teacherCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(teachers);
  const [pendingFees] = await db
    .select({ total: sql`SUM(amount)`, count: sql`COUNT(*)` })
    .from(fees)
    .where(sql`status = 'pending'`);
  const [paidFees] = await db
    .select({ total: sql`SUM(amount)` })
    .from(fees)
    .where(sql`status = 'paid'`);
  const [todayPresent] = await db
    .select({ count: sql`COUNT(*)` })
    .from(attendance)
    .where(sql`date = ${today} AND status = 'present'`);
  const [todayAbsent] = await db
    .select({ count: sql`COUNT(*)` })
    .from(attendance)
    .where(sql`date = ${today} AND status = 'absent'`);
  const [examCount] = await db.select({ count: sql`COUNT(*)` }).from(exams);
  const [noticeCount] = await db.select({ count: sql`COUNT(*)` }).from(notices);

  const recentNotices = await db
    .select()
    .from(notices)
    .orderBy(sql`created_at DESC`)
    .limit(3);
  const upcomingExams = await db
    .select()
    .from(exams)
    .where(sql`exam_date >= ${today}`)
    .orderBy(sql`exam_date ASC`)
    .limit(3);

  const settingsRows = await db.select().from(school_settings).limit(1);
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
          <h1 className="text-xl font-bold text-gray-900">डैशबोर्ड</h1>
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
            ⚠️ School Settings अधूरी हैं
          </p>
          <p className="text-xs text-yellow-700 mt-0.5">
            School का नाम और Principal का नाम भरें — वरना receipts और
            certificates पर जानकारी नहीं आएगी।
          </p>
          <p className="text-xs text-yellow-600 font-medium mt-1">
            Settings भरें →
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
              📋 आज की हाजिरी अभी नहीं ली गई
            </p>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">
              अभी Mark करें →
            </p>
          </Link>
        )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">🎓</div>
          <div className="text-2xl font-bold text-gray-900">
            {studentCount?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">कुल छात्र</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">👨‍🏫</div>
          <div className="text-2xl font-bold text-gray-900">
            {teacherCount?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">कुल शिक्षक</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">⚠️</div>
          <div className="text-2xl font-bold text-red-600">
            ₹{pendingFees?.total || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            बकाया फीस ({pendingFees?.count || 0})
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-bold text-green-600">
            ₹{paidFees?.total || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">फीस जमा</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">🟢</div>
          <div className="text-2xl font-bold text-green-600">
            {todayPresent?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">आज उपस्थित</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">🔴</div>
          <div className="text-2xl font-bold text-red-500">
            {todayAbsent?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">आज अनुपस्थित</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-2xl font-bold text-gray-900">
            {examCount?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">कुल परीक्षाएं</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">📋</div>
          <div className="text-2xl font-bold text-gray-900">
            {noticeCount?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">सूचनाएं</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">
            त्वरित कार्य
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/students/add", label: "➕ Add Student" },
              { href: "/fees/add", label: "💰 Record Fee" },
              {
                href: `/attendance/mark?date=${today}`,
                label: "✅ Attendance",
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
            आगामी परीक्षाएं
          </h2>
          {upcomingExams.length === 0 ? (
            <p className="text-xs text-gray-400">कोई upcoming exam नहीं।</p>
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
            हाल की सूचनाएं
          </h2>
          {recentNotices.length === 0 ? (
            <p className="text-xs text-gray-400">कोई notice नहीं।</p>
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
