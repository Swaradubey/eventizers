import { TextLayer } from "../../types/invitationTypes";

/**
 * Robust deduplication helper for text layers.
 * Deduplicates based on:
 * 1. Explicit layer ID uniqueness (e.g. 'layer-title', 'layer-venue')
 * 2. Predefined layer key uniqueness (e.g. 'key:title', 'key:subtitle', 'key:datetime', 'key:venue')
 * 3. Exact matching content text + coordinate position signature
 */
export const deduplicateTextLayers = <
  T extends {
    id?: string;
    key?: string;
    text?: string;
    top?: number;
    left?: number;
    x?: number;
    y?: number;
  }
>(
  layers: T[]
): T[] => {
  if (!Array.isArray(layers) || layers.length === 0) return [];
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const seenTexts = new Set<string>();
  const seenContent = new Set<string>();

  return layers.filter((layer) => {
    if (!layer || typeof layer !== "object") return false;

    // Preserve non-text layers untouched:
    // Only deduplicate text layers (type is 'text', 'textbox', 'i-text', or undefined/default text role)
    // Any background, illustration, border, or decorative layers passed in MUST be passed through untouched
    const rawType = (layer as any).type ? String((layer as any).type).toLowerCase() : "";
    const isNonTextLayer =
      (rawType !== "" && rawType !== "text" && rawType !== "textbox" && rawType !== "i-text") ||
      Boolean((layer as any).isBackground) ||
      Boolean((layer as any).isIllustration) ||
      Boolean((layer as any).isBorder) ||
      Boolean((layer as any).isDecorative) ||
      Boolean((layer as any).data?.isBackground) ||
      Boolean((layer as any).data?.isIllustration);

    if (isNonTextLayer) {
      return true;
    }

    // 1. Check ID uniqueness
    if (layer.id) {
      if (seenIds.has(layer.id)) return false;
      seenIds.add(layer.id);
      if (layer.key) seenIds.add(`key:${layer.key}`);
    }

    // 2. Check Key/Role uniqueness (e.g., 'title', 'subtitle', etc.)
    if (layer.key) {
      const normalizedKey = layer.key.toLowerCase().trim().replace(/^key:/, "");
      if (seenKeys.has(normalizedKey)) return false;
      seenKeys.add(normalizedKey);
    }

    // 3. Content + coordinate signature guard
    // Prevents identical text blocks (e.g. "DAVE'S TURNING") from being double-rendered
    // directly stacked over themselves at the exact same coordinates while allowing
    // duplicated or independently positioned text blocks to render.
    const trimmedText = (layer.text || "").trim();
    if (trimmedText) {
      const normalizedText = trimmedText.toLowerCase().replace(/\s+/g, " ");
      const posX = Math.round(layer.left !== undefined ? layer.left : (layer.x !== undefined ? layer.x : 50));
      const posY = Math.round(layer.top !== undefined ? layer.top : (layer.y !== undefined ? layer.y : 50));
      const contentSignature = `${normalizedText}__${posX}__${posY}`;
      if (seenContent.has(contentSignature)) return false;
      seenContent.add(contentSignature);
    }

    return true;
  });
};

export interface ComputedTextLayer extends TextLayer {
  rawX: number;
  rawY: number;
  computedTop: number;
  computedLeft: number;
  scaledFontSize: number;
  effectiveLineHeight: number;
  heightPx: number;
  heightPercent: number;
  isShifted: boolean;
  fontStyle?: string;
  maxHeight?: string;
  foilGradient?: string;
  [key: string]: any;
}

export interface ContainerDimensions {
  width: number;
  height: number;
}

export interface SafeAreaMargins {
  top?: string | number;
  bottom?: string | number;
  left?: string | number;
  right?: string | number;
}

const BASE_CANVAS_WIDTH = 500;

const parseCoordinate = (val: any, fallback: number): number => {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val.replace("%", "").trim());
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
};

/**
 * Proportional font scaler:
 * Computes font scale factor based on current container width relative to base design width (500px).
 * Clamped between 0.55 and 1.25 to maintain legible, beautiful typography across mobile to 4K displays.
 */
export function getContainerScaleFactor(cardWidth: number, baseWidth = BASE_CANVAS_WIDTH): number {
  if (!cardWidth || cardWidth <= 0) return 1;
  const ratio = cardWidth / baseWidth;
  return Math.min(1.25, Math.max(0.55, ratio));
}

