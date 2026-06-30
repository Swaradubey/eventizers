import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Clock, Mail, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - Eventizers",
  description: "Learn how Eventizers collects, uses, and safeguards your personal data. Read our privacy policy.",
};

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF8F5] pt-28 pb-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
            <Shield className="w-4 h-4" />
            <span>Legal Center</span>
          </div>
          <h1
            className="font-display text-4xl md:text-5xl font-bold text-[#2D1B3D] mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Privacy Policy
          </h1>
          <div className="flex items-center gap-2 text-sm text-[#2D1B3D]/50 border-b border-[#E8C4B8]/30 pb-8">
            <Clock className="w-4 h-4" />
            <span>Last Updated: June 25, 2026</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-[#E8C4B8]/20 shadow-sm space-y-10 text-[#2D1B3D]/80 leading-relaxed font-sans">

            {/* Introduction */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                1. Introduction
              </h2>
              <p>
                Welcome to Eventizers. We respect your privacy and are committed to protecting your personal data.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit
                our website and use our AI-powered event planning, invitation, and guest management platform.
              </p>
              <p>
                By accessing or using our services, you consent to the information collection and use practices described
                in this Privacy Policy. If you do not agree with any terms of this policy, please do not use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                2. Information We Collect
              </h2>
              <p>
                We collect information that you provide directly to us, as well as information automatically collected
                when you interact with our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-[#2D1B3D]">Account Information:</strong> Name, email address, password,
                  and profile information when you register an account.
                </li>
                <li>
                  <strong className="text-[#2D1B3D]">Event Data:</strong> Details about events you create, including
                  event names, descriptions, dates, locations, registries, custom questions, and designs.
                </li>
                <li>
                  <strong className="text-[#2D1B3D]">Guest Information:</strong> Contact lists uploaded by you or
                  RSVP details submitted directly by guests (names, emails, phone numbers, and dietary/access preferences).
                </li>
                <li>
                  <strong className="text-[#2D1B3D]">Payment Details:</strong> Billing address and credit card tokenized information processed securely via our third-party payment processors.
                </li>
                <li>
                  <strong className="text-[#2D1B3D]">Usage and Log Data:</strong> IP address, browser type, operating system, page views, and actions taken while navigating the platform.
                </li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                3. How We Use Information
              </h2>
              <p>
                We use the information we collect to operate, maintain, and improve our services, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To enable creation, personalization, and management of events using our AI features.</li>
                <li>To dispatch digital invitations via email, SMS, and other supported communication channels.</li>
                <li>To track, compile, and present guest RSVPs and check-in metrics.</li>
                <li>To process transactions and send related billing notices.</li>
                <li>To secure our services and prevent fraudulent or illegal activities.</li>
                <li>To respond to user inquiries and provide customer support.</li>
              </ul>
            </section>

            {/* Cookies and Tracking Technologies */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                4. Cookies and Tracking Technologies
              </h2>
              <p>
                We use cookies, web beacons, and similar tracking technologies to track platform activity and store
                certain configuration details. These help us understand user preferences, improve site performance, and
                provide a more tailored interface.
              </p>
              <p>
                For detailed information on the specific cookies we employ, their purposes, and how to manage your choices,
                please refer to our <Link href="/cookies" className="text-[#C9A84C] hover:underline font-medium">Cookie Policy</Link>.
              </p>
            </section>

            {/* Data Sharing */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                5. Data Sharing
              </h2>
              <p>
                We do not sell your personal data. We may share your information under the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-[#2D1B3D]">With Service Providers:</strong> Trusted third-party vendors assisting
                  us in email delivery, analytics, hosting, database management, and payment processing.
                </li>
                <li>
                  <strong className="text-[#2D1B3D]">With Event Guests:</strong> Essential event parameters and host-provided contact details will be shown to guests you explicitly invite.
                </li>
                <li>
                  <strong className="text-[#2D1B3D]">For Compliance and Protection:</strong> If required by law, to enforce our site policies, or to protect our rights, safety, or property.
                </li>
                <li>
                  <strong className="text-[#2D1B3D]">Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition of all or a portion of our business.
                </li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                6. Data Security
              </h2>
              <p>
                We implement industry-standard physical, technical, and administrative safeguards designed to protect
                your personal data from unauthorized access, modification, exposure, or destruction. We utilize SSL/TLS encryption for all data transit and enforce restricted database access controls.
              </p>
              <div className="bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-xl p-5 flex items-start gap-4">
                <ShieldAlert className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
                <p className="text-xs text-[#2D1B3D]/70 leading-normal">
                  While we take robust security measures, please note that no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee its absolute safety.
                </p>
              </div>
            </section>

            {/* User Rights */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                7. User Rights
              </h2>
              <p>
                Depending on your geographical jurisdiction, you may have specific rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The right to access the personal information we hold about you.</li>
                <li>The right to request that we correct any inaccurate or incomplete data.</li>
                <li>The right to request the deletion of your personal data ("the right to be forgotten").</li>
                <li>The right to restrict or object to our processing of your information.</li>
                <li>The right to export your data in a portable, structured format.</li>
              </ul>
              <p>
                To exercise any of these rights, please submit a request to our support team using the contact details provided below.
              </p>
            </section>

            {/* Third-Party Services */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                8. Third-Party Services
              </h2>
              <p>
                Our services may contain integrations or links to third-party sites (e.g., gift registries, external mapping providers).
                This Privacy Policy does not apply to the practices of websites or services that we do not own or manage.
                We encourage you to review the privacy guidelines of all third-party sites you interact with.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                9. Children's Privacy
              </h2>
              <p>
                Our services are not intended for or directed to individuals under the age of 13. We do not knowingly collect personal identifiable information from children. If we discover that a child under 13 has provided us with personal information, we will delete it immediately from our servers.
              </p>
            </section>

            {/* Contact Information */}
            <section className="space-y-4 border-t border-[#E8C4B8]/20 pt-8">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                10. Contact Information
              </h2>
              <p>
                If you have questions, comments, or concerns about this Privacy Policy, please feel free to reach out:
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
