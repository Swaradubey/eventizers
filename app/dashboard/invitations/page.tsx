"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../invitehub/context/AuthContext";
import { useSidebar } from "../../../invitehub/context/SidebarContext";
import Navbar from "../../../invitehub/components/Navbar";
import { useInvitation } from "../../../invitehub/hooks/useInvitation";
import eventService, { Event } from "../../../services/eventService";
import {
  LogOut,
  Calendar,
  Clock,
  MapPin,
  Upload,
  Image as ImageIcon,
  Type,
  Palette,
  MousePointerClick,
  Info,
  Save,
  Send,
  Eye,
  X,
  Menu,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function InvitationDesignerPageContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const { setIsOpen: setSidebarOpen } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEventId = searchParams?.get("eventId") || null;

  // Events list for dropdown if eventId is not provided
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(queryEventId);

  // Invitation hook
  const {
    invitation,
    setInvitation,
    event,
    loading: inviteLoading,
    saving: inviteSaving,
    sending: inviteSending,
    error: inviteError,
    successMessage: inviteSuccess,
    clearNotifications,
    saveInvitation,
    queueInvitation,
  } = useInvitation(selectedEventId);

  // Accordion section states
  const [openSection, setOpenSection] = useState<string>("text");

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [coverImgError, setCoverImgError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Protected route check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load events list for switcher
  useEffect(() => {
    if (user) {
      const fetchEvents = async () => {
        try {
          const res = await eventService.getEvents();
          if (res.success) {
            setEvents(res.events || []);
            // If no eventId in query but events exist, auto-select first one to make it user-friendly
            if (!queryEventId && res.events && res.events.length > 0) {
              setSelectedEventId(res.events[0].id || null);
            }
          }
        } catch (err) {
          console.error("Error loading events switcher:", err);
        }
      };
      fetchEvents();
    }
  }, [user, queryEventId]);

  // Handle local toast syncing from hook
  useEffect(() => {
    if (inviteSuccess) {
      setToast({ message: inviteSuccess, type: "success" });
      const timer = setTimeout(() => {
        setToast(null);
        clearNotifications();
      }, 4000);
      return () => clearTimeout(timer);
    }
    if (inviteError) {
      setToast({ message: inviteError, type: "error" });
      const timer = setTimeout(() => {
        setToast(null);
        clearNotifications();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [inviteSuccess, inviteError, clearNotifications]);

  // ESC key to close preview modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPreviewOpen) {
        setIsPreviewOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isPreviewOpen]);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPreviewOpen]);

  // Simple focus trap when modal opens
  useEffect(() => {
    if (isPreviewOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      first?.focus();

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab" || !first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      document.addEventListener("keydown", handleTab);
      return () => document.removeEventListener("keydown", handleTab);
    }
  }, [isPreviewOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleInputChange = (field: string, value: any) => {
    if (!invitation) return;
    setInvitation({
      ...invitation,
      [field]: value,
    });
  };

  // Image Upload helper converting to Base64
  const processImageFile = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setToast({ message: "Only PNG, JPG, JPEG, and WEBP image formats are accepted.", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      handleInputChange("imageUrl", base64Data);
      setToast({ message: "Image loaded successfully. Save to update.", type: "success" });
    };
    reader.onerror = () => {
      setToast({ message: "Failed to read image file.", type: "error" });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Save Flow
  const handleSave = async (statusOverride?: "draft" | "published") => {
    if (!invitation) return;
    const payload = {
      ...invitation,
      status: statusOverride || invitation.status,
    };
    await saveInvitation(payload);
  };

  // Send Flow
  const handleSend = async () => {
    if (!invitation) return;
    // Auto-save any pending changes first
    const saved = await saveInvitation(invitation);
    if (saved) {
      await queueInvitation();
    }
  };

  // Render Date nicely
  const formatEventDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? "" : section);
  };

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

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 z-10">

        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
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
                className="text-3xl md:text-4xl font-semibold text-[#2D1B3D] font-display"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Invitation Designer
              </h1>
              <p className="text-xs text-[#2D1B3D]/60 mt-1">Design and publish invitation web pages for your guests</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Event switcher dropdown if user has events */}
            {events.length > 0 && (
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E8C4B8]/40 shadow-sm text-xs">
                <span className="text-[#2D1B3D]/50 font-semibold">Event:</span>
                <select
                  value={selectedEventId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedEventId(val || null);
                    // Replace URL search param without full reload
                    const url = new URL(window.location.href);
                    if (val) {
                      url.searchParams.set("eventId", val);
                    } else {
                      url.searchParams.delete("eventId");
                    }
                    window.history.pushState({}, "", url.toString());
                  }}
                  className="bg-transparent font-bold focus:outline-none text-[#2D1B3D] cursor-pointer max-w-[150px] truncate"
                >
                  <option value="">Select Event...</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/40 hover:bg-[#F0EBE8] rounded-xl transition-all shadow-sm active:scale-95 focus:outline-none"
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
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
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

        {/* Main Workspace split */}
        {!selectedEventId ? (
          /* Empty selection state */
          <div className="flex-1 bg-white border border-[#E8C4B8]/30 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#E8C4B8]/40 flex items-center justify-center mb-6 shadow-sm">
              <Calendar className="w-8 h-8 text-[#C9A84C]" />
            </div>
            <h3 className="text-2xl font-bold font-display text-[#2D1B3D] mb-2">Select an Event to Begin</h3>
            <p className="text-sm text-[#2D1B3D]/60 max-w-md mb-8">
              Select one of your existing events above, or create a new event from the dashboard to start styling customized invitation pages.
            </p>
            {events.length === 0 && (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 text-xs font-bold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52] transition-colors shadow-md focus:outline-none"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        ) : inviteLoading ? (
          /* Loading designer */
          <div className="flex-1 bg-white/60 border border-[#E8C4B8]/30 rounded-2xl p-24 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-8 h-8 border-3 border-[#2D1B3D]/25 border-t-[#2D1B3D] rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-[#2D1B3D]/50 mt-4">Loading invitation editor...</p>
          </div>
        ) : !invitation ? (
          /* Error loading event/details */
          <div className="flex-1 bg-white border border-[#E8C4B8]/30 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-[#2D1B3D] mb-2">Could Not Load Designer Data</h3>
            <p className="text-sm text-[#2D1B3D]/60 max-w-sm mb-6">
              {inviteError || "The event could not be found or you do not have permission to view it."}
            </p>
            <button
              onClick={() => setSelectedEventId(null)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2D1B3D] rounded-xl"
            >
              Back to Events selection
            </button>
          </div>
        ) : (
          /* Designer Workspace */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT CONTROL PANEL (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* Toolbar Actions Bar (Publish, Save Draft, Preview) */}
              <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 shadow-sm flex flex-wrap gap-2 items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                  {invitation.status} mode
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsPreviewOpen(true); setCoverImgError(false); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 hover:bg-[#FAF8F5] rounded-xl transition-all shadow-sm active:scale-95"
                    title="Preview full screen"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleSave("draft")}
                    disabled={inviteSaving}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 hover:bg-[#FAF8F5] rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {inviteSaving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5 text-[#C9A84C]" />
                    )}
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSave("published")}
                    disabled={inviteSaving}
                    className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-[#C9A84C] hover:bg-[#b0903c] rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    Publish
                  </button>
                </div>
              </div>

              {/* Main Editing Controls Accordion Card */}
              <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl shadow-sm overflow-hidden divide-y divide-[#E8C4B8]/20">

                {/* Accordion 1: Text Content */}
                <div>
                  <button
                    onClick={() => toggleSection("text")}
                    className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-[#FAF8F5] transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <Type className="w-4 h-4 text-[#C9A84C]" />
                      <span className="text-sm font-bold text-[#2D1B3D]">1. Text Content</span>
                    </div>
                    {openSection === "text" ? <ChevronUp className="w-4 h-4 text-[#2D1B3D]/50" /> : <ChevronDown className="w-4 h-4 text-[#2D1B3D]/50" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {openSection === "text" && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 space-y-4 text-xs">
                          <div>
                            <label className="block font-semibold text-[#2D1B3D]/70 mb-1">Main Title (required)</label>
                            <input
                              type="text"
                              value={invitation.title}
                              onChange={(e) => handleInputChange("title", e.target.value)}
                              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                              placeholder="e.g. You're Invited!"
                            />
                            <p className="text-[10px] text-[#2D1B3D]/40 mt-0.5">Keep title length between 5 and 60 characters for best layout.</p>
                          </div>

                          <div>
                            <label className="block font-semibold text-[#2D1B3D]/70 mb-1">Subtitle</label>
                            <input
                              type="text"
                              value={invitation.subtitle || ""}
                              onChange={(e) => handleInputChange("subtitle", e.target.value)}
                              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                              placeholder="e.g. Please join us to celebrate"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-[#2D1B3D]/70 mb-1">Description / Main Text</label>
                            <textarea
                              value={invitation.mainText || ""}
                              onChange={(e) => handleInputChange("mainText", e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                              placeholder="Describe your event parameters..."
                            />
                          </div>

                          {/* Title size slider */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="font-semibold text-[#2D1B3D]/70">Title Size</label>
                              <span className="text-[10px] font-bold text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-lg">{invitation.titleSize}px</span>
                            </div>
                            <input
                              type="range"
                              min="20"
                              max="80"
                              value={invitation.titleSize}
                              onChange={(e) => handleInputChange("titleSize", parseInt(e.target.value, 10))}
                              className="w-full accent-[#C9A84C] h-1.5 bg-[#FAF8F5] rounded-lg cursor-pointer"
                            />
                          </div>

                          {/* Font Family / Weight */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold text-[#2D1B3D]/70 mb-1">Font Family</label>
                              <select
                                value={invitation.fontFamily}
                                onChange={(e) => handleInputChange("fontFamily", e.target.value)}
                                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-xs focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                              >
                                <option value="Playfair Display">Playfair Display</option>
                                <option value="Inter">Inter (Sans)</option>
                                <option value="Georgia">Georgia (Serif)</option>
                                <option value="monospace">Monospace</option>
                              </select>
                            </div>

                            <div>
                              <label className="block font-semibold text-[#2D1B3D]/70 mb-1">Font Weight</label>
                              <select
                                value={invitation.fontWeight}
                                onChange={(e) => handleInputChange("fontWeight", e.target.value)}
                                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-xs focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                              >
                                <option value="300">Light (300)</option>
                                <option value="400">Regular (400)</option>
                                <option value="500">Medium (500)</option>
                                <option value="600">SemiBold (600)</option>
                                <option value="700">Bold (700)</option>
                                <option value="800">ExtraBold (800)</option>
                              </select>
                            </div>
                          </div>

                          {/* Text alignment selection */}
                          <div>
                            <label className="block font-semibold text-[#2D1B3D]/70 mb-1.5">Text Alignment</label>
                            <div className="flex gap-2">
                              {["left", "center", "right"].map((align) => (
                                <button
                                  key={align}
                                  type="button"
                                  onClick={() => handleInputChange("textAlignment", align)}
                                  className={`flex-1 py-2 flex items-center justify-center rounded-xl border transition-all ${invitation.textAlignment === align
                                      ? "bg-[#2D1B3D] text-white border-[#2D1B3D]"
                                      : "bg-[#FAF8F5] text-[#2D1B3D]/60 border-[#E8C4B8]/40 hover:bg-[#F0EBE8]"
                                    }`}
                                >
                                  {align === "left" && <AlignLeft className="w-4 h-4" />}
                                  {align === "center" && <AlignCenter className="w-4 h-4" />}
                                  {align === "right" && <AlignRight className="w-4 h-4" />}
                                  <span className="text-[10px] ml-1.5 capitalize font-semibold">{align}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 2: Colors */}
                <div>
                  <button
                    onClick={() => toggleSection("colors")}
                    className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-[#FAF8F5] transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <Palette className="w-4 h-4 text-[#C9A84C]" />
                      <span className="text-sm font-bold text-[#2D1B3D]">2. Color Customization</span>
                    </div>
                    {openSection === "colors" ? <ChevronUp className="w-4 h-4 text-[#2D1B3D]/50" /> : <ChevronDown className="w-4 h-4 text-[#2D1B3D]/50" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {openSection === "colors" && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 space-y-4 text-xs">
                          {/* Background color */}
                          <div>
                            <label className="block font-semibold text-[#2D1B3D]/70 mb-1">Background Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={invitation.backgroundColor}
                                onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
                                className="w-10 h-10 border border-[#E8C4B8]/40 rounded-xl cursor-pointer bg-transparent"
                              />
                              <input
                                type="text"
                                value={invitation.backgroundColor}
                                onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
                                className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D] font-mono uppercase"
                                placeholder="#F6F9FC"
                              />
                            </div>
                          </div>

                          {/* Accent Color */}
                          <div>
                            <label className="block font-semibold text-[#2D1B3D]/70 mb-1">Accent Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={invitation.accentColor}
                                onChange={(e) => handleInputChange("accentColor", e.target.value)}
                                className="w-10 h-10 border border-[#E8C4B8]/40 rounded-xl cursor-pointer bg-transparent"
                              />
                              <input
                                type="text"
                                value={invitation.accentColor}
                                onChange={(e) => handleInputChange("accentColor", e.target.value)}
                                className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D] font-mono uppercase"
                                placeholder="#5B5FEF"
                              />
                            </div>
                          </div>

                          {/* Text Color */}
                          <div>
                            <label className="block font-semibold text-[#2D1B3D]/70 mb-1">Text Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={invitation.textColor}
                                onChange={(e) => handleInputChange("textColor", e.target.value)}
                                className="w-10 h-10 border border-[#E8C4B8]/40 rounded-xl cursor-pointer bg-transparent"
                              />
                              <input
                                type="text"
                                value={invitation.textColor}
                                onChange={(e) => handleInputChange("textColor", e.target.value)}
                                className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D] font-mono uppercase"
                                placeholder="#1A1118"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 3: Media */}
                <div>
                  <button
                    onClick={() => toggleSection("media")}
                    className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-[#FAF8F5] transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-4 h-4 text-[#C9A84C]" />
                      <span className="text-sm font-bold text-[#2D1B3D]">3. Media Cover</span>
                    </div>
                    {openSection === "media" ? <ChevronUp className="w-4 h-4 text-[#2D1B3D]/50" /> : <ChevronDown className="w-4 h-4 text-[#2D1B3D]/50" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {openSection === "media" && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 space-y-4 text-xs">
                          <div>
                            <label className="block font-semibold text-[#2D1B3D]/70 mb-2">Cover Image URL or File Upload</label>

                            {/* Drag & Drop zone */}
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${isDragging
                                  ? "border-[#C9A84C] bg-[#FAF8F5]"
                                  : "border-[#E8C4B8]/40 bg-white hover:bg-[#FAF8F5]/55"
                                }`}
                            >
                              <Upload className="w-6 h-6 text-[#C9A84C] mb-2" />
                              <p className="font-semibold text-xs text-[#2D1B3D]">Drag & Drop Cover Image here</p>
                              <p className="text-[10px] text-[#2D1B3D]/40 mt-1">Accepts PNG, JPG, JPEG, WEBP</p>
                              <button
                                type="button"
                                className="mt-3 px-3 py-1.5 bg-[#FAF8F5] text-[#2D1B3D] border border-[#E8C4B8]/50 hover:bg-[#F0EBE8] rounded-lg font-semibold text-[10px] transition-all"
                              >
                                Select File
                              </button>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </div>
                          </div>

                          {invitation.imageUrl && (
                            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8C4B8]/20 space-y-2">
                              <p className="font-semibold text-[#2D1B3D]/50 text-[10px] uppercase">Active Preview</p>
                              <div className="relative w-full h-24 rounded-lg overflow-hidden border border-[#E8C4B8]/30">
                                <img
                                  src={invitation.imageUrl}
                                  alt="Cover preview"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleInputChange("imageUrl", "")}
                                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md"
                                  title="Remove cover image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="flex-1 py-1 px-2 border border-[#E8C4B8]/40 rounded-lg text-[10px] font-semibold text-center hover:bg-[#F0EBE8] transition-colors"
                                >
                                  Replace Image
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInputChange("imageUrl", "")}
                                  className="py-1 px-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-lg text-[10px] font-semibold text-center transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block font-semibold text-[#2D1B3D]/70 mb-1">Or Paste Image URL</label>
                            <input
                              type="text"
                              value={invitation.imageUrl || ""}
                              onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                              placeholder="https://example.com/cover.png"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 4: Interactive RSVP Button */}
                <div>
                  <button
                    onClick={() => toggleSection("button")}
                    className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-[#FAF8F5] transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <MousePointerClick className="w-4 h-4 text-[#C9A84C]" />
                      <span className="text-sm font-bold text-[#2D1B3D]">4. RSVP Call to Action Button</span>
                    </div>
                    {openSection === "button" ? <ChevronUp className="w-4 h-4 text-[#2D1B3D]/50" /> : <ChevronDown className="w-4 h-4 text-[#2D1B3D]/50" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {openSection === "button" && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 space-y-4 text-xs">
                          <div>
                            <label className="block font-semibold text-[#2D1B3D]/70 mb-1">Button Text</label>
                            <input
                              type="text"
                              value={invitation.buttonText}
                              onChange={(e) => handleInputChange("buttonText", e.target.value)}
                              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D]"
                              placeholder="RSVP Now"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-[#2D1B3D]/70 mb-1">Button Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={invitation.buttonColor}
                                onChange={(e) => handleInputChange("buttonColor", e.target.value)}
                                className="w-10 h-10 border border-[#E8C4B8]/40 rounded-xl cursor-pointer bg-transparent"
                              />
                              <input
                                type="text"
                                value={invitation.buttonColor}
                                onChange={(e) => handleInputChange("buttonColor", e.target.value)}
                                className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] text-[#2D1B3D] font-mono uppercase"
                                placeholder="#5B5FEF"
                              />
                            </div>
                          </div>

                          {/* Button Radius slider */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="font-semibold text-[#2D1B3D]/70">Button Corner Radius</label>
                              <span className="text-[10px] font-bold text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-lg">{invitation.buttonRadius}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="24"
                              value={invitation.buttonRadius}
                              onChange={(e) => handleInputChange("buttonRadius", parseInt(e.target.value, 10))}
                              className="w-full accent-[#C9A84C] h-1.5 bg-[#FAF8F5] rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 5: Event details */}
                <div>
                  <button
                    onClick={() => toggleSection("event")}
                    className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-[#FAF8F5] transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#C9A84C]" />
                      <span className="text-sm font-bold text-[#2D1B3D]">5. Event Details (Read-only)</span>
                    </div>
                    {openSection === "event" ? <ChevronUp className="w-4 h-4 text-[#2D1B3D]/50" /> : <ChevronDown className="w-4 h-4 text-[#2D1B3D]/50" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {openSection === "event" && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 space-y-3 text-xs">
                          <div className="p-3.5 bg-amber-50/50 border border-[#E8C4B8]/30 rounded-xl space-y-2.5 text-[#2D1B3D]">
                            <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                              <p className="text-[10px] text-[#2D1B3D]/65">These details are synced automatically from the event parameters. Edit these in the Events module.</p>
                            </div>

                            {event ? (
                              <div className="space-y-2 mt-2 pt-2 border-t border-[#E8C4B8]/20">
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-[#2D1B3D]/50 block">Name</span>
                                  <span className="font-bold text-xs">{event.title}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-[#2D1B3D]/50 block">Date</span>
                                  <span className="font-bold text-xs">{formatEventDate(event.eventDate)}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-[#2D1B3D]/50 block">Time</span>
                                  <span className="font-bold text-xs">{event.eventTime}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-[#2D1B3D]/50 block">Venue</span>
                                  <span className="font-bold text-xs">{event.venue}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-[#2D1B3D]/40 py-2">No event sync details found.</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* RIGHT LIVE PREVIEW PANEL (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-6 lg:sticky lg:top-24">

              {/* Toolbar sending actions */}
              <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#2D1B3D]/60">Share with Guests:</span>
                </div>
                <button
                  onClick={handleSend}
                  disabled={inviteSending || !invitation.id}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-[#FAF8F5] bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl active:scale-95 transition-all shadow-md focus:outline-none disabled:opacity-50"
                  title={!invitation.id ? "Save the invitation draft first to enable sending" : "Distribute to Guest List"}
                >
                  {inviteSending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-[#C9A84C]" />
                  )}
                  Send Invitations
                </button>
              </div>

              {/* Mockup Container */}
              <div className="bg-white border border-[#E8C4B8]/30 rounded-3xl p-6 shadow-sm flex flex-col items-center">
                <span className="text-[10px] font-bold text-[#2D1B3D]/40 uppercase tracking-widest mb-4">Live Preview Screen</span>

                {/* Device Screen frame */}
                <div
                  className="w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-[#E8C4B8]/30 min-h-[550px] flex flex-col transition-all duration-300"
                  style={{ backgroundColor: invitation.backgroundColor }}
                >
                  {/* Image cover preview */}
                  {invitation.imageUrl ? (
                    <div className="w-full bg-[#F0EBE8]/60 flex items-center justify-center" style={{ minHeight: "180px", maxHeight: "300px" }}>
                      <img
                        src={invitation.imageUrl}
                        alt="Invitation cover"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-b from-[#2D1B3D]/5 to-transparent flex items-center justify-center">
                      <span className="text-xs text-[#2D1B3D]/20 italic">No cover image uploaded</span>
                    </div>
                  )}

                  {/* Body Text preview */}
                  <div
                    className="flex-1 p-8 flex flex-col justify-between items-center text-center space-y-6"
                    style={{ textAlign: invitation.textAlignment as any, color: invitation.textColor }}
                  >

                    {/* Headers */}
                    <div className="w-full space-y-3">
                      <h2
                        style={{
                          fontSize: `${invitation.titleSize}px`,
                          fontWeight: invitation.fontWeight,
                          fontFamily: invitation.fontFamily === "Playfair Display" ? "'Playfair Display', Georgia, serif" : invitation.fontFamily,
                          lineHeight: 1.15
                        }}
                        className="text-balance"
                      >
                        {invitation.title || "You're Invited"}
                      </h2>

                      {invitation.subtitle && (
                        <p className="text-sm opacity-80 font-medium font-body leading-relaxed max-w-md mx-auto">
                          {invitation.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Main Description */}
                    {invitation.mainText && (
                      <p className="text-xs opacity-70 leading-relaxed font-body max-w-sm mx-auto">
                        {invitation.mainText}
                      </p>
                    )}

                    {/* Synthesized Event Info box */}
                    {event ? (
                      <div
                        className="w-full max-w-sm p-4 rounded-xl space-y-3.5 text-left border border-opacity-10 backdrop-blur-sm"
                        style={{ borderColor: invitation.accentColor, backgroundColor: "rgba(255, 255, 255, 0.45)" }}
                      >
                        <div className="flex gap-2.5 items-start">
                          <Calendar
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: invitation.accentColor }}
                          />
                          <div>
                            <span className="text-[9px] uppercase tracking-wider opacity-60 font-bold block">Date</span>
                            <span className="text-xs font-bold font-body">{formatEventDate(event.eventDate)}</span>
                          </div>
                        </div>

                        <div className="flex gap-2.5 items-start">
                          <Clock
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: invitation.accentColor }}
                          />
                          <div>
                            <span className="text-[9px] uppercase tracking-wider opacity-60 font-bold block">Time</span>
                            <span className="text-xs font-bold font-body">{event.eventTime}</span>
                          </div>
                        </div>

                        <div className="flex gap-2.5 items-start">
                          <MapPin
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: invitation.accentColor }}
                          />
                          <div>
                            <span className="text-[9px] uppercase tracking-wider opacity-60 font-bold block">Location</span>
                            <span className="text-xs font-bold font-body">{event.venue}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full max-w-sm p-4 border border-dashed rounded-xl flex items-center justify-center">
                        <span className="text-xs opacity-40 italic">Syncing event metadata...</span>
                      </div>
                    )}

                    {/* Call to Action Button */}
                    <div className="pt-2 w-full max-w-xs mx-auto">
                      <button
                        type="button"
                        className="w-full py-3 px-6 text-xs font-bold text-white shadow-md active:scale-97 transition-all focus:outline-none"
                        style={{
                          backgroundColor: invitation.buttonColor,
                          borderRadius: `${invitation.buttonRadius}px`,
                        }}
                      >
                        {invitation.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FULL INVITATION PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewOpen && invitation && (
          <div
            className="fixed inset-0 z-50 bg-[#2D1B3D]/80 backdrop-blur-md"
            onClick={() => setIsPreviewOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Invitation Preview"
          >
            <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                style={{ backgroundColor: invitation.backgroundColor }}
              >

                {/* Scrollable content area */}
                <div className="overflow-y-auto flex-1">

                  {/* Sticky Header Navigation */}
                  <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-[#E8C4B8]/20 flex items-center justify-between px-4 sm:px-6 py-3">
                    <button
                      onClick={() => setIsPreviewOpen(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2D1B3D] bg-white/70 hover:bg-white rounded-xl transition-all border border-[#E8C4B8]/30 shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
                      aria-label="Go back"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    <h2 className="text-xs sm:text-sm font-bold text-[#2D1B3D]">Invitation Preview</h2>
                    <button
                      onClick={() => setIsPreviewOpen(false)}
                      className="p-2 bg-white/70 hover:bg-white text-[#2D1B3D] rounded-xl transition-all border border-[#E8C4B8]/30 shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
                      aria-label="Close preview"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cover Image */}
                  {invitation.imageUrl && !coverImgError ? (
                    <div className="w-full bg-[#F0EBE8] flex items-center justify-center" style={{ minHeight: "200px", maxHeight: "50vh" }}>
                      <img
                        src={invitation.imageUrl}
                        alt="Invitation cover"
                        className="w-full h-full object-contain"
                        style={{ maxHeight: "50vh" }}
                        onError={() => setCoverImgError(true)}
                      />
                    </div>
                  ) : invitation.imageUrl && coverImgError ? (
                    <div className="w-full h-48 bg-gradient-to-br from-[#2D1B3D]/5 to-transparent flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-10 h-10 text-[#2D1B3D]/20 mx-auto mb-2" />
                        <p className="text-xs text-[#2D1B3D]/30">Cover image failed to load</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-16 bg-gradient-to-b from-[#2D1B3D]/5 to-transparent"></div>
                  )}

                  {/* Invitation typography contents */}
                  <div
                    className="flex-1 px-6 sm:px-10 py-8 sm:py-10 flex flex-col justify-between items-center text-center space-y-8"
                    style={{ textAlign: invitation.textAlignment as any, color: invitation.textColor }}
                  >

                    {/* Headers */}
                    <div className="space-y-4 w-full max-w-2xl mx-auto">
                      <h1
                        style={{
                          fontSize: `${invitation.titleSize}px`,
                          fontWeight: invitation.fontWeight,
                          fontFamily: invitation.fontFamily === "Playfair Display" ? "'Playfair Display', Georgia, serif" : invitation.fontFamily,
                          lineHeight: 1.1
                        }}
                        className="text-balance"
                      >
                        {invitation.title || "You're Invited!"}
                      </h1>

                      {invitation.subtitle && (
                        <p className="text-base opacity-80 font-medium font-body leading-relaxed max-w-md mx-auto">
                          {invitation.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Description info */}
                    {invitation.mainText && (
                      <p className="text-sm opacity-70 leading-relaxed font-body max-w-lg mx-auto">
                        {invitation.mainText}
                      </p>
                    )}

                    {/* Date location boxes */}
                    {event ? (
                      <div
                        className="w-full max-w-md p-5 rounded-xl space-y-4 text-left border border-opacity-10 backdrop-blur-md"
                        style={{ borderColor: invitation.accentColor, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
                      >
                        <div className="flex gap-3 items-start">
                          <Calendar
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: invitation.accentColor }}
                          />
                          <div>
                            <span className="text-[9px] uppercase tracking-wider opacity-60 font-bold block">Date</span>
                            <span className="text-xs font-bold font-body">{formatEventDate(event.eventDate)}</span>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <Clock
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: invitation.accentColor }}
                          />
                          <div>
                            <span className="text-[9px] uppercase tracking-wider opacity-60 font-bold block">Time</span>
                            <span className="text-xs font-bold font-body">{event.eventTime}</span>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <MapPin
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: invitation.accentColor }}
                          />
                          <div>
                            <span className="text-[9px] uppercase tracking-wider opacity-60 font-bold block">Location</span>
                            <span className="text-xs font-bold font-body">{event.venue}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full max-w-md p-4 border border-dashed rounded-xl text-center text-xs opacity-50">
                        No active event parameters synced.
                      </div>
                    )}

                    {/* Confirm RSVP button */}
                    <div className="w-full max-w-sm pt-4">
                      <button
                        type="button"
                        className="w-full py-4 px-6 text-sm font-bold text-white shadow-lg active:scale-98 transition-all hover:opacity-95 focus:outline-none"
                        style={{
                          backgroundColor: invitation.buttonColor,
                          borderRadius: `${invitation.buttonRadius}px`,
                        }}
                      >
                        {invitation.buttonText}
                      </button>
                      <p className="text-[10px] opacity-45 mt-2.5 font-semibold">Brought to you by InviteHub</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InvitationDesignerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
      </div>
    }>
      <InvitationDesignerPageContent />
    </Suspense>
  );
}
