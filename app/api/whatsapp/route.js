// app/api/whatsapp/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, attendance } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  // उस date के absent students निकालो
  const absentRecords = await db
    .select()
    .from(attendance)
    .where(eq(attendance.date, date));

  const absentIds = absentRecords
    .filter((a) => a.status === "absent")
    .map((a) => a.student_id);

  if (absentIds.length === 0) {
    return NextResponse.json({ message: "कोई absent नहीं।", links: [] });
  }

  const allStudents = await db.select().from(students);
  const absentStudents = allStudents.filter((s) => absentIds.includes(s.id));

  const links = absentStudents
    .filter((s) => s.parent_phone)
    .map((s) => {
      const phone = s.parent_phone.replace(/\D/g, "");
      const fullPhone = phone.startsWith("91") ? phone : `91${phone}`;
      const message = encodeURIComponent(
        `प्रिय ${s.parent_name || "अभिभावक"},\n\nआपके बच्चे ${s.name} (Class ${s.class}${s.section ? " " + s.section : ""}) आज ${date} को स्कूल में अनुपस्थित हैं।\n\nकृपया सूचित करें।\n\n— निशांत स्कूल`
      );
      return {
        student_name: s.name,
        class: `${s.class} ${s.section || ""}`.trim(),
        parent_name: s.parent_name || "—",
        parent_phone: s.parent_phone,
        whatsapp_link: `https://wa.me/${fullPhone}?text=${message}`,
      };
    });

  return NextResponse.json({ date, total_absent: links.length, links });
}