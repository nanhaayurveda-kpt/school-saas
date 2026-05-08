// app/certificates/issue/page.js

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { certificates, students } from "@/lib/schema";
import { setFlash } from "@/lib/flash";
import { issueCertificate } from '@/app/actions'

export default async function IssueCertificatePage() {
  const allStudents = await db
    .select()
    .from(students)
    .orderBy(students.class, students.name);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Issue Certificate</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          TC · Character · Bonafide · Birth
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form action={issueCertificate} className="space-y-4">

          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student <span className="text-red-500">*</span>
            </label>
            <select
              name="student_id"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select student...</option>
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — Class {s.class} {s.section || ""}
                  {s.roll_number ? ` · Roll ${s.roll_number}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Certificate Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: "tc", label: "🔴 Transfer Certificate" },
                { val: "character", label: "🔵 Character Certificate" },
                { val: "bonafide", label: "🟢 Bonafide Certificate" },
                { val: "birth", label: "🟣 Birth Certificate" },
              ].map(({ val, label }) => (
                <label
                  key={val}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg p-3 cursor-pointer has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50"
                >
                  <input
                    type="radio"
                    name="cert_type"
                    value={val}
                    required
                    className="accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Issue Date & Serial No */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="issue_date"
                defaultValue={today}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial No
              </label>
              <input
                type="text"
                name="serial_no"
                placeholder="e.g. TC/2024/001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Conduct */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conduct
            </label>
            <select
              name="conduct"
              defaultValue="Good"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Satisfactory">Satisfactory</option>
            </select>
          </div>

          {/* Last Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Class Attended{" "}
              <span className="text-gray-400 font-normal text-xs">(for TC)</span>
            </label>
            <input
              type="text"
              name="last_class"
              placeholder="e.g. Class 8 — Section A"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Last Exam Passed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Exam Passed{" "}
              <span className="text-gray-400 font-normal text-xs">(for TC)</span>
            </label>
            <input
              type="text"
              name="last_exam_passed"
              placeholder="e.g. Class 7 Annual Exam 2023"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason / Purpose{" "}
              <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <input
              type="text"
              name="reason"
              placeholder="e.g. Admission in another school"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Custom Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes{" "}
              <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <textarea
              name="custom_content"
              rows={3}
              placeholder="Any additional details to print on the certificate..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium"
            >
              Issue Certificate
            </button>
            <a
              href="/certificates"
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}