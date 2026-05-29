// app/api/fees/bulk-add/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";

const REGULAR_TYPES = ["monthly", "transport", "amenity"];
const OCCASIONAL_TYPES = ["exam", "admission", "late"];

function slugify(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

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
  const userResult = await db.select().from(schema.users).where(eq(schema.users.email, session.email));
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
  const student = studentRows[0];
  if (!student) {
    await setFlash("error", "Student not found");
    return NextResponse.redirect(new URL("/fees/add", request.url), { status: 303 });
  }

  const rowsToInsert = [];

  for (const month of selectedMonths) {
    for (const feeType of REGULAR_TYPES) {
      const amtRaw = formData.get(`amount_${feeType}`);
      if (!amtRaw) continue;
      const amount = parseInt(amtRaw, 10);
      if (isNaN(amount) || amount <= 0) continue;
      rowsToInsert.push({ month, feeType, amount });
    }
  }

  for (const feeType of OCCASIONAL_TYPES) {
    const amtRaw = formData.get(`amount_${feeType}`);
    const forMonth = formData.get(`month_${feeType}`)?.trim();
    if (!amtRaw || !forMonth) continue;
    const amount = parseInt(amtRaw, 10);
    if (isNaN(amount) || amount <= 0) continue;
    rowsToInsert.push({ month: forMonth, feeType, amount });
  }

  const customCount = parseInt(formData.get("custom_count"), 10) || 0;
  const customsToSaveInTemplate = [];
  for (let i = 0; i < customCount; i++) {
    const nameRaw = formData.get(`custom_name_${i}`)?.trim();
    const amtRaw = formData.get(`custom_amount_${i}`);
    if (!nameRaw || !amtRaw) continue;
    const slug = slugify(nameRaw);
    if (!slug) continue;
    const amount = parseInt(amtRaw, 10);
    if (isNaN(amount) || amount <= 0) continue;
    for (const month of selectedMonths) {
      rowsToInsert.push({ month, feeType: slug, amount });
    }
    if (formData.get(`custom_save_${i}`)) {
      customsToSaveInTemplate.push({ fee_type: slug, amount });
    }
  }

  if (!rowsToInsert.length) {
    await setFlash("error", "No valid fee items selected");
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
    const existing = await db.select({ id: schema.fees.id }).from(schema.fees).where(and(...conditions));

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
      const findRows = await db.select({ id: schema.fees.id }).from(schema.fees).where(and(...conditions)).orderBy(schema.fees.id);
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

  let templateSaved = 0;
  if (customsToSaveInTemplate.length > 0 && academicYear && student.class) {
    const pkgRows = await db
      .select({ id: schema.fee_packages.id })
      .from(schema.fee_packages)
      .where(and(
        eq(schema.fee_packages.user_id, 2),
        eq(schema.fee_packages.class, student.class),
        eq(schema.fee_packages.academic_year, academicYear),
      ));
    let packageId = pkgRows[0]?.id;

    if (!packageId) {
      await db.insert(schema.fee_packages).values({
        user_id: 2,
        class: student.class,
        academic_year: academicYear,
        total_amount: 0,
        created_at: new Date(),
      });
      const newRows = await db
        .select({ id: schema.fee_packages.id })
        .from(schema.fee_packages)
        .where(and(
          eq(schema.fee_packages.user_id, 2),
          eq(schema.fee_packages.class, student.class),
          eq(schema.fee_packages.academic_year, academicYear),
        ));
      packageId = newRows[0]?.id;
    }

    if (packageId) {
      const existingItems = await db
        .select({ fee_type: schema.fee_package_items.fee_type })
        .from(schema.fee_package_items)
        .where(eq(schema.fee_package_items.package_id, packageId));
      const existingSlugs = new Set(existingItems.map((i) => i.fee_type));

      const itemsToInsert = customsToSaveInTemplate
        .filter((c) => !existingSlugs.has(c.fee_type))
        .map((c) => ({ package_id: packageId, fee_type: c.fee_type, amount: c.amount }));

      if (itemsToInsert.length > 0) {
        await db.insert(schema.fee_package_items).values(itemsToInsert);
        templateSaved = itemsToInsert.length;

        const allItems = await db
          .select({ amount: schema.fee_package_items.amount })
          .from(schema.fee_package_items)
          .where(eq(schema.fee_package_items.package_id, packageId));
        const newTotal = allItems.reduce((s, it) => s + (it.amount || 0), 0);
        await db.update(schema.fee_packages).set({ total_amount: newTotal })
          .where(eq(schema.fee_packages.id, packageId));
      }
    }
  }

  const monthLabel = selectedMonths.length === 1
    ? selectedMonths[0]
    : `${selectedMonths[0]} – ${selectedMonths[selectedMonths.length - 1]}`;

  if (inserted === 0) {
    await setFlash("warning", `All ${skipped} entries already exist (${monthLabel})`);
  } else {
    const parts = [`${inserted} entries added`];
    if (skipped > 0) parts.push(`${skipped} skipped`);
    if (templateSaved > 0) parts.push(`${templateSaved} saved to template`);
    await setFlash("success", `${parts.join(", ")} — ${monthLabel}`);
  }

  return NextResponse.redirect(new URL("/fees", request.url), { status: 303 });
}