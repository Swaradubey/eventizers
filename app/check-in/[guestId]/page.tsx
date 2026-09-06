"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PartyPopper,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CheckInData {
  name: string;
  email?: string;
  isCheckedIn: boolean;
  alreadyCheckedIn?: boolean;
  checkedInAt?: string;
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  message?: string;
}

export default function GuestCheckInPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const guestId = (params?.guestId as string) || "";
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);

  const performCheckIn = async () => {
    if (!guestId) {
      setError("No guest pass ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call Next.js API route (which proxies to backend service)
      const res = await fetch(
        `/api/check-in/${encodeURIComponent(guestId)}?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to verify check-in.");
      }

      setCheckInData(data);
    } catch (err: any) {
      console.error("[GuestCheckInPage] Check-in error:", err);
      setError(err.message || "Invalid or unrecognized check-in pass.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performCheckIn();
  }, [guestId, token]);

  const formatDateTime = (dateStr?: string): { date: string; time: string } | null => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return {
        date: d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } catch {
      return null;
    }
  };

  const checkedInFormatted = formatDateTime(checkInData?.checkedInAt);
  const eventDateFormatted = formatDateTime(checkInData?.eventDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 selection:bg-indigo-500 selection:text-white">
      {/* ─── Top Header / Brand Bar ─── */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            InviteHub
          </span>
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Door Verification</span>
        </div>
      </header>

      {/* ─── Main Content Container ─── */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <AnimatePresence mode="wait">
          {/* ─── State 1: Loading ─── */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 text-center shadow-2xl"
            >
              <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full border-4 border-t-indigo-400 border-r-indigo-400/50 border-b-transparent border-l-transparent animate-spin" />
                <UserCheck className="w-7 h-7 text-indigo-300 absolute" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Verifying Guest Pass...
              </h2>
              <p className="text-sm text-slate-300">
                Checking credentials and validating event attendance.
              </p>
            </motion.div>
          )}

          {/* ─── State 2: Error / Invalid Pass ─── */}
          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/10 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20">
                <XCircle className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-sm text-rose-200/90 mb-6 max-w-xs mx-auto leading-relaxed">
                {error}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={performCheckIn}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold text-sm shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <Link
                  href="/"
                  className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-medium text-sm text-slate-300 active:scale-[0.98] transition-all text-center"
                >
                  Return to Home
                </Link>
              </div>
            </motion.div>
          )}

          {/* ─── State 3: Already Checked In Warning ─── */}
          {!loading && checkInData && checkInData.alreadyCheckedIn && (
            <motion.div
              key="already-checked-in"
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="bg-slate-900/80 backdrop-blur-2xl border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/40 text-center relative overflow-hidden"
            >
              {/* Amber Glow Accent */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Warning Badge Icon */}
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/30 border-2 border-amber-400/60 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
                <AlertTriangle className="w-10 h-10" />
              </div>

              {/* Warning Text & Guest Name */}
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-3">
                Already Checked In
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Welcome back, {checkInData.name}!
              </h1>

              <p className="text-sm font-medium text-amber-200/90 mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                {checkInData.message ||
                  `${checkInData.name} was already checked in earlier.`}
              </p>

              {/* Event Details Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-3 mb-6">
                <div className="border-b border-white/10 pb-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Event
                  </p>
                  <p className="text-base font-bold text-white mt-0.5">
                    {checkInData.eventTitle || "Special Event"}
                  </p>
                </div>

                {checkedInFormatted && (
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Original check-in:{" "}
                      <strong className="text-white">
                        {checkedInFormatted.time}
                      </strong>{" "}
                      ({checkedInFormatted.date})
                    </span>
                  </div>
                )}

                {checkInData.eventVenue && (
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="truncate">{checkInData.eventVenue}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={performCheckIn}
                  className="w-full py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 font-semibold text-sm text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Re-check Status</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── State 4: First Time Success Checked In ─── */}
          {!loading && checkInData && !checkInData.alreadyCheckedIn && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-slate-900/80 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 text-center relative overflow-hidden"
            >
              {/* Emerald Ambient Glow */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />

              {/* Animated Success Checkmark Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.15, stiffness: 240 }}
                className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-emerald-300/60 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-12 h-12 text-slate-950 stroke-[2.5]" />
              </motion.div>

              {/* Status Badge */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide uppercase mb-3">
                <PartyPopper className="w-3.5 h-3.5" />
                <span>Successfully Checked In</span>
              </span>

              {/* Guest Welcome Name */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Welcome, {checkInData.name}!
              </h1>

              <p className="text-sm text-slate-300 mb-6">
                Your event pass has been verified and your attendance is confirmed.
              </p>

              {/* Event Details Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-3 mb-6">
                <div className="border-b border-white/10 pb-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Event Title
                  </p>
                  <p className="text-base font-bold text-white mt-0.5">
                    {checkInData.eventTitle || "Special Event"}
                  </p>
                </div>

                {checkedInFormatted && (
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Checked in at:{" "}
                      <strong className="text-white">
                        {checkedInFormatted.time}
                      </strong>{" "}
                      ({checkedInFormatted.date})
                    </span>
                  </div>
                )}

                {checkInData.eventVenue && (
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="truncate">{checkInData.eventVenue}</span>
                  </div>
                )}
              </div>

              {/* Confirmation CTA */}
              <div className="flex flex-col gap-2.5">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Entry Verified & Recorded in Guest List</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── Footer ─── */}
      <footer className="max-w-md w-full mx-auto text-center py-2 text-xs text-slate-400">
        <p>Powered by <strong className="text-slate-300">InviteHub</strong> • Digital Check-In System</p>
      </footer>
    </div>
  );
}
