import { db } from "@/lib/db";
import { teachers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

// Best-effort in-memory limiter: per phone, 5 गलत कोशिशें / 10 मिनट
const failedAttempts = new Map();
const MAX_FAILS = 5;
const WINDOW_MS = 10 * 60 * 1000;

function isBlocked(phone) {
  const rec = failedAttempts.get(phone);
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) {
    failedAttempts.delete(phone);
    return false;
  }
  return rec.count >= MAX_FAILS;
}

function recordFail(phone) {
  const rec = failedAttempts.get(phone);
  if (!rec || Date.now() - rec.first > WINDOW_MS) {
    failedAttempts.set(phone, { count: 1, first: Date.now() });
  } else {
    rec.count++;
  }
}

export async function POST(request) {
  const formData = await request.formData();
  const pin = formData.get("pin");
  const phone = formData.get("phone");

  if (!pin || !phone) {
    return NextResponse.redirect(new URL("/teacher-login?error=1", request.url));
  }

  if (isBlocked(phone)) {
    return NextResponse.redirect(
      new URL("/teacher-login?error=blocked", request.url),
    );
  }

  const result = await db.select().from(teachers).where(
    and(eq(teachers.pin, pin), eq(teachers.phone, phone))
  );
  const teacher = result[0];

  if (!teacher) {
    recordFail(phone);
    // गलत कोशिश को धीमा करो — brute force का खर्च हजार गुना
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.redirect(new URL("/teacher-login?error=1", request.url));
  }

  failedAttempts.delete(phone);

  const token = await new SignJWT({
    teacherId: teacher.id,
    teacherName: teacher.name,
    role: "teacher",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .sign(SECRET);

  const response = NextResponse.redirect(new URL("/teacher/dashboard", request.url));
  response.cookies.set("teacher_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return response;
}