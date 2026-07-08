import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF8F5] pt-32 pb-24 px-6 max-w-5xl mx-auto w-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-6 shadow-sm">
          <Mail className="w-8 h-8 text-[#6366F1]" />
        </div>
        
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6366F1] mb-2 font-body">
          Feature Showcase
        </span>
        
        <h1 className="text-4xl md:text-5xl font-display font-bold text-[#2D1B3D] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Invitations & RSVP
        </h1>
        
        <p className="text-lg text-[#2D1B3D]/70 max-w-2xl mb-8 font-body leading-relaxed">
          Beautiful invites with Smart RSVP. Customize templates, send automated reminders, and track guest responses in real-time.
        </p>

        <div className="flex gap-4">
          <Link
            href="/"
            className="text-sm font-semibold px-6 py-3 rounded-full bg-[#2D1B3D] text-[#FAF8F5] hover:bg-[#3d2a52] transition-colors shadow-md"
          >
            Back to Home
          </Link>
          <Link
            href="/#hero-form"
            className="text-sm font-semibold px-6 py-3 rounded-full border border-[#2D1B3D]/25 text-[#2D1B3D] hover:bg-[#FAF8F5]/85 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
