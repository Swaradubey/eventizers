"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import messageService, { Message, UserStats, MessageDetail } from "../../../services/messageService";
import {
  LogOut,
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
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMessagesPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // Messages, Loading, & Error States
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter parameters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [recipientTypeFilter, setRecipientTypeFilter] = useState("");

  // Statistics State
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Modals
  const [viewingMessage, setViewingMessage] = useState<MessageDetail | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Route protection (Admin only)
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/admin/login");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // Fetch messages from admin endpoint
  const fetchMessages = async () => {
    if (!user || user.role !== "ADMIN") return;
    setLoadingMessages(true);
    setError(null);
    try {
      const params = {
        search: search || undefined,
        status: statusFilter || undefined,
        recipientType: recipientTypeFilter || undefined,
      };
      const data = await messageService.getAdminMessages(params);
      if (data && data.success) {
        setMessages(data.messages || []);
      }
    } catch (err: any) {
      console.error("Admin Messages: Failed to fetch messages:", err);
      setError(err.response?.data?.error || err.message || "Failed to load platform messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Fetch aggregate platform statistics
  const fetchStats = async () => {
    if (!user || user.role !== "ADMIN") return;
    setLoadingStats(true);
    try {
      const data = await messageService.getAdminMessageStats();
      if (data && data.success) {
        setStats(data.stats);
      }
    } catch (err: any) {
      console.error("Admin Messages: Failed to fetch stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchMessages();
      fetchStats();
    }
  }, [user, search, statusFilter, recipientTypeFilter]);

  // Toast notifier timer
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
    router.push("/admin/login");
  };

  // Admin view details details loader
  const handleViewDetails = async (messageId: string) => {
    setLoadingDetailId(messageId);
    try {
      const data = await messageService.getAdminMessageById(messageId);
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
              <div className="flex items-center gap-2">
                <h1
                  className="text-4xl md:text-5xl font-semibold text-[#2D1B3D] font-display"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Admin Messages
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/25">
                  Admin
                </span>
              </div>
              <p className="text-sm text-[#2D1B3D]/60 mt-1">
                Monitor and view guest communications sent across the platform
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

        {/* Aggregate platform statistics */}
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
              {/* Platform Total Messages */}
              <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2D1B3D]/5 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-[#2D1B3D]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Total Platform Messages
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {stats?.totalMessages ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Platform Sent */}
              <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Successfully Sent
                    </p>
                    <p className="text-2xl font-bold text-emerald-700 mt-0.5">
                      {stats?.sentMessages ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Platform Total Recipients logged */}
              <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Total Recipients Mapped
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {stats?.totalRecipients ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Table + Filter Panel */}
        <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col min-h-[500px]">
          {/* Controls */}
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-center mb-6 w-full">
            <h3 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
              All Platform Messages ({messages.length})
            </h3>

            <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto items-stretch md:items-center">
              {/* Search field */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-[#2D1B3D]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search subject, sender, event..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#2D1B3D]/55 flex-shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#FAF8F5] border border-[#E8C4B8]/40 px-3 py-2 pr-8 rounded-xl text-xs font-semibold text-[#2D1B3D] cursor-pointer focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="SENT">Sent</option>
                  <option value="FAILED">Failed</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>

              {/* Recipient Type Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={recipientTypeFilter}
                  onChange={(e) => setRecipientTypeFilter(e.target.value)}
                  className="bg-[#FAF8F5] border border-[#E8C4B8]/40 px-3 py-2 pr-8 rounded-xl text-xs font-semibold text-[#2D1B3D] cursor-pointer focus:outline-none"
                >
                  <option value="">All Recipient Groups</option>
                  <option value="ALL_GUESTS">All Guests</option>
                  <option value="ATTENDING">Attending Guests</option>
                  <option value="DECLINED">Declined Guests</option>
                  <option value="PENDING">Pending Guests</option>
                  <option value="SELECTED">Selected Guests</option>
                </select>
              </div>
            </div>
          </div>

          {loadingMessages ? (
            <div className="space-y-4 py-6">
              {[...Array(5)].map((_, i) => (
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
                There are no messages matching your search or filter options.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8C4B8]/30">
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Sender
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Recipient Type
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
                  {messages.map((msg) => (
                    <tr
                      key={msg.id}
                      className="hover:bg-[#FAF8F5]/60 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#2D1B3D]">
                            {msg.subject}
                          </span>
                          <span className="text-xs text-[#2D1B3D]/50 line-clamp-1 max-w-[180px]">
                            {msg.body}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#2D1B3D]">{msg.senderName}</span>
                          <span className="text-[10px] text-[#2D1B3D]/55">{msg.senderEmail}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-[#2D1B3D]/80">
                        {msg.eventTitle}
                      </td>
                      <td className="py-4 px-4 text-xs text-[#2D1B3D]/80 font-bold">
                        {msg.recipientCount} recipients
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-md text-[10px]">
                          {msg.recipientType.replace("_", " ")}
                        </span>
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
                        <button
                          onClick={() => handleViewDetails(msg.id)}
                          disabled={loadingDetailId === msg.id}
                          title="View Details"
                          className="p-2 text-[#2D1B3D]/65 hover:text-[#2D1B3D] hover:bg-[#F0EBE8] rounded-lg transition-all focus:outline-none disabled:opacity-40"
                        >
                          {loadingDetailId === msg.id ? (
                            <div className="w-4 h-4 border-2 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ADMIN DETAIL DIALOG MODAL */}
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
                    Admin Inspection &bull; Event: {viewingMessage.eventTitle}
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
                {/* Sender details */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8C4B8]/20 text-xs">
                  <p className="font-bold text-[#2D1B3D]/50 uppercase tracking-wider mb-1.5">Sender Info</p>
                  <div className="flex justify-between">
                    <span>Name: <strong>{viewingMessage.senderName}</strong></span>
                    <span>Email: <strong>{viewingMessage.senderEmail}</strong></span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8C4B8]/20">
                  <p className="text-xs font-semibold text-[#2D1B3D]/50 uppercase tracking-wider mb-1">
                    Message Content
                  </p>
                  <p className="text-sm whitespace-pre-line leading-relaxed">{viewingMessage.body}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs p-1 bg-[#FAF8F5]/30 border border-[#E8C4B8]/10 rounded-xl">
                  <div className="p-2">
                    <p className="text-[9px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Group Selected</p>
                    <p className="font-semibold capitalize mt-0.5">{viewingMessage.recipientType.replace("_", " ").toLowerCase()}</p>
                  </div>
                  <div className="p-2">
                    <p className="text-[9px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Sent Time</p>
                    <p className="font-semibold mt-0.5">{formatDate(viewingMessage.sentAt || viewingMessage.createdAt)}</p>
                  </div>
                </div>

                {/* Recipient list */}
                <div className="pt-2 border-t border-[#E8C4B8]/20">
                  <h4 className="text-xs font-bold text-[#2D1B3D] mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#C9A84C]" />
                    Target Recipients ({viewingMessage.recipients.length})
                  </h4>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {viewingMessage.recipients.length === 0 ? (
                      <p className="text-xs text-[#2D1B3D]/40 text-center py-2">No recipients mapped.</p>
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
    </div>
  );
}
