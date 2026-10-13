"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  Share2,
  Copy,
  CheckCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Send,
  Loader2,
  ExternalLink,
  Users,
  CheckCircle2,
  Heart,
  ChevronDown,
} from "lucide-react";
import ExperienceVisual from "@/components/landing/ExperienceVisual";
import { findTemplate, TEMPLATES, IMG } from "@/components/landing/data";
import { submitPublicRsvp } from "@/services/eventService";
import { cn } from "@/lib/utils";

interface PublicLivePreviewViewerProps {
  event: any;
  invitation?: any;
  rsvpSettings?: any;
  guestName?: string;
  guestMode?: boolean;
}

const TEMPLATE_VIDEO_MAP: Record<string, string> = {
  marcus: "/videos/golden-celebration.mp4",
  party: "/videos/celebration-motion.mp4",
  "pumpkin-patch": "/videos/golden-celebration.mp4",
  anniversary: "/videos/golden-celebration.mp4",
  baby: "/videos/golden-celebration.mp4",
  concert: "/videos/celebration-motion.mp4",
  reunion: "/videos/celebration-motion.mp4",
  haunting: "/videos/golden-celebration.mp4",
  jessica: "/videos/golden-celebration.mp4",
  premiere: "/videos/golden-celebration.mp4",
  grad: "/videos/golden-celebration.mp4",
  wedding: "/videos/golden-celebration.mp4",
};

const KIND_PREVIEW_IMG_MAP: Record<string, string> = {
  "then-now": IMG.jessica,
  premiere: IMG.rooftop,
  vhs: IMG.party,
  news: IMG.marcus,
  journey: IMG.oldBeach,
  redcarpet: IMG.corporate,
  golden: IMG.anniversary,
  editorial: IMG.grad,
  romantic: IMG.couple,
  luxury: IMG.anniversary,
  surprise: IMG.concert,
  meme: IMG.party,
};

