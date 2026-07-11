"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../invitehub/context/AuthContext";
import Navbar from "../../../invitehub/components/Navbar";
import { BillingAPI, BillingInfoResponse, PaymentMethod, Invoice } from "../../../services/billingService";
import API from "../../../services/api";
import BillingUsageCard from "../../../invitehub/components/dashboard/billing/BillingUsageCard";
import PlanCard from "../../../invitehub/components/dashboard/billing/PlanCard";
import UpdatePaymentMethodModal from "../../../invitehub/components/dashboard/billing/UpdatePaymentMethodModal";
import useBillingUsage from "../../../invitehub/hooks/useBillingUsage";
import {
  RotateCcw,
  AlertCircle,
  CheckCircle,
  X,
  CreditCard,
  Download,
  Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BillingPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
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

  // Payment method & Invoices states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);

  // Action states
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Update payment method modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

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
    setBillingLoading(true);
    setBillingError(null);

    // 1. Fetch main billing info (plan, plans list, usage defaults)
    try {
      const res = await BillingAPI.getBillingInfo();
      if (res && res.success) {
        setBillingInfo(res);
      } else {
        console.error("Billing info failed or invalid response shape:", res);
        setError("Invalid response format received from server.");
      }
    } catch (err: any) {
      console.error("Billing info request failed:", err);
      const errMsg = err.response?.data?.error || err.message || "Unable to load billing information. Please verify database connection.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }

    // 2. Fetch payment method and invoices in parallel using Promise.allSettled
    try {
      const [pmResult, invResult] = await Promise.allSettled([
        BillingAPI.getPaymentMethod(),
        BillingAPI.getInvoices()
      ]);

      // Handle payment method result
      if (pmResult.status === "fulfilled") {
        const pmRes = pmResult.value;
        if (pmRes && pmRes.success) {
          setPaymentMethod(pmRes.data);
        } else {
          setBillingError("Invalid payment method response.");
        }
      } else {
        console.error("Payment method fetch rejected:", pmResult.reason);
        const pmErrMsg = pmResult.reason.response?.data?.error || pmResult.reason.message || "Unable to load payment information.";
        setBillingError(pmErrMsg);
      }

      // Handle invoices result
      if (invResult.status === "fulfilled") {
        const invRes = invResult.value;
        if (invRes && invRes.success) {
          setInvoices(invRes.data || []);
        } else {
          setBillingError(prev => prev || "Invalid invoices response.");
        }
      } else {
        console.error("Invoices fetch rejected:", invResult.reason);
        const invErrMsg = invResult.reason.response?.data?.error || invResult.reason.message || "Unable to load invoice information.";
        setBillingError(prev => prev || invErrMsg);
      }

      if (refreshUser) {
        await refreshUser();
      }
    } catch (err: any) {
      console.error("Parallel fetch error:", err);
      const generalErrMsg = err.response?.data?.error || err.message || "Unable to load payment or invoice information.";
      setBillingError(generalErrMsg);
    } finally {
      setBillingLoading(false);
    }
  };

  // Open the Stripe Elements modal for updating payment method
  const handleOpenUpdateModal = () => {
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = async (data: PaymentMethod) => {
    setPaymentMethod(data);
    triggerToast("Payment method updated successfully!");

    if (pendingPlanId) {
      const planToSubscribe = pendingPlanId;
      setPendingPlanId(null);
      // Automatically subscribe using the newly added card
      setTimeout(() => {
        handleUpdatePlan(planToSubscribe);
      }, 500);
    }
  };

  const handleUpdateError = (message: string) => {
    triggerToast(message, "error");
  };

  // Secure download via auth token and blob conversion
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await API.get(`/user/billing/invoices/${invoiceId}/download`, {
        responseType: "blob"
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      triggerToast("Invoice downloaded successfully!");
    } catch (err) {
      console.error("Failed to download invoice", err);
      triggerToast("Failed to download invoice PDF.", "error");
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
      // Enterprise still uses Contact Sales
      if (planId === "enterprise") {
        window.open("mailto:sales@invitehub.com", "_blank");
        return;
      }

      // Pro and Business use Stripe Checkout
      if (planId === "pro" || planId === "business") {
        const res = await BillingAPI.createCheckoutSession(planId);
        if (res && res.url) {
          window.location.assign(res.url);
          return;
        }
        triggerToast("Failed to start checkout. Please try again.", "error");
        setUpdating(false);
        return;
      }

      // Free plan - use direct subscription update
      const res = await BillingAPI.subscribeToPlan(planId);
      if (res && res.requiresPaymentMethod && res.clientSecret) {
        // Stripe Customer needs a payment method.
        setPendingPlanId(planId);
        setShowUpdateModal(true);
        triggerToast("Please add a card to complete the subscription.", "success");
      } else if (res && res.success) {
        triggerToast(`Successfully subscribed to the ${planId.toUpperCase()} plan!`);
        await fetchBillingData();
        refetchUsage();
        if (refreshUser) {
          await refreshUser();
        }
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

            {/* Payment Method & Invoice History Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment Method Section (Takes 1 column) */}
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-[#2D1B3D]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Payment Method
                  </h2>
                  <p className="text-xs text-[#2D1B3D]/50 mt-1">
                    Manage your billing cards and default settings.
                  </p>
                </div>

                {billingLoading ? (
                  <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm animate-pulse h-48" />
                ) : billingError ? (
                  <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-48">
                    <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                    <p className="text-xs font-semibold text-[#2D1B3D]">Failed to load card details</p>
                  </div>
                ) : paymentMethod ? (
                  <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48">
                    {/* Gold accent line at the top */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A84C] to-[#2D1B3D]" />
                    
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-7 bg-[#2D1B3D] text-white flex items-center justify-center rounded font-extrabold italic text-sm select-none shadow-sm">
                          {paymentMethod.cardBrand === "Visa" ? (
                            <span className="text-[#C9A84C]">Visa</span>
                          ) : paymentMethod.cardBrand === "Mastercard" ? (
                            <span className="text-orange-400">MC</span>
                          ) : (
                            <span>Card</span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#2D1B3D]">
                            {paymentMethod.cardBrand} Card
                          </p>
                          <p className="text-[10px] text-[#2D1B3D]/40">Default Payment Method</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        paymentMethod.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                          : "bg-amber-50 text-amber-700 border-amber-250"
                      }`}>
                        {paymentMethod.status}
                      </span>
                    </div>

                    <div>
                      {/* Masked Card Number */}
                      <p className="text-lg font-mono tracking-widest text-[#2D1B3D]/80 font-bold">
                        •••• •••• •••• {paymentMethod.last4}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="text-[9px] text-[#2D1B3D]/40 uppercase tracking-wider">Expiration Date</p>
                        <p className="font-semibold text-[#2D1B3D]">Expires {paymentMethod.expiryMonth || ""}/{(paymentMethod.expiryYear || "").slice(-2)}</p>
                      </div>

                      <button
                        onClick={handleOpenUpdateModal}
                        disabled={updating}
                        className="text-[10px] font-bold text-[#C9A84C] hover:text-[#2D1B3D] transition-colors border border-[#C9A84C]/25 hover:border-[#2D1B3D] rounded-lg px-2 py-1 bg-white hover:bg-[#FAF8F5] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48">
                    {/* Gold accent line at the top */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A84C] to-[#2D1B3D]" />
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 bg-gray-100 border border-gray-200 flex items-center justify-center rounded text-gray-400 shadow-sm">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#2D1B3D]">No card linked</p>
                        <p className="text-[10px] text-[#2D1B3D]/40">No payment method added.</p>
                      </div>
                    </div>

                    <div className="flex justify-end items-center">
                      <button
                        onClick={handleOpenUpdateModal}
                        disabled={updating}
                        className="text-[10px] font-bold text-[#C9A84C] hover:text-[#2D1B3D] transition-colors border border-[#C9A84C]/25 hover:border-[#2D1B3D] rounded-lg px-3 py-1.5 bg-white hover:bg-[#FAF8F5] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Card
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Invoice History Section (Takes 2 columns) */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-[#2D1B3D]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Invoice History
                  </h2>
                  <p className="text-xs text-[#2D1B3D]/50 mt-1">
                    View and download your past billing transactions.
                  </p>
                </div>

                {billingLoading ? (
                  <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm animate-pulse h-48" />
                ) : billingError ? (
                  <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-48">
                    <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                    <p className="text-xs font-semibold text-[#2D1B3D]">Failed to load invoices</p>
                  </div>
                ) : (
                  <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#FAF8F5] border-b border-[#E8C4B8]/20 text-[#2D1B3D]/50 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-3 px-5">Invoice Number</th>
                            <th className="py-3 px-5">Plan</th>
                            <th className="py-3 px-5">Billing Period</th>
                            <th className="py-3 px-5">Customer</th>
                            <th className="py-3 px-5">Amount</th>
                            <th className="py-3 px-5">Transaction ID</th>
                            <th className="py-3 px-5">Status</th>
                            <th className="py-3 px-5 text-right">Download</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8C4B8]/10">
                          {invoices.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-[#2D1B3D]/50 font-medium">
                                No invoices available.
                              </td>
                            </tr>
                          ) : (
                            invoices.map((invoice) => (
                              <tr key={invoice.id} className="hover:bg-[#FAF8F5]/30 transition-colors">
                                <td className="py-3 px-5 font-semibold text-[#2D1B3D]">
                                  {invoice.invoiceNumber || invoice.id}
                                </td>
                                <td className="py-3 px-5 text-[#2D1B3D]/80">
                                  {invoice.planName || "Pro"}
                                </td>
                                <td className="py-3 px-5 text-[#2D1B3D]/65 text-[11px]">
                                  {invoice.billingPeriod || "Monthly"}
                                </td>
                                <td className="py-3 px-5 text-[#2D1B3D]/80">
                                  <div className="font-medium">{invoice.customerName || "Customer"}</div>
                                  <div className="text-[10px] text-[#2D1B3D]/50">{invoice.customerEmail}</div>
                                </td>
                                <td className="py-3 px-5 font-semibold text-[#2D1B3D]">
                                  {invoice.currency === "USD" ? "$" : (invoice.currency || "")}
                                  {(invoice.amount ?? 0).toFixed(2)}
                                </td>
                                <td className="py-3 px-5 font-mono text-[10px] text-[#2D1B3D]/60">
                                  {invoice.transactionId || "-"}
                                </td>
                                <td className="py-3 px-5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    invoice.status === "Paid"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                                      : "bg-amber-50 text-amber-700 border-amber-250"
                                  }`}>
                                    {invoice.status}
                                  </span>
                                </td>
                                <td className="py-3 px-5 text-right">
                                  <button
                                    onClick={() => handleDownloadInvoice(invoice.invoiceNumber || invoice.id)}
                                    className="p-1.5 text-[#C9A84C] hover:text-[#2D1B3D] hover:bg-[#FAF8F5] rounded-lg border border-[#E8C4B8]/10 transition-colors inline-flex items-center justify-center"
                                    title="Download Invoice"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                {billingInfo?.plans?.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="h-full"
                  >
                    <PlanCard
                      plan={plan}
                      isCurrent={billingInfo?.currentPlan === plan.id}
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

      {/* Update Payment Method Modal */}
      <UpdatePaymentMethodModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setPendingPlanId(null);
        }}
        onSuccess={handleUpdateSuccess}
        onError={handleUpdateError}
      />
    </div>
  );
}
