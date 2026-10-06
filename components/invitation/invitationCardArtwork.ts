import { normalizeTemplateImageUrl } from "@/components/designer/canvasBackgroundUtils";
import { getCleanTemplateSvg, isSnapshotOrRasterUrl } from "@/components/designer/layoutUtils";
import { getTemplateConfig } from "@/lib/newTemplatesData";
import { getTemplateImage } from "@/lib/templateImages";
import { getImageUrl } from "@/utils/imageUrl";

// =============================================================================
// Invitation card artwork resolver
//
// The studio canvas composes a card out of: a background (image / gradient /
// colour), decorative illustrations and a list of text + image layers. The
// envelope viewer used to render `invitation.imageUrl` instead, which is either
// a flattened snapshot (rejected) or a clean background image with no text —
// leaving guests with a blank card.
//
// These helpers rebuild the same composition the editor shows so the viewer can
// render background + layered text directly.
// =============================================================================

export interface InvitationCardLayer {
  id?: string;
  key?: string;
  type?: string;
  text?: string;
  imageUrl?: string;
  src?: string;
  url?: string;
  x?: number;
  y?: number;
  left?: number;
  top?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  align?: string;
  textAlign?: string;
  casing?: string;
  letterSpacing?: number | string;
  lineHeight?: number;
  rotation?: number;
  opacity?: number;
  width?: number;
  height?: number;
  borderRadius?: string;
  visible?: boolean;
  hidden?: boolean;
  isFoil?: "gold" | "rose-gold" | "silver" | null;
}

export interface InvitationCardBackground {
  type: "image" | "color" | "gradient";
  value: string;
}

export const FALLBACK_CARD_COLOR = "#FAF8F5";

function parseMaybeJson(value: unknown): any {
  if (value == null) return null;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function firstNonEmpty(values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed) return trimmed;
  }
  return null;
}

function isCssColor(value: string): boolean {
  return /^#|^rgba?\(|^hsla?\(/i.test(value.trim());
}

function isCssGradient(value: string): boolean {
  return value.includes("gradient(");
}

/**
 * Snapshots / blob captures are flattened renders of the card. They are fine as
 * the whole card image, but never as a background underneath live text layers.
 */
function isFlattenedRender(value: string): boolean {
  const t = value.trim().toLowerCase();
  if (t.startsWith("blob:")) return true;
  if (t.includes("invitation_snapshot") || t.includes("canvas_snapshot")) return true;
  return isSnapshotOrRasterUrl(value);
}

