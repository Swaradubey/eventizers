"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, MapPin, User, Send } from "lucide-react";
import InvitationCanvasStage from "./InvitationCanvasStage";
import { StudioDesignState } from "./InvitationStudio";

interface HostDetailsData {
  name: string;
  phone?: string;
  coHost?: string;
}

interface RsvpOptionsState {
  allowMaybe: boolean;
  [key: string]: any;
}

interface CanvasPreset {
  id: string;
  label: string;
  aspect: string;
  maxW: number;
  isLandscape: boolean;
}

interface FullScreenCardPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  activePreset: CanvasPreset;
  designState: StudioDesignState;
  hostDetails?: HostDetailsData;
  rsvpOptions: RsvpOptionsState;
  selectedGuestIds: string[];
  canvasZoom: number;
  onSendToGuests: () => void;
}

export default function FullScreenCardPreview({
  isOpen,
  onClose,
  activePreset,
  designState,
  hostDetails,
  rsvpOptions,
  selectedGuestIds,
  canvasZoom,
  onSendToGuests,
}: FullScreenCardPreviewProps) {
  const { eventDetails } = designState;

  const displayDate = (() => {
    if (!eventDetails.date && !eventDetails.time) return null;
    const parts: string[] = [];
    if (eventDetails.date) {
      try {
        const d = new Date(eventDetails.date + "T00:00:00");
        parts.push(
          d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        );
      } catch {
        parts.push(eventDetails.date);
      }
    }
    if (eventDetails.time) {
      try {
        const [h, m] = eventDetails.time.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        parts.push(`${h12}:${String(m).padStart(2, "0")} ${ampm}`);
      } catch {
        parts.push(eventDetails.time);
      }
    }
    return parts.join(" at ");
  })();

  const displayName =
    hostDetails?.name || eventDetails.host || "SWARA KUMARI";
  const displayLocation =
    eventDetails.venue || eventDetails.address || null;

  const formatTime = (time: string) => {
    try {
      const [h, m] = time.split(":").map(Number);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    } catch {
      return time;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl max-h-[95vh] bg-[#FAF7F2] rounded-3xl shadow-2xl shadow-stone-300/50 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Floating Header ── */}
            <div className="px-6 py-3.5 bg-white/80 backdrop-blur-md border-b border-stone-200/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-stone-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-800 leading-tight">
                    Card Preview
                  </h3>
                  <span className="hidden sm:inline text-[11px] text-stone-400 font-medium">
                    {activePreset.label}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Close Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Scrollable Stage ── */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col items-center">
              {/* ── Card + Envelope Stage ── */}
              <div className="w-full flex items-center justify-center">
                <div
                  className="w-full rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100/60 p-4 sm:p-8"
                  style={{
                    maxWidth: `${Math.min(
                      Math.max(activePreset.maxW + 60, 540),
                      720
                    )}px`,
                  }}
                >
                  <div className="w-full shadow-2xl shadow-stone-300/60 rounded-xl overflow-hidden">
                    <InvitationCanvasStage
                      config={{
                        ...designState,
                        selectedTextId: null,
                      }}
                      zoom={Math.min(canvasZoom, 100)}
                      maxW={activePreset.maxW}
                      aspectRatio={activePreset.aspect}
                      readOnly={true}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* ── Event Details Cards ── */}
              <div
                className="w-full mt-6 space-y-3"
                style={{
                  maxWidth: `${Math.min(
                    Math.max(activePreset.maxW + 60, 540),
                    720
                  )}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Date & Time */}
                <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-1.5">
                    Date &amp; Time
                  </p>
                  <p className="text-base font-medium text-stone-800">
                    {displayDate || (
                      <span className="text-stone-300 font-normal italic">
                        Pick a date &amp; time
                      </span>
                    )}
                  </p>
                  {eventDetails.time && (
                    <p className="text-sm text-stone-400 mt-1">
                      Start time: {formatTime(eventDetails.time)}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-1.5">
                    Location
                  </p>
                  {displayLocation ? (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-stone-300 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-base font-medium text-stone-800">
                          {displayLocation}
                        </p>
                        {eventDetails.address &&
                          eventDetails.venue &&
                          eventDetails.address !== eventDetails.venue && (
                            <p className="text-sm text-stone-400 mt-0.5">
                              {eventDetails.address}
                            </p>
                          )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            eventDetails.address ||
                              eventDetails.venue ||
                              ""
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-stone-500 font-medium hover:text-stone-700 hover:underline inline-flex items-center gap-0.5 mt-1.5 transition-colors"
                        >
                          View on map
                          <svg
                            className="w-3 h-3 ml-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-stone-300 font-normal italic text-sm">
                      Add a venue or address
                    </p>
                  )}
                </div>

                {/* Host Details */}
                <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-1.5">
                    Host Details
                  </p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-300" />
                    <p className="text-base font-medium text-stone-800 uppercase tracking-wide">
                      {displayName}
                    </p>
                  </div>
                  {hostDetails?.phone && (
                    <p className="text-sm text-stone-400 mt-1 ml-6">
                      Phone: {hostDetails.phone}
                    </p>
                  )}
                  {hostDetails?.coHost && (
                    <p className="text-sm text-stone-400 mt-0.5 ml-6">
                      Co-host: {hostDetails.coHost}
                    </p>
                  )}
                  {eventDetails.description && (
                    <p className="text-sm text-stone-400 mt-2 ml-6 italic leading-relaxed">
                      &ldquo;{eventDetails.description}&rdquo;
                    </p>
                  )}
                </div>

                {/* RSVP */}
                <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-3">
                    RSVP
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-stone-800 text-white">
                      Yes
                    </span>
                    {rsvpOptions.allowMaybe && (
                      <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-500 border border-stone-200">
                        Maybe
                      </span>
                    )}
                    <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-500 border border-stone-200">
                      No
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Send Button ── */}
              <div className="mt-6 flex items-center justify-center pb-4">
                <button
                  type="button"
                  onClick={onSendToGuests}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-stone-800 hover:bg-stone-900 rounded-xl transition-all shadow-md shadow-stone-300/40 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send to Guests ({selectedGuestIds.length})</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