export default function PublicLivePreviewViewer({
  event,
  invitation,
  rsvpSettings,
  guestName = "",
}: PublicLivePreviewViewerProps) {
  // Extract template configuration from PostgreSQL templateData or canvasState or event columns
  const tData = event?.templateData || event?.canvasState || {};

  const title = event?.title || invitation?.title || "Special Celebration";
  const venue = event?.venue || event?.location || invitation?.eventVenue || "Event Venue";
  const locationAddress = [event?.address, event?.city, event?.state, event?.country].filter(Boolean).join(", ");
  
  // Format Date and Time
  let dateFormatted = "";
  if (event?.eventDate || invitation?.eventDate) {
    const rawD = event?.eventDate || invitation?.eventDate;
    const d = new Date(rawD);
    dateFormatted = isNaN(d.getTime())
      ? String(rawD)
      : d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }

  let timeFormatted = "";
  if (event?.eventTime || invitation?.eventTime) {
    const rawT = event?.eventTime || invitation?.eventTime;
    if (rawT instanceof Date) {
      timeFormatted = rawT.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else {
      timeFormatted = String(rawT).slice(0, 5);
    }
  }

  const whenLabel = [dateFormatted, timeFormatted].filter(Boolean).join(" • ");

  // Styling attributes from templateData or fallbacks
  const selectedFont = tData.selectedFont || invitation?.fontFamily || "Playfair Display";
  const titleColor = tData.titleColor || "#FFFFFF";
  const titleFontSize = tData.titleFontSize || 38;
  const titleLetterSpacing = tData.titleLetterSpacing ?? 2;
  const titleLineHeight = tData.titleLineHeight ?? 1.1;
  const titleFontWeight = tData.titleFontWeight || "800";
  const titleTextShadow = tData.titleTextShadow ?? true;
  const titleAlignment = tData.titleAlignment || "center";

  const datetimeFontSize = tData.datetimeFontSize || 15;
  const datetimeColor = tData.datetimeColor || "#FFFFFF";

  const venueFontSize = tData.venueFontSize || 14;
  const venueColor = tData.venueColor || "rgba(255, 255, 255, 0.85)";

  const textPositions = tData.textPositions || {
    title: { x: 50, y: 32 },
    datetime: { x: 50, y: 50 },
    venue: { x: 50, y: 60 },
  };

  const showTitle = tData.showTitleOnInvite !== false;
  const showDate = tData.showDateOnInvite !== false;
  const showVenue = tData.showVenueOnInvite !== false;

  // Media determination
  const selectedTemplateId =
    tData.selectedTemplateId || event?.selectedTemplateId || invitation?.templateId || null;
  const selectedTemplate = selectedTemplateId
    ? findTemplate(selectedTemplateId) || TEMPLATES.find((t) => t.id === selectedTemplateId) || null
    : null;

  const generatedVideoUrl =
    tData.generatedVideoUrl ||
    event?.videoUrl ||
    (event?.previewUrl && typeof event.previewUrl === "string" && event.previewUrl.endsWith(".mp4") ? event.previewUrl : null) ||
    (event?.coverImage && typeof event.coverImage === "string" && event.coverImage.endsWith(".mp4") ? event.coverImage : null) ||
    (selectedTemplateId ? TEMPLATE_VIDEO_MAP[selectedTemplateId] : null);

  const activeDisplayPhoto =
    (tData.activeDisplayPhoto && !tData.activeDisplayPhoto.endsWith(".mp4") ? tData.activeDisplayPhoto : null) ||
    tData.posterUrl ||
    tData.generatedImageUrl ||
    tData.userPhoto ||
    (event?.coverImage && !event.coverImage.endsWith(".mp4") ? event.coverImage : null) ||
    invitation?.imageUrl ||
    (selectedTemplate
      ? "img" in selectedTemplate.preview
        ? selectedTemplate.preview.img
        : "kind" in selectedTemplate.preview
        ? KIND_PREVIEW_IMG_MAP[selectedTemplate.preview.kind] || IMG.marcus
        : null
      : null) ||
    "/images/marcus.webp";

  const isVideoFormat =
    tData.inviteFormat === "video" ||
    event?.isVideo ||
    Boolean(generatedVideoUrl) ||
    (selectedTemplate && "kind" in selectedTemplate.preview);

  // Video Controls State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // RSVP Form State
  const [rsvpStatus, setRsvpStatus] = useState<"ATTENDING" | "MAYBE" | "DECLINED">("ATTENDING");
  const [guestNameInput, setGuestNameInput] = useState(guestName || "");
  const [guestEmailInput, setGuestEmailInput] = useState("");
  const [adultsCount, setAdultsCount] = useState(1);
  const [dietaryPreference, setDietaryPreference] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpSuccessMessage, setRsvpSuccessMessage] = useState("");
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  // Link copy state
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmailInput || !guestEmailInput.trim()) {
      setRsvpError("Please provide your email address to submit RSVP.");
      return;
    }

    setIsSubmittingRsvp(true);
    setRsvpError(null);

    try {
      const res = await submitPublicRsvp(event.id || event.shareSlug, {
        name: guestNameInput.trim() || undefined,
        email: guestEmailInput.trim(),
        rsvpStatus,
        adultsCount,
        dietaryPreference: dietaryPreference || undefined,
        specialDietaryRequests: specialRequests || undefined,
      });

      if (res.success) {
        setRsvpSubmitted(true);
        setRsvpSuccessMessage(
          res.message || `Thank you! Your RSVP (${rsvpStatus}) has been confirmed.`
        );
      } else {
        setRsvpError("Could not submit RSVP. Please try again.");
      }
    } catch (err: any) {
      console.error("RSVP Submission Error:", err);
      setRsvpError(err?.response?.data?.error || "Failed to submit RSVP. Please check your connection.");
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a0e] text-white selection:bg-amber-400 selection:text-black">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[130px]" />
      </div>

      {/* Top Header / Branding Bar */}
      <header className="relative z-10 border-b border-white/10 bg-[#070a0e]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-extrabold text-sm shadow-[0_0_15px_rgba(251,191,36,0.4)]">
            I
          </span>
          <span className="font-extrabold tracking-tight text-base sm:text-lg">InviteHub</span>
          <span className="ml-2 hidden sm:inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-white/10">
            Live Invitation
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer"
          >
            {copied ? <CheckCheck className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Share Link"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Recipient Welcome Pill */}
        {guestName && (
          <div className="mb-6 text-center animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-300 shadow-sm">
              <Sparkles className="size-3 text-amber-400" />
              Special Invitation for {guestName}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ========================================================= */}
          {/* LEFT: EXACT LIVE PREVIEW (9:16 VERTICAL MOBILE FRAME)     */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col items-center">
            
            <div className="w-full max-w-[340px] sm:max-w-[380px] flex items-center justify-between mb-3 text-xs text-white/60">
              <span className="font-extrabold uppercase tracking-wider text-[11px] text-amber-400/90 flex items-center gap-1">
                <Sparkles className="size-3 text-amber-400" />
                Live Invitation Card
              </span>
              <button
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="inline-flex items-center gap-1 hover:text-white transition cursor-pointer"
                title={isFullScreen ? "Exit Fullscreen" : "Fullscreen View"}
              >
                {isFullScreen ? (
                  <>
                    <Minimize2 className="size-3.5" />
                    <span>Card View</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="size-3.5" />
                    <span>Expand</span>
                  </>
                )}
              </button>
            </div>

            {/* The 9:16 Responsive Mobile Mockup Frame */}
            <div
              className={cn(
                "relative aspect-[9/16] overflow-hidden rounded-[2.5rem] border-4 border-white/20 bg-[#070a0e] shadow-[0_30px_70px_rgba(0,0,0,0.85)] transition-all duration-300 shrink-0",
                isFullScreen
                  ? "fixed inset-4 sm:inset-10 z-50 aspect-auto max-w-none rounded-3xl"
                  : "w-full max-w-[340px] sm:max-w-[380px]"
              )}
            >
              {/* Media Background */}
              {generatedVideoUrl ? (
                <video
                  ref={videoRef}
                  key={generatedVideoUrl}
                  src={generatedVideoUrl}
                  autoPlay
                  loop
                  playsInline
                  muted={isMuted}
                  className="absolute inset-0 size-full object-cover"
                />
              ) : selectedTemplate && "kind" in selectedTemplate.preview ? (
                <ExperienceVisual
                  kind={selectedTemplate.preview.kind}
                  photo={tData.userPhoto || undefined}
                  playing={isPlaying}
                  className="absolute inset-0"
                />
              ) : (
                <img
                  src={activeDisplayPhoto}
                  alt={title}
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 hover:scale-105"
                />
              )}

              {/* Dark Gradient Vignette for Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40 pointer-events-none" />

              {/* Top Floating Badge */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-amber-300 border border-white/10 shadow-lg">
                  <Sparkles className="size-3 text-amber-400" />
                  {isVideoFormat ? "AI Video Invite" : "Interactive Invite"}
                </span>
              </div>

              {/* Video Floating Controls */}
              {(generatedVideoUrl || (selectedTemplate && "kind" in selectedTemplate.preview)) && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isPlaying;
                      setIsPlaying(next);
                      if (videoRef.current) {
                        if (next) videoRef.current.play().catch(() => {});
                        else videoRef.current.pause();
                      }
                    }}
                    className="grid size-7 place-items-center rounded-full bg-black/75 backdrop-blur-md text-white/90 hover:text-white transition cursor-pointer border border-white/10"
                    aria-label={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
                  </button>
                  {generatedVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="grid size-7 place-items-center rounded-full bg-black/75 backdrop-blur-md text-white/90 hover:text-white transition cursor-pointer border border-white/10"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
                    </button>
                  )}
                </div>
              )}

              {/* Dynamic Live Text Overlays */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                {showTitle && title && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${textPositions.title.x}%`,
                      top: `${textPositions.title.y}%`,
                      transform: "translate(-50%, -50%)",
                      width: "88%",
                      textAlign: titleAlignment,
                    }}
                  >
                    <h1
                      style={{
                        fontFamily: selectedFont,
                        fontSize: `${titleFontSize}px`,
                        color: titleColor,
                        letterSpacing: `${titleLetterSpacing}px`,
                        lineHeight: titleLineHeight,
                        fontWeight: titleFontWeight,
                        textShadow: titleTextShadow
                          ? "0 2px 4px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)"
                          : "none",
                        textTransform: "uppercase",
                      }}
                    >
                      {title}
                    </h1>
                  </div>
                )}

                {showDate && whenLabel && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${textPositions.datetime.x}%`,
                      top: `${textPositions.datetime.y}%`,
                      transform: "translate(-50%, -50%)",
                      width: "88%",
                      textAlign: titleAlignment,
                    }}
                  >
                    <p
                      style={{
                        fontSize: `${datetimeFontSize}px`,
                        color: datetimeColor,
                        fontWeight: "600",
                        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                      }}
                    >
                      {whenLabel}
                    </p>
                  </div>
                )}

                {showVenue && venue && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${textPositions.venue.x}%`,
                      top: `${textPositions.venue.y}%`,
                      transform: "translate(-50%, -50%)",
                      width: "88%",
                      textAlign: titleAlignment,
                    }}
                  >
                    <p
                      style={{
                        fontSize: `${venueFontSize}px`,
                        color: venueColor,
                        fontWeight: "500",
                        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                      }}
                    >
                      {venue}
                    </p>
                  </div>
                )}

                {/* Bottom Signature Tag */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-8 z-10 pointer-events-none"
                  style={{ textAlign: titleAlignment }}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-400 block drop-shadow-md">
                    YOU'RE INVITED
                  </span>
                </div>
              </div>
            </div>

            {/* Hint below mockup */}
            <p className="mt-3 text-xs text-white/50 text-center">
              Tap or toggle audio to experience the full animated invite
            </p>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: EVENT DETAILS & INTERACTIVE RSVP RESPONSE FORM      */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Event Summary Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-5">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                  Event Details
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                  {title}
                </h2>
                {event?.hostName && (
                  <p className="text-xs text-white/60 mt-0.5">
                    Hosted by <span className="text-amber-300 font-bold">{event.hostName}</span>
                  </p>
                )}
              </div>

              {event?.description && (
                <p className="text-sm leading-relaxed text-white/80 border-l-2 border-amber-400/60 pl-3.5 py-0.5">
                  {event.description}
                </p>
              )}

              {/* Date, Time & Venue Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="flex items-start gap-3 rounded-2xl bg-black/40 border border-white/5 p-3.5">
                  <div className="grid size-9 place-items-center rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Date & Time
                    </span>
                    <span className="text-xs font-bold text-white block mt-0.5 leading-snug">
                      {dateFormatted || "Date announced soon"}
                    </span>
                    {timeFormatted && (
                      <span className="text-[11px] text-amber-300/90 font-medium block">
                        {timeFormatted}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-black/40 border border-white/5 p-3.5">
                  <div className="grid size-9 place-items-center rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
                    <MapPin className="size-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Location
                    </span>
                    <span className="text-xs font-bold text-white block mt-0.5 leading-snug">
                      {venue}
                    </span>
                    {locationAddress && (
                      <span className="text-[11px] text-white/60 block line-clamp-1">
                        {locationAddress}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RSVP Submission Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                    RSVP Response
                  </span>
                  {rsvpSettings?.rsvpDeadline && (
                    <span className="text-[10px] text-white/50">
                      Deadline: {rsvpSettings.rsvpDeadline}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold tracking-tight mt-0.5 text-white">
                  Will you be joining us?
                </h3>
              </div>

              {rsvpSubmitted ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center space-y-3 animate-fade-in">
                  <div className="grid size-12 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-white">RSVP Received!</h4>
                  <p className="text-xs text-white/80 max-w-sm mx-auto">
                    {rsvpSuccessMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRsvpSubmitted(false)}
                    className="text-xs font-bold text-amber-300 underline hover:text-amber-200 transition"
                  >
                    Update response
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-4">
                  {/* Status Selection Buttons */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRsvpStatus("ATTENDING")}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 border text-xs font-bold transition cursor-pointer",
                        rsvpStatus === "ATTENDING"
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                          : "border-white/10 bg-black/30 text-white/70 hover:border-white/20 hover:text-white"
                      )}
                    >
                      <Check className="size-4" />
                      <span>Attending</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRsvpStatus("MAYBE")}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 border text-xs font-bold transition cursor-pointer",
                        rsvpStatus === "MAYBE"
                          ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                          : "border-white/10 bg-black/30 text-white/70 hover:border-white/20 hover:text-white"
                      )}
                    >
                      <Sparkles className="size-4" />
                      <span>Maybe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRsvpStatus("DECLINED")}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 border text-xs font-bold transition cursor-pointer",
                        rsvpStatus === "DECLINED"
                          ? "border-rose-400 bg-rose-500/20 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                          : "border-white/10 bg-black/30 text-white/70 hover:border-white/20 hover:text-white"
                      )}
                    >
                      <X className="size-4" />
                      <span>Decline</span>
                    </button>
                  </div>

                  {/* Guest Name & Email Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-white/60 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={guestNameInput}
                        onChange={(e) => setGuestNameInput(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/60 mb-1">
                        Email Address <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmailInput}
                        onChange={(e) => setGuestEmailInput(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* +1 Counter & Dietary Requirements */}
                  {rsvpStatus === "ATTENDING" && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between rounded-xl bg-black/30 border border-white/10 px-3.5 py-2">
                        <span className="text-xs text-white/80 font-medium">Total Guests (+1s)</span>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setAdultsCount((prev) => Math.max(1, prev - 1))}
                            className="size-6 rounded-lg bg-white/10 hover:bg-white/20 grid place-items-center text-xs font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold min-w-4 text-center">{adultsCount}</span>
                          <button
                            type="button"
                            onClick={() => setAdultsCount((prev) => Math.min(5, prev + 1))}
                            className="size-6 rounded-lg bg-white/10 hover:bg-white/20 grid place-items-center text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-white/60 mb-1">
                          Dietary Preferences (Optional)
                        </label>
                        <input
                          type="text"
                          value={dietaryPreference}
                          onChange={(e) => setDietaryPreference(e.target.value)}
                          placeholder="Vegetarian, Gluten-free, Vegan, None"
                          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {rsvpError && (
                    <p className="text-xs text-rose-400 font-semibold">{rsvpError}</p>
                  )}

                  {/* Submit RSVP Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingRsvp}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 py-3 text-xs sm:text-sm font-extrabold text-black transition hover:bg-amber-300 active:scale-98 shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-pointer disabled:opacity-60"
                  >
                    {isSubmittingRsvp ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Submitting response...</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        <span>Confirm RSVP</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
