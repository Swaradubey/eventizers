"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import analyticsService, { AnalyticsOverview } from "../../../services/analyticsService";
import {
  Menu,
  Mail,
  Users,
  MousePointerClick,
  Clock,
  Download,
  AlertCircle,
  RefreshCw,
  TrendingUp,
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
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-body text-[#2D1B3D] relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
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
                Analytics
              </h1>
              <p className="text-sm text-[#2D1B3D]/60 mt-1">
                Insights and metrics for your events
              </p>
            </div>
          </div>

          {data && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl transition-all shadow-md active:scale-95 focus:outline-none"
            >
              <Download className="w-3.5 h-3.5" />
              Export Report
            </button>
          )}
        </div>

        {loading ? (
          // Loading skeleton state
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-white border border-[#E8C4B8]/20 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-white border border-[#E8C4B8]/20 rounded-2xl" />
              <div className="h-96 bg-white border border-[#E8C4B8]/20 rounded-2xl" />
            </div>
          </div>
        ) : error ? (
          // Error loading state
          <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
            <h4 className="text-xl font-bold font-display text-[#2D1B3D]">
              Unable to load analytics information
            </h4>
            <p className="text-xs text-[#2D1B3D]/60 mt-2 max-w-sm leading-relaxed">
              {error}
            </p>
            <button
              onClick={fetchAnalyticsData}
              className="mt-6 px-5 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl shadow-md transition-all active:scale-95 focus:outline-none"
            >
              Retry Connection
            </button>
          </div>
        ) : !data || data.totalInvitations === 0 ? (
          // Empty State
          <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <Users className="w-12 h-12 text-[#2D1B3D]/30 mb-4" />
            <h4 className="text-xl font-bold font-display text-[#2D1B3D]">
              No analytics data available
            </h4>
            <p className="text-xs text-[#2D1B3D]/60 mt-2 max-w-sm leading-relaxed">
              Add guests to your events to start tracking responses, clicks, and engagement.
            </p>
            <button
              onClick={() => router.push("/dashboard/guests")}
              className="mt-6 px-5 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl shadow-md transition-all active:scale-95 focus:outline-none"
            >
              Manage Guests
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Total Invitations */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#E8EEFF] text-[#5B5FEF]">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Total Invitations
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {data.totalInvitations}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Response Rate */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-50 text-emerald-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Response Rate
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {data.responseRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Click Rate */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50 text-amber-600">
                    <MousePointerClick className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Click Rate
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {data.clickRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 4: Avg Response Time */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-50 text-purple-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                      Avg Response Time
                    </p>
                    <p className="text-2xl font-bold text-[#2D1B3D] mt-0.5">
                      {formatResponseTime(data.averageResponseTimeDays)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Split Main Analytics Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* RSVP Breakdown Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-lg font-bold font-display text-[#2D1B3D]">
                    RSVP Breakdown
                  </h2>
                  <p className="text-xs text-[#2D1B3D]/50 mt-1">
                    Real-time invitation response distribution
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  {/* Attending */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Attending
                      </span>
                      <span className="font-bold text-[#2D1B3D]">
                        {data.rsvpBreakdown.attending.count} ({data.rsvpBreakdown.attending.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] rounded-full h-2 overflow-hidden border border-[#E8C4B8]/10">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${clampPercent(data.rsvpBreakdown.attending.percentage)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Declined */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                        Declined
                      </span>
                      <span className="font-bold text-[#2D1B3D]">
                        {data.rsvpBreakdown.declined.count} ({data.rsvpBreakdown.declined.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] rounded-full h-2 overflow-hidden border border-[#E8C4B8]/10">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${clampPercent(data.rsvpBreakdown.declined.percentage)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Maybe */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        Maybe
                      </span>
                      <span className="font-bold text-[#2D1B3D]">
                        {data.rsvpBreakdown.maybe.count} ({data.rsvpBreakdown.maybe.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] rounded-full h-2 overflow-hidden border border-[#E8C4B8]/10">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${clampPercent(data.rsvpBreakdown.maybe.percentage)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pending */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md">
                        Pending
                      </span>
                      <span className="font-bold text-[#2D1B3D]">
                        {data.rsvpBreakdown.pending.count} ({data.rsvpBreakdown.pending.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] rounded-full h-2 overflow-hidden border border-[#E8C4B8]/10">
                      <div
                        className="bg-slate-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${clampPercent(data.rsvpBreakdown.pending.percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Event Performance Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-lg font-bold font-display text-[#2D1B3D]">
                    Event Performance
                  </h2>
                  <p className="text-xs text-[#2D1B3D]/50 mt-1">
                    Email invitation delivery metrics
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Open Rate */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#2D1B3D]">Open Rate</span>
                      <span className="font-bold text-[#2D1B3D]">
                        {data.eventPerformance.openRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] rounded-full h-2.5 overflow-hidden border border-[#E8C4B8]/10">
                      <div
                        className="bg-[#5B5FEF] h-full rounded-full transition-all duration-500"
                        style={{ width: `${clampPercent(data.eventPerformance.openRate)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Click Rate */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#2D1B3D]">Click Rate</span>
                      <span className="font-bold text-[#2D1B3D]">
                        {data.clickRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] rounded-full h-2.5 overflow-hidden border border-[#E8C4B8]/10">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${clampPercent(data.clickRate)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Micro-Interaction Indicator */}
                  <div className="mt-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8C4B8]/20 flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-[#5B5FEF] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#2D1B3D]">Pro Insight</h4>
                      <p className="text-[11px] text-[#2D1B3D]/60 mt-0.5 leading-relaxed">
                        To maximize your click rate, customize the RSVP button color and text on your invitation templates. Clicks are tracked each time a guest clicks your event link.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
