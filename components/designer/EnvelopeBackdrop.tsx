"use client";

import React from "react";

// =============================================================================
// EVITE-EXACT ENVELOPE ENGINE
// Faithfully matches Evite.com's authentic envelope design:
// 1. PEEK VIEW: Sits directly behind the card with open triangular flap extending
//    to the right, displaying inner liner pattern with folded envelope border.
// 2. OPEN VIEW: Upright open envelope with wide hexagonal flap & pocket for card.
// 3. CLOSED VIEW: Addressed envelope front with stamp & "Guest's name will go here".
// =============================================================================

export interface EnvelopeBackdropProps {
  /** Envelope body color — defaults to Evite deep burgundy "#7A1C28" */
  color?: string;
  /** Flap outer border color */
  flapColor?: string;
  /** Interior liner pattern (CSS gradient string or image URL) */
  liner?: string;
  innerLiner?: string;
  shadowColor?: string;
  stamp?: string | null;
  stampEmoji?: string | null;
  stampImage?: string | null;
  sticker?: string | null;
  stickerEmoji?: string | null;
  stickerImage?: string | null;
  className?: string;
  viewMode?: "peek" | "open" | "closed";
  cardDimensions?: { width: number; height: number };
}

export const DEFAULT_ENVELOPE_BODY_COLOR = "#7A1C28"; // Deep Burgundy (Evite Blush Burgundy match)
export const DEFAULT_ENVELOPE_FLAP_COLOR = "#7A1C28";
export const DEFAULT_ENVELOPE_LINER =
  "url('/templates/envelopes/blush-burgundy-liner.png') center / cover no-repeat";

// Stamp data dictionary for quick name/emoji/artwork lookup
export const STAMP_GRAPHICS: Record<string, { name: string; emoji: string; bg: string }> = {
  "blush-floral": { name: "Blush Floral", emoji: "🌸", bg: "#fdf2f4" },
  "pink-roses": { name: "Vintage Roses", emoji: "🌹", bg: "#fce7f3" },
  "red-rose": { name: "Crimson Rose", emoji: "🥀", bg: "#ffe4e6" },
  "sweet-heart": { name: "Heart Love", emoji: "❤️", bg: "#fef2f2" },
  "party-neon": { name: "Party Neon", emoji: "🎉", bg: "#18181b" },
  "holiday-ornament": { name: "Bauble", emoji: "✨", bg: "#fef3c7" },
  "cherries": { name: "Cherries", emoji: "🍒", bg: "#fff1f2" },
  "strawberry": { name: "Strawberry", emoji: "🍓", bg: "#fdf2f8" },
  "moon-stars": { name: "Moon & Stars", emoji: "🌙", bg: "#1e1b4b" },
  "celebrate": { name: "Celebrate", emoji: "🥂", bg: "#fffbeb" },
  "olive-branch": { name: "Olive Branch", emoji: "🌿", bg: "#f0fdf4" },
  "sparkle-magic": { name: "Sparkle Star", emoji: "⭐", bg: "#faf5ff" },
  "birthday-cake": { name: "Birthday Cake", emoji: "🎂", bg: "#fdf4ff" },
  "vintage-airmail": { name: "Airmail", emoji: "✈️", bg: "#eff6ff" },
  "airmail": { name: "Airmail", emoji: "✈️", bg: "#eff6ff" },
  "rose": { name: "Rose", emoji: "🌹", bg: "#fce7f3" },
  "wax": { name: "Wax Seal", emoji: "⚜️", bg: "#fffbeb" },
  "cake": { name: "Cake", emoji: "🎂", bg: "#fdf4ff" },
};

