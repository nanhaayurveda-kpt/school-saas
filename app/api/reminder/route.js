// app/api/reminder/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq, and, lte, gt } from "drizzle-orm";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const now = new Date();
    let sent = 0;

    // ── 1. Trial 6th day reminder ──────────────────────────────
    const trialUsers = await db
      .select()
      .from(users)
      .where(and(eq(users.status, "trial"), eq(users.reminder_sent, 0)));

    for (const user of trialUsers) {
      if (!user.email || !user.trial_start) continue;

      const trialStart = new Date(user.trial_start);
      const daysPassed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));

      if (daysPassed >= 6) {
        await resend.emails.send({
          from: "निशांत स्कूल सॉफ्टवेयर <no-reply@nishantsoftwares.in>",
          to: [user.email],
          subject: "निशांत स्कूल सॉफ्टवेयर — Trial कल समाप्त होगा",
          html: `
            <p>नमस्ते ${user.name || ""}!</p>
            <p>आपका <strong>7 दिन का मुफ्त trial कल समाप्त</strong> हो जाएगा।</p>
            <p>सॉफ्टवेयर जारी रखने के लिए अभी खरीदें:</p>
            <p>
              <strong>पहली बार: ₹4,999</strong> (1 साल शामिल)<br/>
              उसके बाद server खर्च मात्र ₹2,500/वर्ष
            </p>
            <p>
              <a href="https://nishantsoftwares.in/payment?software=school&email=${encodeURIComponent(user.email)}" 
                 style="background:#4f46e5;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
                अभी खरीदें
              </a>
            </p>
            <p style="color:#666;font-size:12px;">
              📞 9996865069 · 
              <a href="https://wa.me/919996865069">WhatsApp</a>
            </p>
          `,
        });

        await db
          .update(users)
          .set({ reminder_sent: 1 })
          .where(eq(users.email, user.email));

        sent++;
      }
    }

    // ── 2. Renewal reminder — expiry से 7 दिन पहले से रोज ──────
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);

    const renewalUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.status, "active"),
          lte(users.expiry_date, in7Days.toISOString()),
          gt(users.expiry_date, now.toISOString()),
        ),
      );

    for (const user of renewalUsers) {
      if (!user.email) continue;

      const expiry = new Date(user.expiry_date);
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

      await resend.emails.send({
        from: "निशांत स्कूल सॉफ्टवेयर <no-reply@nishantsoftwares.in>",
        to: [user.email],
        subject: `निशांत स्कूल सॉफ्टवेयर — Subscription ${daysLeft} दिन में समाप्त`,
        html: `
          <p>नमस्ते ${user.name || ""}!</p>
          <p>आपका <strong>निशांत स्कूल सॉफ्टवेयर subscription ${daysLeft} दिन में समाप्त</strong> हो जाएगा।</p>
          <p>सेवा जारी रखने के लिए अभी नवीनीकरण करें:</p>
          <p><strong>Server खर्च: ₹2,500/वर्ष</strong></p>
          <p>
            <a href="https://nishantsoftwares.in/payment?software=school&email=${encodeURIComponent(user.email)}"
               style="background:#4f46e5;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
              अभी नवीनीकरण करें
            </a>
          </p>
          <p style="color:#666;font-size:12px;">
            📞 9996865069 · 
            <a href="https://wa.me/919996865069">WhatsApp</a>
          </p>
        `,
      });

      sent++;
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
