"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import Navbar from "./Navbar";
import eventService, {
  Event,
  AttendanceCommitmentMetrics,
  NoShowGuest,
} from "../services/eventService";
import {
  Menu,
  ChevronDown,
  Calendar,
  ShieldCheck,
  UserX,
  Shield,
  Clock,
  Info,
  CheckCircle2,
  Check,
  RotateCcw,
  Search,
  CheckCircle,
  Loader2,
  AlertCircle,
  DollarSign,
  Mail,
  Send,
} from "lucide-react";

interface AttendanceCommitmentDashboardProps {
  showNavbar?: boolean;
  showBottomNav?: boolean;
}

export default function AttendanceCommitmentDashboard({
  showNavbar = true,
  showBottomNav = false,
}: AttendanceCommitmentDashboardProps) {
  const router = useRouter();
  const { setIsOpen: setSidebarOpen } = useSidebar();

  // Settings State
  const [isGuaranteeEnabled, setIsGuaranteeEnabled] = useState(true);
  const [selectedFee, setSelectedFee] = useState<number>(25);
  const [reviewWindowDays, setReviewWindowDays] = useState(7);
  const [isReviewWindowDropdownOpen, setIsReviewWindowDropdownOpen] = useState(false);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "waived">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Events list & selector
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState("Loading events...");
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  // Real Commitment Metrics & Guests
  const [metrics, setMetrics] = useState<AttendanceCommitmentMetrics>({
    totalConfirmed: 0,
    attendedSafe: 0,
    noShows: 0,
    waivedCount: 0,
    chargedCount: 0,
    pendingCount: 0,
  });
  const [noShows, setNoShows] = useState<NoShowGuest[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessingCron, setIsProcessingCron] = useState(false);

  const feeOptions = [10, 25, 50, 100];
  const reviewOptions = [3, 5, 7, 14, 30];

  // 1. Fetch active guarantee settings on mount
  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        const res = await eventService.getAttendanceGuaranteeSettings();
        if (res?.success && res.data && isMounted) {
          setIsGuaranteeEnabled(Boolean(res.data.isEnabled));
          if (res.data.guaranteeAmount) setSelectedFee(Number(res.data.guaranteeAmount));
          if (res.data.reviewWindowDays) setReviewWindowDays(Number(res.data.reviewWindowDays));
        }
      } catch (err) {
        // Fallback silently to defaults
      }
    };
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch real events from eventService
  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      try {
        const res = await eventService.getEvents();
        if (res?.success && res.events && res.events.length > 0 && isMounted) {
          setEvents(res.events);
          setSelectedEvent(res.events[0]);
          if (res.events[0]?.title) {
            setSelectedEventTitle(res.events[0].title);
          }
        } else if (isMounted) {
          setSelectedEventTitle("No events available");
        }
      } catch {
        if (isMounted) {
          setSelectedEventTitle("Community Meetup: Outdoor Fun & Local Connections");
        }
      }
    };
    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Fetch commitment metrics whenever selectedEvent changes
  const loadCommitmentData = async (eventId: string) => {
    try {
      setIsLoadingMetrics(true);
      const res = await eventService.getAttendanceCommitment(eventId);
      if (res?.success && res.metrics) {
        setMetrics(res.metrics);
        setNoShows(res.noShows || []);
      }
    } catch (err) {
      console.error("Failed to load attendance commitment data:", err);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (selectedEvent?.id) {
      loadCommitmentData(selectedEvent.id);
    }
  }, [selectedEvent?.id]);

  // 4. Save Settings Handler
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await eventService.updateAttendanceGuaranteeSettings({
        isEnabled: isGuaranteeEnabled,
        guaranteeAmount: selectedFee,
        reviewWindowDays: reviewWindowDays,
      });
      setToastMessage("Attendance guarantee settings saved successfully!");
      setTimeout(() => setToastMessage(null), 3000);
      if (selectedEvent?.id) {
        loadCommitmentData(selectedEvent.id);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      setToastMessage("Failed to save settings. Please try again.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Waive Fee Handler
  const handleWaiveFee = async (guestId: string) => {
    try {
      setActionLoadingId(guestId);
      const res = await eventService.waiveGuestGuarantee(guestId);
      if (res.success) {
        setToastMessage("Guarantee fee waived successfully!");
        setTimeout(() => setToastMessage(null), 3000);
        if (selectedEvent?.id) {
          await loadCommitmentData(selectedEvent.id);
        }
      }
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || "Failed to waive fee.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 6. Charge Fee Handler
  const handleChargeFee = async (guestId: string) => {
    try {
      setActionLoadingId(guestId);
      const res = await eventService.chargeGuestGuarantee(guestId);
      if (res.success) {
        setToastMessage("Reservation guarantee fee charged successfully!");
        setTimeout(() => setToastMessage(null), 3000);
        if (selectedEvent?.id) {
          await loadCommitmentData(selectedEvent.id);
        }
      }
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || "Failed to charge guarantee fee.");
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 7. Trigger Process No-Shows Cron Handler
  const handleTriggerProcessNoShows = async () => {
    try {
      setIsProcessingCron(true);
      const res = await eventService.processNoShowsCron();
      if (res.success) {
        setToastMessage(
          `Processed no-shows: ${res.noticesSent} notice(s) sent, ${res.totalWaived} fee(s) auto-waived.`
        );
        setTimeout(() => setToastMessage(null), 4000);
        if (selectedEvent?.id) {
          await loadCommitmentData(selectedEvent.id);
        }
      } else {
        setToastMessage(res.error || "Failed to process no-shows.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || err.message || "Failed to process no-shows.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsProcessingCron(false);
    }
  };

  const formatNoticeDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return String(dateStr);
    }
  };

  const getDaysRemaining = (eventDateStr?: string, windowDays?: number) => {
    const days = windowDays || reviewWindowDays;
    if (!eventDateStr) return days;
    try {
      const d = new Date(eventDateStr);
      d.setDate(d.getDate() + days);
      const diff = d.getTime() - Date.now();
      if (diff <= 0) return 0;
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    } catch {
      return days;
    }
  };

  // Filtered No-Show Guests
  const filteredNoShows = noShows.filter((guest) => {
    const statusUpper = (guest.guaranteeStatus || "PENDING").toUpperCase();
    if (activeFilter === "pending" && statusUpper !== "PENDING") return false;
    if (activeFilter === "waived" && statusUpper !== "WAIVED") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = guest.name?.toLowerCase().includes(q);
      const matchesEmail = guest.email?.toLowerCase().includes(q);
      const matchesPhone = guest.phone ? guest.phone.toLowerCase().includes(q) : false;
      if (!matchesName && !matchesEmail && !matchesPhone) return false;
    }
    return true;
  });

  return (
    <div
      className="min-h-screen flex flex-col font-body text-slate-900 relative selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden"
      style={{
        backgroundColor: "#fbfcfe",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23cbd5e1' opacity='0.45'%3E%2B%3C/text%3E%3C/svg%3E\")",
      }}
    >
      {/* Top Navbar if enabled */}
      {showNavbar && <Navbar />}

      {/* Ambient gradient glows */}
      <div className="fixed top-16 left-5 sm:left-10 w-72 sm:w-96 h-72 sm:h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-5 sm:right-10 w-72 sm:w-96 h-72 sm:h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-2 sm:gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 max-w-[90vw]">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Main Container - Fully responsive width & padding */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 sm:pb-16 z-10">
        
        {/* ── Dashboard Page Header Bar ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm focus:outline-none shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 truncate">
                  Attendance Commitment
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full shrink-0">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#5b45f4]" />
                  Active Protection
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate sm:whitespace-normal">
                Protect catering & venue expenses against no-shows with guaranteed commitments
              </p>
            </div>
          </div>

          {/* Right Actions: Event Selector Dropdown & Refresh */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
            <div className="relative flex-1 sm:w-72 md:w-80">
              <button
                type="button"
                onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                className="w-full bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm flex items-center justify-between hover:border-slate-300 active:scale-[0.99] transition-all text-left"
              >
                <div className="flex items-center gap-2 truncate pr-1">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                    {selectedEventTitle}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#5b45f4] shrink-0 transition-transform duration-200 ${
                    isEventDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Event Dropdown Options */}
              {isEventDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                  {events.length > 0 ? (
                    events.map((evt) => (
                      <button
                        key={evt.id || evt.title}
                        type="button"
                        onClick={() => {
                          setSelectedEvent(evt);
                          setSelectedEventTitle(evt.title);
                          setIsEventDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 sm:px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          selectedEvent?.id === evt.id || selectedEventTitle === evt.title
                            ? "text-[#5b45f4] bg-indigo-50/50"
                            : "text-slate-700"
                        }`}
                      >
                        <span className="truncate">{evt.title}</span>
                        {(selectedEvent?.id === evt.id || selectedEventTitle === evt.title) && (
                          <Check className="w-4 h-4 shrink-0 text-[#5b45f4]" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-500 text-center">
                      No events found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              disabled={isLoadingMetrics}
              onClick={async () => {
                if (selectedEvent?.id) {
                  await loadCommitmentData(selectedEvent.id);
                }
                setToastMessage("Attendance metrics refreshed!");
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl sm:rounded-2xl transition shadow-sm shrink-0 disabled:opacity-50"
              title="Refresh attendance data"
            >
              <RotateCcw
                className={`w-3.5 h-3.5 text-slate-500 ${
                  isLoadingMetrics ? "animate-spin text-indigo-600" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* ── KPI Stats Grid (2 cols mobile, 4 cols desktop) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
          {/* 1. Confirmed RSVPs */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 md:p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#2563eb] tracking-tight">
                {isLoadingMetrics ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                ) : (
                  metrics.totalConfirmed
                )}
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div>
              <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-900 leading-snug truncate">
                Confirmed RSVPs
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-normal truncate">
                Reserved guests
              </p>
            </div>
          </div>

          {/* 2. Attended (Safe) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 md:p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#059669] tracking-tight">
                {isLoadingMetrics ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                ) : (
                  metrics.attendedSafe
                )}
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 flex items-center justify-center text-[#059669] shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div>
              <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-900 leading-snug truncate">
                Attended (Safe)
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-normal truncate">
                Zero fee penalty
              </p>
            </div>
          </div>

          {/* 3. No-Shows */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 md:p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#e11d48] tracking-tight">
                {isLoadingMetrics ? (
                  <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                ) : (
                  metrics.noShows
                )}
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-50 flex items-center justify-center text-[#e11d48] shrink-0">
                <UserX className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div>
              <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-900 leading-snug truncate">
                No-Shows
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-normal truncate">
                Subject to review
              </p>
            </div>
          </div>

          {/* 4. Fee Resolution */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 md:p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#7c3aed] tracking-tight">
                {isLoadingMetrics ? (
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                ) : (
                  `${metrics.waivedCount + metrics.chargedCount}/${metrics.noShows || metrics.totalConfirmed}`
                )}
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-50 flex items-center justify-center text-[#7c3aed] shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div>
              <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-900 leading-snug truncate">
                Fee Resolution
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-normal truncate">
                {metrics.waivedCount} waived · {metrics.chargedCount} applied
              </p>
            </div>
          </div>
        </div>

        {/* ── Main Workspace Grid (Responsive 1-col on mobile, 12-cols on desktop) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
          
          {/* ── Left Column: Guarantee Settings & Policy (7 cols) ── */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            
            {/* 1. Reservation Guarantee Settings Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] space-y-5 sm:space-y-6">
              {/* Header Row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center sm:items-start gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-tight truncate sm:whitespace-normal">
                      Reservation Guarantee
                    </h3>
                    <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate sm:whitespace-normal">
                      Protect catering & venue expenses against no-shows
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isGuaranteeEnabled}
                  onClick={() => setIsGuaranteeEnabled(!isGuaranteeEnabled)}
                  className={`w-12 sm:w-14 h-7 sm:h-8 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                    isGuaranteeEnabled ? "bg-[#5b45f4]" : "bg-slate-200"
                  }`}
                  title={isGuaranteeEnabled ? "Disable guarantee" : "Enable guarantee"}
                >
                  <div
                    className={`bg-white w-5 sm:w-6 h-5 sm:h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      isGuaranteeEnabled ? "translate-x-5 sm:translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Form Controls - Dimmed when disabled */}
              <div
                className={`space-y-5 sm:space-y-6 pt-2 border-t border-slate-100 transition-opacity duration-200 ${
                  !isGuaranteeEnabled ? "opacity-40 pointer-events-none select-none" : "opacity-100"
                }`}
              >
                {/* Fee Amount Pills */}
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <label className="text-xs sm:text-sm font-semibold text-slate-800">
                      Guarantee Fee Amount (per confirmed guest)
                    </label>
                    <span className="text-xs font-semibold text-[#5b45f4]">
                      Selected: ${selectedFee}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
                    {feeOptions.map((fee) => {
                      const isActive = selectedFee === fee;
                      return (
                        <button
                          key={fee}
                          type="button"
                          onClick={() => setSelectedFee(fee)}
                          className={`py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm md:text-base transition-all border ${
                            isActive
                              ? "bg-[#5b45f4] text-white border-[#5b45f4] shadow-md shadow-indigo-200/50 scale-[1.02]"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          ${fee}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Host Review Window Row */}
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 p-3 sm:p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl sm:rounded-2xl">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      Host Review Window
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      Days after the event to review, waive, or apply penalties
                    </p>
                  </div>
                  
                  <div className="relative shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setIsReviewWindowDropdownOpen(!isReviewWindowDropdownOpen)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 hover:border-slate-300 shadow-sm"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#5b45f4]" />
                      <span>{reviewWindowDays} Days</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {isReviewWindowDropdownOpen && (
                      <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 z-30">
                        {reviewOptions.map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => {
                              setReviewWindowDays(days);
                              setIsReviewWindowDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between ${
                              reviewWindowDays === days ? "text-[#5b45f4] bg-indigo-50/50" : "text-slate-700"
                            }`}
                          >
                            <span>{days} Days</span>
                            {reviewWindowDays === days && <Check className="w-3.5 h-3.5 text-[#5b45f4]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Settings Button */}
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full py-3 sm:py-3.5 md:py-4 bg-[#5b45f4] hover:bg-[#4d37e6] active:scale-[0.99] text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-200/50 transition-all disabled:opacity-75 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Settings...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Save Guarantee Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Review Window Policy Card */}
            <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] space-y-4 sm:space-y-5 overflow-hidden">
              <div className="flex items-start gap-3 sm:gap-3.5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-tight">
                    {reviewWindowDays}-Day Review Window & Auto-Waive
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 leading-relaxed">
                    You have {reviewWindowDays} days after the event concludes to review attendees. Unreviewed guests will be automatically waived when time expires.
                  </p>
                </div>
              </div>

              {/* Guest Agreement Citation Card */}
              <div className="bg-[#f8faff] border border-slate-200/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5 text-xs sm:text-sm space-y-2 relative z-10">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Info className="w-4 h-4 text-[#5b45f4] shrink-0" />
                  <span>Guest Agreement (Presented during RSVP)</span>
                </div>
                <p className="italic leading-relaxed text-slate-600 font-normal">
                  &ldquo;Your RSVP reserves venue resources and catering specifically for you. You may update or cancel freely before the RSVP deadline.
                  <br className="my-1.5 block" />
                  After the deadline, your reservation becomes confirmed. If you fail to attend after confirming, the host may apply the Reservation Guarantee Fee (${selectedFee}) within {reviewWindowDays} days.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Column: No-Show Review List (5 cols) ── */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] space-y-4 sm:space-y-5">
              
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900">
                    No-Show Review List
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Manage attendee penalties</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isProcessingCron}
                    onClick={handleTriggerProcessNoShows}
                    title="Run automated no-show notice emails and auto-waive timeline"
                    className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-[#5b45f4] border border-indigo-200 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {isProcessingCron ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">Process No-Shows</span>
                  </button>
                  <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#fef2f2] text-[#ef4444] border border-red-100">
                    {filteredNoShows.length} {filteredNoShows.length === 1 ? "Attendee" : "Attendees"}
                  </span>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {(
                  [
                    { id: "all", label: "All No-Shows", showCheck: true },
                    { id: "pending", label: "Pending", showCheck: false },
                    { id: "waived", label: "Waived", showCheck: false },
                  ] as const
                ).map((filter) => {
                  const isCurrent = activeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveFilter(filter.id)}
                      className={`py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold border flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-[0.98] truncate ${
                        isCurrent
                          ? "bg-[#5b45f4] text-white border-[#5b45f4] shadow-sm shadow-indigo-200"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {isCurrent && filter.showCheck && (
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5] shrink-0" />
                      )}
                      <span className="truncate">{filter.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search guest by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              {/* Guest List or Empty State */}
              {isLoadingMetrics ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <p className="text-xs text-slate-400 font-medium">Loading attendance data...</p>
                </div>
              ) : filteredNoShows.length > 0 ? (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredNoShows.map((guest) => {
                    const statusUpper = (guest.guaranteeStatus || "PENDING").toUpperCase();
                    const isActionLoading = actionLoadingId === guest.id;
                    const daysLeft = getDaysRemaining(
                      guest.eventDate || selectedEvent?.eventDate,
                      guest.reviewWindowDays || reviewWindowDays
                    );

                    return (
                      <div
                        key={guest.id}
                        className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-sm space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {guest.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">{guest.email}</p>
                            {guest.phone && (
                              <p className="text-[10px] text-slate-400">{guest.phone}</p>
                            )}
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                statusUpper === "WAIVED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : statusUpper === "CHARGED"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {statusUpper === "WAIVED"
                                ? "Waived"
                                : statusUpper === "CHARGED"
                                ? "Charged"
                                : "Pending"}
                            </span>
                            <p className="text-xs font-bold text-slate-800 mt-1">
                              ${guest.guaranteeAmount || selectedFee}
                            </p>
                          </div>
                        </div>

                        {/* Notice & Timeline Indicator Badge */}
                        <div className="pt-0.5">
                          {guest.penaltyNoticeSentAt ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-700 bg-indigo-50/90 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
                              <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>Notice Sent on {formatNoticeDate(guest.penaltyNoticeSentAt)}</span>
                            </div>
                          ) : statusUpper === "PENDING" ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>
                                Pending Review &bull; {daysLeft > 0 ? `${daysLeft} ${daysLeft === 1 ? "Day" : "Days"} Left` : "Review Window Expired"}
                              </span>
                            </div>
                          ) : statusUpper === "WAIVED" ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Fee Waived {guest.guaranteeWaivedAt ? `on ${formatNoticeDate(guest.guaranteeWaivedAt)}` : ""}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-700 bg-purple-50/90 border border-purple-200/80 px-2.5 py-1 rounded-lg">
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>Fee Charged {guest.guaranteeChargedAt ? `on ${formatNoticeDate(guest.guaranteeChargedAt)}` : ""}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons for Pending Guests */}
                        {statusUpper === "PENDING" && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleWaiveFee(guest.id)}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition border border-emerald-200/60 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {isActionLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Waive Fee</span>
                            </button>

                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleChargeFee(guest.id)}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shadow-sm"
                            >
                              {isActionLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <DollarSign className="w-3.5 h-3.5" />
                              )}
                              <span>Charge Fee</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 sm:py-14 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-100/80">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-50 text-[#10b981] flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      No No-Shows Recorded
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-xs px-3">
                      No guests matching the &ldquo;{activeFilter}&rdquo; filter were marked as absent for this event.
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Summary Info Footer */}
              <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs text-slate-500">
                <span>Auto-waive status:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
                  Protected & Enabled
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
