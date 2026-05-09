export default function TeacherLoginPage({ searchParams }) {
  const error = searchParams?.error;
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Teacher Login</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your 6-digit PIN</p>
        </div>

        <form action="/api/teacher-login" method="POST" className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
              Invalid PIN. Please try again.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="pin"
              required
              maxLength={6}
              minLength={6}
              placeholder="••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-xl tracking-widest"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}