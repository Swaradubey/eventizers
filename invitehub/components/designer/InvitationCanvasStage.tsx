"use client";

import React, { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2 as Trash2Icon, Copy as CopyIcon, RotateCw } from "lucide-react";
import { CanvasStageConfig, TextLayer } from "../../types/invitationTypes";
import { getCleanTemplateSvg, isUserUploadedImage, teardownCanvasTextLayers, syncCanvasTextLayers } from "./InvitationStudio";
import { applyCanvasBackground, getFabricCanvas, cleanFabricCanvas } from "./canvasBackgroundUtils";
import { getTemplateConfig } from "../../lib/newTemplatesData";
import EvitePureCssStage, { CssBorderOverlay } from "./EvitePureCssStage";
import { computeAntiCollisionLayout, ContainerDimensions, deduplicateTextLayers, isSnapshotOrRasterUrl } from "./layoutUtils";
import EnvelopeBackdrop from "./EnvelopeBackdrop";

export { teardownCanvasTextLayers };

export const ENVELOPE_LINERS_DATA: Record<string, string> = {
  // Autumn Tan Gingham / Plaid (Evite Fall Blooms exact style)
  "autumn-gingham":
    "repeating-linear-gradient(0deg, #cb925d 0px, #cb925d 14px, #fbf7ee 14px, #fbf7ee 28px), repeating-linear-gradient(90deg, rgba(160, 98, 42, 0.38) 0px, rgba(160, 98, 42, 0.38) 14px, transparent 14px, transparent 28px)",
  "autumn-gingham-liner":
    "repeating-linear-gradient(0deg, #cb925d 0px, #cb925d 14px, #fbf7ee 14px, #fbf7ee 28px), repeating-linear-gradient(90deg, rgba(160, 98, 42, 0.38) 0px, rgba(160, 98, 42, 0.38) 14px, transparent 14px, transparent 28px)",
  "vertical-pink-stripes":
    "repeating-linear-gradient(90deg, #ea5b95 0px, #ea5b95 11px, #ffffff 11px, #ffffff 22px)",
  "pink-stripes":
    "repeating-linear-gradient(90deg, #ea5b95 0px, #ea5b95 11px, #ffffff 11px, #ffffff 22px)",
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
  "blush-burgundy-liner": "url('/templates/envelopes/blush-burgundy-liner.png') center / cover no-repeat",
  "/templates/envelopes/blush-burgundy-liner.png": "url('/templates/envelopes/blush-burgundy-liner.png') center / cover no-repeat",
  "something-blue-liner": "url('/templates/envelopes/something-blue-liner.png') center / cover no-repeat",
  "/templates/envelopes/something-blue-liner.png": "url('/templates/envelopes/something-blue-liner.png') center / cover no-repeat",
  "autumn-gingham-liner": "url('/templates/envelopes/autumn-gingham-liner.png') center / cover no-repeat",
  "/templates/envelopes/autumn-gingham-liner.png": "url('/templates/envelopes/autumn-gingham-liner.png') center / cover no-repeat",
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
  onDeleteLayer?: (id: string) => void;
  onDuplicateLayer?: (id: string) => void;
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
  showingBackside?: boolean;
  onFlipCard?: () => void;
  isEnvelopeTabActive?: boolean;
}

