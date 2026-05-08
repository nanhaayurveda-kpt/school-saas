import { db } from '@/lib/db'
import { fees, students, school_settings } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import PrintButton from './PrintButton'

export default async function FeeReceiptPage({ params }) {
  const { id } = await params

  const [fee] = await db
    .select({
      id: fees.id,
      amount: fees.amount,
      due_date: fees.due_date,
      paid_date: fees.paid_date,
      status: fees.status,
      student_name: students.name,
      student_class: students.class,
      student_section: students.section,
      roll_number: students.roll_number,
      parent_name: students.parent_name,
      parent_phone: students.parent_phone,
    })
    .from(fees)
    .leftJoin(students, eq(fees.student_id, students.id))
    .where(eq(fees.id, parseInt(id)))

  if (!fee) return <div className="p-8 text-red-500">Receipt not found.</div>
  if (fee.status !== 'paid') return <div className="p-8 text-yellow-600">This fee is not paid yet.</div>

  const settingsResult = await db.select().from(school_settings)
  const settings = settingsResult[0] || {}

  const receiptNo = `RCP-${String(fee.id).padStart(5, '0')}`
  const paidDate = fee.paid_date
    ? new Date(fee.paid_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Screen controls */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Receipt</h1>
          <p className="text-gray-500 text-sm mt-1">{receiptNo}</p>
        </div>
        <div className="flex gap-3">
          <a href="/fees"
            className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium">
            ← Back
          </a>
          <PrintButton />
        </div>
      </div>

      {/* Receipt */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto p-8 print:shadow-none print:border-none">

        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-6 mb-6">
          {settings.logo_url && (
            <img src={settings.logo_url} alt="logo" className="h-16 object-contain mx-auto mb-3" />
          )}
          <h2 className="text-2xl font-bold text-indigo-700">{settings.school_name || "निशांत स्कूल"}</h2>
          {settings.address && <p className="text-gray-400 text-xs mt-1">{settings.address}</p>}
          <p className="text-gray-500 text-sm mt-1">Fee Payment Receipt</p>
        </div>

        {/* Receipt No & Date */}
        <div className="flex justify-between mb-6 text-sm">
          <div>
            <span className="text-gray-500">Receipt No:</span>
            <span className="font-bold text-gray-900 ml-2">{receiptNo}</span>
          </div>
          <div>
            <span className="text-gray-500">Date:</span>
            <span className="font-medium text-gray-900 ml-2">{paidDate}</span>
          </div>
        </div>

        {/* Student Details */}
        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Student Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="font-medium text-gray-900 ml-2">{fee.student_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Class:</span>
              <span className="font-medium text-gray-900 ml-2">{fee.student_class} {fee.student_section}</span>
            </div>
            <div>
              <span className="text-gray-500">Roll No:</span>
              <span className="font-medium text-gray-900 ml-2">{fee.roll_number || '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Parent:</span>
              <span className="font-medium text-gray-900 ml-2">{fee.parent_name || '—'}</span>
            </div>
          </div>
        </div>

        {/* Fee Details */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="min-w-full">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Description</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-indigo-700 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-4 text-sm text-gray-700">School Fee</td>
                <td className="px-5 py-4 text-sm text-gray-900 text-right">₹{fee.amount}</td>
              </tr>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td className="px-5 py-4 text-sm font-bold text-gray-900">Total Paid</td>
                <td className="px-5 py-4 text-sm font-bold text-green-600 text-right">₹{fee.amount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Status */}
        <div className="flex justify-center mb-8">
          <span className="px-6 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            ✅ Payment Received
          </span>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 flex justify-between text-xs text-gray-400 print:mt-8">
          <span>निशांत स्कूल सॉफ्टवेयर</span>
          <span>Authorised Signature: _______________</span>
        </div>
      </div>
    </div>
  )
}