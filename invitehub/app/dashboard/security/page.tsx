"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import securityService from "../../../services/securityService";
import { SecurityStats, SecurityAlert, AuditLog } from "../../../types/securityTypes";
import {
  Menu,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  CheckCircle,
  RotateCcw,
  Clock,
  User,
  FileText,
  AlertCircle,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SecurityPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen: setSidebarOpen } = useSidebar();
  const router = useRouter();

  // Data states
  const [stats, setStats] = useState<SecurityStats>({
    activeAlerts: 0,
    duplicateTickets: 0,
    failedVerifications: 0,
    securityScore: 100,
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion and Notification states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load security data from backend
  const fetchSecurityData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, alertsRes, logsRes] = await Promise.all([
        securityService.getSecuritySummary(),
        securityService.getSecurityAlerts(),
        securityService.getSecurityAuditLogs(),
      ]);

      if (summaryRes?.success && alertsRes?.success && logsRes?.success) {
        setStats({
          activeAlerts: Number(summaryRes.data?.activeAlerts || 0),
          duplicateTickets: Number(summaryRes.data?.duplicateTickets || 0),
          failedVerifications: Number(summaryRes.data?.failedVerifications || 0),
          securityScore: Number(summaryRes.data?.securityScore ?? 100),
        });
        setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : []);
        setAuditLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      } else {
        setError("Invalid response format received from server.");
      }
    } catch (err: any) {
      console.error("Error loading security dashboard data:", err);
      setError(
        err.response?.data?.error ||
          "Unable to load security information. Please verify database connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSecurityData();
    }
  }, [user]);

  // Toast auto-dismiss effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const handleDeleteLog = async () => {
    if (!deleteConfirmId) return;
    setDeletingId(deleteConfirmId);
    try {
      const res = await securityService.deleteAuditLog(deleteConfirmId);
      if (res && res.success) {
        triggerToast("Audit log deleted successfully.");
        setAuditLogs((prev) => prev.filter((log) => log.id !== deleteConfirmId));
      } else {
        triggerToast("Failed to delete the audit log.", "error");
      }
    } catch (err: any) {
      console.error("Delete Audit Log Error:", err);
      triggerToast(err.response?.data?.error || "Failed to delete the audit log.", "error");
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  // Date formatter helper
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return dateString;
    }
  };

  // Severity style mapping helper
  const getSeverityStyle = (severity: string) => {
    const sev = severity?.toUpperCase();
    if (sev === "HIGH") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (sev === "MEDIUM") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  // Loader skeleton
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

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
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
                Security Center
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Monitor activity, prevent fraud, and protect your events
              </p>
            </div>
          </div>
          <button
            onClick={fetchSecurityData}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-700 bg-white/80 backdrop-blur-sm border border-blue-200 hover:bg-blue-50 rounded-xl transition-all shadow-sm focus:outline-none self-end sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {loading ? (
          // Loading skeleton state
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-white/90 border border-blue-100/60 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 h-96 bg-white/90 border border-blue-100/60 rounded-2xl" />
              <div className="lg:col-span-5 h-96 bg-white/90 border border-blue-100/60 rounded-2xl" />
            </div>
          </div>
        ) : error ? (
          // Error loading state
          <div className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
            <h4 className="text-xl font-bold font-display text-slate-800">
              Unable to load security information
            </h4>
            <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
              {error}
            </p>
            <button
              onClick={fetchSecurityData}
              className="mt-6 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all active:scale-95 focus:outline-none"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Active Alerts */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      stats.activeAlerts > 0
                        ? "bg-rose-50 text-rose-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Active Alerts
                    </p>
                    <p className="text-2xl font-bold text-slate-800 mt-0.5">
                      {stats.activeAlerts}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Duplicate Tickets */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      stats.duplicateTickets > 0
                        ? "bg-amber-50 text-amber-600"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Duplicate Tickets
                    </p>
                    <p className="text-2xl font-bold text-slate-800 mt-0.5">
                      {stats.duplicateTickets}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Failed Verifications */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      stats.failedVerifications > 0
                        ? "bg-rose-50 text-rose-600"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Failed Verifications
                    </p>
                    <p className="text-2xl font-bold text-slate-800 mt-0.5">
                      {stats.failedVerifications}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 4: Security Score */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      stats.securityScore >= 90
                        ? "bg-emerald-50 text-emerald-600"
                        : stats.securityScore >= 75
                        ? "bg-amber-50 text-amber-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {stats.securityScore >= 90 ? (
                      <ShieldCheck className="w-6 h-6" />
                    ) : (
                      <Shield className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Security Score
                    </p>
                    <p className="text-2xl font-bold text-slate-800 mt-0.5">
                      {stats.securityScore}%
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Split Suspicious Activity & Audit Logs Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Suspicious Activity (Alerts) Section */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold font-display text-slate-800">
                    Suspicious Activity
                  </h2>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
                    Alert Alerts ({alerts.filter((a) => !a.isResolved).length})
                  </span>
                </div>

                <div className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl overflow-hidden shadow-sm">
                  {alerts.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        No active security alerts
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        All checks are passing. Your events are fully secured.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-blue-50/60 border-b border-blue-100/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="px-6 py-4">Alert Details</th>
                            <th className="px-6 py-4">Severity</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Detected</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-200/30">
                          {alerts.map((alert) => (
                            <tr
                              key={alert.id}
                              className={`text-xs hover:bg-blue-100/30 transition-colors ${
                                !alert.isResolved ? "font-medium" : "opacity-75"
                              }`}
                            >
                              <td className="px-6 py-4 max-w-[280px]">
                                <div className="font-bold text-slate-800">
                                  {alert.type.replace(/_/g, " ")}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                  {alert.description}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md border ${getSeverityStyle(
                                    alert.severity
                                  )}`}
                                >
                                  {alert.severity}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {alert.isResolved ? (
                                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Resolved
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold animate-pulse">
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    Active
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right text-[11px] text-slate-400 whitespace-nowrap">
                                {formatDate(alert.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Logs Section */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold font-display text-slate-800">
                    Audit Logs
                  </h2>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full">
                    Recent Logs ({auditLogs.length})
                  </span>
                </div>

                <div className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl overflow-hidden shadow-sm">
                  {auditLogs.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-blue-400" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        No recent activity found
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Actions performed on your events will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-blue-100/30 max-h-[500px] overflow-y-auto">
                      {auditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-4 hover:bg-blue-50/40 transition-colors flex items-start gap-3.5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-500">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {log.action.replace(/_/g, " ")}
                              </span>
                              <span className="text-[9px] text-slate-400 whitespace-nowrap">
                                {formatDate(log.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                              <User className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate" title={log.actorEmail}>
                                {log.actorEmail}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setDeleteConfirmId(log.id)}
                            disabled={deletingId !== null}
                            title="Delete Log"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all focus:outline-none flex-shrink-0 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CONFIRMATION DIALOG */}
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
              <h3 className="text-lg font-semibold font-display mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Delete Audit Log
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete this audit log?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={deletingId !== null}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-blue-100 rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLog}
                  disabled={deletingId !== null}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {deletingId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST ALERTS */}
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
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
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
    </div>
  );
}
