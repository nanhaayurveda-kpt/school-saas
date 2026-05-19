import { db } from "@/lib/db";
import { students, teachers } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("teacher_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/teacher-login", request.url));

  let payload;
  try {
    const verified = await jwtVerify(token, SECRET);
    payload = verified.payload;
  } catch {
    return NextResponse.redirect(new URL("/teacher-login", request.url));
  }

  const teacherResult = await db.select().from(teachers).where(eq(teachers.id, payload.teacherId));
  const teacher = teacherResult[0];
  if (!teacher) return NextResponse.redirect(new URL("/teacher-login", request.url));

  const formData = await request.formData();
  const name = formData.get("name");
  const className = formData.get("class");
  const section = formData.get("section");
  const roll_number = formData.get("roll_number");
  const phone = formData.get("phone");

  if (!name || !className || !section || !roll_number || !phone) {
    return NextResponse.redirect(new URL("/teacher/students/add", request.url), 303);
  }

  const admission_date = formData.get("admission_date");

  await db.insert(students).values({
    name,
    class: className,
    section,
    roll_number,
    phone,
    admission_no: formData.get("admission_no") || null,
    admission_date: admission_date ? new Date(admission_date) : new Date(),
    gender: formData.get("gender") || null,
    dob: formData.get("dob") || null,
    father_name: formData.get("father_name") || null,
    mother_name: formData.get("mother_name") || null,
    guardian_name: formData.get("guardian_name") || null,
    alt_phone: formData.get("alt_phone") || null,
    religion: formData.get("religion") || null,
    caste: formData.get("caste") || null,
    address: formData.get("address") || null,
    academic_year: formData.get("academic_year") || null,
    fee_status: formData.get("fee_status") || "pending",
    user_id: teacher.user_id,
  });

  return NextResponse.redirect(new URL("/teacher/students", request.url), 303);
}