export default function InvitationCanvasStage({
  config,
  readOnly = false,
  selectedTextId = null,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
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
  showingBackside = false,
  onFlipCard,
  isEnvelopeTabActive = false,
}: InvitationCanvasStageProps) {
  const localCardRef = useRef<HTMLDivElement>(null);
  const effectiveCardRef: any = cardRef || localCardRef;
  const isLandscape = Boolean(config.isLandscape);

  const [cardDimensions, setCardDimensions] = useState<ContainerDimensions>({
    width: maxW || 500,
    height: isLandscape ? Math.round((maxW || 500) * 0.75) : Math.round((maxW || 500) * 1.4),
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
    const timer = setTimeout(updateDims, 150);
    const ro = new ResizeObserver(updateDims);
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [effectiveCardRef, maxW, isLandscape]);

  // ─── MOUNT-TIME FABRIC CANVAS PURGE ─────────────────────────────────────────
  // On mount (including re-navigation from back-to-browse), force-clear stale
  // fabric.js text objects. Prevents "double text" bug where stale objects from
  // a previous session overlap with freshly rendered React HTML text layers.
  useEffect(() => {
    const canvas = getFabricCanvas();
    if (!canvas || typeof canvas.getObjects !== "function") return;
    try {
      const textObjects = canvas.getObjects().filter((obj: any) =>
        obj.type === "textbox" ||
        obj.type === "i-text" ||
        obj.type === "text" ||
        obj.data?.isTextBlock === true
      );
      textObjects.forEach((obj: any) => {
        try { canvas.remove(obj); } catch (_) {}
      });
      if (textObjects.length > 0) {
        if (typeof canvas.requestRenderAll === "function") canvas.requestRenderAll();
        else if (typeof canvas.renderAll === "function") canvas.renderAll();
      }
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount — intentionally no deps

  // Deduplicate incoming text layers before layout and rendering.
  // Two-pass deduplication: first by semantic rules (role, text, position), then by strict
  // ID uniqueness as a safety net to permanently eliminate ghost/double text rendering.
  // CRITICAL: If the card background is detected as a flattened snapshot, suppress dynamic text layers
  // to strictly prevent duplicate/overlapping text rendering.
  const isSnapshotCardBg =
    isSnapshotOrRasterUrl(config.cardBg?.value) ||
    isSnapshotOrRasterUrl((config as any)?.backgroundImageUrl);

  const deduplicatedLayers = useMemo((): TextLayer[] => {
    if (isSnapshotCardBg) {
      return [];
    }
    const layers = (config.textLayers || []) as TextLayer[];
    const semanticallyDeduped = deduplicateTextLayers<TextLayer>(layers);
    // Final safety net: deduplicate by strict ID to catch any remaining duplicates
    // that may have slipped through semantic deduplication edge cases
    const seenIds = new Set<string>();
    return semanticallyDeduped.filter((layer) => {
      if (!layer?.id) return true;
      const id = layer.id.trim().toLowerCase();
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });
  }, [config.textLayers, isSnapshotCardBg]);

  // Compute container-proportional typography and anti-collision layer positions
  const computedLayers = useMemo(() => {
    return computeAntiCollisionLayout(
      deduplicatedLayers,
      cardDimensions,
      2.5,
      (config.card as any)?.safeArea
    );
  }, [deduplicatedLayers, cardDimensions, (config.card as any)?.safeArea]);

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

  // Floating toolbar actions for Delete and Duplicate
  const handleDeleteActiveTextbox = useCallback(
    (layerId?: string) => {
      const targetId = layerId || selectedTextId;
      if (!targetId) return;

      // Clean up active object on fabric/window canvas if present
      const canvas = getFabricCanvas();
      if (canvas && typeof canvas.getActiveObject === "function") {
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.customId === targetId || activeObj.data?.id === targetId)) {
          canvas.remove(activeObj);
          if (typeof canvas.discardActiveObject === "function") canvas.discardActiveObject();
          if (typeof canvas.requestRenderAll === "function") canvas.requestRenderAll();
        }
      }

      if (onDeleteLayer) {
        onDeleteLayer(targetId);
      }
    },
    [selectedTextId, onDeleteLayer]
  );

  const handleDuplicateActiveTextbox = useCallback(
    (layerId?: string) => {
      const targetId = layerId || selectedTextId;
      if (!targetId) return;

      // Duplicate on fabric/window canvas if present
      const canvas = getFabricCanvas();
      if (canvas && typeof canvas.getActiveObject === "function") {
        const activeObj = canvas.getActiveObject();
        if (
          activeObj &&
          (activeObj.customId === targetId || activeObj.data?.id === targetId) &&
          typeof activeObj.clone === "function"
        ) {
          activeObj.clone((cloned: any) => {
            cloned.set({
              left: (activeObj.left || 0) + 20,
              top: (activeObj.top || 0) + 20,
              evented: true,
            });
            const newCustomId = `text-${Date.now()}`;
            cloned.customId = newCustomId;
            if (cloned.data) cloned.data.id = newCustomId;
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            if (typeof canvas.requestRenderAll === "function") canvas.requestRenderAll();
            if (onDuplicateLayer) onDuplicateLayer(newCustomId);
          });
          return;
        }
      }

      if (onDuplicateLayer) {
        onDuplicateLayer(targetId);
      }
    },
    [selectedTextId, onDuplicateLayer]
  );

  // Floating toolbar coordinates for external / fabric canvas tracking
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  useEffect(() => {
    const canvas = getFabricCanvas();
    if (!canvas || typeof canvas.on !== "function") return;

    const updateFromCanvas = () => {
      const activeObj = canvas.getActiveObject();
      if (!activeObj || activeObj.type === "image") {
        setToolbarPosition((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }
      const bound = typeof activeObj.getBoundingRect === "function" ? activeObj.getBoundingRect() : null;
      if (bound) {
        setToolbarPosition({
          x: bound.left + bound.width / 2,
          y: bound.top,
          visible: true,
        });
      }
    };

    const clearToolbar = () => {
      setToolbarPosition((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    };

    canvas.on("selection:created", updateFromCanvas);
    canvas.on("selection:updated", updateFromCanvas);
    canvas.on("selection:cleared", clearToolbar);
    canvas.on("object:moving", updateFromCanvas);
    canvas.on("object:scaling", updateFromCanvas);
    canvas.on("object:rotating", updateFromCanvas);

    return () => {
      if (typeof canvas.off === "function") {
        canvas.off("selection:created", updateFromCanvas);
        canvas.off("selection:updated", updateFromCanvas);
        canvas.off("selection:cleared", clearToolbar);
        canvas.off("object:moving", updateFromCanvas);
        canvas.off("object:scaling", updateFromCanvas);
        canvas.off("object:rotating", updateFromCanvas);
      }
    };
  }, []);

  // Resolve Envelope Outer Color, Flap Color & Liner Style
  // Default: warm caramel kraft tan with autumn gingham liner (Evite Fall Blooms style)
  const envelopeOuterColor =
    (config.envelope as any)?.outerColor || config.envelope?.color || "#b47b48";
  const envelopeFlapColor =
    (config.envelope as any)?.flapColor || (config.envelope as any)?.outerColor || "#9c6838";
  const linerRaw =
    (config.envelope as any)?.innerLiner ||
    (config.envelope as any)?.linerPatternUrl ||
    config.envelope?.liner ||
    "autumn-gingham";
  // Support pure-CSS liner (linerCss) OR legacy lookup-table liner OR image URL liner
  const envelopeLinerCss = (config.envelope as any)?.linerCss || "";
  const isImageLiner = Boolean(
    linerRaw &&
      (linerRaw.startsWith("/") ||
        linerRaw.startsWith("http") ||
        /\.(png|jpe?g|svg|webp)($|\?)/i.test(linerRaw)) &&
      !linerRaw.includes("url(")
  );
  const linerStyle =
    envelopeLinerCss ||
    (isImageLiner ? `url('${linerRaw}') center / cover no-repeat` : null) ||
    ENVELOPE_LINERS_DATA[linerRaw] ||
    (linerRaw && linerRaw.includes("gradient") ? linerRaw : null) ||
    (linerRaw && linerRaw.includes("conic") ? linerRaw : null) ||
    ENVELOPE_LINERS_DATA["autumn-gingham"] ||
    ENVELOPE_LINERS_DATA["gold-grid"];

  // Resolve Stamp & Sticker
  const stampEmoji = config.envelope?.stamp
    ? STAMPS_DATA[config.envelope.stamp] || config.envelope.stamp
    : null;
  const stickerEmoji = config.envelope?.sticker
    ? STICKERS_DATA[config.envelope.sticker] || config.envelope.sticker
    : null;

  // Check if there is an explicit user upload
  const isUploadedBg = Boolean(
    config.cardBg?.type === "image" && config.cardBg.value && isUserUploadedImage(config.cardBg.value)
  );
  const isUploadedCard = Boolean(
    config.card?.artworkUrl && isUserUploadedImage(config.card.artworkUrl)
  );
  const isUploadedBgUrl = Boolean(
    (config as any)?.backgroundImageUrl && isUserUploadedImage((config as any).backgroundImageUrl)
  );
  const isUserUpload = isUploadedBg || isUploadedCard || isUploadedBgUrl;

  // View mode / Envelope visibility: In standalone "Card Only" mode or by default for custom uploaded images
  const isCardOnlyMode = Boolean(
    config.hideEnvelope ||
    config.viewMode === "card" ||
    (isUserUpload && config.viewMode !== "envelope" && config.hideEnvelope !== false)
  );
  const showEnvelope = !isCardOnlyMode;

  const uploadedImageSrc = isUploadedBg
    ? config.cardBg.value
    : (isUploadedCard ? config.card!.artworkUrl : ((config as any)?.backgroundImageUrl || null));

  // Resolve fallback template configuration if preset template ID exists
  const activeTplId = (config as any)?.activeTemplateId || (config as any)?.templateId;
  const fallbackTpl = (!isUserUpload && activeTplId) ? getTemplateConfig(activeTplId) : null;

  // Helper to filter out snapshot / raster captures from being used as card background artwork
  const sanitizeBackgroundCandidate = (url?: string | null): string | null => {
    if (!url || typeof url !== "string") return null;
    const trimmed = url.trim();
    if (
      trimmed === "" ||
      trimmed.startsWith("#") ||
      isSnapshotOrRasterUrl(trimmed)
    ) {
      return null;
    }
    return trimmed;
  };

  // Resolve Clean Card Artwork: user uploaded image takes absolute precedence over template defaults
  const rawCardBg: any = config.cardBg;
  const rawBg: any = (config as any)?.background;
  const rawCardBgValue = rawCardBg?.type === "image" ? rawCardBg.value : (typeof rawCardBg === "string" ? rawCardBg : null);
  const rawBgValue = rawBg?.type === "image" ? rawBg.value : (rawBg?.image || rawBg?.url || (typeof rawBg === "string" ? rawBg : null));

  const validBgVal = (isUserUploadedImage(rawCardBgValue) && !isSnapshotOrRasterUrl(rawCardBgValue))
    ? rawCardBgValue
    : sanitizeBackgroundCandidate(rawCardBgValue);
  const validFallbackBgVal = (isUserUploadedImage(rawBgValue) && !isSnapshotOrRasterUrl(rawBgValue))
    ? rawBgValue
    : sanitizeBackgroundCandidate(rawBgValue);

  const bgImg = validBgVal || validFallbackBgVal || null;

  const cardImageRaw =
    (uploadedImageSrc && !isSnapshotOrRasterUrl(uploadedImageSrc) ? uploadedImageSrc : null) ||
    sanitizeBackgroundCandidate((config as any)?.backgroundImageUrl) ||
    sanitizeBackgroundCandidate(config.card?.artworkUrl) ||
    sanitizeBackgroundCandidate((config.card as any)?.borderIllustration) ||
    bgImg ||
    (fallbackTpl as any)?.card?.borderIllustration ||
    (fallbackTpl as any)?.card?.artworkUrl ||
    fallbackTpl?.decorationImage ||
    null;
  const cleanCardImage =
    cardImageRaw && !cardImageRaw.startsWith("#") ? getCleanTemplateSvg(cardImageRaw) || cardImageRaw : null;

  // Collect decorative illustrations (balloons, cake, party hats, candles, gifts) only for non-upload templates
  const rawDecorations: any[] = isUserUpload ? [] : [
    ...((config.card as any)?.decorations || []),
    ...((config as any)?.decorations || []),
    ...((config as any)?.template?.decorations || []),
    ...((fallbackTpl as any)?.card?.decorations || []),
    ...((config.card as any)?.decorativeImages || []),
    ...((config as any)?.background?.decorativeImages || []),
  ];

  const decorationItems = Array.from(
    new Set(
      rawDecorations
        .map((d) => (typeof d === "string" ? d : d?.url || d?.src || ""))
        .filter((src) => src && typeof src === "string" && !src.startsWith("#"))
    )
  );

  const [imgSrc, setImgSrc] = useState<string | null>(cleanCardImage);
  const [hasImgError, setHasImgError] = useState(false);
  const [bgNaturalDimensions, setBgNaturalDimensions] = useState<{ width: number; height: number; aspectRatio: string } | null>(null);

  useEffect(() => {
    if (!cleanCardImage) {
      setBgNaturalDimensions(null);
      return;
    }
    let isProbeActive = true;
    const probe = new Image();
    probe.crossOrigin = "anonymous";
    probe.src = cleanCardImage;
    probe.onload = () => {
      if (!isProbeActive) return;
      const w = probe.naturalWidth || probe.width || 600;
      const h = probe.naturalHeight || probe.height || 840;
      setBgNaturalDimensions({
        width: w,
        height: h,
        aspectRatio: `${w} / ${h}`,
      });
    };
    return () => {
      isProbeActive = false;
    };
  }, [cleanCardImage]);

  useEffect(() => {
    let isMounted = true;
    setImgSrc(cleanCardImage);
    setHasImgError(false);

    // Strict Canvas Object & Listener Purge:
    // Strictly clears previous canvas objects and event listeners before loading any new or saved template,
    // preventing double-mounting / React StrictMode duplicate text layering.
    const activeCanvas = getFabricCanvas();
    if (activeCanvas) {
      cleanFabricCanvas(activeCanvas, {
        preserveBackground: true,
        backgroundUrl: cleanCardImage,
      });
      if (!isMounted) return;
      if (cleanCardImage) {
        applyCanvasBackground(activeCanvas, cleanCardImage, (info) => {
          if (!isMounted) return;
          if (info && info.width && info.height) {
            setBgNaturalDimensions({
              width: info.width,
              height: info.height,
              aspectRatio: `${info.width} / ${info.height}`,
            });
          }
          // Ensure typography layers are rendered ON TOP of the loaded background image
          syncCanvasTextLayers(activeCanvas, deduplicatedLayers);
        });
      } else {
        syncCanvasTextLayers(activeCanvas, deduplicatedLayers);
        if (typeof activeCanvas.requestRenderAll === "function") {
          activeCanvas.requestRenderAll();
        } else if (typeof activeCanvas.renderAll === "function") {
          activeCanvas.renderAll();
        }
      }
    }

    return () => {
      isMounted = false;
    };
  }, [
    cleanCardImage,
    (config as any)?.activeTemplateId,
    (config as any)?.templateId,
    config.card?.artworkUrl,
    config.cardBg,
    (config as any)?.background,
  ]);

  const handleImageError = () => {
    // If -bg.svg clean variant failed to load, fallback to cardImageRaw
    if (imgSrc && cardImageRaw && imgSrc !== cardImageRaw) {
      setImgSrc(cardImageRaw);
    } else {
      setHasImgError(true);
    }
  };

  const cardImageFit = config.cardImageFit || (isUserUpload ? "contain" : "cover");

  const cardBgColor =
    (config as any).innerCardLayer?.backgroundColor ||
    config.card?.backgroundColor ||
    (config.cardBg?.type === "color"
      ? config.cardBg.value
      : config.cardBg?.type === "image"
      ? (isUserUpload ? "#ffffff" : "#faf8f5")
      : "#ffffff");

  const cardAspectRatio =
    (isUserUpload && bgNaturalDimensions?.aspectRatio)
      ? bgNaturalDimensions.aspectRatio
      : ((config as any).innerCardLayer?.aspectRatio ||
        (config.card?.aspectRatio === "5x7" || config.card?.aspectRatio === "5/7"
          ? "5/7"
          : config.card?.aspectRatio === "square" || config.card?.aspectRatio === "1/1"
          ? "1/1"
          : aspectRatio || (isLandscape ? "4/3" : "5/7")));

  const cleanNeutralBg = "#f8fafc";
  const rawBackdropValue =
    (config as any)?.canvasWorkspaceBg ||
    (config as any)?.backdropBackground ||
    config.backdrop?.value ||
    config.stageBackdrop?.value ||
    (isCardOnlyMode ? cleanNeutralBg : "#0f172a");

  const backdropValue = rawBackdropValue || cleanNeutralBg;

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
      : config.effects?.shadow === "none"
      ? "none"
      : isCardOnlyMode
      ? "0 20px 40px -15px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)"
      : "0 22px 50px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.12)";

  // ── PURE-CSS TEMPLATE FAST PATH ──────────────────────────────────────────
  // Only use EvitePureCssStage when the template is explicitly a pure-CSS design
  // (isPureCss: true) OR has a real CSS border config with a border type defined.
  // Templates that have artworkUrl images MUST fall through to the image render path.
  const rawCssConfig = (config.card as any)?.cssConfig;
  const innerBorder = (config as any).innerCardLayer?.border;
  const innerShadow = (config as any).innerCardLayer?.boxShadow;
  // Fix: wrap condition in parens to avoid operator-precedence bug
  const cssConfig = (rawCssConfig || innerBorder) ? {
    ...(rawCssConfig || {}),
    ...(innerBorder ? { border: innerBorder } : {}),
    ...(innerShadow ? { paperShadow: innerShadow } : {}),
  } : null;

  // Only route to pure-CSS stage when explicitly flagged OR cssConfig has an actual border type.
  // This prevents image-based templates from being incorrectly swallowed by the CSS path.
  const hasRealCssBorder = Boolean(cssConfig?.border?.type && cssConfig.border.type !== "none");
  const isExplicitPureCss = Boolean((config as any).isPureCss);
  const hasArtworkImage = Boolean(cleanCardImage);

  if (!isUserUpload && !hasArtworkImage && (isExplicitPureCss || hasRealCssBorder)) {
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
        aspectRatio: cardAspectRatio,
      },
      textLayers: deduplicatedLayers,
      defaultTextLayers: deduplicatedLayers,
    };

    return (
      <EvitePureCssStage
        template={pureCssTpl}
        overrideTextLayers={deduplicatedLayers as any}
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
          if (onSelectLayer) onSelectLayer("");
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
        backgroundColor: isBackdropGradient
          ? undefined
          : (backdropValue?.startsWith("#") || backdropValue?.startsWith("rgb") ? backdropValue : (isCardOnlyMode ? "#f8fafc" : "#1c1917")),
        backgroundImage: backdropValue && (backdropValue.includes("/") || backdropValue.includes("http"))
          ? `url('${backdropValue}')`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
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
        className="relative w-full flex items-center justify-center transition-transform duration-300"
        style={{
          maxWidth: `${Math.round((maxW || 540) * 1.25)}px`,
          aspectRatio: isLandscape ? "4 / 3" : "5 / 7",
          minHeight: isLandscape ? "520px" : "620px",
          transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
          transformOrigin: "top center",
          overflow: "visible",
        }}
      >
        {/* ========================================================================= */}
        {/* CARD & ENVELOPE COMPOSITE UNIT (Keeps Card & Envelope locked together)     */}
        {/* Envelope starts AT THE TOP of card, never hangs down, never cuts off      */}
        {/* ========================================================================= */}
        <div
          data-layer="card-envelope-unit"
          className="relative flex items-center justify-center"
          style={{
            width: isCardOnlyMode ? (isLandscape ? "92%" : "84%") : (isLandscape ? "88%" : "78%"),
            aspectRatio: cardAspectRatio,
            // Optically center composite unit when envelope peeks right (exact Evite match)
            transform: !isCardOnlyMode && !isEnvelopeTabActive && config.viewMode !== "envelope"
              ? "translateX(-7%)"
              : undefined,
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* LAYER 2: Envelope & Liner (z-index: 10) — Sits directly behind the card */}
          {showEnvelope && (
            <motion.div
              data-layer="2-envelope-container"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              className="absolute inset-0 pointer-events-none select-none"
              style={{
                zIndex: 10,
                width: "100%",
                height: "100%",
                // Locked directly behind the card:
                // Upper flap starts right at the top of the card!
                // Lower body aligns right at the bottom of the card!
                // Shifts right 25% so the upper flap and right edge peek out (Evite exact)
                transform: isCardOnlyMode
                  ? "translateX(0)"
                  : (isEnvelopeTabActive || config.viewMode === "envelope")
                  ? "translateX(0)"
                  : "translateX(25%)",
                transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <EnvelopeBackdrop
                color={envelopeOuterColor}
                flapColor={envelopeFlapColor}
                liner={linerStyle}
                innerLiner={(config.envelope as any)?.innerLiner}
                shadowColor={(config.envelope as any)?.shadowColor}
                stampEmoji={stampEmoji}
                stickerEmoji={stickerEmoji}
              />
            </motion.div>
          )}

          {/* LAYER 3: Invitation Card Surface (z-index: 20) */}
          <motion.div
            ref={effectiveCardRef}
            id="invitation-card-container"
            data-layer="3-card-surface"
            data-testid="preview-card"
            initial={{
              y: 60,
              scale: 0.93,
              opacity: 0.85,
            }}
            animate={{
              y: 0,
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.95,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.08,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                if (onCardClick) onCardClick();
                if (onSelectLayer) onSelectLayer("");
                if (setEditingTextId) setEditingTextId(null);
              }
            }}
            className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-300 ${cardTextureClass}`}
            style={{
              zIndex: 20,
              aspectRatio: cardAspectRatio,
              backgroundColor: cardBgColor,
              background:
                (config.cardBg?.type === "preset" || config.cardBg?.type === "gradient") &&
                !(config as any).innerCardLayer?.backgroundColor &&
                config.cardBg.value !== backdropGradient &&
                config.cardBg.value !== backdropValue
                  ? config.cardBg.value
                  : undefined,
              boxShadow: cardShadowStyle,
            }}
          >
          {showingBackside ? (
            <div className="absolute inset-0 flex flex-col items-center justify-between p-8 sm:p-12 text-center bg-[#FAF8F5] select-none">
              <div className="w-full flex justify-between items-center text-[11px] font-bold tracking-wider uppercase text-slate-400">
                <span>Card Backside</span>
                {onFlipCard && (
                  <button
                    type="button"
                    onClick={onFlipCard}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
                  >
                    Flip to Front
                  </button>
                )}
              </div>
              <div className="max-w-md my-auto space-y-4 px-4">
                <p className="text-base sm:text-lg text-slate-800 font-serif leading-relaxed italic">
                  "{config.backside?.message || "We can't wait to celebrate with you!"}"
                </p>
                <p className="text-sm font-semibold tracking-wide text-slate-600 uppercase">
                  {config.backside?.signOff || "With Love, The Host"}
                </p>
                {config.backside?.photoUrl && (
                  <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden shadow-md border-2 border-white">
                    <img src={config.backside.photoUrl} alt="Backside note" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                <span>Scan QR or RSVP Online</span>
              </div>
            </div>
          ) : (
            <>
              {/* Border Overlay if defined by cssConfig or innerCardLayer */}
              {cssConfig?.border && <CssBorderOverlay border={cssConfig.border} />}

              {/* 3A: Clean Decorative Artwork / User Uploaded Base Layer */}
              {imgSrc && !hasImgError && (
                <img
                  src={imgSrc}
                  alt="Invitation Card Artwork"
                  aria-hidden="true"
                  crossOrigin={imgSrc.startsWith("http") ? "anonymous" : undefined}
                  onError={handleImageError}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth && img.naturalHeight) {
                      setBgNaturalDimensions({
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        aspectRatio: `${img.naturalWidth} / ${img.naturalHeight}`,
                      });
                    }
                  }}
                  className={`absolute inset-0 w-full h-full pointer-events-none select-none transition-all duration-200 ${
                    cardImageFit === "contain" ? "object-contain" : "object-cover"
                  }`}
                  style={{ zIndex: 0 }}
                  draggable={false}
                />
              )}

              {/* 3A-2: Additional decorative illustrations & stickers (balloons, cake, hats, candles, gifts) */}
              {decorationItems.map((decoSrc, idx) => {
                if (decoSrc === imgSrc) return null; // Avoid duplicating base artwork
                return (
                  <img
                    key={`card-decoration-${idx}`}
                    src={decoSrc}
                    alt="Template Decoration"
                    aria-hidden="true"
                    crossOrigin={decoSrc.startsWith("http") ? "anonymous" : undefined}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    style={{ zIndex: 2 }}
                    draggable={false}
                  />
                );
              })}

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
                      fontStyle: (layer as any).fontStyle || undefined,
                      textDecoration: (layer as any).textDecoration || ((layer as any).underline ? "underline" : undefined),
                      maxHeight: (layer as any).maxHeight || undefined,
                      letterSpacing:
                        typeof layer.letterSpacing === "string"
                          ? layer.letterSpacing
                          : layer.letterSpacing !== undefined
                          ? `${layer.letterSpacing}px`
                          : undefined,
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
                      letterSpacing:
                        typeof layer.letterSpacing === "string"
                          ? layer.letterSpacing
                          : layer.letterSpacing !== undefined
                          ? `${layer.letterSpacing}px`
                          : undefined,
                      lineHeight: layer.effectiveLineHeight,
                      fontWeight: layer.fontWeight,
                      fontStyle: (layer as any).fontStyle || undefined,
                      textDecoration: (layer as any).textDecoration || ((layer as any).underline ? "underline" : undefined),
                      maxHeight: (layer as any).maxHeight || undefined,
                      pointerEvents: "auto",
                    }}
                  >
                    {layer.text || "Type text here"}
                  </div>
                )}

                {/* Evite-Style Floating Textbox Controls (Delete & Duplicate) */}
                {isSelected && !isEditing && !readOnly && (
                  <div
                    data-designer-control="true"
                    className="absolute z-50 flex items-center gap-1.5 p-1 bg-white rounded-full shadow-lg border border-slate-200 pointer-events-auto transform -translate-x-1/2 -translate-y-full select-none"
                    style={{
                      left: "50%",
                      top: "-12px", // anchored slightly above the top border
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    {/* Delete Textbox Button */}
                    <button
                      type="button"
                      title="Delete text box"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteActiveTextbox(layer.id);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-px h-3.5 bg-slate-200" />

                    {/* Duplicate Textbox Button */}
                    <button
                      type="button"
                      title="Duplicate text box"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateActiveTextbox(layer.id);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <CopyIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Evite-Style Selection Handles & Rotation (Visible when selected in interactive Studio mode) */}
                {isSelected && !isEditing && !readOnly && (
                  <div data-designer-control="true" className="pointer-events-none">
                    {/* Corner Dots */}
                    <div className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full shadow-xs" />
                    <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full shadow-xs" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full shadow-xs" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full shadow-xs" />

                    {/* Left & Right Edge Handles (matching Evite) */}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-3.5 bg-white border border-blue-500 rounded-xs shadow-2xs" />
                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-3.5 bg-white border border-blue-500 rounded-xs shadow-2xs" />

                    {/* Evite-Style Rotation Handle (Below Center) */}
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border border-slate-300 rounded-full shadow-md flex items-center justify-center pointer-events-auto cursor-grab hover:bg-slate-50 transition-colors">
                      <RotateCw className="w-2.5 h-2.5 text-slate-600" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
            </>
          )}
        </motion.div>
        </div>

        {/* Floating Toolbar for Fabric / Window Canvas when active */}
        {toolbarPosition.visible && !readOnly && (
          <div
            data-designer-control="true"
            className="absolute z-50 flex items-center gap-1.5 p-1 bg-white rounded-full shadow-lg border border-slate-200 pointer-events-auto transform -translate-x-1/2 -translate-y-full select-none"
            style={{
              left: `${toolbarPosition.x}px`,
              top: `${toolbarPosition.y - 12}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              title="Delete text box"
              onClick={() => handleDeleteActiveTextbox()}
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Trash2Icon className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-3.5 bg-slate-200" />
            <button
              type="button"
              title="Duplicate text box"
              onClick={() => handleDuplicateActiveTextbox()}
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <CopyIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Flip Card Pill Button (matching mobile reference preview) */}
        {onFlipCard && (
          <button
            type="button"
            data-testid="canvas-flip-button"
            onClick={(e) => {
              e.stopPropagation();
              onFlipCard();
            }}
            className="absolute z-30 flex items-center justify-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-md border border-slate-200/90 cursor-pointer pointer-events-auto transition-all active:scale-95"
            style={{
              bottom: isLandscape ? "2%" : "3%",
              left: isLandscape ? "48%" : "47%",
              transform: "translateX(-50%)",
            }}
            title="Flip to view backside"
          >
            <svg
              className="w-3.5 h-3.5 text-slate-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="7" height="16" x="4" y="4" rx="1.5" />
              <path d="M15 8h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4" />
            </svg>
            <span>{showingBackside ? "View Front" : "Flip"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
