import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
  const { roll_number, password } = await request.json();

  const result = await db.select().from(students).where(eq(students.roll_number, roll_number));

  if (result.length === 0) {
    return NextResponse.json({ success: false, message: "Student not found" }, { status: 401 });
  }

  const student = result[0];

  if (student.password !== password) {
    return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("student_session", String(student.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });

  return response;
}