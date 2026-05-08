import { redirect } from "next/navigation";
import { db } from "@/lib/db-drizzle";
import { teachers } from "@/lib/schema";
import { setFlash } from "@/lib/flash";
import { addTeacher } from "@/app/actions";

export default function AddTeacherPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Teacher</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <form action={addTeacher} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="qualification"
                required
                placeholder="e.g., M.Sc, B.Ed"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium"
            >
              Save Teacher
            </button>
            <a
              href="/teachers"
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