/**
 * Computes dynamic anti-collision layout for text layers:
 * 1. Deduplicates layers to prevent stacked/overlapping duplicate text objects.
 * 2. Proportionally scales font size to container width.
 * 3. Accurately estimates multi-line wrapping and explicit line-break heights.
 * 4. Sorts layers vertically and enforces minimum clearance (minGapPercent)
 *    so multi-line blocks push lower blocks downward without vertical collision.
 * 5. Respects safeArea margins (clamping within floral borders).
 * 6. Gracefully compresses padding if content approaches bottom bounds.
 */
export function computeAntiCollisionLayout(
  layers: TextLayer[],
  dimensions: ContainerDimensions,
  minGapPercent = 2.5,
  safeArea?: SafeAreaMargins
): ComputedTextLayer[] {
  if (!layers || layers.length === 0) return [];
  const uniqueLayers = deduplicateTextLayers(layers);
  if (uniqueLayers.length === 0) return [];

  // Strictly filter to text layers so non-text layers don't affect typography/collision calculations
  const textLayers = uniqueLayers.filter((layer) => {
    const rawType = (layer as any).type ? String((layer as any).type).toLowerCase() : "";
    return !rawType || rawType === "text" || rawType === "textbox" || rawType === "i-text";
  });
  if (textLayers.length === 0) return [];

  const width = Math.max(200, dimensions.width || BASE_CANVAS_WIDTH);
  const height = Math.max(280, dimensions.height || Math.round(width * 1.4));
  const scaleFactor = getContainerScaleFactor(width, BASE_CANVAS_WIDTH);

  const safeTop = safeArea?.top ? parseCoordinate(safeArea.top, 5) : 5;
  const safeBottom = safeArea?.bottom ? 100 - parseCoordinate(safeArea.bottom, 5) : 95;

  // 1. Initial pass: Calculate scaled typography, line wrapping, and bounding heights
  const processed: ComputedTextLayer[] = textLayers.map((layer) => {
    const pos = (layer as any).position;
    const rawValX = pos?.left !== undefined ? pos.left : (layer.left !== undefined ? layer.left : (layer.x !== undefined ? layer.x : 50));
    const rawValY = pos?.top !== undefined ? pos.top : (layer.top !== undefined ? layer.top : (layer.y !== undefined ? layer.y : 50));

    const rawX = parseCoordinate(rawValX, 50);
    const rawY = parseCoordinate(rawValY, 50);

    const baseFontSize = layer.fontSize || 16;
    const scaledFontSize = Math.max(8, Math.round(baseFontSize * scaleFactor * 10) / 10);
    // Use tighter line-height for large display text, looser for body text
    const effectiveLineHeight = layer.lineHeight || (scaledFontSize > 26 ? 1.2 : 1.35);

    // Multi-line estimation with conservative char width to avoid under-counting lines
    const text = layer.text || "";
    const paragraphs = text.split("\n");

    // Effective max text width: 88% of card width, capped generously
    const maxTextWidthPx = Math.max(100, width * 0.86);

    let totalLines = 0;

    for (const p of paragraphs) {
      if (p.trim().length === 0) {
        totalLines += 1;
        continue;
      }
      const charWidthEstimate = scaledFontSize * 0.62;
      const pWidthPx = p.length * charWidthEstimate;
      const wrappedLines = Math.max(1, Math.ceil(pWidthPx / maxTextWidthPx));
      totalLines += wrappedLines;
    }

    // Layer height: total line height + top/bottom padding buffer
    const heightPx = Math.round(totalLines * scaledFontSize * effectiveLineHeight + 10);
    const heightPercent = (heightPx / height) * 100;

    return {
      ...layer,
      rawX,
      rawY,
      computedTop: rawY,
      computedLeft: rawX,
      scaledFontSize,
      effectiveLineHeight,
      heightPx,
      heightPercent,
      fontStyle: (layer as any).fontStyle,
      maxHeight: (layer as any).maxHeight,
      isShifted: false,
    };
  });

  // 2. Sort by vertical order (rawY ascending) to identify sequential vertical stacks
  const sortedIndices = processed
    .map((_, i) => i)
    .sort((a, b) => processed[a].rawY - processed[b].rawY);

  // 3. Forward anti-collision cascade pass
  let prevBottomEdge = safeTop;

  for (let k = 0; k < sortedIndices.length; k++) {
    const idx = sortedIndices[k];
    const item = processed[idx];
    const halfH = item.heightPercent / 2;

    if (k === 0) {
      // First element: clamp to avoid bleeding into top safe area
      item.computedTop = Math.max(safeTop + halfH, item.rawY);
    } else {
      // Minimum center Y = previous bottom edge + gap + half of current item's height
      const minRequiredCenterY = prevBottomEdge + minGapPercent + halfH;

      if (item.rawY < minRequiredCenterY) {
        item.computedTop = Number(minRequiredCenterY.toFixed(2));
        item.isShifted = true;
      } else {
        item.computedTop = item.rawY;
      }
    }

    // Update the bottom edge reached so far (center + half height)
    prevBottomEdge = item.computedTop + halfH;
  }

  const maxBottomReached = prevBottomEdge;

  // 4. Safe bottom bounds compression:
  // If the total pushed stack exceeds safeBottom limit, proportionally compress gaps
  if (maxBottomReached > safeBottom && sortedIndices.length > 1) {
    const overflow = maxBottomReached - safeBottom;
    const compressionPerItem = Math.min(overflow / (sortedIndices.length - 1), 3.0);

    for (let k = sortedIndices.length - 1; k >= 1; k--) {
      const idx = sortedIndices[k];
      const shiftBack = compressionPerItem * (k / (sortedIndices.length - 1));
      processed[idx].computedTop = Math.max(
        safeTop + processed[idx].heightPercent / 2,
        Math.round((processed[idx].computedTop - shiftBack) * 10) / 10
      );
    }
  }

  return processed;
}

