"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../invitehub/context/AuthContext";
import { useSidebar } from "../../../invitehub/context/SidebarContext";
import Navbar from "../../../invitehub/components/Navbar";
import adminService from "../../../services/adminService";
import { CheckInGuest, CheckInSummary } from "../../../types/checkInTypes";
import {
  LogOut,
  CheckCircle,
  AlertCircle,
  Menu,
  ChevronDown,
  Search,
  Filter,
  RefreshCw,
  QrCode,
  MapPin,
  Undo2,
  UserCheck,
  UserX,
  X,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCheckInPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // Event selection
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // Check-In states
  const [summary, setSummary] = useState<CheckInSummary | null>(null);
  const [guests, setGuests] = useState<CheckInGuest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Scanner modal state
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; name?: string } | null>(null);
  const [scanning, setScanning] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // GPS verification state
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});

  // Route protection
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/admin/login");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // Request geolocation on mount
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation warning:", err.message);
        }
      );
    }
  }, []);

  // Fetch events list
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user || user.role !== "ADMIN") return;
      try {
        const res = await adminService.getAdminCheckInEvents();
        if (res.success) {
          setEvents(res.events || []);
          if (res.events && res.events.length > 0) {
            setSelectedEventId(res.events[0].id);
          }
        }
      } catch (err) {
        console.error("Check-in Page: Failed to fetch events:", err);
      }
    };
    if (user && user.role === "ADMIN") {
      fetchEvents();
    }
  }, [user]);

  // Toast effect
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

  // Fetch summary and guests
  const loadCheckInData = async (eventId: string, resetPage = false) => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    try {
      const [sumResult, guestsResult] = await Promise.allSettled([
        adminService.getAdminCheckInSummary(eventId),
        adminService.getAdminCheckInGuests(eventId, {
          search: search.trim() || undefined,
          status: statusFilter,
          page: currentPage,
          limit: 15,
        }),
      ]);

      // Handle summary independently — failure here doesn't block attendee list
      if (sumResult.status === "fulfilled") {
        if (sumResult.value.success) {
          setSummary(sumResult.value.summary);
        } else {
          console.error(
            `Check-In Page: Summary returned success=false for eventId=${eventId}:`,
            sumResult.value
          );
        }
      } else {
        console.error(
          `Check-In Page: Failed to fetch check-in summary for eventId=${eventId}:`,
          {
            message: (sumResult.reason as any)?.message,
            status: (sumResult.reason as any)?.response?.status,
            data: (sumResult.reason as any)?.response?.data,
          }
        );
      }

      // Handle guests — this is the primary content; failure sets the error state
      if (guestsResult.status === "fulfilled") {
        const guestsRes = guestsResult.value;
        if (guestsRes.success) {
          setGuests(guestsRes.guests || []);
          setTotalPages(guestsRes.pagination?.totalPages || 1);
        } else {
          console.error(
            `Check-In Page: Guests endpoint returned success=false for eventId=${eventId}:`,
            guestsRes
          );
          setError("Failed to load attendees. The server returned an error.");
        }
      } else {
        const err = guestsResult.reason as any;
        console.error(
          `Check-In Page: Failed to fetch attendees for eventId=${eventId} (status=${statusFilter}, page=${currentPage}):`,
          {
            message: err?.message,
            status: err?.response?.status,
            data: err?.response?.data,
          }
        );
        setError("Failed to load event check-in details.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Trigger reload on event/filter change
  useEffect(() => {
    if (selectedEventId) {
      loadCheckInData(selectedEventId);
    }
  }, [selectedEventId, statusFilter, page]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (selectedEventId) {
        loadCheckInData(selectedEventId, true);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Manual Check-In
  const handleManualCheckIn = async (guestId: string) => {
    if (!selectedEventId) return;
    try {
      const res = await adminService.checkInAdminGuestManual(
        selectedEventId,
        guestId,
        coords.lat,
        coords.lng
      );
      if (res.success) {
        triggerToast("Guest checked in successfully!");
        loadCheckInData(selectedEventId);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Check-in failed.", "error");
    }
  };

  // Undo Check-In
  const handleUndoCheckIn = async (checkInId: string) => {
    if (!selectedEventId) return;
    try {
      const res = await adminService.undoAdminCheckIn(checkInId);
      if (res.success) {
        triggerToast("Check-in removed successfully!");
        loadCheckInData(selectedEventId);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to undo check-in.", "error");
    }
  };

  // Scan Check-In Submit
  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !qrInput.trim()) return;

    setScanning(true);
    setScanResult(null);

    try {
      const res = await adminService.checkInAdminGuestScan(
        selectedEventId,
        qrInput.trim(),
        coords.lat,
        coords.lng
      );

      if (res.success) {
        setScanResult({
          success: true,
          message: res.message || "Successfully checked in guest!",
          name: res.guest?.name,
        });
        setQrInput("");
        loadCheckInData(selectedEventId);
      }
    } catch (err: any) {
      console.error(err);
      setScanResult({
        success: false,
        message: err.response?.data?.error || "Invalid QR / Ticket ID code.",
      });
    } finally {
      setScanning(false);
    }
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
              <h1
                className="text-4xl md:text-5xl font-semibold text-[#2D1B3D] font-display"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Check-In Portal
              </h1>
              <p className="text-sm text-[#2D1B3D]/60 mt-1">Manage guest arrivals across all events</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/40 hover:bg-[#F0EBE8] rounded-xl transition-all shadow-sm active:scale-95 focus:outline-none"
            >
              <LogOut className="w-3.5 h-3.5 text-[#C9A84C]" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Toast Alerts */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-[#E8C4B8]/40"
            >
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
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

        {/* Selection Bar */}
        <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <span className="text-[10px] font-bold text-[#2D1B3D]/50 uppercase block mb-1">Select Event to Manage</span>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setGuests([]);
                  setSummary(null);
                }}
                className="appearance-none w-full bg-[#FAF8F5] border border-[#E8C4B8]/40 px-4 py-2.5 pr-10 rounded-xl text-sm font-semibold text-[#2D1B3D] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2D1B3D]"
              >
                {events.length === 0 ? (
                  <option value="">No Events Found</option>
                ) : (
                  events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-[#2D1B3D]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsScanOpen(true)}
              disabled={!selectedEventId}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-[#FAF8F5] bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none focus:outline-none"
            >
              <QrCode className="w-4 h-4" />
              Scan Ticket / Code
            </button>
            <button
              onClick={() => selectedEventId && loadCheckInData(selectedEventId)}
              className="p-2.5 rounded-xl border border-[#E8C4B8]/45 bg-white hover:bg-[#FAF8F5] transition-colors focus:outline-none"
              title="Refresh Stats"
            >
              <RefreshCw className="w-4 h-4 text-[#2D1B3D]/65" />
            </button>
          </div>
        </div>

        {/* Check-In Summary Cards */}
        {selectedEventId && summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">Checked In</p>
                  <p className="text-3xl font-bold text-[#2D1B3D] mt-0.5">{summary.checkedIn}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <UserX className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">Pending Arrivals</p>
                  <p className="text-3xl font-bold text-[#2D1B3D] mt-0.5">{summary.pending}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">Total Guest List</p>
                  <p className="text-3xl font-bold text-[#2D1B3D] mt-0.5">{summary.total}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Main Attendees list */}
        {selectedEventId && (
          <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-[#2D1B3D]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search guest name / email / ticket..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-[#2D1B3D]/50" />
                <span className="text-xs font-semibold text-[#2D1B3D]/60">Status:</span>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="appearance-none bg-[#FAF8F5] border border-[#E8C4B8]/40 px-4 py-2 pr-8 rounded-xl text-xs font-bold text-[#2D1B3D] cursor-pointer focus:outline-none"
                  >
                    <option value="all">All Attendees</option>
                    <option value="checked_in">Checked In</option>
                    <option value="pending">Pending</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#2D1B3D]/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {loading && guests.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-[#2D1B3D]/25 border-t-[#2D1B3D] rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                <h3 className="text-lg font-semibold text-[#2D1B3D]">Error loading attendees</h3>
                <button
                  onClick={() => loadCheckInData(selectedEventId)}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#2D1B3D] rounded-xl"
                >
                  Try Again
                </button>
              </div>
            ) : guests.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <Users className="w-10 h-10 text-[#C9A84C] mb-3" />
                <h4 className="text-sm font-semibold text-[#2D1B3D]">No attendees found</h4>
                <p className="text-xs text-[#2D1B3D]/50 max-w-xs mt-1">
                  Ensure the search or filters matches registered RSVPs or ticketing orders.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E8C4B8]/30">
                        <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Name</th>
                        <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Email</th>
                        <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Ticket Tier</th>
                        <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">GPS Checked</th>
                        <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Check-in Time</th>
                        <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8C4B8]/20">
                      {guests.map((g) => {
                        const isCheckedIn = g.status === "CHECKED_IN";
                        return (
                          <tr key={g.id} className="hover:bg-[#FAF8F5]/60 transition-colors duration-150">
                            <td className="py-4 px-4">
                              <span className="text-sm font-semibold text-[#2D1B3D]">{g.name}</span>
                            </td>

                            <td className="py-4 px-4 text-xs text-[#2D1B3D]/80">{g.email}</td>

                            <td className="py-4 px-4 text-xs font-bold text-[#C9A84C]">{g.ticketTier}</td>

                            <td className="py-4 px-4">
                              {isCheckedIn && g.gpsVerified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                  <MapPin className="w-3 h-3" /> VERIFIED
                                </span>
                              ) : isCheckedIn ? (
                                <span className="text-[10px] text-gray-400 font-semibold">NO GPS</span>
                              ) : (
                                <span className="text-[10px] text-gray-300 font-semibold">-</span>
                              )}
                            </td>

                            <td className="py-4 px-4 text-xs text-[#2D1B3D]/60">
                              {g.checkedInAt ? new Date(g.checkedInAt).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              }) : "-"}
                              {g.method && (
                                <span className="text-[9px] uppercase tracking-wider text-[#2D1B3D]/40 ml-1.5 border border-[#E8C4B8]/40 px-1 py-0.5 rounded bg-white">
                                  {g.method}
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-4 text-right">
                              {isCheckedIn ? (
                                <button
                                  onClick={() => g.checkInId && handleUndoCheckIn(g.checkInId)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg active:scale-95 transition-all"
                                  title="Undo Check-In"
                                >
                                  <Undo2 className="w-3 h-3" /> UNDO
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleManualCheckIn(g.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-[#FAF8F5] bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-lg active:scale-95 transition-all shadow"
                                >
                                  CHECK IN
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-4 border-t border-[#E8C4B8]/20 mt-4 text-xs">
                    <span className="text-[#2D1B3D]/50 font-semibold">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-[#E8C4B8]/40 hover:bg-[#FAF8F5] rounded-lg disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border border-[#E8C4B8]/40 hover:bg-[#FAF8F5] rounded-lg disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* SCANNING AND CODE ENTRY MODAL */}
      <AnimatePresence>
        {isScanOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsScanOpen(false);
                setScanResult(null);
                setQrInput("");
              }}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold font-display" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Scan / Validate Ticket Code
                </h3>
                <button
                  onClick={() => {
                    setIsScanOpen(false);
                    setScanResult(null);
                    setQrInput("");
                  }}
                  className="p-1 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-lg hover:bg-[#F0EBE8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {scanResult && (
                <div
                  className={`mb-4 p-4 rounded-xl border flex gap-3 text-xs font-semibold ${
                    scanResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {scanResult.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-bold">{scanResult.message}</p>
                    {scanResult.name && <p className="mt-0.5 normal-case font-medium">Guest: {scanResult.name}</p>}
                  </div>
                </div>
              )}

              <form onSubmit={handleScanSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/60 mb-2">
                    Enter Ticket UUID or Guest QR ID code
                  </label>
                  <input
                    type="text"
                    required
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="e.g. 5ca3269e-6baf-4b89-a2cc-ba1f34327808"
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsScanOpen(false);
                      setScanResult(null);
                      setQrInput("");
                    }}
                    className="px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={scanning}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl transition-all shadow-md disabled:opacity-50"
                  >
                    {scanning ? "Verifying..." : "Check In Code"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
