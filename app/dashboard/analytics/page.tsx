"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import analyticsService, { AnalyticsOverview } from "../../../services/analyticsService";
import {
  Menu,
  Users,
  Clock,
  Download,
  AlertCircle,
  TrendingUp,
  BarChart2,
  PieChart,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen: setSidebarOpen } = useSidebar();
  const router = useRouter();

  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getAnalyticsOverview();
      if (res.success) {
        setData({
          totalInvitations: res.totalInvitations,
          responseRate: res.responseRate,
          clickRate: res.clickRate,
          averageResponseTimeDays: res.averageResponseTimeDays,
          rsvpBreakdown: res.rsvpBreakdown,
          eventPerformance: res.eventPerformance,
          eventsPerformance: res.eventsPerformance || [],
        });
      } else {
        setError("Invalid response format received from server.");
      }
    } catch (err: any) {
      console.error("Error loading analytics data:", err);
      setError(
        err.response?.data?.error ||
          "Unable to load analytics information. Please verify your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  // Formatter helper for Response Time
  const formatResponseTime = (days: number) => {
    if (days === undefined || isNaN(days) || days === null) return "0 hours";
    if (days < 1) {
      const hours = Math.round(days * 24);
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }
    return `${days.toFixed(1)} day${days.toFixed(1) !== "1.0" ? "s" : ""}`;
  };

  // Safe clamp helper
  const clampPercent = (percent: number) => {
    if (percent === undefined || isNaN(percent) || percent === null) return 0;
    return Math.max(0, Math.min(100, percent));
  };

  // CSV Export helper
  const handleExportCSV = () => {
    if (!data) return;

    const csvRows = [
      ["Metric", "Value"],
      ["Total Invitations", data.totalInvitations],
      ["Response Rate (%)", `${data.responseRate.toFixed(1)}%`],
      ["Open Rate (%)", `${data.eventPerformance.openRate.toFixed(1)}%`],
      ["Click Rate (%)", `${data.clickRate.toFixed(1)}%`],
      ["Average Response Time", formatResponseTime(data.averageResponseTimeDays)],
      ["Attending Count", data.rsvpBreakdown.attending.count],
      ["Attending Percentage (%)", `${data.rsvpBreakdown.attending.percentage}%`],
      ["Declined Count", data.rsvpBreakdown.declined.count],
      ["Declined Percentage (%)", `${data.rsvpBreakdown.declined.percentage}%`],
      ["Maybe Count", data.rsvpBreakdown.maybe.count],
      ["Maybe Percentage (%)", `${data.rsvpBreakdown.maybe.percentage}%`],
      ["Pending Count", data.rsvpBreakdown.pending.count],
      ["Pending Percentage (%)", `${data.rsvpBreakdown.pending.percentage}%`],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eventizers-analytics-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auth Loading Screen
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col font-body text-slate-900 relative overflow-hidden"
      style={{
        backgroundColor: "#f8fafc",
        backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
              <p className="text-sm text-slate-500 mt-1">
                Insights and metrics for your events
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium px-4 py-2 rounded-xl shadow-sm text-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {loading ? (
          // Loading skeleton
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-white border border-slate-100 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-72 bg-white border border-slate-100 rounded-2xl" />
              <div className="h-72 bg-white border border-slate-100 rounded-2xl" />
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
            <h4 className="text-xl font-bold text-slate-900">
              Unable to load analytics information
            </h4>
            <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
              {error}
            </p>
            <button
              onClick={fetchAnalyticsData}
              className="mt-6 px-5 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl shadow-sm transition-all active:scale-95 focus:outline-none"
            >
              Retry Connection
            </button>
          </div>
        ) : !data || data.totalInvitations === 0 ? (
          // Empty state
          <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <Users className="w-12 h-12 text-slate-300 mb-4" />
            <h4 className="text-xl font-bold text-slate-900">
              No analytics data available
            </h4>
            <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
              Add guests to your events to start tracking responses, clicks, and engagement.
            </p>
            <button
              onClick={() => router.push("/dashboard/guests")}
              className="mt-6 px-5 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl shadow-sm transition-all active:scale-95 focus:outline-none"
            >
              Manage Guests
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ── Top Metric Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Card 1: Total Invitations */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-blue-50 text-blue-500">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Total Invitations</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data.totalInvitations}
                  </p>
                </div>
              </motion.div>

              {/* Card 2: Response Rate */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-emerald-50 text-emerald-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Response Rate</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data.responseRate.toFixed(1)}%
                  </p>
                </div>
              </motion.div>

              {/* Card 3: Click Rate */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-indigo-50 text-indigo-500">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Click Rate</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data.clickRate.toFixed(1)}%
                  </p>
                </div>
              </motion.div>

              {/* Card 4: Avg Response Time */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-amber-50 text-amber-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Avg Response Time</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {formatResponseTime(data.averageResponseTimeDays)}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ── Lower 2-Column Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left Card: RSVP Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80"
              >
                <h2 className="text-base font-semibold text-slate-900 mb-5">
                  RSVP breakdown
                </h2>

                {/* Attending */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Attending</span>
                    <span className="text-xs text-slate-500">
                      {data.rsvpBreakdown.attending.count} ({data.rsvpBreakdown.attending.percentage}%)
                    </span>
                  </div>
                  <div className="bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${clampPercent(data.rsvpBreakdown.attending.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Declined */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Declined</span>
                    <span className="text-xs text-slate-500">
                      {data.rsvpBreakdown.declined.count} ({data.rsvpBreakdown.declined.percentage}%)
                    </span>
                  </div>
                  <div className="bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${clampPercent(data.rsvpBreakdown.declined.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Maybe */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Maybe</span>
                    <span className="text-xs text-slate-500">
                      {data.rsvpBreakdown.maybe.count} ({data.rsvpBreakdown.maybe.percentage}%)
                    </span>
                  </div>
                  <div className="bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${clampPercent(data.rsvpBreakdown.maybe.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Pending */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Pending</span>
                    <span className="text-xs text-slate-500">
                      {data.rsvpBreakdown.pending.count} ({data.rsvpBreakdown.pending.percentage}%)
                    </span>
                  </div>
                  <div className="bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-slate-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${clampPercent(data.rsvpBreakdown.pending.percentage)}%` }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Right Card: Event Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-6">Event performance</h3>

                <div className="space-y-6">
                  {/* Open Rate */}
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Open Rate</span>
                      <span className="font-bold text-blue-600">
                        {Number(data.eventPerformance?.openRate || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2.5">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(data.eventPerformance?.openRate || 0, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Click Rate */}
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Click Rate</span>
                      <span className="font-bold text-blue-600">
                        {Number(data.eventPerformance?.clickRate ?? data.clickRate ?? 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2.5">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(data.eventPerformance?.clickRate ?? data.clickRate ?? 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Event Performance Table ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6">Event performance</h2>

              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px] md:min-w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-3.5 pr-4 pl-0 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap w-[40%]">
                          Event Name
                        </th>
                        <th className="pb-3.5 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap w-[15%]">
                          Total Guests
                        </th>
                        <th className="pb-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap w-[25%]">
                          RSVP Rate
                        </th>
                        <th className="pb-3.5 pl-4 pr-0 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap w-[20%]">
                          Open Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {data.eventsPerformance && data.eventsPerformance.length > 0 ? (
                        data.eventsPerformance.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-4 pr-4 pl-0 font-medium text-slate-800 align-middle">
                              <span
                                className="line-clamp-2 leading-snug break-words"
                                title={item.name}
                              >
                                {item.name}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center text-slate-600 font-medium whitespace-nowrap align-middle">
                              {item.totalGuests}
                            </td>
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-24 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(item.rsvpRate, 100)}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-slate-700 text-xs shrink-0">
                                  {item.rsvpRate}%
                                </span>
                              </div>
                            </td>
                            <td className="py-4 pl-4 pr-0 align-middle whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-24 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                  <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(item.openRate, 100)}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-slate-700 text-xs shrink-0">
                                  {item.openRate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            No event performance data available yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
