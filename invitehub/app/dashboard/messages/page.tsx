"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import messageService, { Message, UserStats, MessageDetail } from "../../../services/messageService";
import eventService, { Event } from "../../../services/eventService";
import guestService from "../../../services/guestService";
import Pagination from "../../../components/Pagination";
import { Guest } from "../../../types/guestTypes";
import {
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
  Archive,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
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
  const [itemsPerPage] = useState(5);

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
  const totalPages = Math.ceil(totalItems / itemsPerPage); // 0 when empty → Pagination hides itself

  // Clamp currentPage whenever the list shrinks (e.g. after a delete)
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex   = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedMessages = messages.slice(startIndex, endIndex);

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
        setMessages((prev) => {
          const updated = prev.filter((m) => m.id !== deleteConfirmId);
          // Clamp page if the current page is now beyond the last page
          const newTotalPages = Math.ceil(updated.length / itemsPerPage);
          if (newTotalPages > 0 && currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
          }
          return updated;
        });
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Format date as YYYY-MM-DD for the card metadata
  const formatDateShort = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().slice(0, 10);
  };

  // Label for recipient type
  const recipientLabel = (type: string) => {
    switch (type) {
      case "ALL_GUESTS": return "All Guests";
      case "ATTENDING": return "Attending Only";
      case "DECLINED": return "Declined";
      case "PENDING": return "Pending";
      default: return type.replace("_", " ");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col font-body text-slate-900 relative"
      style={{
        backgroundColor: "#fbfcfe",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23cbd5e1' opacity='0.45'%3E%2B%3C/text%3E%3C/svg%3E\")",
      }}
    >
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-6 pb-12 z-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
              <p className="text-sm text-slate-500 mt-1">Communicate with your guests</p>
            </div>
          </div>

          <button
            onClick={() => setIsComposeOpen(true)}
            disabled={events.length === 0}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-2 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Compose
          </button>
        </div>

        {/* ── Toast ── */}
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
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold text-slate-900">{toast.message}</span>
              <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 transition-colors ml-2">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── No-events warning ── */}
        {events.length === 0 && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm flex gap-3 items-center">
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

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {loadingStats ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse h-[88px]" />
            ))
          ) : (
            <>
              {/* Total Messages */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center justify-between hover:border-slate-200 transition-all">
                <div>
                  <p className="text-xs font-medium text-slate-500">Total Messages</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.totalMessages ?? 0}</p>
                </div>
                <MessageSquare className="w-7 h-7 text-indigo-400" strokeWidth={1.5} />
              </div>

              {/* Sent */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center justify-between hover:border-slate-200 transition-all">
                <div>
                  <p className="text-xs font-medium text-slate-500">Sent</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.sentMessages ?? 0}</p>
                </div>
                <Send className="w-7 h-7 text-indigo-400" strokeWidth={1.5} />
              </div>

              {/* Recipients */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center justify-between hover:border-slate-200 transition-all">
                <div>
                  <p className="text-xs font-medium text-slate-500">Recipients</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.totalRecipients ?? 0}</p>
                </div>
                <Users className="w-7 h-7 text-indigo-400" strokeWidth={1.5} />
              </div>
            </>
          )}
        </div>

        {/* ── Sent Messages List ── */}
        <div className="flex flex-col gap-0">

          {loadingMessages ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-white border border-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h4 className="text-lg font-semibold text-slate-900">Error loading messages</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">{error}</p>
              <button
                onClick={fetchMessages}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5 shadow-sm">
                <MessageSquare className="w-8 h-8 text-indigo-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">No Messages Found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {search ? "Try clearing your search filters." : "Start communicating with your guests by composing your first message."}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {paginatedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center justify-between hover:border-slate-200 transition-all"
                  >
                    {/* Left: text content */}
                    <div className="flex-1 min-w-0">
                      {/* Title row with badge */}
                      <div className="flex items-center gap-0">
                        <span className="text-base font-semibold text-slate-900 truncate">{msg.subject}</span>
                        <span
                          className={`ml-2 inline-flex items-center bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-medium px-2 py-0.5 rounded-md flex-shrink-0 ${
                            msg.status === "FAILED" ? "!bg-red-50 !text-red-600 !border-red-100" :
                            msg.status === "DRAFT" ? "!bg-amber-50 !text-amber-600 !border-amber-100" : ""
                          }`}
                        >
                          {msg.status.toLowerCase()}
                        </span>
                      </div>
                      {/* Snippet */}
                      <p className="text-xs text-slate-500 mt-1 truncate max-w-xl">{msg.body}</p>
                      {/* Metadata */}
                      <p className="text-xs text-slate-400 mt-2">
                        To: {recipientLabel(msg.recipientType)} &bull; {formatDateShort(msg.sentAt || msg.createdAt)}
                      </p>
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleViewDetails(msg.id)}
                        disabled={loadingDetailId === msg.id}
                        title="View Recipients"
                        className="text-slate-400 hover:text-slate-600 p-2 cursor-pointer transition-colors rounded-lg hover:bg-slate-50 focus:outline-none disabled:opacity-40"
                      >
                        {loadingDetailId === msg.id ? (
                          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                        ) : (
                          <Archive className="w-4 h-4" />
                        )}
                      </button>

                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  limit={itemsPerPage}
                  onPageChange={(p) => setCurrentPage(p)}
                  loading={loadingMessages}
                  itemName="messages"
                />
              </div>
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
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${rec.status === "confirmed"
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
