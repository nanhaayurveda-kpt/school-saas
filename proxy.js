import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
// 'next/headers' को हटा दिया गया है क्योंकि इसकी यहाँ ज़रूरत नहीं है

// Next.js 16 का नया Proxy फ़ंक्शन (आपका लिखा नाम बिल्कुल सही था)
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Teacher routes — teacher_session से protect
  if (pathname.startsWith("/teacher/")) {
    const teacherToken = request.cookies.get("teacher_session")?.value;
    if (!teacherToken) {
      return NextResponse.redirect(new URL("/teacher-login", request.url));
    }
    return NextResponse.next();
  }

  // Admin routes — session से protect
  const token = request.cookies.get("session")?.value;
  const session = token ? await getSession(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/students/:path*",
    "/teachers/:path*",
    "/fees/:path*",
    "/attendance/:path*",
    "/certificates/:path*",
    "/exams/:path*",
    "/settings/:path*",
    "/reports/:path*",
    "/notices/:path*",
    "/timetable/:path*",
    "/transport/:path*",
    "/admissions/:path*",
    "/marksheet/:path*",
    "/promote/:path*",
    "/teacher/:path*",
  ],
};
