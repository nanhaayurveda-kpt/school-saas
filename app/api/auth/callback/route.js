import { google } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { db } from "@/lib/db";
import { users, pre_activations as preActivations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function redirectWithCookie(request, path, token) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const codeVerifier = cookieStore.get("code_verifier")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const googleRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const googleUser = await googleRes.json();
    if (!googleUser.email) {
      return NextResponse.redirect(
        new URL("/login?error=invalid", request.url),
      );
    }

    // ✅ Email whitelist — सिर्फ DEVELOPER_EMAIL में listed emails login कर सकें
    const allowedEmails = (process.env.DEVELOPER_EMAIL || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = googleUser.email.toLowerCase();

    if (!allowedEmails.includes(userEmail)) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", request.url),
      );
    }

    let existing = await db
      .select()
      .from(users)
      .where(eq(users.email, "prasad.kamta@gmail.com"));
    let user;

    if (existing.length === 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);

      await db.insert(users).values({
        email: googleUser.email,
        name: googleUser.name || "",
        status: "trial",
        expiry_date: expiry.toISOString(),
        reminder_sent: 0,
      });

      const preAct = await db
        .select()
        .from(preActivations)
        .where(eq(preActivations.email, googleUser.email))
        .limit(1);

      if (preAct.length > 0) {
        const activeExpiry = new Date();
        activeExpiry.setFullYear(activeExpiry.getFullYear() + 1);

        await db
          .update(users)
          .set({
            status: "active",
            expiry_date: activeExpiry.toISOString(),
            reminder_sent: 0,
          })
          .where(eq(users.email, googleUser.email));

        await db
          .delete(preActivations)
          .where(eq(preActivations.email, googleUser.email));
      }

      existing = await db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email));
    }

    user = existing[0];

    const token = await createSession(
      user.id,
      user.email,
      user.name,
      user.status,
      user.expiry_date,
    );

    // prasad.kamta@gmail.com को हमेशा dashboard — कोई expiry नहीं
    if (userEmail === "prasad.kamta@gmail.com") {
      return redirectWithCookie(request, "/dashboard", token);
    }

    if (user.status === "active") {
      return redirectWithCookie(request, "/dashboard", token);
    }

    const now = new Date();
    const expiryDate = user.expiry_date ? new Date(user.expiry_date) : null;

    if (user.status === "trial" && expiryDate && now < expiryDate) {
      return redirectWithCookie(request, "/dashboard", token);
    }

    return redirectWithCookie(request, "/expired", token);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/login?error=failed", request.url));
  }
}
