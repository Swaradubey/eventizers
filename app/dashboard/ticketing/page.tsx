"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../invitehub/context/AuthContext";
import { useSidebar } from "../../../invitehub/context/SidebarContext";
import Navbar from "../../../invitehub/components/Navbar";
import ticketingService from "../../../services/ticketingService";
import { TicketTier, TicketTierStatus, TicketingSummary } from "../../../types/ticketingTypes";
import {
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Ticket,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Menu,
  ChevronDown,
  Info,
  DollarSign,
  Users,
  Percent,
  TrendingUp,
  Activity,
  PlusCircle,
  Clock,
  ShoppingCart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function TicketingPageContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const { setIsOpen: setSidebarOpen } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEventId = searchParams?.get("eventId") || null;

  // Events list for dropdown switcher
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(queryEventId);

  const activeRequestEventIdRef = useRef<string | null>(null);

  // States
  const [summary, setSummary] = useState<TicketingSummary | null>(null);
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<TicketTier | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [buyingTierId, setBuyingTierId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("0");
  const [formCurrency, setFormCurrency] = useState("INR");
  const [formCapacity, setFormCapacity] = useState("100");
  const [formMinPerOrder, setFormMinPerOrder] = useState("1");
  const [formMaxPerOrder, setFormMaxPerOrder] = useState("");
  const [formSalesStartAt, setFormSalesStartAt] = useState("");
  const [formSalesEndAt, setFormSalesEndAt] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formStatus, setFormStatus] = useState<TicketTierStatus>("ACTIVE");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setEditingTier(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("0");
    setFormCurrency("INR");
    setFormCapacity("100");
    setFormMinPerOrder("1");
    setFormMaxPerOrder("");
    setFormSalesStartAt("");
    setFormSalesEndAt("");
    setFormIsActive(true);
    setFormStatus("ACTIVE");
    setFormErrors({});
  };

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Protected route check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Lock body scroll when add/edit modal is open
  useEffect(() => {
    if (!isAddEditModalOpen) return;

    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isAddEditModalOpen]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  // Load events list on mount/auth
  useEffect(() => {
    if (user) {
      const fetchEvents = async () => {
        try {
          const res = await ticketingService.getTicketingEvents();
          if (res.success) {
            setEvents(res.events || []);
            // Auto-select first event if none in query params
            if (!queryEventId && res.events && res.events.length > 0) {
              const firstEventId = res.events[0].id;
              setSelectedEventId(firstEventId);
              updateUrl(firstEventId);
            }
          }
        } catch (err: any) {
          console.error("Error fetching ticketing events:", err);
          setError("Failed to load events. Please try again.");
        }
      };
      fetchEvents();
    }
  }, [user, queryEventId]);

  // Load ticketing stats and tiers when selected event changes
  const fetchTicketingData = async (eventId: string) => {
    setLoading(true);
    setError(null);
    activeRequestEventIdRef.current = eventId;
    try {
      const [summaryRes, tiersRes] = await Promise.all([
        ticketingService.getEventSummary(eventId),
        ticketingService.getEventTiers(eventId),
      ]);

      if (activeRequestEventIdRef.current !== eventId) return;

      if (summaryRes.success) {
        setSummary(summaryRes.summary);
      }
      if (tiersRes.success) {
        setTiers(tiersRes.tiers);
      }
    } catch (err: any) {
      if (activeRequestEventIdRef.current !== eventId) return;
      console.error("Error loading ticketing data:", err);
      setError(err.response?.data?.error || "Failed to load ticketing details for this event.");
    } finally {
      if (activeRequestEventIdRef.current === eventId) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user && selectedEventId) {
      fetchTicketingData(selectedEventId);
    } else {
      setLoading(false);
    }
  }, [user, selectedEventId]);

  const updateUrl = (eventId: string | null) => {
    const url = new URL(window.location.href);
    if (eventId) {
      url.searchParams.set("eventId", eventId);
    } else {
      url.searchParams.delete("eventId");
    }
    window.history.pushState({}, "", url.toString());
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Date formatter helpers
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Convert date string for datetime-local input fields
  const formatInputDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 16);
  };

  // Open modal for creating a tier
  const handleCreateClick = () => {
    setEditingTier(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("0");
    setFormCurrency("INR");
    setFormCapacity("100");
    setFormMinPerOrder("1");
    setFormMaxPerOrder("");
    setFormSalesStartAt("");
    setFormSalesEndAt("");
    setFormIsActive(true);
    setFormStatus("ACTIVE");
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  // Open modal for editing a tier
  const handleEditClick = (tier: TicketTier) => {
    setEditingTier(tier);
    setFormName(tier.name);
    setFormDescription(tier.description || "");
    setFormPrice(tier.price.toString());
    setFormCurrency(tier.currency);
    setFormCapacity(tier.capacity.toString());
    setFormMinPerOrder(tier.minPerOrder.toString());
    setFormMaxPerOrder(tier.maxPerOrder ? tier.maxPerOrder.toString() : "");
    setFormSalesStartAt(formatInputDateTime(tier.salesStartAt));
    setFormSalesEndAt(formatInputDateTime(tier.salesEndAt));
    setFormIsActive(tier.isActive);
    setFormStatus(tier.status);
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  // Validate form entries
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formName.trim()) {
      errors.name = "Ticket name is required.";
    }

    const priceVal = parseFloat(formPrice);
    if (isNaN(priceVal) || priceVal < 0) {
      errors.price = "Price must be 0 or greater.";
    }

    const capacityVal = parseInt(formCapacity, 10);
    if (isNaN(capacityVal) || capacityVal <= 0) {
      errors.capacity = "Capacity must be a positive integer.";
    }

    const minVal = parseInt(formMinPerOrder, 10);
    if (isNaN(minVal) || minVal < 1) {
      errors.minPerOrder = "Minimum tickets per order must be at least 1.";
    }

    if (formMaxPerOrder.trim() !== "") {
      const maxVal = parseInt(formMaxPerOrder, 10);
      if (isNaN(maxVal) || maxVal < minVal) {
        errors.maxPerOrder = `Maximum tickets must be at least ${minVal}.`;
      }
      if (!isNaN(capacityVal) && maxVal > capacityVal) {
        errors.maxPerOrder = "Maximum tickets cannot exceed capacity.";
      }
    }

    if (formSalesStartAt && formSalesEndAt) {
      const start = new Date(formSalesStartAt);
      const end = new Date(formSalesEndAt);
      if (end <= start) {
        errors.salesEndAt = "Sales end date must be later than sales start date.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit tier form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!selectedEventId) return;

    if (!validateForm()) {
      triggerToast("Please fix the validation errors in the form.", "error");
      return;
    }

    setSubmitting(true);
    const payload = {
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      price: parseFloat(formPrice),
      currency: formCurrency,
      capacity: parseInt(formCapacity, 10),
      minPerOrder: parseInt(formMinPerOrder, 10),
      maxPerOrder: formMaxPerOrder.trim() !== "" ? parseInt(formMaxPerOrder, 10) : null,
      salesStartAt: formSalesStartAt ? new Date(formSalesStartAt).toISOString() : null,
      salesEndAt: formSalesEndAt ? new Date(formSalesEndAt).toISOString() : null,
      status: formStatus,
      isActive: formIsActive,
    };

    try {
      if (editingTier && editingTier.id) {
        const res = await ticketingService.updateTicketTier(editingTier.id, payload);
        if (res.success) {
          triggerToast(res.message || "Ticket tier updated successfully.");
          setIsAddEditModalOpen(false);
          resetForm();
          fetchTicketingData(selectedEventId);
        }
      } else {
        const res = await ticketingService.createTicketTier(selectedEventId, payload);
        if (res.success) {
          triggerToast(res.message || "Ticket tier created successfully.");
          setIsAddEditModalOpen(false);
          resetForm();
          fetchTicketingData(selectedEventId);
        }
      }
    } catch (err: any) {
      console.error("Form submit error:", err);
      const msg = err.response?.data?.error || "Failed to save ticket tier. Please try again.";
      setFormErrors({ form: msg });
      triggerToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId || !selectedEventId) return;
    setIsDeleting(true);
    try {
      const res = await ticketingService.deleteTicketTier(deleteConfirmId);
      if (res.success) {
        triggerToast(res.message || "Ticket tier deleted successfully.");
        fetchTicketingData(selectedEventId);
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      triggerToast(err.response?.data?.error || "Failed to delete ticket tier.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  // Handle Buy Ticket
  const handleBuyTicket = async (tierId: string) => {
    if (!selectedEventId || !tierId) return;
    setBuyingTierId(tierId);
    try {
      const res = await ticketingService.createCheckoutSession(selectedEventId, tierId, 1);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        triggerToast("Failed to initiate checkout. No checkout URL returned.", "error");
      }
    } catch (err: any) {
      console.error("Buy ticket error:", err);
      const errMsg = err.response?.data?.error || "Error initiating checkout session.";
      triggerToast(errMsg, "error");
    } finally {
      setBuyingTierId(null);
    }
  };

  // Filtered tiers for search bar
  const filteredTiers = tiers.filter((tier) =>
    tier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tier.description && tier.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-[#E8C4B8]/40 bg-white hover:bg-[#F0EBE8] transition-colors shadow-sm focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-[#2D1B3D]" />
            </button>
            <div>
              <h1
                className="text-4xl md:text-5xl font-semibold text-[#2D1B3D] font-display"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Ticketing
              </h1>
              <p className="text-sm text-[#2D1B3D]/60 mt-1">Sell tickets and manage pricing tiers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Event Switcher Dropdown */}
            {events.length > 0 && (
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-[#E8C4B8]/40 shadow-sm text-xs">
                <span className="text-[#2D1B3D]/50 font-semibold">Event:</span>
                <select
                  value={selectedEventId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedEventId(val || null);
                    updateUrl(val || null);
                  }}
                  className="bg-transparent font-bold focus:outline-none text-[#2D1B3D] cursor-pointer max-w-[180px] truncate"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleCreateClick}
              disabled={events.length === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 text-base font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-95 transition-all shadow-md focus:outline-none whitespace-nowrap  flex-shrink-0"
            >
              <Plus className="w-3 h-3" />
              New Ticket Tier
            </button>
          </div>
        </div>

        {/* Success/Error Toast Alerts */}
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
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
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

        {/* If user has no events created */}
        {events.length === 0 && !loading && (
          <div className="flex-1 bg-white border border-[#E8C4B8]/30 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#E8C4B8]/40 flex items-center justify-center mb-6 shadow-sm">
              <Calendar className="w-8 h-8 text-[#C9A84C]" />
            </div>
            <h3 className="text-2xl font-bold font-display text-[#2D1B3D] mb-2">No Events Found</h3>
            <p className="text-sm text-[#2D1B3D]/60 max-w-md mb-8">
              You must create at least one event in the dashboard before you can manage ticket sales or create pricing tiers.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 text-xs font-bold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52] transition-colors shadow-md focus:outline-none"
            >
              Go to Events
            </button>
          </div>
        )}

        {events.length > 0 && (
          <>
            {/* Top Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {/* Card 1: Total Revenue */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0 }}
                className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {loading || !summary
                        ? "..."
                        : `${summary.totalRevenue.toLocaleString()} INR`}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Tickets Sold */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Ticket className="w-6 h-6 text-[#2D1B3D]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Tickets Sold
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {loading || !summary ? "..." : summary.ticketsSold}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Capacity */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Capacity
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {loading || !summary ? "..." : summary.capacity}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 4: Sell-through percentage */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Percent className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Sell-Through
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {loading || !summary ? "..." : `${summary.sellThrough}%`}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* List and Filtering Workspace */}
            <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col">

              {/* Search filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6 w-full">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-[#2D1B3D]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search ticket tiers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                  />
                </div>
              </div>

              {/* Data Layout */}
              {loading ? (
                // Skeletons loader
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="h-56 bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : error ? (
                // Error screen
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                  <h4 className="text-lg font-semibold text-[#2D1B3D]">Error loading ticket data</h4>
                  <p className="text-xs text-[#2D1B3D]/60 mt-1 max-w-xs">{error}</p>
                  <button
                    onClick={() => selectedEventId && fetchTicketingData(selectedEventId)}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52]"
                  >
                    Retry
                  </button>
                </div>
              ) : tiers.length === 0 ? (
                // Empty state
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#E8C4B8]/40 flex items-center justify-center mb-6 shadow-sm">
                    <Ticket className="w-8 h-8 text-[#C9A84C]" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-[#2D1B3D] mb-1">No Ticket Tiers Found</h3>
                  <p className="text-xs text-[#2D1B3D]/50 max-w-sm mb-6">
                    Create ticket tiers for this event to set up pricing structures for your guests.
                  </p>
                  <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52] transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create First Ticket Tier
                  </button>
                </div>
              ) : filteredTiers.length === 0 ? (
                // Empty search result state
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                  <Search className="w-10 h-10 text-[#2D1B3D]/30 mb-2" />
                  <p className="text-sm font-semibold text-[#2D1B3D]/60">No ticket tiers matches your search criteria.</p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-2 text-xs text-[#C9A84C] font-semibold hover:underline"
                  >
                    Clear Search Filter
                  </button>
                </div>
              ) : (
                // Cards Grid
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTiers.map((tier) => {
                    const sold = tier.quantitySold || 0;
                    const cap = tier.capacity || 0;
                    const percentage = cap > 0 ? Math.min(100, Math.round((sold / cap) * 100)) : 0;

                    return (
                      <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-all duration-200"
                      >
                        {/* Top row: Name & Badges */}
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <div>
                              <h4 className="text-lg font-bold text-[#2D1B3D] leading-snug">
                                {tier.name}
                              </h4>
                              {tier.description && (
                                <p className="text-xs text-[#2D1B3D]/60 mt-1 line-clamp-2">
                                  {tier.description}
                                </p>
                              )}
                            </div>

                            {/* Status Badge */}
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${tier.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : tier.status === "INACTIVE"
                                  ? "bg-gray-50 text-gray-700 border-gray-200"
                                  : tier.status === "SOLD_OUT"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : tier.status === "SCHEDULED"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : tier.status === "EXPIRED"
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-gray-50 text-gray-600 border-gray-200"
                                }`}
                            >
                              {tier.status.replace("_", " ")}
                            </span>
                          </div>

                          {/* Pricing details */}
                          <div className="flex items-baseline gap-1.5 mt-3">
                            <span className="text-2xl font-extrabold text-[#C9A84C]">
                              {tier.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-[#2D1B3D]/50 uppercase">
                              {tier.currency}
                            </span>
                          </div>
                        </div>

                        {/* Mid section: Sales progress bar */}
                        <div className="my-5 bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-xl p-3.5 text-xs">
                          <div className="flex justify-between items-center text-[10px] font-bold text-[#2D1B3D]/60 uppercase tracking-wider mb-1.5">
                            <span>Sales Progress</span>
                            <span>{percentage}%</span>
                          </div>

                          {/* Progress pill */}
                          <div className="w-full h-2 bg-[#E8C4B8]/25 rounded-full overflow-hidden mb-2">
                            <div
                              className="h-full bg-[#C9A84C] rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center mt-1">
                            <div className="border-r border-[#E8C4B8]/20">
                              <p className="text-[10px] text-[#2D1B3D]/40 font-semibold uppercase">Sold</p>
                              <p className="font-bold text-sm text-[#2D1B3D] mt-0.5">{tier.quantitySold}</p>
                            </div>
                            <div className="border-r border-[#E8C4B8]/20">
                              <p className="text-[10px] text-[#2D1B3D]/40 font-semibold uppercase">Left</p>
                              <p className="font-bold text-sm text-[#2D1B3D] mt-0.5">{tier.remainingQuantity}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#2D1B3D]/40 font-semibold uppercase">Revenue</p>
                              <p className="font-bold text-sm text-[#C9A84C] mt-0.5">{(tier.revenueEarned || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Dates + Actions */}
                        <div className="flex justify-between items-end border-t border-[#E8C4B8]/15 pt-4 text-[10px] text-[#2D1B3D]/50">
                          <div className="space-y-1">
                            <p className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#C9A84C]" />
                              <span>Starts: {formatDateTime(tier.salesStartAt)}</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-red-500" />
                              <span>Ends: {formatDateTime(tier.salesEndAt)}</span>
                            </p>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => tier.id && handleBuyTicket(tier.id)}
                              disabled={buyingTierId !== null || tier.status !== "ACTIVE"}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-white bg-[#C9A84C] hover:bg-[#b0903c] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm focus:outline-none"
                            >
                              {buyingTierId === tier.id ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              ) : (
                                <ShoppingCart className="w-3 h-3" />
                              )}
                              Buy Ticket
                            </button>
                            <button
                              onClick={() => handleEditClick(tier)}
                              aria-label={`Edit ${tier.name}`}
                              className="p-2 text-[#2D1B3D]/60 hover:text-[#C9A84C] hover:bg-[#FAF8F5] rounded-xl border border-[#E8C4B8]/30 transition-all focus:outline-none"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(tier.id || null)}
                              aria-label={`Delete ${tier.name}`}
                              className="p-2 text-[#2D1B3D]/60 hover:text-red-600 hover:bg-[#FAF8F5] rounded-xl border border-[#E8C4B8]/30 transition-all focus:outline-none"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ───── CREATE / EDIT TIER MODAL ───── */}
      <AnimatePresence>
        {isAddEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddEditModalOpen(false)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 text-[#2D1B3D] font-body flex flex-col max-h-[calc(100dvh-32px)]"
            >
              {/* Header - fixed */}
              <div className="flex-shrink-0 p-6 pb-0">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold font-display" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {editingTier ? "Edit Ticket Tier" : "New Ticket Tier"}
                  </h3>
                  <button
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="p-1.5 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-lg hover:bg-[#FAF8F5] border border-transparent hover:border-[#E8C4B8]/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-6" style={{ WebkitOverflowScrolling: "touch" }}>
                {/* Form level error */}
                {formErrors.form && (
                  <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{formErrors.form}</span>
                  </div>
                )}

                {/* Form Body */}
                <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold">
                  {/* Tier Name */}
                  <div>
                    <label className="block text-[#2D1B3D]/70 mb-1">Ticket Tier Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Early Bird, VIP Pass"
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm font-medium focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                    />
                    {formErrors.name && (
                      <p className="text-[10px] text-red-600 mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[#2D1B3D]/70 mb-1">Description</label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Brief details about what the ticket includes (e.g. VIP drinks, front row seating)"
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm font-medium focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                    />
                  </div>

                  {/* Price & Currency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#2D1B3D]/70 mb-1">Price *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D1B3D]/40 text-sm">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm font-medium focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                        />
                      </div>
                      {formErrors.price && (
                        <p className="text-[10px] text-red-600 mt-1">{formErrors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#2D1B3D]/70 mb-1">Currency</label>
                      <select
                        value={formCurrency}
                        onChange={(e) => setFormCurrency(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm font-medium focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D] cursor-pointer"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-[#2D1B3D]/70 mb-1">Capacity / Quantity Available *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm font-medium focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                    />
                    {formErrors.capacity && (
                      <p className="text-[10px] text-red-600 mt-1">{formErrors.capacity}</p>
                    )}
                    {editingTier && (
                      <p className="text-[10px] text-[#2D1B3D]/40 mt-1">
                        Already sold: {editingTier.quantitySold} ticket(s)
                      </p>
                    )}
                  </div>

                  {/* Min / Max Tickets Per Order */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#2D1B3D]/70 mb-1">Min Tickets Per Order</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formMinPerOrder}
                        onChange={(e) => setFormMinPerOrder(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm font-medium focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                      />
                      {formErrors.minPerOrder && (
                        <p className="text-[10px] text-red-600 mt-1">{formErrors.minPerOrder}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#2D1B3D]/70 mb-1">Max Tickets Per Order</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="No limit"
                        value={formMaxPerOrder}
                        onChange={(e) => setFormMaxPerOrder(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm font-medium focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                      />
                      {formErrors.maxPerOrder && (
                        <p className="text-[10px] text-red-600 mt-1">{formErrors.maxPerOrder}</p>
                      )}
                    </div>
                  </div>

                  {/* Sales Start / End Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#2D1B3D]/70 mb-1">Sales Start Date & Time</label>
                      <input
                        type="datetime-local"
                        value={formSalesStartAt}
                        onChange={(e) => setFormSalesStartAt(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm font-medium focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D] cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[#2D1B3D]/70 mb-1">Sales End Date & Time</label>
                      <input
                        type="datetime-local"
                        value={formSalesEndAt}
                        onChange={(e) => setFormSalesEndAt(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm font-medium focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D] cursor-pointer"
                      />
                      {formErrors.salesEndAt && (
                        <p className="text-[10px] text-red-600 mt-1">{formErrors.salesEndAt}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Options */}
                  <div className="flex items-center gap-6 pt-2 bg-[#FAF8F5]/30 p-3 rounded-xl border border-[#E8C4B8]/20">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActiveCheckbox"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                        className="w-4 h-4 rounded border-[#E8C4B8]/40 text-[#C9A84C] focus:ring-[#C9A84C] cursor-pointer"
                      />
                      <label htmlFor="isActiveCheckbox" className="text-[#2D1B3D] cursor-pointer select-none">
                        Active (visible to buyers)
                      </label>
                    </div>

                    <div className="flex-1 flex items-center justify-end gap-2">
                      <label className="text-[#2D1B3D]/70">Admin Status:</label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as TicketTierStatus)}
                        className="px-2 py-1.5 bg-white border border-[#E8C4B8]/40 rounded-lg focus:outline-none text-[#2D1B3D] cursor-pointer"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#E8C4B8]/15">
                    <button
                      type="button"
                      onClick={() => setIsAddEditModalOpen(false)}
                      className="px-5 py-2.5 text-xs font-bold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 hover:bg-[#FAF8F5] rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#C9A84C] hover:bg-[#b0903c] rounded-xl disabled:opacity-50 transition-all shadow-md"
                    >
                      {submitting && (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      )}
                      Save Tier
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── DELETE CONFIRMATION MODAL ───── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D]"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Confirm Action
                  </h3>
                  <p className="text-xs text-[#2D1B3D]/60 mt-1 leading-relaxed">
                    Are you sure you want to delete this ticket tier?
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3 text-[10px] text-amber-900 leading-normal flex gap-2 font-semibold">
                    <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>
                      If this tier already has successful ticket sales, the system will automatically archive it to preserve historical purchase transaction records instead of deleting it.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8C4B8]/15">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-bold text-[#2D1B3D] bg-white border border-[#E8C4B8]/40 hover:bg-[#FAF8F5] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50 shadow-md"
                >
                  {isDeleting && (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  Delete Tier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TicketingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
      </div>
    }>
      <TicketingPageContent />
    </Suspense>
  );
}
