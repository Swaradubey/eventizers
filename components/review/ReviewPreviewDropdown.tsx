"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Eye, Loader2, Mail } from "lucide-react";

// =============================================================================
// Review-stage "Preview" dropdown (Evite-style)
//   • Preview as guest  → opens the interactive envelope viewer in a new tab
//   • Email me a preview → posts to /api/events/:id/send-preview-email
// =============================================================================

export interface ReviewPreviewToast {
  message: string;
  type: "success" | "error";
}

export interface ReviewPreviewDropdownProps {
  eventId?: string | null;
  invitationId?: string | null;
  recipientEmail?: string | null;
  onToast?: (toast: ReviewPreviewToast) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem("token") || window.sessionStorage.getItem("token");
  if (!token || token === "undefined" || token === "null" || token.trim() === "") return null;
  return token;
}

export default function ReviewPreviewDropdown({
  eventId,
  invitationId,
  recipientEmail,
  onToast,
}: ReviewPreviewDropdownProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
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

  const previewAsGuest = () => {
    if (!previewHref) {
      onToast?.({ message: "Save your invitation before previewing it.", type: "error" });
      return;
    }
    window.open(previewHref, "_blank", "noopener,noreferrer");
    setOpen(false);
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
      const res = await fetch(
        `/api/events/${encodeURIComponent(eventId)}/send-preview-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipientEmail,
            invitationId: invitationId || undefined,
          }),
          cache: "no-store",
        }
      );
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

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
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

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl z-50"
        >
          <button
            type="button"
            role="menuitem"
            onClick={previewAsGuest}
            className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 mt-0.5 text-[#3e5622] shrink-0" />
            <span className="min-w-0">
              <span className="block text-xs font-bold text-slate-800">Preview as guest</span>
              <span className="block text-[11px] text-slate-500 leading-snug">
                Open the interactive invitation in a new tab
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
              <Mail className="w-4 h-4 mt-0.5 text-[#3e5622] shrink-0" />
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
        </div>
      )}
    </div>
  );
}
