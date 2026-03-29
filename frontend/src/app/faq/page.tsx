import type { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";

export const metadata: Metadata = {
  title: `FAQ | ${siteName}`,
  description: "Frequently asked questions about LKD Classes admissions, fees, courses, results, contact, app access and student support.",
  alternates: {
    canonical: "/faq",
  },
};

const faqSections = [
  {
    title: "📘 Courses & Classes",
    items: [
      {
        q: "Kaun kaun si classes available hain?",
        a: `LKD Classes me Class 6 se Class 12 tak coaching available hai. Competition batch bhi available hai. Full details ke liye Courses Page open karein: ${siteUrl}/courses`,
      },
      {
        q: "Competition batch available hai?",
        a: "Haan, Competition batch available hai.",
      },
      {
        q: "Courses ke full details kaha milenge?",
        a: `Courses ka complete overview yahan milega: ${siteUrl}/courses`,
      },
    ],
  },
  {
    title: "💰 Fees & Payment",
    items: [
      {
        q: "Fees kitni hai?",
        a: "Class-wise monthly fees available hain. Exact fee ke liye class batayein, jaise Class 10, Class 11, Class 12 ya Competition.",
      },
      {
        q: "Registration ya app access charge kitna hai?",
        a: "Registration/app access charge ₹50 hai.",
      },
      {
        q: "Payment kaha se karna hota hai?",
        a: `Online payment website ke payment flow se hota hai. Direct payment and registration-related payment options website par available hain.`,
      },
    ],
  },
  {
    title: "📝 Admission Process",
    items: [
      {
        q: "Admission kaise hoga?",
        a: `Admission online registration ke through hota hai. Details fill karein, class select karein, fee pay karein, aur registration complete karein. Register Page: ${siteUrl}/register`,
      },
      {
        q: "Join kaise karein?",
        a: `Join karne ke liye Register Page use karein: ${siteUrl}/register`,
      },
      {
        q: "Admission me help chahiye to kya karein?",
        a: "Direct help ke liye institute ko call karein: +91 8002271522",
      },
    ],
  },
  {
    title: "📊 Results & Rankers",
    items: [
      {
        q: "Result kaha dekhein?",
        a: `Published results aur TSE results ke liye Result Page open karein: ${siteUrl}/result`,
      },
      {
        q: "Agar result na mile to?",
        a: "Agar result page par result na mile to direct call karein: +91 8002271522",
      },
      {
        q: "Top achievers ya rankers kaha dekhein?",
        a: `Top achievers aur rankers ke liye Top Rankers Page open karein: ${siteUrl}/top-rankers`,
      },
    ],
  },
  {
    title: "👨‍🏫 Founder & Institute",
    items: [
      {
        q: "Founder kaun hain?",
        a: `LKD Classes ke founder Mr. Laliteshwar Kumar hain. Founder details, milestones aur message ke liye Founder Page open karein: ${siteUrl}/founder`,
      },
      {
        q: "Institute ke mission aur vision ke baare me kaha milega?",
        a: `Institute overview, mission aur vision ke liye About Page open karein: ${siteUrl}/about`,
      },
      {
        q: "Founder timeline kaha dekhein?",
        a: `Founder journey aur milestones Founder Page par available hain: ${siteUrl}/founder`,
      },
    ],
  },
  {
    title: "📱 App, Login & Support",
    items: [
      {
        q: "Student login kaha se karein?",
        a: `Student login website ke login flow se available hai. Login Page open karein: ${siteUrl}/login`,
      },
      {
        q: "Student portal kaha hai?",
        a: `Student Portal yahan available hai: ${siteUrl}/student-portal`,
      },
      {
        q: "App download kaha se karein?",
        a: `App access / download related page yahan available hai: ${siteUrl}/pay/app-access`,
      },
      {
        q: "Institute se direct contact kaise karein?",
        a: `Phone: +91 8002271522\nEmail: lkdclasses2007@gmail.com\nContact Page: ${siteUrl}/contact`,
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 px-4 py-12 md:px-8 md:py-16">
      <section className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="inline-flex rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700">
            FAQs
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            LKD Classes ke courses, fees, admission, results, founder, app access aur student support ke common questions yahan organized form me diye gaye hain.
          </p>
        </div>

        <div className="mt-10 grid gap-8">
          {faqSections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
              <div className="mt-6 space-y-5">
                {section.items.map((item) => (
                  <div key={item.q} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 md:p-5">
                    <h3 className="text-base font-semibold text-slate-900 md:text-lg">{item.q}</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 md:text-base">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
