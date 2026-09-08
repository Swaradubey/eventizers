"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import checkInService from "../../../services/checkInService";
import { CheckInSummary, CheckInGuest } from "../../../types/checkInTypes";
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Calendar,
  ChevronDown,
  TrendingUp,
  QrCode,
  UserCheck,
  Percent,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen: setSidebarOpen } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEventId = searchParams?.get("eventId") || null;

  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(queryEventId);
  const [summary, setSummary] = useState<CheckInSummary | null>(null);
  const [recentGuests, setRecentGuests] = useState<CheckInGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load events
  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  // Load report data when event selection changes
  useEffect(() => {
    if (selectedEventId) {
      loadReportData(selectedEventId);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const res = await checkInService.getCheckInEvents();
      if (res && res.success && res.events?.length > 0) {
        setEvents(res.events);
        if (!selectedEventId) {
          setSelectedEventId(res.events[0].id);
        }
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Error loading events for reports:", err);
      setError("Unable to load events list.");
      setLoading(false);
    }
  };

  const loadReportData = async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, guestsRes] = await Promise.all([
        checkInService.getCheckInSummary(eventId).catch(() => null),
        checkInService.getEventGuests(eventId, { limit: 10 }).catch(() => null),
      ]);

      if (summaryRes && summaryRes.success) {
        setSummary(summaryRes.summary);
      } else {
        setSummary({
          checkedIn: 0,
          pending: 0,
          total: 0,
        });
      }

      if (guestsRes && guestsRes.success) {
        setRecentGuests(guestsRes.guests || []);
      }
    } catch (err: any) {
      console.error("Error loading report data:", err);
      setError("Failed to fetch event attendance report data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (selectedEventId) {
      setRefreshing(true);
      loadReportData(selectedEventId);
    }
  };

  const total = summary?.total || 0;
  const checkedIn = summary?.checkedIn || 0;
  const pending = summary?.pending || 0;
  const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  const exportReportCSV = () => {
    if (!summary) return;
    const selectedEvent = events.find((e) => e.id === selectedEventId);
    const eventName = selectedEvent ? selectedEvent.title.replace(/[^a-z0-9]/gi, "_") : "event";

    const rows = [
      ["Metric", "Value"],
      ["Event Name", selectedEvent?.title || "Event"],
      ["Total Expected Guests", total],
      ["Total Checked In", checkedIn],
      ["Pending Attendance", pending],
      ["Attendance Rate (%)", `${percentage}%`],
      ["Generated At", new Date().toLocaleString()],
      [],
      ["Guest Name", "Email", "Status", "Checked-in Time", "Method"],
    ];

    recentGuests.forEach((g) => {
      rows.push([
        g.name,
        g.email,
        g.status === "CHECKED_IN" ? "Checked In" : "Pending",
        g.checkedInAt ? new Date(g.checkedInAt).toLocaleString() : "N/A",
        g.method || "N/A",
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${eventName}_attendance_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8faff] min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Event Attendance & Check-in Reports</h1>
              <p className="text-xs text-slate-500">
                Operational analytics and guest check-in progress for staff & event hosts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Event Switcher */}
            {events.length > 0 && (
              <div className="relative min-w-[200px]">
                <select
                  value={selectedEventId || ""}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
              title="Refresh Report Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            </button>

            <button
              onClick={exportReportCSV}
              disabled={loading || !summary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-2xl border border-blue-50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Guests
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{total}</div>
            <p className="text-[11px] text-slate-400 mt-1">Invited & registered attendees</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Checked In
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{checkedIn}</div>
            <p className="text-[11px] text-slate-400 mt-1">Verified on venue site</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-2xl border border-amber-50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Pending Check-In
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600">{pending}</div>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting arrival</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white p-5 rounded-2xl border border-purple-50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                Attendance Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">{percentage}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </motion.div>
        </div>

        {/* Attendance Progress & Breakdown Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Check-in Completion Ratio</h2>
              <p className="text-xs text-slate-500">Live operational progress for current event</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {checkedIn} / {total} Guests
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-xl h-4 p-0.5 overflow-hidden flex gap-1">
            <div
              className="bg-emerald-500 h-full rounded-lg transition-all duration-700"
              style={{ width: `${total > 0 ? (checkedIn / total) * 100 : 0}%` }}
              title={`Checked In: ${checkedIn}`}
            />
            <div
              className="bg-amber-400 h-full rounded-lg transition-all duration-700"
              style={{ width: `${total > 0 ? (pending / total) * 100 : 0}%` }}
              title={`Pending: ${pending}`}
            />
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Checked In ({total > 0 ? Math.round((checkedIn / total) * 100) : 0}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span>Pending Arrival ({total > 0 ? Math.round((pending / total) * 100) : 0}%)</span>
            </div>
          </div>
        </div>

        {/* Recent Attendance Log Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Recent Guest Attendance Log</h2>
              <p className="text-xs text-slate-500">Latest guest entries and check-in statuses</p>
            </div>
            <button
              onClick={() => router.push(`/dashboard/check-in${selectedEventId ? `?eventId=${selectedEventId}` : ""}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Open Scanner Portal</span>
            </button>
          </div>

          {recentGuests.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No guest records found for this event.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Guest Name</th>
                    <th className="py-3 px-4 font-bold">Contact Email</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Check-in Method</th>
                    <th className="py-3 px-4 font-bold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentGuests.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                          {g.name?.charAt(0) || "G"}
                        </div>
                        <span>{g.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{g.email}</td>
                      <td className="py-3 px-4">
                        {g.status === "CHECKED_IN" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {g.method === "QR" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                            <QrCode className="w-3 h-3 text-blue-600" /> QR Code
                          </span>
                        ) : g.method === "MANUAL" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                            <UserCheck className="w-3 h-3 text-indigo-600" /> Manual
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {g.checkedInAt ? new Date(g.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
