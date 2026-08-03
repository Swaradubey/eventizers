"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../invitehub/context/AuthContext";
import { CheckCircle, AlertCircle, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import Navbar from "../../invitehub/components/Navbar";
import Footer from "../../invitehub/components/Footer";

interface SessionVerification {
  status: string;
  paymentStatus: string;
  plan: string | null;
  subscriptionStatus: string | null;
}

const PLAN_PRICES: Record<string, number> = {
  pro: 19,
  business: 49,
};

const PLAN_DISPLAY: Record<string, string> = {
  pro: "Pro",
  business: "Business",
  free: "Free",
};

function PaymentSuccessContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [sessionData, setSessionData] = useState<SessionVerification | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const verifyAttempted = useRef(false);

  const sessionId = searchParams ? searchParams.get("session_id") : null;

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Verify the Stripe session through the backend
  useEffect(() => {
    if (authLoading || !user || verifyAttempted.current) return;
    if (!sessionId) {
      setStatus("error");
      setErrorMessage("No session ID found in the URL. This link may be invalid.");
      return;
    }

    verifyAttempted.current = true;

    const verify = async () => {
      try {
        const apiBase =
          (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
            .replace(/\/$/, "")
            .replace(/\/api$/, "") + "/api";

        const res = await fetch(`${apiBase}/stripe/checkout-session/${sessionId}`, {
          credentials: "include",
        });

        if (res.status === 401 || res.status === 403) {
          setStatus("error");
          setErrorMessage("Session verification failed. This session may belong to a different account.");
          return;
        }

        if (res.status === 404) {
          setStatus("error");
          setErrorMessage("Checkout session not found. The session ID may be invalid or expired.");
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setErrorMessage(data.error || "Unable to verify payment. Please contact support.");
          return;
        }

        setSessionData(data);

        const subStatus = (data.subscriptionStatus || "").toLowerCase();
        const payStatus = (data.paymentStatus || "").toLowerCase();

        if (
          subStatus === "active" ||
          subStatus === "trialing" ||
          payStatus === "paid"
        ) {
          setStatus("success");
        } else if (
          subStatus === "incomplete" ||
          subStatus === "pending" ||
          payStatus === "unpaid" ||
          payStatus === "no_payment_required"
        ) {
          setStatus("pending");
        } else {
          setStatus("pending");
        }
      } catch {
        setStatus("error");
        setErrorMessage("A network error occurred while verifying your payment. Please try again.");
      }
    };

    verify();
  }, [authLoading, user, sessionId]);

  // Loading state
  if (authLoading || status === "loading") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center space-[#2D1B3D]">
          <div className="w-12 h-12 border-4 border-[#2D1B3D]/20 border-t-[#2D1B3D] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#2D1B3D]/60 font-medium mt-4">Verifying your payment…</p>
        </div>
      </div>
    );
  }

  const planKey = (sessionData?.plan || "").toLowerCase();
  const planName = PLAN_DISPLAY[planKey] || planKey || "Subscription";
  const planPrice = PLAN_PRICES[planKey] ?? null;

  // Error state
  if (status === "error") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#E8C4B8]/30 p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[#2D1B3D]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Verification Failed
            </h1>
            <p className="text-sm text-[#2D1B3D]/60 mt-2">{errorMessage}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/billing"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#2D1B3D] text-white text-sm font-bold rounded-xl hover:bg-[#3d2a52] transition-colors"
            >
              Go to Billing
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                verifyAttempted.current = false;
                setStatus("loading");
                setErrorMessage(null);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-[#E8C4B8]/50 text-[#2D1B3D] text-sm font-bold rounded-xl hover:bg-[#FAF8F5] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pending state
  if (status === "pending") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#E8C4B8]/30 p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[#2D1B3D]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Payment Processing
            </h1>
            <p className="text-sm text-[#2D1B3D]/60 mt-2">
              Your payment is being processed. Your plan will be activated within a few moments.
              Please check your billing dashboard.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2D1B3D] text-white text-sm font-bold rounded-xl hover:bg-[#3d2a52] transition-colors"
          >
            Continue to Billing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#E8C4B8]/30 p-10 text-center space-y-8">
        {/* Success icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-emerald-200 animate-ping opacity-30 w-20 h-20 mx-auto" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1
            className="text-3xl font-bold text-[#2D1B3D]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            You&apos;re all set!
          </h1>
          <p className="text-sm text-[#2D1B3D]/60">
            Your subscription has been activated successfully.
          </p>
        </div>

        {/* Plan summary card */}
        <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E8C4B8]/30 space-y-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2D1B3D]/50">
              Plan
            </span>
            <span className="text-sm font-bold text-[#2D1B3D]">{planName}</span>
          </div>
          {planPrice !== null && (
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2D1B3D]/50">
                Billed Monthly
              </span>
              <span className="text-sm font-bold text-[#2D1B3D]">${planPrice}/month</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2D1B3D]/50">
              Status
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-[#2D1B3D] text-white text-sm font-bold rounded-xl hover:bg-[#3d2a52] transition-colors shadow-lg shadow-[#2D1B3D]/10"
        >
          Continue to Dashboard
          <ArrowRight className="w-4 h-4 text-[#C9A84C]" />
        </Link>

        <p className="text-[10px] text-[#2D1B3D]/40">
          A receipt has been sent to your email. Manage your subscription anytime from{" "}
          <Link href="/dashboard/billing" className="underline hover:text-[#2D1B3D]/70">
            Billing
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-body text-[#2D1B3D]">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center pt-24 pb-12">
        <Suspense
          fallback={
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#2D1B3D]/20 border-t-[#2D1B3D] rounded-full animate-spin mx-auto" />
                <p className="text-sm text-[#2D1B3D]/60 font-medium">Loading payment status...</p>
              </div>
            </div>
          }
        >
          <PaymentSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
