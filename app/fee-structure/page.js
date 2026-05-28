export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import {
  fee_structures,
  fee_packages,
  fee_package_items,
  users,
} from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function FeeStructurePage({ searchParams }) {
  const params = await searchParams;
  const tab = params?.tab || "structure";

  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];

  // Fee Structures
  const allStructures = await db
    .select()
    .from(fee_structures)
    .where(eq(fee_structures.user_id, 2))
    .orderBy(fee_structures.class);

  const classes = [...new Set(allStructures.map((s) => s.class))].sort(
    (a, b) => {
      const na = parseInt(a),
        nb = parseInt(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    },
  );

  // Fee Packages with items
  const allPackages = await db
    .select()
    .from(fee_packages)
    .where(eq(fee_packages.user_id, 2))
    .orderBy(fee_packages.class);

  const packageIds = allPackages.map((p) => p.id);
  const allItems =
    packageIds.length > 0
      ? await db
          .select()
          .from(fee_package_items)
          .where(inArray(fee_package_items.package_id, packageIds))
      : [];

  // attach items to packages
  const packagesWithItems = allPackages.map((pkg) => ({
    ...pkg,
    items: allItems.filter((item) => item.package_id === pkg.id),
  }));

  const packageClasses = [...new Set(allPackages.map((p) => p.class))].sort(
    (a, b) => {
      const na = parseInt(a),
        nb = parseInt(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    },
  );

  const feeTypeLabel = {
    monthly: "Monthly Fee",
    admission: "Admission Fee",
    exam: "Exam Fee",
    transport: "Transport Fee",
    misc: "Miscellaneous",
  };

  const months = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fee Structure</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Class-wise fee definition
          </p>
        </div>
        {tab === "structure" ? (
          <Link
            href="/fee-structure/add"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add
          </Link>
        ) : (
          <Link
            href="/fee-structure/packages/add"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Package
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <a
          href="/fee-structure?tab=structure"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "structure"
              ? "bg-indigo-600 text-white"
              : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          Structure
        </a>
        <a
          href="/fee-structure?tab=packages"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "packages"
              ? "bg-indigo-600 text-white"
              : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          Packages
        </a>
      </div>

      {/* Structure Tab */}
      {tab === "structure" && (
        <>
          {allStructures.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
              No fee structure defined yet. Add your first entry.
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((cls) => {
                const clsStructures = allStructures.filter(
                  (s) => s.class === cls,
                );
                return (
                  <div
                    key={cls}
                    className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden"
                  >
                    <div className="bg-indigo-600 px-4 py-2.5">
                      <span className="text-white font-bold text-sm">
                        Class {cls}
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {clsStructures.map((s) => (
                        <div
                          key={s.id}
                          className="px-4 py-3 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {feeTypeLabel[s.fee_type] || s.fee_type}
                            </p>
                            {s.academic_year && (
                              <p className="text-xs text-gray-400">
                                {s.academic_year}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-sm font-bold text-indigo-600">
                              ₹{s.amount}
                            </p>
                            <Link
                              href={`/fee-structure/${s.id}/edit`}
                              className="text-xs text-indigo-600 font-medium"
                            >
                              Edit
                            </Link>
                            <form
                              method="POST"
                              action="/api/fee-structure/delete"
                            >
                              <input type="hidden" name="id" value={s.id} />
                              <button
                                type="submit"
                                className="text-xs text-red-500 font-medium"
                              >
                                Delete
                              </button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Packages Tab */}
      {tab === "packages" && (
        <>
          {packagesWithItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
              No packages defined yet. Create your first package.
            </div>
          ) : (
            <div className="space-y-4">
              {packageClasses.map((cls) => {
                const clsPkgs = packagesWithItems.filter(
                  (p) => p.class === cls,
                );
                return (
                  <div
                    key={cls}
                    className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden"
                  >
                    <div className="bg-indigo-600 px-4 py-2.5">
                      <span className="text-white font-bold text-sm">
                        Class {cls}
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {clsPkgs.map((pkg) => (
                        <div key={pkg.id} className="px-4 py-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {pkg.month} · {pkg.academic_year}
                              </p>
                              <div className="mt-1 space-y-0.5">
                                {pkg.items.map((item) => (
                                  <p
                                    key={item.id}
                                    className="text-xs text-gray-500"
                                  >
                                    {feeTypeLabel[item.fee_type] ||
                                      item.fee_type}{" "}
                                    — ₹{item.amount}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-3 shrink-0">
                              <p className="text-sm font-bold text-indigo-600">
                                ₹{pkg.total_amount}
                              </p>
                              <Link
                                href={`/fee-structure/packages/${pkg.id}/edit`}
                                className="text-xs text-indigo-600 font-medium"
                              >
                                Edit
                              </Link>
                              <form
                                method="POST"
                                action="/api/fee-structure/packages/delete"
                              >
                                <input type="hidden" name="id" value={pkg.id} />
                                <button
                                  type="submit"
                                  className="text-xs text-red-500 font-medium"
                                >
                                  Delete
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
