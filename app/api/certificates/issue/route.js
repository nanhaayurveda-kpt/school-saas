import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { certificates, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

const SERIAL_PREFIX = {
  tc: "TC",
  character: "CHR",
  bonafide: "BNF",
  birth: "BTH",
};

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }
  const session = await getSession(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const formData = await request.formData();
  const student_id = parseInt(formData.get("student_id"));
  const cert_type = formData.get("cert_type");
  const issue_date = formData.get("issue_date");

  if (!student_id || !cert_type || !issue_date) {
    return NextResponse.redirect(
      new URL("/certificates/issue", request.url),
      303,
    );
  }

  let serial_no = formData.get("serial_no");
  if (!serial_no || serial_no.trim() === "") {
    // Auto-generate: PREFIX/YYYY/NNN
    const existing = await db
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.user_id, user.id),
          eq(certificates.cert_type, cert_type),
        ),
      );
    const year = new Date(issue_date).getFullYear();
    const yearMatches = existing.filter((c) =>
      (c.serial_no || "").includes(`/${year}/`),
    );
    const nextNum = String(yearMatches.length + 1).padStart(3, "0");
    const prefix = SERIAL_PREFIX[cert_type] || "CRT";
    serial_no = `${prefix}/${year}/${nextNum}`;
  }

  await db.insert(certificates).values({
    student_id,
    cert_type,
    issue_date,
    serial_no,
    reason: formData.get("reason") || null,
    last_class: formData.get("last_class") || null,
    last_exam_passed: formData.get("last_exam_passed") || null,
    conduct: formData.get("conduct") || "Good",
    custom_content: formData.get("custom_content") || null,
    user_id: user.id,
  });

  return NextResponse.redirect(new URL("/certificates", request.url), 303);
}