"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import EventModal from "../../components/EventModal";
import eventService, { Event } from "../../services/eventService";
import dashboardService, { DashboardStats } from "../../services/dashboardService";
import { getImageUrl } from "../../utils/imageUrl";
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
  Sparkles,
  Menu,
  Users,
  TrendingUp,
  Zap,
  ImageIcon,
} from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";
import EventThumbnail, { getTemplateImage } from "../../components/EventThumbnail";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // Events & UI states
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Image preview modal state
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

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
      console.error("Dashboard page: Failed to fetch events:", err);
      setError(err.response?.data?.error || err.message || "Failed to fetch events from server.");
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    if (!user) return;
    setLoadingStats(true);
    try {
      const data = await dashboardService.getDashboardStats();
      if (data && data.success) {
        setDashboardStats({
          totalEvents: data.totalEvents,
          totalGuests: data.totalGuests,
          avgRsvpRate: data.avgRsvpRate,
          messagesSent: data.messagesSent,
        });
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Unable to load dashboard statistics.", "error");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchDashboardStats();
    }
  }, [user]);

  // Handle toast timers
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
        // Optimistic UI state update: remove row without full refresh
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

  // Format date readable
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC" // prevent local offset shift
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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/40 to-slate-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-300/50 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/40 to-slate-100 flex flex-col font-body text-slate-800 relative overflow-hidden">
      <Navbar />

      {/* Main container */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Top bar with Heading */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile Sidebar */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-xl border border-blue-200/60 bg-white/80 backdrop-blur-sm hover:bg-blue-50 transition-colors shadow-sm focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-blue-700" />
            </button>
            <div>
              <h1
                className="text-4xl md:text-5xl font-semibold text-slate-800 font-display"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage your events</p>
            </div>
          </div>
        </div>

        {/* Success/Error Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white/95 backdrop-blur-sm border-blue-100/60"
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

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {loadingStats ? (
            // Skeleton loaders
            <>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl p-6 shadow-sm animate-pulse"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 mb-5" />
                  <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
                  <div className="h-8 w-16 bg-slate-200 rounded" />
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
                className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-500 mt-5 mb-2">
                  Total Events
                </p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">
                  {dashboardStats?.totalEvents ?? 0}
                </p>
              </motion.div>

              {/* Total Guests */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0EA5E9] flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-500 mt-5 mb-2">
                  Total Guests
                </p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">
                  {dashboardStats?.totalGuests ?? 0}
                </p>
              </motion.div>

              {/* Avg. RSVP Rate */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#00C853] flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-500 mt-5 mb-2">
                  Avg. RSVP Rate
                </p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">
                  {dashboardStats?.avgRsvpRate ?? 0}%
                </p>
              </motion.div>

              {/* Messages Sent */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#FF5722] to-[#FF3D00] flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-500 mt-5 mb-2">
                  Messages Sent
                </p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">
                  {dashboardStats?.messagesSent ?? 0}
                </p>
              </motion.div>
            </>
          )}
        </div>

        {/* Inner page content container */}
        <div className="flex-1 flex flex-col bg-white/80 border border-blue-100/60 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
          {/* Top Actions bar - Only show create button at top if there are events */}
          {!loadingEvents && events.length > 0 && (
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {events.length} {events.length === 1 ? "Event" : "Events"} Found
              </span>
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl active:scale-95 transition-all shadow-md focus:outline-none"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loadingEvents ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24">
              <div className="w-8 h-8 border-3 border-blue-200/50 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-400 mt-4">Loading your events...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h3 className="text-lg font-semibold text-slate-800">Failed to load events</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">{error}</p>
              <button
                onClick={fetchEvents}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-800 mb-2">No Events Found</h3>
              <p className="text-sm text-slate-500 max-w-md mb-8">
                Create your first event to start managing your details, venues, and schedules seamlessly.
              </p>
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-1.5 px-6 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl active:scale-95 transition-all shadow-md focus:outline-none"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>
          ) : (
            /* Events Table */
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-blue-100/50">
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100/30">
                  {events.map((event) => {
                    return (
                    <tr
                      key={event.id}
                      className="hover:bg-blue-50/40 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <EventThumbnail
                            event={event}
                            size="md"
                            onPreview={(url, title) => setPreviewImage({ url, title: title || event.title })}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm leading-tight hover:text-blue-600 transition-colors truncate">
                              {event.title}
                            </p>
                            <span className="text-xs text-slate-400 font-normal md:hidden">
                              {event.eventType}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {event.eventType || "-"}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {formatDate(event.eventDate)}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {event.eventTime}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600 max-w-[150px] truncate">
                        {event.venue}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${event.status === "published"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : event.status === "cancelled"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                        >
                          {event.status || "Draft"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {formatDateTime(event.createdAt || "")}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewingEvent(event)}
                            title="View details"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all focus:outline-none"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(event)}
                            title="Edit event"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all focus:outline-none"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(event.id || null)}
                            title="Delete event"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all focus:outline-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* CREATE / EDIT EVENT MODAL */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        eventToEdit={editingEvent}
      />

      {/* EVENT DETAILS VIEW DIALOG */}
      <AnimatePresence>
        {viewingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
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
              className="relative bg-white w-full max-w-lg max-h-[90vh] my-auto flex flex-col rounded-2xl shadow-2xl border border-blue-100/60 overflow-hidden z-10 text-slate-800 font-body"
            >
              {/* Fixed Header */}
              <div className="flex justify-between items-start p-5 sm:p-6 pb-4 border-b border-blue-100/40 flex-shrink-0 bg-white z-10">
                <div className="pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                    {viewingEvent.eventType || "General"} Event
                  </span>
                  <h3
                    className="text-xl sm:text-2xl font-semibold font-display mt-0.5 leading-snug break-words"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {viewingEvent.title}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingEvent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0 -mr-1"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
                <EventThumbnail
                  event={viewingEvent}
                  size="full"
                  className="w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-blue-100/40 bg-blue-50/30 flex-shrink-0"
                  imageClassName="w-full h-full"
                  clickable={false}
                />

                {viewingEvent.description && (
                  <div className="p-3.5 sm:p-4 bg-blue-50/40 rounded-xl border border-blue-100/40 max-w-full">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Description
                    </p>
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed text-slate-700">
                      {viewingEvent.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100/40">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Date
                      </p>
                      <p className="font-semibold text-xs">{formatDate(viewingEvent.eventDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Time
                      </p>
                      <p className="font-semibold text-xs">{viewingEvent.eventTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/40 rounded-xl border border-blue-100/40">
                  <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
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
                  <span>Status: <strong className="text-slate-700 uppercase font-bold">{viewingEvent.status}</strong></span>
                  <span>Created: {formatDateTime(viewingEvent.createdAt || "")}</span>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex items-center justify-end p-4 sm:px-6 bg-blue-50/50 border-t border-blue-100/40 flex-shrink-0">
                <button
                  onClick={() => setViewingEvent(null)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl active:scale-95 transition-all shadow-sm focus:outline-none"
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
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-blue-100/60 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <h3
                className="text-lg font-semibold font-display mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Delete Event
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete this event? This action is permanent and cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-blue-100 rounded-xl hover:bg-blue-50 transition-all focus:outline-none"
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

      {/* IMAGE PREVIEW MODAL */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-blue-100/60 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-blue-100/40 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 truncate max-w-[280px]">{previewImage.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Card Preview</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/80 transition-colors"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Image */}
              <div className="p-4 bg-slate-50/50">
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="w-full max-h-[65vh] object-contain rounded-xl shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-16 text-slate-400">
                          <svg class="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          <p class="text-sm font-medium">Image could not be loaded</p>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
