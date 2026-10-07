"use client";

import React from "react";
import { ExternalLink, Monitor, RefreshCw, Smartphone, X } from "lucide-react";
import { TOP_BAR_CLASS } from "./previewTheme";
import type { PreviewDeviceMode, PreviewMode } from "./previewTypes";

// =============================================================================
// PREVIEW TOOLBAR — sticky Evite-style chrome shared by guest + email modes.
//   Left  : active preview indicator label
//   Center: "This is a preview of your Invitation."
//   Right : Guest/Email mode switch · Desktop/Mobile · Replay · New tab · Close
// =============================================================================

export interface PreviewTopBarProps {
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  device: PreviewDeviceMode;
  onDeviceChange: (device: PreviewDeviceMode) => void;
  /** Renders the replay control (guest mode only). */
  onReplay?: () => void;
  /** Deep link opened in a new tab. */
  previewHref?: string | null;
  onClose: () => void;
  /** Optional right-side title (hidden on small screens). */
  title?: string;
}

function deviceButtonClass(active: boolean): string {
  return `px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
    active ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:text-white"
  }`;
}

function modeButtonClass(active: boolean): string {
  return `px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.12em] transition cursor-pointer ${
    active ? "bg-[#3e5622] text-white shadow-sm" : "text-neutral-400 hover:text-white"
  }`;
}

export default function PreviewTopBar({
  mode,
  onModeChange,
  device,
  onDeviceChange,
  onReplay,
  previewHref,
  onClose,
  title,
}: PreviewTopBarProps) {
  return (
    <header className={TOP_BAR_CLASS}>
      {/* Active preview indicator */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9dcae] whitespace-nowrap">
          {mode === "guest" ? "Preview as guest" : "Preview as email"}
        </span>
        {title ? (
          <p className="hidden lg:block truncate text-xs font-semibold text-neutral-300 min-w-0">
            {title}
          </p>
        ) : null}
      </div>

      {/* Centered preview notice */}
      <p className="hidden md:block absolute left-1/2 -translate-x-1/2 text-xs font-bold text-neutral-200 pointer-events-none whitespace-nowrap">
        This is a preview of your Invitation.
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => onModeChange("guest")}
            aria-pressed={mode === "guest"}
            className={modeButtonClass(mode === "guest")}
            title="Preview as guest"
          >
            Guest
          </button>
          <button
            type="button"
            onClick={() => onModeChange("email")}
            aria-pressed={mode === "email"}
            className={modeButtonClass(mode === "email")}
            title="Preview as email"
          >
            Email
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => onDeviceChange("desktop")}
            aria-pressed={device === "desktop"}
            className={deviceButtonClass(device === "desktop")}
            title="Desktop preview"
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange("mobile")}
            aria-pressed={device === "mobile"}
            className={deviceButtonClass(device === "mobile")}
            title="Mobile preview"
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>

        {/* Mobile-only compact device toggle */}
        <div className="flex sm:hidden items-center bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => onDeviceChange(device === "desktop" ? "mobile" : "desktop")}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white transition cursor-pointer"
            title={device === "desktop" ? "Switch to mobile" : "Switch to desktop"}
          >
            {device === "desktop" ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              <Monitor className="w-4 h-4" />
            )}
          </button>
        </div>

        {onReplay ? (
          <button
            type="button"
            onClick={onReplay}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition text-[11px] font-semibold cursor-pointer"
            title="Replay the envelope animation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Replay</span>
          </button>
        ) : null}

        {previewHref ? (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition text-[11px] font-semibold"
            title="Open the full guest page in a new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">New tab</span>
          </a>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-neutral-300 hover:text-white hover:bg-white/20 transition cursor-pointer"
          title="Close preview"
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
