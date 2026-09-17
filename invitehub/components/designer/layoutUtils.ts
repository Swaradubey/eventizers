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
  // seenContent is only used for anonymous layers (no id, no key)
  const seenContent = new Set<string>();

  return layers.filter((layer) => {
    if (!layer || typeof layer !== "object") return false;

    // 1. Check ID uniqueness — if the layer carries an explicit ID, that is the
    //    sole deduplication key. A layer that passes the ID check is definitionally
    //    unique: do NOT apply the position/content fallback to it. This prevents
    //    false-positive filtering when anti-collision layout shifts a layer's Y.
    if (layer.id) {
      if (seenIds.has(layer.id)) return false;
      seenIds.add(layer.id);
      // Register the key as well so key-only lookup also skips this layer
      if (layer.key) seenIds.add(`key:${layer.key}`);
      return true; // Definitively unique — skip content-signature check
    }

    // 2. For layers with only a key (no id), enforce key uniqueness
    if (layer.key) {
      const keyId = `key:${layer.key}`;
      if (seenIds.has(keyId)) return false;
      seenIds.add(keyId);
      return true; // Key-identified layer is also definitively unique
    }

    // 3. Anonymous layer (no id, no key): fall back to content + coordinate signature.
    //    Only used as a last-resort catch for truly unnamed duplicate blocks.
    const posX = Math.round(layer.left !== undefined ? layer.left : (layer.x !== undefined ? layer.x : 50));
    const posY = Math.round(layer.top !== undefined ? layer.top : (layer.y !== undefined ? layer.y : 50));
    const trimmedText = (layer.text || "").trim();
    if (trimmedText) {
      const contentSignature = `${trimmedText}__${posX}__${posY}`;
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

  const width = Math.max(200, dimensions.width || BASE_CANVAS_WIDTH);
  const height = Math.max(280, dimensions.height || Math.round(width * 1.4));
  const scaleFactor = getContainerScaleFactor(width, BASE_CANVAS_WIDTH);

  const safeTop = safeArea?.top ? parseCoordinate(safeArea.top, 5) : 5;
  const safeBottom = safeArea?.bottom ? 100 - parseCoordinate(safeArea.bottom, 5) : 95;

  // 1. Initial pass: Calculate scaled typography, line wrapping, and bounding heights
  const processed: ComputedTextLayer[] = uniqueLayers.map((layer) => {
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
