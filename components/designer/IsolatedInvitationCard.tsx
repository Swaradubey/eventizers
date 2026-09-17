"use client";

import React, { forwardRef } from "react";

export interface IsolatedCardElement {
  id: string;
  type: "text" | "image";
  content: string;
  text?: string;
  x: number; // percentage (0-100) relative to card container width
  y: number; // percentage (0-100) relative to card container height
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation?: number;
  width?: number;
  height?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: "left" | "center" | "right";
  letterSpacing?: number | string;
  lineHeight?: number;
  casing?: "uppercase" | "lowercase" | "capitalize" | "none";
  isFoil?: "gold" | "rose-gold" | "silver" | null;
  // Image element specific properties (e.g. photo slot)
  src?: string;
  borderRadius?: string;
}

export interface IsolatedInvitationData {
  templateId: string;
  backgroundImage: string | null;
  backgroundColor?: string;
  aspectRatio?: string; // "5/7", "1/1", "4/3", "square"
  isLandscape?: boolean;
  cardImageFit?: "cover" | "contain";
  decorations?: string[];
  effects?: {
    foil?: "gold" | "rose-gold" | "silver" | null;
    texture?: "matte" | "cotton-press" | "linen" | "glossy";
  };
  elements: IsolatedCardElement[];
}

export interface IsolatedInvitationCardProps {
  data: IsolatedInvitationData;
  cardWidth?: number; // Base width for offscreen rendering, defaults to 600px
}

/**
 * Isolated Pure-Data Invitation Card:
 * Completely decoupled from the interactive canvas editor.
 * Contains ZERO editor controls, selection bounds, transform handles, or dynamic inputs.
 * Renders standard static HTML nodes with absolute positions for pristine snapshot capture.
 */
const IsolatedInvitationCard = forwardRef<HTMLDivElement, IsolatedInvitationCardProps>(
  ({ data, cardWidth = 600 }, ref) => {
    const isLandscape = Boolean(data.isLandscape);
    const ratioStr = data.aspectRatio || (isLandscape ? "4/3" : "5/7");

    let cardHeight = Math.round((cardWidth * 7) / 5); // 5/7 default = 840px for 600px width
    if (ratioStr === "1/1" || ratioStr === "square") {
      cardHeight = cardWidth;
    } else if (ratioStr === "4/3" || isLandscape) {
      cardHeight = Math.round((cardWidth * 3) / 4);
    }

    // Scale font size proportionally from base design width (500px)
    const scaleFactor = cardWidth / 500;

    return (
      <div
        ref={ref}
        id="isolated-invitation-card-stage"
        data-testid="isolated-invitation-card-stage"
        style={{
          position: "relative",
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          backgroundColor: data.backgroundColor || "#ffffff",
          overflow: "hidden",
          boxSizing: "border-box",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Base Clean Artwork / Background Image (Guaranteed textless SVG or user upload) */}
        {data.backgroundImage && (
          <img
            src={data.backgroundImage}
            alt="Invitation Card Artwork"
            crossOrigin="anonymous"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: data.cardImageFit || (data.backgroundImage.includes("/uploads/") ? "contain" : "cover"),
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Decorative illustrations (balloons, florals, confetti, etc.) */}
        {data.decorations &&
          data.decorations.map((decoSrc, idx) => {
            if (!decoSrc || decoSrc === data.backgroundImage) return null;
            return (
              <img
                key={`isolated-deco-${idx}`}
                src={decoSrc}
                alt="Card Decoration"
                crossOrigin="anonymous"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
            );
          })}

        {/* Foil Shimmer Overlay if active */}
        {data.effects?.foil && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 3,
              pointerEvents: "none",
              opacity: 0.2,
              background:
                data.effects.foil === "gold"
                  ? "linear-gradient(135deg, transparent 40%, #ffd700 50%, transparent 60%)"
                  : data.effects.foil === "rose-gold"
                  ? "linear-gradient(135deg, transparent 40%, #f7cac9 50%, transparent 60%)"
                  : "linear-gradient(135deg, transparent 40%, #ffffff 50%, transparent 60%)",
            }}
          />
        )}

        {/* Static Elements (Text layers and photo/image elements) */}
        {data.elements.map((el) => {
          if (el.type === "image") {
            // Photo slot / image element
            const elWidth = el.width ? Math.round(el.width * scaleFactor) : 120;
            const elHeight = el.height ? Math.round(el.height * scaleFactor) : 120;
            return (
              <div
                key={el.id}
                id={`isolated-element-${el.id}`}
                style={{
                  position: "absolute",
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${elWidth}px`,
                  height: `${elHeight}px`,
                  transform: `translate(-50%, -50%) ${el.rotation ? `rotate(${el.rotation}deg)` : ""}`,
                  zIndex: 10,
                  overflow: "hidden",
                  borderRadius: el.borderRadius || "9999px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {el.src && (
                  <img
                    src={el.src}
                    alt="Card element"
                    crossOrigin="anonymous"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                )}
              </div>
            );
          }

          // Static Text element
          const textContent = el.content || el.text || "";
          if (!textContent.trim()) return null;

          const scaledFontSize = Math.round(el.fontSize * scaleFactor);
          const foilClass =
            el.isFoil === "gold" || data.effects?.foil === "gold"
              ? "foil-gold"
              : el.isFoil === "rose-gold" || data.effects?.foil === "rose-gold"
              ? "foil-rose-gold"
              : el.isFoil === "silver" || data.effects?.foil === "silver"
              ? "foil-silver"
              : "";

          return (
            <div
              key={el.id}
              id={`isolated-element-${el.id}`}
              className={foilClass}
              style={{
                position: "absolute",
                left: `${el.x}%`,
                top: `${el.y}%`,
                transform: `translate(-50%, -50%) ${el.rotation ? `rotate(${el.rotation}deg)` : ""}`,
                maxWidth: "92%",
                width: "max-content",
                height: "auto",
                fontFamily: el.fontFamily || "Inter, sans-serif",
                fontSize: `${scaledFontSize}px`,
                color: foilClass ? undefined : el.color || "#000000",
                textAlign: el.textAlign || "center",
                fontWeight: el.fontWeight || 400,
                fontStyle: el.fontStyle || "normal",
                lineHeight: el.lineHeight || 1.25,
                letterSpacing:
                  typeof el.letterSpacing === "number"
                    ? `${Math.round(el.letterSpacing * scaleFactor)}px`
                    : el.letterSpacing || "normal",
                textTransform: el.casing && el.casing !== "none" ? el.casing : undefined,
                whiteSpace: "pre-wrap",
                boxSizing: "border-box",
                zIndex: 20,
                pointerEvents: "none",
              }}
            >
              {textContent}
            </div>
          );
        })}
      </div>
    );
  }
);

IsolatedInvitationCard.displayName = "IsolatedInvitationCard";

export default IsolatedInvitationCard;
