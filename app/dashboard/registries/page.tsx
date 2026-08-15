"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../invitehub/context/AuthContext";
import { useSidebar } from "../../../invitehub/context/SidebarContext";
import Navbar from "../../../invitehub/components/Navbar";
import registryService from "../../../services/registryService";
import eventService, { Event } from "../../../services/eventService";
import { Registry, RegistryType, RegistrySummary } from "../../../types/registryTypes";
import {
  Menu,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  X,
  Gift,
  PiggyBank,
  Heart,
  Globe,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Lock,
  Unlock,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function RegistriesPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen: setSidebarOpen } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEventId = searchParams?.get("eventId") || null;

  // Events & switchers
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(queryEventId);

  // Registries data states
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [summary, setSummary] = useState<RegistrySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & confirmation IDs
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingRegistry, setEditingRegistry] = useState<Registry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formType, setFormType] = useState<RegistryType>("CASH_FUND");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formGoalAmount, setFormGoalAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("INR");
  const [formExternalUrl, setFormExternalUrl] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Lock background scroll when modals are open
  useEffect(() => {
    if (isAddEditModalOpen || deleteConfirmId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAddEditModalOpen, deleteConfirmId]);

  // Toast Auto-clear
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load user's events
  useEffect(() => {
    if (user) {
      const fetchEvents = async () => {
        try {
          const res = await eventService.getEvents();
          if (res.success) {
            setEvents(res.events || []);
            // Default select the first event if none specified in URL
            if (!queryEventId && res.events && res.events.length > 0) {
              const firstId = res.events[0].id || null;
              setSelectedEventId(firstId);
              updateUrl(firstId);
            }
          }
        } catch (err: any) {
          console.error("Error loading events:", err);
          setError("Failed to load user events.");
        }
      };
      fetchEvents();
    }
  }, [user, queryEventId]);

  // Helper to update EventId in URL
  const updateUrl = (eventId: string | null) => {
    const url = new URL(window.location.href);
    if (eventId) {
      url.searchParams.set("eventId", eventId);
    } else {
      url.searchParams.delete("eventId");
    }
    window.history.pushState({}, "", url.toString());
  };

  // Load registries & summaries
  const fetchRegistriesData = async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, summaryRes] = await Promise.all([
        registryService.getRegistries(eventId),
        registryService.getRegistrySummary(eventId),
      ]);

      if (listRes.success) {
        setRegistries(listRes.registries || []);
      }
      if (summaryRes.success) {
        setSummary(summaryRes.summary);
      }
    } catch (err: any) {
      console.error("Error loading registries details:", err);
      setError(err.response?.data?.error || "Unable to retrieve registries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && selectedEventId) {
      fetchRegistriesData(selectedEventId);
    } else {
      setLoading(false);
    }
  }, [user, selectedEventId]);

  // Handle open create modal
  const handleAddClick = () => {
    setEditingRegistry(null);
    setFormType("CASH_FUND");
    setFormTitle("");
    setFormDescription("");
    setFormGoalAmount("");
    setFormCurrency("INR");
    setFormExternalUrl("");
    setFormIsActive(true);
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  // Handle open edit modal
  const handleEditClick = (registry: Registry) => {
    setEditingRegistry(registry);
    setFormType(registry.type);
    setFormTitle(registry.title);
    setFormDescription(registry.description || "");
    setFormGoalAmount(registry.goalAmount !== null ? String(registry.goalAmount) : "");
    setFormCurrency(registry.currency);
    setFormExternalUrl(registry.externalUrl || "");
    setFormIsActive(registry.isActive);
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedEventId) {
      setFormError("No event selected.");
      return;
    }
    if (!formTitle || !formTitle.trim()) {
      setFormError("Title is required.");
      return;
    }

    // Validation for external link
    if (formType === "EXTERNAL_LINK") {
      if (!formExternalUrl || !formExternalUrl.trim()) {
        setFormError("External URL is required for EXTERNAL_LINK registry.");
        return;
      }
      if (!formExternalUrl.startsWith("http://") && !formExternalUrl.startsWith("https://")) {
        setFormError("External URL must be a valid link starting with http:// or https://");
        return;
      }
    }

    // Validate goal amount if provided
    let goalValue: number | null = null;
    if (formType !== "EXTERNAL_LINK" && formGoalAmount) {
      goalValue = Number(formGoalAmount);
      if (isNaN(goalValue) || goalValue < 0) {
        setFormError("Goal amount must be a positive number.");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (editingRegistry) {
        const payload: Partial<Registry> = {
          type: formType,
          title: formTitle.trim(),
          description: formDescription || null,
          goalAmount: formType !== "EXTERNAL_LINK" ? goalValue : null,
          currency: formCurrency.toUpperCase(),
          externalUrl: formExternalUrl.trim() || null,
          isActive: formIsActive,
        };
        const res = await registryService.updateRegistry(editingRegistry.id, payload);
        if (res.success) {
          triggerToast("Registry updated successfully!");
          setIsAddEditModalOpen(false);
          fetchRegistriesData(selectedEventId);
        }
      } else {
        const payload = {
          eventId: selectedEventId,
          type: formType,
          title: formTitle.trim(),
          description: formDescription || null,
          goalAmount: formType !== "EXTERNAL_LINK" ? goalValue : null,
          currency: formCurrency.toUpperCase(),
          externalUrl: formExternalUrl.trim() || null,
          isActive: formIsActive,
        };
        const res = await registryService.createRegistry(payload);
        if (res.success) {
          triggerToast("Registry created successfully!");
          setIsAddEditModalOpen(false);
          fetchRegistriesData(selectedEventId);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (!err.response) {
        setFormError("Network error: Could not connect to the backend server.");
      } else {
        const status = err.response.status;
        const msg = err.response.data?.error || err.response.data?.message;
        if (status === 400) {
          setFormError(msg || "Validation failed. Please check your inputs.");
        } else if (status === 401) {
          setFormError(msg || "Your session has expired. Please log in again.");
        } else if (status === 403) {
          setFormError(msg || "Access Denied. You do not have permission to manage this event.");
        } else if (status === 404) {
          setFormError(msg || "API endpoint or event not found.");
        } else if (status === 409) {
          setFormError(msg || "Conflict: Registry already exists.");
        } else if (status === 500) {
          setFormError(msg || "Server error. Please try again later.");
        } else {
          setFormError(msg || "An unexpected error occurred. Please try again.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId || !selectedEventId) return;
    try {
      const res = await registryService.deleteRegistry(deleteConfirmId);
      if (res && res.success) {
        triggerToast("Registry deleted successfully!");
        setRegistries((prev) => prev.filter((r) => r.id !== deleteConfirmId));
        // Refresh summary
        const summaryRes = await registryService.getRegistrySummary(selectedEventId);
        if (summaryRes.success) {
          setSummary(summaryRes.summary);
        }
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to delete registry.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Helper to format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Helper to retrieve icon corresponding to registry type
  const getRegistryIcon = (type: RegistryType) => {
    switch (type) {
      case "CASH_FUND":
        return <PiggyBank className="w-5 h-5 text-amber-600" />;
      case "GIFT_REGISTRY":
        return <Gift className="w-5 h-5 text-emerald-600" />;
      case "DONATION":
        return <Heart className="w-5 h-5 text-red-600" />;
      case "EXTERNAL_LINK":
        return <Globe className="w-5 h-5 text-sky-600" />;
      default:
        return <Gift className="w-5 h-5 text-gray-600" />;
    }
  };

  // Helper to retrieve type display string
  const getRegistryTypeName = (type: RegistryType) => {
    switch (type) {
      case "CASH_FUND":
        return "Cash Fund";
      case "GIFT_REGISTRY":
        return "Gift Registry";
      case "DONATION":
        return "Donation";
      case "EXTERNAL_LINK":
        return "External Link";
      default:
        return type;
    }
  };

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

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Header bar */}
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
                Registries
              </h1>
              <p className="text-sm text-[#2D1B3D]/60 mt-1">Gifts, donations, and cash funds for your event</p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleAddClick}
              disabled={events.length === 0}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#FAF8F5] bg-[#2D1B3D] hover:bg-[#3d2a52] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-95 transition-all shadow-md focus:outline-none w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Registry
            </button>
          </div>
        </div>

        {/* Top switch selector & warning alerts */}
        <div className="flex flex-col gap-6 mb-8">
          {events.length > 0 && (
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-[#E8C4B8]/40 shadow-sm text-xs self-start w-full sm:w-auto">
              <span className="text-[#2D1B3D]/50 font-semibold">Event:</span>
              <select
                value={selectedEventId || ""}
                onChange={(e) => {
                  const val = e.target.value || null;
                  setSelectedEventId(val);
                  updateUrl(val);
                }}
                className="bg-transparent font-bold focus:outline-none text-[#2D1B3D] cursor-pointer max-w-[200px] truncate"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {events.length === 0 && !loading && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 text-sm flex gap-3 items-center">
              <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <div>
                You must create at least one event in the{" "}
                <span className="font-semibold cursor-pointer underline" onClick={() => router.push("/dashboard")}>
                  Events dashboard
                </span>{" "}
                before you can manage registry lists.
              </div>
            </div>
          )}
        </div>

        {/* Toast Alerts */}
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

        {events.length > 0 && (
          <div className="space-y-8">
            {/* Dynamic Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Total Raised */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Total Raised
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {loading ? "..." : formatCurrency(summary?.totalRaised || 0, "INR")}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Total Contributors */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Total Contributors
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {loading ? "..." : summary?.totalContributors || 0}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Registry Count */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Active Registries
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {loading ? "..." : summary?.registryCount || 0}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* List / Grid of Registry Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-white border border-[#E8C4B8]/20 rounded-2xl animate-pulse shadow-sm"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
                <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                <h4 className="text-lg font-semibold text-[#2D1B3D]">Error loading registries</h4>
                <p className="text-xs text-[#2D1B3D]/60 mt-1 max-w-xs">{error}</p>
                <button
                  onClick={() => selectedEventId && fetchRegistriesData(selectedEventId)}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52] transition-colors focus:outline-none"
                >
                  Retry
                </button>
              </div>
            ) : registries.length === 0 ? (
              <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#E8C4B8]/40 flex items-center justify-center mb-6 shadow-sm">
                  <Gift className="w-8 h-8 text-[#C9A84C]" />
                </div>
                <h3 className="text-xl font-bold font-display text-[#2D1B3D] mb-1">No Registries Found</h3>
                <p className="text-xs text-[#2D1B3D]/50 max-w-sm mb-6">
                  No registries created for this event yet. Create a cash fund, gift list, donation support, or external registry.
                </p>
                <button
                  onClick={handleAddClick}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52] transition-colors focus:outline-none"
                >
                  Create Your First Registry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registries.map((registry) => {
                  const hasGoal = registry.type !== "EXTERNAL_LINK" && registry.goalAmount !== null;
                  const progressPercentage = hasGoal
                    ? Math.max(0, Math.min(100, (registry.currentAmount / (registry.goalAmount || 1)) * 100))
                    : 0;

                  return (
                    <motion.div
                      layout
                      key={registry.id}
                      className={`bg-white rounded-2xl p-6 border shadow-sm transition-all duration-200 hover:shadow-md ${registry.isActive ? "border-[#E8C4B8]/40" : "border-[#E8C4B8]/20 opacity-75"
                        }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#2D1B3D]/5 flex items-center justify-center flex-shrink-0">
                            {getRegistryIcon(registry.type)}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/40">
                              {getRegistryTypeName(registry.type)}
                            </span>
                            <h3 className="text-base font-bold text-[#2D1B3D] mt-0.5 truncate max-w-[200px] sm:max-w-[240px]">
                              {registry.title}
                            </h3>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(registry)}
                            title="Edit Registry"
                            className="p-2 text-[#2D1B3D]/50 hover:text-[#C9A84C] hover:bg-[#FAF8F5] rounded-xl transition-all focus:outline-none"
                            aria-label="Edit registry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(registry.id)}
                            title="Delete Registry"
                            className="p-2 text-[#2D1B3D]/50 hover:text-red-600 hover:bg-[#FAF8F5] rounded-xl transition-all focus:outline-none"
                            aria-label="Delete registry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#2D1B3D]/60 mt-3.5 line-clamp-2 h-8 leading-relaxed">
                        {registry.description || "No description provided."}
                      </p>

                      <div className="mt-5 space-y-4 pt-4 border-t border-[#E8C4B8]/15">
                        {/* Amounts display */}
                        {registry.type !== "EXTERNAL_LINK" && (
                          <div className="flex justify-between items-end text-xs">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-[#2D1B3D]/40">Raised</p>
                              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                                {formatCurrency(registry.currentAmount, registry.currency)}
                              </p>
                            </div>
                            {hasGoal && (
                              <div className="text-right">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-[#2D1B3D]/40">Goal</p>
                                <p className="text-sm font-semibold text-[#2D1B3D]/80 mt-0.5">
                                  {formatCurrency(registry.goalAmount || 0, registry.currency)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Progress Bar */}
                        {hasGoal && (
                          <div className="space-y-1.5">
                            <div className="w-full h-2 bg-[#2D1B3D]/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#C9A84C] rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-[#2D1B3D]/45 font-semibold">
                              <span>{progressPercentage.toFixed(0)}% Completed</span>
                              <span>{registry.contributorCount} contributor{registry.contributorCount !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                        )}

                        {registry.type !== "EXTERNAL_LINK" && !hasGoal && (
                          <div className="flex justify-between items-center text-[10px] text-[#2D1B3D]/45 font-semibold">
                            <span>No goal set</span>
                            <span>{registry.contributorCount} contributor{registry.contributorCount !== 1 ? "s" : ""}</span>
                          </div>
                        )}

                        {/* External Link button */}
                        {registry.externalUrl && (
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <a
                              href={registry.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[11px] font-bold text-[#C9A84C] hover:text-[#b0913e] transition-colors focus:outline-none"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Visit Link
                            </a>
                            {!registry.isActive && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">
                                Inactive
                              </span>
                            )}
                          </div>
                        )}

                        {!registry.externalUrl && !registry.isActive && (
                          <div className="text-right">
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">
                              Inactive
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ───── ADD / EDIT REGISTRY MODAL ───── */}
      <AnimatePresence>
        {isAddEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-[#E8C4B8]/20 bg-[#FAF8F5]">
                <h3 className="text-lg font-bold font-display text-[#2D1B3D]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {editingRegistry ? "Edit Registry Details" : "Add New Registry"}
                </h3>
                <button
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="p-1.5 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-xl hover:bg-[#F0EBE8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {formError && (
                  <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Registry Type */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-type" className="text-[11px] font-bold uppercase tracking-wider text-[#2D1B3D]/60">
                    Registry Type *
                  </label>
                  <div className="relative">
                    <select
                      id="modal-type"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as RegistryType)}
                      className="w-full appearance-none bg-[#FAF8F5] border border-[#E8C4B8]/40 px-3.5 py-2.5 pr-10 rounded-xl text-xs font-semibold text-[#2D1B3D] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2D1B3D]"
                    >
                      <option value="CASH_FUND">Cash Fund (Honeymoon Fund, etc.)</option>
                      <option value="GIFT_REGISTRY">Gift Registry (Kitchen Essentials, etc.)</option>
                      <option value="DONATION">Donation (Shelter, Charity support, etc.)</option>
                      <option value="EXTERNAL_LINK">External Wishlist (Amazon link, target registries, etc.)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#2D1B3D]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-title" className="text-[11px] font-bold uppercase tracking-wider text-[#2D1B3D]/60">
                    Registry Title *
                  </label>
                  <input
                    id="modal-title"
                    type="text"
                    placeholder="e.g. Honeymoon Travel Fund or Kitchen Appliances"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-description" className="text-[11px] font-bold uppercase tracking-wider text-[#2D1B3D]/60">
                    Description
                  </label>
                  <textarea
                    id="modal-description"
                    placeholder="Provide details about what contributions will fund..."
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors resize-none"
                  />
                </div>

                {/* Goal and Currency Row (conditional) */}
                {formType !== "EXTERNAL_LINK" && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Goal Amount */}
                    <div className="space-y-1.5">
                      <label htmlFor="modal-goal" className="text-[11px] font-bold uppercase tracking-wider text-[#2D1B3D]/60">
                        Goal Amount (Optional)
                      </label>
                      <input
                        id="modal-goal"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 50000"
                        value={formGoalAmount}
                        onChange={(e) => setFormGoalAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                      />
                    </div>

                    {/* Currency */}
                    <div className="space-y-1.5">
                      <label htmlFor="modal-currency" className="text-[11px] font-bold uppercase tracking-wider text-[#2D1B3D]/60">
                        Currency
                      </label>
                      <div className="relative">
                        <select
                          id="modal-currency"
                          value={formCurrency}
                          onChange={(e) => setFormCurrency(e.target.value)}
                          className="w-full appearance-none bg-[#FAF8F5] border border-[#E8C4B8]/40 px-3.5 py-2.5 pr-10 rounded-xl text-xs font-semibold text-[#2D1B3D] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2D1B3D]"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="CAD">CAD ($)</option>
                          <option value="AUD">AUD ($)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#2D1B3D]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* External Link URL (conditional/required depending on type) */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-url" className="text-[11px] font-bold uppercase tracking-wider text-[#2D1B3D]/60">
                    {formType === "EXTERNAL_LINK" ? "External Wishlist Link * (Required)" : "External Link URL (Optional)"}
                  </label>
                  <input
                    id="modal-url"
                    type="url"
                    placeholder="https://amazon.in/wishlist/..."
                    value={formExternalUrl}
                    onChange={(e) => setFormExternalUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                    required={formType === "EXTERNAL_LINK"}
                  />
                </div>

                {/* Active Switch */}
                <div className="flex items-center justify-between bg-[#FAF8F5] p-3 border border-[#E8C4B8]/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    {formIsActive ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-gray-500" />}
                    <div>
                      <p className="text-xs font-bold text-[#2D1B3D]">Registry Active</p>
                      <p className="text-[10px] text-[#2D1B3D]/50">Guests will be able to see and contribute to this</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formIsActive ? "bg-[#2D1B3D]" : "bg-gray-200"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formIsActive ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>

                {/* Modal Actions Footer */}
                <div className="flex justify-end gap-2 pt-4 border-t border-[#E8C4B8]/20">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="w-28 py-3 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/40 hover:bg-[#F0EBE8] rounded-xl transition-all shadow-sm focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-28 py-2.5 text-xs font-bold text-[#FAF8F5] bg-[#2D1B3D] hover:bg-[#3d2a52] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md focus:outline-none"
                  >
                    {submitting ? "Saving..." : "Save Registry"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── DELETE CONFIRMATION DIALOG ───── */}
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
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-[#E8C4B8]/30 p-6 z-10 text-[#2D1B3D] font-body"
            >
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-display" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Delete Registry
                </h3>
              </div>
              <p className="text-xs text-[#2D1B3D]/60 leading-relaxed mb-6">
                Are you sure you want to delete this registry? This will permanently remove all contributions and details. This operation cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/40 hover:bg-[#F0EBE8] rounded-xl transition-all shadow-sm focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl transition-all shadow-md focus:outline-none"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RegistriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
        </div>
      }
    >
      <RegistriesPageContent />
    </Suspense>
  );
}
