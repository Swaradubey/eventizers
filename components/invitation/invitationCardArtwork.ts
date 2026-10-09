"use client";

import type { Invitation, TextLayer, CardBgConfig } from "@/types/invitationTypes";
import type { Event } from "@/services/eventService";

export interface InvitationCardBackground {
  type: "color" | "gradient" | "image";
  value: string;
}

export interface InvitationCardLayer {
  id?: string;
  key?: string;
  x?: number;
  y?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  rotation?: number;
  imageUrl?: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  align?: "left" | "center" | "right";
  fontWeight?: string | number;
  fontStyle?: string;
  lineHeight?: number;
  letterSpacing?: number | string;
  casing?: "uppercase" | "lowercase" | "capitalize" | "none";
  opacity?: number;
  isFoil?: "gold" | "rose-gold" | "silver" | null;
  borderRadius?: string;
}

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

function getNestedValue(obj: any, paths: string[]): any {
  for (const path of paths) {
    const keys = path.split(".");
    let current = obj;
    for (const key of keys) {
      if (current === null || current === undefined) break;
      current = current[key];
    }
    if (current !== null && current !== undefined) return current;
  }
  return null;
}

function isSnapshotOrRasterUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed === "") return false;
  if (
    trimmed.includes("user_upload") ||
    trimmed.includes("cleaned_background") ||
    trimmed.includes("replicate") ||
    trimmed.includes("/uploads/")
  ) {
    return false;
  }
  return (
    trimmed.includes("canvas_snapshot") ||
    trimmed.includes("invitation_snapshot") ||
    (trimmed.includes("snapshot") && !trimmed.startsWith("data:image/")) ||
    (trimmed.includes("invitation_cover") && !trimmed.includes("/uploads/") && !trimmed.startsWith("data:"))
  );
}

