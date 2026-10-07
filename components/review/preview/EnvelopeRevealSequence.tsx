"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import {
  ENVELOPE_KRAFT,
  ENVELOPE_KRAFT_DARK,
  ENVELOPE_LINER,
} from "./previewTheme";
import type { PreviewEnvelopePhase } from "./previewTypes";

// =============================================================================
// ENVELOPE REVEAL SEQUENCE — Evite-style unboxing sequence
//  Stage 1 "sealed"    : envelope centered with postage stamp + guest name
//  Stage 2 "opening"   : flap unfolds backwards (3D rotateX) revealing the liner
//  Stage 3 "revealing" : invitation card unboxes (slides up out of pocket,
//                        glides over to the right in front, while envelope shifts left)
//  Stage 4 "settled"   : envelope rests on the left showing open flap + liner,
//                        card sits in front on the right, floating play button appears
// =============================================================================

export interface EnvelopeRevealSequenceProps {
  title?: string;
  guestName?: string;
  cardImageUrl?: string | null;
  /** Bump this value to restart the timeline from stage 1. */
  runKey?: number;
  onPhaseChange?: (phase: PreviewEnvelopePhase) => void;
  /** Callback to replay the animation from the floating play button. */
  onReplay?: () => void;
  /** Adds breathing room above the envelope for the card to rise into. */
  className?: string;
}

/** Delay before each stage, accumulated from the previous one. */
const STAGE_DELAY: Record<Exclude<PreviewEnvelopePhase, "sealed">, number> = {
  opening: 750,
  revealing: 850,
  settled: 1200,
};

