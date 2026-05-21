export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { fee_structures, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function FeeStructurePage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];

  const allStructures = await db
    .select()
    .from(fee_structures)
    .where(eq(fee_structures.user_id, 2))
    .orderBy(fee_structures.class);

  const classes = [...new Set(allStructures.map((s) => s.class))].sort();

  const feeTypeLabel = {
    monthly: "Monthly Fee",
    admission: "Admission Fee",
    exam: "Exam Fee",
    transport: "Transport Fee",
    misc: "Miscellaneous",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fee Structure</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Class-wise fee definition
          </p>
        </div>
        <Link
          href="/fee-structure/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add
        </Link>
      </div>

      {allStructures.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No fee structure defined yet. Add your first entry.
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls) => {
            const clsStructures = allStructures.filter((s) => s.class === cls);
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
                        <form method="POST" action="/api/fee-structure/delete">
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
    </div>
  );
}