function checkIsUserUploadedImage(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (isSnapshotOrRasterUrl(trimmed)) return false;
  if (trimmed.startsWith("#")) return false;
  if (trimmed.includes("/assets/templates/") || trimmed.endsWith(".svg")) return false;
  if (trimmed.startsWith("data:image/")) return true;
  if (trimmed.startsWith("blob:")) return true;
  return (
    trimmed.includes("/uploads/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  );
}

function resolveCleanTemplateSvg(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  if (url.includes("-bg.svg")) return url;
  const svgMatch = url.match(/^(.*?)([^/]+)\.svg(\?.*)?$/i);
  if (svgMatch) {
    const prefix = svgMatch[1];
    const baseName = svgMatch[2];
    const query = svgMatch[3] || "";
    if (baseName.endsWith("-bg")) return url;
    if (baseName.endsWith("-mockup")) {
      const actualBase = baseName.replace(/-mockup$/, "");
      return `${prefix}${actualBase}-bg.svg${query}`;
    }
    return `${prefix}${baseName}-bg.svg${query}`;
  }
  return url;
}

export function resolveCardAspectRatio(invitation: Invitation | null | undefined, eventData: Event | null | undefined): number {
  if (!invitation) return 5 / 7;
  const canvasState = invitation.designData || parseMaybeJson(invitation.cardBg);
  const card = getNestedValue(invitation, ["card", "artworkUrl"]) ? invitation.card : null;
  const aspectRatio = getNestedValue(canvasState, ["innerCardLayer", "aspectRatio"]) ||
    getNestedValue(invitation, ["card", "aspectRatio"]) ||
    getNestedValue(card, ["aspectRatio"]) ||
    (invitation?.isLandscape ? "4/3" : "5/7");

  if (typeof aspectRatio === "string") {
    if (aspectRatio.includes("/")) {
      const [w, h] = aspectRatio.split("/").map(Number);
      if (w && h) return w / h;
    }
    if (aspectRatio === "square") return 1;
    if (aspectRatio === "5x7" || aspectRatio === "5/7") return 5 / 7;
    if (aspectRatio === "4x3" || aspectRatio === "4/3") return 4 / 3;
  }
  return invitation?.isLandscape ? 4 / 3 : 5 / 7;
}

export function resolveCardBackground(invitation: Invitation | null | undefined, eventData: Event | null | undefined): InvitationCardBackground {
  const cardBg = invitation?.background || invitation?.cardBg;
  if (cardBg && typeof cardBg === "object" && "type" in cardBg && "value" in cardBg) {
    const bg = cardBg as CardBgConfig;
    if (bg.type === "image" && bg.value) {
      if (checkIsUserUploadedImage(bg.value) || !isSnapshotOrRasterUrl(bg.value)) {
        return { type: "image", value: resolveCleanTemplateSvg(bg.value) || bg.value };
      }
    }
    if (bg.type === "color" && bg.value) {
      return { type: "color", value: bg.value };
    }
    if (bg.type === "gradient" && bg.value) {
      return { type: "gradient", value: bg.value };
    }
    if (bg.type === "preset" && bg.value) {
      return { type: "image", value: resolveCleanTemplateSvg(bg.value) || bg.value };
    }
  }

  const canvasState = invitation?.designData || parseMaybeJson(invitation?.cardBg);
  const cardBgFromCanvas = getNestedValue(canvasState, ["cardBg"]);
  if (cardBgFromCanvas && typeof cardBgFromCanvas === "object" && "type" in cardBgFromCanvas) {
    const bg = cardBgFromCanvas as CardBgConfig;
    if (bg.type === "image" && bg.value) {
      if (checkIsUserUploadedImage(bg.value) || !isSnapshotOrRasterUrl(bg.value)) {
        return { type: "image", value: resolveCleanTemplateSvg(bg.value) || bg.value };
      }
    }
    if (bg.type === "color" && bg.value) {
      return { type: "color", value: bg.value };
    }
    if (bg.type === "gradient" && bg.value) {
      return { type: "gradient", value: bg.value };
    }
  }

  const card = invitation?.card;
  if (card && card.backgroundColor) {
    return { type: "color", value: card.backgroundColor };
  }

  return { type: "color", value: invitation?.backgroundColor || "#FAF8F5" };
}

export function resolveCardDecorations(
  invitation: Invitation | null | undefined,
  eventData: Event | null | undefined,
  backgroundImage?: string
): string[] {
  const decorations: string[] = [];

  const cardDecorations = invitation?.card?.decorations || invitation?.decorations;
  if (Array.isArray(cardDecorations)) {
    for (const deco of cardDecorations) {
      const url = typeof deco === "string" ? deco : deco?.url || deco?.src;
      if (url && typeof url === "string" && !url.startsWith("#") && url !== backgroundImage) {
        decorations.push(resolveCleanTemplateSvg(url) || url);
      }
    }
  }

  const canvasState = invitation?.designData || parseMaybeJson(invitation?.cardBg);
  const canvasDecorations = getNestedValue(canvasState, ["decorations"]);
  if (Array.isArray(canvasDecorations)) {
    for (const deco of canvasDecorations) {
      const url = typeof deco === "string" ? deco : deco?.url || deco?.src;
      if (url && typeof url === "string" && !url.startsWith("#") && url !== backgroundImage) {
        decorations.push(resolveCleanTemplateSvg(url) || url);
      }
    }
  }

  const card = invitation?.card;
  if (card?.decorativeImages && Array.isArray(card.decorativeImages)) {
    for (const deco of card.decorativeImages) {
      const url = typeof deco === "string" ? deco : deco?.url || deco?.src;
      if (url && typeof url === "string" && !url.startsWith("#") && url !== backgroundImage) {
        decorations.push(resolveCleanTemplateSvg(url) || url);
      }
    }
  }

  return Array.from(new Set(decorations));
}

export function resolveCardImageSrc(invitation: Invitation | null | undefined, eventData: Event | null | undefined): string | null {
  const card = invitation?.card;
  const canvasState = invitation?.designData || parseMaybeJson(invitation?.cardBg);

  const userUpload = checkIsUserUploadedImage(invitation?.imageUrl) ? invitation?.imageUrl : null;
  const cardArtwork = card?.artworkUrl && !isSnapshotOrRasterUrl(card.artworkUrl) ? card.artworkUrl : null;
  const canvasCardArtwork = getNestedValue(canvasState, ["card", "artworkUrl"]);
  const canvasCardArtworkValid = canvasCardArtwork && !isSnapshotOrRasterUrl(canvasCardArtwork) ? canvasCardArtwork : null;
  const cardBgImage = invitation?.background?.type === "image" && checkIsUserUploadedImage(invitation.background.value)
    ? invitation.background.value
    : null;
  const canvasCardBgImage = getNestedValue(canvasState, ["cardBg", "value"]);
  const canvasCardBgValid = canvasCardBgImage && checkIsUserUploadedImage(canvasCardBgImage) && !isSnapshotOrRasterUrl(canvasCardBgImage)
    ? canvasCardBgImage
    : null;

  const rawCardImage = userUpload || cardArtwork || canvasCardArtworkValid || cardBgImage || canvasCardBgValid;
  if (rawCardImage) {
    return resolveCleanTemplateSvg(rawCardImage) || rawCardImage;
  }

  const templatePreview = (invitation as any)?.previewUrl;
  if (templatePreview && !isSnapshotOrRasterUrl(templatePreview)) {
    return resolveCleanTemplateSvg(templatePreview) || templatePreview;
  }

  return null;
}

export function resolveCardLayers(invitation: Invitation | null | undefined, eventData: Event | null | undefined): InvitationCardLayer[] {
  if (!invitation) return [];

  const textElements = invitation.textElements || [];
  if (!Array.isArray(textElements) || textElements.length === 0) return [];

  return textElements.map((layer: TextLayer) => ({
    id: layer.id,
    key: layer.key,
    x: layer.x ?? layer.left ?? 50,
    y: layer.y ?? layer.top ?? 50,
    left: layer.left ?? layer.x ?? 50,
    top: layer.top ?? layer.y ?? 50,
    width: layer.width,
    height: layer.height,
    rotation: (layer as any).rotation || 0,
    imageUrl: (layer as any).imageUrl,
    text: layer.text,
    fontFamily: layer.fontFamily,
    fontSize: layer.fontSize,
    color: layer.color,
    textAlign: layer.textAlign || layer.align || "center",
    align: layer.align || layer.textAlign || "center",
    fontWeight: layer.fontWeight,
    fontStyle: layer.fontStyle,
    lineHeight: layer.lineHeight,
    letterSpacing: layer.letterSpacing,
    casing: layer.casing,
    opacity: (layer as any).opacity,
    isFoil: layer.isFoil,
    borderRadius: (layer as any).borderRadius,
  })).filter(layer => layer.text?.trim() || layer.imageUrl);
}