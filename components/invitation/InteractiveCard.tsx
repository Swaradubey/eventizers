"use client";

import React, { useEffect, useState } from "react";
import { getProxyImageUrl } from "@/components/designer/canvasBackgroundUtils";
import type { InvitationCardBackground, InvitationCardLayer } from "./invitationCardArtwork";

// =============================================================================
// Interactive invitation card
//
// Renders the card the same way the studio canvas does: background (image or
// paint) → decorative frames → photo layers → text layers, all positioned in
// percentages over a 500px design width so typography scales with the card.
//
// Branches:
//   1. live layers      → background + decorations + text/photo layers
//   2. static image     → saved snapshot / template preview image
//   3. themed fallback  → accent label + title + date on the card paint
// =============================================================================

export interface InteractiveCardProps {
  width: number;
  aspectRatio: number;
  background?: InvitationCardBackground | null;
  backgroundColor?: string;
  decorations?: string[];
  layers?: InvitationCardLayer[];
  imageSrc?: string | null;
  fontFamily?: string;
  accentColor?: string;
  textColor?: string;
  fallbackTitle?: string;
  fallbackDate?: string | null;
  onImageLoad?: (aspectRatio: number) => void;
  onImageError?: () => void;
}

const BASE_DESIGN_WIDTH = 500;

function foilClassFor(layer: InvitationCardLayer): string {
  if (layer.isFoil === "gold") return "foil-gold";
  if (layer.isFoil === "rose-gold") return "foil-rose-gold";
  if (layer.isFoil === "silver") return "foil-silver";
  return "";
}

