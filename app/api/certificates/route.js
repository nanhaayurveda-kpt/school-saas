// app/api/certificates/route.js  ← CORRECTED

import { db } from "@/lib/db";
import { certificates } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET(request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id");

  let rows;
  if (studentId) {
    rows = await db
      .select()
      .from(certificates)
      .where(eq(certificates.student_id, Number(studentId)));
  } else {
    rows = await db.select().from(certificates);
  }

  return Response.json(rows);
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    student_id,
    cert_type,
    issue_date,
    serial_no,
    reason,
    last_class,
    last_exam_passed,
    conduct,
    custom_content,
  } = body;

  if (!student_id || !cert_type || !issue_date) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  await db.insert(certificates).values({
    student_id: Number(student_id),
    cert_type,
    issue_date,
    serial_no: serial_no || null,
    reason: reason || null,
    last_class: last_class || null,
    last_exam_passed: last_exam_passed || null,
    conduct: conduct || "Good",
    custom_content: custom_content || null,
  });

  return Response.json({ success: true });
}