import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fees, students, school_settings } from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";
import { sendWhatsApp } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const DAY = 1000 * 60 * 60 * 24;

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    let sent = 0;

    const settingsRows = await db
      .select()
      .from(school_settings)
      .where(eq(school_settings.user_id, 2));
    const schoolName = settingsRows[0]?.school_name || "School";

    const unpaidFees = await db
      .select()
      .from(fees)
      .where(
        and(
          eq(fees.user_id, 2),
          inArray(fees.status, ["pending", "overdue"]),
        ),
      );

    const allStudents = await db
      .select()
      .from(students)
      .where(eq(students.user_id, 2));
    const studentMap = {};
    allStudents.forEach((s) => {
      studentMap[s.id] = s;
    });

    for (const fee of unpaidFees) {
      if (!fee.due_date) continue;

      const daysOverdue = Math.floor((now - new Date(fee.due_date)) / DAY);
      if (daysOverdue < 20) continue;

      const count = fee.reminder_count || 0;

      if (count >= 2) continue;

      if (count === 1) {
        if (!fee.last_reminder_at) continue;
        const daysSince = Math.floor(
          (now - new Date(fee.last_reminder_at)) / DAY,
        );
        if (daysSince < 7) continue;
      }

      const student = studentMap[fee.student_id];
      if (!student) continue;
      const phone = student.phone || student.alt_phone;
      if (!phone) continue;

      const msg =
        `Dear Parent,\nThis is a reminder from ${schoolName}.\n` +
        `Fees for ${student.name} (Class ${student.class}${student.section ? "-" + student.section : ""}) ` +
        `for ${fee.month || ""} ${fee.academic_year || ""} amounting to Rs.${fee.amount} ` +
        `is overdue by ${daysOverdue} days. Please pay at the earliest.\nThank you.`;

      const ok = await sendWhatsApp(phone, msg);
      if (ok) {
        await db
          .update(fees)
          .set({ last_reminder_at: now, reminder_count: count + 1 })
          .where(eq(fees.id, fee.id));
        sent++;
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}