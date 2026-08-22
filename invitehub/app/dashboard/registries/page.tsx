"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
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
  Heart,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Link2,
  Lock,
  Unlock,
  DollarSign,
  Calendar,
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
  const [formCurrency, setFormCurrency] = useState("USD");
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
    setFormCurrency("USD");
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
    setFormCurrency(registry.currency || "USD");
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
        setFormError("External URL is required for External Link registry.");
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
  const formatPrice = (amount: number, currency: string = "USD") => {
    const symbol =
      currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "INR" ? "₹" : currency === "GBP" ? "£" : "$";
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Helper to retrieve category badge styling & icon
  const getRegistryBadge = (type: RegistryType) => {
    switch (type) {
      case "CASH_FUND":
        return {
          gradient: "bg-gradient-to-br from-emerald-400 to-green-500",
          icon: <DollarSign className="w-5 h-5 text-white stroke-[2.5]" />,
          category: "Cash Fund",
          progressGradient: "bg-gradient-to-r from-emerald-500 to-green-400",
        };
      case "GIFT_REGISTRY":
        return {
          gradient: "bg-gradient-to-br from-indigo-500 to-blue-500",
          icon: <Gift className="w-5 h-5 text-white stroke-[2]" />,
          category: "Gift Registry",
          progressGradient: "bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400",
        };
      case "DONATION":
        return {
          gradient: "bg-gradient-to-br from-rose-400 to-teal-400",
          icon: <Heart className="w-5 h-5 text-white stroke-[2]" />,
          category: "Donation",
          progressGradient: "bg-gradient-to-r from-rose-500 to-teal-400",
        };
      case "EXTERNAL_LINK":
        return {
          gradient: "bg-gradient-to-br from-sky-400 to-blue-600",
          icon: <Link2 className="w-5 h-5 text-white stroke-[2.5]" />,
          category: "External Link",
          progressGradient: "",
        };
      default:
        return {
          gradient: "bg-gradient-to-br from-slate-400 to-slate-600",
          icon: <Gift className="w-5 h-5 text-white stroke-[2]" />,
          category: "Registry",
          progressGradient: "bg-gradient-to-r from-blue-600 to-cyan-500",
        };
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 relative overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(circle at 10% 15%, rgba(59, 130, 246, 0.05) 0%, transparent 45%),
                          radial-gradient(circle at 90% 85%, rgba(6, 182, 212, 0.05) 0%, transparent 45%),
                          radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 60%),
                          url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.5 6.5h1v5h-1zm-2 2h5v1h-5z' fill='%2394A3B8' fill-opacity='0.09'/%3E%3C/svg%3E")`,
      }}
    >
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 sm:px-8 pt-6 pb-12 z-10">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Registries
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Gifts, donations, and cash funds for your event
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleAddClick}
              disabled={events.length === 0}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Registry</span>
            </button>
          </div>
        </div>

        {/* Filter & Summary Metrics Bar */}
        {events.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            {/* Event Selector Dropdown */}
            <div className="relative w-full sm:w-64">
              <select
                value={selectedEventId || ""}
                onChange={(e) => {
                  const val = e.target.value || null;
                  setSelectedEventId(val);
                  updateUrl(val);
                }}
                className="w-full appearance-none bg-white border border-slate-100 shadow-sm rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Summary Metrics (Right Side) */}
            <div className="flex items-center gap-8 self-end sm:self-auto">
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {loading ? "..." : formatPrice(summary?.totalRaised || 0, "USD")}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Total raised</div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {loading ? "..." : summary?.totalContributors || 0}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Contributors</div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Alerts */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-slate-200/80"
            >
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
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

        {/* If user has no events created */}
        {events.length === 0 && !loading && (
          <div className="flex-1 bg-white border border-slate-100/80 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Events Found</h3>
            <p className="text-sm text-slate-500 max-w-md mb-8">
              You must create at least one event in the dashboard before you can manage registries or cash funds.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md focus:outline-none"
            >
              Go to Events
            </button>
          </div>
        )}

        {events.length > 0 && (
          <div className="space-y-8">
            {/* List / Grid of Registry Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-44 bg-white border border-slate-100/80 rounded-2xl animate-pulse shadow-sm"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="bg-white border border-slate-100/80 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
                <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                <h4 className="text-lg font-semibold text-slate-900">Error loading registries</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">{error}</p>
                <button
                  onClick={() => selectedEventId && fetchRegistriesData(selectedEventId)}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors focus:outline-none shadow-sm"
                >
                  Retry
                </button>
              </div>
            ) : registries.length === 0 ? (
              <div className="bg-white border border-slate-100/80 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
                  <Gift className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">No Registries Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mb-6">
                  No registries created for this event yet. Create a cash fund, gift list, donation support, or external registry.
                </p>
                <button
                  onClick={handleAddClick}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl transition-all shadow-md focus:outline-none"
                >
                  Create Your First Registry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {registries.map((registry) => {
                  const badge = getRegistryBadge(registry.type);
                  const isExternal = registry.type === "EXTERNAL_LINK";
                  const hasGoal = !isExternal && registry.goalAmount !== null && (registry.goalAmount || 0) > 0;
                  const progressPercentage = hasGoal
                    ? Math.max(0, Math.min(100, ((registry.currentAmount || 0) / (registry.goalAmount || 1)) * 100))
                    : 0;

                  return (
                    <motion.div
                      layout
                      key={registry.id}
                      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-all ${
                        !registry.isActive ? "opacity-75" : ""
                      }`}
                    >
                      <div>
                        {/* Top row: Icon Badge, Title, Category & Delete action */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${badge.gradient}`}
                            >
                              {badge.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-slate-400 font-medium leading-none">
                                {badge.category}
                              </p>
                              <h3 className="text-slate-900 font-semibold text-base mt-1 truncate">
                                {registry.title}
                              </h3>
                            </div>
                          </div>

                          {/* Action icons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleEditClick(registry)}
                              title="Edit Registry"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none"
                              aria-label="Edit registry"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(registry.id)}
                              title="Delete Registry"
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none"
                              aria-label="Delete registry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {registry.description || "No description provided."}
                        </p>
                      </div>

                      {/* Card Bottom / Footer Section */}
                      <div className="mt-4 pt-3">
                        {isExternal ? (
                          <div className="flex items-center justify-between">
                            {registry.externalUrl ? (
                              <a
                                href={registry.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 font-medium text-xs flex items-center gap-1 hover:underline hover:text-indigo-700 transition-colors"
                              >
                                <span>View Registry</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">No URL configured</span>
                            )}
                            {!registry.isActive && (
                              <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                                Inactive
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            {/* Amounts & Contributor Count */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">
                                <span className="font-bold text-slate-900">
                                  {formatPrice(registry.currentAmount || 0, registry.currency)}
                                </span>
                                {hasGoal && (
                                  <span className="text-slate-400 font-normal">
                                    {" "}of {formatPrice(registry.goalAmount || 0, registry.currency)}
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-slate-500">
                                {registry.contributorCount || 0} contributor
                                {(registry.contributorCount || 0) === 1 ? "" : "s"}
                              </span>
                            </div>

                            {/* Full-width thin rounded progress bar */}
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${badge.progressGradient}`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
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
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-base font-bold text-slate-900">
                  {editingRegistry ? "Edit Registry Details" : "Add New Registry"}
                </h3>
                <button
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Registry Type */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-type" className="text-xs font-semibold text-slate-700">
                    Registry Type *
                  </label>
                  <div className="relative">
                    <select
                      id="modal-type"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as RegistryType)}
                      className="w-full appearance-none bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 pr-10 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    >
                      <option value="CASH_FUND">Cash Fund (Honeymoon Fund, etc.)</option>
                      <option value="GIFT_REGISTRY">Gift Registry (Kitchen Essentials, etc.)</option>
                      <option value="DONATION">Donation (Shelter, Charity support, etc.)</option>
                      <option value="EXTERNAL_LINK">External Link (Amazon Wishlist, Target, etc.)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-title" className="text-xs font-semibold text-slate-700">
                    Registry Title *
                  </label>
                  <input
                    id="modal-title"
                    type="text"
                    placeholder="e.g. Honeymoon Fund or Kitchen Essentials"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-800 transition-colors"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-description" className="text-xs font-semibold text-slate-700">
                    Description
                  </label>
                  <textarea
                    id="modal-description"
                    placeholder="Provide details about what contributions will fund..."
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-800 transition-colors resize-none"
                  />
                </div>

                {/* Goal and Currency Row (conditional) */}
                {formType !== "EXTERNAL_LINK" && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Goal Amount */}
                    <div className="space-y-1.5">
                      <label htmlFor="modal-goal" className="text-xs font-semibold text-slate-700">
                        Goal Amount (Optional)
                      </label>
                      <input
                        id="modal-goal"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 5000"
                        value={formGoalAmount}
                        onChange={(e) => setFormGoalAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-800 transition-colors"
                      />
                    </div>

                    {/* Currency */}
                    <div className="space-y-1.5">
                      <label htmlFor="modal-currency" className="text-xs font-semibold text-slate-700">
                        Currency
                      </label>
                      <div className="relative">
                        <select
                          id="modal-currency"
                          value={formCurrency}
                          onChange={(e) => setFormCurrency(e.target.value)}
                          className="w-full appearance-none bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 pr-10 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="INR">INR (₹)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="CAD">CAD ($)</option>
                          <option value="AUD">AUD ($)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* External Link URL */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-url" className="text-xs font-semibold text-slate-700">
                    {formType === "EXTERNAL_LINK" ? "External Wishlist Link * (Required)" : "External Link URL (Optional)"}
                  </label>
                  <input
                    id="modal-url"
                    type="url"
                    placeholder="https://amazon.com/baby-reg/..."
                    value={formExternalUrl}
                    onChange={(e) => setFormExternalUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-800 transition-colors"
                    required={formType === "EXTERNAL_LINK"}
                  />
                </div>

                {/* Active Switch */}
                <div className="flex items-center justify-between bg-slate-50 p-3 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center gap-2">
                    {formIsActive ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Registry Active</p>
                      <p className="text-[11px] text-slate-500">Guests will be able to see and contribute to this</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formIsActive ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formIsActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Modal Actions Footer */}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md focus:outline-none"
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
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-6 z-10 text-slate-800"
            >
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Registry
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Are you sure you want to delete this registry? This will permanently remove all contributions and details. This operation cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md focus:outline-none"
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
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <RegistriesPageContent />
    </Suspense>
  );
}
