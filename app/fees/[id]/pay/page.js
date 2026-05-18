export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { fees, students, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { markFeePaid } from "@/app/actions";

export default async function PayFeePage({ params }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await getSession(token) : null;
  if (!session) redirect("/login");

  const userResult = await db.select().from(users).where(eq(users.email, session.email));
  const user = userResult[0];
  if (!user) redirect("/login");

  const result = await db
    .select({
      id: fees.id,
      amount: fees.amount,
      status: fees.status,
      paid_amount: fees.paid_amount,
      fee_type: fees.fee_type,
      month: fees.month,
      due_date: fees.due_date,
      academic_year: fees.academic_year,
      student_name: students.name,
      student_class: students.class,
      student_section: students.section,
      roll_number: students.roll_number,
    })
    .from(fees)
    .leftJoin(students, eq(fees.student_id, students.id))
    .where(and(eq(fees.id, parseInt(id)), eq(fees.user_id, user.id)));

  if (result.length === 0) notFound();
  const fee = result[0];

  if (fee.status === "paid" && (fee.paid_amount || 0) >= fee.amount)
    redirect(`/fees/${id}/receipt`);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mark Fee as Paid</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          {fee.student_name} — Class {fee.student_class}
        </p>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mb-6 text-center">
        <img
          src="/QR_.jpeg"
          alt="UPI QR Code"
          className="w-48 mx-auto rounded-lg mb-2"
        />
        <p className="text-sm font-semibold text-gray-700">
          UPI ID: boism-8840202071@boi
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Collect payment from student, then enter below
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Student</span>
            <span className="font-medium text-gray-900">{fee.student_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Class</span>
            <span className="font-medium text-gray-900">
              Class {fee.student_class} {fee.student_section || ""}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fee Type</span>
            <span className="font-medium text-gray-900">{fee.fee_type || "Monthly Fee"}</span>
          </div>
          {fee.month && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Month</span>
              <span className="font-medium text-gray-900">{fee.month}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold text-indigo-600 text-lg">₹{fee.amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Due Date</span>
            <span className="font-medium text-gray-900">
              {fee.due_date ? new Date(fee.due_date).toLocaleDateString("en-IN") : "—"}
            </span>
          </div>
        </div>

        <form action={markFeePaid} className="space-y-4">
          <input type="hidden" name="fee_id" value={fee.id} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Paying Now (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="paid_amount"
              required
              min="1"
              defaultValue={fee.amount - (fee.paid_amount || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Total: ₹{fee.amount} · Already paid: ₹{fee.paid_amount || 0} · Balance: ₹{fee.amount - (fee.paid_amount || 0)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="paid_date"
              required
              defaultValue={today}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receipt No.
            </label>
            <input
              type="text"
              name="receipt_no"
              placeholder="e.g. RCP/2024/001"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium"
            >
              Mark as Paid
            </button>
            <a
              href="/fees"
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}