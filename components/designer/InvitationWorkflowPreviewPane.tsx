"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Monitor, Smartphone, Calendar, User, Users } from "lucide-react";
import InvitationCanvasStage from "./InvitationCanvasStage";
import { StudioDesignState, teardownCanvasTextLayers } from "./InvitationStudio";
import { deduplicateTextLayers } from "./layoutUtils";
import { HostDetailsData } from "./InvitationWorkflowDetails";

interface InvitationWorkflowPreviewPaneProps {
  designState: StudioDesignState;
  allowMaybe?: boolean;
  hostDetails?: HostDetailsData;
  onRsvpClick?: (status: "yes" | "maybe" | "no") => void;
}

export default function InvitationWorkflowPreviewPane({
  designState,
  allowMaybe = true,
  hostDetails,
  onRsvpClick,
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
              Date & Time
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {displayDateTime || (
                <span className="text-slate-400 font-normal italic">Pick a date & time</span>
              )}
            </p>
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
          </div>

          {/* Guest List Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 px-5 py-4 shadow-sm">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
              Guest List
            </p>
            <div className="flex flex-col items-center justify-center py-2 text-center">
              <Users className="w-5 h-5 text-slate-400 mb-2" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Guests will show up here once you add them.
              </p>
              <p className="text-[10px] text-slate-400 italic mt-1">
                (FYI&mdash;that comes at a later step!)
              </p>
            </div>
          </div>
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
