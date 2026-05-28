// app/api/fee-structure/packages/add/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";

const VALID_FEE_TYPES = ["monthly", "admission", "exam", "transport", "misc"];

export async function POST(request) {
  // ─── Auth ──────────────────────────────────────────────────────────────────
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

  // ─── Parse form ────────────────────────────────────────────────────────────
  const formData = await request.formData();
  const cls          = formData.get("class")?.trim();
  const month        = formData.get("month")?.trim();
  const academic_year = formData.get("academic_year")?.trim();
  const totalRaw     = formData.get("total_amount");
  const total_amount = parseInt(totalRaw, 10);

  if (!cls || !month || !academic_year) {
    await setFlash("error", "Class, month and academic year are required");
    return NextResponse.redirect(
      new URL("/fee-structure/packages/add", request.url),
      { status: 303 }
    );
  }

  // ─── Collect checked fee type items ────────────────────────────────────────
  const items = [];
  for (const feeType of VALID_FEE_TYPES) {
    const typeVal = formData.get(`fee_type_${feeType}`);
    if (!typeVal) continue; // not checked
    const amt = parseInt(formData.get(`amount_${feeType}`), 10);
    if (isNaN(amt) || amt <= 0) {
      await setFlash("error", `Invalid amount for ${feeType}`);
      return NextResponse.redirect(
        new URL("/fee-structure/packages/add", request.url),
        { status: 303 }
      );
    }
    items.push({ fee_type: feeType, amount: amt });
  }

  if (items.length === 0) {
    await setFlash("error", "Select at least one fee type");
    return NextResponse.redirect(
      new URL("/fee-structure/packages/add", request.url),
      { status: 303 }
    );
  }

  // ─── Duplicate check ───────────────────────────────────────────────────────
  const existing = await db
    .select()
    .from(schema.fee_packages)
    .where(
      and(
        eq(schema.fee_packages.user_id, user.id),
        eq(schema.fee_packages.class, cls),
        eq(schema.fee_packages.month, month),
        eq(schema.fee_packages.academic_year, academic_year),
      )
    );

  if (existing.length > 0) {
    await setFlash(
      "error",
      `Package for Class ${cls} – ${month} (${academic_year}) already exists. Delete it first to recreate.`
    );
    return NextResponse.redirect(
      new URL("/fee-structure?tab=packages", request.url),
      { status: 303 }
    );
  }

  // ─── Computed total (server-side, don't trust client) ─────────────────────
  const computedTotal = items.reduce((sum, i) => sum + i.amount, 0);

  // ─── Insert parent package ─────────────────────────────────────────────────
  const inserted = await db
    .insert(schema.fee_packages)
    .values({
      user_id: user.id,
      class: cls,
      month,
      academic_year,
      total_amount: computedTotal,
      created_at: new Date(),
    })
    .returning({ id: schema.fee_packages.id });

  const packageId = inserted[0].id;

  // ─── Insert package items ──────────────────────────────────────────────────
  await db.insert(schema.fee_package_items).values(
    items.map((item) => ({
      package_id: packageId,
      fee_type: item.fee_type,
      amount: item.amount,
    }))
  );

  await setFlash(
    "success",
    `Package saved — Class ${cls}, ${month} (${academic_year}), ₹${computedTotal}`
  );
  return NextResponse.redirect(
    new URL("/fee-structure?tab=packages", request.url),
    { status: 303 }
  );
}