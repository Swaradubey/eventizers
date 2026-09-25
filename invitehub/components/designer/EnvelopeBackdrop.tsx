"use client";

import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// EVITE-EXACT ENVELOPE BACKDROP
// Matches Evite.com's authentic envelope design precisely:
// - Envelope sits directly behind the card with top matching the card's top
// - Open diagonal top flap with warm checkered/gingham liner and paper margin
// - Lower body in solid kraft brown paper with realistic fold crease
// - Soft ambient drop shadows and paper texture
// ─────────────────────────────────────────────────────────────────────────────

export interface EnvelopeBackdropProps {
  /** Envelope body color — default warm kraft/caramel "#b47b48" */
  color?: string;
  /** Flap outer border color */
  flapColor?: string;
  /** Interior liner pattern */
  liner?: string;
  innerLiner?: string;
  shadowColor?: string;
  stampEmoji?: string | null;
  stickerEmoji?: string | null;
  className?: string;
}

export const DEFAULT_ENVELOPE_BODY_COLOR = "#b47b48";
export const DEFAULT_ENVELOPE_FLAP_COLOR = "#9c6838";

// Evite Fall Blooms exact checkered liner: warm red-orange & white grid
export const DEFAULT_ENVELOPE_LINER =
  "repeating-conic-gradient(#cb4e2c 0% 25%, #ffffff 0% 50%) 0 0 / 22px 22px";

export default function EnvelopeBackdrop({
  color = DEFAULT_ENVELOPE_BODY_COLOR,
  flapColor,
  liner = DEFAULT_ENVELOPE_LINER,
  innerLiner,
  shadowColor,
  stampEmoji = null,
  stickerEmoji = null,
  className = "",
}: EnvelopeBackdropProps) {
  const bodyColor = color || DEFAULT_ENVELOPE_BODY_COLOR;
  const flapPaperColor = flapColor || DEFAULT_ENVELOPE_FLAP_COLOR;

  // Resolve liner: use Evite warm checkered liner as default or selected liner
  let rawLiner = innerLiner || liner || DEFAULT_ENVELOPE_LINER;
  if (
    !rawLiner ||
    rawLiner === "none" ||
    rawLiner === "autumn-gingham" ||
    rawLiner === "autumn-gingham-liner" ||
    rawLiner.includes("repeating-linear-gradient(45deg") ||
    rawLiner.includes("vertical-pink-stripes") ||
    rawLiner.includes("pink-stripes")
  ) {
    rawLiner = DEFAULT_ENVELOPE_LINER;
  }

  const isImageLiner = Boolean(
    rawLiner &&
      (rawLiner.startsWith("/") ||
        rawLiner.startsWith("http") ||
        /\.(png|jpe?g|svg|webp)($|\?)/i.test(rawLiner)) &&
      !rawLiner.includes("url(")
  );
  const linerPattern = isImageLiner
    ? `url('${rawLiner}') center / cover no-repeat`
    : rawLiner;

  return (
    <div
      data-testid="open-vertical-envelope-backdrop"
      className={`relative w-full h-full pointer-events-none select-none rounded-2xl ${className}`}
      style={{
        filter: shadowColor
          ? `drop-shadow(0 14px 28px ${shadowColor}) drop-shadow(0 4px 10px rgba(0,0,0,0.18))`
          : "drop-shadow(0 14px 32px rgba(0,0,0,0.32)) drop-shadow(0 4px 10px rgba(0,0,0,0.18))",
      }}
    >
      {/* ─── 1. FULL ENVELOPE BASE (Kraft Brown Paper) ────────────────────── */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{ backgroundColor: bodyColor }}
      >
        {/* Subtle paper ambient lighting */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, transparent 40%, rgba(0,0,0,0.12) 100%)",
          }}
        />

        {/* ─── 2. UPPER HALF: OPEN FLAP INTERIOR WITH CHECKERED LINER ─────── */}
        {/* The open flap extends across the upper 52% of the envelope */}
        <div
          className="absolute inset-x-0 top-0 overflow-hidden"
          style={{ height: "52%" }}
        >
          {/* Inner liner with paper border */}
          <div
            className="absolute rounded-t-xl overflow-hidden"
            style={{
              top: "10px",
              left: "10px",
              right: "10px",
              bottom: "4px",
              background: linerPattern,
              backgroundColor: "#ffffff",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
            }}
          >
            {/* Paper lighting on liner */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 45%, rgba(0,0,0,0.12) 100%)",
              }}
            />
          </div>

          {/* Crease shadow at bottom of upper flap */}
          <div
            className="absolute bottom-0 inset-x-0 pointer-events-none"
            style={{
              height: "4px",
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* ─── 3. LOWER HALF: FRONT ENVELOPE BODY (Solid Kraft Paper) ──────── */}
        {/* Begins at 48% height and extends to bottom with realistic diagonal fold crease */}
        <div
          className="absolute inset-x-0 bottom-0 rounded-b-2xl overflow-hidden"
          style={{
            top: "48%",
            backgroundColor: bodyColor,
            boxShadow: "0 -2px 6px rgba(0,0,0,0.18)",
          }}
        >
          {/* Subtle paper gradient on lower body */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(170deg, rgba(255,255,255,0.10) 0%, transparent 45%, rgba(0,0,0,0.12) 100%)",
            }}
          />

          {/* Diagonal crease fold: running from top-right down towards bottom */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(150deg, transparent 48.8%, rgba(0,0,0,0.18) 50%, rgba(255,255,255,0.10) 51.5%, transparent 53%)",
            }}
          />

          {/* Bottom flap crease */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{
              height: "55%",
              clipPath: "polygon(0% 100%, 50% 35%, 100% 100%)",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.18) 0%, rgba(255,255,255,0.06) 65%, transparent 100%)",
            }}
          />

          {/* Bottom rim shadow */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none rounded-b-2xl"
            style={{
              height: "35%",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* ─── 4. OPEN FLAP DIAGONAL FOLD AT TOP-RIGHT ─────────────────────── */}
        {/* Fold crease from top-left to right-middle (48%) */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0,
            right: 0,
            width: "55%",
            height: "48%",
            clipPath: "polygon(100% 0%, 100% 100%, 0% 0%)",
            backgroundColor: flapPaperColor,
            opacity: 0.95,
          }}
        >
          {/* Flap lighting */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(215deg, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)",
            }}
          />
          {/* Fold crease shadow */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: "4px",
              background:
                "linear-gradient(to right, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 70%, transparent 100%)",
            }}
          />
        </div>

        {/* Inset border & bevel */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 2px 4px rgba(0,0,0,0.15)",
          }}
        />
      </div>

      {/* ─── 5. OPTIONAL STAMP & WAX SEAL ───────────────────────────────────── */}
      {stampEmoji && (
        <div className="absolute top-4 right-4 w-9 h-9 rounded bg-white/20 border border-white/30 flex items-center justify-center text-base shadow-sm pointer-events-none z-10">
          {stampEmoji}
        </div>
      )}

      {stickerEmoji && (
        <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-lg pointer-events-none z-20">
          {stickerEmoji}
        </div>
      )}
    </div>
  );
}