export default function EnvelopeBackdrop({
  color = DEFAULT_ENVELOPE_BODY_COLOR,
  flapColor,
  liner = DEFAULT_ENVELOPE_LINER,
  innerLiner,
  shadowColor,
  stamp = null,
  stampEmoji = null,
  stampImage = null,
  sticker = null,
  stickerEmoji = null,
  stickerImage = null,
  className = "",
  viewMode = "peek",
}: EnvelopeBackdropProps) {
  const bodyColor = color || DEFAULT_ENVELOPE_BODY_COLOR;
  const flapPaperColor = flapColor || bodyColor;

  // Resolve Liner
  let rawLiner = innerLiner || liner || DEFAULT_ENVELOPE_LINER;
  if (!rawLiner || rawLiner === "none") {
    rawLiner = "rgba(255,255,255,0.95)";
  }

  // Check if liner is image URL or CSS gradient
  let linerPattern = rawLiner;
  if (
    (rawLiner.startsWith("/") ||
      rawLiner.startsWith("http") ||
      /\.(png|jpe?g|svg|webp)($|\?)/i.test(rawLiner)) &&
    !rawLiner.includes("url(")
  ) {
    linerPattern = `url('${rawLiner}') center / cover no-repeat`;
  }

  // Resolve stamp
  const activeStampKey = stamp || stampEmoji;
  const stampInfo = activeStampKey
    ? STAMP_GRAPHICS[activeStampKey] || {
        name: activeStampKey,
        emoji: stampEmoji || (activeStampKey.length <= 4 ? activeStampKey : "🌸"),
        bg: "#fdf2f4",
      }
    : null;

  // Resolve sticker
  const activeSticker = sticker || stickerEmoji;

  // =========================================================================
  // VIEW MODE 1: PEEK VIEW (Default in studio behind card - Evite Authentic)
  // Sits behind the card with open flap pointing right and inner liner displayed.
  // =========================================================================
  if (viewMode === "peek") {
    return (
      <div
        data-testid="evite-envelope-peek"
        className={`relative w-full h-full pointer-events-none select-none ${className}`}
        style={{
          filter: shadowColor
            ? `drop-shadow(0 16px 36px ${shadowColor}) drop-shadow(0 4px 12px rgba(0,0,0,0.15))`
            : "drop-shadow(0 16px 36px rgba(0,0,0,0.24)) drop-shadow(0 4px 12px rgba(0,0,0,0.12))",
        }}
      >
        {/* 1. Envelope Back Base (Spans behind the card surface) */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backgroundColor: bodyColor,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {/* Subtle paper grain and ambient lighting */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 45%, rgba(0,0,0,0.15) 100%)",
            }}
          />
        </div>

        {/* 2. Open Flap & Pocket extending out to the right (Evite Exact) */}
        {/* Extends 28% beyond the right edge of the card */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: "100%",
            width: "30%",
            minWidth: "75px",
          }}
        >
          {/* Lower envelope body extension (y: 68% to 100%) */}
          <div
            className="absolute bottom-0 left-0 rounded-br-2xl overflow-hidden"
            style={{
              top: "68%",
              right: "4px",
              backgroundColor: bodyColor,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%, rgba(0,0,0,0.2) 100%)",
              }}
            />
          </div>

          {/* Triangular Open Flap Outer Base */}
          {/* Extends from top fold (y=0) to right point (y=47%) to bottom fold (y=72%) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: "polygon(0% 0%, 100% 47%, 0% 72%)",
              backgroundColor: flapPaperColor,
            }}
          >
            {/* Flap surface ambient lighting */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(155deg, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(0,0,0,0.18) 100%)",
              }}
            />
          </div>

          {/* Inner Liner Triangle (Inset by 14px to show envelope paper border) */}
          <div
            className="absolute pointer-events-none overflow-hidden"
            style={{
              top: "3%",
              left: "4px",
              right: "12px",
              height: "66%",
              clipPath: "polygon(0% 0%, 94% 67%, 0% 100%)",
              background: linerPattern,
              backgroundColor: "#ffffff",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
            }}
          >
            {/* Paper shine overlay on liner */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.15) 0%, transparent 45%, rgba(0,0,0,0.12) 100%)",
              }}
            />
          </div>

          {/* Crease shadow where flap folds out from card edge */}
          <div
            className="absolute top-0 bottom-0 left-0 w-2.5 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
            }}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: OPEN VIEW (Upright open envelope pocket with card tucked in)
  // Matches Evite's envelope customization view when Colors/Liners tab is active.
  // =========================================================================
  if (viewMode === "open") {
    return (
      <div
        data-testid="evite-envelope-open"
        className={`relative w-full h-full pointer-events-none select-none flex items-center justify-center ${className}`}
        style={{
          filter: shadowColor
            ? `drop-shadow(0 20px 42px ${shadowColor}) drop-shadow(0 4px 14px rgba(0,0,0,0.18))`
            : "drop-shadow(0 20px 42px rgba(0,0,0,0.28)) drop-shadow(0 4px 14px rgba(0,0,0,0.18))",
        }}
      >
        {/* Envelope Outer Frame */}
        <div
          className="relative w-full h-full rounded-2xl overflow-visible"
          style={{ backgroundColor: bodyColor }}
        >
          {/* Upper Flap Open Wide Upwards (Tapered trapezoid/hexagon flap) */}
          <div
            className="absolute -top-[32%] inset-x-0 h-[38%] pointer-events-none overflow-hidden"
            style={{
              clipPath: "polygon(12% 100%, 0% 46%, 20% 0%, 80% 0%, 100% 46%, 88% 100%)",
              backgroundColor: flapPaperColor,
            }}
          >
            {/* Flap Outer Paper Lighting */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)",
              }}
            />

            {/* Inset Liner Pattern inside open top flap */}
            <div
              className="absolute rounded-t-xl overflow-hidden"
              style={{
                top: "10px",
                left: "14px",
                right: "14px",
                bottom: "4px",
                clipPath: "polygon(10% 100%, 0% 46%, 18% 0%, 82% 0%, 100% 46%, 90% 100%)",
                background: linerPattern,
                backgroundColor: "#ffffff",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 45%, rgba(0,0,0,0.12) 100%)",
                }}
              />
            </div>
          </div>

          {/* Front Envelope Pocket (V-Neck cut in front of card) */}
          <div
            className="absolute inset-x-0 bottom-0 h-[48%] rounded-b-2xl overflow-hidden z-20 pointer-events-none"
            style={{
              clipPath: "polygon(0% 0%, 50% 38%, 100% 0%, 100% 100%, 0% 100%)",
              backgroundColor: bodyColor,
              boxShadow: "0 -4px 14px rgba(0,0,0,0.22)",
            }}
          >
            {/* Front pocket paper fold lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.1) 0%, transparent 45%, rgba(0,0,0,0.18) 100%)",
              }}
            />
            {/* Diagonal left and right fold shadows */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(45deg, rgba(0,0,0,0.12) 0%, transparent 40%), linear-gradient(-45deg, rgba(0,0,0,0.12) 0%, transparent 40%)",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 3: CLOSED VIEW (Addressed closed envelope with stamp & seal)
  // Matches Evite's envelope customization view when Stamps/Stickers is active.
  // =========================================================================
  return (
    <div
      data-testid="evite-envelope-closed"
      className={`relative w-full h-full pointer-events-none select-none flex items-center justify-center ${className}`}
      style={{
        filter: shadowColor
          ? `drop-shadow(0 18px 38px ${shadowColor}) drop-shadow(0 4px 12px rgba(0,0,0,0.18))`
          : "drop-shadow(0 18px 38px rgba(0,0,0,0.26)) drop-shadow(0 4px 12px rgba(0,0,0,0.14))",
      }}
    >
      <div
        className="relative w-full h-[88%] rounded-2xl overflow-hidden flex flex-col items-center justify-center"
        style={{
          backgroundColor: bodyColor,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 2px 4px rgba(0,0,0,0.15)",
        }}
      >
        {/* Subtle paper ambient lighting */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 45%, rgba(0,0,0,0.15) 100%)",
          }}
        />

        {/* Back Flap Fold Lines if sticker is active */}
        {activeSticker && (
          <div
            className="absolute top-0 inset-x-0 h-[52%] pointer-events-none"
            style={{
              clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
              backgroundColor: flapPaperColor,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 60%, rgba(0,0,0,0.18) 100%)",
              }}
            />
          </div>
        )}

        {/* Postage Stamp in Top-Right Corner */}
        {stampInfo && (
          <div
            className="absolute top-4 right-5 w-14 h-16 sm:w-16 sm:h-18 p-1 rounded-[2px] shadow-md flex flex-col items-center justify-center border-2 border-dashed border-white/60 pointer-events-none z-20"
            style={{
              backgroundColor: stampInfo.bg || "#ffffff",
              boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
            }}
          >
            <span className="text-2xl sm:text-3xl">{stampInfo.emoji}</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-700 mt-1">
              USA POST
            </span>
          </div>
        )}

        {/* Cursive Guest Address Calligraphy (Evite exact) */}
        {!activeSticker && (
          <div className="text-center z-10 px-6">
            <p className="font-serif italic text-2xl sm:text-3xl text-white/95 drop-shadow-sm tracking-wide">
              Guest&apos;s name will go here
            </p>
          </div>
        )}

        {/* Sticker / Wax Seal on Flap Point */}
        {activeSticker && (
          <div
            className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 shadow-xl border-2 border-white flex items-center justify-center text-2xl pointer-events-none z-30"
            style={{
              boxShadow: "0 8px 20px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.8)",
            }}
          >
            {activeSticker}
          </div>
        )}
      </div>
    </div>
  );
}
