"use client";

import React from "react";
import { getTemplateConfig } from "../../lib/newTemplatesData";

export interface EviteCardPreviewProps {
  template?: any;
  templateId?: string | null;
  event?: any;
  isInteractive?: boolean;
  interactive?: boolean;
  onSelectText?: (layerId: string) => void;
  onTextClick?: (layerId: string) => void;
  hoverScale?: boolean;
  className?: string;
  overrideTextLayers?: any[];
  aspectRatio?: "portrait" | "square" | "5x7" | "3/4" | "full";
  selectedTextId?: string | null;
  editingTextId?: string | null;
  onTextUpdate?: (layerId: string, newText: string) => void;
  onTextDrag?: (layerId: string, newTop: number, newLeft: number) => void;
  cardOnly?: boolean;
}

export const EviteCardPreview: React.FC<EviteCardPreviewProps> = ({
  template,
  templateId,
  event,
  isInteractive = false,
  interactive = false,
  onSelectText,
  onTextClick,
  hoverScale = false,
  className = "",
  overrideTextLayers,
  aspectRatio = "5x7",
  cardOnly = false,
}) => {
  // Resolve template from prop, templateId, or event.selectedTemplateId
  const effectiveTemplateId =
    templateId ||
    template?.id ||
    event?.selectedTemplateId ||
    event?.templateId ||
    null;

  const resolvedTemplate =
    template ||
    (effectiveTemplateId ? getTemplateConfig(effectiveTemplateId) : null) ||
    {};

  const activeInteractive = isInteractive || interactive;
  const handleTextSelect = onSelectText || onTextClick;

  // 1. Resolve Backdrop color or gradient
  const backdropBg =
    resolvedTemplate.backdrop?.gradient ||
    resolvedTemplate.backdrop?.color ||
    (typeof resolvedTemplate.backdrop?.value === "string" ? resolvedTemplate.backdrop.value : null) ||
    resolvedTemplate.gradient ||
    "#F3F4F6";

  // 2. Resolve Envelope & Liner
  const envelopeOuter =
    resolvedTemplate.envelope?.outerColor ||
    resolvedTemplate.envelopeColor ||
    "#1A1A1A";

  const envelopeLiner =
    resolvedTemplate.envelope?.liner ||
    resolvedTemplate.envelope?.linerCss ||
    resolvedTemplate.envelope?.linerPatternUrl ||
    resolvedTemplate.envelopeLiner ||
    "linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)";

  // 3. Resolve Card Surface
  const cardData = resolvedTemplate.card || {};
  const cssConfig = cardData.cssConfig;

  const cardBg =
    cssConfig?.backgroundGradient ||
    cssConfig?.backgroundColor ||
    cardData.backgroundColor ||
    resolvedTemplate.backgroundColor ||
    "#FFFFFF";

  const cardBorder =
    typeof cardData.border === "string"
      ? cardData.border
      : cssConfig?.border
      ? `${cssConfig.border.thickness || 1}px solid ${cssConfig.border.color || "#D4AF37"}`
      : "1px solid rgba(0,0,0,0.08)";

  const cardShadow =
    cssConfig?.paperShadow ||
    "0 10px 25px -5px rgba(0,0,0,0.18), 0 4px 10px -3px rgba(0,0,0,0.1)";

  const accentIcon = cardData.accentIcon || resolvedTemplate.accentIcon;

  // Artwork resolution
  const cardArtwork =
    cardData.artworkUrl ||
    cardData.decorativeBorderSvgUrl ||
    resolvedTemplate.artworkUrl ||
    resolvedTemplate.decorationImage ||
    (!resolvedTemplate.isPureCss ? resolvedTemplate.image || resolvedTemplate.imageUrl : null);

  // Check if event or template has a raster snapshot (PNG/JPEG/WebP or dataUrl)
  const candidateSnapshot =
    event?.imageUrl ||
    event?.coverImage ||
    event?.previewUrl ||
    event?.thumbnailUrl ||
    null;

  const isRasterSnapshot = Boolean(
    candidateSnapshot &&
      (candidateSnapshot.startsWith("data:image/") ||
        candidateSnapshot.includes("/uploads/") ||
        (/\.(png|jpe?g|webp)($|\?)/i.test(candidateSnapshot) && !candidateSnapshot.endsWith("-bg.svg")))
  );

  // If a finalized snapshot image exists, we can display it directly
  const displayArtwork = isRasterSnapshot ? candidateSnapshot : cardArtwork;

  // 4. Resolve layers from override, textLayers, or defaultTextLayers
  const baseLayers: any[] =
    overrideTextLayers && overrideTextLayers.length > 0
      ? overrideTextLayers
      : resolvedTemplate.textLayers && resolvedTemplate.textLayers.length > 0
      ? resolvedTemplate.textLayers
      : resolvedTemplate.defaultTextLayers && resolvedTemplate.defaultTextLayers.length > 0
      ? resolvedTemplate.defaultTextLayers
      : [];

  // Inject customized event values into the text layers
  const rawLayers = baseLayers.map((layer: any) => {
    let text = layer.text || "";
    const key = (layer.key || layer.id || "").toLowerCase();

    if (event) {
      const inv = event.invitation || {};

      // Host / Celebrant / Bride / Couple
      if (key.includes("celebrant") || key.includes("host") || key.includes("names")) {
        text = event.hostName || inv.eventTitle || inv.title || event.title || text;
      }
      // Greeting
      else if (key.includes("greeting")) {
        text = inv.subtitle || text;
      }
      // Subtitle / Event Message / Description
      else if (key.includes("subtitle") || key.includes("message") || key.includes("description")) {
        text = inv.message || event.description || inv.subtitle || text;
      }
      // Main Title
      else if (key === "title" || key === "layer-title") {
        text = inv.title || event.title || text;
      }
      // Date & Time
      else if (key.includes("date") || key.includes("time") || key.includes("datetime")) {
        const evDate = event.eventDate || inv.eventDate;
        const evTime = event.eventTime || inv.eventTime;
        if (evDate) {
          try {
            const dateObj = new Date(evDate);
            const dateFormatted = dateObj.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).toUpperCase();
            if (evTime) {
              const timeParts = String(evTime).split(":");
              let hours = parseInt(timeParts[0], 10);
              const minutes = timeParts[1] || "00";
              const ampm = hours >= 12 ? "PM" : "AM";
              hours = hours % 12 || 12;
              text = `${dateFormatted}\nAT ${hours}:${minutes} ${ampm}`;
            } else {
              text = dateFormatted;
            }
          } catch {
            text = `${evDate}${evTime ? ` AT ${evTime}` : ""}`;
          }
        }
      }
      // Venue
      else if (key.includes("venue")) {
        text = event.venue || inv.eventVenue || text;
      }
      // Address
      else if (key.includes("address")) {
        const addr = [event.address, event.city, event.state].filter(Boolean).join(", ");
        if (addr) text = addr;
      }
      // RSVP
      else if (key.includes("rsvp")) {
        if (inv.buttonText) {
          text = `RSVP: ${inv.buttonText}`;
        }
      }
    }

    return {
      ...layer,
      text,
    };
  });

  const hasCoordinates = rawLayers.some(
    (l) => l.top !== undefined || l.y !== undefined
  );

  const aspectClass =
    aspectRatio === "full"
      ? "w-full h-full"
      : aspectRatio === "3/4" || aspectRatio === "portrait"
      ? "w-full aspect-[3/4]"
      : aspectRatio === "square"
      ? "w-full aspect-square"
      : "w-full aspect-[5/7]";

  return (
    <div
      data-testid={`evite-card-preview-${effectiveTemplateId || "custom"}`}
      className={`relative ${aspectClass} overflow-hidden rounded-xl flex items-center justify-center select-none transition-transform duration-300 ${
        hoverScale ? "group-hover:scale-[1.02]" : ""
      } ${className}`}
      style={{ background: cardOnly ? undefined : backdropBg }}
    >
      {/* 1. Envelope & Gold Liner (Behind Card) — only when cardOnly is false */}
      {!cardOnly && (
        <div
          className="absolute right-[-15%] top-[10%] w-[80%] h-[90%] rotate-[12deg] rounded-sm shadow-md pointer-events-none overflow-hidden"
          style={{ backgroundColor: envelopeOuter }}
        >
          <div
            className="w-full h-1/2"
            style={{ background: envelopeLiner }}
          />
        </div>
      )}

      {/* 2. Clean Card Surface (White/Theme Paper Box) */}
      <div
        className={`relative z-10 ${
          cardOnly ? "w-full h-full" : "w-[78%] h-[88%]"
        } rounded-xl shadow-xl flex flex-col items-center justify-between p-3.5 sm:p-4 overflow-hidden`}
        style={{
          background: cardBg,
          border: cardBorder,
          boxShadow: cardShadow,
          borderRadius: cssConfig?.borderRadius || "12px",
        }}
      >
        {/* Background Artwork / Vector SVG */}
        {displayArtwork && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={displayArtwork}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ zIndex: 0 }}
          />
        )}

        {/* Optional Clean Corner/Header Icon (e.g. Champagne Glasses) */}
        {accentIcon && !isRasterSnapshot && (
          <div className="relative z-10 text-xl sm:text-2xl text-neutral-800 pointer-events-none mb-1">
            {accentIcon}
          </div>
        )}

        {/* 3. Live Scaled Typography Overlay (Hidden if displaying finalized raster snapshot) */}
        {!isRasterSnapshot && (
          <>
            {hasCoordinates ? (
              <div className="absolute inset-0 z-20 w-full h-full pointer-events-none">
                {rawLayers.map((layer: any) => {
                  const isFoil = Boolean(layer.foilGradient || layer.isFoil);
                  const baseFontSize = layer.fontSize || 14;
                  // Proportional scale factor for card preview container
                  const fontScale = Math.max(7.5, Math.round(baseFontSize * 0.52));
                  const topPct =
                    layer.top !== undefined
                      ? layer.top
                      : layer.y !== undefined
                      ? layer.y
                      : 50;
                  const leftPct =
                    layer.left !== undefined
                      ? layer.left
                      : layer.x !== undefined
                      ? layer.x
                      : 50;

                  return (
                    <div
                      key={layer.id}
                      onClick={() => activeInteractive && handleTextSelect?.(layer.id)}
                      className={`absolute transition-opacity whitespace-pre-line text-center pointer-events-auto ${
                        activeInteractive ? "cursor-pointer hover:opacity-80" : ""
                      }`}
                      style={{
                        top: `${topPct}%`,
                        left: `${leftPct}%`,
                        transform: "translate(-50%, -50%)",
                        maxWidth: "88%",
                        width: "max-content",
                        fontFamily: layer.fontFamily || "serif",
                        fontSize: `${fontScale}px`,
                        fontWeight: layer.fontWeight || 500,
                        color: layer.color || "#111827",
                        background: isFoil
                          ? layer.foilGradient ||
                            "linear-gradient(135deg, #ffd700 0%, #b8860b 100%)"
                          : undefined,
                        WebkitBackgroundClip: isFoil ? "text" : undefined,
                        WebkitTextFillColor: isFoil ? "transparent" : undefined,
                        letterSpacing:
                          layer.letterSpacing !== undefined
                            ? `${layer.letterSpacing}px`
                            : "normal",
                        textAlign: layer.textAlign || layer.align || "center",
                        textTransform:
                          layer.casing && layer.casing !== "none"
                            ? layer.casing
                            : undefined,
                        lineHeight: layer.lineHeight || 1.25,
                        zIndex: 30,
                        textShadow: "0 1px 1px rgba(255,255,255,0.4)",
                      }}
                    >
                      {layer.text}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="relative z-20 w-full flex flex-col items-center justify-around flex-grow text-center py-1 pointer-events-none">
                {rawLayers.map((layer: any) => {
                  const isFoil = Boolean(layer.foilGradient || layer.isFoil);
                  const baseFontSize = layer.fontSize || 14;
                  const fontScale = Math.max(7.5, Math.round(baseFontSize * 0.45));

                  return (
                    <div
                      key={layer.id}
                      onClick={() => activeInteractive && handleTextSelect?.(layer.id)}
                      className={`w-full transition-opacity whitespace-pre-line pointer-events-auto ${
                        activeInteractive ? "cursor-pointer hover:opacity-80" : ""
                      }`}
                      style={{
                        fontFamily: layer.fontFamily || "serif",
                        fontSize: `${fontScale}px`,
                        fontWeight: layer.fontWeight || 500,
                        color: layer.color || "#111827",
                        background: isFoil
                          ? layer.foilGradient ||
                            "linear-gradient(135deg, #ffd700 0%, #b8860b 100%)"
                          : undefined,
                        WebkitBackgroundClip: isFoil ? "text" : undefined,
                        WebkitTextFillColor: isFoil ? "transparent" : undefined,
                        letterSpacing:
                          layer.letterSpacing !== undefined
                            ? `${layer.letterSpacing}px`
                            : "normal",
                        textAlign: layer.textAlign || layer.align || "center",
                        textTransform:
                          layer.casing && layer.casing !== "none"
                            ? layer.casing
                            : undefined,
                        lineHeight: layer.lineHeight || 1.2,
                        zIndex: 30,
                      }}
                    >
                      {layer.text}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EviteCardPreview;
