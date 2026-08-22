"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/Navbar";
import { BillingAPI, BillingInfoResponse, PaymentMethod, Invoice } from "../../../services/billingService";
import API from "../../../services/api";
import BillingUsageCard from "../../../components/dashboard/billing/BillingUsageCard";
import PlanCard from "../../../components/dashboard/billing/PlanCard";
import UpdatePaymentMethodModal from "../../../components/dashboard/billing/UpdatePaymentMethodModal";
import InvoiceHistoryTable from "../../../components/dashboard/billing/InvoiceHistoryTable";
import useBillingUsage from "../../../hooks/useBillingUsage";
import {
  RotateCcw,
  AlertCircle,
  CheckCircle,
  X,
  CreditCard,
  Download,
  Receipt,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const normalizePlan = (plan: string | undefined | null): string => {
  if (!plan) return "FREE";
  const p = plan.toUpperCase().trim();
  if (p === "FREE") return "FREE";
  if (p === "PRO") return "PRO";
  if (p === "BUSINESS") return "BUSINESS";
  if (p === "ENTERPRISE") return "ENTERPRISE";
  return p;
};

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
  const [initialBillingLoading, setInitialBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);

  // Action states
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Update payment method modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  // Per-row downloading / deleting state
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const hasLoadedData = useRef(false);
  const currentFetchId = useRef(0);
  const fetchedUserId = useRef<number | null>(null);

  const fetchBillingData = useCallback(async (isRefresh = false) => {
    const id = ++currentFetchId.current;

    if (!isRefresh) {
      setLoading(true);
      setInitialBillingLoading(true);
    }
    setError(null);
    setBillingError(null);

    try {
      const res = await BillingAPI.getBillingInfo();

      if (id !== currentFetchId.current) return;

      if (res && res.success) {
        setBillingInfo(res);
        hasLoadedData.current = true;
      } else {
        if (!hasLoadedData.current) {
          setError("Invalid response format received from server.");
        }
      }

      const [pmRes, invRes] = await Promise.all([
        BillingAPI.getPaymentMethod().catch(err => {
          console.error("Error fetching payment method", err);
          return null;
        }),
        BillingAPI.getInvoices(1, 50).catch(err => {
          console.error("Error fetching invoices", err);
          return null;
        })
      ]);

      if (id !== currentFetchId.current) return;

      if (pmRes && pmRes.success) {
        setPaymentMethod(pmRes.data);
      } else if (pmRes && pmRes.success === false) {
        setPaymentMethod(null);
      }

      if (invRes && invRes.success) {
        setInvoices(invRes.invoices ?? []);
      } else if (invRes === null) {
        setBillingError("Unable to load invoices. Please try again.");
      } else if (invRes && invRes.success === false) {
        setBillingError(invRes.error || "Unable to load invoices.");
      }
    } catch (err: any) {
      if (id !== currentFetchId.current) return;
      console.error("Error loading billing data:", err);
      if (!hasLoadedData.current) {
        setError(
          err.response?.data?.error ||
            "Unable to load billing information. Please verify database connection."
        );
        setBillingError(
          err.response?.data?.error ||
            "Unable to load payment or invoice information."
        );
      }
    } finally {
      if (id === currentFetchId.current) {
        setLoading(false);
        setInitialBillingLoading(false);
      }
    }
  }, []);

  const handleOpenUpdateModal = () => {
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = async (data: PaymentMethod) => {
    setPaymentMethod(data);
    triggerToast("Payment method updated successfully!");

    if (pendingPlanId) {
      const planToSubscribe = pendingPlanId;
      setPendingPlanId(null);
      setTimeout(() => {
        handleUpdatePlan(planToSubscribe);
      }, 500);
    }
  };

  const handleUpdateError = (message: string) => {
    triggerToast(message, "error");
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    if (!invoiceId) {
      triggerToast("Invoice identifier is missing.", "error");
      return;
    }

    setDownloadingInvoiceId(invoiceId);
    try {
      const response = await API.get(`/user/billing/invoices/${encodeURIComponent(invoiceId)}/download`, {
        responseType: "blob"
      });

      if (response.data && response.data.type === "application/json") {
        const errorText = await (response.data as Blob).text();
        let parsedMessage = "Failed to download invoice PDF.";
        try {
          const json = JSON.parse(errorText);
          parsedMessage = json.error || json.message || parsedMessage;
        } catch (_) {
          parsedMessage = errorText || parsedMessage;
        }
        throw new Error(parsedMessage);
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
      triggerToast("Invoice downloaded successfully!", "success");
    } catch (err: any) {
      console.error("Failed to download invoice:", err);
      let errorMessage = "Failed to download invoice PDF.";

      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.error) errorMessage = parsed.error;
          else if (parsed.message) errorMessage = parsed.message;
        } catch (_) {}
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      triggerToast(errorMessage, "error");
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    const targetId = invoice.invoiceNumber || invoice.id || invoice.transactionId;
    if (!targetId) {
      triggerToast("Invoice identifier is missing.", "error");
      return;
    }

    setDeletingInvoiceId(targetId);
    try {
      const res = await BillingAPI.deleteInvoice(targetId);
      if (res && res.success) {
        setInvoices((prev) =>
          prev.filter(
            (inv) =>
              inv.id !== invoice.id &&
              inv.invoiceNumber !== invoice.invoiceNumber &&
              (invoice.transactionId ? inv.transactionId !== invoice.transactionId : true)
          )
        );
        triggerToast("Invoice record removed successfully", "success");
      } else {
        throw new Error(res?.error || "Failed to remove invoice record.");
      }
    } catch (err: any) {
      console.error("Failed to delete invoice:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to remove invoice record. Please try again.";
      triggerToast(errorMessage, "error");
    } finally {
      setDeletingInvoiceId(null);
    }
  };

  useEffect(() => {
    if (!authLoading && user && fetchedUserId.current !== user.id) {
      fetchedUserId.current = user.id;
      fetchBillingData();
    }
  }, [authLoading, user, fetchBillingData]);

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
      if (planId === "enterprise") {
        window.open("mailto:sales@invitehub.com", "_blank");
        return;
      }

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

      const res = await BillingAPI.subscribeToPlan(planId);
      if (res && res.requiresPaymentMethod && res.clientSecret) {
        setPendingPlanId(planId);
        setShowUpdateModal(true);
        triggerToast("Please add a card to complete the subscription.", "success");
      } else if (res && res.success) {
        triggerToast(`Successfully subscribed to the ${planId.toUpperCase()} plan!`);
        await fetchBillingData();
        refetchUsage();
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col font-body text-slate-900 relative overflow-hidden"
      style={{
        backgroundColor: "#f8fafc",
        backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    >
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-6 pb-12 z-10">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Billing</h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage your plan, usage, and invoices
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              refreshUser();
              fetchBillingData(true);
              refetchUsage();
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm focus:outline-none self-end sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-32 bg-white border border-slate-100 rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-white border border-slate-100 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
            <h4 className="text-xl font-bold text-slate-900">
              Unable to load billing details
            </h4>
            <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => {
                fetchBillingData(true);
                refetchUsage();
              }}
              className="mt-6 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all active:scale-95 focus:outline-none"
            >
              Retry Connection
            </button>
          </div>
        ) : billingInfo ? (
          <div>
            {/* ── 1. Current Usage Card ── */}
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

            {/* ── 2. Choose your plan ── */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Choose your plan</h2>
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
                      isCurrent={normalizePlan(billingInfo.currentPlan) === normalizePlan(plan.id)}
                      onSelect={handleUpdatePlan}
                      updating={updating}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── 3. Payment Method + Invoice History ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
              {/* Payment Method — left ~30% */}
              <div className="lg:col-span-1">
                <h2 className="font-bold text-2xl text-slate-900 mb-0.5">Payment Method</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Manage your billing cards and default settings.
                </p>

                {initialBillingLoading ? (
                  <div className="bg-white border border-slate-100/80 rounded-2xl p-5 shadow-sm animate-pulse h-40" />
                ) : billingError && !paymentMethod ? (
                  <div className="bg-white border border-slate-100/80 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center text-center h-40">
                    <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Failed to load card details</p>
                  </div>
                ) : paymentMethod ? (
                  /* ── Card Widget ── */
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-7 bg-slate-900 text-white flex items-center justify-center rounded font-extrabold italic text-sm select-none shadow-sm">
                          {paymentMethod.cardBrand === "Visa" ? (
                            <span className="text-yellow-300 text-[11px]">VISA</span>
                          ) : paymentMethod.cardBrand === "Mastercard" ? (
                            <span className="text-orange-400 text-[11px]">MC</span>
                          ) : (
                            <span className="text-[11px]">Card</span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            {paymentMethod.cardBrand} Card
                          </p>
                          <p className="text-[10px] text-slate-400">Default Payment Method</p>
                        </div>
                      </div>
                      <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 rounded-md font-medium border border-emerald-100">
                        {paymentMethod.status || "Active"}
                      </span>
                    </div>

                    {/* Masked card number */}
                    <p className="text-base font-bold font-mono tracking-widest text-slate-900 my-3">
                      •••• •••• •••• {paymentMethod.last4}
                    </p>

                    {/* Bottom row */}
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-xs text-slate-500">
                        Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear.slice(-2)}
                      </p>
                      <button
                        onClick={handleOpenUpdateModal}
                        disabled={updating}
                        className="border border-amber-200 text-amber-600 hover:bg-amber-50 px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ) : (
                  /* No card linked */
                  <div className="bg-white border border-slate-100/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 bg-slate-100 border border-slate-200 flex items-center justify-center rounded text-slate-400 shadow-sm">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">No card linked</p>
                        <p className="text-[10px] text-slate-400">No payment method added.</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleOpenUpdateModal}
                        disabled={updating}
                        className="border border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Card
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Invoice History — right ~70% */}
              <div className="lg:col-span-2">
                <InvoiceHistoryTable
                  invoices={invoices}
                  loading={initialBillingLoading}
                  error={billingError}
                  onDownload={handleDownloadInvoice}
                  downloadingInvoiceId={downloadingInvoiceId}
                  onDelete={handleDeleteInvoice}
                  deletingInvoiceId={deletingInvoiceId}
                  itemsPerPage={5}
                />
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
            className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-slate-100"
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-xs font-semibold text-slate-800">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-700 transition-colors ml-2"
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
