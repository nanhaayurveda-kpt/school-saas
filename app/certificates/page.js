// app/certificates/page.js

export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { certificates, students } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

const CERT_LABELS = {
  tc: "Transfer Certificate",
  character: "Character Certificate",
  bonafide: "Bonafide Certificate",
  birth: "Birth Certificate",
};

const CERT_COLORS = {
  tc: "bg-red-100 text-red-700",
  character: "bg-blue-100 text-blue-700",
  bonafide: "bg-green-100 text-green-700",
  birth: "bg-purple-100 text-purple-700",
};

export default async function CertificatesPage({ searchParams }) {
  const params = await searchParams;
  const filterType = params?.type || "";
  const filterClass = params?.class || "";

  const allStudents = await db.select().from(students).orderBy(students.name);
  const classes = [...new Set(allStudents.map((s) => s.class))].sort();

  const allCerts = await db
    .select({
      id: certificates.id,
      cert_type: certificates.cert_type,
      issue_date: certificates.issue_date,
      serial_no: certificates.serial_no,
      conduct: certificates.conduct,
      created_at: certificates.created_at,
      student_id: certificates.student_id,
      student_name: students.name,
      student_class: students.class,
      student_section: students.section,
      roll_number: students.roll_number,
      admission_no: students.admission_no,
    })
    .from(certificates)
    .leftJoin(students, eq(certificates.student_id, students.id))
    .orderBy(desc(certificates.created_at));

  const filtered = allCerts.filter((c) => {
    const matchType = !filterType || c.cert_type === filterType;
    const matchClass = !filterClass || c.student_class === filterClass;
    return matchType && matchClass;
  });

  const counts = {
    tc: allCerts.filter((c) => c.cert_type === "tc").length,
    character: allCerts.filter((c) => c.cert_type === "character").length,
    bonafide: allCerts.filter((c) => c.cert_type === "bonafide").length,
    birth: allCerts.filter((c) => c.cert_type === "birth").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            TC · Character · Bonafide · Birth
          </p>
        </div>
        <Link
          href="/certificates/issue"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Issue
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-red-600">{counts.tc}</p>
          <p className="text-xs text-red-500">Transfer (TC)</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-blue-600">{counts.character}</p>
          <p className="text-xs text-blue-500">Character</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-green-600">{counts.bonafide}</p>
          <p className="text-xs text-green-500">Bonafide</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-purple-600">{counts.birth}</p>
          <p className="text-xs text-purple-500">Birth</p>
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-3">
        {[
          { val: "", label: "All" },
          { val: "tc", label: "TC" },
          { val: "character", label: "Character" },
          { val: "bonafide", label: "Bonafide" },
          { val: "birth", label: "Birth" },
        ].map(({ val, label }) => (
          <a
            key={val}
            href={`/certificates?type=${val}&class=${filterClass}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              filterType === val
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Class Filter */}
      <form method="GET" action="/certificates" className="flex gap-2 mb-4">
        <input type="hidden" name="type" value={filterType} />
        <select
          name="class"
          defaultValue={filterClass}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              Class {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Filter
        </button>
        {filterClass && (
          <a
            href={`/certificates?type=${filterType}`}
            className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm"
          >
            ✕
          </a>
        )}
      </form>

      {/* Certificate List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          No certificates issued yet.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex justify-between items-start"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {cert.student_name || "—"}
                  </p>
                  <span
                    className={`shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${
                      CERT_COLORS[cert.cert_type] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {CERT_LABELS[cert.cert_type] || cert.cert_type}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Class {cert.student_class || "—"} {cert.student_section || ""}
                  {cert.roll_number ? ` · Roll ${cert.roll_number}` : ""}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Issued: {cert.issue_date}
                  {cert.serial_no ? ` · Serial: ${cert.serial_no}` : ""}
                </p>
              </div>
              <div className="ml-3 shrink-0">
                <Link
                  href={`/certificates/${cert.id}`}
                  className="text-xs text-indigo-600 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg"
                >
                  🖨️ Print
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}