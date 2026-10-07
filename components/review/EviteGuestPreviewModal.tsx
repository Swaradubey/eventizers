"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, RefreshCw } from "lucide-react";
import PreviewTopBar from "./preview/PreviewTopBar";
import EnvelopeRevealSequence from "./preview/EnvelopeRevealSequence";
import GuestEventDetailCards from "./preview/GuestEventDetailCards";
import EmailPreviewView from "./preview/EmailPreviewView";
import { WOOD_BACKGROUND } from "./preview/previewTheme";
import type {
  EmailRsvpChoice,
  EviteGuestPreviewEventDetails,
  GuestRsvpChoice,
  PreviewDeviceMode,
  PreviewEnvelopePhase,
  PreviewMode,
} from "./preview/previewTypes";

// =============================================================================
// EVITE-STYLE PREVIEW SHELL ("Preview as Guest" / "Preview as Email")
//
// 1. Sticky dark preview toolbar (mode switch · Desktop/Mobile · New tab · X)
// 2. Full scrollable stage: min-h-screen, whitewashed wood-plank background
// 3. Synchronized envelope sequence: flap opens → card slides out + scales →
//    the assembly settles at the top of the page (no layout jumps)
// 4. Structured event-detail cards stagger in below the invitation card
// 5. Email mode renders the single-column email simulation instead
// Rendered through a portal so it always sits above the studio canvas layers.
// =============================================================================

export type { EviteGuestPreviewEventDetails } from "./preview/previewTypes";

export interface EviteGuestPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardImageUrl?: string | null;
  eventDetails: EviteGuestPreviewEventDetails;
  /** Optional deep link that opens the standalone guest page in a new tab. */
  previewHref?: string | null;
  /** Which surface to open on (defaults to the guest preview). */
  initialMode?: PreviewMode;
  /** Name printed on the sealed envelope. */
  guestName?: string;
}

const TOAST_DURATION = 3400;

export default function EviteGuestPreviewModal({
  isOpen,
  onClose,
  cardImageUrl,
  eventDetails,
  previewHref,
  initialMode = "guest",
  guestName,
}: EviteGuestPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<PreviewMode>(initialMode);
  const [device, setDevice] = useState<PreviewDeviceMode>("desktop");
  const [phase, setPhase] = useState<PreviewEnvelopePhase>("sealed");
  const [runKey, setRunKey] = useState(0);
  const [guestRsvp, setGuestRsvp] = useState<GuestRsvpChoice>(null);
  const [emailRsvp, setEmailRsvp] = useState<EmailRsvpChoice>(null);
  const [toast, setToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Keep the latest onClose without re-running the open sequence.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  // Open / close lifecycle — resets the timeline and locks body scroll.
  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setPhase("sealed");
    setGuestRsvp(null);
    setEmailRsvp(null);
    setToast(null);
    setRunKey((key) => key + 1);
    scrollRef.current?.scrollTo({ top: 0 });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, [isOpen, initialMode]);

  const handleReplay = useCallback(() => {
    setPhase("sealed");
    setGuestRsvp(null);
    setRunKey((key) => key + 1);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleModeChange = useCallback(
    (next: PreviewMode) => {
      setMode(next);
      setToast(null);
      if (next === "guest") {
        // Restart the envelope sequence when returning to the guest view.
        setPhase("sealed");
        setRunKey((key) => key + 1);
      }
      scrollRef.current?.scrollTo({ top: 0 });
    },
    []
  );

  const scrollToDetails = useCallback(() => {
    const node = document.getElementById("preview-event-details");
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (!mounted || !isOpen) return null;

  const title = (eventDetails.title || "").trim() || "You're Invited";
  const settled = phase === "settled";
  const contentWidth = device === "mobile" ? "max-w-[375px]" : "max-w-[640px]";

  return createPortal(
    <div
      ref={scrollRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${title}`}
      className="fixed inset-0 z-[99999] min-h-screen w-full overflow-y-auto overflow-x-hidden font-sans"
      style={mode === "guest" ? WOOD_BACKGROUND : { backgroundColor: "#f1f0ec" }}
    >
      {/* ── Sticky preview toolbar ── */}
      <PreviewTopBar
        mode={mode}
        onModeChange={handleModeChange}
        device={device}
        onDeviceChange={setDevice}
        onReplay={mode === "guest" ? handleReplay : undefined}
        previewHref={previewHref || null}
        onClose={onClose}
        title={title}
      />

      {mode === "guest" ? (
        <div className={`w-full mx-auto transition-[max-width] duration-300 ${contentWidth}`}>
          {/* ── Stage 1–3: envelope + card, centered in the first viewport ── */}
          <section className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-start sm:justify-center px-4 pt-4 pb-10 sm:pt-6 sm:pb-12">
            <div className="w-full my-auto flex flex-col items-center">
              <EnvelopeRevealSequence
                title={title}
                guestName={guestName ?? eventDetails.guestName}
                cardImageUrl={cardImageUrl}
                runKey={runKey}
                onPhaseChange={setPhase}
                onReplay={handleReplay}
              />

              {/* Replay + scroll affordances appear once the sequence settles */}
              <div className="mt-4 sm:mt-6 flex flex-col items-center min-h-[74px]">
                <AnimatePresence>
                  {settled ? (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center gap-2.5"
                    >
                      <button
                        type="button"
                        onClick={handleReplay}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 hover:bg-white border border-slate-200/80 shadow-md hover:shadow-lg text-xs font-bold text-slate-700 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#3e5622]" />
                        Replay animation
                      </button>

                      <button
                        type="button"
                        onClick={scrollToDetails}
                        className="flex flex-col items-center gap-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600/80 hover:text-slate-800 transition cursor-pointer"
                      >
                        <ChevronDown className="w-4 h-4 animate-bounce" />
                        Event details
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* ── Stage 4: structured event information cards ── */}
          <div id="preview-event-details" className="scroll-mt-16">
            <AnimatePresence>
              {settled ? (
                <GuestEventDetailCards
                  key="guest-details"
                  details={eventDetails}
                  cardImageUrl={cardImageUrl}
                  rsvp={guestRsvp}
                  onRsvp={setGuestRsvp}
                  onNotify={notify}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* ── Email preview surface ── */
        <div className={`w-full mx-auto px-0 sm:px-4 pt-6 transition-[max-width] duration-300 ${contentWidth}`}>
          <EmailPreviewView
            details={eventDetails}
            cardImageUrl={cardImageUrl}
            rsvp={emailRsvp}
            onRsvp={setEmailRsvp}
            onNotify={notify}
          />
        </div>
      )}

      {/* ── Mock preview toast ── */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast}
            role="status"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.28 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] max-w-[92vw] px-4 py-3 rounded-full bg-[#1e2329] text-white text-xs font-semibold shadow-2xl border border-white/10 flex items-center gap-2.5 pointer-events-none"
          >
            <Check className="w-4 h-4 text-[#c9dcae] shrink-0" />
            <span>{toast}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>,
    document.body
  );
}
