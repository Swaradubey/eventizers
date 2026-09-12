"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Type,
  Sparkles,
  Mail,
  Calendar,
  Layers,
  Upload,
  Plus,
  Trash2,
  Eye,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Loader2,
  Pipette,
  Check,
  MapPin,
  UserPlus,
  Tag,
  Share2,
  MessageCircle,
  Palette,
  Crown,
  CopyPlus,
} from "lucide-react";
import eventService, { Event } from "../../services/eventService";
import API from "../../services/api";
import { Invitation } from "../../types/invitationTypes";
import guestService from "../../services/guestService";
import templateService from "../../services/templateService";
import { NEW_TEMPLATES, NEW_TEMPLATES_CONFIG, getTemplateConfig, NewTemplateData, PhotoSlot } from "../../lib/newTemplatesData";
import GuestSelectionModal from "./GuestSelectionModal";
import InvitationCanvasStage from "./InvitationCanvasStage";
import EviteCardPreview from "./EviteCardPreview";
import RsvpOptionsModal, { RsvpOptionsState } from "./RsvpOptionsModal";
import InvitationWorkflowPreviewPane from "./InvitationWorkflowPreviewPane";
import InvitationWorkflowDetails, { HostDetailsData } from "./InvitationWorkflowDetails";
import InvitationWorkflowGifting, { WishlistData, CharityData, PersonalFundData } from "./InvitationWorkflowGifting";
import InvitationWorkflowReview from "./InvitationWorkflowReview";

// --- Types & Interfaces ---

export interface TextLayer {
  id: string;
  key?: string;
  text: string;
  x: number; // percentage: 0 to 100
  y: number; // percentage: 0 to 100
  top?: number;
  left?: number;
  fontSize: number; // px
  fontFamily: string;
  color: string;
  casing?: "uppercase" | "lowercase" | "capitalize" | "none";
  align?: "left" | "center" | "right";
  textAlign?: "left" | "center" | "right";
  letterSpacing?: number; // px
  lineHeight?: number; // multiplier e.g. 1.2
  fontWeight: string | number;
  isFoil?: "gold" | "rose-gold" | "silver" | null;
}

export const isUserUploadedImage = (url?: string | null): boolean => {
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
  // Any asset under /assets/templates/ is a template asset, NOT a user upload
  if (trimmed.includes("/assets/templates/")) {
    return false;
  }
  // Auto-generated canvas snapshot data URLs (from html-to-image) are NOT user uploads
  if (trimmed.startsWith("data:image/") && !trimmed.includes("user_upload")) {
    return false;
  }
  // Base64 user uploads, blob URLs, /uploads/ directory, or external upload URLs
  return (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    (trimmed.includes("/uploads/") && !trimmed.includes("snapshot")) ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  );
};

export const getCleanTemplateSvg = (url?: string | null): string | null => {
  if (!url || typeof url !== "string") return null;
  if (url.includes("/assets/templates/") && url.endsWith(".svg")) {
    if (url.endsWith("-bg.svg")) return url;
    return url.replace(/\.svg$/, "-bg.svg");
  }
  return url;
};

export const getPendingOrUploadedImageUrl = (
  invite?: Invitation | null,
  evt?: Event | null,
  explicitUrl?: string | null
): string | null => {
  if (explicitUrl && isUserUploadedImage(explicitUrl)) {
    return explicitUrl;
  }
  if (typeof window !== "undefined") {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramUrl =
        urlParams.get("uploadedImageUrl") ||
        urlParams.get("customBackgroundUrl") ||
        urlParams.get("imageUrl");
      if (paramUrl && isUserUploadedImage(paramUrl)) return paramUrl;
    } catch (_) {}

    try {
      const sessionUpload = sessionStorage.getItem("pending_upload_invite");
      if (sessionUpload && isUserUploadedImage(sessionUpload)) return sessionUpload;
    } catch (_) {}

    try {
      const localUpload = localStorage.getItem("pending_upload_invite");
      if (localUpload && isUserUploadedImage(localUpload)) return localUpload;
    } catch (_) {}
  }
  if (invite?.imageUrl && isUserUploadedImage(invite.imageUrl)) {
    return invite.imageUrl;
  }
  if (evt?.coverImage && isUserUploadedImage(evt.coverImage)) {
    return evt.coverImage;
  }
  if (evt?.imageUrl && isUserUploadedImage(evt.imageUrl)) {
    return evt.imageUrl;
  }
  return null;
};

export interface StudioDesignState {
  activeTemplateId: string | null;
  templateId?: string | null;
  isPureCss?: boolean;
  card?: any;
  decorations?: any[];
  cardImageFit?: "cover" | "contain";
  textLayers: TextLayer[];
  selectedTextId: string | null;
  photoSlot?: PhotoSlot | null;
  isLandscape?: boolean;
  cardBg: {
    type: "color" | "gradient" | "image" | "preset";
    value: string;
  };
  stageBackdrop: {
    type: "color" | "pattern";
    value: string;
    gradient?: string;
  };
  canvasWorkspaceBg?: string;
  backdropBackground?: string;
  envelope: {
    color: string;
    liner: string;
    linerCss?: string;
    stamp: string | null;
    sticker: string | null;
  };
  effects: {
    foil: "gold" | "rose-gold" | "silver" | null;
    texture: "matte" | "cotton-press" | "linen" | "glossy";
    shadow: "subtle" | "floating" | "deep" | "none";
  };
  backside?: {
    enabled: boolean;
    message?: string;
    signOff?: string;
    photoUrl?: string | null;
  };
  eventDetails: {
    title: string;
    host: string;
    date: string;
    time: string;
    venue: string;
    address: string;
    description?: string;
  };
}

interface InvitationStudioProps {
  initialEvent: Event | null;
  initialInvitation: Invitation | null;
  events?: Event[];
  selectedEventId?: string | null;
  onSelectEvent?: (eventId: string) => void;
  templateIdQuery?: string | null;
  uploadedImageUrl?: string | null;
  onSave?: (updated: any) => Promise<any>;
  onBack?: () => void;
}

// Preset Data
const TYPOGRAPHY_OPTIONS = [
  { name: "Londrina Solid - Black", value: "'Londrina Solid', cursive", weight: "900" },
  { name: "Permanent Marker", value: "'Permanent Marker', cursive", weight: "400" },
  { name: "Playfair Display", value: "'Playfair Display', serif", weight: "700" },
  { name: "Inter - Bold", value: "'Inter', sans-serif", weight: "700" },
  { name: "Caveat - Casual Script", value: "'Caveat', cursive", weight: "700" },
  { name: "Cinzel - Elegant Classic", value: "'Cinzel', serif", weight: "700" },
  { name: "Dancing Script", value: "'Dancing Script', cursive", weight: "700" },
  { name: "Montserrat - Geometric", value: "'Montserrat', sans-serif", weight: "800" },
];

