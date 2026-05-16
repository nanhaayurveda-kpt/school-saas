// app/page.js
export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

const features = [
  {
    icon: "🎓",
    title: "विद्यार्थी प्रबंधन",
    desc: "हर विद्यार्थी का पूरा रिकॉर्ड — नाम, कक्षा, अनुभाग, रोल नंबर, पिता का नाम और फोन। एक-एक करके या एक साथ सैकड़ों विद्यार्थी जोड़ें।",
  },
  {
    icon: "💰",
    title: "फीस संग्रह और रसीद",
    desc: "मासिक फीस रिकॉर्ड करें, तुरंत रसीद प्रिंट करें। देखें किसने भुगतान किया, किसने नहीं। बकायेदारों को एक क्लिक में WhatsApp रिमाइंडर भेजें।",
  },
  {
    icon: "✅",
    title: "दैनिक उपस्थिति",
    desc: "हर दिन कक्षावार उपस्थिति दर्ज करें। उपस्थित, अनुपस्थित की संख्या तुरंत देखें। अनुपस्थित विद्यार्थियों के अभिभावकों को WhatsApp अलर्ट भेजें।",
  },
  {
    icon: "🔑",
    title: "शिक्षक उपस्थिति PIN से",
    desc: "प्रधानाचार्य हर शिक्षक को 6 अंकों का PIN देते हैं। शिक्षक अपने मोबाइल से लॉगिन करके केवल अपनी कक्षा की उपस्थिति दर्ज करते हैं।",
  },
  {
    icon: "📝",
    title: "परीक्षा और परिणाम",
    desc: "परीक्षा निर्धारित करें, अंक दर्ज करें — ग्रेड, पास/फेल और कक्षा औसत स्वचालित रूप से गणना होता है। रिपोर्ट कार्ड प्रिंट करें।",
  },
  {
    icon: "📄",
    title: "मार्कशीट",
    desc: "त्रैमासिक, अर्धवार्षिक और वार्षिक मार्कशीट पूरी कक्षा के लिए एक साथ। सीधे प्रिंट करें या WhatsApp पर PDF शेयर करें।",
  },
  {
    icon: "🏅",
    title: "प्रमाण पत्र",
    desc: "स्थानांतरण प्रमाण पत्र, चरित्र, बोनाफाइड और जन्म प्रमाण पत्र — एक क्लिक में विद्यालय के नाम, लोगो और प्रधानाचार्य के नाम के साथ तैयार।",
  },
  {
    icon: "🚌",
    title: "परिवहन प्रबंधन",
    desc: "बस मार्ग, स्टॉप, मासिक शुल्क, चालक और वाहन विवरण प्रबंधित करें। विद्यार्थियों को मार्ग पर असाइन करें और परिवहन रसीद बनाएं।",
  },
  {
    icon: "📊",
    title: "रिपोर्ट",
    desc: "कक्षावार विद्यार्थी संख्या, फीस संग्रह, उपस्थिति प्रतिशत और परीक्षा परिणाम — सब एक पेज पर।",
  },
  {
    icon: "📣",
    title: "सूचना पट्ट",
    desc: "प्राथमिकता के साथ विद्यालय की सूचनाएं पोस्ट करें। अत्यावश्यक सूचनाएं लाल बैज के साथ दिखती हैं।",
  },
  {
    icon: "📱",
    title: "मोबाइल और डेस्कटॉप",
    desc: "मोबाइल पर Android ऐप की तरह और कंप्यूटर पर ब्राउजर से चलता है।",
  },
];

