"use client";

import React from "react";

export interface EviteCardPreviewProps {
  template: any;
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
}

export const EviteCardPreview: React.FC<EviteCardPreviewProps> = ({
  template,
  isInteractive = false,
  interactive = false,
  onSelectText,
  onTextClick,
  hoverScale = false,
  className = "",
  overrideTextLayers,
  aspectRatio = "5x7",
}) => {
  if (!template) return null;

  const activeInteractive = isInteractive || interactive;
  const handleTextSelect = onSelectText || onTextClick;

  // Resolve layers from override, textLayers, or defaultTextLayers
  const rawLayers =
    overrideTextLayers && overrideTextLayers.length > 0
      ? overrideTextLayers
      : template.textLayers && template.textLayers.length > 0
      ? template.textLayers
      : template.defaultTextLayers && template.defaultTextLayers.length > 0
      ? template.defaultTextLayers
      : [];

  // 1. Resolve Backdrop color or gradient
  const backdropBg =
    template.backdrop?.gradient ||
    template.backdrop?.color ||
    (typeof template.backdrop?.value === "string" ? template.backdrop.value : null) ||
    template.gradient ||
    "#F3F4F6";

  // 2. Resolve Envelope & Liner
  const envelopeOuter =
    template.envelope?.outerColor ||
    template.envelopeColor ||
    "#1A1A1A";

  const envelopeLiner =
    template.envelope?.liner ||
    template.envelope?.linerCss ||
    template.envelope?.linerPatternUrl ||
    template.envelopeLiner ||
    "linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)";

  // 3. Resolve Card Surface
  const cardData = template.card || {};
  const cssConfig = cardData.cssConfig;

  const cardBg =
    cssConfig?.backgroundGradient ||
    cssConfig?.backgroundColor ||
    cardData.backgroundColor ||
    template.backgroundColor ||
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

  const accentIcon = cardData.accentIcon || template.accentIcon;

  const cardArtwork =
    cardData.artworkUrl ||
    cardData.decorativeBorderSvgUrl ||
    template.artworkUrl ||
    template.decorationImage ||
    (!template.isPureCss ? template.image || template.imageUrl : null);

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
      data-testid={`evite-card-preview-${template.id}`}
      className={`relative ${aspectClass} overflow-hidden rounded-md flex items-center justify-center select-none transition-transform duration-300 ${
        hoverScale ? "group-hover:scale-[1.02]" : ""
      } ${className}`}
      style={{ background: backdropBg }}
    >
      {/* 1. Envelope & Gold Liner (Behind Card) */}
      <div
        className="absolute right-[-15%] top-[10%] w-[80%] h-[90%] rotate-[12deg] rounded-sm shadow-md pointer-events-none overflow-hidden"
        style={{ backgroundColor: envelopeOuter }}
      >
        <div
          className="w-full h-1/2"
          style={{ background: envelopeLiner }}
        />
      </div>

      {/* 2. Clean Card Surface (White/Theme Paper Box) */}
      <div
        className="relative z-10 w-[78%] h-[88%] rounded-sm shadow-xl flex flex-col items-center justify-between p-3.5 sm:p-4 overflow-hidden"
        style={{
          background: cardBg,
          border: cardBorder,
          boxShadow: cardShadow,
          borderRadius: cssConfig?.borderRadius,
        }}
      >
        {/* Background Artwork / Vector SVG */}
        {cardArtwork && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={cardArtwork}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}

        {/* Optional Clean Corner/Header Icon (e.g. Champagne Glasses) */}
        {accentIcon && (
          <div className="relative z-10 text-xl sm:text-2xl text-neutral-800 pointer-events-none mb-1">
            {accentIcon}
          </div>
        )}

        {/* 3. Live Scaled Typography Overlay */}
        <div className="relative z-10 w-full flex flex-col items-center justify-around flex-grow text-center py-1">
          {rawLayers.map((layer: any) => {
            const isFoil = Boolean(layer.foilGradient);
            const baseFontSize = layer.fontSize || 14;
            const fontScale = Math.max(7.5, Math.round(baseFontSize * 0.42));

            return (
              <div
                key={layer.id}
                onClick={() => activeInteractive && handleTextSelect?.(layer.id)}
                className={`w-full transition-opacity ${
                  activeInteractive ? "cursor-pointer hover:opacity-80" : ""
                }`}
                style={{
                  fontFamily: layer.fontFamily || "serif",
                  fontSize: `${fontScale}px`,
                  fontWeight: layer.fontWeight || 500,
                  color: layer.color || "#111827",
                  background: isFoil ? layer.foilGradient : undefined,
                  WebkitBackgroundClip: isFoil ? "text" : undefined,
                  WebkitTextFillColor: isFoil ? "transparent" : undefined,
                  letterSpacing: layer.letterSpacing !== undefined ? `${layer.letterSpacing}px` : "normal",
                  textAlign: layer.textAlign || layer.align || "center",
                  textTransform: layer.casing || "none",
                  lineHeight: layer.lineHeight || 1.2,
                }}
              >
                {layer.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EviteCardPreview;
