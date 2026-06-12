import { db } from "@/lib/db";
import { notices } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { MASTER_USER_ID } from "@/lib/config";

export async function GET(request, { params }) {
  // ─── ताला: सिर्फ logged-in admin ────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");
  const session = await getSession(token);
  if (!session) redirect("/login");

  const { id } = await params;
  const noticeId = parseInt(id, 10);
  if (!isNaN(noticeId)) {
    await db
      .delete(notices)
      .where(and(eq(notices.id, noticeId), eq(notices.user_id, MASTER_USER_ID)));
  }

  redirect("/notices");
}