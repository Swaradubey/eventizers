import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Cookie, Clock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy - Eventizers",
  description: "Learn how Eventizers uses cookies and similar tracking technologies to improve our event operating platform.",
};

export default function CookiePolicy() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF8F5] pt-28 pb-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
            <Cookie className="w-4 h-4" />
            <span>Legal Center</span>
          </div>
          <h1
            className="font-display text-4xl md:text-5xl font-bold text-[#2D1B3D] mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Cookie Policy
          </h1>
          <div className="flex items-center gap-2 text-sm text-[#2D1B3D]/50 border-b border-[#E8C4B8]/30 pb-8">
            <Clock className="w-4 h-4" />
            <span>Last Updated: June 25, 2026</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-[#E8C4B8]/20 shadow-sm space-y-10 text-[#2D1B3D]/80 leading-relaxed font-sans">

            {/* What Cookies Are */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                1. What Cookies Are
              </h2>
              <p>
                Cookies are small text files that are stored on your computer, smartphone, or other device when you visit
                a website. They allow the website to recognize your device and store information about your preferences,
                login states, or past actions to ensure a seamless and personalized experience.
              </p>
              <p>
                In addition to cookies, we may use other tracking technologies, such as web beacons, pixels, and local storage
                (HTML5), which perform similar functions to track interaction and customize content.
              </p>
            </section>

            {/* Types of Cookies Used */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                2. Types of Cookies Used
              </h2>
              <p>
                We use both "session cookies" (which expire once you close your web browser) and "persistent cookies"
                (which stay on your device for a set period or until you delete them). Depending on their source, they are either
                "first-party cookies" (set directly by Eventizers) or "third-party cookies" (set by third-party services integrated
                into our platform).
              </p>
            </section>

            {/* Essential Cookies */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                3. Essential Cookies
              </h2>
              <p>
                These cookies are strictly necessary to provide you with services available through our site and to use
                some of its features, such as accessing secure areas, processing payments, and preserving security.
                Without these cookies, basic site functions would not work, so they cannot be disabled.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left border-collapse border border-[#E8C4B8]/20">
                  <thead>
                    <tr className="bg-[#FAF8F5]">
                      <th className="p-3 font-semibold text-[#2D1B3D] border border-[#E8C4B8]/20">Cookie Name</th>
                      <th className="p-3 font-semibold text-[#2D1B3D] border border-[#E8C4B8]/20">Purpose</th>
                      <th className="p-3 font-semibold text-[#2D1B3D] border border-[#E8C4B8]/20">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-[#E8C4B8]/20 font-mono text-[#2D1B3D]/70">__session</td>
                      <td className="p-3 border border-[#E8C4B8]/20">Maintains secure user authentication and login state.</td>
                      <td className="p-3 border border-[#E8C4B8]/20">Session / 30 Days</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#E8C4B8]/20 font-mono text-[#2D1B3D]/70">__stripe_mid</td>
                      <td className="p-3 border border-[#E8C4B8]/20">Stripe payment processor cookies used for fraud prevention.</td>
                      <td className="p-3 border border-[#E8C4B8]/20">1 Year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Analytics Cookies */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                4. Analytics Cookies
              </h2>
              <p>
                Analytics cookies gather aggregate information on how visitors navigate and utilize our platform.
                This details which pages are visited most frequently, how long users spend on them, and if any error
                messages are encountered. This helps us refine platform speed, fix design flaws, and improve layout efficiency.
              </p>
            </section>

            {/* Functional Cookies */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                5. Functional Cookies
              </h2>
              <p>
                Functional cookies enable the platform to remember choices you make (such as your username, language,
                or the region you are in) and provide enhanced, more personal features. For example, they can remember
                your draft events or custom design settings so you don't have to re-enter them on subsequent visits.
              </p>
            </section>

            {/* Marketing Cookies */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                6. Marketing Cookies
              </h2>
              <p>
                These cookies are used to track visitors across websites. The intention is to display advertisements
                that are relevant and engaging for the individual user and thereby more valuable for publishers and
                third-party advertisers. Eventizers may use these to assess advertising campaign performance.
              </p>
            </section>

            {/* Managing Cookies */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                7. Managing Cookies
              </h2>
              <p>
                You have the right to decide whether to accept or reject cookies. Most web browsers allow you to control
                and modify your cookie settings. You can usually find these settings in the 'Options' or 'Preferences'
                menu of your browser:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:underline font-medium">Google Chrome Settings</a></li>
                <li><a href="https://support.apple.com/en-in/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:underline font-medium">Apple Safari Settings</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:underline font-medium">Mozilla Firefox Settings</a></li>
                <li><a href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:underline font-medium">Microsoft Edge Settings</a></li>
              </ul>
              <p>
                Please note that disabling cookies may result in reduced site functionality, and some services or pages
                may fail to display or function correctly.
              </p>
            </section>

            {/* Third-Party Cookies */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                8. Third-Party Cookies
              </h2>
              <p>
                In some special cases, we also use cookies provided by trusted third parties. For example, our site utilizes
                Google Analytics to help us understand how you use the site and ways we can improve your experience.
                These cookies may track things such as how long you spend on the site and the pages that you visit.
              </p>
            </section>

            {/* Contact Information */}
            <section className="space-y-4 border-t border-[#E8C4B8]/20 pt-8">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                9. Contact Information
              </h2>
              <p>
                If you have questions about our use of cookies or other tracking technologies, please email us:
              </p>
              <div className="flex items-center gap-3 text-[#2D1B3D]/70 bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-xl p-4 w-fit">
                <Mail className="w-5 h-5 text-[#C9A84C]" />
                <span className="text-sm font-medium">privacy@eventizers.com</span>
              </div>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
