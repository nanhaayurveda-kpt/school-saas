"use client";

import { useState } from "react";

export default function SettingsForm({ settings }) {
  const s = settings || {};
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      method="POST"
      action="/api/settings/save"
      encType="multipart/form-data"
      onSubmit={() => setSubmitting(true)}
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
          disabled={submitting}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}