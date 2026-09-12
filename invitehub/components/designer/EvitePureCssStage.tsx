"use client";

import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { computeAntiCollisionLayout, ContainerDimensions } from "./layoutUtils";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type StageMode = "thumbnail" | "interactive" | "preview" | "card-only";

export interface CssBorderConfig {
  type: "double-gold" | "triple-line" | "dotted" | "geometric" | "hairline" | "arch" | "none";
  color?: string;
  secondaryColor?: string;
  thickness?: number;
  offset?: number;
  borderRadius?: string;
}

export interface CssCardConfig {
  backgroundColor: string;
  backgroundGradient?: string;
  paperShadow?: string;
  border: CssBorderConfig;
  borderRadius?: string;
  clipPath?: string;
}

export interface StageTextLayer {
  id: string;
  key?: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  color: string;
  textAlign: "left" | "center" | "right";
  top: number;
  left: number;
  foilGradient?: string;
  letterSpacing?: number;
  lineHeight?: number;
  casing?: "uppercase" | "lowercase" | "capitalize" | "none";
  x?: number;
  y?: number;
  align?: "left" | "center" | "right";
}

export interface EvitePureCssStageProps {
  template: any;
  overrideTextLayers?: StageTextLayer[];
  mode?: StageMode;
  aspectRatio?: "portrait" | "square" | "5x7";
  className?: string;
  hoverScale?: boolean;
  selectedTextId?: string | null;
  editingTextId?: string | null;
  onTextClick?: (layerId: string) => void;
  onTextDoubleClick?: (layerId: string) => void;
  onTextUpdate?: (layerId: string, newText: string) => void;
  onTextDrag?: (layerId: string, newTop: number, newLeft: number) => void;
  onBackdropClick?: () => void;
  onCardClick?: () => void;
  stageRef?: React.RefObject<HTMLDivElement>;
  cardRef?: React.RefObject<HTMLDivElement>;
  zoom?: number;
  maxW?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS BORDER OVERLAY — pure HTML div-based borders (zero SVG)
// ─────────────────────────────────────────────────────────────────────────────

function CssBorderOverlay({ border }: { border: CssBorderConfig }) {
  if (!border || border.type === "none") return null;

  const offset = border.offset ?? 12;
  const color = border.color ?? "#000";
  const thickness = border.thickness ?? 1;
  const br = border.borderRadius;

  const base: React.CSSProperties = {
    position: "absolute",
    inset: `${offset}px`,
    pointerEvents: "none",
    zIndex: 2,
    borderRadius: br,
  };

  if (border.type === "double-gold") {
    const sec = border.secondaryColor ?? color;
    return (
      <>
        <div style={{ ...base, border: `${thickness}px solid ${color}` }} />
        <div style={{ ...base, inset: `${offset + 5}px`, border: `${thickness}px solid ${sec}`, opacity: 0.7 }} />
      </>
    );
  }

  if (border.type === "triple-line") {
    const sec = border.secondaryColor ?? color;
    return (
      <>
        <div style={{ ...base, border: `${thickness}px solid ${color}` }} />
        <div style={{ ...base, inset: `${offset + 4}px`, border: `1px dashed ${sec}`, opacity: 0.6 }} />
        <div style={{ ...base, inset: `${offset + 8}px`, border: `${thickness}px solid ${color}`, opacity: 0.8 }} />
      </>
    );
  }

  if (border.type === "dotted") {
    return <div style={{ ...base, border: `${thickness + 1}px dotted ${color}` }} />;
  }

  if (border.type === "hairline") {
    return <div style={{ ...base, border: `${thickness}px solid ${color}`, opacity: 0.5 }} />;
  }

  if (border.type === "arch") {
    return (
      <div
        style={{
          ...base,
          border: `${thickness}px solid ${color}`,
          borderRadius: "140px 140px 16px 16px",
        }}
      />
    );
  }

  if (border.type === "geometric") {
    return (
      <>
        <div style={{ ...base, border: `${thickness}px solid ${color}` }} />
        <div
          style={{
            position: "absolute",
            top: `${offset - 3}px`,
            left: `${offset - 3}px`,
            width: "8px",
            height: "8px",
            background: color,
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: `${offset - 3}px`,
            right: `${offset - 3}px`,
            width: "8px",
            height: "8px",
            background: color,
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: `${offset - 3}px`,
            left: `${offset - 3}px`,
            width: "8px",
            height: "8px",
            background: color,
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: `${offset - 3}px`,
            right: `${offset - 3}px`,
            width: "8px",
            height: "8px",
            background: color,
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      </>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXT LAYER SET
// ─────────────────────────────────────────────────────────────────────────────

interface TextLayerSetProps {
  layers: StageTextLayer[];
  mode: StageMode;
  selectedTextId: string | null;
  editingTextId: string | null;
  cardDimensions?: ContainerDimensions;
  onTextClick?: (id: string) => void;
  onTextDoubleClick?: (id: string) => void;
  onTextUpdate?: (id: string, text: string) => void;
  onLayerMouseDown: (e: React.MouseEvent | React.TouchEvent, layer: StageTextLayer) => void;
}

function TextLayerSet({ layers, mode, selectedTextId, editingTextId, cardDimensions, onTextClick, onTextDoubleClick, onTextUpdate, onLayerMouseDown }: TextLayerSetProps) {
  const isInteractive = mode === "interactive";
  const isThumbnail = mode === "thumbnail" || mode === "card-only";

  const computedLayers = useMemo(() => {
    return computeAntiCollisionLayout(layers as any, cardDimensions || { width: 500, height: 700 });
  }, [layers, cardDimensions]);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30 }}>
      {computedLayers.map((layer) => {
        if (!layer || !layer.text) return null;

        const leftCoord = layer.computedLeft ?? (layer.left !== undefined ? layer.left : layer.x ?? 50);
        const topCoord = layer.computedTop ?? (layer.top !== undefined ? layer.top : layer.y ?? 50);
        const isSelected = selectedTextId === layer.id;
        const isEditing = editingTextId === layer.id && isInteractive;
        const hasFoil = Boolean(layer.foilGradient);

        const textStyle: React.CSSProperties = {
          fontFamily: layer.fontFamily || "'Playfair Display', serif",
          fontSize: `${layer.scaledFontSize}px`,
          fontWeight: layer.fontWeight || 600,
          color: hasFoil ? "transparent" : layer.color || "#1e293b",
          background: hasFoil ? layer.foilGradient : undefined,
          WebkitBackgroundClip: hasFoil ? "text" : undefined,
          backgroundClip: hasFoil ? "text" : undefined,
          WebkitTextFillColor: hasFoil ? "transparent" : undefined,
          textAlign: (layer.textAlign || layer.align || "center") as React.CSSProperties["textAlign"],
          lineHeight: layer.lineHeight || 1.2,
          letterSpacing: layer.letterSpacing ? `${layer.letterSpacing * 0.05}cqw` : "0.02em",
          whiteSpace: "pre-wrap",
          textTransform: layer.casing && layer.casing !== "none" ? layer.casing as React.CSSProperties["textTransform"] : undefined,
        };

        return (
          <div
            key={layer.id || `${topCoord}-${leftCoord}`}
            id={isInteractive ? `canvas-text-${layer.id}` : undefined}
            data-layer="4-live-text-element"
            data-testid={`text-layer-${layer.id}`}
            onMouseDown={(e) => { if (isInteractive) onLayerMouseDown(e, layer as any); }}
            onTouchStart={(e) => { if (isInteractive) onLayerMouseDown(e, layer as any); }}
            onClick={(e) => { if (onTextClick) { e.stopPropagation(); onTextClick(layer.id); } }}
            onDoubleClick={(e) => { if (onTextDoubleClick && isInteractive) { e.stopPropagation(); onTextDoubleClick(layer.id); } }}
            className={`absolute leading-tight transition-shadow select-none ${
              isInteractive
                ? `cursor-move pointer-events-auto ${isSelected ? "ring-2 ring-blue-500 ring-offset-2 rounded-lg" : "hover:ring-1 hover:ring-blue-300 rounded-lg"}`
                : isThumbnail
                ? "pointer-events-none"
                : "pointer-events-auto cursor-pointer hover:ring-1 hover:ring-blue-300/60 rounded-lg"
            }`}
            style={{
              left: `${leftCoord}%`,
              top: `${topCoord}%`,
              transform: "translate(-50%, -50%)",
              width: "max-content",
              maxWidth: "90%",
              zIndex: isSelected ? 35 : 30,
            }}
          >
            {isEditing ? (
              <textarea
                autoFocus
                rows={layer.text.includes("\n") || layer.text.length > 30 ? 3 : 1}
                value={layer.text}
                onChange={(e) => { if (onTextUpdate) onTextUpdate(layer.id, e.target.value); }}
                onBlur={() => { if (onTextDoubleClick) onTextDoubleClick(""); }}
                onKeyDown={(e) => { if (e.key === "Escape" && onTextDoubleClick) onTextDoubleClick(""); }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="bg-white/95 border-2 border-blue-500 rounded p-1.5 text-slate-900 resize-none outline-none shadow-xl cursor-text pointer-events-auto"
                style={{ fontFamily: layer.fontFamily, fontSize: `${layer.fontSize}px`, color: layer.color, textAlign: layer.textAlign, lineHeight: layer.lineHeight, fontWeight: layer.fontWeight, letterSpacing: `${layer.letterSpacing ?? 0}px`, minWidth: "180px" }}
              />
            ) : (
              <div className="px-2 py-0.5 leading-tight whitespace-pre-wrap pointer-events-auto select-none" style={textStyle}>
                {layer.text}
              </div>
            )}
            {isSelected && !isEditing && isInteractive && (
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function EvitePureCssStage({
  template,
  overrideTextLayers,
  mode = "thumbnail",
  aspectRatio,
  className = "",
  hoverScale = false,
  selectedTextId = null,
  editingTextId = null,
  onTextClick,
  onTextDoubleClick,
  onTextUpdate,
  onTextDrag,
  onBackdropClick,
  onCardClick,
  stageRef,
  cardRef,
  zoom = 100,
  maxW = 540,
}: EvitePureCssStageProps) {
  const localCardRef = useRef<HTMLDivElement>(null);
  const effectiveCardRef = (cardRef as any) || localCardRef;

  const [cardDimensions, setCardDimensions] = useState<ContainerDimensions>({
    width: maxW || 500,
    height: Math.round((maxW || 500) * 1.4),
  });

  useEffect(() => {
    const el = effectiveCardRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCardDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [effectiveCardRef]);

  const dragRef = useRef<{
    layerId: string; startX: number; startY: number;
    initTop: number; initLeft: number; cardW: number; cardH: number;
  } | null>(null);

  const handleLayerMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent, layer: StageTextLayer) => {
      if (mode !== "interactive") return;
      if (editingTextId === layer.id) return;

      e.stopPropagation();
      if ("preventDefault" in e) {
        e.preventDefault();
      }
      if (onTextClick) onTextClick(layer.id);

      const card =
        (effectiveCardRef.current as HTMLDivElement | null) ||
        (document.getElementById("invitation-card-container") as HTMLDivElement | null);
      if (!card) return;

      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const initialLeft = layer.left !== undefined ? layer.left : (layer.x ?? 50);
      const initialTop = layer.top !== undefined ? layer.top : (layer.y ?? 50);

      dragRef.current = {
        layerId: layer.id,
        startX: clientX,
        startY: clientY,
        initTop: initialTop,
        initLeft: initialLeft,
        cardW: rect.width,
        cardH: rect.height,
      };

      const originalUserSelect = document.body.style.userSelect;
      const originalCursor = document.body.style.cursor;
      document.body.style.userSelect = "none";
      document.body.style.cursor = "move";

      const onMove = (me: MouseEvent | TouchEvent) => {
        if (!dragRef.current) return;
        const currentX = "touches" in me ? me.touches[0].clientX : (me as MouseEvent).clientX;
        const currentY = "touches" in me ? me.touches[0].clientY : (me as MouseEvent).clientY;

        const dx = currentX - dragRef.current.startX;
        const dy = currentY - dragRef.current.startY;

        const newLeft = Math.round(Math.max(2, Math.min(98, dragRef.current.initLeft + (dx / dragRef.current.cardW) * 100)));
        const newTop = Math.round(Math.max(2, Math.min(98, dragRef.current.initTop + (dy / dragRef.current.cardH) * 100)));

        if (onTextDrag) onTextDrag(dragRef.current.layerId, newTop, newLeft);
      };

      const onEnd = () => {
        dragRef.current = null;
        document.body.style.userSelect = originalUserSelect;
        document.body.style.cursor = originalCursor;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onEnd);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onEnd);
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("touchend", onEnd);
    },
    [mode, editingTextId, onTextClick, onTextDrag, effectiveCardRef]
  );

  if (!template) return null;

  const cardData = template.card || {};
  const cssConfig: CssCardConfig | null = cardData.cssConfig || null;
  const isPureCss = Boolean(template.isPureCss) || Boolean(cssConfig);

  const cardBgColor = cssConfig?.backgroundColor || cardData.backgroundColor || template.backgroundColor || "#ffffff";
  const resolvedAspect = aspectRatio || (cardData.aspectRatio === "square" ? "square" : "portrait");

  const textLayers: StageTextLayer[] = (
    overrideTextLayers && overrideTextLayers.length > 0 ? overrideTextLayers
    : template.textLayers && template.textLayers.length > 0 ? template.textLayers
    : template.defaultTextLayers && template.defaultTextLayers.length > 0 ? template.defaultTextLayers
    : []
  ) as StageTextLayer[];

  const envelopeOuter = template?.envelope?.outerColor || template?.envelopeColor || "#888888";
  const linerCss = template?.envelope?.linerCss || template?.envelope?.linerPatternUrl || "linear-gradient(135deg, #f5f5f5, #e0e0e0)";
  const backdropGradient =
    (template as any)?.canvasWorkspaceBg ||
    (template as any)?.backdropBackground ||
    (template.backdrop as any)?.gradient ||
    (template.backdrop as any)?.value ||
    "radial-gradient(circle, #2d3238 0%, #181a1d 100%)";

  const cardInlineStyle: React.CSSProperties = {
    backgroundColor: cssConfig?.backgroundColor || cardBgColor,
    background: cssConfig?.backgroundGradient || undefined,
    boxShadow: cssConfig?.paperShadow || "0 10px 25px rgba(0,0,0,0.15)",
    borderRadius: cssConfig?.borderRadius,
    clipPath: cssConfig?.clipPath,
  };

  // ── CARD-ONLY MODE ───────────────────────────────────────────────────────
  if (mode === "card-only") {
    return (
      <div
        data-testid={`evite-css-card-${template.id}`}
        className={`relative w-full overflow-hidden select-none ${hoverScale ? "transition-transform duration-500 group-hover:scale-[1.03]" : ""} ${className}`}
        style={{ aspectRatio: resolvedAspect === "square" ? "1 / 1" : "3 / 4", containerType: "inline-size", ...cardInlineStyle }}
      >
        {isPureCss && cssConfig?.border && <CssBorderOverlay border={cssConfig.border} />}
        {!isPureCss && cardData.decorativeBorderSvgUrl && (
          <img src={cardData.decorativeBorderSvgUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" loading="lazy" style={{ zIndex: 1 }} />
        )}
        <TextLayerSet layers={textLayers} mode={mode} selectedTextId={selectedTextId} editingTextId={editingTextId} cardDimensions={cardDimensions} onTextClick={onTextClick} onTextDoubleClick={onTextDoubleClick} onTextUpdate={onTextUpdate} onLayerMouseDown={handleLayerMouseDown} />
      </div>
    );
  }

  // ── THUMBNAIL MODE (Pure CSS Stationery Presentation: Envelope Behind + Card in Front) ──
  if (mode === "thumbnail") {
    return (
      <div
        data-testid={`evite-css-stationery-${template.id}`}
        className={`relative w-full h-[330px] sm:h-[350px] flex items-end justify-start select-none ${className}`}
      >
        {/* Layer 2: Pure CSS Envelope Wall & Open Flap Behind (Zero SVG) */}
        <div
          className="absolute inset-x-0 bottom-0 top-12 rounded-2xl pointer-events-none transition-transform duration-300"
          style={{
            zIndex: 1,
            background: envelopeOuter,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.18), 0 4px 10px -3px rgba(0,0,0,0.1)",
          }}
        >
          {/* Triangular Open Flap Peak Framing Liner */}
          <div
            className="absolute -top-12 inset-x-0 h-16 pointer-events-none"
            style={{
              background: envelopeOuter,
              clipPath: "polygon(0 100%, 50% 0%, 100% 100%)",
              filter: "drop-shadow(0 -2px 6px rgba(0,0,0,0.15))",
            }}
          />
          {/* Pure CSS Interior Liner Fill */}
          <div
            className="absolute inset-x-2 top-[-38px] bottom-4 rounded-t-xl opacity-95 pointer-events-none"
            style={{
              background: linerCss,
              clipPath: "polygon(0 38px, 50% 0, 100% 38px, 100% 100%, 0 100%)",
            }}
          />
        </div>

        {/* Layer 3: Pure CSS Invitation Card in Front */}
        <div
          className={`relative z-10 w-[70%] sm:w-[72%] ml-1.5 sm:ml-2.5 mb-2 rounded-lg overflow-hidden transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.22)] ${
            hoverScale ? "group-hover:-translate-y-2 group-hover:shadow-[0_18px_35px_-8px_rgba(0,0,0,0.32)]" : ""
          }`}
          style={{
            aspectRatio: resolvedAspect === "square" ? "1 / 1" : "3 / 4",
            containerType: "inline-size",
            ...cardInlineStyle,
          }}
        >
          {isPureCss && cssConfig?.border && <CssBorderOverlay border={cssConfig.border} />}
          {!isPureCss && cardData.decorativeBorderSvgUrl && (
            <img src={cardData.decorativeBorderSvgUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" loading="lazy" style={{ zIndex: 1 }} />
          )}
          <TextLayerSet layers={textLayers} mode={mode} selectedTextId={selectedTextId} editingTextId={editingTextId} cardDimensions={cardDimensions} onTextClick={onTextClick} onTextDoubleClick={onTextDoubleClick} onTextUpdate={onTextUpdate} onLayerMouseDown={handleLayerMouseDown} />
        </div>
      </div>
    );
  }

  // ── FULL STAGE (preview / interactive) ────────────────────────────────────
  return (
    <div
      data-layer="1-canvas-backdrop"
      className={`relative w-full h-full flex items-center justify-center p-4 sm:p-8 md:p-12 overflow-auto select-none ${className}`}
      style={{ zIndex: 1, background: backdropGradient }}
      onClick={(e) => { if (e.target === e.currentTarget && onBackdropClick) onBackdropClick(); }}
    >
      <div
        ref={stageRef as any}
        data-testid="invitation-stage-container"
        className="relative w-full flex flex-col items-center justify-center transition-transform duration-300"
        style={{ maxWidth: `${maxW}px`, minHeight: "620px", transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined, transformOrigin: "top center" }}
      >
        {/* LAYER 2: Open Envelope & Liner positioned behind the card */}
        <div
          data-layer="2-envelope-container"
          className="absolute pointer-events-none transition-all duration-300 select-none"
          style={{
            zIndex: 10,
            width: "78%",
            height: "94%",
            right: "-12%",
            top: "3%",
            filter: "drop-shadow(0 25px 35px rgba(0, 0, 0, 0.45))",
          }}
        >
          {/* Envelope Body */}
          <div
            className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: envelopeOuter,
            }}
          >
            {/* Interior Liner */}
            <div
              className="absolute inset-x-2 top-2 bottom-2 rounded-lg overflow-hidden"
              style={{
                background: linerCss,
              }}
            >
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] pointer-events-none" />
            </div>
          </div>

          {/* Open Flap Peak */}
          <div
            className="absolute -top-[28%] inset-x-0 h-[32%] pointer-events-none"
            style={{
              zIndex: 11,
              background: envelopeOuter,
              clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)",
              filter: "drop-shadow(0 -4px 10px rgba(0, 0, 0, 0.25))",
            }}
          >
            <div
              className="absolute inset-x-2 bottom-0 top-1.5 opacity-95"
              style={{
                background: linerCss,
                clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)",
              }}
            />
          </div>
        </div>

        {/* LAYER 3: Card Surface in foreground */}
        <div
          ref={effectiveCardRef as any}
          id="invitation-card-container"
          data-layer="3-card-surface"
          data-testid="preview-card"
          onClick={(e) => { if (e.target === e.currentTarget && onCardClick) onCardClick(); }}
          className="relative rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            zIndex: 20,
            width: "78%",
            aspectRatio: resolvedAspect === "square" ? "1 / 1" : "3 / 4",
            containerType: "inline-size",
            boxShadow: "0 22px 50px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
            ...cardInlineStyle,
          }}
        >
          {isPureCss && cssConfig?.border && <CssBorderOverlay border={cssConfig.border} />}
          {!isPureCss && cardData.decorativeBorderSvgUrl && (
            <img src={cardData.decorativeBorderSvgUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" crossOrigin="anonymous" style={{ zIndex: 0 }} />
          )}
          <TextLayerSet layers={textLayers} mode={mode} selectedTextId={selectedTextId} editingTextId={editingTextId} cardDimensions={cardDimensions} onTextClick={onTextClick} onTextDoubleClick={onTextDoubleClick} onTextUpdate={onTextUpdate} onLayerMouseDown={handleLayerMouseDown} />
        </div>
      </div>
    </div>
  );
}
