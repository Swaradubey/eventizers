"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Monitor, Smartphone, User, Users, MapPin } from "lucide-react";
import InvitationCanvasStage from "./InvitationCanvasStage";
import { StudioDesignState, teardownCanvasTextLayers } from "./InvitationStudio";
import { deduplicateTextLayers } from "./layoutUtils";
import { HostDetailsData } from "./InvitationWorkflowDetails";

interface InvitationWorkflowPreviewPaneProps {
  designState: StudioDesignState;
  allowMaybe?: boolean;
  hostDetails?: HostDetailsData;
  onRsvpClick?: (status: "yes" | "maybe" | "no") => void;
  guestCount?: number;
}

export default function InvitationWorkflowPreviewPane({
  designState,
  allowMaybe = true,
  hostDetails,
  onRsvpClick,
  guestCount = 0,
}: InvitationWorkflowPreviewPaneProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [selectedRsvp, setSelectedRsvp] = useState<"yes" | "maybe" | "no" | null>(null);

  const cleanConfig = useMemo(() => ({
    ...designState,
    textLayers: deduplicateTextLayers(designState.textLayers || []),
  }), [designState]);

  useEffect(() => {
    if (!allowMaybe && selectedRsvp === "maybe") {
      setSelectedRsvp(null);
    }
  }, [allowMaybe, selectedRsvp]);

  const handleRsvp = (status: "yes" | "maybe" | "no") => {
    setSelectedRsvp(status);
    if (onRsvpClick) onRsvpClick(status);
  };

  const { eventDetails } = designState;

  const formatDisplayDate = (date: string, time: string) => {
    if (!date && !time) return null;
    const parts: string[] = [];
    if (date) {
      try {
        const d = new Date(date + "T00:00:00");
        parts.push(d.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }));
      } catch {
        parts.push(date);
      }
    }
    if (time) {
      try {
        const [h, m] = time.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        parts.push(`${h12}:${String(m).padStart(2, "0")} ${ampm}`);
      } catch {
        parts.push(time);
      }
    }
    return parts.join(" at ");
  };

  const displayDateTime = formatDisplayDate(eventDetails.date, eventDetails.time);
  const displayName = hostDetails?.name || eventDetails.host || "SWARA KUMARI";
  const displayLocation = eventDetails.venue || eventDetails.address || null;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f4f1] border-r border-slate-200/90 overflow-hidden select-none relative">
      {/* Top View Mode Switcher */}
      <div className="h-11 bg-white/90 backdrop-blur-xs border-b border-slate-200/80 px-4 flex items-center justify-center gap-4 flex-shrink-0 z-10 shadow-2xs">
        <button
          type="button"
          onClick={() => setViewMode("desktop")}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            viewMode === "desktop"
              ? "text-slate-900 bg-slate-100 ring-1 ring-slate-300 font-bold"
              : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
          }`}
          title="Desktop preview"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setViewMode("mobile")}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            viewMode === "mobile"
              ? "text-slate-900 bg-slate-100 ring-1 ring-slate-300 font-bold"
              : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
          }`}
          title="Mobile preview"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>

      {/* Center Invitation Card Stage + Event Details Sections */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pt-3 flex flex-col items-center relative">
        {/* Card Preview */}
        <div className="w-full flex items-center justify-center mb-4">
          {viewMode === "desktop" ? (
            <div className="w-full max-w-[460px] flex items-center justify-center transition-all duration-300">
              <div className="w-full shadow-2xl rounded-2xl overflow-hidden border border-slate-200/80 bg-white">
                <InvitationCanvasStage
                  key={`workflow-preview-desktop-${cleanConfig.activeTemplateId || cleanConfig.templateId || "card"}-${(cleanConfig.textLayers || []).length}-${(cleanConfig.textLayers || []).map((l: any) => l.id || "").join("_")}`}
                  config={cleanConfig}
                  readOnly={true}
                  maxW={460}
                  zoom={100}
                  aspectRatio="5/7"
                  className="w-full !p-0"
                />
              </div>
            </div>
          ) : (
            <div className="w-[320px] rounded-[36px] p-2.5 bg-slate-900 shadow-2xl ring-1 ring-slate-800/80 transition-all duration-300">
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />
              <div className="rounded-[26px] overflow-hidden bg-white max-h-[520px] overflow-y-auto">
                <InvitationCanvasStage
                  key={`workflow-preview-mobile-${cleanConfig.activeTemplateId || cleanConfig.templateId || "card"}-${(cleanConfig.textLayers || []).length}-${(cleanConfig.textLayers || []).map((l: any) => l.id || "").join("_")}`}
                  config={cleanConfig}
                  readOnly={true}
                  maxW={300}
                  zoom={90}
                  aspectRatio="5/7"
                  className="w-full !p-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Event Details Sections - Live Synced from Edit Panel */}
        <div className="w-full max-w-[460px] space-y-3 pb-4">
          {/* Date & Time Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 px-5 py-4 shadow-sm">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
              Date &amp; Time
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {displayDateTime || (
                <span className="text-slate-400 font-normal italic">Pick a date &amp; time</span>
              )}
            </p>
            {eventDetails.time && (
              <p className="text-[11px] text-slate-500 mt-1">
                Start time: {(() => {
                  try {
                    const [h, m] = eventDetails.time.split(":").map(Number);
                    const ampm = h >= 12 ? "PM" : "AM";
                    const h12 = h % 12 || 12;
                    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
                  } catch { return eventDetails.time; }
                })()}
              </p>
            )}
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 px-5 py-4 shadow-sm">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
              Location
            </p>
            {displayLocation ? (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{displayLocation}</p>
                  {eventDetails.address && eventDetails.venue && eventDetails.address !== eventDetails.venue && (
                    <p className="text-xs text-slate-500 mt-0.5">{eventDetails.address}</p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventDetails.address || eventDetails.venue || "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#3e5622] font-semibold hover:underline inline-flex items-center gap-0.5 mt-1"
                  >
                    View on map
                    <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 font-normal italic text-sm">Add a venue or address</p>
            )}
          </div>

          {/* Host Details Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 px-5 py-4 shadow-sm">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
              Host Details
            </p>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-600" />
              <p className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                {displayName}
              </p>
            </div>
            {hostDetails?.phone && (
              <p className="text-xs text-slate-500 mt-1 ml-6">
                Phone: {hostDetails.phone}
              </p>
            )}
            {hostDetails?.coHost && (
              <p className="text-xs text-slate-500 mt-0.5 ml-6">
                Co-host: {hostDetails.coHost}
              </p>
            )}
            {designState.eventDetails.description && (
              <p className="text-xs text-slate-500 mt-1.5 ml-6 italic leading-relaxed">
                &ldquo;{designState.eventDetails.description}&rdquo;
              </p>
            )}
          </div>

          {/* Guest List & RSVP Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 px-5 py-4 shadow-sm">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
              Guest List &amp; RSVP
            </p>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="flex-1">
                {guestCount > 0 ? (
                  <p className="text-sm font-semibold text-slate-800">
                    {guestCount} guest{guestCount !== 1 ? "s" : ""} invited
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Guests will appear here once added.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">RSVP:</span>
              <button
                type="button"
                className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${
                  selectedRsvp === "yes"
                    ? "bg-[#273815] text-white ring-1 ring-[#3e5622]"
                    : "bg-[#3e5622]/10 text-[#3e5622] hover:bg-[#3e5622]/20"
                }`}
                onClick={() => handleRsvp("yes")}
              >
                Yes
              </button>
              {allowMaybe && (
                <button
                  type="button"
                  className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${
                    selectedRsvp === "maybe"
                      ? "bg-[#273815] text-white ring-1 ring-[#3e5622]"
                      : "bg-[#3e5622]/10 text-[#3e5622] hover:bg-[#3e5622]/20"
                  }`}
                  onClick={() => handleRsvp("maybe")}
                >
                  Maybe
                </button>
              )}
              <button
                type="button"
                className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${
                  selectedRsvp === "no"
                    ? "bg-[#273815] text-white ring-1 ring-[#3e5622]"
                    : "bg-[#3e5622]/10 text-[#3e5622] hover:bg-[#3e5622]/20"
                }`}
                onClick={() => handleRsvp("no")}
              >
                No
              </button>
            </div>
          </div>

          {/* Gifting & Registry Section */}
          {designState.gifting && designState.gifting.enabled !== false && designState.gifting.items && designState.gifting.items.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 px-5 py-4 shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                Gifting &amp; Registry
              </p>
              <div className="space-y-2">
                {designState.gifting.items.filter((item) => item.enabled !== false && item.url).map((item) => {
                  const providerColors: Record<string, { bg: string; text: string; label: string }> = {
                    amazon: { bg: "bg-amber-50", text: "text-amber-800", label: "AMZ" },
                    target: { bg: "bg-red-50", text: "text-red-800", label: "TGT" },
                    walmart: { bg: "bg-blue-50", text: "text-blue-800", label: "WMT" },
                    other: { bg: "bg-slate-50", text: "text-slate-700", label: item.type === "charity" ? "♥" : "Gift" },
                  };
                  const colors = providerColors[item.provider] || providerColors.other;
                  return (
                    <div key={item.id} className="flex items-center gap-3 py-1.5">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 ${colors.bg} ${colors.text}`}>
                        {colors.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                        {item.description && (
                          <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
                        )}
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-semibold text-[#3e5622] hover:underline shrink-0"
                      >
                        {item.type === "charity" ? "Donate" : "View"} →
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom RSVP Attendee Action Bar */}
      <div className="bg-white border-t border-slate-200/90 px-6 py-4 flex items-center justify-center gap-4 flex-wrap flex-shrink-0 z-10 shadow-lg">
        <span className="text-sm font-bold text-slate-800 mr-2">
          Will you be attending?
        </span>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleRsvp("yes")}
            className={`px-7 py-2 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
              selectedRsvp === "yes"
                ? "bg-[#273815] text-white ring-2 ring-[#3e5622]"
                : "bg-[#3e5622] hover:bg-[#32481b] text-white"
            }`}
          >
            Yes
          </button>
          {allowMaybe && (
            <button
              type="button"
              onClick={() => handleRsvp("maybe")}
              className={`px-7 py-2 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
                selectedRsvp === "maybe"
                  ? "bg-[#273815] text-white ring-2 ring-[#3e5622]"
                  : "bg-[#3e5622] hover:bg-[#32481b] text-white"
              }`}
            >
              Maybe
            </button>
          )}
          <button
            type="button"
            onClick={() => handleRsvp("no")}
            className={`px-7 py-2 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
              selectedRsvp === "no"
                ? "bg-[#273815] text-white ring-2 ring-[#3e5622]"
                : "bg-[#3e5622] hover:bg-[#32481b] text-white"
            }`}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
