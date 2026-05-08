// app/students/import/page.js
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { students } from "@/lib/schema";
import { setFlash } from "@/lib/flash";
import { importStudents } from '@/app/actions'

export default function ImportPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">📥 Bulk Import Students</h1>
        <p className="text-gray-500 text-xs mt-1">
          CSV paste करो — एक बार में पूरी class
        </p>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 text-sm text-indigo-800">
        <p className="font-semibold mb-2">CSV Format (यही क्रम रखो):</p>
        <code className="block bg-white rounded p-2 text-xs text-gray-700 leading-relaxed">
          name, class, section, roll_number, parent_name, parent_phone<br />
          Rahul Sharma, 10, A, 1, Ramesh Sharma, 9876543210<br />
          Priya Singh, 10, A, 2, Rajesh Singh, 9812345678
        </code>
        <p className="text-xs mt-2 text-indigo-600">
          ✓ पहली row header है — अपने आप skip होगी<br />
          ✓ Duplicate roll number वाले skip होंगे, बाकी save होंगे
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl">
        <form action={importStudents} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV Data यहाँ paste करो <span className="text-red-500">*</span>
            </label>
            <textarea
              name="csv_data"
              required
              rows={12}
              placeholder="name, class, section, roll_number, parent_name, parent_phone&#10;Rahul Sharma, 10, A, 1, Ramesh Sharma, 9876543210"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
              📥 Import करो
            </button>
            <a href="/students"
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}