const FLAP_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const UNBOX_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function EnvelopeRevealSequence({
  title,
  guestName,
  cardImageUrl,
  runKey = 0,
  onPhaseChange,
  onReplay,
  className = "",
}: EnvelopeRevealSequenceProps) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<PreviewEnvelopePhase>("sealed");
  const timersRef = useRef<number[]>([]);
  const onPhaseChangeRef = useRef(onPhaseChange);
  onPhaseChangeRef.current = onPhaseChange;

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  // Timeline — restarts whenever `runKey` changes (Replay button).
  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase("settled");
      return;
    }
    clearTimers();
    setPhase("sealed");
    let elapsed = 0;
    (["opening", "revealing", "settled"] as const).forEach((next) => {
      elapsed += STAGE_DELAY[next];
      timersRef.current.push(window.setTimeout(() => setPhase(next), elapsed));
    });
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey, prefersReducedMotion]);

  useEffect(() => {
    onPhaseChangeRef.current?.(phase);
  }, [phase]);

  const flapOpen = phase === "opening" || phase === "revealing" || phase === "settled";
  const cardOut = phase === "revealing" || phase === "settled";
  const sealedFaceVisible = phase === "sealed" || phase === "opening";
  const settled = phase === "settled";

  const displayTitle = (title || "").trim() || "You're Invited";
  const displayName = (guestName || "").trim() || "Guest\u2019s Name";

  return (
    <div className={`relative w-full max-w-[500px] sm:max-w-[580px] mx-auto ${className}`}>
      {/* Headroom for the flap and unboxed card — prevents top clipping on all viewports */}
      <div className="relative pt-[46%] pb-4 flex items-center justify-center">
        {/* ── Envelope Assembly — shifts smoothly to the left as the card unboxes ── */}
        <motion.div
          className="relative w-[60%] sm:w-[58%] aspect-[5/4] shrink-0"
          style={{ perspective: "1400px" }}
          initial={false}
          animate={{
            x: cardOut ? "-22%" : "0%",
          }}
          transition={{
            duration: 0.95,
            delay: cardOut ? 0.35 : 0,
            ease: UNBOX_EASE,
          }}
        >
          {/* Soft table shadow */}
          <div className="absolute left-[8%] right-[8%] -bottom-4 h-6 rounded-[50%] bg-black/30 blur-xl z-0" />

          {/* Envelope interior back */}
          <div
            className="absolute inset-0 z-[1] rounded-[14px]"
            style={{
              background: ENVELOPE_KRAFT_DARK,
              boxShadow: "0 26px 50px -22px rgba(0,0,0,0.55)",
            }}
          />
          {/* Interior liner band */}
          <div
            className="absolute inset-x-0 top-0 h-[58%] z-[1] rounded-t-[14px] overflow-hidden"
            style={ENVELOPE_LINER}
          />
          {/* Folded bottom seams */}
          <div
            className="absolute inset-x-0 bottom-0 z-[1] overflow-hidden rounded-b-[14px]"
            style={{ top: "64%", background: ENVELOPE_KRAFT }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(45deg, rgba(0,0,0,0.16) 0%, transparent 42%), linear-gradient(-45deg, rgba(0,0,0,0.16) 0%, transparent 42%)",
              }}
            />
            <div
              className="absolute inset-x-0 top-0"
              style={{ height: 3, background: "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)" }}
            />
          </div>

          {/* ── Invitation card — tucked inside, unboxes out of pocket & glides to the right ── */}
          <motion.div
            className="absolute left-1/2 bottom-[6%] w-[86%] sm:w-[88%]"
            initial={false}
            animate={{
              x: cardOut ? ["-50%", "-50%", "38%"] : "-50%",
              y: cardOut ? ["0%", "-65%", "-4%"] : "0%",
              scale: cardOut ? [0.65, 0.88, 1] : 0.65,
              zIndex: cardOut ? [5, 25, 25] : 5,
            }}
            transition={{
              duration: 1.15,
              times: [0, 0.42, 1],
              ease: ["easeInOut", "easeOut"],
            }}
          >
            <div
              className={`relative w-full aspect-[3/4] rounded-[10px] overflow-hidden bg-white transition-shadow duration-500 ${
                cardOut
                  ? "shadow-[0_28px_50px_-16px_rgba(0,0,0,0.55),0_10px_20px_-8px_rgba(0,0,0,0.3)] ring-1 ring-black/10"
                  : "shadow-[0_8px_18px_-8px_rgba(0,0,0,0.45)]"
              }`}
            >
              {cardImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cardImageUrl}
                  alt={`${displayTitle} invitation card`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 text-center bg-gradient-to-br from-[#3e5622] via-[#587a37] to-[#87a864]">
                  <span className="font-serif font-bold text-white text-[11px] leading-tight sm:text-sm">
                    {displayTitle}
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.18em] text-white/70">
                    You&apos;re invited
                  </span>
                </div>
              )}
            </div>

            {/* Floating circular play button next to the card (matches Evite reference) */}
            {onReplay ? (
              <motion.button
                type="button"
                onClick={onReplay}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: settled ? 1 : 0,
                  scale: settled ? 1 : 0.8,
                  pointerEvents: settled ? "auto" : "none",
                }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="absolute -right-11 sm:-right-13 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200/90 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-30"
                title="Replay animation"
                aria-label="Replay animation"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-700 text-slate-700 ml-0.5" />
              </motion.button>
            ) : null}
          </motion.div>

          {/* ── Front pocket (V-cut) — stays above the card ── */}
          <div
            className="absolute inset-0 z-[10] rounded-b-[14px]"
            style={{
              clipPath: "polygon(0 0, 50% 34%, 100% 0, 100% 100%, 0 100%)",
              background: ENVELOPE_KRAFT,
            }}
          />
          <div
            className="absolute inset-0 z-[11] pointer-events-none rounded-b-[14px]"
            style={{
              clipPath: "polygon(0 0, 50% 34%, 100% 0, 100% 100%, 0 100%)",
              boxShadow: "inset 0 -16px 28px -20px rgba(0,0,0,0.55)",
            }}
          />

          {/* ── Flap — hidden behind the sealed face, unfolds up and back ── */}
          <div
            className="absolute inset-x-0 top-0 h-[54%] z-[4]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="absolute inset-0 origin-top"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                background: ENVELOPE_KRAFT,
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
                backfaceVisibility: "visible",
              }}
              initial={false}
              animate={{ rotateX: flapOpen ? 180 : 0 }}
              transition={{ duration: 0.75, ease: FLAP_EASE }}
            >
              {/* interior liner revealed as the flap swings past 90° */}
              <span
                aria-hidden
                className="absolute inset-0 block"
                style={{
                  ...ENVELOPE_LINER,
                  opacity: flapOpen ? 1 : 0,
                  transition: "opacity 300ms ease 380ms",
                }}
              />
              <span
                aria-hidden
                className="absolute inset-0 block"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, transparent 50%, rgba(0,0,0,0.18) 100%)",
                }}
              />
            </motion.div>
          </div>

          {/* ── Sealed face — stamp + guest name (stage 1) ── */}
          <motion.div
            className="absolute inset-0 z-[15] rounded-[14px] overflow-hidden"
            style={{
              background: ENVELOPE_KRAFT,
              boxShadow: "0 26px 50px -22px rgba(0,0,0,0.55)",
            }}
            initial={false}
            animate={{
              opacity: sealedFaceVisible ? 1 : 0,
              scale: sealedFaceVisible ? 1 : 1.02,
            }}
            transition={{ duration: 0.45, delay: sealedFaceVisible ? 0 : 0.16 }}
          >
            {/* paper grain */}
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, transparent 45%, rgba(0,0,0,0.16) 100%)",
              }}
            />

            {/* postage stamp */}
            <div
              className="absolute flex flex-col items-center justify-center"
              style={{
                top: "5%",
                right: "5%",
                width: "17%",
                aspectRatio: "5 / 6",
                background: "#fffdf7",
                border: "2px dashed rgba(255,255,255,0.85)",
                borderRadius: 3,
                boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
              }}
            >
              <span className="text-lg sm:text-2xl leading-none">🍁</span>
              <span className="text-[6px] font-bold uppercase tracking-[0.14em] text-slate-600 mt-1">
                Post
              </span>
            </div>

            {/* guest address */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/70">
                Invitation for
              </span>
              <p
                className="mt-1.5 font-serif text-white leading-tight break-words"
                style={{
                  textShadow: "0 2px 6px rgba(0,0,0,0.35)",
                  maxWidth: "72%",
                  fontSize: "clamp(18px, 6.5vw, 30px)",
                }}
              >
                {displayName}
              </p>
              <div className="mt-3 flex flex-col gap-1.5 w-2/3 opacity-40">
                <span className="block h-[2px] rounded bg-white/80" />
                <span className="block h-[2px] rounded bg-white/60 w-4/5 mx-auto" />
                <span className="block h-[2px] rounded bg-white/45 w-3/5 mx-auto" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
