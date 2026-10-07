"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Eye, Loader2, Send } from "lucide-react";
import EviteGuestPreviewModal, {
  EviteGuestPreviewEventDetails,
} from "./EviteGuestPreviewModal";

// =============================================================================
// Review-stage "Preview" dropdown (Evite-style)
//   • Preview as guest  → opens the interactive envelope + event-details page
//   • Preview as email  → opens the single-column email simulation
//   • Email me a preview → POSTs to the dedicated Node backend endpoint
//     /api/events/:id/send-preview-email (Evite-styled mail + inline CID card)
//
// The menu is portaled to <body> with `position: fixed` + `z-index: 9999` so it
// is never clipped by the studio top bar (`overflow-x-auto`) and always paints
// above the canvas overlays.
// =============================================================================

export interface ReviewPreviewToast {
  message: string;
  type: "success" | "error";
}

export interface ReviewPreviewEventDetails {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  address?: string;
  hostName?: string;
  hostNote?: string;
  /** Name rendered on the sealed envelope during the guest preview. */
  guestName?: string;
}

export interface ReviewPreviewDropdownProps {
  eventId?: string | null;
  invitationId?: string | null;
  recipientEmail?: string | null;
  onToast?: (toast: ReviewPreviewToast) => void;
  /** Returns the freshest card snapshot (data URL) for the CID email attachment. */
  getCardSnapshot?: () => Promise<string | null> | string | null;
  /** Last-resort card image when a live canvas snapshot is unavailable. */
  fallbackCardImageUrl?: string | null;
  /** Event copy used by the guest preview modal and the preview email. */
  eventDetails?: ReviewPreviewEventDetails;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MENU_WIDTH = 264;
const MENU_ESTIMATED_HEIGHT = 132;

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem("token") || window.sessionStorage.getItem("token");
  if (!token || token === "undefined" || token === "null" || token.trim() === "") return null;
  return token;
}

