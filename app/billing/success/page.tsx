"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BillingAPI from "@/services/billingService";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

type PageState = "loading" | "success" | "pending" | "error" | "invalid";

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
    const MAX_ATTEMPTS = 5;
    let timeoutId: NodeJS.Timeout;

    const checkSession = async () => {
      if (cancelled) return;
      attempts++;
      try {
        const res = await BillingAPI.getCheckoutSessionStatus(sessionId);

        if (cancelled) return;

        if (res.subscriptionStatus === "active" || res.subscriptionStatus === "trialing" || res.subscriptionStatus === "complete") {
          setPlan(res.plan);
          setPageState("success");
          
          try {
            await Promise.all([
              refreshUser(),
              BillingAPI.getBillingInfo(),
            ]);
          } catch (refreshErr) {
            console.error("Error refreshing subscription state:", refreshErr);
          }
          
          // Redirect automatically once successful
          setTimeout(() => {
            if (!cancelled) router.push("/dashboard/billing");
          }, 2000);
          return;
        }

        if (res.status === "complete" || res.paymentStatus === "paid") {
          if (attempts >= MAX_ATTEMPTS) {
            setPlan(res.plan);
            setPageState("success");
            setTimeout(() => {
              if (!cancelled) router.push("/dashboard/billing");
            }, 2000);
            return;
          }
          setPageState("pending");
          timeoutId = setTimeout(checkSession, 2000);
        } else {
          setPageState("pending");
          timeoutId = setTimeout(checkSession, 2000);
        }
      } catch (err: any) {
        if (cancelled) return;
        if (attempts >= MAX_ATTEMPTS) {
          setErrorMessage(err.response?.data?.error || "Unable to confirm your subscription.");
          setPageState("error");
        } else {
          timeoutId = setTimeout(checkSession, 2000);
        }
      }
    };

    checkSession();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [sessionId, refreshUser, router]);

  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Subscription";

  const getTitle = () => {
    switch (pageState) {
      case "success":
        return "Payment successful";
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
        return `Your ${planLabel} subscription has been activated. It may take a few seconds for your account to update.`;
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
        {pageState === "loading" && (
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
            Please return to Billing and refresh in a few seconds.
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
