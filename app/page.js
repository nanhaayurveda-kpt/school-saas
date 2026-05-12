export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

const SCHOOL_EXE_URL =
  "https://github.com/kp1153/school-saas/releases/download/v1.0.0/EduSaaS%20School%20Setup%200.1.0.exe";

const features = [
  {
    icon: "🎓",
    title: "Student Management",
    desc: "Complete records for every student — name, class, section, roll number, parent name and phone. Add one by one or import hundreds at once.",
  },
  {
    icon: "💰",
    title: "Fee Collection & Receipt",
    desc: "Record monthly fees, print receipts instantly. See who paid, who hasn't. Send WhatsApp reminders to defaulters in one click.",
  },
  {
    icon: "✅",
    title: "Daily Attendance",
    desc: "Mark class-wise attendance every day. See present, absent and unmarked count instantly. Send WhatsApp alert to absent students' parents.",
  },
  {
    icon: "🔑",
    title: "Teacher Attendance via PIN",
    desc: "Each teacher gets a 6-digit PIN from the Principal. They log in from their own mobile, mark attendance for their class only. Principal sees it instantly.",
  },
  {
    icon: "📝",
    title: "Exams & Results",
    desc: "Schedule exams, enter marks — grade, pass/fail and class average calculated automatically. Print report cards.",
  },
  {
    icon: "📄",
    title: "Marksheet",
    desc: "Quarterly, half-yearly and annual marksheets for the entire class at once. Print directly or share as PDF on WhatsApp.",
  },
  {
    icon: "🏅",
    title: "Certificates",
    desc: "Transfer Certificate, Character, Bonafide and Birth Certificate — generated in one click with school name, logo and Principal's name. Ready to print.",
  },

  {
    icon: "🚌",
    title: "Transport Management",
    desc: "Manage bus routes, stops, monthly fees, driver and vehicle details. Assign students to routes and generate transport receipts.",
  },
  {
    icon: "📊",
    title: "Reports",
    desc: "Class-wise student count, fee collection, attendance percentage and exam results — all on one page.",
  },
  {
    icon: "📣",
    title: "Notice Board",
    desc: "Post school notices with priority. Urgent notices shown with red badge. Guardians see them instantly on their portal.",
  },
  {
    icon: "📱",
    title: "Mobile + Desktop",
    desc: "Works as an Android app on mobile and as a Windows application on computer. One purchase covers both.",
  },
];

