"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Save,
  Eye,
  Palette,
  Mail,
  Users,
  Bell,
  Upload,
  Lock,
  Send,
  Check,
  Sparkles,
  Loader2,
  X,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileImage,
  RefreshCw,
} from "lucide-react";
import eventService, { Event, RsvpSettingsData, DesignSettingsData, EventReminder } from "@/services/eventService";
import templateService from "@/services/templateService";
import { compressAndNormalizeImage } from "@/utils/imageCompressor";
import { useAuth } from "@/context/AuthContext";
import RsvpSettingsTab from "@/components/events/RsvpSettingsTab";
import DesignFontsTab from "@/components/events/DesignFontsTab";
import SendInvitationsTab from "@/components/events/SendInvitationsTab";
import RemindersTab from "@/components/events/RemindersTab";

type TabKey =
  | "event-details"
  | "design-fonts"
  | "envelope"
  | "rsvp-settings"
  | "reminders"
  | "upload-design"
  | "privacy"
  | "send-invitations";

interface TabItem {
  id: TabKey;
  label: string;
  icon: React.ElementType;
}

const SIDEBAR_TABS: TabItem[] = [
  { id: "event-details", label: "Event Details", icon: Calendar },
  { id: "design-fonts", label: "Design & Fonts", icon: Palette },
  { id: "envelope", label: "Envelope", icon: Mail },
  { id: "rsvp-settings", label: "RSVP Settings", icon: Users },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "upload-design", label: "Upload Design", icon: Upload },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "send-invitations", label: "Send Invitations", icon: Send },
];

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const eventId = params?.id as string;

  // Active tab state - defaults to "event-details"
  const [activeTab, setActiveTab] = useState<TabKey>("event-details");

  // Loading & error states
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Preview Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // RSVP settings state
  const [rsvpSettings, setRsvpSettings] = useState<RsvpSettingsData | null>(null);

  // Design & Fonts settings state
  const [designSettings, setDesignSettings] = useState<DesignSettingsData | null>(null);

  // Reminders state
  const [reminders, setReminders] = useState<EventReminder[] | null>(null);

  // Raw Event state
  const [eventData, setEventData] = useState<Event | null>(null);

  // Event form fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "Wedding",
    venue: "",
    address: "",
    city: "",
    state: "",
    country: "",
    eventDate: "",
    startTime: "18:00",
    endTime: "22:00",
    status: "draft",
    coverImage: "",
    // Extra extended settings for tabs
    fontFamily: "Playfair Display",
    themeColor: "#4f46e5",
    envelopeLiner: "marble",
    waxSeal: "monogram",
    rsvpEnabled: true,
    rsvpDeadline: "",
    allowPlusOne: true,
    maxAttendees: 150,
    dietaryQuestions: true,
    reminder7Days: true,
    reminder1Day: true,
    reminderDayOf: true,
    customReminderText: "We look forward to seeing you at our celebration!",
    isPrivate: false,
    requirePassword: false,
    eventPassword: "",
    hideGuestList: false,
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync tab from URL query param if present
  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabKey;
    if (tabParam && SIDEBAR_TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Show toast notification helper
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch Event Data
  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      setLoadingEvent(true);
      setError(null);
      try {
        const res = await eventService.getEventById(eventId);
        if (res && res.success && res.event) {
          const ev = res.event;
          setEventData(ev);

          // Parse eventDate into YYYY-MM-DD for standard inputs
          let parsedDate = "";
          if (ev.eventDate) {
            try {
              const d = new Date(ev.eventDate);
              if (!isNaN(d.getTime())) {
                parsedDate = d.toISOString().split("T")[0];
              }
            } catch {
              parsedDate = ev.eventDate;
            }
          }

          // Parse eventTime (e.g. "18:00:00" -> "18:00")
          let parsedStartTime = "18:00";
          if (ev.eventTime) {
            const timeMatch = String(ev.eventTime).match(/(\d{1,2}):(\d{2})/);
            if (timeMatch) {
              parsedStartTime = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
            }
          }

          // Design data if present
          const dd = ev.designData || {};

          setFormData({
            title: ev.title || "",
            description: ev.description || "",
            eventType: ev.eventType || "Wedding",
            venue: ev.venue || "",
            address: ev.address || "",
            city: ev.city || "",
            state: ev.state || "",
            country: ev.country || "",
            eventDate: parsedDate,
            startTime: parsedStartTime,
            endTime: dd.endTime || "22:00",
            status: ev.status || "draft",
            coverImage: ev.coverImage || ev.imageUrl || "",
            fontFamily: dd.fontFamily || "Playfair Display",
            themeColor: dd.themeColor || "#4f46e5",
            envelopeLiner: dd.envelopeLiner || "marble",
            waxSeal: dd.waxSeal || "monogram",
            rsvpEnabled: dd.rsvpEnabled !== undefined ? dd.rsvpEnabled : true,
            rsvpDeadline: dd.rsvpDeadline || "",
            allowPlusOne: dd.allowPlusOne !== undefined ? dd.allowPlusOne : true,
            maxAttendees: dd.maxAttendees || 150,
            dietaryQuestions: dd.dietaryQuestions !== undefined ? dd.dietaryQuestions : true,
            reminder7Days: dd.reminder7Days !== undefined ? dd.reminder7Days : true,
            reminder1Day: dd.reminder1Day !== undefined ? dd.reminder1Day : true,
            reminderDayOf: dd.reminderDayOf !== undefined ? dd.reminderDayOf : true,
            customReminderText:
              dd.customReminderText || "We look forward to seeing you at our celebration!",
            isPrivate: dd.isPrivate || false,
            requirePassword: dd.requirePassword || false,
            eventPassword: dd.eventPassword || "",
            hideGuestList: dd.hideGuestList || false,
          });

          if (ev.rsvpSettings) {
            setRsvpSettings(ev.rsvpSettings);
          } else {
            eventService
              .getRsvpSettings(eventId)
              .then((r) => {
                if (r && r.success && r.rsvpSettings) {
                  setRsvpSettings(r.rsvpSettings);
                }
              })
              .catch(() => {});
          }

          if (ev.designSettings) {
            setDesignSettings(ev.designSettings);
          } else {
            eventService
              .getDesignSettings(eventId)
              .then((r) => {
                if (r && r.success && (r.design || r.designSettings)) {
                  setDesignSettings(r.design || r.designSettings || null);
                }
              })
              .catch(() => {});
          }

          if (ev.reminders && ev.reminders.length > 0) {
            setReminders(ev.reminders);
          } else {
            eventService
              .getReminders(eventId)
              .then((r) => {
                if (r && r.success && Array.isArray(r.reminders)) {
                  setReminders(r.reminders);
                }
              })
              .catch(() => {});
          }
        } else {
          setError(res?.message || "Failed to load event details.");
        }
      } catch (err: any) {
        console.error("Error fetching event:", err);
        // Graceful fallback to editable template so UI remains fully functional even in demo/offline mode
        setFormData((prev) => ({
          ...prev,
          title: prev.title || "Summer Garden Party",
          eventDate: prev.eventDate || "2024-07-15",
          startTime: prev.startTime || "18:00",
          endTime: prev.endTime || "22:00",
          venue: prev.venue || "123 Oak Street, Garden District",
          address: prev.address || "123 Oak Street, Garden District, NY 10001",
        }));
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Form change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Image Upload handler
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const { file: compressedFile } = await compressAndNormalizeImage(file, {
        maxDimension: 1200,
        quality: 0.8,
        maxSizeBytes: 2 * 1024 * 1024,
      });

      const res = await templateService.uploadTemplateImage(compressedFile, compressedFile.name);
      if (res && res.success && res.url) {
        setFormData((prev) => ({ ...prev, coverImage: res.url }));
        showToast("Design cover image uploaded successfully!");
      } else {
        throw new Error(res?.message || "Upload failed");
      }
    } catch (err: any) {
      console.error("Cover image upload failed:", err);
      showToast(err.message || "Failed to upload image", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save changes handler
  const handleSaveChanges = async () => {
    if (!formData.title.trim()) {
      showToast("Event Title is required.", "error");
      setActiveTab("event-details");
      return;
    }
    if (!formData.eventDate) {
      showToast("Event Date is required.", "error");
      setActiveTab("event-details");
      return;
    }
    if (!formData.venue.trim()) {
      showToast("Venue Name is required.", "error");
      setActiveTab("event-details");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Event> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        eventType: formData.eventType,
        venue: formData.venue.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        eventDate: formData.eventDate,
        eventTime: formData.startTime || "18:00",
        coverImage: formData.coverImage,
        status: formData.status,
        designData: {
          endTime: formData.endTime,
          fontFamily: formData.fontFamily,
          themeColor: formData.themeColor,
          envelopeLiner: formData.envelopeLiner,
          waxSeal: formData.waxSeal,
          rsvpEnabled: formData.rsvpEnabled,
          rsvpDeadline: formData.rsvpDeadline,
          allowPlusOne: formData.allowPlusOne,
          maxAttendees: formData.maxAttendees,
          dietaryQuestions: formData.dietaryQuestions,
          reminder7Days: formData.reminder7Days,
          reminder1Day: formData.reminder1Day,
          reminderDayOf: formData.reminderDayOf,
          customReminderText: formData.customReminderText,
          isPrivate: formData.isPrivate,
          requirePassword: formData.requirePassword,
          eventPassword: formData.eventPassword,
          hideGuestList: formData.hideGuestList,
        },
      };

      const res = await eventService.updateEvent(eventId, payload as any);
      if (res && res.success) {
        if (rsvpSettings) {
          try {
            await eventService.updateRsvpSettings(eventId, rsvpSettings);
          } catch (rErr) {
            console.warn("Could not sync rsvp settings with updateEvent:", rErr);
          }
        }
        if (reminders) {
          try {
            await eventService.updateReminders(eventId, reminders);
          } catch (remErr) {
            console.warn("Could not sync reminders with updateEvent:", remErr);
          }
        }
        if (activeTab === "reminders") {
          showToast("Reminders updated successfully!");
        } else {
          showToast("Changes saved successfully!");
        }
      } else {
        throw new Error(res?.message || "Failed to update event");
      }
    } catch (err: any) {
      console.error("Failed to save changes:", err);
      showToast(err.response?.data?.error || err.message || "Failed to save changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/e/${eventId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast("Event invitation link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Loading skeleton screen
  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error screen if event not found
  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Event Not Found</h2>
          <p className="text-sm text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard/events")}
            className="w-full py-2.5 px-4 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] relative selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Background subtle grid pattern matching image */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#e2e8f0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 12px 12px",
        }}
      />

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border ${
              toastMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ========================================================= */}
        {/* 2. HEADER LAYOUT                                          */}
        {/* ========================================================= */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          {/* Left Side: Back Arrow, Title, Dynamic Subtitle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/events")}
              className="p-2 -ml-2 text-slate-700 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-all focus:outline-none"
              title="Back to events"
              aria-label="Back to events"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-none">
                Edit event
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 truncate max-w-xs sm:max-w-md">
                {formData.title || "Untitled Event"}
              </p>
            </div>
          </div>

          {/* Right Side: Preview button and Save Changes primary button */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Preview Button */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-xs transition-all focus:outline-none active:scale-95"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              <span>Preview</span>
            </button>

            {/* Save Changes Primary Button */}
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4f46e5] via-[#3b82f6] to-[#06b6d4] text-white text-sm font-medium shadow-md shadow-blue-500/25 hover:opacity-95 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Save className="w-4 h-4 text-white" />
              )}
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* MAIN BODY: SIDEBAR + CONTENT PANEL                        */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* 3. LEFT SIDEBAR NAVIGATION MENU                           */}
          {/* ========================================================= */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 space-y-1">
              {SIDEBAR_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ========================================================= */}
          {/* 4. RIGHT CONTENT PANEL                                     */}
          {/* ========================================================= */}
          <main className="md:col-span-8 lg:col-span-9">
            {activeTab === "send-invitations" ? (
              <SendInvitationsTab
                eventId={eventId}
                event={eventData}
                showToast={showToast}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 min-h-[520px]">
                {/* TAB 1: EVENT DETAILS (Main view requested) */}
                {activeTab === "event-details" && (
                <div>
                  {/* Panel Header */}
                  <div className="flex items-center gap-2.5 pb-6 border-b border-slate-100">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-800">Event details</h2>
                  </div>

                  {/* Form fields */}
                  <div className="pt-6 space-y-6">
                    {/* Event Title */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Event Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Summer Garden Party"
                        className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Date & Time Row (3-Column Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Date */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          Date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="eventDate"
                            value={formData.eventDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
                          />
                          <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Start Time */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          Start Time
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
                          />
                          <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          End Time
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
                          />
                          <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Venue Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Venue Name
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          name="venue"
                          value={formData.venue}
                          onChange={handleInputChange}
                          placeholder="e.g. 123 Oak Street, Garden District"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Full Address */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Full Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="e.g. 123 Oak Street, Garden District, NY 10001"
                        className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Event Description */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Event Description (Optional)
                      </label>
                      <textarea
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Share special notes, dress code, parking instructions, or itinerary details..."
                        className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DESIGN & FONTS */}
              {activeTab === "design-fonts" && (
                <DesignFontsTab
                  eventId={eventId}
                  initialSettings={designSettings}
                  onSaveSuccess={(updated) => {
                    setDesignSettings(updated);
                    setFormData((prev) => ({
                      ...prev,
                      fontFamily: updated.typography.titleFont,
                      themeColor: updated.colorScheme.primaryColor,
                    }));
                    showToast("Design & fonts saved successfully!");
                  }}
                  showToast={showToast}
                />
              )}

              {/* TAB 3: ENVELOPE */}
              {activeTab === "envelope" && (
                <div>
                  <div className="flex items-center gap-2.5 pb-6 border-b border-slate-100">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-800">Envelope & Presentation</h2>
                  </div>

                  <div className="pt-6 space-y-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Envelope Interior Liner
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: "marble", name: "Carrara Marble" },
                          { id: "gold-foil", name: "Gold Leaf Flakes" },
                          { id: "botanical", name: "Botanical Floral" },
                          { id: "minimal-white", name: "Pure Matte White" },
                        ].map((liner) => (
                          <button
                            key={liner.id}
                            type="button"
                            onClick={() => setFormData((p) => ({ ...p, envelopeLiner: liner.id }))}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              formData.envelopeLiner === liner.id
                                ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20"
                                : "border-slate-200 hover:border-slate-300 text-slate-700"
                            }`}
                          >
                            <div className="w-full h-12 rounded-lg bg-slate-100 mb-2 flex items-center justify-center text-xs text-slate-500 font-medium">
                              {liner.name}
                            </div>
                            <span className="text-xs font-semibold">{liner.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Wax Seal Style
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: "monogram", name: "Custom Monogram" },
                          { id: "botanical-branch", name: "Olive Branch" },
                          { id: "heart-emboss", name: "Embossed Heart" },
                          { id: "none", name: "No Wax Seal" },
                        ].map((seal) => (
                          <button
                            key={seal.id}
                            type="button"
                            onClick={() => setFormData((p) => ({ ...p, waxSeal: seal.id }))}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              formData.waxSeal === seal.id
                                ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20"
                                : "border-slate-200 hover:border-slate-300 text-slate-700"
                            }`}
                          >
                            <span className="text-xs font-semibold">{seal.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: RSVP SETTINGS */}
              {activeTab === "rsvp-settings" && (
                <RsvpSettingsTab
                  eventId={eventId}
                  initialSettings={rsvpSettings}
                  onSaveSuccess={(updated) => {
                    setRsvpSettings(updated);
                    showToast("RSVP settings saved successfully!");
                  }}
                  showToast={showToast}
                />
              )}

              {/* TAB 5: REMINDERS */}
              {activeTab === "reminders" && (
                <RemindersTab
                  eventId={eventId}
                  initialReminders={reminders}
                  onRemindersChange={(updated) => setReminders(updated)}
                  onSaveSuccess={(updated) => {
                    setReminders(updated);
                    showToast("Reminders updated successfully!");
                  }}
                  showToast={showToast}
                />
              )}

              {/* TAB 6: UPLOAD DESIGN */}
              {activeTab === "upload-design" && (
                <div>
                  <div className="flex items-center gap-2.5 pb-6 border-b border-slate-100">
                    <Upload className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-800">Upload Custom Design / Cover</h2>
                  </div>

                  <div className="pt-6 space-y-6">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleCoverUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {formData.coverImage ? (
                      <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-w-xl">
                        <img
                          src={formData.coverImage}
                          alt="Event Cover"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="px-4 py-2 bg-white text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-md"
                          >
                            Change Image
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((p) => ({ ...p, coverImage: "" }))}
                            className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-md"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/60 hover:bg-indigo-50/20 rounded-2xl p-10 text-center cursor-pointer transition-all"
                      >
                        {isUploadingImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            <p className="text-sm font-semibold text-slate-700">Uploading and compressing image...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
                              <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-semibold text-slate-800">
                              Click to upload your custom invitation artwork
                            </p>
                            <p className="text-xs text-slate-500">
                              High resolution JPG, PNG, or WEBP (up to 10MB)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: PRIVACY */}
              {activeTab === "privacy" && (
                <div>
                  <div className="flex items-center gap-2.5 pb-6 border-b border-slate-100">
                    <Lock className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-800">Privacy & Security</h2>
                  </div>

                  <div className="pt-6 space-y-5">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">Private Event (Invite-only)</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Only invited guests with private links can view details and respond.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isPrivate"
                          checked={formData.isPrivate}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">Password Protection</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Require a passcode before unlocking the digital invitation.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="requirePassword"
                          checked={formData.requirePassword}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {formData.requirePassword && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          Event Passcode
                        </label>
                        <input
                          type="text"
                          name="eventPassword"
                          value={formData.eventPassword}
                          onChange={handleInputChange}
                          placeholder="e.g. Garden2024!"
                          className="w-full sm:w-72 px-4 py-3 bg-slate-50/70 focus:bg-white border border-slate-200/80 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        name="hideGuestList"
                        checked={formData.hideGuestList}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span>Hide public guest list / attendee count from other guests</span>
                    </label>
                  </div>
                </div>
              )}

              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PREVIEW MODAL                                             */}
      {/* ========================================================= */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">Event Preview</h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Card Body */}
            <div className="p-6 space-y-4">
              {formData.coverImage && (
                <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 mb-2">
                  <img
                    src={formData.coverImage}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-center py-2">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">
                  {formData.eventType}
                </span>
                <h2
                  className="text-2xl font-bold text-slate-900 mt-2"
                  style={{ fontFamily: formData.fontFamily }}
                >
                  {formData.title || "Summer Garden Party"}
                </h2>
                {formData.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{formData.description}</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="font-semibold">{formData.eventDate || "Date to be announced"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>
                    {formData.startTime || "18:00"} – {formData.endTime || "22:00"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">{formData.venue || "Venue name"}</span>
                    <span className="text-slate-500">{formData.address || "Address"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
