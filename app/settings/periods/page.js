export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { period_timings, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";
import { savePeriodTimings } from "@/app/actions";
import Link from "next/link";

export default async function PeriodTimingsPage() {
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

  // Fetch existing timings
  const existing = await db
    .select()
    .from(period_timings)
    .where(eq(period_timings.user_id, user.id));

  // Map period_no -> {start, end}
  const timingMap = {};
  existing.forEach((t) => {
    timingMap[t.period_no] = { start: t.start_time, end: t.end_time };
  });

  // Default 6 periods, or more if already set
  const totalPeriods = Math.max(6, existing.length || 6);

  // Suggested default timings if none saved yet
  const defaultTimings = [
    { start: "08:00", end: "08:40" },
    { start: "08:40", end: "09:20" },
    { start: "09:20", end: "10:00" },
    { start: "10:00", end: "10:40" },
    { start: "10:40", end: "11:20" },
    { start: "11:20", end: "12:00" },
    { start: "12:00", end: "12:40" },
    { start: "12:40", end: "13:20" },
    { start: "13:20", end: "14:00" },
    { start: "14:00", end: "14:40" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Period Timings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Set school-wide period timings once. Change here when summer/winter schedule shifts.
          </p>
        </div>
        <Link
          href="/settings"
          className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium"
        >
          ← Back
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <form action={savePeriodTimings} className="space-y-4">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <label className="text-sm font-medium text-gray-700">
              Total periods per day
            </label>
            <input
              type="number"
              name="total_periods"
              min={1}
              max={12}
              required
              defaultValue={totalPeriods}
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-xs text-gray-400">
              (Press Save after changing this)
            </span>
          </div>

          <div className="hidden md:grid grid-cols-3 gap-4 text-xs font-medium text-gray-500 uppercase pb-2">
            <div>Period</div>
            <div>Start Time</div>
            <div>End Time</div>
          </div>

          {Array.from({ length: totalPeriods }, (_, i) => {
            const periodNo = i + 1;
            const current = timingMap[periodNo];
            const fallback = defaultTimings[i] || { start: "", end: "" };
            const startVal = current?.start || fallback.start;
            const endVal = current?.end || fallback.end;

            return (
              <div
                key={periodNo}
                className="grid grid-cols-3 gap-4 items-center"
              >
                <div className="text-sm font-semibold text-gray-700">
                  Period {periodNo}
                </div>
                <input
                  type="time"
                  name={`start_${periodNo}`}
                  required
                  defaultValue={startVal}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="time"
                  name={`end_${periodNo}`}
                  required
                  defaultValue={endVal}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            );
          })}

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium"
            >
              Save Timings
            </button>
          </div>
        </form>
      </div>

      {existing.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4 max-w-2xl text-sm text-green-800">
          ✓ {existing.length} periods configured
        </div>
      )}
    </div>
  );
}