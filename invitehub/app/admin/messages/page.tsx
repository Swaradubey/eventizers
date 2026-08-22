"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import messageService, { Message, UserStats, MessageDetail } from "../../../services/messageService";
import {
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
  const { user, loading: authLoading } = useAuth();
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-100/80 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-100/80 flex flex-col font-body text-slate-800 relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 sm:px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-xl border border-blue-100 bg-white/90 hover:bg-blue-50 transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-4xl md:text-5xl font-bold tracking-tight text-black font-display"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Admin Messages
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100/80 text-blue-700 border border-blue-200">
                  Admin
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Monitor and view guest communications sent across the platform
              </p>
            </div>
          </div>
        </div>

        {/* Alerts / Toasts */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-blue-100/80"
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

        {/* Aggregate platform statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {loadingStats ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-blue-50/50 border border-blue-100/60 rounded-2xl p-5 shadow-sm animate-pulse h-[88px]"
                />
              ))}
            </>
          ) : (
            <>
              {/* Platform Total Messages */}
              <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300/80 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-blue-500/20">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Platform Messages
                    </p>
                    <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                      {stats?.totalMessages ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Platform Sent */}
              <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300/80 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-emerald-500/20">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Successfully Sent
                    </p>
                    <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                      {stats?.sentMessages ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Platform Total Recipients logged */}
              <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300/80 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-indigo-500/20">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Recipients Mapped
                    </p>
                    <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                      {stats?.totalRecipients ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Table + Filter Panel */}
        <div className="bg-white/90 border border-blue-100 rounded-2xl p-6 shadow-sm flex flex-col min-h-[500px] backdrop-blur-md">
          {/* Controls */}
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-center mb-6 w-full">
            <h3 className="text-lg font-bold font-display text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              All Platform Messages ({messages.length})
            </h3>

            <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto items-stretch md:items-center">
              {/* Search field */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search subject, sender, event..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-800 placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-blue-100 px-3 py-2 pr-8 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                  className="bg-slate-50 border border-blue-100 px-3 py-2 pr-8 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                  className="h-16 bg-blue-50/50 border border-blue-100/60 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h4 className="text-lg font-semibold text-slate-900">Error loading messages</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">{error}</p>
              <button
                onClick={fetchMessages}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                Retry
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900 mb-1">No Messages Found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                There are no messages matching your search or filter options.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-blue-100 bg-blue-50/50">
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider rounded-l-xl">
                      Subject
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                      Sender
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                      Recipient Type
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                      Sent Date
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider text-right rounded-r-xl">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {messages.map((msg) => (
                    <tr
                      key={msg.id}
                      className="hover:bg-blue-50/40 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">
                            {msg.subject}
                          </span>
                          <span className="text-xs text-slate-500 line-clamp-1 max-w-[180px]">
                            {msg.body}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-900">{msg.senderName}</span>
                          <span className="text-[10px] text-slate-400">{msg.senderEmail}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-600">
                        {msg.eventTitle}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-700 font-bold">
                        {msg.recipientCount} recipients
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <span className="px-2 py-0.5 bg-blue-50 border border-blue-100/80 rounded-md text-[10px] text-blue-700 font-semibold">
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
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {msg.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {formatDate(msg.sentAt || msg.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleViewDetails(msg.id)}
                          disabled={loadingDetailId === msg.id}
                          title="View Details"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-40"
                        >
                          {loadingDetailId === msg.id ? (
                            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-blue-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Admin Inspection &bull; Event: {viewingMessage.eventTitle}
                  </span>
                  <h3
                    className="text-2xl font-bold font-display mt-0.5 text-slate-900 text-ellipsis overflow-hidden"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {viewingMessage.subject}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingMessage(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mt-4 text-sm text-slate-800">
                {/* Sender details */}
                <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 text-xs">
                  <p className="font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sender Info</p>
                  <div className="flex justify-between">
                    <span>Name: <strong className="text-slate-900">{viewingMessage.senderName}</strong></span>
                    <span>Email: <strong className="text-slate-900">{viewingMessage.senderEmail}</strong></span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-blue-100/80">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Message Content
                  </p>
                  <p className="text-sm whitespace-pre-line leading-relaxed text-slate-700">{viewingMessage.body}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs p-1 bg-slate-50/50 border border-blue-100/60 rounded-xl">
                  <div className="p-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Group Selected</p>
                    <p className="font-semibold text-slate-800 capitalize mt-0.5">{viewingMessage.recipientType.replace("_", " ").toLowerCase()}</p>
                  </div>
                  <div className="p-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sent Time</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{formatDate(viewingMessage.sentAt || viewingMessage.createdAt)}</p>
                  </div>
                </div>

                {/* Recipient list */}
                <div className="pt-2 border-t border-blue-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    Target Recipients ({viewingMessage.recipients.length})
                  </h4>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {viewingMessage.recipients.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2">No recipients mapped.</p>
                    ) : (
                      viewingMessage.recipients.map((rec) => (
                        <div
                          key={rec.id}
                          className="flex justify-between items-center p-2 bg-blue-50/30 border border-blue-100 rounded-lg text-xs"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{rec.name}</span>
                            <span className="text-[10px] text-slate-400">{rec.email}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              rec.status === "confirmed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : rec.status === "declined"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-blue-50 text-blue-700 border-blue-100"
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

              <div className="flex justify-end mt-6 pt-3 border-t border-blue-100">
                <button
                  onClick={() => setViewingMessage(null)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl active:scale-95 transition-all shadow-md shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
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
