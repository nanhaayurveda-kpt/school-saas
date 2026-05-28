// app/api/fees/bulk-add/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";

const REGULAR_TYPES = ["monthly", "transport", "amenity", "misc"];
const OCCASIONAL_TYPES = ["exam", "admission", "late"];

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }
  const session = await getSession(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }
  const userResult = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, session.email));
  const user = userResult[0];
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const formData = await request.formData();

  const studentId = parseInt(formData.get("student_id"), 10);
  const dueDate = formData.get("due_date");
  const paidDate = formData.get("paid_date") || null;
  const paymentMode = formData.get("payment_mode") || "cash";
  const academicYear = formData.get("academic_year")?.trim() || null;
  const selectedMonths = formData.getAll("months[]");

  if (!studentId || isNaN(studentId)) {
    await setFlash("error", "Student required");
    return NextResponse.redirect(new URL("/fees/add", request.url), { status: 303 });
  }
  if (!selectedMonths.length) {
    await setFlash("error", "At least one month required");
    return NextResponse.redirect(new URL("/fees/add", request.url), { status: 303 });
  }
  if (!dueDate) {
    await setFlash("error", "Due date required");
    return NextResponse.redirect(new URL("/fees/add", request.url), { status: 303 });
  }

  const studentRows = await db
    .select()
    .from(schema.students)
    .where(and(eq(schema.students.id, studentId), eq(schema.students.user_id, 2)));
  if (!studentRows.length) {
    await setFlash("error", "Student not found");
    return NextResponse.redirect(new URL("/fees/add", request.url), { status: 303 });
  }

  const rowsToInsert = [];

  // Regular fees — per selected month
  for (const month of selectedMonths) {
    for (const feeType of REGULAR_TYPES) {
      const amtRaw = formData.get(`amount_${feeType}`);
      if (!amtRaw) continue;
      const amount = parseInt(amtRaw, 10);
      if (isNaN(amount) || amount <= 0) continue;
      rowsToInsert.push({ month, feeType, amount });
    }
  }

  // Occasional fees — only for their specified month
  for (const feeType of OCCASIONAL_TYPES) {
    const amtRaw = formData.get(`amount_${feeType}`);
    const forMonth = formData.get(`month_${feeType}`)?.trim();
    if (!amtRaw || !forMonth) continue;
    const amount = parseInt(amtRaw, 10);
    if (isNaN(amount) || amount <= 0) continue;
    rowsToInsert.push({ month: forMonth, feeType, amount });
  }

  if (!rowsToInsert.length) {
    await setFlash("error", "No valid fee types selected");
    return NextResponse.redirect(new URL("/fees/add", request.url), { status: 303 });
  }

  let inserted = 0;
  let skipped = 0;

  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  for (const row of rowsToInsert) {
    const conditions = [
      eq(schema.fees.user_id, 2),
      eq(schema.fees.student_id, studentId),
      eq(schema.fees.month, row.month),
      eq(schema.fees.fee_type, row.feeType),
    ];
    if (academicYear) {
      conditions.push(eq(schema.fees.academic_year, academicYear));
    }
    const existing = await db
      .select({ id: schema.fees.id })
      .from(schema.fees)
      .where(and(...conditions));

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const randPart = Math.floor(1000 + Math.random() * 9000);
    const receiptNo = `RCP-${datePart}-${randPart}`;

    await db.insert(schema.fees).values({
      student_id: studentId,
      user_id: 2,
      amount: row.amount,
      paid_amount: paidDate ? row.amount : 0,
      fee_type: row.feeType,
      month: row.month,
      academic_year: academicYear,
      due_date: new Date(dueDate),
      paid_date: paidDate ? new Date(paidDate) : null,
      status: paidDate ? "paid" : "pending",
      receipt_no: receiptNo,
    });

    if (paidDate) {
      const findRows = await db
        .select({ id: schema.fees.id })
        .from(schema.fees)
        .where(and(...conditions))
        .orderBy(schema.fees.id);
      const feeRow = findRows[findRows.length - 1];
      if (feeRow) {
        await db.insert(schema.fee_payments).values({
          fee_id: feeRow.id,
          student_id: studentId,
          user_id: 2,
          amount: row.amount,
          payment_mode: paymentMode,
          paid_date: new Date(paidDate),
          receipt_no: receiptNo,
        });
      }
    }

    inserted++;
  }

  const monthLabel =
    selectedMonths.length === 1
      ? selectedMonths[0]
      : `${selectedMonths[0]} – ${selectedMonths[selectedMonths.length - 1]}`;

  if (inserted === 0) {
    await setFlash("warning", `All ${skipped} entries already exist (${monthLabel})`);
  } else if (skipped > 0) {
    await setFlash("success", `${inserted} entries added, ${skipped} already existed (${monthLabel})`);
  } else {
    await setFlash("success", `${inserted} fee entries saved — ${monthLabel}`);
  }

  return NextResponse.redirect(new URL("/fees", request.url), { status: 303 });
}