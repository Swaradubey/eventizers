"use client";

import React, { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import InvitationCanvasStage from "./InvitationCanvasStage";
import { StudioDesignState } from "./InvitationStudio";

interface InvitationWorkflowPreviewPaneProps {
  designState: StudioDesignState;
  onRsvpClick?: (status: "yes" | "maybe" | "no") => void;
}

export default function InvitationWorkflowPreviewPane({
  designState,
  onRsvpClick,
}: InvitationWorkflowPreviewPaneProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [selectedRsvp, setSelectedRsvp] = useState<"yes" | "maybe" | "no" | null>(null);

  const handleRsvp = (status: "yes" | "maybe" | "no") => {
    setSelectedRsvp(status);
    if (onRsvpClick) onRsvpClick(status);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f4f1] border-r border-slate-200/90 overflow-hidden select-none relative">
      {/* 1. Top View Mode Switcher (Desktop / Mobile icons) */}
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


      {/* 2. Center Invitation Card Stage */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pt-3 flex items-center justify-center relative">
        {viewMode === "desktop" ? (
          <div className="w-full max-w-[460px] flex items-center justify-center my-auto transition-all duration-300">
            <div className="w-full shadow-2xl rounded-2xl overflow-hidden border border-slate-200/80 bg-white">
              <InvitationCanvasStage
                config={designState}
                readOnly={true}
                maxW={460}
                zoom={100}
                aspectRatio="5/7"
                className="w-full !p-0"
              />
            </div>
          </div>
        ) : (
          /* Mobile Phone Mockup */
          <div className="w-[320px] rounded-[36px] p-2.5 bg-slate-900 shadow-2xl ring-1 ring-slate-800/80 transition-all duration-300 my-auto">
            {/* Phone notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />
            <div className="rounded-[26px] overflow-hidden bg-white max-h-[520px] overflow-y-auto">
              <InvitationCanvasStage
                config={designState}
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

      {/* 4. Bottom RSVP Attendee Action Bar */}
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
