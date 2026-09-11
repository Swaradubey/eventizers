import { TextLayer } from "../../types/invitationTypes";

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
  foilGradient?: string;
  [key: string]: any;
}

export interface ContainerDimensions {
  width: number;
  height: number;
}

const BASE_CANVAS_WIDTH = 500;

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
 * 1. Proportionally scales font size to container width.
 * 2. Accurately estimates multi-line wrapping and explicit line-break heights.
 * 3. Sorts layers vertically and enforces minimum clearance (minGapPercent)
 *    so multi-line blocks (e.g., date, venue) push lower blocks (address, RSVP)
 *    downward without vertical collision or overlapping.
 * 4. Gracefully compresses padding if the content stack approaches bottom bounds.
 */
export function computeAntiCollisionLayout(
  layers: TextLayer[],
  dimensions: ContainerDimensions,
  minGapPercent = 1.8
): ComputedTextLayer[] {
  if (!layers || layers.length === 0) return [];

  const width = Math.max(200, dimensions.width || BASE_CANVAS_WIDTH);
  const height = Math.max(280, dimensions.height || Math.round(width * 1.4));
  const scaleFactor = getContainerScaleFactor(width, BASE_CANVAS_WIDTH);

  // 1. Initial pass: Calculate scaled typography, line wrapping, and bounding heights
  const processed: ComputedTextLayer[] = layers.map((layer) => {
    const rawX = layer.left !== undefined ? layer.left : (layer.x !== undefined ? layer.x : 50);
    const rawY = layer.top !== undefined ? layer.top : (layer.y !== undefined ? layer.y : 50);

    const baseFontSize = layer.fontSize || 16;
    const scaledFontSize = Math.max(8, Math.round(baseFontSize * scaleFactor * 10) / 10);
    const effectiveLineHeight = layer.lineHeight || (scaledFontSize > 26 ? 1.15 : 1.25);

    // Multi-line estimation
    const text = layer.text || "";
    const paragraphs = text.split("\n");
    const maxTextWidthPx = Math.max(120, width * 0.88);
    let totalLines = 0;

    for (const p of paragraphs) {
      if (p.length === 0) {
        totalLines += 1;
        continue;
      }
      // Average character width estimate for invitation serif/sans/display fonts
      const charWidthEstimate = scaledFontSize * 0.52;
      const pWidthPx = p.length * charWidthEstimate;
      const wrappedLines = Math.max(1, Math.ceil(pWidthPx / maxTextWidthPx));
      totalLines += wrappedLines;
    }

    // Layer height in pixels and percentage of card height
    const heightPx = Math.round(totalLines * scaledFontSize * effectiveLineHeight + 6);
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
      isShifted: false,
    };
  });

  // 2. Sort by vertical order (rawY ascending) to identify sequential vertical stacks
  const sortedIndices = processed
    .map((_, i) => i)
    .sort((a, b) => processed[a].rawY - processed[b].rawY);

  // 3. Forward anti-collision cascade pass
  let maxBottomReached = 0;

  for (let k = 0; k < sortedIndices.length; k++) {
    const idx = sortedIndices[k];
    const item = processed[idx];
    const halfH = item.heightPercent / 2;

    if (k === 0) {
      // First element: clamp to avoid bleeding above top padding
      item.computedTop = Math.max(halfH + 2.5, item.rawY);
    } else {
      const prevIdx = sortedIndices[k - 1];
      const prevItem = processed[prevIdx];
      const prevBottom = prevItem.computedTop + (prevItem.heightPercent / 2);

      // Minimum required center Y to maintain clear visual gap
      const minRequiredCenterY = prevBottom + minGapPercent + halfH;

      if (item.rawY < minRequiredCenterY) {
        item.computedTop = Number(minRequiredCenterY.toFixed(2));
        item.isShifted = true;
      } else {
        item.computedTop = item.rawY;
      }
    }

    maxBottomReached = Math.max(maxBottomReached, item.computedTop + halfH);
  }

  // 4. Safe bottom bounds compression:
  // If the total pushed stack exceeds 95% of card height, proportionally compress gaps
  if (maxBottomReached > 95 && sortedIndices.length > 1) {
    const overflow = maxBottomReached - 95;
    const compressionPerItem = Math.min(overflow / (sortedIndices.length - 1), 2.5);

    for (let k = sortedIndices.length - 1; k >= 1; k--) {
      const idx = sortedIndices[k];
      const shiftBack = compressionPerItem * (k / (sortedIndices.length - 1));
      processed[idx].computedTop = Math.max(
        processed[idx].heightPercent / 2 + 3,
        Math.round((processed[idx].computedTop - shiftBack) * 10) / 10
      );
    }
  }

  return processed;
}