const howTo = [
  {
    step: "1",
    icon: "🔐",
    title: "Google से लॉगिन करें",
    desc: "वेबसाइट खोलें और Admin Login पर क्लिक करें। अपने विद्यालय के Gmail खाते से साइन इन करें — कोई पासवर्ड बनाने की जरूरत नहीं।",
  },
  {
    step: "2",
    icon: "⚙️",
    title: "विद्यालय की जानकारी सेट करें",
    desc: "Settings में जाएं — विद्यालय का नाम, पता, प्रधानाचार्य का नाम दर्ज करें और लोगो अपलोड करें। एक बार सेट होने पर हर रसीद और प्रमाण पत्र पर अपने आप आएगा।",
  },
  {
    step: "3",
    icon: "🎓",
    title: "विद्यार्थी और शिक्षक जोड़ें",
    desc: "विद्यार्थियों को एक-एक करके या फाइल से सैकड़ों एक साथ जोड़ें। शिक्षक जोड़ें और हर शिक्षक को 6 अंकों का PIN दें — उनकी मोबाइल लॉगिन कुंजी।",
  },
  {
    step: "4",
    icon: "👨‍🏫",
    title: "शिक्षकों को कक्षाएं असाइन करें",
    desc: "हर शिक्षक की प्रोफाइल में जाएं और असाइन करें कि वे कौन सी कक्षा और विषय पढ़ाते हैं। लॉगिन पर शिक्षक केवल अपनी कक्षा देखेंगे।",
  },
  {
    step: "5",
    icon: "📱",
    title: "दैनिक कार्य शुरू करें",
    desc: "उपस्थिति दर्ज करें, फीस लें, परीक्षा निर्धारित करें — मोबाइल पर, कहीं से भी, कभी भी।",
  },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await getSession(token) : null;
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white" style={{ fontSize: "18px" }}>
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Hero */}
        <div className="text-center mb-14">
          <div
            className="inline-block px-4 py-1.5 bg-amber-100 text-amber-600 rounded-full font-medium mb-5"
            style={{ fontSize: "18px" }}
          >
            🏫 विद्यालय प्रबंधन सॉफ्टवेयर
          </div>
          <h1
            className="font-bold text-gray-900 mb-4 leading-tight"
            style={{ fontSize: "36px" }}
          >
            आपके विद्यालय की हर जरूरत
            <br />
            <span className="text-amber-600">एक जगह — मोबाइल पर</span>
          </h1>
          <p
            className="text-gray-500 max-w-2xl mx-auto mb-8"
            style={{ fontSize: "18px" }}
          >
            विद्यार्थी · फीस · उपस्थिति · परीक्षा · प्रमाण पत्र · रिपोर्ट — सब एक जगह।
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
            <Link
              href="/login"
              className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 font-medium shadow-sm"
              style={{ fontSize: "18px" }}
            >
              प्रशासक लॉगिन →
            </Link>
            <Link
              href="/teacher-login"
              className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-700 font-medium shadow-sm"
              style={{ fontSize: "18px" }}
            >
              🔑 शिक्षक लॉगिन
            </Link>
            <Link
              href="/student/login"
              className="bg-amber-100 text-amber-700 px-8 py-3 rounded-lg hover:bg-amber-200 font-medium shadow-sm"
              style={{ fontSize: "18px" }}
            >
              🎓 विद्यार्थी / अभिभावक लॉगिन
            </Link>
          </div>
          <p className="text-gray-400 mt-3" style={{ fontSize: "14px" }}>
            Android पर इंस्टॉल करने के लिए: Chrome → ⋮ → Add to Home Screen
          </p>
        </div>

        {/* Features */}
        <div className="mb-14">
          <h2
            className="font-bold text-center text-gray-900 mb-2"
            style={{ fontSize: "24px" }}
          >
            क्या-क्या शामिल है?
          </h2>
          <p
            className="text-center text-gray-400 mb-8"
            style={{ fontSize: "18px" }}
          >
            11 सुविधाएं — एक सॉफ्टवेयर, एक कीमत
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-xl shadow-sm border border-amber-100"
              >
                <div className="mb-2" style={{ fontSize: "30px" }}>
                  {f.icon}
                </div>
                <h3
                  className="font-bold text-gray-900 mb-1"
                  style={{ fontSize: "18px" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-gray-500 leading-relaxed"
                  style={{ fontSize: "14px" }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How To */}
        <div className="mb-14">
          <h2
            className="font-bold text-center text-gray-900 mb-2"
            style={{ fontSize: "24px" }}
          >
            शुरू कैसे करें?
          </h2>
          <p
            className="text-center text-gray-400 mb-8"
            style={{ fontSize: "18px" }}
          >
            5 कदम — 10 मिनट में तैयार
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {howTo.map((h) => (
              <div
                key={h.step}
                className="bg-white rounded-xl border border-amber-100 p-4 text-center shadow-sm"
              >
                <div
                  className="w-8 h-8 bg-amber-600 text-white font-black rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ fontSize: "16px" }}
                >
                  {h.step}
                </div>
                <div className="mb-2" style={{ fontSize: "24px" }}>
                  {h.icon}
                </div>
                <div
                  className="font-bold text-gray-800 mb-1"
                  style={{ fontSize: "16px" }}
                >
                  {h.title}
                </div>
                <div
                  className="text-gray-500 leading-relaxed"
                  style={{ fontSize: "13px" }}
                >
                  {h.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Attendance */}
        <div className="mb-14 bg-amber-50 rounded-2xl p-6 border border-amber-100">
          <h2
            className="font-bold text-gray-900 mb-1"
            style={{ fontSize: "22px" }}
          >
            🔑 शिक्षक उपस्थिति कैसे दर्ज करते हैं?
          </h2>
          <p className="text-gray-500 mb-5" style={{ fontSize: "18px" }}>
            Email लॉगिन की जरूरत नहीं। बस PIN।
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "1", text: "प्रधानाचार्य हर शिक्षक को जोड़ते समय 6 अंकों का PIN सेट करते हैं।" },
              { step: "2", text: "शिक्षक अपने मोबाइल पर वेबसाइट खोलते हैं और Teacher Login पर जाते हैं।" },
              { step: "3", text: "शिक्षक अपना PIN डालते हैं — केवल अपनी असाइन कक्षा दिखती है।" },
              { step: "4", text: "शिक्षक उपस्थिति दर्ज करके Save करते हैं — प्रधानाचार्य तुरंत देख सकते हैं।" },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start"
              >
                <div
                  className="w-7 h-7 bg-amber-600 text-white font-black rounded-full flex items-center justify-center shrink-0"
                  style={{ fontSize: "14px" }}
                >
                  {s.step}
                </div>
                <p
                  className="text-gray-700 leading-relaxed"
                  style={{ fontSize: "16px" }}
                >
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-amber-600 rounded-2xl p-10 text-white">
          <h2 className="font-bold mb-2" style={{ fontSize: "24px" }}>
            संपर्क करें
          </h2>
          <p
            className="mb-6"
            style={{ fontSize: "18px", color: "rgba(255,255,255,0.85)" }}
          >
            किसी भी सहायता के लिए सीधे संपर्क करें।
          </p>
          <div
            className="flex flex-col sm:flex-row justify-center gap-4"
            style={{ fontSize: "18px", color: "rgba(255,255,255,0.85)" }}
          >
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