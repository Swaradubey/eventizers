"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import EventModal from "../../../components/EventModal";
import adminService, { AdminEvent } from "../../../services/adminService";
import Pagination from "../../../components/Pagination";
import { getImageUrl } from "../../../utils/imageUrl";
import EventThumbnail from "../../../components/EventThumbnail";

import { Guest } from "../../../types/guestTypes";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const dynamic = "force-dynamic";

function AdminEventsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // Events & UI states
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const EVENTS_PER_PAGE = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<AdminEvent | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
  const fetchEvents = async (pageToFetch: number = currentPage) => {
    if (!user || user.role !== "ADMIN") return;
    setLoadingEvents(true);
    setError(null);
    try {
      const data = await adminService.getAdminEvents(pageToFetch, EVENTS_PER_PAGE);
      if (data && data.success) {
        setEvents(data.events || []);
        if (data.pagination) {
          setTotalEvents(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        } else {
          setTotalEvents((data.events || []).length);
          setTotalPages(1);
        }
      }
    } catch (err: any) {
      console.error("Admin Events Page: Failed to fetch events:", err);
      setError(err.response?.data?.error || err.message || "Failed to fetch admin events.");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchEvents(currentPage);
    }
  }, [user, currentPage]);

  // Handle toast timers
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle empty page after deletion
  useEffect(() => {
    const maxPage = Math.ceil(totalEvents / EVENTS_PER_PAGE);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [totalEvents, currentPage]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
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
        fetchEvents(currentPage);
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
    fetchEvents(currentPage);
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
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-[#2563EB] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/50 flex flex-col font-sans text-slate-900 relative overflow-x-hidden">
      {/* Subtle dot / cross grid background pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none" />

      {/* Atmospheric soft blur highlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-48 right-1/4 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 pb-12 z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Events
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage all events across the entire platform
              </p>
            </div>
          </div>
        </div>

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
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold text-slate-900">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="flex-1 flex flex-col bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,50,150,0.05)] relative"
          style={{
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 10px 30px -10px rgba(0, 50, 150, 0.05)",
          }}
        >
          {!loadingEvents && totalEvents > 0 && (
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {totalEvents} {totalEvents === 1 ? "Event" : "Events"} Found Across Platform
              </span>
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 active:scale-95 rounded-xl transition-all shadow-sm focus:outline-none"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Event</span>
              </button>
            </div>
          )}

          {loadingEvents ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-[#2563EB] rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-500 mt-4">Loading events...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900">Failed to load events</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">{error}</p>
              <button
                onClick={() => fetchEvents()}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
              >
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
                <Calendar className="w-8 h-8 text-[#2563EB]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Events Found</h3>
              <p className="text-sm text-slate-500 max-w-md mb-8">
                No events have been created on the platform yet. Set up the first platform event here.
              </p>
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl active:scale-95 transition-all shadow-md focus:outline-none"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Create Event
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/50">
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Creator
                    </th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-blue-50/40 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <EventThumbnail
                            event={event}
                            size="sm"
                            onPreview={() => setViewingEvent(event)}
                          />
                          <span className="text-sm font-semibold text-slate-900 truncate max-w-[180px]">
                            {event.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-700">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{event.user?.name || "-"}</span>
                          <span className="text-[11px] text-slate-400">{event.user?.email || "-"}</span>
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
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {formatDateTime(event.createdAt || "")}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
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
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalEvents}
            limit={EVENTS_PER_PAGE}
            onPageChange={(p) => setCurrentPage(p)}
            loading={loadingEvents}
            itemName="events"
          />
        </div>
      </main>

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setViewingEvent(null);
                setShowGuestList(false);
                setEventGuests([]);
              }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg max-h-[90vh] my-auto flex flex-col rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 text-slate-900 font-sans"
            >
              {/* Fixed Header */}
              <div className="flex justify-between items-start p-5 sm:p-6 pb-4 border-b border-slate-100 flex-shrink-0 bg-white z-10">
                <div className="pr-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
                    {viewingEvent.eventType || "General"} Event &bull; Creator: {viewingEvent.user?.name || "Admin"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 leading-snug break-words">
                    {viewingEvent.title}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setViewingEvent(null);
                    setShowGuestList(false);
                    setEventGuests([]);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0 -mr-1"
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
                  className="w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0"
                  imageClassName="w-full h-full"
                  clickable={false}
                />

                {viewingEvent.description && (
                  <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-full">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Description
                    </p>
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed text-slate-700">
                      {viewingEvent.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-[#2563EB] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Date
                      </p>
                      <p className="font-semibold text-xs text-slate-800">{formatDate(viewingEvent.eventDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#2563EB] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Time
                      </p>
                      <p className="font-semibold text-xs text-slate-800">{viewingEvent.eventTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-[#2563EB] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Location
                    </p>
                    <p className="font-semibold text-xs text-slate-900 break-words">{viewingEvent.venue}</p>
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

                <div className="flex justify-between items-center pt-2 px-1 text-xs text-slate-500">
                  <span>Status: <strong className="text-slate-900 uppercase font-bold">{viewingEvent.status}</strong></span>
                  <span>Created: {formatDateTime(viewingEvent.createdAt || "")}</span>
                </div>

                {showGuestList && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">
                      Guest List ({loadingGuests ? "..." : eventGuests.length})
                    </h4>
                    {loadingGuests ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="w-5 h-5 border-2 border-blue-200 border-t-[#2563EB] rounded-full animate-spin"></div>
                      </div>
                    ) : eventGuests.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No guests found for this event.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200">
                              <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase">Name</th>
                              <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase">Email</th>
                              <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {eventGuests.map((guest) => (
                              <tr key={guest.id} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 text-xs text-slate-800 font-medium">{guest.name}</td>
                                <td className="py-2 px-3 text-xs text-slate-500">{guest.email}</td>
                                <td className="py-2 px-3">
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
              </div>

              {/* Fixed Footer */}
              <div className="flex items-center justify-end gap-2.5 p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex-shrink-0">
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
                  className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl active:scale-95 transition-all shadow-xs focus:outline-none"
                >
                  {showGuestList ? "Refresh Guests" : "View Guests"}
                </button>
                <button
                  onClick={() => {
                    setViewingEvent(null);
                    setShowGuestList(false);
                    setEventGuests([]);
                  }}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl active:scale-95 transition-all shadow-sm focus:outline-none"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 p-6 text-slate-900 font-sans"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Delete Event
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete this event? This action is permanent and cannot be undone.
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm focus:outline-none"
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

export default function AdminEventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-[#2563EB] rounded-full animate-spin"></div>
      </div>
    }>
      <AdminEventsPageContent />
    </Suspense>
  );
}
