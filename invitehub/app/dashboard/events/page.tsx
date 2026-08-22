"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import EventModal from "../../../components/EventModal";
import Pagination from "../../../components/Pagination";
import eventService, { Event } from "../../../services/eventService";
import { getImageUrl } from "../../../utils/imageUrl";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  X,
  CheckCircle,
  Menu,
  ArrowRight,
  Mail,
  Users,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { NEW_TEMPLATE_IMAGES } from "../../../lib/newTemplatesData";

const getTemplateImage = (templateId?: string | null) => {
  if (!templateId) return null;
  const mapping: Record<string, string> = {
    "tpl-birthday-maya": "/assets/templates/birthday.jpg",
    "tpl-wedding-liam": "/assets/templates/wedding.jpg",
    "tpl-corporate-launch": "/assets/templates/corporate.jpg",
    "tpl-dinner-party": "/assets/templates/dinner.jpg",
    "tpl-baby-shower": "/assets/templates/babyshower.jpg",
    "tpl-charity-gala": "/assets/templates/gala.jpg",
    "tpl-live-music": "/assets/templates/music.jpg",
    "tpl-anniversary-james": "/assets/templates/anniversary.jpg",
    "tpl-grad-gala": "/assets/templates/graduation_gala.jpg",
    "tpl-grad-class2026": "/assets/templates/graduation_class_2026.jpg",
    "tpl-grad-degree": "/assets/templates/graduation_degree.jpg",
    "tpl-comm-meetup": "/assets/templates/community_meetup.jpg",
    "tpl-comm-celebration": "/assets/templates/community_celebration.jpg",
    "tpl-comm-volunteer": "/assets/templates/community_volunteer.jpg",
    "tpl-net-professional": "/assets/templates/networking_professional.jpg",
    "tpl-net-founders": "/assets/templates/networking_founders.jpg",
    "tpl-net-connections": "/assets/templates/networking_connections.jpg",
    ...NEW_TEMPLATE_IMAGES,
  };
  return mapping[templateId] || null;
};

type FilterStatus = "all" | "active" | "draft" | "completed";

function EventsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // Events & UI states
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active filter tab
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>("all");

  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Active action dropdown menu for individual card
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Close card menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Fetch events
  const fetchEvents = async () => {
    if (!user) return;
    setLoadingEvents(true);
    setError(null);
    try {
      const data = await eventService.getEvents();
      if (data && data.success) {
        setEvents(data.events || []);
      }
    } catch (err: any) {
      console.error("Events page: Failed to fetch events:", err);
      if (err.response && err.response.status === 401) {
        setError("Session expired. Please sign in again.");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        router.push("/login");
      } else if (!err.response) {
        setError("Unable to connect to the server.");
      } else {
        setError(err.response.data?.error || err.response.data?.message || "Failed to fetch events from server.");
      }
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  // Auto-open create modal when navigated with ?create=true
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("create") === "true" && user) {
      setEditingEvent(null);
      setIsModalOpen(true);
      router.replace("/dashboard/events", { scroll: false });
    }
  }, [searchParams, user, router]);

  // Toast timers
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  // Open modal for creation
  const handleCreateClick = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await eventService.deleteEvent(deleteConfirmId);
      if (res && res.success) {
        triggerToast("Event deleted successfully!");
        setEvents((prev) => prev.filter((e) => e.id !== deleteConfirmId));
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Failed to delete the event.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Callback on successful create/edit
  const handleSuccess = (message: string) => {
    triggerToast(message);
    fetchEvents();
  };

  // Format date helper (e.g. "Jun 15")
  const formatCardDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  // Format full date readable
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "-";
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine normalized status category
  const getEventCategory = (event: Event): "active" | "draft" | "completed" => {
    const status = (event.status || "").toLowerCase().trim();
    if (status === "draft") return "draft";
    if (status === "completed" || status === "archived") return "completed";
    if (status === "active" || status === "published") return "active";

    // If status is empty or undefined, check date
    if (event.eventDate) {
      const d = new Date(event.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!isNaN(d.getTime()) && d < today) {
        return "completed";
      }
    }
    return "active";
  };

  // Dynamic filter counts
  const filterCounts = useMemo(() => {
    let all = events.length;
    let active = 0;
    let draft = 0;
    let completed = 0;

    events.forEach((event) => {
      const cat = getEventCategory(event);
      if (cat === "active") active++;
      else if (cat === "draft") draft++;
      else if (cat === "completed") completed++;
    });

    return { all, active, draft, completed };
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (selectedFilter === "all") return events;
    return events.filter((e) => getEventCategory(e) === selectedFilter);
  }, [events, selectedFilter]);

  // Pagination calculations
  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage, itemsPerPage]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative">
      <Navbar />

      {/* Main container */}
      <main className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 z-10">
        {/* Header Row: Title, Subtitle, and + New Event Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile Sidebar */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                All events
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                View and manage all your events
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0070F3] hover:bg-[#0060df] rounded-xl active:scale-95 transition-all shadow-sm focus:outline-none"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Event</span>
          </button>
        </div>

        {/* Dynamic Filter Pills */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap focus:outline-none ${
              selectedFilter === "all"
                ? "bg-[#625BF6] text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            All Events ({filterCounts.all})
          </button>

          <button
            onClick={() => setSelectedFilter("active")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap focus:outline-none ${
              selectedFilter === "active"
                ? "bg-[#625BF6] text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Active ({filterCounts.active})
          </button>

          <button
            onClick={() => setSelectedFilter("draft")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap focus:outline-none ${
              selectedFilter === "draft"
                ? "bg-[#625BF6] text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Draft ({filterCounts.draft})
          </button>

          <button
            onClick={() => setSelectedFilter("completed")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap focus:outline-none ${
              selectedFilter === "completed"
                ? "bg-[#625BF6] text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Completed ({filterCounts.completed})
          </button>
        </div>

        {/* Success/Error Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-slate-200"
            >
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold text-slate-800">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Section */}
        {loadingEvents ? (
          /* Loading skeleton */
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs animate-pulse"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="h-6 bg-slate-200 rounded-md w-1/3"></div>
                  <div className="h-5 w-5 bg-slate-200 rounded-full"></div>
                </div>
                <div className="h-4 bg-slate-100 rounded-md w-1/2 mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 border-t border-b border-slate-100 my-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-1">
                      <div className="h-3 bg-slate-100 rounded w-12"></div>
                      <div className="h-5 bg-slate-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <div className="h-10 bg-slate-100 rounded-xl flex-1"></div>
                  <div className="h-10 bg-slate-100 rounded-xl flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Failed to load events</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">{error}</p>
            {error !== "Session expired. Please sign in again." && (
              <button
                onClick={() => fetchEvents()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#625BF6] rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        ) : filteredEvents.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-[#625BF6]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {selectedFilter === "all"
                ? "No Events Found"
                : `No ${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Events`}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mb-6">
              {selectedFilter === "all"
                ? "Get started by creating your very first event and inviting guests."
                : `There are currently no events matching the "${selectedFilter}" filter.`}
            </p>
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0070F3] hover:bg-[#0060df] rounded-xl active:scale-95 transition-all shadow-sm focus:outline-none"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Event</span>
            </button>
          </div>
        ) : (
          /* Card-Based Event Layout */
          <div className="space-y-4">
            {paginatedEvents.map((event) => {
              const category = getEventCategory(event);
              const totalGuests = event.totalGuests ?? 0;
              const attending = event.attendingCount ?? 0;
              const declined = event.declinedCount ?? 0;
              const rsvpRate =
                event.rsvpRate !== undefined
                  ? event.rsvpRate
                  : totalGuests > 0
                  ? Math.round((attending / totalGuests) * 100)
                  : 0;

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all duration-200"
                >
                  {/* Card Top: Title, Status Badge, and Arrow Link */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2
                          onClick={() => setViewingEvent(event)}
                          className="text-lg sm:text-xl font-bold text-[#4F46E5] hover:text-[#3730A3] transition-colors cursor-pointer truncate"
                        >
                          {event.title}
                        </h2>

                        {/* Status Badge */}
                        {category === "active" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#E8F8EE] text-[#10B981]">
                            Active
                          </span>
                        )}
                        {category === "draft" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">
                            Draft
                          </span>
                        )}
                        {category === "completed" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                            Completed
                          </span>
                        )}
                      </div>

                      {/* Event Description / Subtitle */}
                      <p className="text-sm text-slate-500 mt-1 font-normal line-clamp-1">
                        {event.description || event.venue || "No description provided"}
                      </p>
                    </div>

                    {/* Right-arrow link & Extra Menu */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === event.id ? null : (event.id || null));
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown menu */}
                        {activeMenuId === event.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 font-medium text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                handleEditClick(event);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit Event</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                router.push(`/dashboard/invitations?eventId=${event.id}`);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Mail className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Design Invitation</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                router.push(`/dashboard/guests?eventId=${event.id}`);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Users className="w-3.5 h-3.5 text-slate-500" />
                              <span>Manage Guests</span>
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setDeleteConfirmId(event.id || null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete Event</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => router.push(`/dashboard/invitations?eventId=${event.id}`)}
                        className="p-1 text-[#625BF6] hover:text-[#4338CA] hover:translate-x-0.5 transition-all focus:outline-none"
                        title="Go to Event"
                        aria-label="Go to event"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Metrics & RSVP Stats Row (5 Columns) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 py-4 border-t border-b border-slate-100 my-5">
                    {/* Date */}
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Date</span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block">
                        {formatCardDate(event.eventDate)}
                      </span>
                    </div>

                    {/* Total Guests */}
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Total Guests</span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block">
                        {totalGuests}
                      </span>
                    </div>

                    {/* Attending */}
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Attending</span>
                      <span className="text-sm sm:text-base font-bold text-[#10B981] mt-0.5 block">
                        {attending}
                      </span>
                    </div>

                    {/* Declined */}
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Declined</span>
                      <span className="text-sm sm:text-base font-bold text-[#EF4444] mt-0.5 block">
                        {declined}
                      </span>
                    </div>

                    {/* RSVP Rate */}
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">RSVP Rate</span>
                      <div className="flex items-center gap-2.5 mt-1.5">
                        <div className="w-14 sm:w-16 h-2 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                          <div
                            className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, rsvpRate))}%` }}
                          />
                        </div>
                        <span className="text-sm sm:text-base font-bold text-slate-900">
                          {rsvpRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions: Manage & Preview */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => router.push(`/dashboard/invitations?eventId=${event.id}`)}
                      className="flex-1 py-2.5 px-4 bg-[#F4F3FF] hover:bg-[#EBE9FE] text-[#5B50E5] font-semibold text-sm rounded-xl transition-all duration-150 text-center active:scale-[0.99] focus:outline-none"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => setViewingEvent(event)}
                      className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all duration-150 text-center active:scale-[0.99] focus:outline-none shadow-xs"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loadingEvents && !error && filteredEvents.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              limit={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
              loading={loadingEvents}
              itemName="events"
              hideOnSinglePage={false}
            />
          </div>
        )}
      </main>

      {/* CREATE / EDIT EVENT MODAL */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        eventToEdit={editingEvent}
      />

      {/* EVENT DETAILS / PREVIEW DIALOG */}
      <AnimatePresence>
        {viewingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingEvent(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative bg-white w-full max-w-lg max-h-[90vh] my-auto flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 text-slate-900"
            >
              {/* Header */}
              <div className="flex justify-between items-start p-5 sm:p-6 pb-4 border-b border-slate-100 flex-shrink-0 bg-white">
                <div className="pr-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#625BF6]">
                    {viewingEvent.eventType || "General"} Event
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 leading-snug break-words">
                    {viewingEvent.title}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingEvent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0 -mr-1"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
                {(viewingEvent.coverImage || getTemplateImage(viewingEvent.selectedTemplateId)) && (
                  <div className="w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                    <img
                      src={getImageUrl(viewingEvent.coverImage || getTemplateImage(viewingEvent.selectedTemplateId) || "")}
                      alt={viewingEvent.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* RSVP Stats Grid in Preview */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                    <span className="text-sm font-bold text-slate-900">{viewingEvent.totalGuests ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Attending</span>
                    <span className="text-sm font-bold text-emerald-600">{viewingEvent.attendingCount ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Declined</span>
                    <span className="text-sm font-bold text-rose-500">{viewingEvent.declinedCount ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">RSVP Rate</span>
                    <span className="text-sm font-bold text-[#625BF6]">
                      {viewingEvent.rsvpRate ?? (viewingEvent.totalGuests ? Math.round(((viewingEvent.attendingCount || 0) / viewingEvent.totalGuests) * 100) : 0)}%
                    </span>
                  </div>
                </div>

                {viewingEvent.description && (
                  <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-full">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Description
                    </p>
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed text-slate-700">
                      {viewingEvent.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-[#625BF6] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Date
                      </p>
                      <p className="font-semibold text-xs text-slate-800">{formatDate(viewingEvent.eventDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#625BF6] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Time
                      </p>
                      <p className="font-semibold text-xs text-slate-800">{viewingEvent.eventTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-[#625BF6] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Location
                    </p>
                    <p className="font-semibold text-xs text-slate-800 break-words">{viewingEvent.venue}</p>
                    {(viewingEvent.address ||
                      viewingEvent.city ||
                      viewingEvent.state ||
                      viewingEvent.country) && (
                        <p className="text-xs text-slate-500 mt-0.5 break-words">
                          {[
                            viewingEvent.address,
                            viewingEvent.city,
                            viewingEvent.state,
                            viewingEvent.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 px-1 text-xs text-slate-400">
                  <span>Status: <strong className="text-slate-700 uppercase font-bold">{viewingEvent.status || "Draft"}</strong></span>
                  <span>Created: {formatDateTime(viewingEvent.createdAt || "")}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex-shrink-0">
                <button
                  onClick={() => {
                    const id = viewingEvent.id;
                    setViewingEvent(null);
                    router.push(`/dashboard/invitations?eventId=${id}`);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#625BF6] hover:bg-indigo-700 rounded-xl active:scale-95 transition-all shadow-sm focus:outline-none flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Manage Invitation
                </button>
                <button
                  onClick={() => setViewingEvent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl active:scale-95 transition-all focus:outline-none"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 p-6 text-slate-900"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Delete Event
              </h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Are you sure you want to delete this event? This will remove the event, its guest list, and invitations permanently.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm focus:outline-none"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <EventsPageContent />
    </Suspense>
  );
}