function backendApiBase(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

function formatDateLabel(date?: string, time?: string): string | undefined {
  if (!date) return undefined;
  const iso = time ? `${date}T${time}` : `${date}T00:00`;
  const parsed = new Date(iso);
  if (isNaN(parsed.getTime())) return date;
  const dateLabel = parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  if (!time) return dateLabel;
  const timeLabel = parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dateLabel} · ${timeLabel}`;
}

interface MenuPosition {
  top?: number;
  bottom?: number;
  right: number;
}

export default function ReviewPreviewDropdown({
  eventId,
  invitationId,
  recipientEmail,
  onToast,
  getCardSnapshot,
  fallbackCardImageUrl,
  eventDetails,
}: ReviewPreviewDropdownProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCard, setPreviewCard] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep the portaled menu pinned to its trigger across scroll/resize.
  const measureMenu = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipUp = spaceBelow < MENU_ESTIMATED_HEIGHT + 16 && rect.top > spaceBelow;
    setMenuPos({
      right: Math.max(8, window.innerWidth - rect.right),
      ...(flipUp ? { bottom: window.innerHeight - rect.top + 8 } : { top: rect.bottom + 8 }),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    measureMenu();
    window.addEventListener("resize", measureMenu);
    window.addEventListener("scroll", measureMenu, true);
    return () => {
      window.removeEventListener("resize", measureMenu);
      window.removeEventListener("scroll", measureMenu, true);
    };
  }, [open, measureMenu]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideTrigger = rootRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideTrigger && !insideMenu) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const targetId = invitationId || eventId || "";
  const previewHref = targetId
    ? `/invitation/preview/${encodeURIComponent(targetId)}?mode=guest`
    : "";

  const openPreview = async () => {
    setOpen(false);
    let card: string | null = null;
    try {
      const snapshot = await getCardSnapshot?.();
      if (typeof snapshot === "string" && snapshot.startsWith("data:")) card = snapshot;
    } catch {
      // snapshot is optional — fall back to the persisted preview image
    }
    if (!card) card = fallbackCardImageUrl || null;
    setPreviewCard(card);
    setPreviewOpen(true);
  };

  const postPreviewEmail = async (url: string, token: string, payload: Record<string, unknown>) => {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  };

  const sendPreviewEmail = async () => {
    if (sending) return;
    if (!eventId) {
      onToast?.({ message: "Save your invitation before emailing a preview.", type: "error" });
      return;
    }
    const token = readToken();
    if (!token) {
      onToast?.({ message: "Sign in to email yourself a preview.", type: "error" });
      return;
    }
    if (!recipientEmail || !EMAIL_RE.test(recipientEmail)) {
      onToast?.({ message: "Add your email in the host details first.", type: "error" });
      return;
    }

    setSending(true);
    try {
      // Freshest rendered card snapshot → embedded as cid:invitation-preview-card
      let cardSnapshot: string | undefined;
      try {
        const snapshot = await getCardSnapshot?.();
        if (typeof snapshot === "string" && snapshot.startsWith("data:") && snapshot.length <= 3_000_000) {
          cardSnapshot = snapshot;
        }
      } catch {
        // snapshot is optional — the server falls back to the saved preview URL
      }
      if (!cardSnapshot && fallbackCardImageUrl?.startsWith("data:")) {
        cardSnapshot = fallbackCardImageUrl;
      }

      const payload = {
        recipientEmail,
        toEmail: recipientEmail,
        invitationId: invitationId || undefined,
        cardSnapshot,
        cardSnapshotBase64: cardSnapshot,
        eventTitle: eventDetails?.title || undefined,
        eventDate: formatDateLabel(eventDetails?.date, eventDetails?.time) || undefined,
        eventLocation: eventDetails?.location || undefined,
        hostName: eventDetails?.hostName || undefined,
        hostNote: eventDetails?.hostNote || undefined,
      };

      const backendUrl = `${backendApiBase()}/events/${encodeURIComponent(
        eventId
      )}/send-preview-email`;

      let res: Response | null = null;
      try {
        res = await postPreviewEmail(backendUrl, token, payload);
      } catch {
        res = null;
      }

      // Only fall through when the dedicated backend endpoint is unreachable or
      // not deployed — an error response means it already handled the request.
      if (!res || res.status === 404 || res.status === 501) {
        try {
          const fallback = await postPreviewEmail(
            `/api/events/${encodeURIComponent(eventId)}/send-preview-email`,
            token,
            payload
          );
          if (fallback) res = fallback;
        } catch {
          // keep the original result
        }
      }

      if (!res) {
        throw new Error(
          "Could not reach the preview email service. Make sure the backend server is running."
        );
      }

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        throw new Error(data?.error || data?.message || "Could not send the preview email.");
      }
      onToast?.({
        message: data?.message || `Preview email sent to ${recipientEmail}`,
        type: "success",
      });
      setOpen(false);
    } catch (error: any) {
      onToast?.({
        message: error?.message || "Could not send the preview email. Try again.",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const modalDetails: EviteGuestPreviewEventDetails = {
    title: eventDetails?.title,
    date: eventDetails?.date,
    time: eventDetails?.time,
    location: eventDetails?.location,
    address: eventDetails?.address,
    hostName: eventDetails?.hostName,
    hostNote: eventDetails?.hostNote,
    guestName: eventDetails?.guestName,
  };

  return (
    <>
      <div ref={rootRef} className="relative shrink-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
          title="Preview options"
        >
          <Eye className="w-3.5 h-3.5 text-[#3e5622]" />
          <span className="hidden sm:inline">Preview</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Portaled menu — escapes the top bar's overflow + stacking context */}
      {mounted &&
        open &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl pointer-events-auto"
            style={{
              top: menuPos.top,
              bottom: menuPos.bottom,
              right: menuPos.right,
              width: MENU_WIDTH,
              zIndex: 9999,
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={openPreview}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 mt-0.5 text-[#3e5622] shrink-0" />
              <span className="min-w-0">
                <span className="block text-xs font-bold text-slate-800">Preview as guest</span>
                <span className="block text-[11px] text-slate-500 leading-snug">
                  Envelope animation + full event details
                </span>
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={sendPreviewEmail}
              disabled={sending}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 mt-0.5 text-[#3e5622] shrink-0 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mt-0.5 text-[#3e5622] shrink-0" />
              )}
              <span className="min-w-0">
                <span className="block text-xs font-bold text-slate-800">
                  {sending ? "Sending preview…" : "Email me a preview"}
                </span>
                <span className="block text-[11px] text-slate-500 leading-snug truncate">
                  {sending ? "Just a moment" : `Send to ${recipientEmail || "your inbox"}`}
                </span>
              </span>
            </button>
          </div>,
          document.body
        )}

      <EviteGuestPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        cardImageUrl={previewCard}
        eventDetails={modalDetails}
        previewHref={previewHref || null}
        guestName={eventDetails?.guestName}
      />
    </>
  );
}