/**
 * Generic deduplication helper by object property
 */
export function deduplicateBy<T>(array: T[], key: keyof T): T[] {
  if (!Array.isArray(array)) return [];
  const seen = new Set<any>();
  return array.filter((item) => {
    if (!item || typeof item !== "object") return false;
    const val = item[key];
    if (val === undefined || val === null || val === "") return true;
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

/**
 * Clean template SVG resolver: ensures textless -bg.svg is used for templates
 */
export function resolveCleanTemplateSvg(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  if (url.includes("/assets/templates/") && url.endsWith(".svg")) {
    if (url.endsWith("-bg.svg")) return url;
    return url.replace(/\.svg$/, "-bg.svg");
  }
  return url;
}

/**
 * Checks whether an image URL is a user-uploaded asset
 */
export function checkIsUserUploadedImage(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (
    trimmed === "" ||
    trimmed.startsWith("#") ||
    trimmed.includes("snapshot") ||
    trimmed.includes("canvas_snapshot") ||
    trimmed.includes("invitation_snapshot")
  ) {
    return false;
  }
  if (trimmed.includes("/assets/templates/")) return false;
  if (trimmed.startsWith("data:image/") && !trimmed.includes("user_upload")) return false;
  return (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.includes("/uploads/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  );
}

/**
 * Extracts a clean, normalized, 100% decoupled data snapshot from studio design state.
 * Guaranteed zero interactive controls, zero duplicate text layers, and zero canvas DOM dependency.
 */
export function extractCleanSnapshotData(designState: any, baseWidth = 600) {
  if (!designState) {
    return {
      templateId: "custom",
      backgroundImage: null,
      backgroundColor: "#ffffff",
      aspectRatio: "5/7",
      isLandscape: false,
      cardImageFit: "cover" as const,
      decorations: [],
      elements: [],
    };
  }

  const isLandscape = Boolean(designState.isLandscape);
  const cardAspectRatio =
    designState.innerCardLayer?.aspectRatio ||
    designState.card?.aspectRatio ||
    (isLandscape ? "4/3" : "5/7");

  // 1. Resolve Background Artwork / Image
  const uploadedBg =
    designState.cardBg?.type === "image" && checkIsUserUploadedImage(designState.cardBg.value)
      ? designState.cardBg.value
      : null;
  const uploadedCard =
    designState.card?.artworkUrl && checkIsUserUploadedImage(designState.card.artworkUrl)
      ? designState.card.artworkUrl
      : null;
  const userUploadSrc = uploadedBg || uploadedCard;

  const rawCardImage =
    userUploadSrc ||
    designState.card?.artworkUrl ||
    (designState.card as any)?.borderIllustration ||
    (designState.cardBg?.type === "image" ? designState.cardBg.value : null) ||
    null;

  // Use clean -bg.svg variant for templates so static text in SVG artwork never renders behind dynamic text
  const cleanBackgroundImage =
    rawCardImage && !rawCardImage.startsWith("#")
      ? resolveCleanTemplateSvg(rawCardImage) || rawCardImage
      : null;

  // 2. Resolve Background Color
  const backgroundColor =
    designState.innerCardLayer?.backgroundColor ||
    designState.card?.backgroundColor ||
    (designState.cardBg?.type === "color"
      ? designState.cardBg.value
      : designState.cardBg?.type === "image"
      ? (userUploadSrc ? "#ffffff" : "#faf8f5")
      : "#ffffff");

  // 3. Resolve Decorations (excluding base artwork)
  const rawDecos: any[] = userUploadSrc
    ? []
    : [
        ...(designState.card?.decorations || []),
        ...(designState.decorations || []),
        ...(designState.card?.decorativeImages || []),
      ];
  const decorations = Array.from(
    new Set(
      rawDecos
        .map((d) => (typeof d === "string" ? d : d?.url || d?.src || ""))
        .filter((src) => src && typeof src === "string" && !src.startsWith("#") && src !== cleanBackgroundImage)
    )
  );

  // 4. Compute Clean Text Layout with Anti-Collision
  const targetDims: ContainerDimensions = {
    width: baseWidth,
    height:
      cardAspectRatio === "1/1" || cardAspectRatio === "square"
        ? baseWidth
        : isLandscape || cardAspectRatio === "4/3"
        ? Math.round((baseWidth * 3) / 4)
        : Math.round((baseWidth * 7) / 5),
  };

  const rawLayers: TextLayer[] = Array.isArray(designState.textLayers) ? designState.textLayers : [];
  const uniqueLayers = deduplicateTextLayers<TextLayer>(rawLayers);
  const antiCollisionLayers = computeAntiCollisionLayout(
    uniqueLayers,
    targetDims,
    2.5,
    designState.card?.safeArea
  );

  // 5. Convert to Normalized Static Elements
  const seenIds = new Set<string>();
  const seenSignatures = new Set<string>();
  const elements: any[] = [];

  antiCollisionLayers.forEach((layer) => {
    if (!layer || typeof layer !== "object") return;
    const textContent = (layer.text || "").trim();
    if (!textContent) return;

    // Strict duplicate ID guard
    if (layer.id && seenIds.has(layer.id)) return;
    if (layer.id) seenIds.add(layer.id);

    // Strict content + coordinate signature guard
    const posX = Math.round(layer.computedLeft !== undefined ? layer.computedLeft : (layer.left !== undefined ? layer.left : (layer.x !== undefined ? layer.x : 50)));
    const posY = Math.round(layer.computedTop !== undefined ? layer.computedTop : (layer.top !== undefined ? layer.top : (layer.y !== undefined ? layer.y : 50)));
    const sig = `${textContent.toLowerCase()}__${posX}__${posY}`;
    if (seenSignatures.has(sig)) return;
    seenSignatures.add(sig);

    elements.push({
      id: layer.id,
      type: "text" as const,
      content: layer.text,
      text: layer.text,
      x: layer.computedLeft !== undefined ? layer.computedLeft : posX,
      y: layer.computedTop !== undefined ? layer.computedTop : posY,
      fontSize: layer.fontSize || 24,
      fontFamily: layer.fontFamily || "Inter, sans-serif",
      color: layer.color || "#000000",
      rotation: (layer as any).rotation || 0,
      width: layer.width || 0,
      height: layer.height || 0,
      fontWeight: layer.fontWeight || 400,
      fontStyle: (layer as any).fontStyle || "normal",
      textAlign: layer.textAlign || layer.align || "center",
      letterSpacing: layer.letterSpacing,
      lineHeight: layer.effectiveLineHeight || layer.lineHeight || 1.25,
      casing: layer.casing,
      isFoil: layer.isFoil || designState.effects?.foil || null,
    });
  });

  // 6. Include Photo Slot Element if configured
  if (designState.photoSlot && designState.photoSlot.imageUrl) {
    elements.push({
      id: "photo-slot-element",
      type: "image" as const,
      content: "",
      src: designState.photoSlot.imageUrl,
      x: designState.photoSlot.x || 50,
      y: designState.photoSlot.y || 50,
      width: designState.photoSlot.width || 140,
      height: designState.photoSlot.height || 140,
      borderRadius: designState.photoSlot.borderRadius || "9999px",
    });
  }

  return {
    templateId: designState.activeTemplateId || designState.templateId || "custom",
    backgroundImage: cleanBackgroundImage,
    backgroundColor,
    aspectRatio: cardAspectRatio,
    isLandscape,
    cardImageFit: designState.cardImageFit || (userUploadSrc ? "contain" : "cover"),
    decorations,
    effects: designState.effects,
    elements,
  };
}

