"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertCircle } from "lucide-react";

function BillingCancelContent() {
  const searchParams = useSearchParams();
  const checkout = searchParams ? searchParams.get("checkout") : null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-[#E8C4B8]/30 rounded-3xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-6 shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-600" />
        </div>

        <h1 className="text-3xl font-bold font-display text-[#2D1B3D] tracking-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {checkout === "cancelled" ? "Checkout Cancelled" : "Billing"}
        </h1>
        <p className="text-sm text-[#2D1B3D]/60 max-w-md mb-8">
          {checkout === "cancelled"
            ? "Your Stripe checkout was cancelled. No charges have been made. You can try again whenever you are ready."
            : "Manage your subscription and billing."}
        </p>

        <div className="w-full flex flex-col gap-3">
          <Link
            href="/dashboard/billing"
            className="w-full py-3.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl text-center shadow-md transition-all focus:outline-none"
          >
            Go to Billing
          </Link>
          <Link
            href="/dashboard"
            className="w-full py-3.5 text-xs font-bold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 hover:bg-[#FAF8F5] rounded-xl text-center transition-all focus:outline-none"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-body text-[#2D1B3D]">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center pt-24 pb-12">
        <Suspense fallback={
          <div className="flex-1 flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-[#2D1B3D]/30 border-t-[#C9A84C] rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-[#2D1B3D]/70">Loading...</p>
          </div>
        }>
          <BillingCancelContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
