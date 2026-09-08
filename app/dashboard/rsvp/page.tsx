"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import guestService from "../../../services/guestService";
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Menu,
  X,
  Calendar,
  MapPin,
  Users,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RsvpEntry {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  status: string;
  rsvpStatus: string | null;
  respondedAt: string | null;
}

export default function RsvpPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && user.role !== "GUEST" && user.role !== "COHOST") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const fetchRsvps = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await guestService.getGuests();
      if (data && data.success) {
        const entries = (data.guests || []).map((g: any) => ({
          id: g.id,
          eventId: g.eventId,
          eventTitle: g.eventTitle || g.event?.title || "Event",
          eventDate: g.event?.eventDate || "",
          eventTime: g.event?.eventTime || "",
          venue: g.event?.venue || "",
          status: g.status,
          rsvpStatus: g.rsvpStatus || g.status,
          respondedAt: g.respondedAt || null,
        }));
        setRsvps(entries);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load RSVP data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRsvps();
  }, [user]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleRsvpAction = async (guestId: string, action: "confirmed" | "declined") => {
    try {
      const res = await guestService.updateGuest(guestId, { status: action, rsvpStatus: action });
      if (res && res.success) {
        setToast({ message: `RSVP ${action === "confirmed" ? "accepted" : "declined"} successfully!`, type: "success" });
        fetchRsvps();
      }
    } catch (err: any) {
      setToast({ message: err.response?.data?.error || "Failed to update RSVP.", type: "error" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return { icon: CheckCircle, color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Confirmed" };
      case "declined":
        return { icon: XCircle, color: "bg-red-50 text-red-700 border-red-200", label: "Declined" };
      case "pending":
        return { icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending" };
      default:
        return { icon: Clock, color: "bg-blue-50 text-blue-700 border-blue-200", label: status || "Invited" };
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-100/80 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-100/80 flex flex-col font-body text-slate-800 relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-6 sm:px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Header */}
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
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                My RSVPs
              </h1>
              <p className="text-sm text-slate-500 mt-1">View and respond to your event invitations</p>
            </div>
          </div>
        </div>

        {/* Toast */}
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

        {/* Content */}
        <div className="bg-white/90 border border-blue-100 rounded-2xl p-6 shadow-sm backdrop-blur-md">
          {loading ? (
            <div className="space-y-4 py-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-blue-50/50 border border-blue-100/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h4 className="text-lg font-semibold text-slate-900">Error</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">{error}</p>
              <button
                onClick={fetchRsvps}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                Retry
              </button>
            </div>
          ) : rsvps.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
                <ClipboardList className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">No Invitations Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                You haven&apos;t been invited to any events yet. Check back later!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rsvps.map((rsvp) => {
                const statusBadge = getStatusBadge(rsvp.rsvpStatus || rsvp.status);
                const StatusIcon = statusBadge.icon;
                return (
                  <motion.div
                    key={rsvp.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-blue-100 rounded-2xl p-5 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300/80 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900 truncate">{rsvp.eventTitle}</h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadge.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          {rsvp.eventDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-blue-500" />
                              {new Date(rsvp.eventDate).toLocaleDateString()}
                            </span>
                          )}
                          {rsvp.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-blue-500" />
                              {rsvp.venue}
                            </span>
                          )}
                        </div>
                        {rsvp.respondedAt && (
                          <p className="text-[10px] text-slate-400 mt-2">
                            Responded on {new Date(rsvp.respondedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {(!rsvp.rsvpStatus || rsvp.rsvpStatus === "pending" || rsvp.status === "invited") && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRsvpAction(rsvp.id, "confirmed")}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRsvpAction(rsvp.id, "declined")}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
