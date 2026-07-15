"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/Navbar";
import EventModal from "../../../components/EventModal";
import adminService, { AdminEvent, AdminDashboardStats } from "../../../services/adminService";
import { Guest } from "../../../types/guestTypes";
import {
  LogOut,
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
  Sparkles,
  Menu,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useSidebar } from "../../../context/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // Events & UI states
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const EVENTS_PER_PAGE = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<AdminEvent | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Guest list for view modal
  const [eventGuests, setEventGuests] = useState<Guest[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [showGuestList, setShowGuestList] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Route protection
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/admin/login");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // Fetch events across all users
  const fetchEvents = async () => {
    if (!user || user.role !== "ADMIN") return;
    setLoadingEvents(true);
    setError(null);
    try {
      const data = await adminService.getAdminEvents();
      if (data && data.success) {
        setEvents(data.events || []);
        setCurrentPage(1);
      }
    } catch (err: any) {
      console.error("Admin Dashboard: Failed to fetch events:", err);
      setError(err.response?.data?.error || err.message || "Failed to fetch admin events.");
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch aggregated statistics
  const fetchDashboardStats = async () => {
    if (!user || user.role !== "ADMIN") return;
    setLoadingStats(true);
    try {
      const data = await adminService.getAdminStats();
      if (data && data.success && data.stats) {
        setDashboardStats(data.stats);
      }
    } catch (err: any) {
      console.error("Admin Dashboard: Failed to fetch stats:", err);
      triggerToast("Unable to load platform statistics.", "error");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchEvents();
      fetchDashboardStats();
    }
  }, [user]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle empty page after deletion
  useEffect(() => {
    const maxPage = Math.ceil(events.length / EVENTS_PER_PAGE);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [events.length, currentPage]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  // Open modal for creation
  const handleCreateClick = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEditClick = (event: AdminEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await adminService.deleteAdminEvent(deleteConfirmId);
      if (res && res.success) {
        triggerToast("Event deleted successfully by Admin!");
        // Optimistic UI state update: remove row without full refresh
        setEvents((prev) => prev.filter((e) => e.id !== deleteConfirmId));
        // Refresh statistics
        fetchDashboardStats();
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
    fetchDashboardStats();
  };

  // Format date readable
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

  // Pagination Calculations
  const totalPages = Math.ceil(events.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const paginatedEvents = events.slice(startIndex, startIndex + EVENTS_PER_PAGE);

  // Ellipsis page number list generator
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        end = 3;
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }
      
      if (start > 2) {
        pages.push("...");
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push("...");
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-body text-[#2D1B3D] relative overflow-hidden">
      <Navbar />

      {/* Main container with padding top to clear fixed navbar */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 z-10">
        {/* Top bar with Heading, Admin Label, and Sign Out */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile Sidebar */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-xl border border-[#E8C4B8]/40 bg-white hover:bg-[#F0EBE8] transition-colors shadow-sm focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-[#2D1B3D]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-4xl md:text-5xl font-semibold text-[#2D1B3D] font-display"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Admin Dashboard
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/25">
                  Admin
                </span>
              </div>
              <p className="text-sm text-[#2D1B3D]/60 mt-1">
                Manage all events across the entire platform
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/40 hover:bg-[#F0EBE8] rounded-xl transition-all shadow-sm active:scale-95 focus:outline-none"
          >
            <LogOut className="w-3.5 h-3.5 text-[#C9A84C]" />
            Sign Out
          </button>
        </div>

        {/* Success/Error Toast */}
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

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loadingStats ? (
            // Skeleton loaders
            <>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="border border-[#F8C9DD] rounded-2xl p-5 shadow-sm backdrop-blur-sm animate-pulse"
                  style={{ background: 'linear-gradient(135deg, rgba(255, 246, 250, 0.85) 0%, rgba(255, 234, 243, 0.85) 100%)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#EC4899]/10" />
                    <div className="flex-1">
                      <div className="h-3 w-20 bg-[#EC4899]/15 rounded mb-2" />
                      <div className="h-7 w-14 bg-[#EC4899]/20 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Actual KPI cards
            <>
              {/* Total Events */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0 }}
                className="border border-[#F8C9DD] rounded-2xl p-5 backdrop-blur-sm shadow-[0_8px_30px_rgba(244,114,182,0.12)] hover:shadow-[0_12px_30px_rgba(244,114,182,0.18)] hover:-translate-y-1 transition-all duration-[220ms] ease cursor-default"
                style={{ background: 'linear-gradient(135deg, rgba(255, 246, 250, 0.85) 0%, rgba(255, 234, 243, 0.85) 100%)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#FCE7F3] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-[#EC4899]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9D6B88]">
                      Total Events
                    </p>
                    <p className="text-[36px] font-bold text-[#831843] leading-none mt-1">
                      {dashboardStats?.totalEvents ?? 0}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Total Guests */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="border border-[#F8C9DD] rounded-2xl p-5 backdrop-blur-sm shadow-[0_8px_30px_rgba(244,114,182,0.12)] hover:shadow-[0_12px_30px_rgba(244,114,182,0.18)] hover:-translate-y-1 transition-all duration-[220ms] ease cursor-default"
                style={{ background: 'linear-gradient(135deg, rgba(255, 246, 250, 0.85) 0%, rgba(255, 234, 243, 0.85) 100%)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#FCE7F3] flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#EC4899]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9D6B88]">
                      Total Guests
                    </p>
                    <p className="text-[36px] font-bold text-[#831843] leading-none mt-1">
                      {dashboardStats?.totalGuests ?? 0}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Avg. RSVP Rate */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="border border-[#F8C9DD] rounded-2xl p-5 backdrop-blur-sm shadow-[0_8px_30px_rgba(244,114,182,0.12)] hover:shadow-[0_12px_30px_rgba(244,114,182,0.18)] hover:-translate-y-1 transition-all duration-[220ms] ease cursor-default"
                style={{ background: 'linear-gradient(135deg, rgba(255, 246, 250, 0.85) 0%, rgba(255, 234, 243, 0.85) 100%)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#FCE7F3] flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#EC4899]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9D6B88]">
                      Avg. RSVP Rate
                    </p>
                    <p className="text-[36px] font-bold text-[#831843] leading-none mt-1">
                      {dashboardStats?.averageRsvpRate ?? 0}%
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Messages Sent */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="border border-[#F8C9DD] rounded-2xl p-5 backdrop-blur-sm shadow-[0_8px_30px_rgba(244,114,182,0.12)] hover:shadow-[0_12px_30px_rgba(244,114,182,0.18)] hover:-translate-y-1 transition-all duration-[220ms] ease cursor-default"
                style={{ background: 'linear-gradient(135deg, rgba(255, 246, 250, 0.85) 0%, rgba(255, 234, 243, 0.85) 100%)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#FCE7F3] flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-[#EC4899]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9D6B88]">
                      Messages Sent
                    </p>
                    <p className="text-[36px] font-bold text-[#831843] leading-none mt-1">
                      {dashboardStats?.messagesSent ?? 0}
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Inner page content container */}
        <div className="flex-1 flex flex-col bg-white/60 border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
          {/* Top Actions bar */}
          {!loadingEvents && events.length > 0 && (
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                {events.length} {events.length === 1 ? "Event" : "Events"} Found Across Platform
              </span>
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#FAF8F5] bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl active:scale-95 transition-all shadow-md focus:outline-none"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loadingEvents ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24">
              <div className="w-8 h-8 border-3 border-[#2D1B3D]/25 border-t-[#2D1B3D] rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-[#2D1B3D]/50 mt-4">Loading events...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h3 className="text-lg font-semibold text-[#2D1B3D]">Failed to load events</h3>
              <p className="text-sm text-[#2D1B3D]/60 max-w-sm mt-1">{error}</p>
              <button
                onClick={fetchEvents}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52]"
              >
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#E8C4B8]/40 flex items-center justify-center mb-6 shadow-sm">
                <Calendar className="w-8 h-8 text-[#C9A84C]" />
              </div>
              <h3 className="text-2xl font-bold font-display text-[#2D1B3D] mb-2">No Events Found</h3>
              <p className="text-sm text-[#2D1B3D]/60 max-w-md mb-8">
                No events have been created on the platform yet. Set up the first platform event here.
              </p>
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-1.5 px-6 py-3 text-xs font-bold text-[#FAF8F5] bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl active:scale-95 transition-all shadow-md focus:outline-none"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>
          ) : (
            <>
            {/* Events Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8C4B8]/30">
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Creator
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8C4B8]/20">
                  {paginatedEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-[#FAF8F5]/60 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-4 text-sm font-semibold text-[#2D1B3D]">
                        {event.title}
                      </td>
                      <td className="py-4 px-4 text-xs text-[#2D1B3D]/80">
                        <div className="flex flex-col">
                          <span className="font-semibold">{event.user?.name || "-"}</span>
                          <span className="text-[10px] text-[#2D1B3D]/50">{event.user?.email || "-"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-[#2D1B3D]/80">
                        {event.eventType || "-"}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#2D1B3D]/80">
                        {formatDate(event.eventDate)}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#2D1B3D]/80">
                        {event.eventTime}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#2D1B3D]/80 max-w-[150px] truncate">
                        {event.venue}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            event.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : event.status === "cancelled"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {event.status || "Draft"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-[#2D1B3D]/60">
                        {formatDateTime(event.createdAt || "")}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewingEvent(event)}
                            title="View details"
                            className="p-2 text-[#2D1B3D]/65 hover:text-[#2D1B3D] hover:bg-[#F0EBE8] rounded-lg transition-all focus:outline-none"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(event)}
                            title="Edit event"
                            className="p-2 text-[#2D1B3D]/65 hover:text-[#C9A84C] hover:bg-[#F0EBE8] rounded-lg transition-all focus:outline-none"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(event.id || null)}
                            title="Delete event"
                            className="p-2 text-[#2D1B3D]/65 hover:text-red-600 hover:bg-[#F0EBE8] rounded-lg transition-all focus:outline-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {events.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-[#E8C4B8]/20 text-xs text-[#2D1B3D]/70 font-semibold select-none">
                <div>
                  Showing {events.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + EVENTS_PER_PAGE, events.length)} of {events.length} events
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white border border-[#E8C4B8]/30 rounded-xl hover:bg-[#F0EBE8] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-[#2D1B3D]"
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  {getPageNumbers().map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof p === "number" && setCurrentPage(p)}
                      disabled={p === "..."}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        p === currentPage
                          ? "bg-[#2D1B3D] text-white shadow-sm font-bold"
                          : p === "..."
                          ? "cursor-default text-[#2D1B3D]/40"
                          : "bg-white border border-[#E8C4B8]/30 hover:bg-[#F0EBE8] text-[#2D1B3D]"
                      }`}
                      aria-label={typeof p === "number" ? `Page ${p}` : "Ellipsis"}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-2 bg-white border border-[#E8C4B8]/30 rounded-xl hover:bg-[#F0EBE8] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-[#2D1B3D]"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </main>

      {/* CREATE / EDIT EVENT MODAL */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        eventToEdit={editingEvent}
        isAdmin={true}
      />

      {/* EVENT DETAILS VIEW DIALOG */}
      <AnimatePresence>
        {viewingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingEvent(null)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl border border-[#E8C4B8]/30 z-10 p-6 sm:px-8 text-[#2D1B3D] font-body"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A84C]">
                    {viewingEvent.eventType || "General"} Event &bull; Creator: {viewingEvent.user?.name || "Admin"}
                  </span>
                  <h3
                    className="text-2xl font-semibold font-display mt-0.5"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {viewingEvent.title}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingEvent(null)}
                  className="p-1 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-lg hover:bg-[#F0EBE8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {viewingEvent.coverImage && (
                <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-[#E8C4B8]/20">
                  <img
                    src={viewingEvent.coverImage}
                    alt={viewingEvent.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="space-y-3 mt-4 text-sm text-[#2D1B3D]/90">
                {viewingEvent.description && (
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8C4B8]/20 max-w-full overflow-hidden">
                    <p className="text-xs font-semibold text-[#2D1B3D]/50 uppercase tracking-wider mb-1">
                      Description
                    </p>
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{viewingEvent.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-[#2D1B3D]/50 uppercase tracking-wider">
                        Date
                      </p>
                      <p className="font-semibold text-xs">{formatDate(viewingEvent.eventDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-[#2D1B3D]/50 uppercase tracking-wider">
                        Time
                      </p>
                      <p className="font-semibold text-xs">{viewingEvent.eventTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-[#E8C4B8]/20">
                  <MapPin className="w-4 h-4 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Location
                    </p>
                    <p className="font-semibold text-xs">{viewingEvent.venue}</p>
                    {(viewingEvent.address ||
                      viewingEvent.city ||
                      viewingEvent.state ||
                      viewingEvent.country) && (
                      <p className="text-xs text-[#2D1B3D]/70 mt-0.5">
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

                <div className="flex justify-between items-center pt-4 mt-2 border-t border-[#E8C4B8]/25 text-xs text-[#2D1B3D]/50">
                  <span>Status: <strong className="text-[#2D1B3D] uppercase font-bold">{viewingEvent.status}</strong></span>
                  <span>Created: {formatDateTime(viewingEvent.createdAt || "")}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={async () => {
                    if (!viewingEvent?.id) return;
                    setLoadingGuests(true);
                    setShowGuestList(true);
                    try {
                      const data = await adminService.getAdminEventGuests(viewingEvent.id);
                      if (data?.success) {
                        setEventGuests(data.guests || []);
                      }
                    } catch {
                      setEventGuests([]);
                    } finally {
                      setLoadingGuests(false);
                    }
                  }}
                  className="px-5 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 hover:bg-[#F0EBE8] rounded-xl active:scale-95 transition-all shadow-sm focus:outline-none"
                >
                  View Guests
                </button>
                <button
                  onClick={() => {
                    setViewingEvent(null);
                    setShowGuestList(false);
                    setEventGuests([]);
                  }}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl active:scale-95 transition-all shadow-sm focus:outline-none"
                >
                  Close
                </button>
              </div>

              {showGuestList && (
                <div className="mt-4 pt-4 border-t border-[#E8C4B8]/25">
                  <h4 className="text-sm font-bold text-[#2D1B3D] mb-3">
                    Guest List ({loadingGuests ? "..." : eventGuests.length})
                  </h4>
                  {loadingGuests ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-5 h-5 border-2 border-[#2D1B3D]/25 border-t-[#2D1B3D] rounded-full animate-spin"></div>
                    </div>
                  ) : eventGuests.length === 0 ? (
                    <p className="text-xs text-[#2D1B3D]/50 text-center py-4">No guests found for this event.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#E8C4B8]/20">
                            <th className="py-2 px-2 text-[10px] font-bold text-[#2D1B3D]/50 uppercase">Name</th>
                            <th className="py-2 px-2 text-[10px] font-bold text-[#2D1B3D]/50 uppercase">Email</th>
                            <th className="py-2 px-2 text-[10px] font-bold text-[#2D1B3D]/50 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8C4B8]/10">
                          {eventGuests.map((guest) => (
                            <tr key={guest.id} className="hover:bg-[#FAF8F5]/40">
                              <td className="py-2 px-2 text-xs text-[#2D1B3D]">{guest.name}</td>
                              <td className="py-2 px-2 text-xs text-[#2D1B3D]/70">{guest.email}</td>
                              <td className="py-2 px-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                  guest.status === "confirmed"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : guest.status === "declined"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>
                                  {guest.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
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
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <h3
                className="text-lg font-semibold font-display mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Delete Event
              </h3>
              <p className="text-sm text-[#2D1B3D]/70 mb-6">
                Are you sure you want to delete this event? This action is permanent and cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] transition-all focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md focus:outline-none"
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