function stripCssUrl(value: string): string {
  const match = value.match(/^url\(\s*['"]?(.*?)['"]?\s*\)$/i);
  return match ? match[1] : value;
}

/**
 * Mirrors the studio's `extractBgImageUrl`: pulls a usable background path out
 * of a string or layer-ish object. Colours, gradients, snapshots, base64
 * captures and blobs are rejected — they either are not images or must not be
 * painted underneath live text.
 */
function extractBgImageUrl(source: unknown): string | null {
  if (!source) return null;
  if (typeof source === "string") {
    const trimmed = stripCssUrl(source.trim());
    if (!trimmed) return null;
    if (isCssColor(trimmed) || isCssGradient(trimmed)) return null;
    if (trimmed.startsWith("data:")) return null;
    if (isFlattenedRender(trimmed)) return null;
    return trimmed;
  }
  if (typeof source === "object") {
    const obj = source as Record<string, any>;
    const candidate =
      obj.type === "image"
        ? obj.value || obj.url || obj.src
        : obj.url || obj.src || obj.imageUrl || obj.artworkUrl || obj.backgroundImage;
    return extractBgImageUrl(candidate);
  }
  return null;
}

function toPercent(value: unknown, fallback = 50): number {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  if (!isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, num));
}

function toLayerImageUrl(source: unknown): string | null {
  if (!source) return null;
  if (typeof source === "string") {
    const trimmed = stripCssUrl(source.trim());
    if (!trimmed || isCssColor(trimmed) || isCssGradient(trimmed)) return null;
    return trimmed;
  }
  if (typeof source === "object") {
    const obj = source as Record<string, any>;
    return firstNonEmpty([obj.url, obj.src, obj.imageUrl, obj.image]);
  }
  return null;
}

function readCanvasState(event?: any, invitation?: any): Record<string, any> {
  return (
    parseMaybeJson(event?.canvasState) ||
    parseMaybeJson(invitation?.canvasState) ||
    {}
  ) as Record<string, any>;
}

function readTemplate(event?: any, invitation?: any): Record<string, any> {
  const templateId =
    event?.selectedTemplateId ||
    event?.templateId ||
    invitation?.selectedTemplateId ||
    invitation?.templateId;
  return (getTemplateConfig(templateId) || {}) as Record<string, any>;
}

/** Text + photo layers exactly as the canvas editor persisted them. */
export function resolveCardLayers(invitation?: any, event?: any): InvitationCardLayer[] {
  const canvasState = readCanvasState(event, invitation);
  const rawLayers = firstLayerSource(
    canvasState.textLayers,
    canvasState.layers,
    invitation?.textElements,
    invitation?.layers,
    parseMaybeJson(invitation?.canvasState)?.textLayers
  );

  const seen = new Set<string>();
  const layers: InvitationCardLayer[] = [];

  for (const raw of rawLayers) {
    if (!raw || typeof raw !== "object") continue;
    if (raw.visible === false || raw.hidden === true) continue;

    const text = typeof raw.text === "string" ? raw.text : "";
    const hasText = text.trim().length > 0;
    const imageUrl = toLayerImageUrl(raw.imageUrl || raw.src || raw.url || raw.image);
    const isImage = raw.type === "image" || (!hasText && !!imageUrl);
    if (!hasText && !isImage) continue;

    const signature = String(raw.id || raw.key || `${text.trim()}|${raw.x ?? raw.left}|${raw.y ?? raw.top}`);
    if (seen.has(signature)) continue;
    seen.add(signature);

    layers.push({
      ...raw,
      id: raw.id || signature,
      text: hasText ? text : undefined,
      imageUrl: isImage ? imageUrl || undefined : undefined,
      x: toPercent(raw.x !== undefined ? raw.x : raw.left),
      y: toPercent(raw.y !== undefined ? raw.y : raw.top),
    });
  }

  return layers;
}

function firstLayerSource(...candidates: unknown[]): any[] {
  for (const candidate of candidates) {
    const list = asArray(candidate);
    if (list.length > 0) return list;
  }
  return [];
}

/** Background image / gradient / colour behind the text layers. */
export function resolveCardBackground(invitation?: any, event?: any): InvitationCardBackground {
  const canvasState = readCanvasState(event, invitation);
  const template = readTemplate(event, invitation);
  const templateMockup = getTemplateImage(
    event?.selectedTemplateId || invitation?.selectedTemplateId || ""
  );

  const imageCandidates = [
    extractBgImageUrl(canvasState.backgroundImageUrl),
    canvasState.cardBg?.type === "image" ? extractBgImageUrl(canvasState.cardBg.value) : null,
    canvasState.background?.type === "image" ? extractBgImageUrl(canvasState.background.value) : null,
    canvasState.backgroundLayer?.type === "image"
      ? extractBgImageUrl(canvasState.backgroundLayer.value || canvasState.backgroundLayer.url)
      : null,
    extractBgImageUrl(canvasState.card?.artworkUrl),
    extractBgImageUrl(canvasState.card?.borderIllustration),
    extractBgImageUrl(canvasState.card?.backgroundImage),
    extractBgImageUrl(invitation?.backgroundImage),
    extractBgImageUrl(invitation?.canvasData?.backgroundImage),
    extractBgImageUrl(invitation?.backgroundImageUrl),
    invitation?.cardBg?.type === "image" ? extractBgImageUrl(invitation.cardBg.value) : null,
    invitation?.background?.type === "image" ? extractBgImageUrl(invitation.background.value) : null,
    extractBgImageUrl(invitation?.card?.artworkUrl),
    extractBgImageUrl(invitation?.imageUrl),
    extractBgImageUrl(template.canvasData?.backgroundImage),
    extractBgImageUrl(template.card?.borderIllustration),
    extractBgImageUrl(template.card?.artworkUrl),
    extractBgImageUrl(template.decorationImage),
    extractBgImageUrl(template.backgroundImage),
  ].filter((value): value is string => Boolean(value));

  const image = imageCandidates.find(
    (value) => !templateMockup || normalizeTemplateImageUrl(value) !== normalizeTemplateImageUrl(templateMockup)
  );
  if (image) {
    return { type: "image", value: normalizeTemplateImageUrl(getCleanTemplateSvg(image) || image) };
  }

  const paintCandidates = [
    canvasState.cardBg && canvasState.cardBg.type !== "image" ? canvasState.cardBg.value : null,
    canvasState.background && canvasState.background.type !== "image" ? canvasState.background.value : null,
    invitation?.cardBg && invitation.cardBg.type !== "image" ? invitation.cardBg.value : null,
    invitation?.background && invitation.background.type !== "image" ? invitation.background.value : null,
    typeof template.gradient === "string" ? template.gradient : null,
    typeof template.card?.backgroundColor === "string" ? template.card.backgroundColor : null,
    typeof template.backgroundColor === "string" ? template.backgroundColor : null,
    typeof invitation?.backgroundColor === "string" ? invitation.backgroundColor : null,
  ].filter((value): value is string => {
    if (!value || typeof value !== "string") return false;
    const trimmed = value.trim();
    if (!trimmed || isSnapshotOrRasterUrl(trimmed) || trimmed.startsWith("data:")) return false;
    return isCssColor(trimmed) || isCssGradient(trimmed);
  });

  const paint = firstNonEmpty(paintCandidates);
  if (paint) {
    return { type: isCssGradient(paint) ? "gradient" : "color", value: paint.trim() };
  }

  return { type: "color", value: FALLBACK_CARD_COLOR };
}

/** Decorative frames / illustrations layered above the background. */
export function resolveCardDecorations(
  invitation?: any,
  event?: any,
  backgroundValue?: string
): string[] {
  const canvasState = readCanvasState(event, invitation);
  const raw = [
    ...asArray(canvasState.decorations),
    ...asArray(canvasState.card?.decorativeImages),
    ...asArray(invitation?.decorations),
  ];

  const normalizedBackground = backgroundValue ? normalizeTemplateImageUrl(backgroundValue) : "";
  const seen = new Set<string>();
  const decorations: string[] = [];

  for (const item of raw) {
    const url = toLayerImageUrl(item);
    if (!url) continue;
    const normalized = normalizeTemplateImageUrl(url);
    if (!normalized || isFlattenedRender(normalized) || normalized.startsWith("data:")) continue;
    if (normalizedBackground && normalized === normalizedBackground) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    decorations.push(normalized);
  }

  return decorations;
}

function parseAspectRatio(value: unknown): number | null {
  if (typeof value === "number" && isFinite(value) && value > 0) return value;
  if (typeof value !== "string") return null;
  const raw = value.trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes("landscape")) return 7 / 5;
  if (raw.includes("portrait")) return 5 / 7;
  if (raw.includes("square") || raw === "1/1" || raw === "1x1") return 1;
  const fraction = raw.match(/^(\d+(?:\.\d+)?)\s*[x/]\s*(\d+(?:\.\d+)?)$/);
  if (fraction) {
    const w = parseFloat(fraction[1]);
    const h = parseFloat(fraction[2]);
    if (w > 0 && h > 0) return w / h;
  }
  const numeric = parseFloat(raw);
  if (isFinite(numeric) && numeric > 0 && numeric <= 4) return numeric;
  return null;
}

/** width / height ratio of the card (5:7 portrait unless the design says otherwise). */
export function resolveCardAspectRatio(invitation?: any, event?: any): number {
  const canvasState = readCanvasState(event, invitation);
  if (canvasState.isLandscape) return 7 / 5;
  const template = readTemplate(event, invitation);
  const candidates = [
    canvasState.aspectRatio,
    canvasState.containerDimensions?.aspectRatio,
    canvasState.card?.aspectRatio,
    invitation?.aspectRatio,
    invitation?.card?.aspectRatio,
    template.card?.aspectRatio,
  ];
  for (const candidate of candidates) {
    const ratio = parseAspectRatio(candidate);
    if (ratio) return ratio;
  }
  return 5 / 7;
}

/**
 * Best static image of the card: a saved snapshot / upload, else the template
 * preview artwork. Used when the design has no live text layers to render.
 */
export function resolveCardImageSrc(invitation?: any, event?: any): string | null {
  const templateImage = getTemplateImage(
    event?.selectedTemplateId || invitation?.selectedTemplateId || ""
  );
  const raw = firstNonEmpty([
    invitation?.imageUrl,
    event?.previewUrl,
    event?.coverImage,
    invitation?.coverImage,
    templateImage,
  ]);
  if (!raw) return null;
  if (isCssColor(raw) || isCssGradient(raw)) {
    return templateImage ? getImageUrl(templateImage) : null;
  }
  return getImageUrl(raw);
}
