"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/Navbar";
import { BillingAPI, BillingInfoResponse } from "../../../services/billingService";
import BillingUsageCard from "../../../components/dashboard/billing/BillingUsageCard";
import PlanCard from "../../../components/dashboard/billing/PlanCard";
import useBillingUsage from "../../../hooks/useBillingUsage";
import {
  RotateCcw,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Load dynamic billing usage
  const {
    usage,
    loading: usageLoading,
    error: usageError,
    refetch: refetchUsage
  } = useBillingUsage(!!user);

  // Data states
  const [billingInfo, setBillingInfo] = useState<BillingInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load billing data from backend
  const fetchBillingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await BillingAPI.getBillingInfo();
      if (res && res.success) {
        setBillingInfo(res);
      } else {
        setError("Invalid response format received from server.");
      }
    } catch (err: any) {
      console.error("Error loading billing data:", err);
      setError(
        err.response?.data?.error ||
          "Unable to load billing information. Please verify database connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBillingData();
    }
  }, [user]);

  // Toast auto-dismiss effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const handleUpdatePlan = async (planId: string) => {
    setUpdating(true);
    try {
      const res = await BillingAPI.updatePlan(planId);
      if (res && res.success) {
        setBillingInfo(res);
        refetchUsage();
        triggerToast(`Successfully switched to the ${planId.toUpperCase()} plan!`);
      } else {
        triggerToast("Failed to update your subscription plan.", "error");
      }
    } catch (err: any) {
      console.error("Update Plan Error:", err);
      triggerToast(err.response?.data?.error || "Failed to update your plan.", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Loader skeleton
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-body text-[#2D1B3D] relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 z-10">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1
                className="text-4xl md:text-5xl font-semibold text-[#2D1B3D] font-display"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Billing
              </h1>
              <p className="text-sm text-[#2D1B3D]/60 mt-1">
                Manage your plan, usage and invoices
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              fetchBillingData();
              refetchUsage();
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#2D1B3D] bg-white border border-[#E8C4B8]/40 hover:bg-[#F0EBE8] rounded-xl transition-all shadow-sm focus:outline-none self-end sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {loading ? (
          // Loading skeleton state
          <div className="space-y-8 animate-pulse">
            <div className="h-64 bg-white border border-[#E8C4B8]/20 rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-white border border-[#E8C4B8]/20 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : error ? (
          // Error loading state
          <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
            <h4 className="text-xl font-bold font-display text-[#2D1B3D]">
              Unable to load billing details
            </h4>
            <p className="text-xs text-[#2D1B3D]/60 mt-2 max-w-sm leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => {
                fetchBillingData();
                refetchUsage();
              }}
              className="mt-6 px-5 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl shadow-md transition-all active:scale-95 focus:outline-none"
            >
              Retry Connection
            </button>
          </div>
        ) : billingInfo ? (
          <div className="space-y-10">
            {/* Usage Metrics Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BillingUsageCard
                usage={usage}
                loading={usageLoading}
                error={usageError}
                onRetry={refetchUsage}
              />
            </motion.div>

            {/* Pricing Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[#2D1B3D]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Choose Your Plan
                </h2>
                <p className="text-xs text-[#2D1B3D]/50 mt-1">
                  Select a subscription plan that aligns with your hosting requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {billingInfo.plans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="h-full"
                  >
                    <PlanCard
                      plan={plan}
                      isCurrent={billingInfo.currentPlan === plan.id}
                      onSelect={handleUpdatePlan}
                      updating={updating}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* TOAST ALERTS */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-[#E8C4B8]/40"
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-xs font-semibold text-[#2D1B3D]">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-[#2D1B3D]/40 hover:text-[#2D1B3D] transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