const howTo = [
  {
    step: "1",
    icon: "🔐",
    title: "Login with Google",
    desc: "Open the website and click Admin Login. Sign in with your school Gmail account — no password to create or remember.",
  },
  {
    step: "2",
    icon: "⚙️",
    title: "Setup School Details",
    desc: "Go to Settings — enter school name, address, Principal name and upload your school logo. Done once — appears on every receipt and certificate automatically.",
  },
  {
    step: "3",
    icon: "🎓",
    title: "Add Students & Teachers",
    desc: "Add students one by one or import hundreds from a file. Add teachers and set a 6-digit PIN for each — their mobile login key.",
  },
  {
    step: "4",
    icon: "👨‍🏫",
    title: "Assign Classes to Teachers",
    desc: "Go to each teacher's profile and assign which class and subject they teach. Teachers will see only their assigned class when they log in.",
  },
  {
    step: "5",
    icon: "📱",
    title: "Start Daily Work",
    desc: "Mark attendance, collect fees, schedule exams — all on mobile, from anywhere, any time.",
  },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await getSession(token) : null;
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-5">
            🏫 School Management Software
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Everything Your School Needs
            <br />
            <span className="text-indigo-600">In One Place — On Mobile</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Students · Fees · Attendance · Exams · Certificates · Reports — all
            in one place.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm"
            >
              Admin Login →
            </Link>
            <Link
              href="/teacher-login"
              className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 font-medium text-sm shadow-sm"
            >
              🔑 Teacher Login
            </Link>
            <Link
              href="/student/login"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium text-sm shadow-sm"
            >
              🎓 Student / Parent Login
            </Link>
            <a
              href={SCHOOL_EXE_URL}
              className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-700 font-medium text-sm shadow-sm"
            >
              🖥️ Download Windows App
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            To install on Android: Chrome → ⋮ → Add to Home Screen
          </p>
        </div>

        {/* Features */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            What's Included?
          </h2>
          <p className="text-center text-gray-400 text-sm mb-8">
            11 features — one software, one price
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How To */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            How to Get Started?
          </h2>
          <p className="text-center text-gray-400 text-sm mb-8">
            5 steps — up and running in 10 minutes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {howTo.map((h) => (
              <div
                key={h.step}
                className="bg-white rounded-xl border border-indigo-100 p-4 text-center shadow-sm"
              >
                <div className="w-8 h-8 bg-indigo-600 text-white font-black rounded-full flex items-center justify-center mx-auto mb-2">
                  {h.step}
                </div>
                <div className="text-2xl mb-2">{h.icon}</div>
                <div className="font-bold text-gray-800 text-sm mb-1">
                  {h.title}
                </div>
                <div className="text-gray-500 text-xs leading-relaxed">
                  {h.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How Teacher Takes Attendance */}
        <div className="mb-14 bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            🔑 How Does a Teacher Take Attendance?
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            No email login needed. Just a PIN.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "1",
                text: "Principal sets a 6-digit PIN for each teacher when adding them.",
              },
              {
                step: "2",
                text: "Teacher opens the website on their mobile and goes to Teacher Login.",
              },
              {
                step: "3",
                text: "Teacher enters their PIN — they see only their assigned class.",
              },
              {
                step: "4",
                text: "Teacher marks attendance and clicks Save — Principal sees it instantly.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start"
              >
                <div className="w-7 h-7 bg-indigo-600 text-white font-black rounded-full flex items-center justify-center shrink-0 text-sm">
                  {s.step}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Pricing
          </h2>
          <p className="text-center text-gray-400 text-sm mb-8">
            7 days completely free — no card required
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="rounded-2xl border-2 border-indigo-600 p-6 text-center shadow-lg relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                New Account
              </div>
              <h3 className="text-xl font-bold mb-1 text-gray-700 mt-2">
                First Year
              </h3>
              <div className="text-5xl font-extrabold text-indigo-600 mb-1">
                ₹4,999
              </div>
              <p className="text-gray-400 text-sm mb-4">
                One-time — 1 year included
              </p>
              <Link
                href="/login"
                className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition mb-3 text-sm"
              >
                Try Free for 7 Days
              </Link>
              <a
                href="https://nishantsoftwares.in/school"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition text-sm"
              >
                💳 Buy Now — ₹4,999
              </a>
            </div>
            <div className="rounded-2xl border-2 border-gray-200 p-6 text-center shadow-sm">
              <h3 className="text-xl font-bold mb-1 text-gray-700 mt-2">
                Renewal
              </h3>
              <div className="text-5xl font-extrabold text-indigo-600 mb-1">
                ₹2,500
              </div>
              <p className="text-gray-400 text-sm mb-4">Per year</p>
              <a
                href="https://nishantsoftwares.in/school"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition text-sm"
              >
                💳 Renew Now
              </a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-indigo-900 rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-2">Start Today — 7 Days Free</h2>
          <p className="text-indigo-300 mb-6 text-sm">
            No card required. No setup fees. Direct support from the developer.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-indigo-300">
            <a href="tel:+919996865069" className="hover:text-white">
              📞 9996865069
            </a>
            <span className="hidden sm:inline">|</span>
            <a
              href="https://wa.me/919996865069"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              💬 WhatsApp
            </a>
            <span className="hidden sm:inline">|</span>
            <a
              href="mailto:prasad.kamta@gmail.com"
              className="hover:text-white"
            >
              ✉️ prasad.kamta@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
