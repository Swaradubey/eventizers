"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Calendar, Clock, MapPin, Tag, Info, Sparkles, Upload, Image as ImageIcon, Loader2, Wand2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import eventService, { Event } from "../services/eventService";
import API from "../services/api";
import adminService from "../services/adminService";
import templateService from "../services/templateService";
import { NEW_TEMPLATES } from "../lib/newTemplatesData";
import { getImageUrl } from "../utils/imageUrl";
import { compressAndNormalizeImage } from "../utils/imageCompressor";
import EviteCardPreview from "./designer/EviteCardPreview";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  eventToEdit?: Event | null;
  isAdmin?: boolean;
}

const EVENT_TYPES = [
  "Wedding",
  "Conference",
  "Concert",
  "Birthday",
  "Corporate Meeting",
  "Dinner Party",
  "Seminar",
  "Exhibition",
  "Workshop",
  "Other",
];

const STATUSES = ["draft", "published", "cancelled"];

export default function EventModal({
  isOpen,
  onClose,
  onSuccess,
  eventToEdit = null,
  isAdmin = false,
}: EventModalProps) {
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
    eventTime: "",
    status: "draft",
    coverImage: "",
  });

  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl-golden-milestone");
  const [openDesignerAfterSave, setOpenDesignerAfterSave] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Template Generation states
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleImageFileUpload = async (file: File) => {
    if (!file) return;
    setError(null);
    setIsUploadingImage(true);

    try {
      // 1. Client-side compression & format normalization (max 1200px, quality 0.8)
      const { file: compressedFile } = await compressAndNormalizeImage(file, {
        maxDimension: 1200,
        quality: 0.8,
        maxSizeBytes: 1.5 * 1024 * 1024,
      });

      // 2. Upload to public cloud/server storage
      const res = await templateService.uploadTemplateImage(compressedFile, compressedFile.name);
      if (res && res.success && res.url) {
        setFormData((prev) => ({ ...prev, coverImage: res.url }));
      } else {
        throw new Error(res?.message || "Upload failed");
      }
    } catch (err: any) {
      console.error("Cover image upload failed:", err);
      setError("Failed to upload cover image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleGenerateAITemplate = async () => {
    setAiError(null);
    setAiGeneratedImageUrl(null);

    const promptText = aiPrompt.trim() || `${formData.eventType} ${formData.title || 'invitation'}`;
    if (!formData.title.trim() && !aiPrompt.trim()) {
      setAiError("Please enter an event title or describe your event to generate a template.");
      return;
    }

    setGeneratingTemplate(true);

    try {
      const res = await API.post("/ai/generate-event-template", {
        userPrompt: promptText,
        eventType: formData.eventType,
        title: formData.title || "Your Event",
        date: formData.eventDate || new Date().toISOString().split("T")[0],
        venue: formData.venue || "Venue",
      });

      if (res.data && res.data.success && res.data.imageUrl) {
        const imageUrl = res.data.imageUrl;
        setAiGeneratedImageUrl(imageUrl);

        // Store the generated image for the studio to pick up
        if (typeof window !== "undefined") {
          sessionStorage.setItem("pending_upload_invite", imageUrl);
          localStorage.setItem("pending_upload_invite", imageUrl);

          const details = res.data.details || res.data.meta || {};
          const title = details.title || formData.title || "Your Event";
          sessionStorage.setItem("pending_upload_title", title);
          localStorage.setItem("pending_upload_title", title);

          const stationeryDesign = {
            cardBgColor: "#ffffff",
            textElements: [
              {
                id: "layer-title",
                role: "title",
                text: (details.title || title || "Celebration").toUpperCase(),
                x: 50,
                y: 30,
                fontSize: 34,
                fontFamily: "Playfair Display",
                fontWeight: "800",
                color: "#1E293B",
                align: "center",
                letterSpacing: 2,
              },
              {
                id: "layer-host",
                role: "host",
                text: details.subtitle || "YOU ARE CORDIALLY INVITED TO CELEBRATE",
                x: 50,
                y: 42,
                fontSize: 13,
                fontFamily: "Inter",
                fontWeight: "600",
                color: "#475569",
                align: "center",
                letterSpacing: 1.2,
                casing: "uppercase",
              },
              {
                id: "layer-datetime",
                role: "datetime",
                text: details.date || formData.eventDate || "Saturday, 25 October • 6:00 PM",
                x: 50,
                y: 54,
                fontSize: 15,
                fontFamily: "Inter",
                fontWeight: "700",
                color: "#1E293B",
                align: "center",
                letterSpacing: 1.5,
              },
              {
                id: "layer-venue",
                role: "venue",
                text: details.venue || formData.venue || "The Grand Palace Hall, City Center",
                x: 50,
                y: 65,
                fontSize: 14,
                fontFamily: "Inter",
                fontWeight: "600",
                color: "#475569",
                align: "center",
                letterSpacing: 0.5,
              },
            ],
          };
          sessionStorage.setItem("pending_stationery_design", JSON.stringify(stationeryDesign));
          localStorage.setItem("pending_stationery_design", JSON.stringify(stationeryDesign));
        }

        // Navigate to invitation studio with the generated image
        const studioUrl = `/dashboard/invitations?uploadedImageUrl=${encodeURIComponent(imageUrl)}&studio=true&aiGenerated=1`;
        onClose();
        router.push(studioUrl);
      } else {
        setAiError(res.data?.error || "Failed to generate template. Please try again.");
      }
    } catch (err: any) {
      console.error("AI Template Generation Failed:", err);
      const serverError = err.response?.data?.error;
      if (err.response?.status === 429 || (serverError && serverError.toLowerCase().includes("busy"))) {
        setAiError("AI service is temporarily busy. Please try again in a moment.");
      } else {
        setAiError(serverError || err.message || "Failed to generate template. Please check Replicate configuration.");
      }
    } finally {
      setGeneratingTemplate(false);
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";

      return () => {
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Populate form if we are editing an event
  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title || "",
        description: eventToEdit.description || "",
        eventType: eventToEdit.eventType || "Wedding",
        venue: eventToEdit.venue || "",
        address: eventToEdit.address || "",
        city: eventToEdit.city || "",
        state: eventToEdit.state || "",
        country: eventToEdit.country || "",
        eventDate: eventToEdit.eventDate || "",
        eventTime: eventToEdit.eventTime || "",
        status: eventToEdit.status || "draft",
        coverImage: eventToEdit.coverImage || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        eventType: "Wedding",
        venue: "",
        address: "",
        city: "",
        state: "",
        country: "",
        eventDate: "",
        eventTime: "",
        status: "draft",
        coverImage: "",
      });
    }
    setError(null);
  }, [eventToEdit, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!formData.title.trim()) {
      setError("Event Name (Title) is required.");
      return;
    }
    if (!formData.eventDate) {
      setError("Event Date is required.");
      return;
    }
    if (!formData.eventTime) {
      setError("Event Time is required.");
      return;
    }
    if (!formData.venue.trim()) {
      setError("Venue is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        eventType: formData.eventType || undefined,
        venue: formData.venue.trim(),
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        country: formData.country.trim() || undefined,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        status: formData.status || "draft",
        coverImage: formData.coverImage.trim() || undefined,
      };

      let createdEventId: string | null = null;
      if (isAdmin) {
        if (eventToEdit && eventToEdit.id) {
          await adminService.updateAdminEvent(eventToEdit.id, payload);
          onSuccess("Event updated successfully!");
        } else {
          const res = await adminService.createAdminEvent(payload);
          createdEventId = res?.event?.id || null;
          onSuccess("Event created successfully!");
        }
      } else {
        if (eventToEdit && eventToEdit.id) {
          await eventService.updateEvent(eventToEdit.id, payload);
          onSuccess("Event updated successfully!");
        } else {
          const res = await eventService.createEvent(payload);
          createdEventId = res?.event?.id || null;
          onSuccess("Event created successfully!");
        }
      }
      onClose();
      if (openDesignerAfterSave && createdEventId) {
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("pending_template_id", selectedTemplateId);
            localStorage.setItem("pending_template_id", selectedTemplateId);
          } catch (e) {}
        }
        router.push(`/dashboard/invitations?eventId=${createdEventId}&templateId=${encodeURIComponent(selectedTemplateId)}&studio=true`);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || "An error occurred while saving the event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-[#FAF8F5] w-full max-w-2xl max-h-[90vh] my-auto flex flex-col rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 font-body text-[#2D1B3D]"
          >
            {/* Header */}
            <div className="bg-[#2D1B3D] text-white px-6 py-4 flex items-center justify-between border-b border-[#E8C4B8]/20 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                </div>
                <h3
                  className="text-xl font-semibold font-display tracking-wide"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {eventToEdit ? "Edit Event" : "Create Event"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2 animate-shake flex-shrink-0">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
              {/* Event Name */}
              <div>
                <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                  Event Name <span className="text-[#C9A84C]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="E.g., Sarah & John's Wedding"
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Share details about the event..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                />
              </div>

              {/* Event Type & Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Invitation Template Selection Carousel */}
              {!eventToEdit && (
                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                      <span>Choose Invitation Template</span>
                    </span>
                    <span className="text-[11px] text-[#C9A84C] font-normal">opens in studio</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {NEW_TEMPLATES.filter((t) => t.isPureCss || t.id.startsWith("tpl-golden") || t.id.startsWith("tpl-modern") || t.id.startsWith("tpl-classic") || t.id.startsWith("tpl-retro") || t.id.startsWith("tpl-midnight") || t.id.startsWith("tpl-emerald") || t.id.startsWith("tpl-champagne") || t.id.startsWith("tpl-noir") || t.id.startsWith("tpl-rustic") || t.id.startsWith("tpl-lavender")).slice(0, 10).map((tpl) => {
                      const isSelected = selectedTemplateId === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(tpl.id)}
                          className={`group rounded-xl p-1.5 border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#2D1B3D] ring-2 ring-[#2D1B3D] bg-white shadow-xs"
                              : "border-[#E8C4B8]/40 hover:border-slate-400 bg-white/50"
                          }`}
                        >
                          <div className="w-full rounded-lg overflow-hidden relative mb-1">
                            <EviteCardPreview
                              template={tpl}
                              hoverScale={true}
                            />
                          </div>
                          <p className="text-[10px] font-bold text-[#2D1B3D] truncate">{tpl.title}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Template Generation Section */}
              {!eventToEdit && (
                <div className="border border-dashed border-[#7C3AED]/30 rounded-2xl p-4 bg-gradient-to-br from-[#F5F3FF]/60 to-[#EDE9FE]/40">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center">
                      <Wand2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-[#2D1B3D]">Generate Event with AI</span>
                    <span className="text-[10px] text-[#7C3AED] font-semibold bg-[#EDE9FE] px-1.5 py-0.5 rounded-full">Replicate</span>
                  </div>
                  <p className="text-[11px] text-[#2D1B3D]/50 mb-2.5">
                    Describe your vision and AI will generate a unique invitation background template.
                  </p>

                  {aiError && (
                    <div className="p-2 text-[11px] font-medium bg-red-50 border border-red-200 text-red-700 rounded-xl mb-2.5 flex items-center gap-1.5">
                      <Info className="w-3 h-3 shrink-0" />
                      <span>{aiError}</span>
                      <button onClick={() => setAiError(null)} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="relative bg-white rounded-xl border border-[#E8C4B8]/30 p-2.5 focus-within:border-[#7C3AED]/40 focus-within:ring-1 focus-within:ring-[#7C3AED]/20 transition-all">
                    <textarea
                      rows={2}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleGenerateAITemplate();
                        }
                      }}
                      placeholder="e.g. Elegant floral garden wedding, soft pastel tones, gold accents..."
                      className="w-full bg-transparent text-xs text-[#2D1B3D] placeholder:text-gray-400 focus:outline-none resize-none pr-10 leading-relaxed"
                      disabled={generatingTemplate}
                    />
                    <button
                      onClick={handleGenerateAITemplate}
                      disabled={generatingTemplate}
                      className="absolute right-2 bottom-2 w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white flex items-center justify-center shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      title="Generate with AI"
                    >
                      {generatingTemplate ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3 h-3 -translate-x-0.5 translate-y-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Loading State with Glowing Gradient */}
                  {generatingTemplate && (
                    <div className="mt-3 flex items-center justify-center gap-2 py-3">
                      <div className="relative w-5 h-5">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#7C3AED] animate-spin opacity-60" />
                        <div className="absolute inset-[3px] rounded-full bg-white" />
                        <div className="absolute inset-[5px] rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] animate-pulse" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#7C3AED] animate-pulse">
                        AI is crafting your invitation template...
                      </span>
                    </div>
                  )}

                  {/* Generated Preview */}
                  {aiGeneratedImageUrl && !generatingTemplate && (
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-[#7C3AED]/20">
                      <img
                        src={aiGeneratedImageUrl}
                        alt="AI Generated Template"
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-white text-[10px] font-semibold">
                        AI Generated Background
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGenerateAITemplate}
                    disabled={generatingTemplate}
                    className="mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 group"
                  >
                    {generatingTemplate ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating your template...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Generate Event with AI</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Date <span className="text-[#C9A84C]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                      required
                    />
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-[#C9A84C]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Time <span className="text-[#C9A84C]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                      required
                    />
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-[#C9A84C]" />
                  </div>
                </div>
              </div>

              {/* Venue & Cover Image Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Venue <span className="text-[#C9A84C]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      placeholder="E.g., The Plaza Hall"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                      required
                    />
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#C9A84C]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider">
                      Cover Image
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3" />
                          <span>Upload File</span>
                        </>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleChange}
                      placeholder="Enter public image URL or click Upload File..."
                      className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                    />
                    {formData.coverImage && (
                      <div className="w-9 h-9 rounded-lg border border-[#E8C4B8]/40 overflow-hidden flex-shrink-0 bg-slate-100 relative group">
                        <img
                          src={getImageUrl(formData.coverImage)}
                          alt="Cover"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, coverImage: "" }))}
                          className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                />
              </div>

              {/* City, State, Country Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-[#E8C4B8]/30">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] active:scale-95 transition-all focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => setOpenDesignerAfterSave(false)}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#2D1B3D]/30 rounded-xl hover:bg-slate-100 active:scale-95 transition-all focus:outline-none disabled:opacity-50"
                >
                  {eventToEdit ? "Update Event" : "Create Event Only"}
                </button>
                {!eventToEdit && (
                  <button
                    type="submit"
                    onClick={() => setOpenDesignerAfterSave(true)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-[#FAF8F5] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl active:scale-95 transition-all shadow-md focus:outline-none disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    Create & Design in Studio →
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
