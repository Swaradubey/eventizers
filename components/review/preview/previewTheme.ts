import type { CSSProperties } from "react";
import type { PreviewGuest, PreviewRsvpStatus } from "./previewTypes";

// =============================================================================
// Preview theme tokens — whitewashed wood-plank stage, shared card classes and
// small formatting helpers used by both the guest and email preview surfaces.
// =============================================================================

/** Sticky preview toolbar — matches the Evite review chrome. */
export const TOP_BAR_CLASS =
  "sticky top-0 z-50 bg-[#1e2329] text-white flex justify-between items-center gap-3 px-4 sm:px-6 py-3";

/** Modular white rounded card used for every event-detail block. */
export const DETAIL_CARD_CLASS =
  "bg-white rounded-2xl shadow-sm border border-gray-100 max-w-xl mx-auto mb-4 p-6";

/** Small uppercase section label ("DATE & TIME", "HOST DETAILS", …). */
export const CARD_LABEL_CLASS =
  "text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500";

/**
 * Horizontal whitewashed plank texture (reference: Evite guest view).
 * Pure CSS so it tiles at any viewport size without a network request.
 */
export const WOOD_BACKGROUND: CSSProperties = {
  backgroundColor: "#f2efe9",
  backgroundImage: [
    // soft daylight wash from the top
    "radial-gradient(150% 55% at 50% -10%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%)",
    // fine horizontal grain
    "repeating-linear-gradient(180deg, rgba(122,110,92,0.035) 0px, rgba(122,110,92,0.035) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 6px)",
    // longer fibre streaks
    "repeating-linear-gradient(180deg, rgba(96,86,70,0.05) 0px, rgba(96,86,70,0.05) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 19px)",
    // per-plank tonal variation every 132px
    "repeating-linear-gradient(180deg, rgba(255,255,255,0.34) 0px, rgba(236,231,221,0.34) 66px, rgba(216,210,198,0.3) 66px, rgba(255,255,255,0.34) 132px)",
    // plank seams
    "repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 130px, rgba(74,64,52,0.18) 130px, rgba(74,64,52,0.18) 132px)",
  ].join(", "),
  backgroundAttachment: "fixed",
  backgroundRepeat: "repeat",
};

/** Envelope paper gradients. */
export const ENVELOPE_KRAFT = "linear-gradient(155deg, #b58556 0%, #a2713f 55%, #96663a 100%)";
export const ENVELOPE_KRAFT_DARK =
  "linear-gradient(155deg, #a5764a 0%, #936334 60%, #875a2f 100%)";

/** Warm gingham-style interior liner (matches the reference sleeve). */
export const ENVELOPE_LINER: CSSProperties = {
  backgroundColor: "#e2a86b",
  backgroundImage: [
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 15px, rgba(255,255,255,0) 15px, rgba(255,255,255,0) 30px)",
    "repeating-linear-gradient(180deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 15px, rgba(255,255,255,0) 15px, rgba(255,255,255,0) 30px)",
    "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 45%)",
  ].join(", "),
};

// ── Helpers ────────────────────────────────────────────────────────────────

export function initialsOf(name?: string | null): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "G";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase() || "G";
}

const AVATAR_COLORS = [
  "#64748b",
  "#7c8b6a",
  "#8a7ca8",
  "#b07d62",
  "#5f8aa0",
  "#a8735f",
];

export function avatarColorFor(seed?: string | null): string {
  const value = (seed || "").trim();
  if (!value) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** Builds a normalized guest list (at least one attendee) for the preview. */
export function resolvePreviewGuests(
  guests: PreviewGuest[] | undefined,
  fallbackName?: string
): PreviewGuest[] {
  if (guests && guests.length) return guests;
  const name = (fallbackName || "").trim() || "You";
  return [{ id: "preview-guest", name, status: "going" }];
}

export function countGoing(guests: PreviewGuest[]): number {
  return guests.filter((g) => (g.status || "going") === "going").length;
}

function parseEventDate(date?: string, time?: string): Date | null {
  if (!date) return null;
  const raw = date.trim();
  if (!raw) return null;
  const iso = time ? `${raw}T${time.trim()}` : raw;
  const parsed = new Date(iso);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const direct = new Date(raw);
  return Number.isNaN(direct.getTime()) ? null : direct;
}

export interface EventDateLabels {
  /** Short label, e.g. "Fri, Oct 9". */
  dayLabel: string | null;
  /** Time label, e.g. "6:00 PM". */
  timeLabel: string | null;
  /** Combined short label, e.g. "Fri, Oct 9 - 6:00 PM". */
  combinedLabel: string;
  /** Long label used in the email body. */
  longLabel: string;
}

export function buildEventDateLabels(date?: string, time?: string): EventDateLabels {
  const parsed = parseEventDate(date, time);
  if (!parsed) {
    const fallback = (date || "").trim();
    return {
      dayLabel: fallback || null,
      timeLabel: (time || "").trim() || null,
      combinedLabel: fallback + (time ? ` - ${time}` : ""),
      longLabel: fallback + (time ? ` at ${time}` : ""),
    };
  }
  const dayLabel = parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const longDate = parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return {
    dayLabel,
    timeLabel,
    combinedLabel: `${dayLabel} - ${timeLabel}`,
    longLabel: `${longDate} at ${timeLabel}`,
  };
}

/** Google Calendar template URL, or null when the date cannot be parsed. */
export function buildCalendarUrl(options: {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  details?: string;
}): string | null {
  const parsed = parseEventDate(options.date, options.time);
  if (!parsed) return null;
  const end = new Date(parsed.getTime() + 2 * 60 * 60 * 1000);
  const compact = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
      d.getUTCDate()
    ).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(
      d.getUTCMinutes()
    ).padStart(2, "0")}00Z`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: options.title || "You're Invited",
    dates: `${compact(parsed)}/${compact(end)}`,
  });
  if (options.details) params.set("details", options.details);
  if (options.location) params.set("location", options.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildMapsUrl(query?: string): string | null {
  const value = (query || "").trim();
  if (!value) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}

export function buildMapEmbedUrl(query?: string): string | null {
  const value = (query || "").trim();
  if (!value) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(value)}&output=embed`;
}

export const STATUS_LABEL: Record<PreviewRsvpStatus, string> = {
  going: "Going",
  maybe: "Maybe",
  declined: "Can't Go",
  pending: "Pending",
};
