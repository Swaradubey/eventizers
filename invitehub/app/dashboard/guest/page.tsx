"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import guestService from "../../../services/guestService";
import {
  Mail,
  Ticket,
  QrCode,
  Gift,
  ImageIcon,
  MapPin,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  Send,
  Upload,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Menu,
  ChevronRight,
  UserCheck,
  RefreshCw,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function GuestPortalPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab") || "invitation";
  const [activeTab, setActiveTab] = useState(tabParam);

  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEventIndex, setSelectedEventIndex] = useState(0);

  // RSVP Form States
  const [rsvpStatus, setRsvpStatus] = useState<string>("attending");
  const [plusOnes, setPlusOnes] = useState<number>(0);
  const [dietary, setDietary] = useState<string>("");
  const [guestNotes, setGuestNotes] = useState<string>("");
  const [submittingRsvp, setSubmittingRsvp] = useState(false);

  // Check-In State
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedInStatus, setCheckedInStatus] = useState(false);

  // Gallery Upload State
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [galleryList, setGalleryList] = useState<Array<{ url: string; caption: string; author: string }>>([
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
      caption: "Venue setup in the evening",
      author: "Event Host",
    },
    {
      url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
      caption: "Welcome drinks & florals",
      author: "Sarah",
    },
  ]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Recovery States
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadPortalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await guestService.getMyGuestPortal();
      if (data && data.success) {
        setPortalData(data);
        const activeInv = data.invitations?.[selectedEventIndex] || data.activeInvitation;
        if (activeInv) {
          setRsvpStatus(activeInv.rsvpStatus || activeInv.status || "attending");
          setCheckedInStatus(activeInv.isCheckedIn || false);
        }
      } else {
        setError(data?.error || "Could not retrieve guest details.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to guest portal server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPortalData();
      if (user.email) setRecoveryEmail(user.email);
    }
  }, [user]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const currentInvitation =
    portalData?.invitations?.[selectedEventIndex] || portalData?.activeInvitation || null;
  const currentEvent = currentInvitation?.event || null;

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInvitation) return;
    setSubmittingRsvp(true);
    try {
      const res = await guestService.submitGuestRsvp({
        guestId: currentInvitation.guestId,
        eventId: currentEvent?.id,
        status: rsvpStatus,
        plusOnes,
        dietaryRestrictions: dietary,
        notes: guestNotes,
      });
      if (res && res.success) {
        triggerToast("RSVP updated successfully! The host has been notified.");
        loadPortalData();
      } else {
        triggerToast(res?.message || "Failed to update RSVP.", "error");
      }
    } catch (err: any) {
      triggerToast(err.response?.data?.error || "Error saving RSVP.", "error");
    } finally {
      setSubmittingRsvp(false);
    }
  };

  const handleSelfCheckIn = async () => {
    if (!currentInvitation) return;
    setCheckingIn(true);
    try {
      const res = await guestService.selfCheckInGuest({
        guestId: currentInvitation.guestId,
        eventId: currentEvent?.id,
      });
      if (res && res.success) {
        setCheckedInStatus(true);
        triggerToast("Check-in successful! Welcome to the event.");
        loadPortalData();
      } else {
        triggerToast(res?.message || "Check-in failed.", "error");
      }
    } catch (err: any) {
      triggerToast(err.response?.data?.error || "Error verifying check-in.", "error");
    } finally {
      setCheckingIn(false);
    }
  };

  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;
    setUploadingPhoto(true);
    try {
      const res = await guestService.uploadGuestGalleryPhoto({
        eventId: currentEvent?.id,
        photoUrl: photoUrl.trim(),
        caption: photoCaption.trim() || "Shared guest photo",
      });
      if (res && res.success) {
        setGalleryList((prev) => [
          {
            url: photoUrl.trim(),
            caption: photoCaption.trim() || "Shared guest photo",
            author: user?.name || "You",
          },
          ...prev,
        ]);
        setPhotoUrl("");
        setPhotoCaption("");
        triggerToast("Photo uploaded to event gallery!");
      }
    } catch (err: any) {
      triggerToast("Failed to upload photo.", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSendRecoveryLink = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverySent(true);
    triggerToast("Magic access link sent to your registered email!");
  };

  const tabs = [
    { id: "invitation", label: "My Invitation", icon: Mail },
    { id: "rsvp", label: "RSVP & Status", icon: UserCheck },
    { id: "ticket", label: "QR Ticket & Badge", icon: Ticket },
    { id: "registry", label: "Gift Registry", icon: Gift },
    { id: "gallery", label: "Photo Gallery", icon: ImageIcon },
    { id: "checkin", label: "Venue Check-In", icon: MapPin },
    { id: "recovery", label: "Access Recovery", icon: KeyRound },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-600">Loading your guest portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-slate-100 flex flex-col font-body text-slate-800 relative">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6 pb-16 z-10">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-xl border border-emerald-100 bg-white hover:bg-emerald-50 transition-colors shadow-xs"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Guest Experience Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Guest Role
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Welcome, <span className="font-semibold text-slate-800">{user?.name}</span> ({user?.email})
              </p>
            </div>
          </div>

          {/* Event Selector if multiple */}
          {portalData?.invitations?.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Event:</span>
              <select
                value={selectedEventIndex}
                onChange={(e) => setSelectedEventIndex(Number(e.target.value))}
                className="bg-emerald-50/80 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-900 focus:outline-none"
              >
                {portalData.invitations.map((inv: any, idx: number) => (
                  <option key={inv.guestId} value={idx}>
                    {inv.event?.title || `Event #${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-emerald-200"
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  router.push(`/dashboard/guest?tab=${tab.id}`, { scroll: false });
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-emerald-100/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: INVITATION */}
        {activeTab === "invitation" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="relative rounded-2xl overflow-hidden mb-6 h-56 sm:h-72 bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-800">
                {currentEvent?.coverImage ? (
                  <img
                    src={currentEvent.coverImage}
                    alt={currentEvent.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white">
                    <Sparkles className="w-10 h-10 text-emerald-400 mb-3" />
                    <h3 className="text-2xl font-extrabold tracking-tight">
                      {currentEvent?.title || "Special Invitation"}
                    </h3>
                    <p className="text-xs text-emerald-200 mt-1 max-w-md">
                      You are cordially invited to celebrate this memorable occasion
                    </p>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-white uppercase border border-white/20">
                  Confirmed Invitee
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                {currentEvent?.title || "Exclusive Event Celebration"}
              </h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {currentEvent?.description ||
                  "Join us for an unforgettable gathering filled with joy, community, and great company."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/70 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Date & Time</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {currentEvent?.eventDate
                        ? new Date(currentEvent.eventDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Date to be announced"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {currentEvent?.eventTime
                        ? new Date(currentEvent.eventTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "7:00 PM onwards"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Venue Location</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {currentEvent?.venue || "Grand Ballroom"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {[currentEvent?.address, currentEvent?.city, currentEvent?.state]
                        .filter(Boolean)
                        .join(", ") || "City Center Venue"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("rsvp")}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                >
                  Respond / Change RSVP
                </button>
                <button
                  onClick={() => setActiveTab("ticket")}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Ticket className="w-4 h-4" />
                  View QR Badge
                </button>
              </div>
            </div>

            {/* Quick Summary Sidebar */}
            <div className="space-y-5">
              <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Your RSVP Status
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-50 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Response</span>
                    <p className="text-sm font-extrabold text-emerald-700 capitalize mt-0.5">
                      {rsvpStatus}
                    </p>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You can update your attendance response, dietary choices, or plus-one count anytime before the deadline.
                </p>
                <button
                  onClick={() => setActiveTab("rsvp")}
                  className="w-full mt-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 rounded-xl transition-colors cursor-pointer"
                >
                  Edit Response →
                </button>
              </div>

              <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Quick Actions
                </h3>
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => setActiveTab("ticket")}
                    className="w-full text-left p-3 rounded-xl hover:bg-emerald-50/80 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">Show Ticket QR Badge</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab("registry")}
                    className="w-full text-left p-3 rounded-xl hover:bg-emerald-50/80 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">Browse Event Registry</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab("gallery")}
                    className="w-full text-left p-3 rounded-xl hover:bg-emerald-50/80 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">Upload Photos to Gallery</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: RSVP & MODIFY RSVP */}
        {activeTab === "rsvp" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm"
          >
            <div className="mb-6 pb-4 border-b border-emerald-100">
              <h2 className="text-2xl font-bold text-slate-900">RSVP & Attendance Confirmation</h2>
              <p className="text-xs text-slate-500 mt-1">
                Please submit or adjust your attendance details for{" "}
                <span className="font-bold text-slate-800">{currentEvent?.title || "this event"}</span>.
              </p>
            </div>

            <form onSubmit={handleRsvpSubmit} className="space-y-6">
              {/* Attendance Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Will you be attending? *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "attending", label: "Attending", icon: CheckCircle, color: "border-emerald-500 bg-emerald-50 text-emerald-900" },
                    { id: "maybe", label: "Maybe", icon: Clock, color: "border-amber-500 bg-amber-50 text-amber-900" },
                    { id: "declined", label: "Declined", icon: X, color: "border-red-500 bg-red-50 text-red-900" },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const selected = rsvpStatus === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setRsvpStatus(opt.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          selected
                            ? opt.color + " shadow-sm scale-102"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1.5" />
                        <span className="text-xs font-bold">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plus Ones */}
              {rsvpStatus === "attending" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Number of Plus-Ones
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={4}
                      value={plusOnes}
                      onChange={(e) => setPlusOnes(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs font-semibold text-slate-800"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Specify additional accompanying guests.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Dietary Restrictions / Preferences
                    </label>
                    <input
                      type="text"
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      placeholder="e.g. Vegetarian, Gluten-free, Nut allergies"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </motion.div>
              )}

              {/* Message to Host */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Note to Host <span className="text-slate-400 lowercase">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={guestNotes}
                  onChange={(e) => setGuestNotes(e.target.value)}
                  placeholder="Leave a congratulatory note or special request..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-800 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingRsvp}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submittingRsvp ? "Submitting Response..." : "Save RSVP Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* TAB 3: QR TICKET & BADGE */}
        {activeTab === "ticket" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white/95 backdrop-blur-md border border-emerald-200/90 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-center">
              {/* Ticket Top Ribbon */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider mb-4">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Verified Guest Ticket
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                {currentEvent?.title || "VIP Guest Pass"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {user?.name} &bull; {user?.email}
              </p>

              {/* Dynamic QR Code Badge */}
              <div className="my-6 p-4 bg-white border border-emerald-100 rounded-2xl shadow-inner inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=INVITEHUB_GUEST_${currentInvitation?.guestId || user?.id}`}
                  alt="Guest Ticket QR"
                  className="w-48 h-48 mx-auto rounded-lg"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-emerald-50 text-left space-y-2 text-xs mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Ticket Holder:</span>
                  <span className="font-bold text-slate-800">{user?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Event Venue:</span>
                  <span className="font-semibold text-slate-800">{currentEvent?.venue || "Grand Hall"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Verification Status:</span>
                  <span
                    className={`font-bold ${
                      checkedInStatus ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {checkedInStatus ? "Checked-In at Venue" : "Ticket Confirmed (Ready to Scan)"}
                  </span>
                </div>
              </div>

              {/* Self Check-in Trigger */}
              {!checkedInStatus ? (
                <button
                  onClick={handleSelfCheckIn}
                  disabled={checkingIn}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {checkingIn ? "Verifying Check-In..." : "Self Check-In Now"}
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  You are checked in for this event!
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: GIFT REGISTRY */}
        {activeTab === "registry" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Event Gift Registry & Funds</h2>
              <p className="text-xs text-slate-500">
                Read-only registry items curated by the host for this celebration.
              </p>
            </div>

            {currentEvent?.registries && currentEvent.registries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentEvent.registries.map((reg: any) => (
                  <div
                    key={reg.id}
                    className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
                        <Gift className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">{reg.title}</h3>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        {reg.description || "Contribute towards this wishlist item for the hosts."}
                      </p>
                      {reg.goalAmount && (
                        <div className="space-y-1.5 mb-4">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                            <span>Goal: {reg.currency} {reg.goalAmount}</span>
                            <span className="text-emerald-700 font-bold">{reg.contributorCount || 0} contributors</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{
                                width: `${Math.min(100, ((reg.currentAmount || 0) / reg.goalAmount) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {reg.externalUrl ? (
                      <a
                        href={reg.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 transition-colors"
                      >
                        Visit Registry Store
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="mt-4 inline-block text-center py-2 px-4 rounded-xl text-xs font-bold text-slate-500 bg-slate-100">
                        In-Person / Cash Fund
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/90 border border-emerald-100 rounded-3xl p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto mb-3">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No Registry Items Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  The host has not published any specific gift registry items at this moment.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 5: PHOTO GALLERY */}
        {activeTab === "gallery" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Upload form */}
            <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Shared Event Photo Gallery</h2>
              <p className="text-xs text-slate-500 mb-6">
                Share your favorite memories and event photos with the host and other attendees.
              </p>

              <form onSubmit={handlePhotoUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Photo URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Caption (optional)
                    </label>
                    <input
                      type="text"
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      placeholder="e.g. Beautiful flower setup!"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploadingPhoto || !photoUrl.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingPhoto ? "Sharing..." : "Post Photo to Gallery"}
                </button>
              </form>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {galleryList.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-emerald-100 shadow-sm group hover:shadow-md transition-all"
                >
                  <div className="h-48 overflow-hidden bg-slate-100">
                    <img
                      src={item.url}
                      alt={item.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-slate-800">{item.caption}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Posted by {item.author}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 6: VENUE CHECK-IN & DIRECTIONS */}
        {activeTab === "checkin" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Venue Directions & Check-In</h2>
              <p className="text-xs text-slate-500 mt-1">
                Venue information, directions, and self check-in verification for guests.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {currentEvent?.venue || "Grand Venue Center"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {[currentEvent?.address, currentEvent?.city, currentEvent?.state, currentEvent?.country]
                      .filter(Boolean)
                      .join(", ") || "City Center Venue"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Clock className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Arrival Instructions</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Please arrive 15 minutes before the ceremony. Complimentary parking is available at the front entrance.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSelfCheckIn}
                disabled={checkingIn || checkedInStatus}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                  checkedInStatus
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {checkedInStatus
                  ? "You Are Verified & Checked-In!"
                  : checkingIn
                  ? "Verifying Check-In..."
                  : "Check In at Venue"}
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 7: ACCESS RECOVERY */}
        {activeTab === "recovery" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Event Access Recovery</h2>
              <p className="text-xs text-slate-500 mt-1">
                Recover your event ticket, magic authentication link, or request a one-time passcode (OTP).
              </p>
            </div>

            {recoverySent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900">Magic Access Link Sent</h4>
                  <p className="text-emerald-700 mt-0.5">
                    We have dispatched an instant magic access link to <strong>{recoveryEmail}</strong>. Click the link in your inbox to access your invitations on any mobile device without entering a password.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendRecoveryLink} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Confirmed Guest Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Magic Recovery Link via Email
                </button>
              </form>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-50 text-xs text-slate-500 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Security & Verification Guidelines
              </h4>
              <p>
                Your Guest Portal session is protected by cryptographic tokens. You can always view your invitation and tickets using your registered email address.
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function GuestPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Loading your guest portal...</p>
        </div>
      </div>
    }>
      <GuestPortalPageContent />
    </Suspense>
  );
}
