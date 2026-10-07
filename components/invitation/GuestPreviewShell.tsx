"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Eye, Monitor, Smartphone, X } from "lucide-react";
import InviteEnvelopeViewer from "./InviteEnvelopeViewer";

// =============================================================================
// EVITE-STYLE GUEST PREVIEW VIEW
// Wraps the interactive envelope viewer with the review-UI viewport toggle bar
// (Desktop / Mobile) exactly like the Evite review screen.
// =============================================================================

const MOBILE_FRAME_WIDTH = 390;

export interface GuestPreviewShellProps {
  invitationId: string;
  initialData?: { invitation: any; event: any } | null;
  guestName?: string;
  guestMode?: boolean;
}

function closePreview() {
  if (typeof window === "undefined") return;
  if (window.opener && !window.opener.closed) {
    window.close();
    return;
  }
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  window.location.href = "/dashboard";
}

export default function GuestPreviewShell({
  invitationId,
  initialData,
  guestName = "",
  guestMode = true,
}: GuestPreviewShellProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const update = () => setIsMobileViewport(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const mobile = viewMode === "mobile" || isMobileViewport;
  const title =
    initialData?.invitation?.title || initialData?.event?.title || "Invitation preview";

  return (
    <div className="min-h-screen bg-[#f4f4f1] font-sans">
      {/* ─── VIEWPORT TOGGLE BAR (Evite review UI) ─── */}
      <header className="sticky top-0 z-50 h-12 bg-white/95 backdrop-blur border-b border-slate-200/90 px-3 sm:px-5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={closePreview}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-xs font-semibold cursor-pointer"
            title="Close preview"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to editor</span>
          </button>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3e5622]/10 text-[#3e5622] text-[10px] font-bold uppercase tracking-[0.14em] shrink-0">
            <Eye className="w-3 h-3" />
            Preview as guest
          </span>
          <p className="truncate text-xs font-bold text-slate-700 min-w-0">{title}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("desktop")}
              aria-pressed={!mobile}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                !mobile
                  ? "text-slate-900 bg-white shadow-xs font-bold ring-1 ring-slate-300"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Desktop preview"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("mobile")}
              aria-pressed={mobile}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                mobile
                  ? "text-slate-900 bg-white shadow-xs font-bold ring-1 ring-slate-300"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Mobile preview"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={closePreview}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─── PREVIEW STAGE ─── */}
      <div className={mobile ? "flex justify-center px-4 py-6" : ""}>
        <div
          className={
            mobile
              ? "w-full bg-white overflow-hidden border-[10px] border-slate-800 rounded-[2.5rem] shadow-2xl"
              : "w-full"
          }
          style={mobile ? { maxWidth: MOBILE_FRAME_WIDTH } : undefined}
        >
          <InviteEnvelopeViewer
            invitationId={invitationId}
            initialData={initialData}
            guestName={guestName}
            guestMode={guestMode}
            maxViewportWidth={mobile ? MOBILE_FRAME_WIDTH - 24 : undefined}
          />
        </div>
      </div>
    </div>
  );
}