export default function InteractiveCard({
  width,
  aspectRatio,
  background,
  backgroundColor = "#ffffff",
  decorations = [],
  layers = [],
  imageSrc = null,
  fontFamily,
  accentColor = "#C9A84C",
  textColor = "#1A1118",
  fallbackTitle,
  fallbackDate,
  onImageLoad,
  onImageError,
}: InteractiveCardProps) {
  const scaleFactor = width / BASE_DESIGN_WIDTH;
  const height = Math.round(width / (aspectRatio > 0 ? aspectRatio : 5 / 7));

  const [bgFailed, setBgFailed] = useState(false);
  const [bgSrc, setBgSrc] = useState<string | null>(background?.type === "image" ? background.value : null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setBgFailed(false);
    setBgSrc(background?.type === "image" ? background.value : null);
  }, [background?.type, background?.value]);

  useEffect(() => {
    setImgFailed(false);
  }, [imageSrc]);

  const hasLayers = layers.length > 0;
  const showImage = !hasLayers && !!imageSrc && !imgFailed;
  const showBackground = background?.type === "image" && !!bgSrc && !bgFailed;

  const shellStyle: React.CSSProperties = {
    position: "relative",
    width,
    height,
    overflow: "hidden",
    boxSizing: "border-box",
    userSelect: "none",
    WebkitUserSelect: "none",
    backgroundColor:
      background?.type === "color" ? background.value || backgroundColor : backgroundColor,
    backgroundImage:
      !showImage && background?.type === "gradient" ? background.value : undefined,
    boxShadow: "0 26px 60px rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.35)",
  };

  const handleBgError = () => {
    if (background?.value && !bgFailed) {
      const proxied = getProxyImageUrl(background.value);
      if (proxied && proxied !== bgSrc) {
        setBgSrc(proxied);
        return;
      }
    }
    setBgFailed(true);
  };

  return (
    <div className="rounded-xl" style={shellStyle}>
      {/* 1. Background paint */}
      {showImage ? (
        <img
          src={imageSrc!}
          alt={fallbackTitle || "Invitation card"}
          onLoad={(e) => {
            const el = e.currentTarget;
            if (el.naturalWidth > 0 && el.naturalHeight > 0) {
              onImageLoad?.(el.naturalWidth / el.naturalHeight);
            }
          }}
          onError={() => {
            setImgFailed(true);
            onImageError?.();
          }}
          className="block w-full h-full"
          style={{ objectFit: "cover", zIndex: 0, position: "absolute", inset: 0 }}
        />
      ) : (
        showBackground && (
          <img
            src={bgSrc!}
            alt=""
            aria-hidden
            onError={handleBgError}
            className="absolute inset-0 pointer-events-none select-none"
            style={{
              width: "100%",
              height: "100%",
              objectFit: background!.value.includes("/uploads/") ? "contain" : "cover",
              zIndex: 0,
            }}
          />
        )
      )}

      {/* 2. Decorative frames / illustrations */}
      {!showImage &&
        decorations.map((source, idx) => (
          <img
            key={`decoration-${idx}`}
            src={source}
            alt=""
            aria-hidden
            className="absolute inset-0 pointer-events-none select-none"
            style={{ width: "100%", height: "100%", objectFit: "contain", zIndex: 2 }}
          />
        ))}

      {/* 3. Live canvas layers (photo slots + text) */}
      {!showImage &&
        hasLayers &&
        layers.map((layer, idx) => {
          const left = `${layer.x ?? 50}%`;
          const top = `${layer.y ?? 50}%`;
          const rotation = layer.rotation ? `rotate(${layer.rotation}deg)` : "";
          const key = layer.id || layer.key || `layer-${idx}`;

          if (layer.imageUrl) {
            const elWidth = layer.width ? Math.round(layer.width * scaleFactor) : 120;
            const elHeight = layer.height ? Math.round(layer.height * scaleFactor) : 120;
            return (
              <div
                key={key}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: `${elWidth}px`,
                  height: `${elHeight}px`,
                  transform: `translate(-50%, -50%) ${rotation}`,
                  zIndex: 10,
                  overflow: "hidden",
                  borderRadius: layer.borderRadius || "9999px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  pointerEvents: "none",
                }}
              >
                <img
                  src={layer.imageUrl}
                  alt=""
                  aria-hidden
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            );
          }

          const content = (layer.text || "").trim();
          if (!content) return null;

          const foilClass = foilClassFor(layer);
          return (
            <div
              key={key}
              className={foilClass}
              style={{
                position: "absolute",
                left,
                top,
                transform: `translate(-50%, -50%) ${rotation}`,
                maxWidth: "92%",
                width: "max-content",
                height: "auto",
                fontFamily: layer.fontFamily || fontFamily || "Inter, sans-serif",
                fontSize: `${Math.max(8, Math.round((layer.fontSize || 24) * scaleFactor))}px`,
                color: foilClass ? undefined : layer.color || textColor,
                textAlign: (layer.textAlign || layer.align || "center") as React.CSSProperties["textAlign"],
                fontWeight: layer.fontWeight ?? 400,
                fontStyle: layer.fontStyle || "normal",
                lineHeight: layer.lineHeight || 1.25,
                letterSpacing:
                  typeof layer.letterSpacing === "number"
                    ? `${Math.round(layer.letterSpacing * scaleFactor)}px`
                    : layer.letterSpacing || "normal",
                textTransform:
                  layer.casing && layer.casing !== "none"
                    ? (layer.casing as React.CSSProperties["textTransform"])
                    : undefined,
                opacity: layer.opacity !== undefined ? layer.opacity : undefined,
                whiteSpace: "pre-wrap",
                boxSizing: "border-box",
                zIndex: 20,
                pointerEvents: "none",
              }}
            >
              {content}
            </div>
          );
        })}

      {/* 4. Themed fallback when nothing else can be rendered */}
      {!showImage && !hasLayers && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-center"
          style={{ padding: 24, zIndex: 20 }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.28em]"
            style={{ color: accentColor }}
          >
            Save the Date
          </span>
          {fallbackTitle && (
            <h2
              className="leading-tight"
              style={{
                fontFamily: fontFamily || "'Inter', system-ui, sans-serif",
                fontSize: Math.max(20, Math.round(28 * scaleFactor)),
                fontWeight: 700,
                color: textColor,
                maxWidth: "92%",
              }}
            >
              {fallbackTitle}
            </h2>
          )}
          {fallbackDate && (
            <p className="text-xs font-semibold" style={{ color: accentColor }}>
              {fallbackDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
