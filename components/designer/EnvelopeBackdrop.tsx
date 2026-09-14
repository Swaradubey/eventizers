"use client";

import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// OPEN VERTICAL POCKET ENVELOPE BACKDROP
// Renders an open, vertical pocket envelope behind the invitation card:
// - Light blue outer flap and liner border (#7ba3e8 / #6b9be8)
// - Vertical pink-and-white striped inner liner pattern (90deg stripes)
// - Open top pointed triangular flap extending upwards behind the card
// - Blue front pocket wall holding the card (#5384db)
// All pointer events pass through to the interactive card layer on top.
// ─────────────────────────────────────────────────────────────────────────────

export interface EnvelopeBackdropProps {
  /** Envelope body color (hex, rgb, or CSS gradient) - default "#5384db" */
  color?: string;
  /** Flap outer border color - default "#7ba3e8" */
  flapColor?: string;
  /** Interior liner pattern (CSS gradient or solid color) - default pink/white vertical stripes */
  liner?: string;
  /** Height of the triangular flap as a % of the container (default "38%") */
  flapHeight?: string;
  /** Top offset of the pocket as a % of the container (default "34%") */
  bodyTop?: string;
  /** Optional stamp emoji rendered on envelope */
  stampEmoji?: string | null;
  /** Optional sticker emoji rendered as a seal */
  stickerEmoji?: string | null;
  /** Additional classes for the root wrapper */
  className?: string;
}

export const DEFAULT_ENVELOPE_BODY_COLOR = "#5384db";
export const DEFAULT_ENVELOPE_FLAP_COLOR = "#7ba3e8";
export const DEFAULT_ENVELOPE_LINER =
  "repeating-linear-gradient(90deg, #ea5b95 0px, #ea5b95 11px, #ffffff 11px, #ffffff 22px)";

export default function EnvelopeBackdrop({
  color = DEFAULT_ENVELOPE_BODY_COLOR,
  flapColor = DEFAULT_ENVELOPE_FLAP_COLOR,
  liner = DEFAULT_ENVELOPE_LINER,
  stampEmoji = null,
  stickerEmoji = null,
  className = "",
}: EnvelopeBackdropProps) {
  // Resolve colors with fallbacks
  const bodyColor = color || DEFAULT_ENVELOPE_BODY_COLOR;
  const outerBorderColor = flapColor || DEFAULT_ENVELOPE_FLAP_COLOR;
  
  // Resolve liner gradient
  let linerPattern = liner || DEFAULT_ENVELOPE_LINER;
  if (linerPattern === "none") {
    linerPattern = "rgba(0,0,0,0.02)";
  } else if (
    linerPattern === "vertical-pink-stripes" ||
    linerPattern === "pink-stripes" ||
    !linerPattern ||
    linerPattern === "sprinkles"
  ) {
    linerPattern = DEFAULT_ENVELOPE_LINER;
  }

  return (
    <div
      data-testid="open-vertical-envelope-backdrop"
      className={`relative w-full h-full pointer-events-none select-none ${className}`}
      style={{
        filter:
          "drop-shadow(0 20px 30px rgba(0, 0, 0, 0.28)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.12))",
      }}
    >
      {/* ─── 1. Open Top Triangular Flap (pointing upward) ───────────────── */}
      <div
        className="absolute inset-x-0 top-0 h-[40%]"
        style={{
          background: outerBorderColor,
          clipPath: "polygon(50% 0%, 100% 92%, 100% 100%, 0% 100%, 0% 92%)",
        }}
      >
        {/* Inner Liner inside the Flap (Framed by light blue border) */}
        <div
          className="absolute inset-x-2.5 sm:inset-x-3 bottom-0"
          style={{
            top: "8px",
            background: linerPattern,
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          }}
        />

        {/* Optional Postal Stamp inside Flap Peak */}
        {stampEmoji && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/40 backdrop-blur-xs border border-white/60 flex items-center justify-center text-sm shadow-xs pointer-events-none z-10">
            {stampEmoji}
          </div>
        )}
      </div>

      {/* ─── 2. Pocket Back Wall (Lined Interior Throat) ─────────────────── */}
      <div
        className="absolute inset-x-0 top-[35%] bottom-0 rounded-b-2xl overflow-hidden"
        style={{
          background: outerBorderColor,
        }}
      >
        {/* Continuous Inner Liner filling the pocket interior */}
        <div
          className="absolute inset-x-2.5 sm:inset-x-3 top-0 bottom-3 rounded-b-xl overflow-hidden"
          style={{
            background: linerPattern,
          }}
        >
          {/* Subtle interior depth shadow */}
          <div className="absolute inset-0 shadow-[inset_0_4px_16px_rgba(0,0,0,0.18)]" />
        </div>

        {/* ─── 3. Front Pocket Wall (holds the card) ────────────────────── */}
        <div
          className="absolute inset-x-0 top-[18%] bottom-0 rounded-b-2xl overflow-hidden"
          style={{
            background: bodyColor,
            boxShadow:
              "0 -3px 8px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}
        >
          {/* Subtle realistic lighting gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/10 pointer-events-none" />

          {/* Optional Wax Seal / Sticker */}
          {stickerEmoji && (
            <div className="absolute -top-3 right-6 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-lg pointer-events-none">
              {stickerEmoji}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
