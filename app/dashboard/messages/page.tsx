"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../invitehub/context/AuthContext";
import { useSidebar } from "../../../invitehub/context/SidebarContext";
import Navbar from "../../../invitehub/components/Navbar";
import messageService, { Message, UserStats, MessageDetail } from "../../../services/messageService";
import eventService, { Event } from "../../../services/eventService";
import guestService from "../../../services/guestService";
import Pagination from "../../../invitehub/components/Pagination";
import { Guest } from "../../../types/guestTypes";
import {
  LogOut,
  Plus,
  Trash2,
  Eye,
  Calendar,
  Users,
  Search,
  Mail,
  X,
  CheckCircle,
  AlertCircle,
  Menu,
  MessageSquare,
  Send,
  Info,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MessagesPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // Messages, Events, & UI states
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Statistics state
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Modals
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<MessageDetail | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Compose Form states
  const [composeEventId, setComposeEventId] = useState("");
  const [composeRecipientType, setComposeRecipientType] = useState("ALL_GUESTS");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSelectedGuestIds, setComposeSelectedGuestIds] = useState<string[]>([]);
  
  // Guests list for selected event (for SELECTED type)
  const [eventGuests, setEventGuests] = useState<Guest[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch user messages
  const fetchMessages = async () => {
    if (!user) return;
    setLoadingMessages(true);
    setError(null);
    try {
      const data = await messageService.getUserMessages(search || undefined);
      if (data && data.success) {
        setMessages(data.messages || []);
      }
    } catch (err: any) {
      console.error("Messages: Failed to fetch messages:", err);
      setError(err.response?.data?.error || err.message || "Failed to fetch messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    if (!user) return;
    setLoadingStats(true);
    try {
      const data = await messageService.getUserMessageStats();
      if (data && data.success) {
        setStats(data.stats);
      }
    } catch (err: any) {
      console.error("Messages: Failed to fetch stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch events for dropdown
  const fetchEvents = async () => {
    if (!user) return;
    try {
      const data = await eventService.getEvents();
      if (data && data.success) {
        setEvents(data.events || []);
        if (data.events && data.events.length > 0) {
          setComposeEventId(data.events[0].id || "");
        }
      }
    } catch (err: any) {
      console.error("Messages: Failed to fetch events:", err);
    }
  };

  // Fetch guests when event changes in compose modal
  useEffect(() => {
    const fetchGuestsForEvent = async () => {
      if (!composeEventId || !isComposeOpen) return;
      setLoadingGuests(true);
      try {
        const data = await guestService.getGuests(undefined, composeEventId);
        if (data && data.success) {
          setEventGuests(data.guests || []);
        }
      } catch (err: any) {
        console.error("Messages: Failed to fetch guests:", err);
      } finally {
        setLoadingGuests(false);
      }
    };
    fetchGuestsForEvent();
  }, [composeEventId, isComposeOpen]);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchStats();
      fetchEvents();
    }
  }, [user, search]);

  // Reset to page 1 whenever search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate pagination slices
  const totalItems = messages.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Ensure currentPage remains valid when list size changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedMessages = messages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Open message details
  const handleViewDetails = async (messageId: string) => {
    setLoadingDetailId(messageId);
    try {
      const data = await messageService.getUserMessageById(messageId);
      if (data && data.success) {
        setViewingMessage(data.message);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Failed to load message details.", "error");
    } finally {
      setLoadingDetailId(null);
    }
  };

  // Compose message submit
  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setComposeError(null);

    if (!composeEventId || !composeSubject || !composeBody || !composeRecipientType) {
      setComposeError("Please fill out all required fields.");
      return;
    }

    if (composeRecipientType === "SELECTED" && composeSelectedGuestIds.length === 0) {
      setComposeError("Please select at least one guest.");
      return;
    }

    setSending(true);
    try {
      const payload = {
        eventId: composeEventId,
        recipientType: composeRecipientType,
        recipientIds: composeRecipientType === "SELECTED" ? composeSelectedGuestIds : undefined,
        subject: composeSubject,
        body: composeBody,
      };

      const res = await messageService.sendMessage(payload);
      if (res.success) {
        triggerToast("Message sent and recorded successfully!");
        setIsComposeOpen(false);
        // Reset form
        setComposeSubject("");
        setComposeBody("");
        setComposeRecipientType("ALL_GUESTS");
        setComposeSelectedGuestIds([]);
        // Reload statistics and list
        fetchMessages();
        fetchStats();
      }
    } catch (err: any) {
      console.error(err);
      setComposeError(err.response?.data?.error || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  // Delete message submit
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await messageService.deleteMessage(deleteConfirmId);
      if (res && res.success) {
        triggerToast("Message deleted successfully!");
        setMessages((prev) => prev.filter((m) => m.id !== deleteConfirmId));
        fetchStats();
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to delete message.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleGuestCheckboxChange = (guestId: string) => {
    setComposeSelectedGuestIds((prev) =>
      prev.includes(guestId) ? prev.filter((id) => id !== guestId) : [...prev, guestId]
    );
  };

  // Helper formatting dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
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
            <button
              onClick={() => setIsOpen(true)}
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
                Messages
              </h1>
              <p className="text-sm text-[#2D1B3D]/60 mt-1">Communicate with your guests</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsComposeOpen(true)}
              disabled={events.length === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#FAF8F5] bg-[#2D1B3D] hover:bg-[#3d2a52] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-95 transition-all shadow-md focus:outline-none animate-pulse"
            >
              <Plus className="w-4 h-4" />
              Compose Message
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/40 hover:bg-[#F0EBE8] rounded-xl transition-all shadow-sm active:scale-95 focus:outline-none"
            >
              <LogOut className="w-3.5 h-3.5 text-[#C9A84C]" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Alerts / Toasts */}
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

        {/* Warning if no events */}
        {events.length === 0 && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 text-sm flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <div>
              You must create at least one event in the{" "}
              <span className="font-semibold cursor-pointer underline" onClick={() => router.push("/dashboard")}>
                Events dashboard
              </span>{" "}
              before you can send messages to guests.
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {loadingStats ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/60 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm animate-pulse h-[88px]"
                />
              ))}
            </>
          ) : (
            <>
              {/* Total Messages */}
              <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2D1B3D]/5 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-[#2D1B3D]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Total Messages
                    </p>
                    <p className="text-3xl font-bold text-[#2D1B3D] mt-0.5">
                      {stats?.totalMessages ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sent */}
              <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Sent
                    </p>
                    <p className="text-3xl font-bold text-emerald-700 mt-0.5">
                      {stats?.sentMessages ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recipients */}
              <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Recipients
                    </p>
                    <p className="text-3xl font-bold text-[#2D1B3D] mt-0.5">
                      {stats?.totalRecipients ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Message Search & Filter & Table panel */}
        <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6 w-full">
            <h3 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Message History
            </h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-[#2D1B3D]/70 font-semibold whitespace-nowrap">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#FAF8F5] border border-[#E8C4B8]/40 text-[#2D1B3D] py-1.5 px-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D1B3D]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>per page</span>
              </div>
              {/* Search field */}
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-[#2D1B3D]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                />
              </div>
            </div>
          </div>

          {loadingMessages ? (
            <div className="space-y-4 py-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h4 className="text-lg font-semibold text-[#2D1B3D]">Error loading messages</h4>
              <p className="text-xs text-[#2D1B3D]/60 mt-1 max-w-xs">{error}</p>
              <button
                onClick={fetchMessages}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52]"
              >
                Retry
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#E8C4B8]/40 flex items-center justify-center mb-6 shadow-sm">
                <MessageSquare className="w-8 h-8 text-[#C9A84C]" />
              </div>
              <h3 className="text-xl font-bold font-display text-[#2D1B3D] mb-1">No Messages Found</h3>
              <p className="text-xs text-[#2D1B3D]/50 max-w-sm">
                {search
                  ? "Try clearing your search filters."
                  : "Start communicating with your guest list by composing your first message."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8C4B8]/30">
                      <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                        Recipient Type
                      </th>
                      <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                        Recipients
                      </th>
                      <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                        Sent Date
                      </th>
                      <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8C4B8]/20">
                    {paginatedMessages.map((msg) => (
                      <tr
                        key={msg.id}
                        className="hover:bg-[#FAF8F5]/60 transition-colors duration-150 group"
                      >
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#2D1B3D]">
                              {msg.subject}
                            </span>
                            <span className="text-xs text-[#2D1B3D]/50 line-clamp-1 max-w-[200px]">
                              {msg.body}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-[#2D1B3D]/80">
                          {msg.eventTitle}
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-[#2D1B3D]/70">
                          <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-md text-[10px]">
                            {msg.recipientType.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-[#2D1B3D]/80 font-bold">
                          {msg.recipientCount} guests
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                              msg.status === "SENT"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : msg.status === "FAILED"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {msg.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-[#2D1B3D]/60">
                          {formatDate(msg.sentAt || msg.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleViewDetails(msg.id)}
                              disabled={loadingDetailId === msg.id}
                              title="View Recipients"
                              className="p-2 text-[#2D1B3D]/65 hover:text-[#2D1B3D] hover:bg-[#F0EBE8] rounded-lg transition-all focus:outline-none disabled:opacity-40"
                            >
                              {loadingDetailId === msg.id ? (
                                <div className="w-4 h-4 border-2 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(msg.id)}
                              title="Delete Message"
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

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                limit={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
                loading={loadingMessages}
                itemName="messages"
              />
            </>
          )}
        </div>
      </main>

      {/* COMPOSE MESSAGE MODAL */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!sending) setIsComposeOpen(false);
              }}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold font-display" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Compose Message
                </h3>
                <button
                  onClick={() => setIsComposeOpen(false)}
                  disabled={sending}
                  className="p-1 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-lg hover:bg-[#F0EBE8] transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {composeError && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{composeError}</span>
                </div>
              )}

              <form onSubmit={handleComposeSubmit} className="space-y-4">
                {/* Event selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50 mb-1.5">
                    Select Event
                  </label>
                  <div className="relative">
                    <select
                      value={composeEventId}
                      onChange={(e) => {
                        setComposeEventId(e.target.value);
                        setComposeSelectedGuestIds([]);
                      }}
                      disabled={sending}
                      className="w-full bg-[#FAF8F5] border border-[#E8C4B8]/40 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#2D1B3D] focus:outline-none focus:ring-1 focus:ring-[#2D1B3D]"
                    >
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Recipient Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50 mb-1.5">
                    Recipient Group
                  </label>
                  <select
                    value={composeRecipientType}
                    onChange={(e) => {
                      setComposeRecipientType(e.target.value);
                      setComposeSelectedGuestIds([]);
                    }}
                    disabled={sending}
                    className="w-full bg-[#FAF8F5] border border-[#E8C4B8]/40 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#2D1B3D] focus:outline-none focus:ring-1 focus:ring-[#2D1B3D]"
                  >
                    <option value="ALL_GUESTS">All Guests</option>
                    <option value="ATTENDING">Attending Guests (Confirmed)</option>
                    <option value="DECLINED">Declined Guests</option>
                    <option value="PENDING">Pending Guests (Invited / Pending)</option>
                    <option value="SELECTED">Selected Guests (Choose below)</option>
                  </select>
                </div>

                {/* Selected Guest IDs List */}
                {composeRecipientType === "SELECTED" && (
                  <div className="border border-[#E8C4B8]/30 rounded-xl p-3 bg-[#FAF8F5]/50">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50 mb-2">
                      Choose Recipients ({loadingGuests ? "Loading..." : eventGuests.length})
                    </label>
                    {loadingGuests ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="w-5 h-5 border-2 border-[#2D1B3D]/25 border-t-[#2D1B3D] rounded-full animate-spin"></div>
                      </div>
                    ) : eventGuests.length === 0 ? (
                      <p className="text-xs text-[#2D1B3D]/50 py-3 text-center">No guests found for this event.</p>
                    ) : (
                      <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                        {eventGuests.map((guest) => (
                          <label
                            key={guest.id}
                            className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-[#E8C4B8]/20 hover:bg-[#FAF8F5] cursor-pointer text-xs transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={composeSelectedGuestIds.includes(guest.id!)}
                              onChange={() => handleGuestCheckboxChange(guest.id!)}
                              disabled={sending}
                              className="rounded border-[#E8C4B8]/60 text-[#2D1B3D] focus:ring-[#2D1B3D]"
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold">{guest.name}</span>
                              <span className="text-[10px] text-[#2D1B3D]/50">{guest.email} &bull; {guest.status}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Subject */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Enter message subject..."
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    disabled={sending}
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                    required
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50 mb-1.5">
                    Message Body
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type your message details here..."
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    disabled={sending}
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    disabled={sending}
                    className="px-4 py-2.5 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] transition-all focus:outline-none disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl active:scale-95 transition-all shadow-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MESSAGE DETAILS VIEW DIALOG */}
      <AnimatePresence>
        {viewingMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingMessage(null)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A84C]">
                    Message Details &bull; Event: {viewingMessage.eventTitle}
                  </span>
                  <h3
                    className="text-2xl font-semibold font-display mt-0.5 text-ellipsis overflow-hidden"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {viewingMessage.subject}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingMessage(null)}
                  className="p-1 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-lg hover:bg-[#F0EBE8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mt-4 text-sm text-[#2D1B3D]/90">
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8C4B8]/20">
                  <p className="text-xs font-semibold text-[#2D1B3D]/50 uppercase tracking-wider mb-1">
                    Message Body
                  </p>
                  <p className="text-sm whitespace-pre-line leading-relaxed">{viewingMessage.body}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs p-1 bg-[#FAF8F5]/30 border border-[#E8C4B8]/10 rounded-xl">
                  <div className="p-2">
                    <p className="text-[9px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Recipient Type</p>
                    <p className="font-semibold capitalize mt-0.5">{viewingMessage.recipientType.replace("_", " ").toLowerCase()}</p>
                  </div>
                  <div className="p-2">
                    <p className="text-[9px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Sent Time</p>
                    <p className="font-semibold mt-0.5">{formatDate(viewingMessage.sentAt || viewingMessage.createdAt)}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8C4B8]/20">
                  <h4 className="text-xs font-bold text-[#2D1B3D] mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#C9A84C]" />
                    Recipients ({viewingMessage.recipients.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {viewingMessage.recipients.length === 0 ? (
                      <p className="text-xs text-[#2D1B3D]/40 text-center py-2">No recipients associated with this message.</p>
                    ) : (
                      viewingMessage.recipients.map((rec) => (
                        <div
                          key={rec.id}
                          className="flex justify-between items-center p-2 bg-[#FAF8F5]/50 border border-[#E8C4B8]/15 rounded-lg text-xs"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold">{rec.name}</span>
                            <span className="text-[10px] text-[#2D1B3D]/50">{rec.email}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              rec.status === "confirmed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : rec.status === "declined"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            {rec.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViewingMessage(null)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl active:scale-95 transition-all shadow-sm focus:outline-none"
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
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <h3
                className="text-lg font-semibold font-display mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Delete Message Record
              </h3>
              <p className="text-sm text-[#2D1B3D]/70 mb-6">
                Are you sure you want to delete this message record? This will also remove the recipient logging. This action is permanent and cannot be undone.
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
