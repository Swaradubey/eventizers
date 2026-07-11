"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BillingAPI from "@/services/billingService";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type PageState = "loading" | "verifying" | "success" | "pending" | "error" | "invalid";

function BillingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams ? searchParams.get("session_id") : null;
  const { refreshUser } = useAuth();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [plan, setPlan] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!sessionId) {
      setPageState("invalid");
      setErrorMessage("Invalid billing session.");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 30;

    const checkSession = async () => {
      if (cancelled) return;
      attempts++;
      try {
        const res = await BillingAPI.getCheckoutSessionStatus(sessionId);

        if (cancelled) return;

        const isActive = res.subscriptionStatus === "active" || res.subscriptionStatus === "trialing" || res.subscriptionStatus === "complete";
        const paymentDone = res.status === "complete" || res.paymentStatus === "paid";

        if (isActive) {
          // Subscription is active — now verify the backend database is in sync
          setPageState("verifying");
          setPlan(res.plan);
          try {
            // Await the DB sync check: call getCurrentPlan to confirm the backend stored the plan
            const planRes = await BillingAPI.getCurrentPlan();
            const dbPlan = planRes.currentPlan?.toLowerCase();
            const expectedPlan = res.plan?.toLowerCase();
            if (!cancelled && dbPlan === expectedPlan) {
              // DB is synced — await refreshUser so AuthContext is fresh too
              await refreshUser();
              if (!cancelled) {
                setPageState("success");
              }
              return;
            }
          } catch {
            // If verification fails, still show success — the proactive sync in getCheckoutSessionStatus
            // already updated the DB, or the webhook will shortly.
          }
          if (!cancelled) {
            await refreshUser();
            setPageState("success");
          }
          return;
        }

        if (paymentDone) {
          if (attempts >= MAX_ATTEMPTS) {
            setPlan(res.plan);
            await refreshUser();
            setPageState("success");
            return;
          }
          setPageState("pending");
        } else {
          setPageState("pending");
        }
      } catch (err: any) {
        if (cancelled) return;
        if (attempts >= MAX_ATTEMPTS) {
          setErrorMessage(err.response?.data?.error || "Unable to confirm your subscription.");
          setPageState("error");
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId]);

  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Subscription";

  const getTitle = () => {
    switch (pageState) {
      case "success":
        return "Payment successful";
      case "verifying":
        return "Finalizing your subscription";
      case "pending":
        return "Payment confirmed";
      case "error":
        return "Something went wrong";
      case "invalid":
        return "Invalid session";
      default:
        return "Processing...";
    }
  };

  const getDescription = () => {
    switch (pageState) {
      case "success":
        return `Your ${planLabel} subscription has been activated. You can now access all ${planLabel} features.`;
      case "verifying":
        return "Syncing your subscription with your account…";
      case "pending":
        return "Your payment completed, but account activation is still pending. Please wait...";
      case "error":
        return errorMessage || "Unable to confirm your subscription.";
      case "invalid":
        return "Invalid billing session.";
      default:
        return "Verifying your subscription payment...";
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-[#E8C4B8]/30 rounded-3xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center">
        {(pageState === "loading" || pageState === "verifying") && (
          <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-6 shadow-sm">
            <Loader2 className="w-10 h-10 text-[#C9A84C] animate-spin" />
          </div>
        )}

        {pageState === "pending" && (
          <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-6 shadow-sm">
            <Loader2 className="w-10 h-10 text-[#C9A84C] animate-spin" />
          </div>
        )}

        {pageState === "success" && (
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
        )}

        {(pageState === "error" || pageState === "invalid") && (
          <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-6 shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
        )}

        <h1 className="text-3xl font-bold font-display text-[#2D1B3D] tracking-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {getTitle()}
        </h1>
        <p className="text-sm text-[#2D1B3D]/60 max-w-md mb-8">
          {getDescription()}
        </p>

        {pageState === "pending" && (
          <p className="text-xs text-[#C9A84C] font-semibold mb-4">
            Please wait while we activate your subscription…
          </p>
        )}

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

export default function BillingSuccessPage() {
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
          <BillingSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
