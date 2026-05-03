"use client";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-3">🏫</div>
        <div className="text-2xl font-bold text-indigo-700 mb-1">Nishant School</div>
        <div className="text-gray-400 text-xs mb-6">School Management Software</div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            "Student Records",
            "Fee Tracking",
            "Attendance",
            "Exam Results",
          ].map((f) => (
            <div key={f} className="bg-indigo-50 rounded-lg px-2 py-1.5 text-xs text-indigo-700 font-medium">
              {f}
            </div>
          ))}
        </div>

        <button
          onClick={() => { window.location.href = "/api/auth/login"; }}
          className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Login with Google
        </button>
        <p className="text-xs text-gray-400 mt-4">First time? 7 days completely free.</p>
      </div>
    </div>
  );
}