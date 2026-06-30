import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, Clock, Mail, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - Eventizers",
  description: "Read the Terms of Service for using Eventizers. Learn about account responsibilities, pricing, and guidelines.",
};

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF8F5] pt-28 pb-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
            <FileText className="w-4 h-4" />
            <span>Legal Center</span>
          </div>
          <h1
            className="font-display text-4xl md:text-5xl font-bold text-[#2D1B3D] mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Terms of Service
          </h1>
          <div className="flex items-center gap-2 text-sm text-[#2D1B3D]/50 border-b border-[#E8C4B8]/30 pb-8">
            <Clock className="w-4 h-4" />
            <span>Last Updated: June 25, 2026</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-[#E8C4B8]/20 shadow-sm space-y-10 text-[#2D1B3D]/80 leading-relaxed font-sans">

            {/* Acceptance of Terms */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, accessing, or using the Eventizers website and software-as-a-service application
                (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy.
                If you do not agree to all of these Terms, you are prohibited from using the Service.
              </p>
              <p>
                We reserve the right to update and change these Terms at any time without notice. Any new features that augment or
                enhance the current Service, including the release of new tools and resources, shall be subject to the Terms of Service.
                Continued use of the Service after any such changes shall constitute your consent to such changes.
              </p>
            </section>

            {/* Account Responsibilities */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                2. Account Responsibilities
              </h2>
              <p>
                To utilize certain aspects of our platform, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, complete, and current registration information.</li>
                <li>Maintain the confidentiality and security of your login credentials.</li>
                <li>Be fully responsible for all activities and transactions that occur under your account.</li>
                <li>Notify us immediately of any unauthorized use or security breach of your account.</li>
              </ul>
              <p>
                You must be a human. Accounts registered by "bots" or other automated methods are not permitted.
              </p>
            </section>

            {/* Event Creation and Management */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                3. Event Creation and Management
              </h2>
              <p>
                Eventizers provides tools to create pages, invitations, schedules, and custom questions for events.
                As an event host ("Host"), you hold full responsibility for the accuracy and legitimacy of all event details,
                location coordinates, schedules, registries, and host representations. Eventizers is not liable for errors in
                event layouts, incorrect details, or host-guest disputes.
              </p>
            </section>

            {/* Invitations and Guest Management */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                4. Invitations and Guest Management
              </h2>
              <p>
                Hosts may send digital invitations via email, SMS, and other channels. You guarantee that you possess the
                necessary permissions, consents, and relationships with recipients to send them invitations and notifications.
                Hosts agree not to send spam or unsolicited promotional outreach to contacts using our platform.
              </p>
            </section>

            {/* Ticketing and Check-In Usage */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                5. Ticketing and Check-In Usage
              </h2>
              <p>
                If you choose to use our ticketing features and check-in QR services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You acknowledge that ticketing tools are subject to payment processing fees.</li>
                <li>Hosts are solely responsible for setting refund policies, resolving transaction disputes, and honoring ticket rights.</li>
                <li>The digital check-in scanning tools are provided to ease on-site entry, but we make no guarantees about network availability during your check-in events.</li>
              </ul>
            </section>

            {/* Acceptable Use Policy */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                6. Acceptable Use Policy
              </h2>
              <p>
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create events promoting violence, hate speech, harassment, or illegal actions.</li>
                <li>Infringe upon the intellectual property, privacy, or publicity rights of any third party.</li>
                <li>Transmit viruses, malware, or code of a destructive nature.</li>
                <li>Attempt to bypass, deactivate, or disrupt security controls or gain unauthorized access to our servers.</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                7. Intellectual Property
              </h2>
              <p>
                The Service, its underlying source code, branding, logos, graphics, and design assets (excluding host-uploaded contents)
                are the exclusive property of Eventizer and its licensors, protected by copyright and intellectual property laws.
                Hosts retain all ownership rights to content they upload or inputs provided to our AI tools.
              </p>
            </section>

            {/* Subscription and Billing */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                8. Subscription and Billing
              </h2>
              <p>
                Some features are offered on a paid subscription or per-event fee structure:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prices and payment terms are detailed on our pricing page and are subject to change.</li>
                <li>Fees are billed in advance and are non-refundable, except as explicitly required by law or specified by us.</li>
                <li>All payments are processed securely via third-party gateways. Hosts are responsible for paying any sales, use, or value-added taxes associated with their plans.</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                9. Limitation of Liability
              </h2>
              <div className="bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-xl p-5 flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
                <div className="text-xs text-[#2D1B3D]/70 space-y-2 leading-normal">
                  <p className="font-semibold uppercase tracking-wider text-[#2D1B3D]">Disclaimer of Warranties</p>
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, EVENTIZER PROVIDES THE SERVICE "AS IS" AND "AS AVAILABLE"
                    WITHOUT WARRANTY OF ANY KIND. WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                    CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, ARISING OUT OF OR IN
                    CONNECTION WITH YOUR USE OF THE SERVICE.
                  </p>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                10. Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate your account and restrict access to the Service at any time,
                with or without cause or notice, if we believe you are in breach of these Terms. Upon termination,
                your right to use the Service ceases immediately, and any data associated with your account may be deleted.
              </p>
            </section>

            {/* Governing Law */}
            <section className="space-y-4">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                11. Governing Law
              </h2>
              <p>
                These Terms and your relationship with Eventizers shall be governed by and construed in accordance with the
                laws of the jurisdiction in which the company is headquartered, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact Information */}
            <section className="space-y-4 border-t border-[#E8C4B8]/20 pt-8">
              <h2
                className="font-display text-2xl font-bold text-[#2D1B3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                12. Contact Information
              </h2>
              <p>
                If you have any questions or require clarification regarding these Terms, please contact us:
              </p>
              <div className="flex items-center gap-3 text-[#2D1B3D]/70 bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-xl p-4 w-fit">
                <Mail className="w-5 h-5 text-[#C9A84C]" />
                <span className="text-sm font-medium">legal@eventizers.com</span>
              </div>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
