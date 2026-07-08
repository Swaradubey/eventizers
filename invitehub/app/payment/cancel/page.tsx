"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-body text-[#2D1B3D]">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white border border-[#E8C4B8]/30 rounded-3xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-6 shadow-sm">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold font-display text-[#2D1B3D] tracking-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Payment Cancelled
          </h1>
          
          <p className="text-sm text-[#2D1B3D]/60 max-w-xs mb-8">
            Your transaction was cancelled. No charges were made, and no tickets were purchased.
          </p>

          {/* CTA Buttons */}
          <div className="w-full flex flex-col gap-3">
            <Link
              href="/dashboard/ticketing"
              className="w-full py-3.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl text-center shadow-md transition-all focus:outline-none"
            >
              Return to Event
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-3.5 text-xs font-bold text-[#2D1B3D] bg-[#FAF8F5] border border-[#E8C4B8]/40 hover:bg-[#F0EBE8] rounded-xl text-center transition-all focus:outline-none"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
