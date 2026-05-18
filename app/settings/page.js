export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { school_settings, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";
import { saveSettings } from "@/app/actions";
import Link from "next/link";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");

  const session = await getSession(token);
  if (!session) redirect("/login");

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];
  if (!user) redirect("/login");

  const result = await db
    .select()
    .from(school_settings)
    .where(eq(school_settings.user_id, user.id));
  const s = result[0] || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">School Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          This information will appear on receipts and report cards
        </p>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 max-w-2xl">
        <p className="text-xs text-gray-500 uppercase font-medium mb-3">
          Other Settings
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/settings/periods"
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-lg hover:bg-indigo-100 text-sm font-medium"
          >
            ⏱ Period Timings
            <span className="text-xs text-indigo-400">
              School-wide schedule
            </span>
          </Link>
          <Link
            href="/fees/structure"
            className="inline-flex items-center gap-2 bg-gray-50 text-gray-700 border border-gray-100 px-4 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium"
          >
            💰 Fee Structure
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <form
          action={saveSettings}
          encType="multipart/form-data"
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="school_name"
              required
              defaultValue={s.school_name || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              rows={3}
              defaultValue={s.address || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={s.phone || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={s.email || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Principal Name
            </label>
            <input
              type="text"
              name="principal_name"
              defaultValue={s.principal_name || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Affiliation No
              </label>
              <input
                type="text"
                name="affiliation_no"
                defaultValue={s.affiliation_no || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Code
              </label>
              <input
                type="text"
                name="school_code"
                defaultValue={s.school_code || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Logo
            </label>
            {s.logo_url && (
              <img
                src={s.logo_url}
                alt="Current Logo"
                className="mb-3 h-16 object-contain"
              />
            )}
            <input
              type="file"
              name="logo"
              accept="image/*"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG supported. Max 4.5MB.
            </p>
          </div>
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Online Payment (UPI)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              UPI ID and QR code shown on fee payment page
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID
              </label>
              <input
                type="text"
                name="upi_id"
                defaultValue={s.upi_id || ""}
                placeholder="e.g. boism-8840202071@boi"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI QR Code
              </label>
              {s.qr_code_url && (
                <img
                  src={s.qr_code_url}
                  alt="Current QR"
                  className="mb-3 h-32 object-contain border border-gray-200 rounded-lg"
                />
              )}
              <input
                type="file"
                name="qr_code"
                accept="image/*"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Upload your school's UPI QR code image
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
