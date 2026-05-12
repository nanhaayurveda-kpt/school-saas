export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { fees, students } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";

export default async function FeesPage({ searchParams }) {
  const params = await searchParams;
  const tab = params?.tab || "class";

  const allFees = await db
    .select({
      id: fees.id,
      amount: fees.amount,
      due_date: fees.due_date,
      paid_date: fees.paid_date,
      status: fees.status,
      student_name: students.name,
      student_id: fees.student_id,
      class: students.class,
      section: students.section,
      parent_phone: students.phone,
      parent_name: students.father_name,
    })
    .from(fees)
    .leftJoin(students, eq(fees.student_id, students.id))
    .orderBy(fees.due_date);

  const stats = await db
    .select({
      pending_count: sql`COUNT(CASE WHEN ${fees.status} = 'pending' THEN 1 END)`,
      partial_count: sql`COUNT(CASE WHEN ${fees.status} = 'partial' THEN 1 END)`,
      paid_count: sql`COUNT(CASE WHEN ${fees.status} = 'paid' THEN 1 END)`,
      overdue_count: sql`COUNT(CASE WHEN ${fees.status} = 'overdue' THEN 1 END)`,
      total_pending: sql`SUM(CASE WHEN ${fees.status} = 'pending' THEN ${fees.amount} ELSE 0 END)`,
      total_partial: sql`SUM(CASE WHEN ${fees.status} = 'partial' THEN (${fees.amount} - ${fees.paid_amount}) ELSE 0 END)`,
      total_collected: sql`SUM(CASE WHEN ${fees.status} = 'paid' THEN ${fees.amount} ELSE 0 END)`,
      total_overdue: sql`SUM(CASE WHEN ${fees.status} = 'overdue' THEN ${fees.amount} ELSE 0 END)`,
    })
    .from(fees);

  const summary = stats[0] || {};

  const grouped = {};
  allFees.forEach((fee) => {
    const cls = fee.class || "—";
    const sec = fee.section || "—";
    if (!grouped[cls]) grouped[cls] = {};
    if (!grouped[cls][sec]) grouped[cls][sec] = [];
    grouped[cls][sec].push(fee);
  });
  const sortedClasses = Object.keys(grouped).sort();
  const defaulters = allFees.filter(
    (f) =>
      f.status === "pending" ||
      f.status === "partial" ||
      f.status === "overdue",
  );

  const FeeRow = ({ fee }) => {
    const phone = fee.parent_phone?.replace(/\D/g, "") || "";
    const fullPhone = phone.startsWith("91") ? phone : `91${phone}`;
    const msg = encodeURIComponent(
      `Dear ${fee.parent_name || "Parent"},\n\nFees of ₹${fee.amount} for ${fee.student_name} is pending. Please pay at the earliest.\n\n— School`,
    );
    return (
      <div className="px-4 py-2.5 flex justify-between items-center">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fee.student_name}
            </p>
            <span
              className={`shrink-0 px-1.5 py-0.5 text-xs rounded-full font-medium ${
                fee.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : fee.status === "partial"
                    ? "bg-orange-100 text-orange-700"
                    : fee.status === "overdue"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {fee.status === "paid"
                ? "Paid"
                : fee.status === "partial"
                  ? "Partial"
                  : fee.status === "overdue"
                    ? "Overdue"
                    : "Pending"}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Due: {new Date(fee.due_date).toLocaleDateString("en-IN")}
            {fee.paid_date &&
              ` · Paid: ${new Date(fee.paid_date).toLocaleDateString("en-IN")}`}
          </p>
        </div>
        <div className="ml-3 shrink-0 text-right">
          <p className="text-sm font-bold text-gray-900">₹{fee.amount}</p>
          {(fee.status === "pending" ||
            fee.status === "partial" ||
            fee.status === "overdue") && (
            <div className="flex flex-col gap-0.5 items-end">
              <Link
                href={`/fees/${fee.id}/pay`}
                className="text-xs text-indigo-600 font-medium"
              >
                Mark Paid
              </Link>
              {fee.parent_phone && (
                <a
                  href={`https://wa.me/${fullPhone}?text=${msg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 font-medium"
                >
                  📲 Remind
                </a>
              )}
            </div>
          )}
          {fee.status === "paid" && (
            <Link
              href={`/fees/${fee.id}/receipt`}
              className="text-xs text-green-600 font-medium"
            >
              🖨️ Receipt
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Class & section-wise fee tracking
          </p>
        </div>
        <Link
          href="/fees/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Record
        </Link>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <p className="text-xs text-red-500 font-medium">Pending</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              ₹{summary.total_pending || 0}
            </p>
            <p className="text-xs text-red-400 mt-0.5">
              {summary.pending_count || 0} records
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-xs text-green-600 font-medium">Collected</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              ₹{summary.total_collected || 0}
            </p>
            <p className="text-xs text-green-500 mt-0.5">
              {summary.paid_count || 0} records
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <p className="text-xs text-orange-600 font-medium">Partial</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              ₹{summary.total_partial || 0}
            </p>
            <p className="text-xs text-orange-400 mt-0.5">
              {summary.partial_count || 0} records
            </p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <p className="text-xs text-red-700 font-medium">Overdue</p>
            <p className="text-2xl font-bold text-red-700 mt-1">
              ₹{summary.total_overdue || 0}
            </p>
            <p className="text-xs text-red-400 mt-0.5">
              {summary.overdue_count || 0} records
            </p>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-green-600 font-medium">Collected</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            ₹{summary.total_collected || 0}
          </p>
          <p className="text-xs text-green-500 mt-0.5">
            {summary.paid_count || 0} records
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <a
          href="/fees?tab=class"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "class" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
        >
          Class-wise
        </a>
        <a
          href="/fees?tab=defaulters"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "defaulters" ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-red-600"}`}
        >
          🔴 Defaulters ({defaulters.length})
        </a>
        <a
          href="/fees?tab=all"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "all" ? "bg-gray-700 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
        >
          All
        </a>
      </div>

      {tab === "class" && (
        <div className="space-y-5">
          {sortedClasses.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
              No records found.
            </div>
          ) : (
            sortedClasses.map((cls) => {
              const sections = Object.keys(grouped[cls]).sort();
              const classAllFees = sections.flatMap((s) => grouped[cls][s]);
              const classPaid = classAllFees
                .filter((f) => f.status === "paid")
                .reduce((s, f) => s + (f.amount || 0), 0);
              const classPending = classAllFees
                .filter((f) => f.status === "pending")
                .reduce((s, f) => s + (f.amount || 0), 0);
              return (
                <div
                  key={cls}
                  className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden"
                >
                  <div className="bg-indigo-600 px-4 py-2.5 flex justify-between items-center flex-wrap gap-1">
                    <span className="text-white font-bold text-sm">
                      Class {cls}
                    </span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-200">✓ ₹{classPaid}</span>
                      <span className="text-red-200">✗ ₹{classPending}</span>
                    </div>
                  </div>
                  {sections.map((sec) => {
                    const secFees = grouped[cls][sec];
                    const secPaid = secFees
                      .filter((f) => f.status === "paid")
                      .reduce((s, f) => s + (f.amount || 0), 0);
                    const secPending = secFees
                      .filter((f) => f.status === "pending")
                      .reduce((s, f) => s + (f.amount || 0), 0);
                    return (
                      <div key={sec} className="border-t border-gray-100">
                        <div className="bg-indigo-50 px-4 py-2 flex justify-between items-center">
                          <span className="text-indigo-700 font-semibold text-xs">
                            Section {sec} · {secFees.length} students
                          </span>
                          <div className="flex gap-3 text-xs">
                            <span className="text-green-600">
                              ₹{secPaid} paid
                            </span>
                            <span className="text-red-500">
                              ₹{secPending} pending
                            </span>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {secFees.map((fee) => (
                            <FeeRow key={fee.id} fee={fee} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "defaulters" && (
        <div>
          {defaulters.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
              No defaulters. 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {defaulters.map((fee) => {
                const phone = fee.parent_phone?.replace(/\D/g, "") || "";
                const fullPhone = phone.startsWith("91") ? phone : `91${phone}`;
                const msg = encodeURIComponent(
                  `Dear ${fee.parent_name || "Parent"},\n\nFees of ₹${fee.amount} for ${fee.student_name} is pending.\n\n— School`,
                );
                return (
                  <div
                    key={fee.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {fee.student_name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Class {fee.class} {fee.section}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Due:{" "}
                          {new Date(fee.due_date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="ml-3 shrink-0 text-right space-y-1">
                        <p className="text-sm font-bold text-red-600">
                          ₹{fee.amount}
                        </p>
                        <Link
                          href={`/fees/${fee.id}/pay`}
                          className="block text-xs font-medium text-indigo-600"
                        >
                          Mark Paid
                        </Link>
                        {fee.parent_phone && (
                          <a
                            href={`https://wa.me/${fullPhone}?text=${msg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs font-medium text-green-600"
                          >
                            📲 Remind
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "all" && (
        <div className="space-y-3">
          {allFees.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
              No records found.
            </div>
          ) : (
            allFees.map((fee) => {
              const phone = fee.parent_phone?.replace(/\D/g, "") || "";
              const fullPhone = phone.startsWith("91") ? phone : `91${phone}`;
              const msg = encodeURIComponent(
                `Dear ${fee.parent_name || "Parent"},\n\nFees of ₹${fee.amount} for ${fee.student_name} is pending.\n\n— School`,
              );
              return (
                <div
                  key={fee.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {fee.student_name}
                        </p>
                        <span
                          className={`shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${fee.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {fee.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        Class {fee.class} {fee.section}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Due:{" "}
                        {new Date(fee.due_date).toLocaleDateString("en-IN")}
                        {fee.paid_date &&
                          ` · Paid: ${new Date(fee.paid_date).toLocaleDateString("en-IN")}`}
                      </p>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ₹{fee.amount}
                      </p>
                      {fee.status === "paid" && (
                        <Link
                          href={`/fees/${fee.id}/receipt`}
                          className="text-xs text-green-600 font-medium"
                        >
                          🖨️ Receipt
                        </Link>
                      )}
                      {fee.status === "pending" && (
                        <div className="flex flex-col gap-0.5 items-end">
                          <Link
                            href={`/fees/${fee.id}/pay`}
                            className="text-xs text-indigo-600 font-medium"
                          >
                            Mark Paid
                          </Link>
                          {fee.parent_phone && (
                            <a
                              href={`https://wa.me/${fullPhone}?text=${msg}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 font-medium"
                            >
                              📲 Remind
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
