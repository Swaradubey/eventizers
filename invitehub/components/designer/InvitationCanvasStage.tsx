"use client";

import React, { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { Upload } from "lucide-react";
import { CanvasStageConfig, TextLayer } from "../../types/invitationTypes";
import { getCleanTemplateSvg } from "./InvitationStudio";
import EvitePureCssStage from "./EvitePureCssStage";
import { computeAntiCollisionLayout, ContainerDimensions } from "./layoutUtils";

export const ENVELOPE_LINERS_DATA: Record<string, string> = {
  none: "rgba(0,0,0,0.02)",
  "gold-foil": "linear-gradient(135deg, #bf953f, #fcf6ba, #b38728)",
  "silver-foil": "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 40%, #b8c6db 70%, #f5f7fa 100%)",
  "pink-gingham":
    "repeating-linear-gradient(0deg, #fcdde3, #fcdde3 14px, #ffffff 14px, #ffffff 28px), repeating-linear-gradient(90deg, rgba(244,114,182,0.3), rgba(244,114,182,0.3) 14px, transparent 14px, transparent 28px)",
  "sage-mist": "linear-gradient(135deg, #a3b899 0%, #8ea383 100%)",
  "ivory-linen": "linear-gradient(135deg, #fdfbf7 0%, #f4f0e8 100%)",
  "pink-glitter": "radial-gradient(circle at 50% 50%, #f472b6, #db2777)",
  sprinkles:
    "repeating-linear-gradient(45deg, #fbcfe8, #fbcfe8 10px, #fef08a 10px, #fef08a 20px, #67e8f9 20px, #67e8f9 30px)",
  "electric-gradient": "conic-gradient(at top left, #f43f5e, #eab308, #06b6d4, #8b5cf6, #f43f5e)",
  marble: "linear-gradient(120deg, #f1f5f9 0%, #e2e8f0 50%, #ffffff 100%)",
  botanical: "linear-gradient(135deg, #dcfce7, #86efac)",
};

export const STAMPS_DATA: Record<string, string> = {
  airmail: "✈️",
  rose: "🌹",
  wax: "⚜️",
  cake: "🎂",
};

export const STICKERS_DATA: Record<string, string> = {
  star: "⭐",
  heart: "💖",
  love: "💌",
  sparkle: "✨",
};

export interface InvitationCanvasStageProps {
  config: CanvasStageConfig;
  readOnly?: boolean;
  selectedTextId?: string | null;
  onSelectLayer?: (id: string) => void;
  onUpdateLayer?: (id: string, updates: Partial<TextLayer>) => void;
  editingTextId?: string | null;
  setEditingTextId?: (id: string | null) => void;
  stageRef?: any;
  cardRef?: any;
  zoom?: number;
  maxW?: number;
  aspectRatio?: string;
  className?: string;
  onPhotoClick?: () => void;
  photoInputRef?: any;
  onCardClick?: () => void;
  onBackdropClick?: () => void;
}

export default function InvitationCanvasStage({
  config,
  readOnly = false,
  selectedTextId = null,
  onSelectLayer,
  onUpdateLayer,
  editingTextId = null,
  setEditingTextId,
  stageRef,
  cardRef,
  zoom = 100,
  maxW = 540,
  aspectRatio = "5/7",
  className = "",
  onPhotoClick,
  photoInputRef,
  onCardClick,
  onBackdropClick,
}: InvitationCanvasStageProps) {
  const localCardRef = useRef<HTMLDivElement>(null);
  const effectiveCardRef: any = cardRef || localCardRef;

  const [cardDimensions, setCardDimensions] = useState<ContainerDimensions>({
    width: maxW || 500,
    height: Math.round((maxW || 500) * 1.4),
  });

  useEffect(() => {
    const el = effectiveCardRef.current;
    if (!el) return;
    const updateDims = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCardDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };
    updateDims();
    const ro = new ResizeObserver(updateDims);
    ro.observe(el);
    return () => ro.disconnect();
  }, [effectiveCardRef]);

  // Compute container-proportional typography and anti-collision layer positions
  const computedLayers = useMemo(() => {
    return computeAntiCollisionLayout(config.textLayers || [], cardDimensions);
  }, [config.textLayers, cardDimensions]);

  const dragSessionRef = useRef<{
    layerId: string;
    startX: number;
    startY: number;
    initPercentX: number;
    initPercentY: number;
    cardW: number;
    cardH: number;
  } | null>(null);

  // Mouse and touch drag handler on canvas text layers
  const handleLayerMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent, layer: TextLayer) => {
      if (readOnly) return;
      if (editingTextId === layer.id) return;

      e.stopPropagation();
      if ("preventDefault" in e) {
        e.preventDefault();
      }

      if (onSelectLayer) onSelectLayer(layer.id);
      if (editingTextId && editingTextId !== layer.id && setEditingTextId) {
        setEditingTextId(null);
      }

      const card =
        (effectiveCardRef.current as HTMLDivElement | null) ||
        (document.getElementById("invitation-card-container") as HTMLDivElement | null);
      if (!card) return;

      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const initialX = layer.left !== undefined ? layer.left : (layer.x !== undefined ? layer.x : 50);
      const initialY = layer.top !== undefined ? layer.top : (layer.y !== undefined ? layer.y : 50);

      dragSessionRef.current = {
        layerId: layer.id,
        startX: clientX,
        startY: clientY,
        initPercentX: initialX,
        initPercentY: initialY,
        cardW: rect.width,
        cardH: rect.height,
      };

      const originalUserSelect = document.body.style.userSelect;
      const originalCursor = document.body.style.cursor;
      document.body.style.userSelect = "none";
      document.body.style.cursor = "move";

      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        if (!dragSessionRef.current) return;
        const { layerId, startX, startY, initPercentX, initPercentY, cardW, cardH } =
          dragSessionRef.current;

        const currentX = "touches" in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
        const currentY = "touches" in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;

        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        const deltaPercentX = (deltaX / cardW) * 100;
        const deltaPercentY = (deltaY / cardH) * 100;

        const newX = Math.round(Math.max(5, Math.min(95, initPercentX + deltaPercentX)));
        const newY = Math.round(Math.max(5, Math.min(95, initPercentY + deltaPercentY)));

        if (onUpdateLayer) {
          onUpdateLayer(layerId, { x: newX, y: newY, left: newX, top: newY });
        }
      };

      const handleEnd = () => {
        dragSessionRef.current = null;
        document.body.style.userSelect = originalUserSelect;
        document.body.style.cursor = originalCursor;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleEnd);
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", handleEnd);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove, { passive: true });
      window.addEventListener("touchend", handleEnd);
    },
    [readOnly, onSelectLayer, editingTextId, setEditingTextId, onUpdateLayer, effectiveCardRef]
  );

  // Resolve Envelope Outer Color & Liner Style
  const envelopeOuterColor =
    (config.envelope as any)?.outerColor || config.envelope?.color || "#781d60";
  const linerRaw =
    (config.envelope as any)?.linerPatternUrl || config.envelope?.liner || "";
  // Support pure-CSS liner (linerCss) OR legacy lookup-table liner
  const envelopeLinerCss = (config.envelope as any)?.linerCss || "";
  const linerStyle =
    envelopeLinerCss || ENVELOPE_LINERS_DATA[linerRaw] || linerRaw || "rgba(0,0,0,0.02)";

  // Resolve Stamp & Sticker
  const stampEmoji = config.envelope?.stamp
    ? STAMPS_DATA[config.envelope.stamp] || config.envelope.stamp
    : null;
  const stickerEmoji = config.envelope?.sticker
    ? STICKERS_DATA[config.envelope.sticker] || config.envelope.sticker
    : null;

  // Resolve Clean Card Artwork: strip baked text SVGs
  const cardImageRaw =
    config.card?.artworkUrl ||
    (config.cardBg?.type === "image" && config.cardBg.value ? config.cardBg.value : null);
  const cleanCardImage =
    cardImageRaw && !cardImageRaw.startsWith("#") ? getCleanTemplateSvg(cardImageRaw) || cardImageRaw : null;

  const cardBgColor =
    config.card?.backgroundColor ||
    (config.cardBg?.type === "color"
      ? config.cardBg.value
      : config.cardBg?.type === "image"
      ? "#faf8f5"
      : "#ffffff");

  const cardAspectRatio =
    config.card?.aspectRatio === "5x7"
      ? "5/7"
      : config.card?.aspectRatio === "square"
      ? "1/1"
      : aspectRatio;

  const backdropValue =
    (config as any)?.canvasWorkspaceBg ||
    (config as any)?.backdropBackground ||
    config.backdrop?.value ||
    config.stageBackdrop?.value ||
    "#0f172a";

  const backdropGradient =
    (config as any)?.canvasWorkspaceBg ||
    (config as any)?.backdropBackground ||
    config.stageBackdrop?.gradient ||
    (config.stageBackdrop?.value?.includes("gradient") ? config.stageBackdrop.value : undefined) ||
    (config.backdrop as any)?.gradient ||
    (backdropValue.includes("gradient") ? backdropValue : undefined);

  const isBackdropGradient = Boolean(backdropGradient && backdropGradient.includes("gradient"));

  // Foil class helper
  const getFoilClass = (foil?: string | null) => {
    if (foil === "gold") return "foil-gold";
    if (foil === "rose-gold") return "foil-rose-gold";
    if (foil === "silver") return "foil-silver";
    return "";
  };

  const cardTextureClass =
    config.effects?.texture === "cotton-press"
      ? "texture-cotton-press"
      : config.effects?.texture === "linen"
      ? "texture-linen"
      : "";

  const cardShadowStyle =
    config.effects?.shadow === "deep"
      ? "0 25px 50px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.06)"
      : config.effects?.shadow === "floating"
      ? "0 18px 36px -8px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)"
      : config.effects?.shadow === "subtle"
      ? "0 6px 16px rgba(0,0,0,0.12)"
      : "none";

  const isLandscape = Boolean(config.isLandscape);

  // ── PURE-CSS TEMPLATE FAST PATH ──────────────────────────────────────────
  // If the active template has cssConfig, use EvitePureCssStage mode="interactive"
  // to render a pure-CSS zero-image card. The config object is adapted below.
  const cssConfig = (config.card as any)?.cssConfig || null;
  if (cssConfig || (config as any).isPureCss) {
    // Build a minimal template-like object from the config for EvitePureCssStage
    const pureCssTpl = {
      id: (config as any).templateId || config.activeTemplateId || "unknown",
      isPureCss: true,
      canvasWorkspaceBg: backdropGradient || backdropValue,
      backdropBackground: backdropGradient || backdropValue,
      backdrop: {
        gradient: backdropGradient || backdropValue,
        value: backdropValue,
        type: "color" as const,
      },
      envelope: {
        outerColor: envelopeOuterColor,
        linerCss: linerStyle,
        linerPatternUrl: linerRaw,
        isOpen: true,
      },
      card: {
        backgroundColor: cardBgColor,
        cssConfig,
        artworkUrl: "",
        decorativeBorderSvgUrl: "",
        aspectRatio: config.card?.aspectRatio || "portrait",
      },
      textLayers: config.textLayers,
      defaultTextLayers: config.textLayers,
    };

    return (
      <EvitePureCssStage
        template={pureCssTpl}
        overrideTextLayers={config.textLayers as any}
        mode={readOnly ? "preview" : "interactive"}
        selectedTextId={selectedTextId}
        editingTextId={editingTextId}
        stageRef={stageRef}
        cardRef={cardRef}
        zoom={zoom}
        maxW={maxW}
        className={className}
        onTextClick={onSelectLayer}
        onTextDoubleClick={(id) => { if (setEditingTextId) setEditingTextId(id || null); }}
        onTextUpdate={(id, text) => { if (onUpdateLayer) onUpdateLayer(id, { text }); }}
        onTextDrag={(id, top, left) => {
          if (onUpdateLayer) onUpdateLayer(id, { top, left, x: left, y: top } as any);
        }}
        onBackdropClick={() => {
          if (onBackdropClick) onBackdropClick();
          if (onSelectLayer) onSelectLayer("");
          if (setEditingTextId) setEditingTextId(null);
        }}
        onCardClick={() => {
          if (onCardClick) onCardClick();
          if (setEditingTextId) setEditingTextId(null);
        }}
      />
    );
  }

  return (
    /* ========================================================================= */
    /* LAYER 1: Canvas Backdrop (z-index: 1)                                     */
    /* Outer background container spanning the stage/viewport                   */
    /* ========================================================================= */
    <div
      data-layer="1-canvas-backdrop"
      className={`relative w-full h-full flex items-center justify-center p-4 sm:p-8 md:p-12 overflow-auto select-none ${className}`}
      style={{
        zIndex: 1,
        background: isBackdropGradient ? backdropGradient : undefined,
        backgroundColor: isBackdropGradient ? undefined : backdropValue,
        backgroundImage: isBackdropGradient
          ? undefined
          : "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.15) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (onBackdropClick) onBackdropClick();
          if (onSelectLayer) onSelectLayer("");
          if (setEditingTextId) setEditingTextId(null);
        }
      }}
    >
      {/* Container holding Envelope and Card paper */}
      <div
        ref={stageRef as any}
        data-testid="invitation-stage-container"
        className="relative w-full flex flex-col items-center justify-center transition-transform duration-300"
        style={{
          maxWidth: `${maxW}px`,
          minHeight: isLandscape ? "520px" : "620px",
          transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
          transformOrigin: "top center",
        }}
      >
        {/* ========================================================================= */}
        {/* LAYER 2: Envelope & Liner (z-index: 10)                                   */
        /* Outer flap, pocket body, and inner liner pattern                          */}
        {/* ========================================================================= */}

        {/* 2A: Inner Liner Graphic/Pattern (Behind Card) */}
        <div
          data-layer="2-envelope-liner"
          className={`absolute rounded-t-3xl transition-all duration-300 pointer-events-none ${
            isLandscape ? "top-6 w-[96%] sm:w-[98%] h-[290px]" : "top-4 w-[92%] sm:w-[94%] h-[320px]"
          }`}
          style={{
            zIndex: 10,
            background: linerStyle,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            clipPath: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)",
          }}
        />

        {/* 2B: Envelope Outer Flap (Top open triangle behind card) */}
        <div
          data-layer="2-envelope-outer-flap"
          className={`absolute transition-all duration-300 pointer-events-none ${
            isLandscape ? "-top-14 w-[100%] sm:w-[102%] h-[150px]" : "-top-12 w-[98%] sm:w-[100%] h-[160px]"
          }`}
          style={{
            zIndex: 10,
            background: envelopeOuterColor,
            clipPath: "polygon(0 100%, 50% 0%, 100% 100%)",
            filter: "drop-shadow(0 -4px 12px rgba(0,0,0,0.25))",
          }}
        >
          {/* Optional Stamp on Flap */}
          {stampEmoji && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-500/20 border border-amber-300/40 flex items-center justify-center text-xl shadow-xs pointer-events-none">
              {stampEmoji}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* LAYER 3: Invitation Card Surface (z-index: 20)                            */}
        {/* Physical card paper bounding box with 100% clean decorative artwork       */}
        {/* ========================================================================= */}
        <div
          ref={effectiveCardRef}
          id="invitation-card-container"
          data-layer="3-card-surface"
          data-testid="preview-card"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              if (onCardClick) onCardClick();
              if (setEditingTextId) setEditingTextId(null);
            }
          }}
          className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${cardTextureClass}`}
          style={{
            zIndex: 20,
            position: "relative",
            width: isLandscape ? "92%" : "84%",
            aspectRatio: cardAspectRatio,
            backgroundColor: cardBgColor,
            background:
              config.cardBg?.type === "preset" || config.cardBg?.type === "gradient"
                ? config.cardBg.value
                : undefined,
            boxShadow: cardShadowStyle,
          }}
        >
          {/* 3A: Clean Decorative Artwork / Floral Illustrations (Zero pre-baked text strings) */}
          {cleanCardImage && (
            <img
              src={cleanCardImage}
              alt="Card Decorative Artwork"
              crossOrigin="anonymous"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              style={{ zIndex: 0 }}
              draggable={false}
            />
          )}

          {/* 3B: Foil Shimmer Overlay if active */}
          {config.effects?.foil && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                zIndex: 1,
                background:
                  config.effects.foil === "gold"
                    ? "linear-gradient(135deg, transparent 40%, #ffd700 50%, transparent 60%)"
                    : config.effects.foil === "rose-gold"
                    ? "linear-gradient(135deg, transparent 40%, #f7cac9 50%, transparent 60%)"
                    : "linear-gradient(135deg, transparent 40%, #ffffff 50%, transparent 60%)",
              }}
            />
          )}

          {/* 3C: Photo Slot (if configured) */}
          {config.photoSlot && (
            <div
              id="canvas-photo-slot"
              data-testid="canvas-photo-slot"
              onClick={(e) => {
                e.stopPropagation();
                if (!readOnly) {
                  if (onPhotoClick) onPhotoClick();
                  else if (photoInputRef?.current) photoInputRef.current.click();
                }
              }}
              className={`absolute group select-none transition-transform ${
                readOnly ? "cursor-default" : "cursor-pointer hover:scale-[1.02]"
              }`}
              style={{
                left: `${config.photoSlot.x}%`,
                top: `${config.photoSlot.y}%`,
                width: `${config.photoSlot.width}px`,
                height: `${config.photoSlot.height}px`,
                transform: "translate(-50%, -50%)",
                zIndex: 22,
                pointerEvents: "auto",
              }}
              title={readOnly ? "Celebration Photo" : "Click to replace photo"}
            >
              <div
                className="w-full h-full overflow-hidden relative shadow-md border-2 border-amber-400/90 bg-amber-50/80 transition-all"
                style={{
                  borderRadius: config.photoSlot.borderRadius || "9999px",
                }}
              >
                {config.photoSlot.imageUrl ? (
                  <img
                    src={config.photoSlot.imageUrl}
                    alt="Celebration Frame"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50/90 text-amber-800 p-2 text-center">
                    <Upload className="w-6 h-6 mb-1 text-amber-600" />
                    <span className="text-[10px] font-bold">Add Photo</span>
                  </div>
                )}

                {!readOnly && (
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center cursor-pointer">
                    <Upload className="w-5 h-5 mb-1 text-white drop-shadow" />
                    <span className="text-[11px] font-bold drop-shadow leading-tight">Change Photo</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* LAYER 4: Live Interactive Text Elements (z-index: 30)                     */}
          {/* Positioned inside Layer 3's coordinate space with relative % coordinates  */}
          {/* ========================================================================= */}
          {computedLayers.map((layer) => {
            const isSelected = selectedTextId === layer.id;
            const isEditing = editingTextId === layer.id && !readOnly;
            const foilClass = getFoilClass(layer.isFoil || config.effects?.foil);

            return (
              <div
                key={layer.id}
                id={`canvas-text-${layer.id}`}
                data-layer="4-live-text-element"
                data-testid={`text-layer-${layer.id}`}
                onMouseDown={(e) => handleLayerMouseDown(e, layer)}
                onTouchStart={(e) => handleLayerMouseDown(e, layer)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectLayer) onSelectLayer(layer.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (!readOnly && setEditingTextId) {
                    setEditingTextId(layer.id);
                  }
                  if (onSelectLayer) onSelectLayer(layer.id);
                }}
                className={`absolute transition-shadow select-none ${
                  readOnly
                    ? "cursor-pointer hover:ring-1 hover:ring-blue-300/60 rounded-lg"
                    : `cursor-move ${
                        isSelected
                          ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-white/80 rounded-lg"
                          : "hover:ring-1 hover:ring-blue-300 rounded-lg"
                      }`
                }`}
                style={{
                  position: "absolute",
                  left: `${layer.computedLeft}%`,
                  top: `${layer.computedTop}%`,
                  transform: "translate(-50%, -50%)",
                  maxWidth: "92%",
                  width: "max-content",
                  height: "auto",
                  pointerEvents: "auto",
                  zIndex: isSelected ? 35 : 30,
                }}
                title={readOnly ? "Click to view text details in sidebar" : "Drag to reposition • Double-click to edit"}
              >
                {isEditing ? (
                  <textarea
                    autoFocus
                    rows={layer.text.includes("\n") || layer.text.length > 30 ? 3 : 1}
                    value={layer.text}
                    onChange={(e) => {
                      if (onUpdateLayer) onUpdateLayer(layer.id, { text: e.target.value });
                    }}
                    onBlur={() => {
                      if (setEditingTextId) setEditingTextId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape" && setEditingTextId) setEditingTextId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="bg-white/95 border-2 border-blue-500 rounded p-1.5 text-slate-900 resize-none outline-none shadow-xl cursor-text pointer-events-auto"
                    style={{
                      fontFamily: layer.fontFamily,
                      fontSize: `${layer.scaledFontSize}px`,
                      color: layer.color,
                      textAlign: layer.textAlign || layer.align,
                      lineHeight: layer.effectiveLineHeight,
                      fontWeight: layer.fontWeight,
                      letterSpacing: `${layer.letterSpacing || 0}px`,
                      minWidth: "180px",
                    }}
                  />
                ) : (
                  <div
                    className={`px-2.5 py-0.5 whitespace-pre-wrap pointer-events-auto select-none ${foilClass}`}
                    style={{
                      fontFamily: layer.fontFamily,
                      fontSize: `${layer.scaledFontSize}px`,
                      color: foilClass ? undefined : layer.color,
                      textAlign: layer.textAlign || layer.align,
                      textTransform: layer.casing === "none" ? undefined : layer.casing,
                      letterSpacing: `${layer.letterSpacing || 0}px`,
                      lineHeight: layer.effectiveLineHeight,
                      fontWeight: layer.fontWeight,
                      pointerEvents: "auto",
                    }}
                  >
                    {layer.text || "Type text here"}
                  </div>
                )}

                {/* Drag Handles (Visible when selected in interactive Studio mode) */}
                {isSelected && !isEditing && !readOnly && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-600 border border-white rounded-full shadow-xs pointer-events-none" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-600 border border-white rounded-full shadow-xs pointer-events-none" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-600 border border-white rounded-full shadow-xs pointer-events-none" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 border border-white rounded-full shadow-xs pointer-events-none" />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* 2C: Envelope Front Pocket (Lower half holding the card) */}
        <div
          data-layer="2-envelope-pocket-front"
          className={`relative w-full rounded-b-3xl pointer-events-none shadow-2xl transition-all duration-300 ${
            isLandscape ? "-mt-24 h-[190px]" : "-mt-16 h-[200px]"
          }`}
          style={{
            zIndex: 25,
            background: envelopeOuterColor,
            clipPath: "polygon(0 0, 50% 30%, 100% 0, 100% 100%, 0 100%)",
            filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.3))",
          }}
        >
          {/* Envelope Crease & Texture Line */}
          <svg className="w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 70">
            <polygon points="0,0 50,35 100,0" fill="none" stroke="#000" strokeWidth="1.5" />
            <polygon points="0,70 50,35 100,70" fill="none" stroke="#fff" strokeWidth="1.5" />
          </svg>

          {/* Optional Sticker Seal on front flap */}
          {stickerEmoji && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-white/90 shadow-lg border border-black/10 flex items-center justify-center text-2xl pointer-events-none">
              {stickerEmoji}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