export const PRESET_STAGE_BACKDROPS = [
  { id: "gold-swirl", label: "Evite Gold Swirl", style: "/assets/backdrops/evite_gold_swirl.jpg", icon: "✨" },
  { id: "carrara", label: "Carrara Marble", style: "linear-gradient(120deg, #f8fafc 0%, #e2e8f0 50%, #ffffff 100%)", icon: "🏛️" },
  { id: "studio-slate", label: "Studio Slate", style: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", icon: "🌌" },
  { id: "charcoal", label: "Charcoal Onyx", style: "#121316", icon: "⬛" },
  { id: "warm-linen", label: "Warm Linen", style: "#f7f5f0", icon: "📜" },
  { id: "terracotta", label: "Terracotta", style: "linear-gradient(135deg, #4a2818 0%, #7c3a20 100%)", icon: "🏺" },
];

const PRESET_BACKGROUNDS = [
  { id: "castle", label: "Pink Castle", style: "linear-gradient(180deg, #fbcfe8 0%, #ede9fe 100%)", icon: "🏰" },
  { id: "track", label: "Race Track", style: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #0284c7 100%)", icon: "🏎️" },
  { id: "clouds", label: "Soft Clouds", style: "linear-gradient(180deg, #bae6fd 0%, #e0f2fe 100%)", icon: "☁️" },
  { id: "mermaid", label: "Mermaid Scales", style: "linear-gradient(135deg, #c4b5fd 0%, #fbcfe8 50%, #a7f3d0 100%)", icon: "🧜‍♀️" },
  { id: "temple", label: "Temple Sunset", style: "linear-gradient(180deg, #311042 0%, #701a75 50%, #f97316 100%)", icon: "⛩️" },
  { id: "pool", label: "Summer Pool", style: "linear-gradient(135deg, #38bdf8 0%, #7dd3fc 60%, #fef08a 100%)", icon: "🛟" },
  { id: "mountains", label: "Origami Mountains", style: "linear-gradient(135deg, #86efac 0%, #6ee7b7 50%, #38bdf8 100%)", icon: "⛰️" },
  { id: "sunset", label: "Golden Sunset", style: "linear-gradient(180deg, #fb923c 0%, #fde047 100%)", icon: "🌅" },
  { id: "rainbow", label: "Rainbow Confetti", style: "conic-gradient(at center, #f43f5e, #fb923c, #facc15, #4ade80, #38bdf8, #a855f7, #f43f5e)", icon: "🌈" },
  { id: "night", label: "Midnight Galaxy", style: "linear-gradient(135deg, #090d16 0%, #1e1b4b 60%, #4338ca 100%)", icon: "✨" },
  { id: "floral", label: "Botanical Sage", style: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)", icon: "🌿" },
  { id: "linen", label: "Pure Linen", style: "#faf9f6", icon: "📜" },
];

const ENVELOPE_COLORS = [
  { id: "plum", hex: "#781d60", name: "Rich Berry" },
  { id: "mint", hex: "#9fd0c4", name: "Pale Mint" },
  { id: "kraft", hex: "#d8be9b", name: "Kraft Paper" },
  { id: "sage", hex: "#88b398", name: "Sage Green" },
  { id: "holographic", hex: "linear-gradient(135deg, #fbcfe8, #c4b5fd, #67e8f9)", name: "Holographic" },
  { id: "olive", hex: "#59664e", name: "Deep Olive" },
  { id: "espresso", hex: "#4b382a", name: "Dark Espresso" },
  { id: "sand", hex: "#e2d6c3", name: "Sand Tint" },
  { id: "camel", hex: "#cb9b6a", name: "Camel Tan" },
  { id: "coral", hex: "#e75836", name: "Sunset Coral" },
  { id: "rosegold", hex: "linear-gradient(135deg, #e0a899, #f7cac9)", name: "Rose Gold" },
  { id: "lavender", hex: "linear-gradient(135deg, #f3e8ff, #e9d5ff)", name: "Lavender Confetti" },
  { id: "ivory", hex: "#fbfbfa", name: "Crisp Ivory" },
  { id: "blackglitter", hex: "#18181b", name: "Midnight Onyx" },
  { id: "cyan", hex: "#54a8b7", name: "Ocean Cyan" },
  { id: "navy", hex: "#1d2c4d", name: "Classic Navy" },
  { id: "yellow", hex: "#facc15", name: "Electric Gold" },
  { id: "pink", hex: "#f472b6", name: "Bubblegum" },
  { id: "sagegreen", hex: "#A8C3B0", name: "Pastel Sage" },
  { id: "warmkraft", hex: "#C4A482", name: "Rustic Kraft" },
  { id: "powderblue", hex: "#9BB4CE", name: "Powder Blue" },
  { id: "warmlinen", hex: "#ECE8E1", name: "Warm Linen" },
  { id: "midnightnavy", hex: "#102A54", name: "Midnight Navy" },
];

const ENVELOPE_LINERS = [
  { id: "none", name: "Plain Solid", style: "rgba(0,0,0,0.02)" },
  { id: "gold-foil", name: "Gold Leaf Foil", style: "linear-gradient(135deg, #bf953f, #fcf6ba, #b38728)" },
  { id: "silver-foil", name: "Silver Leaf Foil", style: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 40%, #b8c6db 70%, #f5f7fa 100%)" },
  { id: "pink-gingham", name: "Pink Gingham", style: "repeating-linear-gradient(0deg, #fcdde3, #fcdde3 14px, #ffffff 14px, #ffffff 28px), repeating-linear-gradient(90deg, rgba(244,114,182,0.3), rgba(244,114,182,0.3) 14px, transparent 14px, transparent 28px)" },
  { id: "sage-mist", name: "Sage Mist", style: "linear-gradient(135deg, #a3b899 0%, #8ea383 100%)" },
  { id: "ivory-linen", name: "Ivory Cotton", style: "linear-gradient(135deg, #fdfbf7 0%, #f4f0e8 100%)" },
  { id: "pink-glitter", name: "Pink Glitter", style: "radial-gradient(circle at 50% 50%, #f472b6, #db2777)" },
  { id: "sprinkles", name: "Cake Sprinkles", style: "repeating-linear-gradient(45deg, #fbcfe8, #fbcfe8 10px, #fef08a 10px, #fef08a 20px, #67e8f9 20px, #67e8f9 30px)" },
  { id: "electric-gradient", name: "Electric Rainbow", style: "conic-gradient(at top left, #f43f5e, #eab308, #06b6d4, #8b5cf6, #f43f5e)" },
  { id: "marble", name: "Carrara Marble", style: "linear-gradient(120deg, #f1f5f9 0%, #e2e8f0 50%, #ffffff 100%)" },
  { id: "botanical", name: "Botanical Florals", style: "linear-gradient(135deg, #dcfce7, #86efac)" },
];

const STAMPS = [
  { id: "airmail", name: "Vintage Airmail", emoji: "✈️" },
  { id: "rose", name: "Botanical Rose", emoji: "🌹" },
  { id: "wax", name: "Gold Seal", emoji: "⚜️" },
  { id: "cake", name: "Birthday Cake", emoji: "🎂" },
];

const STICKERS = [
  { id: "star", name: "Golden Star", emoji: "⭐" },
  { id: "heart", name: "Rose Heart", emoji: "💖" },
  { id: "love", name: "Wax 'LOVE'", emoji: "💌" },
  { id: "sparkle", name: "Sparkle Magic", emoji: "✨" },
];

export default function InvitationStudio({
  initialEvent,
  initialInvitation,
  events: propEvents,
  selectedEventId: propSelectedEventId,
  onSelectEvent,
  templateIdQuery,
  uploadedImageUrl,
  onSave,
  onBack,
}: InvitationStudioProps) {
  const router = useRouter();

  // --- Template State Builder ---
  const createDesignStateFromTemplate = (
    tplId: string | null | undefined,
    evt: Event | null,
    invite: Invitation | null,
    isExplicitSwitch?: boolean
  ): StudioDesignState => {
    // If the user uploaded an existing invitation, detect it immediately
    const pendingUploadUrl = !isExplicitSwitch
      ? getPendingOrUploadedImageUrl(invite, evt, uploadedImageUrl)
      : null;
    const effectiveTplId = pendingUploadUrl ? null : tplId;
    const tplConfig = effectiveTplId ? getTemplateConfig(effectiveTplId) : null;

    const isDark =
      tplConfig?.textColor === "#FFFFFF" ||
      tplConfig?.textColor?.toLowerCase() === "#f8fafc" ||
      tplConfig?.backgroundColor?.toLowerCase() === "#0a0b10" ||
      tplConfig?.backgroundColor?.toLowerCase() === "#14131a" ||
      tplConfig?.id === "tpl-electric-outline" ||
      tplConfig?.id === "tpl-hype-night";

    const pendingUploadTitle = typeof window !== "undefined"
      ? sessionStorage.getItem("pending_upload_title")
      : null;

    const titleText =
      pendingUploadTitle ||
      tplConfig?.title ||
      invite?.eventTitle ||
      invite?.title ||
      evt?.title ||
      "YOU'RE INVITED!";

    const dateText =
      tplConfig?.date
        ? `${tplConfig.date}${tplConfig.time ? " AT " + tplConfig.time : ""}`
        : invite?.eventDate
          ? `${new Date(invite.eventDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          }).toUpperCase()}${invite.eventTime ? " AT " + invite.eventTime : ""}`
          : evt?.eventDate
            ? `${new Date(evt.eventDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            }).toUpperCase()}${evt.eventTime ? " AT " + evt.eventTime : ""}`
            : "SATURDAY, OCTOBER 14 AT 4:00 PM";

    const venueText =
      tplConfig?.venue ||
      invite?.eventVenue ||
      invite?.mainText ||
      evt?.venue ||
      "123 CELEBRATION WAY, BROOKLYN, NY";

    const descriptionText =
      tplConfig?.description ||
      (invite as any)?.description ||
      (invite as any)?.message ||
      (evt as any)?.description ||
      "Join us for an unforgettable celebration filled with joy, music, and wonderful moments!";

    const hostText =
      tplConfig?.host ||
      invite?.subtitle ||
      (evt ? `Hosted by ${evt.title}` : "Hosted with love by the family");

    // Resolve Typography
    const titleFont = tplConfig?.fontFamily
      ? (tplConfig.fontFamily.includes(",") || tplConfig.fontFamily.includes("'")
        ? tplConfig.fontFamily
        : `'${tplConfig.fontFamily}', sans-serif`)
      : invite?.fontFamily
        ? (invite.fontFamily.includes(",") || invite.fontFamily.includes("'")
          ? invite.fontFamily
          : `'${invite.fontFamily}', serif`)
        : "'Playfair Display', serif";

    const titleColor =
      tplConfig?.accentColor ||
      tplConfig?.textColor ||
      invite?.accentColor ||
      invite?.textColor ||
      "#51afff";

    const titleSize = tplConfig?.titleSize || invite?.titleSize || 42;
    const titleWeight = String(tplConfig?.fontWeight || invite?.fontWeight || "800");
    const titleAlign = (tplConfig?.textAlignment as any) || (invite?.textAlignment as any) || "center";

    let cardBgType: "color" | "gradient" | "image" | "preset" = "color";
    let cardBgValue = "#faf8f5";

    // Priority -1: User-uploaded invitation image (highest priority: renders 1:1 as-is)
    if (pendingUploadUrl) {
      cardBgType = "image";
      cardBgValue = pendingUploadUrl;
    }
    // Priority 0: Preserved 4-Layer state from invite (if it contains real artwork / image)
    else if (invite?.cardBg && (invite.cardBg.type === "image" || !((tplConfig as any)?.card?.artworkUrl))) {
      cardBgType = invite.cardBg.type;
      cardBgValue = invite.cardBg.value;
    } else if (invite?.background && (invite.background.type === "image" || !((tplConfig as any)?.card?.artworkUrl))) {
      cardBgType = invite.background.type;
      cardBgValue = invite.background.value;
    }
    // Priority 1: Evite decoupled card artwork (pure decorative frame, no baked text)
    else if ((tplConfig as any)?.card?.artworkUrl) {
      cardBgType = "image";
      cardBgValue = (tplConfig as any).card.artworkUrl;
    }
    // Priority 2: Clean Template Decoration Image (never with baked-in text)
    else if (tplConfig?.decorationImage && typeof tplConfig.decorationImage === "string") {
      cardBgType = "image";
      cardBgValue = tplConfig.decorationImage;
    }
    // Priority 3: Preserved color/gradient from invite
    else if (invite?.cardBg) {
      cardBgType = invite.cardBg.type;
      cardBgValue = invite.cardBg.value;
    } else if (invite?.background) {
      cardBgType = invite.background.type;
      cardBgValue = invite.background.value;
    }
    // Priority 3: Template gradient (clean — no text, just colors)
    else if (tplConfig?.gradient && typeof tplConfig.gradient === "string") {
      cardBgType = "gradient";
      cardBgValue = tplConfig.gradient;
    }
    // Priority 4: Template solid background color
    else if (tplConfig?.backgroundColor && typeof tplConfig.backgroundColor === "string") {
      cardBgType = "color";
      cardBgValue = tplConfig.backgroundColor;
    }
    // Priority 5: User-uploaded invitation image (user-chosen, no template text overlap risk)
    else if (invite?.imageUrl && isUserUploadedImage(invite.imageUrl)) {
      cardBgType = "image";
      cardBgValue = invite.imageUrl;
    }
    // Priority 6: Clean template SVG fallback if invitation has a template image URL
    else if (invite?.imageUrl && invite.imageUrl.includes("/assets/templates/")) {
      cardBgType = "image";
      cardBgValue = getCleanTemplateSvg(invite.imageUrl) || "#faf8f5";
    }
    // Fallback: clean warm white
    else {
      cardBgType = "color";
      cardBgValue = "#faf8f5";
    }

    // Resolve Text Layers: prioritize saved text elements from draft/invite whenever present
    let resolvedTextLayers: TextLayer[] = [];
    const hasSavedLayers = Boolean(!isExplicitSwitch && invite?.textElements && Array.isArray(invite.textElements) && invite.textElements.length > 0);
    if (hasSavedLayers) {
      resolvedTextLayers = (invite!.textElements as TextLayer[]).map((tl) => ({ ...tl }));
    } else if ((tplConfig as any)?.defaultTextLayers && Array.isArray((tplConfig as any).defaultTextLayers) && (tplConfig as any).defaultTextLayers.length > 0) {
      resolvedTextLayers = (tplConfig as any).defaultTextLayers.map((tl: any) => ({
        id: tl.id,
        key: tl.key,
        text: tl.text,
        x: tl.left !== undefined ? tl.left : (tl.x !== undefined ? tl.x : 50),
        y: tl.top !== undefined ? tl.top : (tl.y !== undefined ? tl.y : 50),
        top: tl.top !== undefined ? tl.top : tl.y,
        left: tl.left !== undefined ? tl.left : tl.x,
        fontSize: tl.fontSize,
        fontFamily: tl.fontFamily,
        color: tl.color,
        casing: "none" as const,
        align: tl.textAlign || tl.align || "center",
        textAlign: tl.textAlign || tl.align || "center",
        letterSpacing: 0.5,
        lineHeight: 1.2,
        fontWeight: String(tl.fontWeight),
        isFoil: null,
      }));
    } else if (tplConfig?.textLayers && tplConfig.textLayers.length > 0) {
      resolvedTextLayers = tplConfig.textLayers.map((tl) => ({
        id: tl.id,
        key: tl.key,
        text: tl.text,
        x: tl.x !== undefined ? tl.x : (tl.left || 50),
        y: tl.y !== undefined ? tl.y : (tl.top || 50),
        top: tl.top !== undefined ? tl.top : tl.y,
        left: tl.left !== undefined ? tl.left : tl.x,
        fontSize: tl.fontSize,
        fontFamily: tl.fontFamily,
        color: tl.color,
        casing: tl.casing || "none",
        align: tl.align || tl.textAlign || "center",
        textAlign: tl.textAlign || tl.align || "center",
        letterSpacing: tl.letterSpacing || 0.5,
        lineHeight: tl.lineHeight || 1.2,
        fontWeight: String(tl.fontWeight),
        isFoil: tl.isFoil || null,
      }));
    } else {
      resolvedTextLayers = [
        {
          id: "layer-title",
          text: titleText.toUpperCase(),
          x: 50,
          y: 32,
          fontSize: titleSize,
          fontFamily: titleFont,
          color: titleColor,
          casing: "uppercase",
          align: titleAlign,
          letterSpacing: 2,
          lineHeight: 1.1,
          fontWeight: titleWeight,
        },
        {
          id: "layer-datetime",
          text: dateText,
          x: 50,
          y: 50,
          fontSize: 15,
          fontFamily: "'Inter', sans-serif",
          color: isDark ? (tplConfig?.textColor || "#FFFFFF") : "#1e293b",
          casing: "uppercase",
          align: "center",
          letterSpacing: 1.5,
          lineHeight: 1.3,
          fontWeight: "700",
        },
        {
          id: "layer-venue",
          text: venueText,
          x: 50,
          y: 60,
          fontSize: 14,
          fontFamily: "'Inter', sans-serif",
          color: isDark ? "rgba(255, 255, 255, 0.85)" : "#475569",
          casing: "none",
          align: "center",
          letterSpacing: 0.5,
          lineHeight: 1.3,
          fontWeight: "600",
        },
        {
          id: "layer-description",
          text: descriptionText,
          x: 50,
          y: 70,
          fontSize: 12,
          fontFamily: "'Inter', sans-serif",
          color: isDark ? "rgba(255, 255, 255, 0.75)" : "#64748b",
          casing: "none",
          align: "center",
          letterSpacing: 0.3,
          lineHeight: 1.4,
          fontWeight: "400",
        },
        {
          id: "layer-host",
          text: hostText,
          x: 50,
          y: 80,
          fontSize: 12,
          fontFamily: "'Inter', sans-serif",
          color: isDark ? "rgba(255, 255, 0.65)" : "#94a3b8",
          casing: "none",
          align: "center",
          letterSpacing: 0.5,
          lineHeight: 1.2,
          fontWeight: "500",
        },
      ];
    }

    const defaultSelectedId =
      resolvedTextLayers.find((l) => l.id.includes("title") || l.id.includes("names"))?.id ||
      resolvedTextLayers[0]?.id ||
      "layer-title";

    const defaultAmbientBackdrop = "/assets/backdrops/evite_gold_swirl.jpg";
    const savedBackdrop = invite?.stageBackdrop || (invite as any)?.backdrop || (tplConfig as any)?.backdrop || {
      type: "pattern",
      value: defaultAmbientBackdrop,
    };

    const initialBackdropValue =
      (invite as any)?.canvasWorkspaceBg ||
      (invite as any)?.backdropBackground ||
      savedBackdrop.value ||
      defaultAmbientBackdrop;

    const savedEnvelope = invite?.envelope || {
      color: (tplConfig as any)?.envelope?.outerColor || tplConfig?.envelopeColor || invite?.accentColor || (isDark ? "#18181b" : "#781d60"),
      liner: (tplConfig as any)?.envelope?.linerPatternUrl || tplConfig?.envelopeLiner || "gold-foil",
      stamp: "wax",
      sticker: null,
    };

    const savedEffects = invite?.effects || {
      foil: (tplConfig as any)?.foil === "gold" ? "gold" : null,
      texture: tplConfig?.isLandscape ? "matte" : "cotton-press",
      shadow: "floating",
    };

    const savedBackside = (invite as any)?.backside || {
      enabled: false,
      message: "We can't wait to celebrate with you! Please join us for this special occasion.",
      signOff: hostText || "With love, The Host",
      photoUrl: null,
    };

    const resolvedCard = pendingUploadUrl ? null : {
      ...((tplConfig as any)?.card || {}),
      ...((invite as any)?.card || {}),
      artworkUrl: (invite as any)?.card?.artworkUrl || (tplConfig as any)?.card?.artworkUrl || (cardBgType === "image" ? cardBgValue : ""),
      decorations: (invite as any)?.decorations || (invite as any)?.card?.decorations || (tplConfig as any)?.card?.decorations || (tplConfig as any)?.decorations || [],
      decorativeImages: (invite as any)?.card?.decorativeImages || (tplConfig as any)?.card?.decorativeImages || ((tplConfig as any)?.card?.artworkUrl ? [(tplConfig as any).card.artworkUrl] : []),
      illustrationLayers: (invite as any)?.card?.illustrationLayers || (tplConfig as any)?.card?.illustrationLayers || [],
      stickerElements: (invite as any)?.card?.stickerElements || (tplConfig as any)?.card?.stickerElements || [],
    };

    const resolvedDecorations = resolvedCard?.decorations || [];

    return {
      activeTemplateId: pendingUploadUrl ? null : (tplConfig?.id || tplId || null),
      templateId: pendingUploadUrl ? null : (tplConfig?.id || tplId || null),
      isPureCss: pendingUploadUrl ? false : ((tplConfig as any)?.isPureCss || false),
      card: resolvedCard,
      decorations: resolvedDecorations,
      cardImageFit: "contain",
      isLandscape: invite?.isLandscape !== undefined ? !!invite.isLandscape : !!tplConfig?.isLandscape,
      photoSlot: pendingUploadUrl ? null : (tplConfig?.photoSlot ? { ...tplConfig.photoSlot } : null),
      textLayers: resolvedTextLayers,
      selectedTextId: defaultSelectedId,
      cardBg: {
        type: cardBgType,
        value: cardBgValue,
      },
      stageBackdrop: {
        ...savedBackdrop,
        value: initialBackdropValue,
        gradient: (tplConfig?.backdrop as any)?.gradient || (savedBackdrop as any)?.gradient,
      },
      canvasWorkspaceBg: initialBackdropValue,
      backdropBackground: initialBackdropValue,
      envelope: {
        ...savedEnvelope,
        linerCss: (tplConfig?.envelope as any)?.linerCss || (savedEnvelope as any)?.linerCss,
      },
      effects: savedEffects,
      backside: savedBackside,
      eventDetails: {
        title: invite?.eventTitle || invite?.title || evt?.title || tplConfig?.title || titleText,
        host: invite?.subtitle || tplConfig?.host || hostText,
        date: invite?.eventDate || evt?.eventDate || tplConfig?.date || "2026-10-14",
        time: invite?.eventTime || evt?.eventTime || tplConfig?.time || "16:00",
        venue: invite?.eventVenue || invite?.mainText || evt?.venue || tplConfig?.venue || venueText,
        address: invite?.eventVenue || evt?.address || tplConfig?.venue || venueText,
        description: tplConfig?.description || descriptionText,
      },
    };
  };

  // --- Initial Design State Generation ---
  const getInitialDesign = (): StudioDesignState => {
    let cachedDraft: any = null;
    if (typeof window !== "undefined") {
      try {
        const targetEvtId =
          initialInvitation?.eventId ||
          initialEvent?.id ||
          propSelectedEventId ||
          new URLSearchParams(window.location.search).get("eventId");
        if (targetEvtId) {
          const raw = localStorage.getItem(`invitation_4layer_${targetEvtId}`);
          if (raw) cachedDraft = JSON.parse(raw);
        }
      } catch (e) {}
    }

    const mergedInvite = {
      ...(initialInvitation || {}),
      ...(cachedDraft || {}),
    };

    const pendingUploadUrl = getPendingOrUploadedImageUrl(mergedInvite as any, initialEvent, uploadedImageUrl);
    const isUploadedSession = Boolean(pendingUploadUrl);

    const effectiveTemplateId = isUploadedSession
      ? null
      : (cachedDraft?.templateId ||
         mergedInvite?.templateId ||
         templateIdQuery ||
         initialEvent?.selectedTemplateId ||
         (typeof window !== "undefined"
           ? sessionStorage.getItem("pending_template_id") || localStorage.getItem("pending_template_id")
           : null));

    const baseState = createDesignStateFromTemplate(effectiveTemplateId, initialEvent, mergedInvite as any);

    // If the user came from "Upload Existing", override the card background with the
    // uploaded image URL — this has highest priority over any template background.
    if (isUploadedSession && pendingUploadUrl) {
      baseState.cardBg = { type: "image", value: pendingUploadUrl };
      baseState.card = null;
      baseState.photoSlot = null;
      baseState.isPureCss = false;
      baseState.activeTemplateId = null;
      baseState.templateId = null;
      baseState.cardImageFit = "contain";
    }

    if (typeof window !== "undefined") {
      // If AI generated dynamic 4-layer stationery design, seamlessly inject all layers
      const pendingStationery = sessionStorage.getItem("pending_stationery_design");
      if (pendingStationery) {
        try {
          const sd = JSON.parse(pendingStationery);
          if (sd.envelopeColor) baseState.envelope.color = sd.envelopeColor;
          if (sd.envelopeLiner) {
            baseState.envelope.liner = sd.envelopeLiner;
            baseState.envelope.linerCss = sd.envelopeLiner;
          }
          if (sd.backdropColor) {
            baseState.stageBackdrop = { type: "color", value: sd.backdropColor };
          }
          if (sd.cardBgColor && (!baseState.cardBg || baseState.cardBg.type !== "image")) {
            baseState.cardBg = { type: "color", value: sd.cardBgColor };
          }
          if (Array.isArray(sd.textElements) && sd.textElements.length > 0) {
            baseState.textLayers = sd.textElements.map((el: any, idx: number) => ({
              id: el.id || `ai-layer-${idx}`,
              key: el.role || el.id || `layer-${idx}`,
              text: el.text || "",
              x: el.x !== undefined ? (el.x > 1 ? el.x : Math.round(el.x * 100)) : 50,
              y: el.y !== undefined ? (el.y > 1 ? el.y : Math.round(el.y * 100)) : (22 + idx * 12),
              top: el.y !== undefined ? (el.y > 1 ? el.y : Math.round(el.y * 100)) : (22 + idx * 12),
              left: el.x !== undefined ? (el.x > 1 ? el.x : Math.round(el.x * 100)) : 50,
              fontSize: el.fontSize || (el.role === "title" ? 36 : 14),
              fontFamily: el.fontFamily?.includes("'") ? el.fontFamily : `'${el.fontFamily || "Inter"}', sans-serif`,
              color: el.color || "#1E293B",
              fontWeight: el.role === "title" ? "800" : "600",
              align: "center",
              textAlign: "center",
              letterSpacing: 0.5,
              lineHeight: 1.2,
              casing: "none" as const,
            }));
          }
        } catch (e) {
          console.warn("Could not apply pending_stationery_design:", e);
        }
      }
    }

    return baseState;
  };

  const [designState, setDesignState] = useState<StudioDesignState>(getInitialDesign);
  const [activeTab, setActiveTab] = useState<"text" | "backgrounds" | "envelope" | "effects" | "backside" | "details">("text");
  const [showingBackside, setShowingBackside] = useState(false);
  const [envelopeSubTab, setEnvelopeSubTab] = useState<"colors" | "liners" | "stamps" | "stickers">("colors");
  const [isGuestSelectionModalOpen, setIsGuestSelectionModalOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  // --- Canvas Zoom & Aspect Ratio Controls ---
  const [canvasZoom, setCanvasZoom] = useState(100); // 50-150%
  type CanvasPreset = "portrait-5x7" | "square-5x5" | "story-9x16" | "landscape-4x3";
  const [canvasPreset, setCanvasPreset] = useState<CanvasPreset>(
    designState.isLandscape ? "landscape-4x3" : "portrait-5x7"
  );

  const CANVAS_PRESETS: { id: CanvasPreset; label: string; aspect: string; maxW: number; isLandscape: boolean }[] = [
    { id: "portrait-5x7", label: "5×7 Portrait", aspect: "3/4.2", maxW: 480, isLandscape: false },
    { id: "square-5x5", label: "5×5 Square", aspect: "1/1", maxW: 460, isLandscape: false },
    { id: "story-9x16", label: "9:16 Story", aspect: "9/16", maxW: 340, isLandscape: false },
    { id: "landscape-4x3", label: "4×3 Landscape", aspect: "4/3", maxW: 580, isLandscape: true },
  ];

  const activePreset = CANVAS_PRESETS.find((p) => p.id === canvasPreset) || CANVAS_PRESETS[0];

  const handleSelectPreset = (preset: CanvasPreset) => {
    const cfg = CANVAS_PRESETS.find((p) => p.id === preset)!;
    setCanvasPreset(preset);
    setDesignState((prev) => ({ ...prev, isLandscape: cfg.isLandscape }));
  };

  const handleZoomIn = () => setCanvasZoom((z) => Math.min(150, z + 10));
  const handleZoomOut = () => setCanvasZoom((z) => Math.max(50, z - 10));

  // Template tracking for re-hydration
  const loadedTemplateIdRef = useRef<string | null>(
    templateIdQuery ||
    initialInvitation?.templateId ||
    initialEvent?.selectedTemplateId ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("pending_template_id") || localStorage.getItem("pending_template_id")
      : null)
  );

  // Centralized Multi-Step Workflow Navigation ("Design", "Details", "Gifting", "Review", "Add guests")
  const WORKFLOW_TABS = ["Design", "Details", "Gifting", "Review", "Add guests"] as const;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Workflow State: Host Details, RSVP Options, Wishlists, Charities, Funds
  const [hostDetails, setHostDetails] = useState<HostDetailsData>({
    name: (initialEvent as any)?.host || (initialInvitation?.designData?.hostDetails?.name) || "SWARA KUMARI",
    phone: initialInvitation?.designData?.hostDetails?.phone || "",
    coHost: initialInvitation?.designData?.hostDetails?.coHost || "",
  });

  const [rsvpOptions, setRsvpOptions] = useState<RsvpOptionsState>({
    deadlineEnabled: Boolean(
      initialInvitation?.designData?.rsvpOptions?.deadlineEnabled ||
      initialEvent?.rsvpSettings?.rsvpDeadline
    ),
    deadlineDate:
      initialInvitation?.designData?.rsvpOptions?.deadlineDate ||
      initialEvent?.rsvpSettings?.rsvpDeadline ||
      "",
    allowAfterDeadline:
      initialInvitation?.designData?.rsvpOptions?.allowAfterDeadline ?? false,
    allowMaybe:
      initialInvitation?.designData?.rsvpOptions?.allowMaybe ??
      initialEvent?.rsvpSettings?.allowMaybeResponse ??
      true,
    privateGuestList:
      initialInvitation?.designData?.rsvpOptions?.privateGuestList ?? false,
    allowGuestsToBringAnyone:
      initialInvitation?.designData?.rsvpOptions?.allowGuestsToBringAnyone ??
      initialEvent?.rsvpSettings?.allowPlusOnes ??
      true,
    maxAdditionalGuests:
      initialInvitation?.designData?.rsvpOptions?.maxAdditionalGuests ??
      initialEvent?.rsvpSettings?.maxPlusOnes ??
      9,
  });

  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);

  const [wishlists, setWishlists] = useState<WishlistData[]>(
    initialInvitation?.designData?.wishlists || []
  );
  const [charities, setCharities] = useState<CharityData[]>(
    initialInvitation?.designData?.charities || []
  );
  const [personalFunds, setPersonalFunds] = useState<PersonalFundData[]>(
    initialInvitation?.designData?.personalFunds || []
  );

  // Synchronize Details form fields with Canvas text layers and eventDetails
  const handleDetailsFieldChange = (
    field: "title" | "dateTime" | "location" | "hostNote",
    value: string
  ) => {
    setDesignState((prev) => {
      const nextDetails = { ...prev.eventDetails };
      let nextLayers = [...prev.textLayers];

      if (field === "title") {
        nextDetails.title = value;
        nextLayers = nextLayers.map((l) =>
          l.id === "layer-title" || l.key === "title" || l.id === "layer-names"
            ? { ...l, text: value }
            : l
        );
      } else if (field === "dateTime") {
        nextDetails.date = value;
        nextLayers = nextLayers.map((l) =>
          l.id === "layer-date" || l.key === "dateTime"
            ? { ...l, text: value }
            : l
        );
      } else if (field === "location") {
        nextDetails.venue = value;
        nextDetails.address = value;
        nextLayers = nextLayers.map((l) =>
          l.id === "layer-venue" || l.key === "venue"
            ? { ...l, text: value }
            : l
        );
      } else if (field === "hostNote") {
        nextDetails.description = value;
        nextLayers = nextLayers.map((l) =>
          l.id === "layer-description" || l.id === "layer-rsvp"
            ? { ...l, text: value }
            : l
        );
      }

      return {
        ...prev,
        eventDetails: nextDetails,
        textLayers: nextLayers,
      };
    });
  };

  // Tracks whether we are in the process of generating a snapshot + saving before opening dispatch
  const [isPreparingDispatch, setIsPreparingDispatch] = useState(false);

  // Undo / Redo History Stacks
  const [undoStack, setUndoStack] = useState<StudioDesignState[]>([]);
  const [redoStack, setRedoStack] = useState<StudioDesignState[]>([]);

  const pushStateToHistory = (nextState: StudioDesignState) => {
    setUndoStack((prev) => [...prev.slice(-25), designState]);
    setRedoStack([]);
    setDesignState(nextState);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [designState, ...prev]);
    setDesignState(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setUndoStack((prev) => [...prev, designState]);
    setDesignState(next);
  };

  // Draggable text layer tracking
  const cardCanvasRef = useRef<HTMLDivElement>(null);
  const envelopeStageRef = useRef<HTMLDivElement>(null);
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const dragStartPos = useRef<{ mouseX: number; mouseY: number; layerX: number; layerY: number } | null>(null);

  // Active selected text layer
  const activeLayer = designState.textLayers.find((l) => l.id === designState.selectedTextId) || designState.textLayers[0];

  // Selection handler to activate any text layer and sync with toolbar
  const handleSelectLayer = (layerId: string) => {
    setDesignState((prev) => ({ ...prev, selectedTextId: layerId }));
    setActiveTab("text");
  };

  // Update active text layer properties with two-way sync to eventDetails
  const updateActiveLayer = (updates: Partial<TextLayer>) => {
    if (!activeLayer) return;
    const newLayers = designState.textLayers.map((layer) => {
      if (layer.id === activeLayer.id) {
        return { ...layer, ...updates };
      }
      return layer;
    });

    let updatedEventDetails = { ...designState.eventDetails };
    if (updates.text !== undefined) {
      if (activeLayer.id === "layer-title" || activeLayer.id === "layer-names") {
        updatedEventDetails.title = updates.text.replace(/\n/g, " ");
      } else if (activeLayer.id === "layer-venue") {
        updatedEventDetails.venue = updates.text;
      } else if (activeLayer.id === "layer-host") {
        updatedEventDetails.host = updates.text;
      } else if (activeLayer.id === "layer-description" || activeLayer.id === "layer-rsvp") {
        updatedEventDetails.description = updates.text;
      }
    }

    pushStateToHistory({
      ...designState,
      textLayers: newLayers,
      eventDetails: updatedEventDetails,
    });
  };

  // Drag text layer handlers
  const handleLayerMouseDown = (e: React.MouseEvent, layer: TextLayer) => {
    e.stopPropagation();
    setDesignState((prev) => ({ ...prev, selectedTextId: layer.id }));
    setActiveTab("text");
    setDraggingLayerId(layer.id);
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      layerX: layer.left !== undefined ? layer.left : (layer.x !== undefined ? layer.x : 50),
      layerY: layer.top !== undefined ? layer.top : (layer.y !== undefined ? layer.y : 50),
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingLayerId || !dragStartPos.current || !cardCanvasRef.current) return;
      const rect = cardCanvasRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStartPos.current.mouseX) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartPos.current.mouseY) / rect.height) * 100;

      const newX = Math.round(Math.max(5, Math.min(95, dragStartPos.current.layerX + deltaX)));
      const newY = Math.round(Math.max(5, Math.min(95, dragStartPos.current.layerY + deltaY)));

      setDesignState((prev) => ({
        ...prev,
        textLayers: prev.textLayers.map((layer) =>
          layer.id === draggingLayerId ? { ...layer, x: newX, y: newY, left: newX, top: newY } : layer
        ),
      }));
    };

    const handleMouseUp = () => {
      if (draggingLayerId) {
        setDraggingLayerId(null);
        dragStartPos.current = null;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingLayerId]);

  // Add new text box
  const handleAddTextBox = () => {
    const newId = `layer-${Date.now()}`;
    const newLayer: TextLayer = {
      id: newId,
      text: "NEW TEXT",
      x: 50,
      y: 45,
      fontSize: 24,
      fontFamily: "'Inter', sans-serif",
      color: "#1e293b",
      casing: "uppercase",
      align: "center",
      letterSpacing: 1,
      lineHeight: 1.2,
      fontWeight: "700",
    };
    pushStateToHistory({
      ...designState,
      textLayers: [...designState.textLayers, newLayer],
      selectedTextId: newId,
    });
    setActiveTab("text");
  };

  // Delete active text box
  const handleDeleteActiveLayer = () => {
    if (designState.textLayers.length <= 1) return;
    const remaining = designState.textLayers.filter((l) => l.id !== activeLayer?.id);
    pushStateToHistory({
      ...designState,
      textLayers: remaining,
      selectedTextId: remaining[0]?.id || null,
    });
  };

  // Custom image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await templateService.uploadTemplateImage(file, file.name);
      if (res && res.success && res.url) {
        pushStateToHistory({
          ...designState,
          cardBg: { type: "image", value: res.url },
          card: null,
          isPureCss: false,
          photoSlot: null,
          activeTemplateId: null,
          templateId: null,
          cardImageFit: "contain",
        });
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Photo slot image upload & replacement
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSlotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        if (result) {
          const nextState: StudioDesignState = {
            ...designState,
            photoSlot: designState.photoSlot
              ? { ...designState.photoSlot, imageUrl: result }
              : null,
          };
          setDesignState(nextState);
          pushStateToHistory(nextState);
          setToast({
            message: "📸 Photo updated successfully!",
            type: "success",
          });
        }
      };
      reader.readAsDataURL(file);

      // Attempt background upload to cloud/server
      templateService
        .uploadTemplateImage(file, `photo_slot_${Date.now()}_${file.name}`)
        .then((res) => {
          if (res && res.url) {
            setDesignState((prev) => ({
              ...prev,
              photoSlot: prev.photoSlot ? { ...prev.photoSlot, imageUrl: res.url } : null,
            }));
          }
        })
        .catch((err) => {
          console.warn("Background photo slot upload fallback to data URL:", err);
        });
    } catch (err) {
      console.error("Failed to read photo file:", err);
    }
  };

  // --- Snapshot, Save & Dispatch Integration ---
  const [currentInvitation, setCurrentInvitation] = useState<Invitation | null>(initialInvitation);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(initialEvent);
  const [eventsList, setEventsList] = useState<Event[]>(propEvents || []);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [guestEmailsInput, setGuestEmailsInput] = useState("");
  const [eventGuests, setEventGuests] = useState<any[]>([]);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Synchronize events list from props or fetch dynamically
  useEffect(() => {
    if (propEvents && propEvents.length > 0) {
      setEventsList(propEvents);
    } else {
      eventService
        .getEvents()
        .then((res) => {
          if (res && res.success && res.events) {
            setEventsList(res.events);
          }
        })
        .catch(console.error);
    }
  }, [propEvents]);

  // Handle event switching from the top bar or toolbar dropdown
  const handleEventChange = async (eventId: string) => {
    if (onSelectEvent) {
      onSelectEvent(eventId);
    }
    const foundEvt = eventsList.find((e) => e.id === eventId);
    if (!foundEvt) return;

    setCurrentEvent(foundEvt);

    // 1. Check local storage cache for saved 4-layer state
    let cachedDraft: any = null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`invitation_4layer_${eventId}`);
        if (raw) cachedDraft = JSON.parse(raw);
      } catch (e) {}
    }

    // 2. Fetch saved invitation draft from backend API
    let remoteInvite: any = null;
    try {
      const res = await API.get(`/events/${eventId}/invitation`);
      if (res.data?.success && res.data?.invitation) {
        remoteInvite = res.data.invitation;
      }
    } catch (fetchErr) {
      console.warn("[handleEventChange] Remote invitation fetch notice:", fetchErr);
    }

    // 3. Merge cached draft and remote invitation
    const targetInvite = {
      ...(remoteInvite || {}),
      ...(cachedDraft || {}),
    };

    // 4. Determine target template ID (with fallback to default)
    const targetTplId =
      targetInvite?.templateId ||
      foundEvt?.selectedTemplateId ||
      "tpl-cake-and-confetti";

    loadedTemplateIdRef.current = targetTplId;

    // 5. Hydrate fresh state from template
    const freshState = createDesignStateFromTemplate(
      targetTplId,
      foundEvt,
      targetInvite,
      false
    );

    // 6. Set current invitation and full canvas design state
    setCurrentInvitation(targetInvite.id ? targetInvite : null);
    setDesignState({
      ...freshState,
      card: targetInvite.card || freshState.card,
      cardBg: targetInvite.cardBg || targetInvite.background || freshState.cardBg,
      decorations: targetInvite.decorations || targetInvite.card?.decorations || freshState.decorations || [],
      textLayers: (targetInvite.textElements && targetInvite.textElements.length > 0)
        ? targetInvite.textElements
        : freshState.textLayers,
      eventDetails: {
        ...freshState.eventDetails,
        title: foundEvt.title || targetInvite.eventTitle || targetInvite.title || freshState.eventDetails.title,
        date: foundEvt.eventDate ? foundEvt.eventDate.substring(0, 10) : targetInvite.eventDate || freshState.eventDetails.date,
        time: foundEvt.eventTime || targetInvite.eventTime || freshState.eventDetails.time,
        venue: foundEvt.venue || targetInvite.eventVenue || freshState.eventDetails.venue,
        address: (foundEvt as any).location || foundEvt.venue || targetInvite.eventVenue || freshState.eventDetails.address,
        description: foundEvt.description || targetInvite.mainText || freshState.eventDetails.description,
        host: (foundEvt as any).host || hostDetails.name || freshState.eventDetails.host,
      },
    });

    // 7. Update host details and rsvp options if saved
    if (targetInvite.designData?.hostDetails || (foundEvt as any)?.host) {
      setHostDetails({
        name: targetInvite.designData?.hostDetails?.name || (foundEvt as any)?.host || "SWARA KUMARI",
        phone: targetInvite.designData?.hostDetails?.phone || "",
        coHost: targetInvite.designData?.hostDetails?.coHost || "",
      });
    }
    if (targetInvite.designData?.rsvpOptions || foundEvt.rsvpSettings) {
      setRsvpOptions({
        deadlineEnabled: Boolean(targetInvite.designData?.rsvpOptions?.deadlineEnabled ?? foundEvt.rsvpSettings?.rsvpDeadline),
        deadlineDate: targetInvite.designData?.rsvpOptions?.deadlineDate || foundEvt.rsvpSettings?.rsvpDeadline || "",
        allowAfterDeadline: targetInvite.designData?.rsvpOptions?.allowAfterDeadline ?? false,
        allowMaybe: targetInvite.designData?.rsvpOptions?.allowMaybe ?? foundEvt.rsvpSettings?.allowMaybeResponse ?? true,
        privateGuestList: targetInvite.designData?.rsvpOptions?.privateGuestList ?? false,
        allowGuestsToBringAnyone: targetInvite.designData?.rsvpOptions?.allowGuestsToBringAnyone ?? foundEvt.rsvpSettings?.allowPlusOnes ?? true,
        maxAdditionalGuests:
          targetInvite.designData?.rsvpOptions?.maxAdditionalGuests ??
          foundEvt.rsvpSettings?.maxPlusOnes ??
          9,
      });
    }

    // 8. Synchronize URL query parameters
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("eventId", eventId);
      if (targetInvite?.id) {
        url.searchParams.set("invitationId", targetInvite.id);
      } else {
        url.searchParams.delete("invitationId");
      }
      if (targetTplId) {
        url.searchParams.set("templateId", targetTplId);
      }
      window.history.pushState({}, "", url.toString());
    }

    setToast({
      message: `✨ Switched to "${foundEvt.title}"! Loaded saved design & artwork.`,
      type: "success",
    });
  };

  // WhatsApp Share Flow reading current card state & event context
  const handleWhatsAppShare = async () => {
    if (isSavingDraft || isGeneratingSnapshot) return;
    try {
      let saved = await saveDesign();
      const inv = saved || currentInvitation || initialInvitation;
      const targetId = inv?.id;

      if (!targetId) {
        setToast({
          message: "Please save the invitation before sharing.",
          type: "error",
        });
        return;
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const publishedUrl = `${origin}/invitation/${targetId}`;

      const title = designState.eventDetails.title || currentEvent?.title || initialEvent?.title || "Special Event Invitation";
      const subtitle = designState.eventDetails.description ? `\n_${designState.eventDetails.description}_` : "";
      const dateStr = designState.eventDetails.date
        ? `\n📅 *Date:* ${designState.eventDetails.date}${designState.eventDetails.time ? ` at ${designState.eventDetails.time}` : ""}`
        : currentEvent?.eventDate
        ? `\n📅 *Date:* ${new Date(currentEvent.eventDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`
        : "";
      const venueStr = (designState.eventDetails.venue || currentEvent?.venue)
        ? `\n📍 *Location:* ${designState.eventDetails.venue || currentEvent?.venue}`
        : "";

      const messageText = `✨ *You're Cordially Invited!* ✨\n\n*${title}*${subtitle}${dateStr}${venueStr}\n\nPlease view your full invitation & RSVP using the link below:\n${publishedUrl}`;

      const selectedGuestPhones = Array.from(
        new Set(
          eventGuests
            .filter((g: any) => selectedGuestIds.includes(g.id) && g.phone && g.phone.trim())
            .map((g: any) => g.phone.trim())
        )
      );

      if (selectedGuestPhones.length === 1) {
        const cleanPhone = selectedGuestPhones[0].replace(/[^\d+]/g, "").replace(/^\+/, "");
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
        window.open(whatsappUrl, "_blank");
      } else {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
        window.open(whatsappUrl, "_blank");
      }

      setToast({
        message: "WhatsApp share link generated! Opening WhatsApp...",
        type: "success",
      });
    } catch (err: any) {
      console.error("WhatsApp share failed:", err);
      setToast({
        message: "Failed to generate WhatsApp share link.",
        type: "error",
      });
    }
  };

  // Synchronize initial props
  useEffect(() => {
    if (initialInvitation) {
      setCurrentInvitation(initialInvitation);
    }
  }, [initialInvitation]);

  useEffect(() => {
    if (initialEvent) {
      setCurrentEvent(initialEvent);
    }
  }, [initialEvent]);

  // When initialInvitation.imageUrl arrives asynchronously (after mount), apply it as
  // the card background if it looks like a real uploaded image URL and the current
  // canvas is still showing a blank / default color background (not a user-chosen image).
  const uploadAppliedToCanvasRef = useRef(false);
  useEffect(() => {
    if (uploadAppliedToCanvasRef.current) return;
    // Guard: never override an active preset template with an asynchronous snapshot or background update
    if (designState.activeTemplateId || designState.templateId || designState.card?.artworkUrl) return;
    // Check sessionStorage first (highest priority — set by Hero / AI-assistant upload flow)
    const pendingFromSession = typeof window !== "undefined"
      ? sessionStorage.getItem("pending_upload_invite") || localStorage.getItem("pending_upload_invite")
      : null;
    const uploadedUrl =
      pendingFromSession ||
      (initialInvitation?.imageUrl && isUserUploadedImage(initialInvitation.imageUrl)
        ? initialInvitation.imageUrl
        : null);

    if (!uploadedUrl) return;

    uploadAppliedToCanvasRef.current = true;
    setDesignState((prev) => ({
      ...prev,
      cardBg: { type: "image", value: uploadedUrl },
      card: null,
      isPureCss: false,
      photoSlot: null,
      activeTemplateId: null,
      templateId: null,
      cardImageFit: prev.cardImageFit || "contain",
    }));
  }, [initialInvitation?.imageUrl, designState.activeTemplateId, designState.templateId, designState.card?.artworkUrl]);

  // Auto-detect natural aspect ratio of uploaded image to optimize canvas preset
  useEffect(() => {
    const uploadedUrl =
      (designState.cardBg?.type === "image" && isUserUploadedImage(designState.cardBg.value)
        ? designState.cardBg.value
        : null) ||
      (typeof window !== "undefined"
        ? sessionStorage.getItem("pending_upload_invite") || localStorage.getItem("pending_upload_invite")
        : null);

    if (!uploadedUrl) return;

    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      if (ratio > 1.2) {
        setCanvasPreset("landscape-4x3");
        setDesignState((prev) => ({ ...prev, isLandscape: true }));
      } else if (ratio < 0.65) {
        setCanvasPreset("story-9x16");
        setDesignState((prev) => ({ ...prev, isLandscape: false }));
      } else if (ratio >= 0.9 && ratio <= 1.1) {
        setCanvasPreset("square-5x5");
        setDesignState((prev) => ({ ...prev, isLandscape: false }));
      } else {
        setCanvasPreset("portrait-5x7");
        setDesignState((prev) => ({ ...prev, isLandscape: false }));
      }
    };
    img.src = uploadedUrl;
  }, []);

  // Canvas Re-hydration & Source Template Loading Logic
  useEffect(() => {
    // If an uploaded image is active on the canvas or in storage,
    // prevent default template presets or placeholder graphics from mounting over it.
    const hasUploadedImage =
      (designState.cardBg?.type === "image" && isUserUploadedImage(designState.cardBg.value)) ||
      (typeof window !== "undefined" &&
        Boolean(sessionStorage.getItem("pending_upload_invite") || localStorage.getItem("pending_upload_invite")));

    if (hasUploadedImage) return;

    const targetEvtId =
      currentEvent?.id ||
      initialEvent?.id ||
      propSelectedEventId ||
      initialInvitation?.eventId;

    let cachedDraft: any = null;
    if (typeof window !== "undefined" && targetEvtId) {
      try {
        const raw = localStorage.getItem(`invitation_4layer_${targetEvtId}`);
        if (raw) cachedDraft = JSON.parse(raw);
      } catch (e) {}
    }

    const mergedInvite = {
      ...(initialInvitation || {}),
      ...(cachedDraft || {}),
    };

    const targetTplId =
      mergedInvite?.templateId ||
      initialInvitation?.templateId ||
      templateIdQuery ||
      initialEvent?.selectedTemplateId ||
      currentEvent?.selectedTemplateId ||
      (typeof window !== "undefined"
        ? sessionStorage.getItem("pending_template_id") || localStorage.getItem("pending_template_id")
        : null);

    const hasSavedLayers = Boolean(
      (initialInvitation?.textElements && initialInvitation.textElements.length > 0) ||
      (cachedDraft?.textElements && cachedDraft.textElements.length > 0)
    );

    if (hasSavedLayers || (targetTplId && targetTplId !== loadedTemplateIdRef.current)) {
      loadedTemplateIdRef.current = targetTplId || null;
      const freshState = createDesignStateFromTemplate(
        targetTplId,
        currentEvent || initialEvent,
        mergedInvite as any,
        false
      );
      setDesignState((prev) => {
        const nextCard = freshState.card || prev.card;
        const nextCardBg = (freshState.cardBg?.type === "image" || !prev.cardBg || prev.cardBg.type !== "image")
          ? freshState.cardBg
          : prev.cardBg;
        return {
          ...freshState,
          card: nextCard,
          cardBg: nextCardBg,
          decorations: freshState.decorations || prev.decorations || nextCard?.decorations || [],
        };
      });
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem("pending_template_id");
          localStorage.removeItem("pending_template_id");
        } catch (e) {}
      }
    }
  }, [
    initialInvitation?.id,
    initialInvitation?.templateId,
    initialInvitation?.textElements,
    initialEvent?.selectedTemplateId,
    currentEvent?.id,
    templateIdQuery,
  ]);

  // Apply new template from in-studio template switcher
  const handleSelectTemplate = (templateId: string) => {
    const config = getTemplateConfig(templateId);
    if (!config) return;
    loadedTemplateIdRef.current = templateId;
    const nextState = createDesignStateFromTemplate(
      templateId,
      currentEvent || initialEvent,
      currentInvitation || initialInvitation,
      true
    );
    pushStateToHistory(nextState);

    // Update URL query param to reflect new template
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("templateId", templateId);
        window.history.replaceState({}, "", url.toString());
      } catch (e) {}
    }

    setToast({
      message: `✨ Loaded ${config.title} template into canvas!`,
      type: "success",
    });
  };

  // Fetch guests for selected event
  useEffect(() => {
    const targetEvtId = currentEvent?.id || initialEvent?.id;
    if (targetEvtId) {
      guestService.getGuests(undefined, targetEvtId).then((res) => {
        if (res && res.success && res.guests) {
          setEventGuests(res.guests);
          setSelectedGuestIds(res.guests.map((g: any) => g.id));
        }
      }).catch(console.error);
    }
  }, [currentEvent?.id, initialEvent?.id]);

  // Handle applying guest selection from GuestSelectionModal
  const handleApplyGuestSelection = (appliedGuests: any[], appliedIds: string[]) => {
    setEventGuests((prev) => {
      const existingKeys = new Set(
        prev.map((g) => (g.email ? g.email.trim().toLowerCase() : "") || g.id)
      );
      const toAdd = appliedGuests.filter((g) => {
        const key = (g.email ? g.email.trim().toLowerCase() : "") || g.id;
        return !existingKeys.has(key);
      });
      return [...prev, ...toAdd];
    });
    setSelectedGuestIds(appliedIds);
    setToast({
      message: `Selected ${appliedIds.length} guest(s) from contacts & groups! ✨`,
      type: "success",
    });
  };

  // Upload base64 snapshot to server/cloud storage first to avoid large base64 body issues
  const uploadSnapshotBlob = async (dataUrl: string): Promise<string | null> => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const uploadRes = await templateService.uploadTemplateImage(blob, `snapshot_${Date.now()}.png`);
      if (uploadRes && uploadRes.success && uploadRes.url) {
        return uploadRes.url;
      }
    } catch (err) {
      console.warn("[Canvas Snapshot] Snapshot file upload fallback, error:", err);
    }
    return null;
  };

  // Capture ONLY the rendered template card snapshot (excluding envelope stage, liners, stamps, and editor UI)
  const generateSnapshot = async (): Promise<{ dataUrl: string | null; uploadedUrl: string | null }> => {
    const targetNode = cardCanvasRef.current || document.getElementById("invitation-card-container");
    if (!targetNode) {
      console.warn("[Canvas Snapshot] Card container ref not found in DOM");
      return { dataUrl: null, uploadedUrl: null };
    }
    setIsGeneratingSnapshot(true);
    try {
      // Temporarily deselect active text border & drag handles for pristine clean card capture
      const prevSelected = designState.selectedTextId;
      setDesignState((prev) => ({ ...prev, selectedTextId: null }));
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)));

      // Multi-stage capture with graceful fallbacks
      let dataUrl: string | null = null;
      const bgColor = typeof designState.cardBg.value === "string" && !designState.cardBg.value.includes("gradient")
        ? designState.cardBg.value
        : undefined;

      // Stage 1: High-res 2x capture
      try {
        dataUrl = await toPng(targetNode, {
          quality: 0.95,
          pixelRatio: 2.0,
          cacheBust: true,
          backgroundColor: bgColor,
          filter: (node: HTMLElement) => {
            if (node instanceof HTMLImageElement && node.naturalWidth === 0) return false;
            return true;
          },
        });
      } catch (e1) {
        console.warn("[Canvas Snapshot] Stage 1 capture failed, retrying with skipFonts: true and 1.5x pixelRatio:", e1);
        try {
          // Stage 2: Fallback with skipFonts: true (avoids CORS issues on Google fonts stylesheets)
          dataUrl = await toPng(targetNode, {
            quality: 0.9,
            pixelRatio: 1.5,
            skipFonts: true,
            cacheBust: true,
            backgroundColor: bgColor,
            filter: (node: HTMLElement) => {
              if (node instanceof HTMLImageElement && node.naturalWidth === 0) return false;
              return true;
            },
          });
        } catch (e2) {
          console.warn("[Canvas Snapshot] Stage 2 capture failed, retrying with safe 1.0x pixelRatio:", e2);
          // Stage 3: Safe 1.0x fallback
          dataUrl = await toPng(targetNode, {
            quality: 0.85,
            pixelRatio: 1.0,
            skipFonts: true,
            cacheBust: true,
            backgroundColor: bgColor,
          });
        }
      }

      setDesignState((prev) => ({ ...prev, selectedTextId: prevSelected }));

      if (dataUrl && dataUrl.startsWith("data:")) {
        setSnapshotDataUrl(dataUrl);

        // Upload to file storage so the payload sends a lightweight URL instead of raw base64
        let uploadedUrl: string | null = null;
        try {
          uploadedUrl = await uploadSnapshotBlob(dataUrl);
        } catch (uploadErr) {
          console.warn("[Canvas Snapshot] Upload blob error:", uploadErr);
        }

        return { dataUrl, uploadedUrl };
      }

      return { dataUrl: null, uploadedUrl: null };
    } catch (err) {
      console.error("Failed to generate template card snapshot:", err);
      // Non-blocking snapshot failure — let user continue without blocking
      return { dataUrl: null, uploadedUrl: null };
    } finally {
      setIsGeneratingSnapshot(false);
    }
  };

  // Helper to construct normalized designer payload
  const constructPayload = (snapshotUrl?: string | null) => {
    const titleLayer = designState.textLayers.find((l) => l.id === "layer-title" || l.id === "layer-names");
    const dateLayer = designState.textLayers.find((l) => l.id === "layer-datetime" || l.id === "layer-date");
    const venueLayer = designState.textLayers.find((l) => l.id === "layer-venue");
    const descLayer = designState.textLayers.find((l) => l.id === "layer-description" || l.id === "layer-rsvp" || l.id === "layer-subtitle");
    const hostLayer = designState.textLayers.find((l) => l.id === "layer-host" || l.id === "layer-names");

    const titleText =
      titleLayer?.text?.trim() ||
      designState.eventDetails.title?.trim() ||
      currentEvent?.title?.trim() ||
      initialEvent?.title?.trim() ||
      "Party Invitation";

    const subtitleText = hostLayer?.text?.trim() || designState.eventDetails.host?.trim() || "";
    const mainText = venueLayer?.text?.trim() || designState.eventDetails.venue?.trim() || "";
    const message = descLayer?.text?.trim() || (designState.eventDetails as any)?.description?.trim() || hostLayer?.text?.trim() || designState.eventDetails.host?.trim() || "";
    const accentColor = titleLayer?.color || "#51afff";
    const textColor = titleLayer?.color || dateLayer?.color || "#1e293b";
    const titleSize = Math.max(16, Math.min(120, Math.round(titleLayer?.fontSize || 42)));
    const targetEventId =
      currentEvent?.id ||
      initialEvent?.id ||
      currentInvitation?.eventId ||
      (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("eventId") : null);

    const activeTplId = designState.activeTemplateId || designState.templateId || templateIdQuery || "custom";
    const tplConfig = getTemplateConfig(activeTplId);
    const templateName = tplConfig?.title || designState.activeTemplateId || "Custom Template";

    const resolvedImageUrl = snapshotUrl
      || (designState.cardBg.type === "image" && designState.cardBg.value ? designState.cardBg.value : null)
      || currentInvitation?.imageUrl
      || currentEvent?.coverImage
      || initialEvent?.coverImage
      || null;

    const rsvpLayer = designState.textLayers.find((l) => l.id === "layer-rsvp" || l.key === "rsvp");
    const buttonText = rsvpLayer?.text?.trim() || currentInvitation?.buttonText || "RSVP Now";

    const normalizedTextLayers = designState.textLayers.map((l) => ({
      id: l.id,
      key: l.key,
      text: l.text,
      x: l.x !== undefined ? l.x : (l.left !== undefined ? l.left : 50),
      y: l.y !== undefined ? l.y : (l.top !== undefined ? l.top : 50),
      top: l.top !== undefined ? l.top : (l.y !== undefined ? l.y : 50),
      left: l.left !== undefined ? l.left : (l.x !== undefined ? l.x : 50),
      fontSize: l.fontSize,
      fontFamily: l.fontFamily,
      color: l.color,
      casing: l.casing || "none",
      align: l.align || l.textAlign || "center",
      textAlign: l.textAlign || l.align || "center",
      letterSpacing: l.letterSpacing !== undefined ? l.letterSpacing : 0,
      lineHeight: l.lineHeight || 1.25,
      fontWeight: String(l.fontWeight),
      isFoil: l.isFoil || null,
    }));

    const effectiveArtworkUrl =
      (designState.card as any)?.artworkUrl ||
      (tplConfig as any)?.card?.artworkUrl ||
      (designState.cardBg?.type === "image" && !isUserUploadedImage(designState.cardBg.value) ? designState.cardBg.value : null) ||
      (tplConfig as any)?.decorationImage ||
      null;

    const decorativeImages: string[] = Array.from(
      new Set(
        [
          effectiveArtworkUrl,
          ...((designState.card as any)?.decorativeImages || []),
          ...((tplConfig as any)?.card?.decorativeImages || []),
          ...((designState.card as any)?.decorations || []),
          ...((tplConfig as any)?.card?.decorations || []),
          ...(designState.decorations || []),
        ].filter(Boolean)
      )
    );

    const fullCardModel = {
      ...((tplConfig as any)?.card || {}),
      ...(designState.card || {}),
      artworkUrl: effectiveArtworkUrl || (designState.card as any)?.artworkUrl || (tplConfig as any)?.card?.artworkUrl || "",
      decorativeBorderSvgUrl: (designState.card as any)?.decorativeBorderSvgUrl || (tplConfig as any)?.card?.decorativeBorderSvgUrl || effectiveArtworkUrl || "",
      backgroundColor: (designState.card as any)?.backgroundColor || tplConfig?.backgroundColor || (typeof designState.cardBg.value === "string" && !designState.cardBg.value.includes("/") ? designState.cardBg.value : "#FAF8F5"),
      aspectRatio: (designState.card as any)?.aspectRatio || activePreset.aspect || "5x7",
      decorations: decorativeImages,
      decorativeImages,
      illustrationLayers: (designState.card as any)?.illustrationLayers || (tplConfig as any)?.card?.illustrationLayers || [],
      stickerElements: (designState.card as any)?.stickerElements || (tplConfig as any)?.card?.stickerElements || [],
    };

    const fullBackgroundModel = {
      ...designState.cardBg,
      color: typeof designState.cardBg.value === "string" && !designState.cardBg.value.includes("/")
        ? designState.cardBg.value
        : (tplConfig?.backgroundColor || (designState.card as any)?.backgroundColor || "#FAF8F5"),
      pattern: (designState.cardBg as any)?.pattern || null,
      decorativeImages,
      artworkUrl: effectiveArtworkUrl,
    };

    return {
      id: currentInvitation?.id || undefined,
      eventId: targetEventId,
      templateId: activeTplId,
      templateName,
      title: titleText,
      subtitle: subtitleText,
      mainText,
      message,
      accentColor,
      backgroundColor: typeof designState.cardBg.value === "string" && !designState.cardBg.value.includes("/") ? designState.cardBg.value : (tplConfig?.backgroundColor || "#FAF8F5"),
      textColor,
      titleSize,
      fontWeight: titleLayer?.fontWeight || "900",
      fontFamily: titleLayer?.fontFamily || "'Londrina Solid', cursive",
      textAlignment: titleLayer?.align || "center",
      imageUrl: resolvedImageUrl,
      buttonText,
      buttonColor: accentColor,
      buttonRadius: 12,
      status: "draft",
      eventTitle: designState.eventDetails.title || currentEvent?.title || initialEvent?.title || titleText,
      eventDate: designState.eventDetails.date || currentEvent?.eventDate || initialEvent?.eventDate || null,
      eventTime: designState.eventDetails.time || currentEvent?.eventTime || initialEvent?.eventTime || null,
      eventVenue: designState.eventDetails.venue || venueLayer?.text?.trim() || currentEvent?.venue || initialEvent?.venue || null,
      textElements: normalizedTextLayers,
      layers: normalizedTextLayers,
      card: fullCardModel,
      decorations: decorativeImages,
      containerDimensions: { width: 540, height: 756, aspectRatio: designState.isLandscape ? "landscape" : "5x7" },
      canvasPreset,
      aspectRatio: activePreset.aspect,
      background: fullBackgroundModel,
      cardBg: fullBackgroundModel,
      stageBackdrop: designState.stageBackdrop,
      backdrop: designState.stageBackdrop,
      canvasWorkspaceBg: designState.stageBackdrop.value,
      backdropBackground: designState.stageBackdrop.value,
      envelope: designState.envelope,
      effects: designState.effects,
      backside: designState.backside,
      isLandscape: designState.isLandscape,
      location: designState.eventDetails.address || designState.eventDetails.venue || null,
      designData: {
        ...(currentInvitation?.designData || {}),
        hostDetails,
        rsvpOptions,
        wishlists,
        charities,
        personalFunds,
      },
      rsvpSettings: {
        rsvpDeadline: rsvpOptions.deadlineEnabled ? rsvpOptions.deadlineDate || null : null,
        allowPlusOnes: rsvpOptions.allowGuestsToBringAnyone,
        maxPlusOnes: rsvpOptions.maxAdditionalGuests,
        allowMaybeResponse: rsvpOptions.allowMaybe,
        requirePhoneNumber: false,
        collectDietaryRestrictions: false,
        collectMealPreference: false,
        collectSongRequests: false,
        customQuestions: [],
      },
    };
  };

  // Save current design state to backend with diagnostics
  const saveDesign = async (uploadedSnapshotUrl?: string | null): Promise<Invitation | null> => {
    let finalSnapshotUrl = uploadedSnapshotUrl;
    // Auto-capture live card canvas snapshot if not explicitly provided
    if (!finalSnapshotUrl) {
      try {
        const snap = await generateSnapshot();
        finalSnapshotUrl = snap.uploadedUrl || snap.dataUrl || snapshotDataUrl;
      } catch (snapErr) {
        console.warn("[saveDesign] Auto-snapshot generation fallback:", snapErr);
        finalSnapshotUrl = snapshotDataUrl;
      }
    }

    const payload = constructPayload(finalSnapshotUrl);

    if (!payload.eventId) {
      console.error("Payload sent:", payload);
      setToast({
        message: "Please associate this design with an event before saving.",
        type: "error",
      });
      return null;
    }

    setIsSavingDraft(true);
    try {
      let saved: any = null;
      if (onSave) {
        saved = await onSave(payload);
      } else {
        if (payload.id) {
          const res = await API.put(`/invitations/${payload.id}`, payload);
          saved = res.data?.invitation;
        } else {
          const res = await API.post("/invitations", payload);
          saved = res.data?.invitation;
        }
      }

      if (saved) {
        // Non-destructive state merge: retain complete card artwork, templateId, decorations
        const mergedInvite: Invitation = {
          ...currentInvitation,
          ...payload,
          ...saved,
          templateId: payload.templateId || saved.templateId || currentInvitation?.templateId || designState.activeTemplateId,
          card: payload.card || (currentInvitation as any)?.card || designState.card,
          cardBg: payload.cardBg || currentInvitation?.cardBg || designState.cardBg,
          background: payload.background || currentInvitation?.background || designState.cardBg,
          decorations: payload.decorations || (currentInvitation as any)?.decorations || designState.decorations,
          textElements: payload.textElements || designState.textLayers,
        };
        setCurrentInvitation(mergedInvite);

        // Keep active canvas state intact so decorative layers stay mounted
        const activeTpl = payload.templateId || designState.activeTemplateId || designState.templateId || (typeof templateIdQuery === "string" ? templateIdQuery : null);
        setDesignState((prev) => ({
          ...prev,
          activeTemplateId: prev.activeTemplateId || activeTpl || prev.templateId || null,
          templateId: prev.templateId || activeTpl || prev.activeTemplateId || null,
          card: {
            ...(prev.card || {}),
            ...payload.card,
          },
          decorations: payload.decorations || prev.decorations || [],
        }));

        // Persist rich 4-layer state to local storage cache for instant recovery
        if (typeof window !== "undefined" && payload.eventId) {
          try {
            localStorage.setItem(
              `invitation_4layer_${payload.eventId}`,
              JSON.stringify({
                templateId: payload.templateId,
                templateName: payload.templateName,
                textElements: payload.textElements,
                card: payload.card,
                cardBg: payload.cardBg,
                background: payload.background,
                decorations: payload.decorations,
                envelope: payload.envelope,
                stageBackdrop: payload.stageBackdrop,
                effects: payload.effects,
                isLandscape: payload.isLandscape,
                containerDimensions: payload.containerDimensions,
                canvasPreset: payload.canvasPreset,
                aspectRatio: payload.aspectRatio,
                backside: payload.backside,
                designData: payload.designData,
              })
            );
          } catch (e) {}
        }
        return mergedInvite;
      }
      return null;
    } catch (error: any) {
      console.error("Payload sent:", payload);
      console.error("400 Response details:", error.response?.data);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Request failed";
      setToast({ message: errorMsg, type: "error" });
      return null;
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Helper: generate snapshot + save, then open dispatch modal — used from both nav and Next button
  const prepareAndOpenDispatch = async () => {
    if (isPreparingDispatch || isGeneratingSnapshot || isSavingDraft) return;
    setIsPreparingDispatch(true);
    try {
      // Always capture a fresh snapshot so the preview reflects the current canvas state
      const { dataUrl, uploadedUrl } = await generateSnapshot();
      // Save the design (with the snapshot URL) so the backend has the finalized state
      await saveDesign(uploadedUrl || dataUrl);
    } catch (_err) {
      // Non-blocking — still open modal even if save/snapshot failed
    } finally {
      setIsPreparingDispatch(false);
    }
    setCurrentStepIndex(3);
    setIsDispatchModalOpen(true);
  };

  // "Save & exit" button handler: commits current progress (text changes, template, element positions, details),
  // displays a success toast, and keeps user on / switches back to the Canvas Studio Design tab (step 0).
  const handleSaveAndExit = async () => {
    if (isSavingDraft || isGeneratingSnapshot) return;
    try {
      let saved: Invitation | null = null;
      if (currentStepIndex === 0) {
        const { dataUrl, uploadedUrl } = await generateSnapshot();
        saved = await saveDesign(uploadedUrl || dataUrl);
      } else {
        saved = await saveDesign();
      }

      if (saved) {
        // Adjust URL parameters to preserve active event, template ID, and invitation ID
        const activeEventId =
          saved.eventId ||
          currentEvent?.id ||
          initialEvent?.id ||
          propSelectedEventId ||
          (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("eventId") : null);

        const activeCardId = saved.id || currentInvitation?.id || initialInvitation?.id;
        const activeTplId = saved.templateId || designState.activeTemplateId || designState.templateId;

        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          if (activeEventId) {
            url.searchParams.set("eventId", activeEventId);
          }
          if (activeCardId) {
            url.searchParams.set("invitationId", activeCardId);
          }
          if (activeTplId) {
            url.searchParams.set("templateId", activeTplId);
          }
          if (activeEventId) {
            try {
              localStorage.setItem(
                `invitation_4layer_${activeEventId}`,
                JSON.stringify({
                  templateId: activeTplId,
                  templateName: (saved as any)?.templateName || designState.activeTemplateId,
                  textElements: designState.textLayers,
                  card: (saved as any)?.card || designState.card,
                  cardBg: (saved as any)?.cardBg || designState.cardBg,
                  background: (saved as any)?.background || designState.cardBg,
                  decorations: (saved as any)?.decorations || designState.decorations || (designState.card as any)?.decorations || [],
                  envelope: designState.envelope,
                  stageBackdrop: designState.stageBackdrop,
                  effects: designState.effects,
                  isLandscape: designState.isLandscape,
                  backside: designState.backside,
                })
              );
            } catch (e) {}
          }
          if (window.location.pathname !== "/dashboard/invitations") {
            router.push(`/dashboard/invitations?${url.searchParams.toString()}`);
          } else {
            window.history.replaceState({}, "", url.toString());
          }
        }

        setToast({
          message: "Changes saved successfully! ✨",
          type: "success",
        });
      }
    } catch (e) {
      console.error("Error saving draft in Save & exit:", e);
      setToast({
        message: "Failed to save changes. Please try again.",
        type: "error",
      });
    }
  };

  // Handle proceed next / send
  const handleProceedNext = async () => {
    if (isGeneratingSnapshot || isSavingDraft || isPreparingDispatch) return;

    // When on "Design" step (step 0): capture snapshot, save payload, and advance to "Details" (step 1)
    if (currentStepIndex === 0) {
      const { dataUrl, uploadedUrl } = await generateSnapshot();
      const saved = await saveDesign(uploadedUrl || dataUrl);
      if (saved) {
        setToast({ message: "Design saved! Advancing to details... ✨", type: "success" });
        setCurrentStepIndex(1);
      }
      return;
    }

    // When on "Details" step (step 1): save details and advance to step 2 ("Gifting")
    if (currentStepIndex === 1) {
      const saved = await saveDesign();
      if (saved) {
        setToast({ message: "Details saved! ✨", type: "success" });
        setCurrentStepIndex(2);
      }
      return;
    }

    // When on "Gifting" step (step 2): advance to step 3 ("Review")
    if (currentStepIndex === 2) {
      setCurrentStepIndex(3);
      return;
    }

    // When on "Review" step (step 3): open dispatch modal
    if (currentStepIndex === 3) {
      await prepareAndOpenDispatch();
      return;
    }
  };

  // Dispatch Invitation via Nodemailer inline CID
  const handleDispatchInvitations = async () => {
    const targetEventId =
      currentEvent?.id ||
      initialEvent?.id ||
      currentInvitation?.eventId ||
      (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("eventId") : null);

    if (!targetEventId && !currentInvitation?.id && !initialInvitation?.id) {
      setToast({ message: "Please associate this design with an event first.", type: "error" });
      return;
    }

    setIsSendingEmails(true);
    let payload: any = null;
    try {
      // 1. Prepare recipients
      const manualEmails = guestEmailsInput
        .split(/[\n,;]+/)
        .map((e) => e.trim())
        .filter((e) => e && e.includes("@"));

      const guestListRecipients = eventGuests
        .filter((g) => selectedGuestIds.includes(g.id))
        .map((g) => ({ email: g.email, guestId: g.id, name: g.name }));

      const allRecipients = [
        ...guestListRecipients,
        ...manualEmails.map((email) => ({ email, guestId: null, name: "" })),
      ];

      if (allRecipients.length === 0) {
        setToast({ message: "Please enter at least one recipient email address.", type: "error" });
        setIsSendingEmails(false);
        return;
      }

      // Ensure we have a fresh, high-resolution snapshot before dispatching
      let activeSnapshotDataUrl = snapshotDataUrl;
      let activeUploadedUrl: string | null = null;
      if (!activeSnapshotDataUrl) {
        const snap = await generateSnapshot();
        activeSnapshotDataUrl = snap.dataUrl;
        activeUploadedUrl = snap.uploadedUrl;
      }

      // Ensure invitation is saved before sending if id is missing
      let activeInvitationId = currentInvitation?.id || initialInvitation?.id;
      if (!activeInvitationId) {
        const saved = await saveDesign(activeUploadedUrl || activeSnapshotDataUrl);
        if (saved && saved.id) {
          activeInvitationId = saved.id;
        }
      }

      // 2. Prepare payload
      payload = {
        invitationId: activeInvitationId,
        eventId: targetEventId,
        templateId: templateIdQuery || designState.activeTemplateId || "custom",
        title:
          designState.textLayers.find((l) => l.id === "layer-title")?.text?.trim() ||
          designState.eventDetails.title?.trim() ||
          currentEvent?.title?.trim() ||
          initialEvent?.title?.trim() ||
          "Party Invitation",
        recipients: allRecipients,
        guestIds: selectedGuestIds,
        snapshot: activeSnapshotDataUrl,
        snapshotUrl: activeUploadedUrl || (activeSnapshotDataUrl?.startsWith("http") ? activeSnapshotDataUrl : undefined),
        cardImageBase64: activeSnapshotDataUrl?.startsWith("data:") ? activeSnapshotDataUrl : undefined,
        cardSnapshotUrl: activeUploadedUrl || activeSnapshotDataUrl,
        eventDetails: designState.eventDetails,
      };

      // 3. Dispatch to backend endpoint
      let response: any = null;
      if (activeInvitationId) {
        const res = await API.post(`/invitations/${activeInvitationId}/send`, payload);
        response = res.data;
      } else {
        const res = await API.post(`/invitations/send`, payload);
        response = res.data;
      }

      if (response && (response.success || response.recipientCount)) {
        setToast({
          message: `✨ Invitation sent to ${response.recipientCount || allRecipients.length} guest(s)!`,
          type: "success",
        });
        setIsDispatchModalOpen(false);
      } else {
        throw new Error(response?.error || response?.message || "Failed to dispatch email");
      }
    } catch (err: any) {
      console.error("Payload sent:", payload);
      console.error("400 Response details:", err.response?.data);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to send invitation emails. Please check server settings.";
      setToast({
        message: errorMsg,
        type: "error",
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0f172a] text-slate-100 font-sans select-none overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-16 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium ${toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200"
              : "bg-red-950/90 border-red-500/30 text-red-200"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* TOP BAR: Back, Undo/Redo, Progress Steps, Next Action                     */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TOP BAR: Back, Undo/Redo, Event Selector, WhatsApp, Send, Preview, Save  */}
      {/* ========================================================================= */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between z-30 shadow-xs text-slate-800 flex-shrink-0 gap-2 sm:gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {/* Left: < Back to browse, Undo, Redo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                router.push("/dashboard/invitations");
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0 active:scale-98"
            title="Back to browse templates"
          >
            <ChevronDown className="w-3.5 h-3.5 rotate-90 text-slate-600" />
            <span>Back to browse</span>
          </button>

          <div className="flex items-center gap-0.5 shrink-0 ml-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Centralized Workflow Navigation Tabs ("Design", "Details", "Gifting", "Review", "Add guests") */}
        <div className="hidden md:flex items-center justify-center shrink-0 px-1">
          <nav className="flex items-center gap-1 lg:gap-2 bg-slate-100/90 p-1 rounded-full border border-slate-200/90 shadow-2xs select-none">
            {WORKFLOW_TABS.map((tab, idx) => {
              const isActive = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    if (tab === "Add guests") {
                      setIsGuestSelectionModalOpen(true);
                    } else {
                      setCurrentStepIndex(idx);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : isCompleted
                      ? "text-slate-700 hover:text-slate-900 hover:bg-white/80"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? "bg-white text-slate-900"
                        : isCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </span>
                  <span>{tab}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions Controls (Event Selector, WhatsApp, Send, Preview, Premium Badge, Save, Next) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end">
          {/* Active Event dropdown selector */}
          {eventsList.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/90 hover:bg-slate-200/70 transition-colors px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs shrink-0">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="hidden xl:inline text-slate-500 font-semibold shrink-0">Event:</span>
              <select
                value={currentEvent?.id || propSelectedEventId || ""}
                onChange={(e) => handleEventChange(e.target.value)}
                className="bg-transparent font-bold focus:outline-none text-slate-800 cursor-pointer max-w-[90px] sm:max-w-[130px] truncate text-xs"
                title="Select active event"
              >
                <option value="">Select Event...</option>
                {eventsList.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Share via WhatsApp button (visible on large displays) */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            disabled={isSavingDraft || isGeneratingSnapshot}
            className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-xl active:scale-95 transition-all shadow-xs shadow-emerald-500/20 focus:outline-none disabled:opacity-50 cursor-pointer shrink-0"
            title="Share Published Invitation Page via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          {/* Send Invitations button (visible on large displays) */}
          <button
            type="button"
            onClick={prepareAndOpenDispatch}
            disabled={isGeneratingSnapshot || isSavingDraft || isPreparingDispatch}
            className="hidden 2xl:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl active:scale-95 transition-all shadow-xs shadow-blue-500/20 focus:outline-none disabled:opacity-50 cursor-pointer shrink-0"
            title="Distribute Invitations to Guests"
          >
            {isPreparingDispatch ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Preparing...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-white" />
                <span>Send ({selectedGuestIds.length})</span>
              </>
            )}
          </button>

          {/* Preview button */}
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0"
            title="Preview full screen"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Premium Badge */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#f8f1fc] text-[#6b21a8] border border-[#e9d5ff] font-bold text-xs shadow-2xs select-none shrink-0">
            <Crown className="w-3.5 h-3.5 fill-[#a855f7] text-[#a855f7]" />
            <span>Premium</span>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSaveAndExit}
            disabled={isGeneratingSnapshot || isSavingDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-2xs shrink-0"
            title="Save draft and persist changes"
          >
            {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save</span>
          </button>

          {/* Next button (Evite Olive Green) */}
          <button
            type="button"
            onClick={handleProceedNext}
            disabled={isGeneratingSnapshot || isSavingDraft || isPreparingDispatch}
            className="flex items-center gap-1 sm:gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-[#3e5622] hover:bg-[#32481b] text-white text-xs font-bold tracking-wide shadow-sm hover:shadow transition-all active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            <span>{currentStepIndex >= 3 ? "Send" : "Next"}</span>
            <span className="text-xs">→</span>
          </button>
        </div>
      </header>

      {/* Mobile/Tablet Guaranteed Top Workflow Steps Bar */}
      <div className="md:hidden w-full bg-slate-100/95 border-b border-slate-200 px-2 py-1.5 flex items-center justify-center overflow-x-auto [&::-webkit-scrollbar]:hidden shrink-0 z-25 shadow-2xs">
        <nav className="flex items-center gap-1 select-none min-w-max mx-auto">
          {WORKFLOW_TABS.map((tab, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  if (tab === "Add guests") {
                    setIsGuestSelectionModalOpen(true);
                  } else {
                    setCurrentStepIndex(idx);
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : isCompleted
                    ? "text-slate-700 bg-white/70"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isActive
                      ? "bg-white text-slate-900"
                      : isCompleted
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </span>
                <span>{tab}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* STEP 0: CANVAS STUDIO (CANVAS CONTROLS BAR + CANVAS WORKSPACE)            */}
      {/* ========================================================================= */}
      {currentStepIndex === 0 && (
        <>
          <div className="h-10 bg-white border-b border-slate-200/80 px-3 sm:px-4 flex items-center gap-2 sm:gap-3 z-20 flex-shrink-0 shadow-2xs overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {/* Aspect Ratio / Size Presets */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1.5 select-none">Size</span>
          {CANVAS_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p.id)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${canvasPreset === p.id
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              title={p.label}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5 select-none">Zoom</span>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={canvasZoom <= 50}
            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors text-sm font-bold cursor-pointer"
            title="Zoom Out"
          >
            −
          </button>
          <div className="min-w-[48px] h-6 flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50 text-[11px] font-bold text-slate-700 select-none px-1.5">
            {canvasZoom}%
          </div>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={canvasZoom >= 150}
            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors text-sm font-bold cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setCanvasZoom(100)}
            className={`ml-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${canvasZoom !== 100
              ? "text-indigo-600 hover:bg-indigo-50 border border-indigo-200"
              : "text-slate-400 border border-transparent"
              }`}
            title="Reset Zoom to 100%"
          >
            Reset
          </button>
        </div>

        {/* Fit / Fill toggle for image backgrounds */}
        {designState.cardBg?.type === "image" && (
          <>
            <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 select-none">Fit</span>
              <button
                type="button"
                onClick={() => setDesignState((prev) => ({ ...prev, cardImageFit: "contain" }))}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${(designState.cardImageFit || "contain") === "contain"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                title="Fit 1:1 without cropping"
              >
                Fit (1:1)
              </button>
              <button
                type="button"
                onClick={() => setDesignState((prev) => ({ ...prev, cardImageFit: "cover" }))}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${designState.cardImageFit === "cover"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                title="Fill entire card"
              >
                Fill (Cover)
              </button>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE: SIDEBAR & CENTER CANVAS/STAGE                             */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0">
        {/* ------------------------------------------------------------- */}
        {/* MULTI-TAB SIDEBAR (Left on desktop, Bottom dock on mobile)   */}
        {/* ------------------------------------------------------------- */}
        <div className="order-2 lg:order-1 flex flex-col-reverse lg:flex-row h-auto lg:h-full z-20 shadow-xl flex-shrink-0 bg-white border-t lg:border-t-0 lg:border-r border-slate-200/90 text-slate-800">
          {/* Icon Strip (Bottom bar on mobile, Left column on desktop) */}
          <div className="w-full lg:w-[76px] h-14 lg:h-full bg-white border-t lg:border-t-0 lg:border-r border-slate-200/70 flex flex-row lg:flex-col items-center justify-around lg:justify-start py-1 lg:py-4 gap-1 lg:gap-3 flex-shrink-0">
            {/* 1. Text Tab */}
            <button
              type="button"
              onClick={() => {
                if (activeTab === "text" && mobileToolsOpen) {
                  setMobileToolsOpen(false);
                } else {
                  setActiveTab("text");
                  setMobileToolsOpen(true);
                }
              }}
              className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 lg:gap-1 transition-all cursor-pointer ${activeTab === "text"
                ? "bg-slate-100 text-slate-950 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
            >
              <span className="text-base lg:text-lg font-bold font-serif leading-none">T</span>
              <span className="text-[10px] tracking-tight">Text</span>
            </button>

            {/* 2. Backgrounds Tab */}
            <button
              type="button"
              onClick={() => {
                if (activeTab === "backgrounds" && mobileToolsOpen) {
                  setMobileToolsOpen(false);
                } else {
                  setActiveTab("backgrounds");
                  setMobileToolsOpen(true);
                }
              }}
              className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 lg:gap-1 transition-all cursor-pointer ${activeTab === "backgrounds"
                ? "bg-slate-100 text-slate-950 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="20" x2="20" y2="4" />
                <line x1="8" y1="20" x2="20" y2="8" />
                <line x1="14" y1="20" x2="20" y2="14" />
                <line x1="4" y1="14" x2="14" y2="4" />
              </svg>
              <span className="text-[10px] tracking-tight">Backgrounds</span>
            </button>

            {/* 3. Effects Tab */}
            <button
              type="button"
              onClick={() => {
                if (activeTab === "effects" && mobileToolsOpen) {
                  setMobileToolsOpen(false);
                } else {
                  setActiveTab("effects");
                  setMobileToolsOpen(true);
                }
              }}
              className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 lg:gap-1 transition-all cursor-pointer ${activeTab === "effects"
                ? "bg-slate-100 text-slate-950 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
            >
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 stroke-[1.8]" />
              <span className="text-[10px] tracking-tight">Effects</span>
            </button>

            {/* 4. Envelope Tab */}
            <button
              type="button"
              onClick={() => {
                if (activeTab === "envelope" && mobileToolsOpen) {
                  setMobileToolsOpen(false);
                } else {
                  setActiveTab("envelope");
                  setMobileToolsOpen(true);
                }
              }}
              className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 lg:gap-1 transition-all cursor-pointer ${activeTab === "envelope"
                ? "bg-slate-100 text-slate-950 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
            >
              <Mail className="w-4 h-4 lg:w-5 lg:h-5 stroke-[1.8]" />
              <span className="text-[10px] tracking-tight">Envelope</span>
            </button>

            {/* 5. Backside Tab */}
            <button
              type="button"
              onClick={() => {
                if (activeTab === "backside" && mobileToolsOpen) {
                  setMobileToolsOpen(false);
                } else {
                  setActiveTab("backside");
                  setMobileToolsOpen(true);
                }
              }}
              className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 lg:gap-1 transition-all cursor-pointer ${activeTab === "backside"
                ? "bg-slate-100 text-slate-950 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
            >
              <CopyPlus className="w-4 h-4 lg:w-5 lg:h-5 stroke-[1.8]" />
              <span className="text-[10px] tracking-tight">Backside</span>
            </button>
          </div>

          {/* Sub-Panel Content Area (Drawer on mobile/tablet, Sidebar on desktop) */}
          <div className={`${mobileToolsOpen ? "flex" : "hidden"} lg:flex w-full lg:w-80 lg:md:w-88 max-h-[48vh] lg:max-h-none h-auto lg:h-full overflow-y-auto p-4 sm:p-5 space-y-6 flex-col text-slate-700 bg-white border-b lg:border-b-0 border-slate-200 custom-scrollbar`}>
            {/* Mobile close bar */}
            <div className="flex lg:hidden items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {activeTab} Settings
              </span>
              <button
                type="button"
                onClick={() => setMobileToolsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* -------------------- TAB 1: TEXT -------------------- */}
            {activeTab === "text" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header with Clear Button */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                      Text Editor
                    </span>
                    <button
                      type="button"
                      onClick={() => updateActiveLayer({ text: "" })}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Active Layer Quick Switcher Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {designState.textLayers.map((l) => {
                      const isSelected = activeLayer?.id === l.id;
                      const label =
                        l.id === "layer-title"
                          ? "Title"
                          : l.id === "layer-datetime"
                            ? "Date & Time"
                            : l.id === "layer-venue"
                              ? "Venue"
                              : l.id === "layer-description"
                                ? "Description"
                                : l.id === "layer-host"
                                  ? "Host"
                                  : l.text?.slice(0, 12) || "Layer";
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => handleSelectLayer(l.id)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${isSelected
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Textarea */}
                  <textarea
                    rows={3}
                    value={activeLayer?.text || ""}
                    onChange={(e) => updateActiveLayer({ text: e.target.value })}
                    placeholder="Enter card text here..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all resize-none shadow-2xs"
                  />
                </div>

                {/* Typography Font Family Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2">
                    Typography
                  </label>
                  <div className="relative">
                    <select
                      value={activeLayer?.fontFamily}
                      onChange={(e) => {
                        const opt = TYPOGRAPHY_OPTIONS.find((t) => t.value === e.target.value);
                        updateActiveLayer({
                          fontFamily: e.target.value,
                          fontWeight: opt?.weight || "700",
                        });
                      }}
                      className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-400 shadow-2xs cursor-pointer"
                    >
                      {TYPOGRAPHY_OPTIONS.map((f) => (
                        <option key={f.name} value={f.value}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Type Size & Type Color Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Type Size */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2">
                      Type Size
                    </label>
                    <div className="relative">
                      <select
                        value={activeLayer?.fontSize || 42}
                        onChange={(e) => updateActiveLayer({ fontSize: Number(e.target.value) })}
                        className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none shadow-2xs cursor-pointer"
                      >
                        {[12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 84, 96, 118].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Type Color */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2">
                      Type Color
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: activeLayer?.color || "#51afff" }}
                        />
                        <span className="text-xs font-mono font-medium text-slate-700 uppercase truncate">
                          {activeLayer?.color || "#51afff"}
                        </span>
                      </div>
                      {/* Color Wheel Trigger */}
                      <label className="w-9 h-9 rounded-full relative overflow-hidden flex items-center justify-center cursor-pointer border border-slate-200 shadow-xs hover:scale-105 transition-transform flex-shrink-0">
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "conic-gradient(from 90deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0000ff, #8800ff, #ff00ff, #ff0000)",
                          }}
                        />
                        <input
                          type="color"
                          value={activeLayer?.color || "#51afff"}
                          onChange={(e) => updateActiveLayer({ color: e.target.value })}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center relative z-10 shadow-xs">
                          <Pipette className="w-2.5 h-2.5 text-slate-700" />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Letter Casing & Text Alignment Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Letter Casing */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2">
                      Letter Casing
                    </label>
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateActiveLayer({ casing: "uppercase" })}
                        className={`flex-1 py-2 text-xs font-bold transition-colors cursor-pointer ${activeLayer?.casing === "uppercase"
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        A
                      </button>
                      <div className="w-px h-6 bg-slate-200" />
                      <button
                        type="button"
                        onClick={() => updateActiveLayer({ casing: "lowercase" })}
                        className={`flex-1 py-2 text-xs font-bold transition-colors cursor-pointer ${activeLayer?.casing === "lowercase"
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        a
                      </button>
                      <div className="w-px h-6 bg-slate-200" />
                      <button
                        type="button"
                        onClick={() => updateActiveLayer({ casing: "capitalize" })}
                        className={`flex-1 py-2 text-xs font-bold transition-colors cursor-pointer ${activeLayer?.casing === "capitalize"
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        Aa
                      </button>
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2">
                      Text Alignment
                    </label>
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateActiveLayer({ align: "left" })}
                        className={`flex-1 py-2 flex items-center justify-center transition-colors cursor-pointer ${activeLayer?.align === "left"
                          ? "bg-[#d9f99d] text-slate-900"
                          : "text-slate-700 hover:bg-slate-50"
                          }`}
                        title="Align Left"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <div className="w-px h-6 bg-slate-200" />
                      <button
                        type="button"
                        onClick={() => updateActiveLayer({ align: "center" })}
                        className={`flex-1 py-2 flex items-center justify-center transition-colors cursor-pointer ${activeLayer?.align === "center"
                          ? "bg-[#d9f99d] text-slate-900"
                          : "text-slate-700 hover:bg-slate-50"
                          }`}
                        title="Align Center"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <div className="w-px h-6 bg-slate-200" />
                      <button
                        type="button"
                        onClick={() => updateActiveLayer({ align: "right" })}
                        className={`flex-1 py-2 flex items-center justify-center transition-colors cursor-pointer ${activeLayer?.align === "right"
                          ? "bg-[#d9f99d] text-slate-900"
                          : "text-slate-700 hover:bg-slate-50"
                          }`}
                        title="Align Right"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Letter Spacing & Line Height Sliders */}
                <div className="space-y-4 pt-1">
                  <div>
                    <div className="flex justify-between items-center text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">
                      <span>Letter Spacing</span>
                      <span className="text-slate-700 font-mono font-medium">{activeLayer?.letterSpacing || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min={-2}
                      max={12}
                      step={0.5}
                      value={activeLayer?.letterSpacing || 0}
                      onChange={(e) => updateActiveLayer({ letterSpacing: Number(e.target.value) })}
                      className="w-full accent-slate-900 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">
                      <span>Line Height</span>
                      <span className="text-slate-700 font-mono font-medium">
                        {(activeLayer?.lineHeight || 1.2).toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.8}
                      max={2.2}
                      step={0.1}
                      value={activeLayer?.lineHeight || 1.2}
                      onChange={(e) => updateActiveLayer({ lineHeight: Number(e.target.value) })}
                      className="w-full accent-slate-900 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Action Buttons: Add Text Box & Delete */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleAddTextBox}
                    className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-800 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add text box</span>
                  </button>

                  {designState.textLayers.length > 1 && (
                    <button
                      type="button"
                      onClick={handleDeleteActiveLayer}
                      className="w-full py-2 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete this text box</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* -------------------- TAB 2: BACKGROUNDS -------------------- */}
            {activeTab === "backgrounds" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Interactive Photo Slot Manager (for templates with a photo frame) */}
                {designState.photoSlot && (
                  <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <span>📸</span>
                        <span>Photo Placeholder</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 uppercase tracking-wider">
                        Editable Slot
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed mb-3">
                      This template includes an interactive circular photo slot. Click below or directly click the photo frame on the canvas to upload your baby photo.
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => photoInputRef.current?.click()}
                        className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 bg-white flex-shrink-0 cursor-pointer shadow-xs hover:border-amber-500 transition-colors relative group"
                        title="Click to change photo"
                      >
                        {designState.photoSlot.imageUrl ? (
                          <img
                            src={designState.photoSlot.imageUrl}
                            alt="Photo preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-600 bg-amber-100">
                            <Upload className="w-4 h-4" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Upload className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Replace Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextState: StudioDesignState = {
                              ...designState,
                              photoSlot: designState.photoSlot
                                ? {
                                  ...designState.photoSlot,
                                  imageUrl: "/assets/templates/pooh-baby-photo-placeholder.svg",
                                }
                                : null,
                            };
                            setDesignState(nextState);
                            pushStateToHistory(nextState);
                          }}
                          className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline transition-colors"
                        >
                          Reset to placeholder
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Background Upload Area */}
                <div>
                  <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2.5">
                    Custom Background
                  </span>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 flex items-center gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800">Upload your own</p>
                      <p className="text-[11px] text-slate-500">Use any image as your background</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </div>
                </div>

                {/* Evite Ambient Workspace Backdrops */}
                <div>
                  <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2.5">
                    Ambient Workspace Backdrop
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_STAGE_BACKDROPS.map((stageBg) => {
                      const isSelected = designState.stageBackdrop.value === stageBg.style;
                      return (
                        <button
                          key={stageBg.id}
                          type="button"
                          onClick={() => {
                            pushStateToHistory({
                              ...designState,
                              stageBackdrop: {
                                type: "pattern",
                                value: stageBg.style,
                              },
                              canvasWorkspaceBg: stageBg.style,
                              backdropBackground: stageBg.style,
                            } as any);
                          }}
                          className={`group aspect-[4/3] rounded-xl relative overflow-hidden border transition-all cursor-pointer shadow-2xs ${
                            isSelected
                              ? "ring-2 ring-slate-900 ring-offset-2 border-transparent"
                              : "border-slate-200/80 hover:scale-102 hover:shadow-xs"
                          }`}
                          style={{
                            background: stageBg.style.startsWith("/")
                              ? `url(${stageBg.style}) center/cover no-repeat`
                              : stageBg.style,
                          }}
                          title={stageBg.label}
                        >
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-sm">{stageBg.icon}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute bottom-1 right-1 w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Colors Picker Input */}
                <div>
                  <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2">
                    Backdrop Color
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 flex-shrink-0"
                        style={{
                          background: designState.stageBackdrop.value || "#0f172a",
                          backgroundColor: designState.stageBackdrop.value?.includes("gradient")
                            ? undefined
                            : designState.stageBackdrop.value || "#0f172a",
                        }}
                      />
                      <span className="text-xs font-mono font-semibold text-slate-700 uppercase truncate">
                        {designState.stageBackdrop.value?.includes("gradient")
                          ? "Preset Gradient"
                          : designState.stageBackdrop.value || "#0f172a"}
                      </span>
                    </div>
                    {/* Rainbow color wheel */}
                    <label className="w-10 h-10 rounded-full relative overflow-hidden flex items-center justify-center cursor-pointer border border-slate-200 shadow-xs hover:scale-105 transition-transform flex-shrink-0">
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "conic-gradient(from 90deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0000ff, #8800ff, #ff00ff, #ff0000)",
                        }}
                      />
                      <input
                        type="color"
                        value={
                          designState.stageBackdrop.value?.startsWith("#")
                            ? designState.stageBackdrop.value
                            : "#0f172a"
                        }
                        onChange={(e) =>
                          pushStateToHistory({
                            ...designState,
                            stageBackdrop: {
                              type: "color",
                              value: e.target.value,
                              gradient: undefined,
                            },
                            canvasWorkspaceBg: e.target.value,
                            backdropBackground: e.target.value,
                          } as any)
                        }
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center relative z-10 shadow-xs">
                        <Pipette className="w-3 h-3 text-slate-700" />
                      </div>
                    </label>
                  </div>
                </div>

                {/* 3-Column Scrollable Grid of Background Presets */}
                <div>
                  <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-3">
                    Backdrop Presets
                  </span>
                  <div className="grid grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {PRESET_BACKGROUNDS.map((bg) => {
                      const isSelected =
                        designState.stageBackdrop.value === bg.style ||
                        designState.stageBackdrop.gradient === bg.style;
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() =>
                            pushStateToHistory({
                              ...designState,
                              stageBackdrop: {
                                type: "pattern",
                                value: bg.style,
                                gradient: bg.style,
                              },
                              canvasWorkspaceBg: bg.style,
                              backdropBackground: bg.style,
                            } as any)
                          }
                          className={`group aspect-[4/5] rounded-xl relative overflow-hidden border transition-all cursor-pointer ${isSelected
                            ? "ring-2 ring-slate-900 ring-offset-2 border-transparent"
                            : "border-slate-200/80 hover:scale-102 hover:shadow-xs"
                            }`}
                          style={{ background: bg.style }}
                          title={bg.label}
                        >
                          <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-base drop-shadow-sm">{bg.icon}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute bottom-1 right-1 w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- TAB 3: ENVELOPE -------------------- */}
            {activeTab === "envelope" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Sub-tabs: Colors, Liners, Stamps, Stickers */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                  {(["colors", "liners", "stamps", "stickers"] as const).map((sub) => {
                    const isActive = envelopeSubTab === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setEnvelopeSubTab(sub)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${isActive
                          ? "bg-white text-slate-900 shadow-xs font-bold"
                          : "text-slate-500 hover:text-slate-800"
                          }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-Tab 1: Envelope Flap Colors */}
                {envelopeSubTab === "colors" && (
                  <div>
                    <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-3">
                      Envelope Flap Colors
                    </span>
                    <div className="grid grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                      {ENVELOPE_COLORS.map((env) => {
                        const isSelected = designState.envelope.color === env.hex;
                        return (
                          <button
                            key={env.id}
                            type="button"
                            onClick={() =>
                              pushStateToHistory({
                                ...designState,
                                envelope: { ...designState.envelope, color: env.hex },
                              })
                            }
                            className={`group aspect-[5/3.5] rounded-xl relative overflow-hidden border transition-all cursor-pointer shadow-2xs ${isSelected
                              ? "ring-2 ring-slate-900 ring-offset-2 border-transparent"
                              : "border-slate-200/80 hover:scale-102 hover:shadow-xs"
                              }`}
                            style={{ background: env.hex }}
                            title={env.name}
                          >
                            {/* Realistic Envelope Flap SVG Silhouette */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 100 70">
                              <polygon points="0,0 100,0 50,42" fill="none" stroke="#000" strokeWidth="2" />
                            </svg>
                            {isSelected && (
                              <div className="absolute bottom-1 right-1 w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 2: Liners */}
                {envelopeSubTab === "liners" && (
                  <div>
                    <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-3">
                      Interior Liner Patterns
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {ENVELOPE_LINERS.map((liner) => {
                        const isSelected = designState.envelope.liner === liner.id;
                        return (
                          <button
                            key={liner.id}
                            type="button"
                            onClick={() =>
                              pushStateToHistory({
                                ...designState,
                                envelope: { ...designState.envelope, liner: liner.id },
                              })
                            }
                            className={`p-2.5 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${isSelected
                              ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                              : "border-slate-200 hover:border-slate-300"
                              }`}
                          >
                            <div
                              className="w-full h-12 rounded-lg border border-black/10 shadow-inner"
                              style={{ background: liner.style }}
                            />
                            <span className="text-xs font-semibold text-slate-800 truncate">{liner.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 3: Stamps */}
                {envelopeSubTab === "stamps" && (
                  <div>
                    <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-3">
                      Envelope Postal Stamps
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {STAMPS.map((stamp) => {
                        const isSelected = designState.envelope.stamp === stamp.id;
                        return (
                          <button
                            key={stamp.id}
                            type="button"
                            onClick={() =>
                              pushStateToHistory({
                                ...designState,
                                envelope: {
                                  ...designState.envelope,
                                  stamp: isSelected ? null : stamp.id,
                                },
                              })
                            }
                            className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${isSelected
                              ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                              : "border-slate-200 hover:border-slate-300"
                              }`}
                          >
                            <span className="text-2xl">{stamp.emoji}</span>
                            <span className="text-xs font-semibold text-slate-800">{stamp.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 4: Stickers */}
                {envelopeSubTab === "stickers" && (
                  <div>
                    <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-3">
                      Flap Seals & Stickers
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {STICKERS.map((sticker) => {
                        const isSelected = designState.envelope.sticker === sticker.id;
                        return (
                          <button
                            key={sticker.id}
                            type="button"
                            onClick={() =>
                              pushStateToHistory({
                                ...designState,
                                envelope: {
                                  ...designState.envelope,
                                  sticker: isSelected ? null : sticker.id,
                                },
                              })
                            }
                            className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${isSelected
                              ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                              : "border-slate-200 hover:border-slate-300"
                              }`}
                          >
                            <span className="text-2xl">{sticker.emoji}</span>
                            <span className="text-xs font-semibold text-slate-800">{sticker.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------- TAB 4: EFFECTS -------------------- */}
            {activeTab === "effects" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Metallic Foil Stamps */}
                <div>
                  <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-3">
                    Metallic Foil Stamp
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: null, label: "None" },
                      { id: "gold", label: "Gold Foil", class: "foil-gold" },
                      { id: "rose-gold", label: "Rose Gold", class: "foil-rose-gold" },
                      { id: "silver", label: "Silver Foil", class: "foil-silver" },
                    ].map((foil) => {
                      const isSelected = designState.effects.foil === foil.id;
                      return (
                        <button
                          key={foil.label}
                          type="button"
                          onClick={() => {
                            pushStateToHistory({
                              ...designState,
                              effects: { ...designState.effects, foil: foil.id as any },
                            });
                          }}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isSelected
                            ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900 text-slate-950"
                            : "border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                        >
                          <span className={foil.class || ""}>{foil.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Card Surface Textures */}
                <div>
                  <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-3">
                    Card Paper Texture
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "matte", label: "Smooth Matte" },
                      { id: "cotton-press", label: "Cotton Press" },
                      { id: "linen", label: "Linen Weave" },
                      { id: "glossy", label: "Glossy Sheen" },
                    ].map((tex) => {
                      const isSelected = designState.effects.texture === tex.id;
                      return (
                        <button
                          key={tex.id}
                          type="button"
                          onClick={() =>
                            pushStateToHistory({
                              ...designState,
                              effects: { ...designState.effects, texture: tex.id as any },
                            })
                          }
                          className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${isSelected
                            ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900 text-slate-950 font-bold"
                            : "border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                        >
                          {tex.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Drop Shadow Toggles */}
                <div>
                  <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-3">
                    Card Elevation / Shadow
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "subtle", label: "Subtle" },
                      { id: "floating", label: "Floating 3D" },
                      { id: "deep", label: "Deep Luxury" },
                      { id: "none", label: "Flat" },
                    ].map((sh) => {
                      const isSelected = designState.effects.shadow === sh.id;
                      return (
                        <button
                          key={sh.id}
                          type="button"
                          onClick={() =>
                            pushStateToHistory({
                              ...designState,
                              effects: { ...designState.effects, shadow: sh.id as any },
                            })
                          }
                          className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${isSelected
                            ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900 text-slate-950 font-bold"
                            : "border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                        >
                          {sh.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- TAB 5: EVENT DETAILS -------------------- */}
            {activeTab === "details" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1">
                  Card Details & Location
                </span>

                {/* Event Title */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Event Title</label>
                  <input
                    type="text"
                    value={designState.eventDetails.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDesignState((prev) => ({
                        ...prev,
                        eventDetails: { ...prev.eventDetails, title: val },
                        textLayers: prev.textLayers.map((l) =>
                          l.id === "layer-title" ? { ...l, text: val.toUpperCase() } : l
                        ),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none"
                  />
                </div>

                {/* Host Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Host Name</label>
                  <input
                    type="text"
                    value={designState.eventDetails.host}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDesignState((prev) => ({
                        ...prev,
                        eventDetails: { ...prev.eventDetails, host: val },
                        textLayers: prev.textLayers.map((l) =>
                          l.id === "layer-host" ? { ...l, text: val } : l
                        ),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={designState.eventDetails.date}
                      onChange={(e) => {
                        const val = e.target.value;
                        const dateFormatted = val
                          ? new Date(val + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          }).toUpperCase()
                          : "";
                        const timeStr = designState.eventDetails.time ? ` AT ${designState.eventDetails.time}` : "";
                        const newDateText = dateFormatted ? `${dateFormatted}${timeStr}` : "";
                        setDesignState((prev) => ({
                          ...prev,
                          eventDetails: { ...prev.eventDetails, date: val },
                          textLayers: prev.textLayers.map((l) =>
                            l.id === "layer-datetime" && newDateText ? { ...l, text: newDateText } : l
                          ),
                        }));
                      }}
                      className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Time</label>
                    <input
                      type="time"
                      value={designState.eventDetails.time}
                      onChange={(e) => {
                        const val = e.target.value;
                        const dateFormatted = designState.eventDetails.date
                          ? new Date(designState.eventDetails.date + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          }).toUpperCase()
                          : "";
                        const newDateText = dateFormatted ? `${dateFormatted} AT ${val}` : val ? `AT ${val}` : "";
                        setDesignState((prev) => ({
                          ...prev,
                          eventDetails: { ...prev.eventDetails, time: val },
                          textLayers: prev.textLayers.map((l) =>
                            l.id === "layer-datetime" && newDateText ? { ...l, text: newDateText } : l
                          ),
                        }));
                      }}
                      className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none"
                    />
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Venue Name</label>
                  <input
                    type="text"
                    value={designState.eventDetails.venue}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDesignState((prev) => ({
                        ...prev,
                        eventDetails: { ...prev.eventDetails, venue: val },
                        textLayers: prev.textLayers.map((l) =>
                          l.id === "layer-venue" ? { ...l, text: val } : l
                        ),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description / Message</label>
                  <textarea
                    rows={2}
                    value={designState.eventDetails.description || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDesignState((prev) => ({
                        ...prev,
                        eventDetails: { ...prev.eventDetails, description: val },
                        textLayers: prev.textLayers.map((l) =>
                          l.id === "layer-description" ? { ...l, text: val } : l
                        ),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none resize-none"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Physical Address</label>
                  <textarea
                    rows={2}
                    value={designState.eventDetails.address}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDesignState((prev) => ({
                        ...prev,
                        eventDetails: { ...prev.eventDetails, address: val },
                      }));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* -------------------- TAB: BACKSIDE -------------------- */}
            {activeTab === "backside" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Card Backside
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Add a personal note or sign-off to the reverse side
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDesignState((prev) => ({
                        ...prev,
                        backside: {
                          enabled: !prev.backside?.enabled,
                          message: prev.backside?.message || "We can't wait to celebrate with you! Please join us for this special occasion.",
                          signOff: prev.backside?.signOff || prev.eventDetails?.host || "With love, The Host",
                          photoUrl: prev.backside?.photoUrl || null,
                        },
                      }));
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      designState.backside?.enabled ? "bg-slate-900" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        designState.backside?.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Flip Card Preview button */}
                <button
                  type="button"
                  onClick={() => setShowingBackside((prev) => !prev)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{showingBackside ? "View Front Side" : "Flip & View Backside"}</span>
                </button>

                {designState.backside?.enabled && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">
                        Backside Message / Note
                      </label>
                      <textarea
                        rows={3}
                        value={designState.backside?.message || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDesignState((prev) => ({
                            ...prev,
                            backside: {
                              enabled: true,
                              message: val,
                              signOff: prev.backside?.signOff || prev.eventDetails?.host || "With love, The Host",
                              photoUrl: prev.backside?.photoUrl || null,
                            },
                          }));
                        }}
                        placeholder="Write a message to appear on the back of your invitation..."
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 resize-none shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">
                        Sign-Off / Signature
                      </label>
                      <input
                        type="text"
                        value={designState.backside?.signOff || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDesignState((prev) => ({
                            ...prev,
                            backside: {
                              enabled: true,
                              message: prev.backside?.message || "",
                              signOff: val,
                              photoUrl: prev.backside?.photoUrl || null,
                            },
                          }));
                        }}
                        placeholder="e.g. With love, The Smiths"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 shadow-2xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CENTER CANVAS STAGE: Shared 4-Layer Evite Decoupled Engine     */}
        {/* ------------------------------------------------------------- */}
        <InvitationCanvasStage
          config={designState}
          readOnly={false}
          selectedTextId={designState.selectedTextId}
          onSelectLayer={(id) => {
            if (id) {
              handleSelectLayer(id);
              setActiveTab("text");
              setMobileToolsOpen(true);
            } else {
              setDesignState((prev) => ({ ...prev, selectedTextId: null }));
              setEditingTextId(null);
            }
          }}
          onUpdateLayer={(id, updates) => {
            setDesignState((prev) => ({
              ...prev,
              textLayers: prev.textLayers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
            }));
          }}
          editingTextId={editingTextId}
          setEditingTextId={setEditingTextId}
          stageRef={envelopeStageRef}
          cardRef={cardCanvasRef}
          zoom={canvasZoom}
          maxW={activePreset.maxW}
          aspectRatio={activePreset.aspect}
          onPhotoClick={() => photoInputRef.current?.click()}
          photoInputRef={photoInputRef}
          onBackdropClick={() => {
            setDesignState((prev) => ({ ...prev, selectedTextId: null }));
            setEditingTextId(null);
          }}
          onCardClick={() => {
            setEditingTextId(null);
          }}
          showingBackside={showingBackside}
          onFlipCard={() => setShowingBackside((prev) => !prev)}
          className="order-1 lg:order-2 flex-1 min-w-0 max-w-full overflow-hidden"
        />

        {/* Hidden file input for photo slot replacement */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSlotUpload}
        />
      </div>
    </>
  )}

  {/* ========================================================================= */}
  {/* STEP 1: DETAILS WORKFLOW SCREEN (LIVE PREVIEW PANE + DETAILS FORM)        */}
  {/* ========================================================================= */}
  {currentStepIndex === 1 && (
    <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative min-h-0">
      <div className="w-full md:w-[48%] lg:w-[46%] h-[400px] sm:h-[480px] md:h-full flex flex-col shrink-0">
        <InvitationWorkflowPreviewPane
          designState={designState}
          onRsvpClick={(status) => {
            setToast({ message: `RSVP preview selection: ${status.toUpperCase()}`, type: "success" });
          }}
        />
      </div>
      <div className="w-full md:w-[52%] lg:w-[54%] flex-1 md:h-full flex flex-col min-h-0">
        <InvitationWorkflowDetails
          title={designState.eventDetails.title}
          dateTime={designState.eventDetails.date}
          location={designState.eventDetails.venue || designState.eventDetails.address}
          hostNote={designState.eventDetails.description || ""}
          hostDetails={hostDetails}
          rsvpOptions={rsvpOptions}
          onUpdateField={handleDetailsFieldChange}
          onUpdateHostDetails={setHostDetails}
          onOpenRsvpOptions={() => setIsRsvpModalOpen(true)}
        />
      </div>
    </div>
  )}

  {/* ========================================================================= */}
  {/* STEP 2: GIFTING WORKFLOW SCREEN (LIVE PREVIEW PANE + GIFTING SECTIONS)    */}
  {/* ========================================================================= */}
  {currentStepIndex === 2 && (
    <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative min-h-0">
      <div className="w-full md:w-[48%] lg:w-[46%] h-[400px] sm:h-[480px] md:h-full flex flex-col shrink-0">
        <InvitationWorkflowPreviewPane
          designState={designState}
          onRsvpClick={(status) => {
            setToast({ message: `RSVP preview selection: ${status.toUpperCase()}`, type: "success" });
          }}
        />
      </div>
      <div className="w-full md:w-[52%] lg:w-[54%] flex-1 md:h-full flex flex-col min-h-0">
        <InvitationWorkflowGifting
          wishlists={wishlists}
          charities={charities}
          personalFunds={personalFunds}
          onAddWishlist={(item) => setWishlists((p) => [...p, item])}
          onRemoveWishlist={(id) => setWishlists((p) => p.filter((w) => w.id !== id))}
          onAddCharity={(item) => setCharities((p) => [...p, item])}
          onRemoveCharity={(id) => setCharities((p) => p.filter((c) => c.id !== id))}
          onAddPersonalFund={(item) => setPersonalFunds((p) => [...p, item])}
          onRemovePersonalFund={(id) => setPersonalFunds((p) => p.filter((f) => f.id !== id))}
        />
      </div>
    </div>
  )}

  {/* ========================================================================= */}
  {/* STEP 3: REVIEW WORKFLOW SCREEN (LIVE PREVIEW PANE + REVIEW SUMMARY)       */}
  {/* ========================================================================= */}
  {currentStepIndex === 3 && (
    <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative min-h-0">
      <div className="w-full md:w-[44%] lg:w-[42%] h-[400px] sm:h-[480px] md:h-full flex flex-col shrink-0">
        <InvitationWorkflowPreviewPane
          designState={designState}
          onRsvpClick={(status) => {
            setToast({ message: `RSVP preview selection: ${status.toUpperCase()}`, type: "success" });
          }}
        />
      </div>
      <div className="w-full md:w-[56%] lg:w-[58%] flex-1 md:h-full flex flex-col min-h-0">
        <InvitationWorkflowReview
          designState={designState}
          rsvpOptions={rsvpOptions}
          hostDetails={hostDetails}
          wishlists={wishlists}
          charities={charities}
          personalFunds={personalFunds}
          selectedGuestCount={selectedGuestIds.length}
          totalGuestCount={eventGuests.length}
          onSendInvitations={prepareAndOpenDispatch}
          onShareWhatsApp={handleWhatsAppShare}
          onJumpToStep={(idx) => setCurrentStepIndex(idx)}
        />
      </div>
    </div>
  )}

      {/* ========================================================================= */}
      {/* EMAIL SNAPSHOT & DISPATCH MODAL                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDispatchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-base font-bold">Send Invitations</h3>
                    <p className="text-xs text-slate-300">
                      Dispatches high-resolution card via Nodemailer with inline CID preview
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Snapshot Image Preview */}
                {snapshotDataUrl && (
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Rendered Card Snapshot
                    </span>
                    <div className="bg-slate-100 rounded-xl p-3 flex justify-center border border-slate-200">
                      <img
                        src={snapshotDataUrl}
                        alt="Rendered Invitation"
                        className="max-h-48 rounded-lg shadow-md object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Event Summary Details */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                  <p className="font-bold text-slate-900 text-sm">{designState.eventDetails.title}</p>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{designState.eventDetails.date} at {designState.eventDetails.time}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="truncate">{designState.eventDetails.venue}</span>
                    </p>
                  </div>
                </div>

                {/* Guest List Selection & Group Filtering */}
                <div>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      Event Guests ({selectedGuestIds.length}/{eventGuests.length} selected)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsGuestSelectionModalOpen(true)}
                        className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 py-1 px-2.5 rounded-lg flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                        title="Import or filter guests by guest groups (Family, Friends, VIP, etc.)"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Select from Contacts/Groups</span>
                      </button>

                      {eventGuests.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedGuestIds.length === eventGuests.length) setSelectedGuestIds([]);
                            else setSelectedGuestIds(eventGuests.map((g) => g.id));
                          }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                          {selectedGuestIds.length === eventGuests.length ? "Deselect All" : "Select All"}
                        </button>
                      )}
                    </div>
                  </div>

                  {eventGuests.length > 0 ? (
                    <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                      {eventGuests.map((guest) => {
                        const isChecked = selectedGuestIds.includes(guest.id);
                        return (
                          <label
                            key={guest.id || guest.email}
                            className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer"
                          >
                            <div className="truncate">
                              <span className="font-medium text-slate-800">{guest.name || guest.email}</span>
                              {Array.isArray(guest.groups) && guest.groups.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap mt-0.5">
                                  {guest.groups.map((grp: string) => (
                                    <span key={grp} className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                      {grp}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedGuestIds((prev) => [...prev, guest.id]);
                                else setSelectedGuestIds((prev) => prev.filter((id) => id !== guest.id));
                              }}
                              className="rounded accent-indigo-600 ml-2"
                            />
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/60 text-center flex flex-col items-center gap-1.5">
                      <p className="text-xs text-slate-600 font-medium">No guests added to this event yet.</p>
                      <button
                        type="button"
                        onClick={() => setIsGuestSelectionModalOpen(true)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        + Add guests from contacts or groups
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional / Direct Guest Emails */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Additional Recipient Emails
                  </label>
                  <textarea
                    rows={3}
                    value={guestEmailsInput}
                    onChange={(e) => setGuestEmailsInput(e.target.value)}
                    placeholder="sarah@example.com, alex@example.com..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Separate multiple emails with commas or line breaks.</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispatchInvitations}
                  disabled={isSendingEmails}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSendingEmails ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Invitations...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Invitations</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guest Selection & Group Filtering Modal */}
      <GuestSelectionModal
        isOpen={isGuestSelectionModalOpen}
        onClose={() => setIsGuestSelectionModalOpen(false)}
        currentEventId={currentEvent?.id || initialEvent?.id}
        currentGuests={eventGuests}
        initiallySelectedGuestIds={selectedGuestIds}
        onApply={handleApplyGuestSelection}
      />

      {/* RSVP Options Modal */}
      <RsvpOptionsModal
        isOpen={isRsvpModalOpen}
        onClose={() => setIsRsvpModalOpen(false)}
        options={rsvpOptions}
        onSave={(newOpts) => {
          setRsvpOptions(newOpts);
          setToast({ message: "RSVP settings updated! ✨", type: "success" });
        }}
      />

      {/* ========================================================================= */}
      {/* FULL-SCREEN LIVE PREVIEW MODAL                                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isPreviewModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setIsPreviewModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full max-h-[94vh] bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Full-Screen Card Preview</h3>
                  <span className="hidden sm:inline text-xs text-slate-400 font-medium ml-2 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {activePreset.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-slate-950 min-h-[500px]">
                <div className="w-full flex items-center justify-center py-2">
                  <div
                    className="w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 flex items-center justify-center transition-all"
                    style={{ maxWidth: `${Math.min(Math.max(activePreset.maxW + 40, 520), 680)}px` }}
                  >
                    <InvitationCanvasStage
                      config={{
                        ...designState,
                        selectedTextId: null,
                      }}
                      zoom={Math.min(canvasZoom, 100)}
                      maxW={activePreset.maxW}
                      aspectRatio={activePreset.aspect}
                      readOnly={true}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share via WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewModalOpen(false);
                      prepareAndOpenDispatch();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Guests ({selectedGuestIds.length})</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
