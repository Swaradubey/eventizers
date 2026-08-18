"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ticketingService from "@/services/ticketingService";
import { CheckCircle, AlertCircle, Ticket, Calendar, User, DollarSign } from "lucide-react";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams ? searchParams.get("session_id") : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found in the URL. Please verify your transaction.");
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await ticketingService.getSessionDetails(sessionId);
        if (res.success && res.order) {
          setOrderDetails(res.order);
        } else {
          setError("Could not retrieve purchase details. Please contact support.");
        }
      } catch (err: any) {
        console.error("Error fetching order details on success page:", err);
        setError(err.response?.data?.error || "An error occurred while loading purchase details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-[#2D1B3D]/30 border-t-[#C9A84C] rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-[#2D1B3D]/70">Verifying payment session...</p>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6 shadow-sm">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold font-display text-[#2D1B3D] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Oops! Something went wrong
        </h1>
        <p className="text-sm text-[#2D1B3D]/60 max-w-md mb-8">
          {error || "We could not verify your purchase. If you were charged, please contact customer support."}
        </p>
        <Link
          href="/dashboard/ticketing"
          className="px-6 py-3 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl transition-all shadow-md focus:outline-none"
        >
          Return to Events
        </Link>
      </div>
    );
  }

  const eventName = orderDetails.event?.title || "Event";
  const firstItem = orderDetails.items?.[0] || {};
  const tierName = firstItem.ticketTier?.name || "Standard Tier";
  const quantity = firstItem.quantity || 1;
  const amountPaid = orderDetails.totalAmount || 0;
  const currencySymbol = orderDetails.currency === "USD" ? "$" : orderDetails.currency === "EUR" ? "€" : "₹";

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-[#E8C4B8]/30 rounded-3xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center">
        {/* Success Icon Animation */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>

        <h1 className="text-3xl font-bold font-display text-[#2D1B3D] tracking-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Payment Successful
        </h1>
        <p className="text-sm font-semibold text-emerald-700 mb-8 uppercase tracking-wider text-[10px]">
          Ticket Purchased Successfully
        </p>

        {/* Invoice / Ticket Summary Card */}
        <div className="w-full bg-[#FAF8F5] border border-[#E8C4B8]/30 rounded-2xl p-5 mb-8 text-left text-xs font-semibold text-[#2D1B3D]/70 space-y-4">
          <div className="flex items-start gap-3 border-b border-[#E8C4B8]/20 pb-3">
            <Calendar className="w-4 h-4 text-[#C9A84C] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-[#2D1B3D]/40 font-bold uppercase">Event Name</p>
              <p className="font-bold text-sm text-[#2D1B3D] mt-0.5">{eventName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 border-b border-[#E8C4B8]/20 pb-3">
            <Ticket className="w-4 h-4 text-[#2D1B3D]/70 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-[#2D1B3D]/40 font-bold uppercase">Ticket Tier</p>
              <p className="font-bold text-sm text-[#2D1B3D] mt-0.5">{tierName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-[#2D1B3D]/50 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#2D1B3D]/40 font-bold uppercase">Quantity</p>
                <p className="font-bold text-sm text-[#2D1B3D] mt-0.5">{quantity}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-[#C9A84C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#2D1B3D]/40 font-bold uppercase">Amount Paid</p>
                <p className="font-bold text-sm text-[#C9A84C] mt-0.5">
                  {currencySymbol} {parseFloat(amountPaid).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/dashboard/ticketing"
            className="w-full py-3.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl text-center shadow-md transition-all focus:outline-none"
          >
            Go to My Tickets
          </Link>
          <Link
            href="/dashboard/ticketing"
            className="w-full py-3.5 text-xs font-bold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 hover:bg-[#FAF8F5] rounded-xl text-center transition-all focus:outline-none"
          >
            Return to Ticketing
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-body text-[#2D1B3D]">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center pt-24 pb-12">
        <Suspense fallback={
          <div className="flex-1 flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-[#2D1B3D]/30 border-t-[#C9A84C] rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-[#2D1B3D]/70">Loading payment success screen...</p>
          </div>
        }>
          <SuccessPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
