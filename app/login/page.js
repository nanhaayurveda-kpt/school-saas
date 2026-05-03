"use client";

export default function LoginPage() {
  return (
    ...
    <button
      onClick={() => window.location.href = "/api/auth/login"}
      className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
    >
      <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
      Google से Login करें
    </button>
    ...
  );
}