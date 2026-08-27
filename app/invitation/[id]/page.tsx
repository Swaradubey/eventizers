"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Send,
  Share2,
  CalendarPlus,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import invitationService from "@/services/invitationService";
import { getImageUrl } from "@/utils/imageUrl";
import { NEW_TEMPLATE_IMAGES } from "@/lib/newTemplatesData";

const getTemplateImage = (templateId?: string | null) => {
  if (!templateId) return null;
  const mapping: Record<string, string> = {
    "tpl-birthday-maya": "/assets/templates/birthday.jpg",
    "tpl-wedding-liam": "/assets/templates/wedding.jpg",
    "tpl-corporate-launch": "/assets/templates/corporate.jpg",
    "tpl-dinner-party": "/assets/templates/dinner.jpg",
    "tpl-baby-shower": "/assets/templates/babyshower.jpg",
    "tpl-charity-gala": "/assets/templates/gala.jpg",
    "tpl-live-music": "/assets/templates/music.jpg",
    "tpl-anniversary-james": "/assets/templates/anniversary.jpg",
    "tpl-grad-gala": "/assets/templates/graduation_gala.jpg",
    "tpl-grad-class2026": "/assets/templates/graduation_class_2026.jpg",
    "tpl-grad-degree": "/assets/templates/graduation_degree.jpg",
    "tpl-comm-meetup": "/assets/templates/community_meetup.jpg",
    "tpl-comm-celebration": "/assets/templates/community_celebration.jpg",
    "tpl-comm-volunteer": "/assets/templates/community_volunteer.jpg",
    "tpl-net-professional": "/assets/templates/networking_professional.jpg",
    "tpl-net-founders": "/assets/templates/networking_founders.jpg",
    "tpl-net-connections": "/assets/templates/networking_connections.jpg",
    ...NEW_TEMPLATE_IMAGES,
  };
  return mapping[templateId] || null;
};

