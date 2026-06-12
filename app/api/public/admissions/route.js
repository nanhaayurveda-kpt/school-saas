import { NextResponse } from "next/server";
import { MASTER_USER_ID } from "@/lib/config";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";

const VALID_CLASSES = [
  "Nursery", "LKG", "UKG",
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
];

export async function POST(request) {
  const secret = request.headers.get("x-admission-secret");
  if (!secret || secret !== process.env.ADMISSION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const applying_class = body.applying_class?.trim();

  if (!name || !phone || !applying_class) {
    return NextResponse.json(
      { error: "name, phone, applying_class are required" },
      { status: 400 },
    );
  }

  // ─── कड़ी validation ─────────────────────────────────────────────────────
  if (name.length > 100) {
    return NextResponse.json({ error: "Name too long" }, { status: 400 });
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 12) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }
  if (!VALID_CLASSES.includes(applying_class)) {
    return NextResponse.json({ error: "Invalid class" }, { status: 400 });
  }

  // ─── Dedupe: same phone + class की pending application पहले से? ──────────
  const existing = await db
    .select({ id: schema.admission_applications.id })
    .from(schema.admission_applications)
    .where(
      and(
        eq(schema.admission_applications.user_id, MASTER_USER_ID),
        eq(schema.admission_applications.phone, phone),
        eq(schema.admission_applications.applying_class, applying_class),
        eq(schema.admission_applications.status, "pending"),
      ),
    );
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "An application with this phone number is already pending for this class." },
      { status: 409 },
    );
  }

  await db.insert(schema.admission_applications).values({
    user_id: MASTER_USER_ID,
    name,
    dob: body.dob?.trim() || null,
    applying_class,
    mother_name: body.mother_name?.trim() || null,
    father_name: body.father_name?.trim() || null,
    guardian_name: body.guardian_name?.trim() || null,
    occupation: body.occupation?.trim() || null,
    address: body.address?.trim() || null,
    phone,
    alt_phone: body.alt_phone?.trim() || null,
    religion: body.religion?.trim() || null,
    previous_school: body.previous_school?.trim() || null,
    transport_required: body.transport_required ? 1 : 0,
    sibling_info: body.sibling_info?.trim() || null,
    status: "pending",
    created_at: new Date(),
  });

  return NextResponse.json({ success: true });
}