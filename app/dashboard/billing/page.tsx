"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../invitehub/context/AuthContext";
import Navbar from "../../../invitehub/components/Navbar";
import { BillingAPI, BillingInfoResponse, PaymentMethod, Invoice } from "../../../services/billingService";
import API from "../../../services/api";
import BillingUsageCard from "../../../invitehub/components/dashboard/billing/BillingUsageCard";
import PlanCard from "../../../invitehub/components/dashboard/billing/PlanCard";
import UpdatePaymentMethodModal from "../../../invitehub/components/dashboard/billing/UpdatePaymentMethodModal";
import useBillingUsage from "../../../invitehub/hooks/useBillingUsage";
import { PAID_PLAN_IDS, type PlanId } from "../../../lib/plans";
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

function BillingContent() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read ?plan= query param — set by Login page after plan selection
  const urlPlanParam = searchParams.get("plan")?.toLowerCase().trim() || null;
  const pendingCheckoutPlan: PlanId | null = (
    urlPlanParam && (PAID_PLAN_IDS as string[]).includes(urlPlanParam)
      ? (urlPlanParam as PlanId)
      : urlPlanParam === "free"
      ? "free"
      : null
  ) as PlanId | null;

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
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceTotalPages, setInvoiceTotalPages] = useState(1);
  const [invoiceTotalCount, setInvoiceTotalCount] = useState(0);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  // True only during the very first fetch; never reset to true on background refreshes.
  const [initialBillingLoading, setInitialBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);

  // Action states
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Update payment method modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  const hasLoadedData = useRef(false);
  const currentFetchId = useRef(0);
  const fetchedUserId = useRef<number | null>(null);
  const invoiceFetchId = useRef(0);
  // Track whether we've already triggered the pending plan checkout
  const pendingPlanHandled = useRef(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load billing data from backend
  const fetchBillingData = useCallback(async (isRefresh = false) => {
    const id = ++currentFetchId.current;

    // On initial load, show skeletons. On refresh, keep existing data visible.
    if (!isRefresh) {
      setLoading(true);
      setInitialBillingLoading(true);
    }
    setError(null);
    setBillingError(null);

    try {
      // Add cache-busting timestamp to prevent stale cached responses
      const res = await BillingAPI.getBillingInfo(true);

      if (id !== currentFetchId.current) return;

      if (res && res.success) {
        setBillingInfo(res);
        hasLoadedData.current = true;
      } else {
        if (!hasLoadedData.current) {
          setError("Invalid response format received from server.");
        }
      }

      // Load payment method in parallel with first page of invoices
      const [pmRes, invRes] = await Promise.all([
        BillingAPI.getPaymentMethod().catch(err => {
          console.error("Error fetching payment method", err);
          return null;
        }),
        BillingAPI.getInvoices(1, 5).catch(err => {
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

      if (invRes && invRes.success && invRes.pagination) {
        setInvoices(invRes.invoices ?? []);
        const p = invRes.pagination;
        setInvoicePage(p.currentPage);
        setInvoiceTotalPages(p.totalPages);
        setInvoiceTotalCount(p.totalInvoices);
        setInvoiceError(null);
        if (process.env.NODE_ENV === "development") {
          console.log("[InvoiceDev] initial page=1 | invoices=", (invRes.invoices ?? []).length, "total=", p.totalInvoices);
        }
      } else if (invRes === null) {
        setInvoiceError("Unable to load invoices. Please try again.");
      } else if (invRes && invRes.success === false) {
        setInvoiceError(invRes.error || "Unable to load invoices.");
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

  // Paginated invoice fetch
  const handleInvoicePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > invoiceTotalPages || newPage === invoicePage) return;

    const id = ++invoiceFetchId.current;
    setInvoiceLoading(true);
    setInvoiceError(null);

    try {
      const invRes = await BillingAPI.getInvoices(newPage, 5);
      if (id !== invoiceFetchId.current) return;

      if (invRes && invRes.success && invRes.pagination) {
        const p = invRes.pagination;
        // Page correction: if currentPage exceeds totalPages, move to last valid page
        let targetPage = newPage;
        if (p.currentPage > p.totalPages && p.totalPages > 0) {
          targetPage = p.totalPages;
          if (id !== invoiceFetchId.current) return;
          const correctedRes = await BillingAPI.getInvoices(targetPage, 5);
          if (id !== invoiceFetchId.current) return;
          if (correctedRes && correctedRes.success && correctedRes.pagination) {
            const cp = correctedRes.pagination;
            setInvoices(correctedRes.invoices ?? []);
            setInvoicePage(cp.currentPage);
            setInvoiceTotalPages(cp.totalPages);
            setInvoiceTotalCount(cp.totalInvoices);
            setInvoiceError(null);
          }
          return;
        }
        setInvoices(invRes.invoices ?? []);
        setInvoicePage(p.currentPage);
        setInvoiceTotalPages(p.totalPages);
        setInvoiceTotalCount(p.totalInvoices);
        setInvoiceError(null);
        if (process.env.NODE_ENV === "development") {
          console.log("[InvoiceDev] page change to", targetPage, "| invoices=", (invRes.invoices ?? []).length, "total=", p.totalInvoices);
        }
      } else if (invRes === null) {
        setInvoiceError("Unable to load invoices. Please try again.");
      } else if (invRes && invRes.success === false) {
        setInvoiceError(invRes.error || "Unable to load invoices.");
      }
    } catch {
      setInvoiceError("An unexpected error occurred while loading invoices.");
    } finally {
      if (id === invoiceFetchId.current) {
        setInvoiceLoading(false);
      }
    }

    // Scroll to invoice section
    const el = document.getElementById("invoice-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    // Wait for auth initialisation to complete before fetching billing data.
    // This prevents a spurious fetch (and skeleton flash) during SSR hydration
    // when user is momentarily null.
    if (!authLoading && user && fetchedUserId.current !== user.id) {
      fetchedUserId.current = user.id;
      fetchBillingData();
    }
  }, [authLoading, user, fetchBillingData]);

  // Refetch when the page regains focus (e.g. user returns from Stripe checkout or another tab)
  useEffect(() => {
    if (!authLoading && user) {
      const handleFocus = () => {
        fetchBillingData(true);
        refetchUsage();
      };
      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }
  }, [authLoading, user, fetchBillingData, refetchUsage]);

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

      // Free plan - use the dedicated activate-free endpoint
      const res = await BillingAPI.activateFreePlan();
      if (res && res.success) {
        triggerToast(
          res.alreadyActive
            ? "Free plan is already active on your account."
            : "Free plan activated successfully!"
        );
        await fetchBillingData();
        refetchUsage();
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        triggerToast("Failed to activate the Free plan.", "error");
      }
    } catch (err: any) {
      console.error("Update Plan Error:", err);
      triggerToast(err.response?.data?.error || "Failed to update your plan.", "error");
    } finally {
      setUpdating(false);
    }
  };

  // After billing data loads, auto-trigger checkout if ?plan= is in URL.
  // This effect must appear AFTER handleUpdatePlan is declared.
  useEffect(() => {
    if (
      !authLoading &&
      user &&
      !loading &&
      billingInfo &&
      pendingCheckoutPlan &&
      !pendingPlanHandled.current
    ) {
      pendingPlanHandled.current = true;
      // Remove ?plan= from the URL to prevent loops on back/refresh
      window.history.replaceState({}, "", window.location.pathname);
      handleUpdatePlan(pendingCheckoutPlan);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, loading, billingInfo, pendingCheckoutPlan]);

  // Show a spinner only while auth is still initialising (hydration phase).
  // Once authLoading is false, we know whether the user is logged in or not.
  // The redirect effect above will handle the unauthenticated case.
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-body text-[#2D1B3D] relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-4 md:pt-6 pb-10 z-10">
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
              refreshUser();
              fetchBillingData(true);
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
                fetchBillingData(true);
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

                {initialBillingLoading ? (
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
              <div className="lg:col-span-2 space-y-6" id="invoice-section">
                <div>
                  <h2 className="text-xl font-bold font-display text-[#2D1B3D]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Invoice History
                  </h2>
                  <p className="text-xs text-[#2D1B3D]/50 mt-1">
                    View and download your past billing transactions.
                  </p>
                </div>

                {initialBillingLoading ? (
                  <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm animate-pulse h-48" />
                ) : invoiceError ? (
                  <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-48">
                    <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                    <p className="text-xs font-semibold text-[#2D1B3D]">{invoiceError}</p>
                    <button
                      onClick={() => fetchBillingData(true)}
                      className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl shadow-md transition-all active:scale-95 focus:outline-none"
                    >
                      Retry
                    </button>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-48">
                    <Receipt className="w-8 h-8 text-[#2D1B3D]/30 mb-2" />
                    <p className="text-xs font-semibold text-[#2D1B3D]/50">No invoices available.</p>
                  </div>
                ) : (
                  <>
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
                            {invoices.map((invoice) => (
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
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {invoiceLoading && (
                      <div className="flex items-center justify-center py-2">
                        <div className="w-5 h-5 border-2 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin" />
                      </div>
                    )}
                    {invoiceTotalPages > 1 && (
                      <div className="flex items-center justify-center gap-1 sm:gap-2 pt-2">
                        <button
                          onClick={() => handleInvoicePageChange(invoicePage - 1)}
                          disabled={invoicePage <= 1 || invoiceLoading}
                          aria-label="Previous invoice page"
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#E8C4B8]/30 bg-white text-[#2D1B3D] hover:bg-[#FAF8F5] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {(() => {
                            const p = invoicePage;
                            const t = invoiceTotalPages;
                            if (t <= 7) {
                              return Array.from({ length: t }, (_, i) => i + 1).map((n) => (
                                <button
                                  key={n}
                                  onClick={() => handleInvoicePageChange(n)}
                                  disabled={invoiceLoading || n === p}
                                  aria-current={n === p ? "page" : undefined}
                                  className={`min-w-[32px] px-2 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    n === p
                                      ? "bg-[#2D1B3D] text-white shadow-sm"
                                      : "bg-white text-[#2D1B3D] border border-[#E8C4B8]/30 hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed"
                                  }`}
                                >
                                  {n}
                                </button>
                              ));
                            }
                            const pages: (number | string)[] = [1];
                            if (p > 3) pages.push("...");
                            const start = Math.max(2, p - 1);
                            const end = Math.min(t - 1, p + 1);
                            for (let i = start; i <= end; i++) pages.push(i);
                            if (p < t - 2) pages.push("...");
                            if (t > 1) pages.push(t);
                            return pages.map((n, idx) =>
                              n === "..." ? (
                                <span key={`e-${idx}`} className="px-1 text-xs text-[#2D1B3D]/50 select-none">
                                  ...
                                </span>
                              ) : (
                                <button
                                  key={n}
                                  onClick={() => handleInvoicePageChange(n as number)}
                                  disabled={invoiceLoading || n === p}
                                  aria-current={n === p ? "page" : undefined}
                                  className={`min-w-[32px] px-2 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    n === p
                                      ? "bg-[#2D1B3D] text-white shadow-sm"
                                      : "bg-white text-[#2D1B3D] border border-[#E8C4B8]/30 hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed"
                                  }`}
                                >
                                  {n}
                                </button>
                              )
                            );
                          })()}
                        </div>
                        <button
                          onClick={() => handleInvoicePageChange(invoicePage + 1)}
                          disabled={invoicePage >= invoiceTotalPages || invoiceLoading}
                          aria-label="Next invoice page"
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#E8C4B8]/30 bg-white text-[#2D1B3D] hover:bg-[#FAF8F5] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
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
                {(Array.isArray(billingInfo?.plans) ? billingInfo.plans : []).map((plan, index) => (
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

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}