export default function PublicInvitationPage() {
  const params = useParams();
  const invitationId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [eventData, setEventData] = useState<any>(null);

  // RSVP Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<"confirmed" | "declined">("confirmed");
  const [submitting, setSubmitting] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpFeedback, setRsvpFeedback] = useState<string | null>(null);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  // Copy share link state
  const [copied, setCopied] = useState(false);

  // Cover image error state for graceful fallback
  const [coverImgError, setCoverImgError] = useState(false);

  useEffect(() => {
    if (!invitationId) return;

    const fetchPublicInvitation = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await invitationService.getPublicInvitation(invitationId);
        if (res.success && res.invitation) {
          setInvitation(res.invitation);
          setEventData(res.event);
        } else {
          setError(res.error || "Invitation not found.");
        }
      } catch (err: any) {
        console.error("Error loading public invitation:", err);
        setError("Unable to load event invitation. Please check the link.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicInvitation();
  }, [invitationId]);

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setRsvpError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setRsvpError("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);
      setRsvpError(null);
      const res = await invitationService.submitPublicRSVP({
        eventId: invitation?.eventId || eventData?.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        rsvpStatus,
      });

      if (res.success) {
        setRsvpSubmitted(true);
        setRsvpFeedback(res.message || "Your RSVP response has been submitted!");
      } else {
        setRsvpError(res.message || "Failed to submit RSVP. Please try again.");
      }
    } catch (err: any) {
      console.error("RSVP Submission Error:", err);
      setRsvpError(err.response?.data?.error || "Error submitting your response.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const generateGoogleCalendarUrl = () => {
    if (!eventData) return "#";
    const title = encodeURIComponent(invitation?.title || eventData.title || "Event");
    const details = encodeURIComponent(invitation?.mainText || eventData.description || "");
    const location = encodeURIComponent(eventData.venue ? `${eventData.venue}, ${eventData.city || ""}` : "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  const formatEventDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatEventTime = (timeStr?: string) => {
    if (!timeStr) return null;
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
    return timeStr;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 border-4 border-[#2D1B3D]/20 border-t-[#2D1B3D] rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-[#2D1B3D]/70">Loading invitation...</p>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#2D1B3D] mb-2">Invitation Not Found</h2>
        <p className="text-sm text-[#2D1B3D]/60 max-w-md mb-6">{error || "This invitation link may be invalid or has been removed."}</p>
      </div>
    );
  }

  // Dynamic style variables
  const bgColor = invitation?.backgroundColor || "#FAF8F5";
  const textColor = invitation?.textColor || "#1A1118";
  const accentColor = invitation?.accentColor || "#C9A84C";
  const buttonColor = invitation?.buttonColor || "#2D1B3D";
  const buttonRadius = invitation?.buttonRadius !== undefined ? `${invitation.buttonRadius}px` : "12px";
  const titleSize = invitation?.titleSize ? `${Math.min(invitation.titleSize, 56)}px` : "40px";
  const textAlignment = (invitation?.textAlignment || "center") as any;
  const fontFamily = invitation?.fontFamily === "Playfair Display" ? "'Playfair Display', serif" : invitation?.fontFamily || "sans-serif";

  const fullVenueLocation = [
    eventData.venue,
    eventData.address,
    eventData.city,
    eventData.state,
    eventData.country,
  ]
    .filter(Boolean)
    .join(", ");

  // Resolve clean raw artwork (avoiding snapshot images with baked-in text)
  const getCleanCoverImage = () => {
    const rawImg = invitation?.imageUrl || eventData?.coverImage;
    const tplImg = getTemplateImage(eventData?.selectedTemplateId);

    // If raw image contains snapshot or data: URL, fall back to clean template artwork
    if (rawImg && (rawImg.includes("snapshot") || rawImg.startsWith("data:"))) {
      return tplImg || null;
    }

    return rawImg || tplImg || null;
  };

  const rawCover = getCleanCoverImage();
  const coverImage = rawCover ? getImageUrl(rawCover) : null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/5"
      >
        {/* Header Cover Image */}
        {coverImage && !coverImgError && (
          <div className="relative w-full overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={coverImage}
              alt="Invitation Cover"
              className="w-full h-auto object-contain block"
              onError={() => setCoverImgError(true)}
            />
          </div>
        )}
        {coverImage && coverImgError && (
          <div className="w-full h-48 bg-gradient-to-br from-[#2D1B3D]/8 to-transparent flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#2D1B3D]/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[#2D1B3D]/30" />
            </div>
            <p className="text-xs text-[#2D1B3D]/30 italic">Cover image could not be loaded</p>
          </div>
        )}

        {/* Invitation Content Section */}
        <div className="p-8 sm:p-12 space-y-8" style={{ textAlign: textAlignment }}>

          {/* Invitation Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>You're Cordially Invited</span>
          </div>

          {/* 1. [Event Title & Subtitle] */}
          <div>
            <h1
              className="font-bold tracking-tight leading-tight"
              style={{
                fontSize: titleSize,
                fontFamily: fontFamily,
                fontWeight: invitation?.fontWeight || "700",
                color: textColor,
              }}
            >
              {invitation?.title || eventData.title}
            </h1>

            {/* Event Name / Subtitle */}
            {(invitation?.subtitle || eventData.eventType) && (
              <p className="mt-3 text-lg font-semibold opacity-80" style={{ color: accentColor }}>
                {invitation?.subtitle || eventData.eventType}
              </p>
            )}
          </div>

          {/* 2. [Event Description] */}
          {(invitation?.mainText || eventData.description) && (
            <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-black/5 text-sm sm:text-base leading-relaxed opacity-90">
              {invitation?.mainText || eventData.description}
            </div>
          )}

          {/* 3. [RSVP Button / Action Card] */}
          <div className="pt-2 text-left">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 font-display">RSVP & Attendance</h2>
              <p className="text-xs text-gray-500 mt-1">Please confirm whether you will be joining us</p>
            </div>

            {rsvpSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3"
              >
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">RSVP Confirmed!</h3>
                <p className="text-sm text-emerald-800 font-medium">{rsvpFeedback}</p>
                <button
                  onClick={() => setRsvpSubmitted(false)}
                  className="text-xs font-semibold text-emerald-700 underline pt-2 hover:text-emerald-900"
                >
                  Update Response
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleRSVPSubmit} className="space-y-4">
                {rsvpError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{rsvpError}</span>
                  </div>
                )}

                {/* RSVP Choice Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRsvpStatus("confirmed")}
                    className={`py-3.5 px-4 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      rsvpStatus === "confirmed"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <CheckCircle className={`w-4 h-4 ${rsvpStatus === "confirmed" ? "text-emerald-600" : "text-gray-400"}`} />
                    Yes, I'll attend
                  </button>

                  <button
                    type="button"
                    onClick={() => setRsvpStatus("declined")}
                    className={`py-3.5 px-4 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      rsvpStatus === "declined"
                        ? "border-rose-600 bg-rose-50 text-rose-900 shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <XCircle className={`w-4 h-4 ${rsvpStatus === "declined" ? "text-rose-600" : "text-gray-400"}`} />
                    Regretfully Decline
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D1B3D] text-gray-900"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex@example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D1B3D] text-gray-900"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 000-0000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D1B3D] text-gray-900"
                  />
                </div>

                {/* Submit RSVP Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{
                    backgroundColor: buttonColor,
                    borderRadius: buttonRadius,
                  }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Submitting RSVP...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {invitation?.buttonText || "Submit RSVP"}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* 4. [Date, Time, Location & Event Details Card] */}
          <div className="bg-[#FAF8F5] border border-black/5 rounded-2xl p-6 sm:p-8 space-y-5 text-left shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Event Details</h3>

            {/* Date */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white text-[#2D1B3D] shadow-sm border border-black/5">
                <Calendar className="w-5 h-5" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Date</p>
                <p className="text-base font-bold text-gray-900">
                  {formatEventDate(eventData.eventDate) || "Date to be announced"}
                </p>
              </div>
            </div>

            {/* Time */}
            {eventData.eventTime && (
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white text-[#2D1B3D] shadow-sm border border-black/5">
                  <Clock className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Time</p>
                  <p className="text-base font-bold text-gray-900">
                    {formatEventTime(eventData.eventTime)}
                  </p>
                </div>
              </div>
            )}

            {/* Venue & Location */}
            {eventData.venue && (
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white text-[#2D1B3D] shadow-sm border border-black/5">
                  <MapPin className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Venue / Location</p>
                  <p className="text-base font-bold text-gray-900">{eventData.venue}</p>
                  {fullVenueLocation && (
                    <p className="text-xs text-gray-600 mt-0.5">{fullVenueLocation}</p>
                  )}
                  {/* Google Maps link */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullVenueLocation || eventData.venue)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold mt-2 hover:underline"
                    style={{ color: accentColor }}
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons (Add to Calendar, Share Link) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={generateGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <CalendarPlus className="w-4 h-4 text-emerald-600" />
              Add to Google Calendar
            </a>

            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-amber-600" />}
              {copied ? "Link Copied!" : "Share Invitation"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100 text-xs text-gray-400">
          Powered by <span className="font-semibold text-gray-600">InviteHub</span> • Event Management System
        </div>
      </motion.div>
    </div>
  );
}
