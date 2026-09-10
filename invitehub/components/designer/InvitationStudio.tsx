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
} from "lucide-react";
import { Event } from "../../services/eventService";
import API from "../../services/api";
import { Invitation } from "../../types/invitationTypes";
import guestService from "../../services/guestService";
import templateService from "../../services/templateService";
import { NEW_TEMPLATES, NEW_TEMPLATES_CONFIG, getTemplateConfig, NewTemplateData, PhotoSlot } from "../../lib/newTemplatesData";
import GuestSelectionModal from "./GuestSelectionModal";

// --- Types & Interfaces ---

export interface TextLayer {
  id: string;
  text: string;
  x: number; // percentage: 0 to 100
  y: number; // percentage: 0 to 100
  fontSize: number; // px
  fontFamily: string;
  color: string;
  casing: "uppercase" | "lowercase" | "capitalize" | "none";
  align: "left" | "center" | "right";
  letterSpacing: number; // px
  lineHeight: number; // multiplier e.g. 1.2
  fontWeight: string;
  isFoil?: "gold" | "rose-gold" | "silver" | null;
}

export interface StudioDesignState {
  activeTemplateId: string | null;
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
  };
  envelope: {
    color: string;
    liner: string;
    stamp: string | null;
    sticker: string | null;
  };
  effects: {
    foil: "gold" | "rose-gold" | "silver" | null;
    texture: "matte" | "cotton-press" | "linen" | "glossy";
    shadow: "subtle" | "floating" | "deep" | "none";
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
  templateIdQuery?: string | null;
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
  templateIdQuery,
  onSave,
  onBack,
}: InvitationStudioProps) {
  const router = useRouter();

  // --- Template State Builder ---
  const createDesignStateFromTemplate = (
    tplId: string | null | undefined,
    evt: Event | null,
    invite: Invitation | null
  ): StudioDesignState => {
    const tplConfig = getTemplateConfig(tplId);

    const isDark =
      tplConfig?.textColor === "#FFFFFF" ||
      tplConfig?.textColor?.toLowerCase() === "#f8fafc" ||
      tplConfig?.backgroundColor?.toLowerCase() === "#0a0b10" ||
      tplConfig?.backgroundColor?.toLowerCase() === "#14131a" ||
      tplConfig?.id === "tpl-electric-outline" ||
      tplConfig?.id === "tpl-hype-night";

    const titleText =
      tplConfig?.title ||
      invite?.eventTitle ||
      invite?.title ||
      evt?.title ||
      "IT'S AVERY'S BIRTHDAY!";

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
    const titleWeight = tplConfig?.fontWeight || invite?.fontWeight || "800";
    const titleAlign = (tplConfig?.textAlignment as any) || (invite?.textAlignment as any) || "center";

    // Resolve Card Background
    let cardBgType: "color" | "gradient" | "image" | "preset" = "color";
    let cardBgValue = "#faf8f5";

    if (tplConfig?.decorationImage && typeof tplConfig.decorationImage === "string") {
      cardBgType = "image";
      cardBgValue = tplConfig.decorationImage;
    } else if (tplConfig?.image && typeof tplConfig.image === "string" && !tplConfig.image.startsWith("#")) {
      cardBgType = "image";
      cardBgValue = tplConfig.image;
    } else if (tplConfig?.gradient && typeof tplConfig.gradient === "string") {
      cardBgType = "gradient";
      cardBgValue = tplConfig.gradient;
    } else if (tplConfig?.backgroundColor && typeof tplConfig.backgroundColor === "string") {
      cardBgType = "color";
      cardBgValue = tplConfig.backgroundColor;
    } else if (invite?.imageUrl && typeof invite.imageUrl === "string" && !invite.imageUrl.startsWith("#") && !invite.imageUrl.includes("snapshot")) {
      cardBgType = "image";
      cardBgValue = invite.imageUrl;
    } else if (invite?.backgroundColor?.includes("gradient")) {
      cardBgType = "gradient";
      cardBgValue = invite.backgroundColor;
    } else if (invite?.backgroundColor) {
      cardBgType = "color";
      cardBgValue = invite.backgroundColor;
    }

    // Resolve Text Layers: Use structured layout data from template schema if defined
    let resolvedTextLayers: TextLayer[] = [];
    if (tplConfig?.textLayers && tplConfig.textLayers.length > 0) {
      resolvedTextLayers = tplConfig.textLayers.map((tl) => ({
        id: tl.id,
        text: tl.text,
        x: tl.x,
        y: tl.y,
        fontSize: tl.fontSize,
        fontFamily: tl.fontFamily,
        color: tl.color,
        casing: tl.casing,
        align: tl.align,
        letterSpacing: tl.letterSpacing,
        lineHeight: tl.lineHeight,
        fontWeight: tl.fontWeight,
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
          color: isDark ? "rgba(255, 255, 255, 0.65)" : "#94a3b8",
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

    return {
      activeTemplateId: tplConfig?.id || tplId || null,
      isLandscape: !!tplConfig?.isLandscape,
      photoSlot: tplConfig?.photoSlot ? { ...tplConfig.photoSlot } : null,
      textLayers: resolvedTextLayers,
      selectedTextId: defaultSelectedId,
      cardBg: {
        type: cardBgType,
        value: cardBgValue,
      },
      stageBackdrop: {
        type: "color",
        value: "#253b75",
      },
      envelope: {
        color: tplConfig?.envelopeColor || invite?.accentColor || "#781d60",
        liner: tplConfig?.envelopeLiner || "gold-foil",
        stamp: "wax",
        sticker: null,
      },
      effects: {
        foil: null,
        texture: tplConfig?.isLandscape ? "matte" : "cotton-press",
        shadow: "floating",
      },
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
    const effectiveTemplateId =
      templateIdQuery ||
      initialInvitation?.templateId ||
      initialEvent?.selectedTemplateId ||
      (typeof window !== "undefined"
        ? sessionStorage.getItem("pending_template_id") || localStorage.getItem("pending_template_id")
        : null);

    const baseState = createDesignStateFromTemplate(effectiveTemplateId, initialEvent, initialInvitation);

    // If the user came from "Upload Existing", override the card background with the
    // uploaded image URL — this has highest priority over any template background.
    if (typeof window !== "undefined") {
      const pendingUpload = sessionStorage.getItem("pending_upload_invite") ||
        (initialInvitation?.imageUrl && !initialInvitation.imageUrl.includes("snapshot") && !initialInvitation.imageUrl.startsWith("#")
          ? initialInvitation.imageUrl
          : null);
      if (pendingUpload) {
        baseState.cardBg = { type: "image", value: pendingUpload };
      }
    }

    return baseState;
  };

  const [designState, setDesignState] = useState<StudioDesignState>(getInitialDesign);
  const [activeTab, setActiveTab] = useState<"templates" | "text" | "backgrounds" | "envelope" | "effects" | "details">("text");
  const [envelopeSubTab, setEnvelopeSubTab] = useState<"colors" | "liners" | "stamps" | "stickers">("colors");
  const [isGuestSelectionModalOpen, setIsGuestSelectionModalOpen] = useState(false);

  // Template tracking for re-hydration
  const loadedTemplateIdRef = useRef<string | null>(
    templateIdQuery ||
    initialInvitation?.templateId ||
    initialEvent?.selectedTemplateId ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("pending_template_id") || localStorage.getItem("pending_template_id")
      : null)
  );

  // Progress Steps
  const STEPS = ["Design", "Details", "Gifting", "Review", "Add guests"] as const;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
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
      layerX: layer.x,
      layerY: layer.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingLayerId || !dragStartPos.current || !cardCanvasRef.current) return;
      const rect = cardCanvasRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStartPos.current.mouseX) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartPos.current.mouseY) / rect.height) * 100;

      const newX = Math.max(5, Math.min(95, dragStartPos.current.layerX + deltaX));
      const newY = Math.max(5, Math.min(95, dragStartPos.current.layerY + deltaY));

      setDesignState((prev) => ({
        ...prev,
        textLayers: prev.textLayers.map((layer) =>
          layer.id === draggingLayerId ? { ...layer, x: Math.round(newX), y: Math.round(newY) } : layer
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
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [guestEmailsInput, setGuestEmailsInput] = useState("");
  const [eventGuests, setEventGuests] = useState<any[]>([]);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
    // Check sessionStorage first (highest priority — set by Hero / AI-assistant upload flow)
    const pendingFromSession = typeof window !== "undefined"
      ? sessionStorage.getItem("pending_upload_invite")
      : null;
    const uploadedUrl =
      pendingFromSession ||
      (initialInvitation?.imageUrl &&
        !initialInvitation.imageUrl.includes("snapshot") &&
        !initialInvitation.imageUrl.startsWith("#") &&
        !initialInvitation.imageUrl.startsWith("data:")
        ? initialInvitation.imageUrl
        : null);

    if (!uploadedUrl) return;

    uploadAppliedToCanvasRef.current = true;
    if (pendingFromSession) {
      try { sessionStorage.removeItem("pending_upload_invite"); } catch (e) {}
    }
    setDesignState((prev) => ({
      ...prev,
      cardBg: { type: "image", value: uploadedUrl },
    }));
  }, [initialInvitation?.imageUrl]);

  // Canvas Re-hydration & Source Template Loading Logic
  useEffect(() => {
    const targetTplId =
      templateIdQuery ||
      initialInvitation?.templateId ||
      initialEvent?.selectedTemplateId ||
      (typeof window !== "undefined"
        ? sessionStorage.getItem("pending_template_id") || localStorage.getItem("pending_template_id")
        : null);

    if (targetTplId && targetTplId !== loadedTemplateIdRef.current) {
      const config = getTemplateConfig(targetTplId);
      if (config) {
        loadedTemplateIdRef.current = targetTplId;
        const freshState = createDesignStateFromTemplate(
          targetTplId,
          currentEvent || initialEvent,
          currentInvitation || initialInvitation
        );
        setDesignState(freshState);
        setUndoStack([]);
        setRedoStack([]);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem("pending_template_id");
            localStorage.removeItem("pending_template_id");
          } catch (e) {}
        }
      }
    }
  }, [
    templateIdQuery,
    initialInvitation?.templateId,
    initialEvent?.selectedTemplateId,
    initialEvent,
    initialInvitation,
    currentEvent,
    currentInvitation,
  ]);

  // Apply new template from in-studio template switcher
  const handleSelectTemplate = (templateId: string) => {
    const config = getTemplateConfig(templateId);
    if (!config) return;
    loadedTemplateIdRef.current = templateId;
    const nextState = createDesignStateFromTemplate(
      templateId,
      currentEvent || initialEvent,
      currentInvitation || initialInvitation
    );
    pushStateToHistory(nextState);
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
      await new Promise((r) => setTimeout(r, 100));

      const dataUrl = await toPng(targetNode, {
        quality: 0.9,
        pixelRatio: 2.0,
        skipFonts: false,
        backgroundColor: typeof designState.cardBg.value === "string" && !designState.cardBg.value.includes("gradient")
          ? designState.cardBg.value
          : undefined,
      });

      setDesignState((prev) => ({ ...prev, selectedTextId: prevSelected }));
      setSnapshotDataUrl(dataUrl);

      // Upload to file storage so the payload sends a lightweight URL instead of raw base64
      let uploadedUrl: string | null = null;
      if (dataUrl && dataUrl.startsWith("data:")) {
        uploadedUrl = await uploadSnapshotBlob(dataUrl);
      }

      return { dataUrl, uploadedUrl };
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

    const resolvedImageUrl = snapshotUrl
      || (designState.cardBg.type === "image" && designState.cardBg.value ? designState.cardBg.value : null)
      || currentInvitation?.imageUrl
      || currentEvent?.coverImage
      || initialEvent?.coverImage
      || null;

    return {
      id: currentInvitation?.id || undefined,
      eventId: targetEventId,
      templateId: templateIdQuery || designState.activeTemplateId || "custom",
      title: titleText,
      subtitle: subtitleText,
      mainText,
      message,
      accentColor,
      backgroundColor: typeof designState.cardBg.value === "string" ? designState.cardBg.value : "#FAF8F5",
      textColor,
      titleSize,
      fontWeight: titleLayer?.fontWeight || "900",
      fontFamily: titleLayer?.fontFamily || "'Londrina Solid', cursive",
      textAlignment: titleLayer?.align || "center",
      imageUrl: resolvedImageUrl,
      buttonText: "RSVP Now",
      buttonColor: accentColor,
      buttonRadius: 12,
      status: "draft",
      eventTitle: designState.eventDetails.title || currentEvent?.title || initialEvent?.title || titleText,
      eventDate: designState.eventDetails.date || currentEvent?.eventDate || initialEvent?.eventDate || null,
      eventTime: designState.eventDetails.time || currentEvent?.eventTime || initialEvent?.eventTime || null,
      eventVenue: designState.eventDetails.venue || currentEvent?.venue || initialEvent?.venue || null,
      textElements: designState.textLayers,
      background: designState.cardBg,
      envelope: designState.envelope,
      effects: designState.effects,
      location: designState.eventDetails.address || designState.eventDetails.venue || null,
    };
  };

  // Save current design state to backend with diagnostics
  const saveDesign = async (uploadedSnapshotUrl?: string | null): Promise<Invitation | null> => {
    const payload = constructPayload(uploadedSnapshotUrl);

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
        setCurrentInvitation(saved);
        return saved;
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
    setCurrentStepIndex(4);
    setIsDispatchModalOpen(true);
  };

  // Handle proceed next / send
  const handleProceedNext = async () => {
    if (isGeneratingSnapshot || isSavingDraft || isPreparingDispatch) return;

    // If on the final step ("Add guests"): open the send modal
    if (currentStepIndex === STEPS.length - 1) {
      setIsDispatchModalOpen(true);
      return;
    }

    // When on "Design" step (step 0): capture snapshot, save payload, and advance to "Details" (step 1)
    if (currentStepIndex === 0) {
      // 1. Capture and upload snapshot with graceful fallback
      const { dataUrl, uploadedUrl } = await generateSnapshot();

      // 2. Save payload
      const saved = await saveDesign(uploadedUrl || dataUrl);
      if (saved) {
        setToast({ message: "Design saved! Advancing to details... ✨", type: "success" });
        setCurrentStepIndex(1);
        setActiveTab("details");
      }
      return;
    }

    // When on "Details" step (step 1): save details and advance to step 2 ("Gifting")
    if (currentStepIndex === 1) {
      const saved = await saveDesign(null);
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

    // When on "Review" step (step 3): generate snapshot, save, advance to "Add guests" and open modal
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

      // Ensure invitation is saved before sending if id is missing
      let activeInvitationId = currentInvitation?.id || initialInvitation?.id;
      if (!activeInvitationId) {
        const saved = await saveDesign(null);
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
        snapshot: snapshotDataUrl,
        snapshotUrl: snapshotDataUrl?.startsWith("http") ? snapshotDataUrl : undefined,
        cardImageBase64: snapshotDataUrl?.startsWith("data:") ? snapshotDataUrl : undefined,
        cardSnapshotUrl: snapshotDataUrl,
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
            className={`fixed top-16 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium ${
              toast.type === "success"
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
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-30 shadow-xs text-slate-800 flex-shrink-0">
        {/* Left: Back & Undo/Redo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={async () => {
              try {
                await saveDesign(null);
              } catch (e) {
                console.warn("Auto-saving on return to designer:", e);
              }
              if (onBack) onBack();
              else router.push("/dashboard/invitations");
            }}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors py-1.5 px-2.5 sm:px-3 rounded-xl hover:bg-indigo-50 border border-slate-200/90 hover:border-indigo-200 shadow-xs cursor-pointer"
            title="Return to Invitation Designer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Invitation Designer</span>
          </button>

          <span className="text-slate-300 font-light select-none">/</span>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 hidden sm:inline-block">
            Canvas
          </span>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-1">
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

        {/* Center: Progress Steps ("Design", "Details", "Gifting", "Review", "Add guests") */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={step}
                type="button"
                onClick={() => {
                  if (idx === STEPS.length - 1) {
                    // "Add guests" tab: always generate fresh snapshot before opening modal
                    prepareAndOpenDispatch();
                    return;
                  }
                  setCurrentStepIndex(idx);
                  if (idx === 1) setActiveTab("details");
                  if (idx === 0) setActiveTab("text");
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : isCompleted
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <span>{step}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Actions & Next */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => saveDesign(null)}
            disabled={isGeneratingSnapshot || isSavingDraft}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Save draft"
          >
            {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save</span>
          </button>

          <button
            type="button"
            onClick={handleProceedNext}
            disabled={isGeneratingSnapshot || isSavingDraft || isPreparingDispatch}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold tracking-wide shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGeneratingSnapshot || isSavingDraft || isPreparingDispatch ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isGeneratingSnapshot ? "Rendering..." : isPreparingDispatch ? "Preparing..." : "Saving..."}</span>
              </>
            ) : (
              <>
                <span>{currentStepIndex === STEPS.length - 1 ? "Send" : "Next"}</span>
                <span className="text-sm">→</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE: SIDEBAR & CENTER CANVO/STAGE                              */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ------------------------------------------------------------- */}
        {/* LEFT MULTI-TAB SIDEBAR                                        */}
        {/* ------------------------------------------------------------- */}
        <div className="flex h-full z-20 shadow-xl flex-shrink-0 bg-white border-r border-slate-200/90 text-slate-800">
          {/* Vertical Icon Strip */}
          <div className="w-[76px] bg-white border-r border-slate-200/70 flex flex-col items-center py-4 gap-3 flex-shrink-0">
            {/* 0. Templates Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === "templates"
                  ? "bg-slate-100 text-slate-950 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              }`}
              title="Templates"
            >
              <Sparkles className="w-5 h-5 stroke-[1.8] text-amber-500" />
              <span className="text-[10px] tracking-tight">Templates</span>
            </button>

            {/* 1. Text Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === "text"
                  ? "bg-slate-100 text-slate-950 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-lg font-bold font-serif leading-none">T</span>
              <span className="text-[10px] tracking-tight">Text</span>
            </button>

            {/* 2. Backgrounds Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("backgrounds")}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === "backgrounds"
                  ? "bg-slate-100 text-slate-950 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Layers className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[10px] tracking-tight">Backgrounds</span>
            </button>

            {/* 3. Effects Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("effects")}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === "effects"
                  ? "bg-slate-100 text-slate-950 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[10px] tracking-tight">Effects</span>
            </button>

            {/* 4. Envelope Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("envelope")}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === "envelope"
                  ? "bg-slate-100 text-slate-950 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Mail className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[10px] tracking-tight">Envelope</span>
            </button>

            {/* 5. Details Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === "details"
                  ? "bg-slate-100 text-slate-950 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Calendar className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[10px] tracking-tight">Details</span>
            </button>
          </div>

          {/* Sub-Panel Content Area */}
          <div className="w-80 md:w-88 h-full overflow-y-auto p-5 space-y-6 flex flex-col text-slate-700 bg-white">
            {/* -------------------- TAB 0: TEMPLATES -------------------- */}
            {activeTab === "templates" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                      Curated Templates
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">Click any template to apply its design 1:1</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {NEW_TEMPLATES.length} Styles
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
                  {NEW_TEMPLATES.map((tpl) => {
                    const isSelected = designState.activeTemplateId === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl.id)}
                        className={`group rounded-xl p-2 border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col ${
                          isSelected
                            ? "border-slate-900 ring-2 ring-slate-900 bg-slate-50 shadow-sm"
                            : "border-slate-200 hover:border-slate-400 bg-white hover:shadow-xs"
                        }`}
                      >
                        <div className="aspect-[3/4] rounded-lg overflow-hidden relative mb-2 bg-slate-100 border border-slate-100">
                          <img
                            src={tpl.image}
                            alt={tpl.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {tpl.badge && (
                            <span className="absolute top-1.5 right-1.5 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 shadow-xs">
                              {tpl.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate">{tpl.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{tpl.category || tpl.type}</p>
                        {isSelected && (
                          <div className="absolute bottom-2 right-2 w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            isSelected
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
                        className={`flex-1 py-2 text-xs font-bold transition-colors cursor-pointer ${
                          activeLayer?.casing === "uppercase"
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
                        className={`flex-1 py-2 text-xs font-bold transition-colors cursor-pointer ${
                          activeLayer?.casing === "lowercase"
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
                        className={`flex-1 py-2 text-xs font-bold transition-colors cursor-pointer ${
                          activeLayer?.casing === "capitalize"
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
                        className={`flex-1 py-2 flex items-center justify-center transition-colors cursor-pointer ${
                          activeLayer?.align === "left"
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
                        className={`flex-1 py-2 flex items-center justify-center transition-colors cursor-pointer ${
                          activeLayer?.align === "center"
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
                        className={`flex-1 py-2 flex items-center justify-center transition-colors cursor-pointer ${
                          activeLayer?.align === "right"
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

                {/* Colors Picker Input */}
                <div>
                  <span className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2">
                    Colors
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 flex-shrink-0"
                        style={{
                          backgroundColor:
                            designState.cardBg.type === "color" ? designState.cardBg.value : "#8c93ca",
                        }}
                      />
                      <span className="text-xs font-mono font-semibold text-slate-700 uppercase">
                        {designState.cardBg.type === "color" ? designState.cardBg.value : "#8c93ca"}
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
                        value={designState.cardBg.type === "color" ? designState.cardBg.value : "#8c93ca"}
                        onChange={(e) =>
                          pushStateToHistory({
                            ...designState,
                            cardBg: { type: "color", value: e.target.value },
                          })
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
                    Backgrounds
                  </span>
                  <div className="grid grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {PRESET_BACKGROUNDS.map((bg) => {
                      const isSelected = designState.cardBg.value === bg.style;
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() =>
                            pushStateToHistory({
                              ...designState,
                              cardBg: { type: "preset", value: bg.style },
                            })
                          }
                          className={`group aspect-[4/5] rounded-xl relative overflow-hidden border transition-all cursor-pointer ${
                            isSelected
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
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                          isActive
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
                            className={`group aspect-[5/3.5] rounded-xl relative overflow-hidden border transition-all cursor-pointer shadow-2xs ${
                              isSelected
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
                            className={`p-2.5 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                              isSelected
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
                            className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                              isSelected
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
                            className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                              isSelected
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
                          className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
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
                          className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
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
                          className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
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
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CENTER CANVAS STAGE: Open Envelope with Card Mounted          */}
        {/* ------------------------------------------------------------- */}
        <div
          className="flex-1 h-full overflow-auto flex items-center justify-center p-6 md:p-12 relative"
          style={{
            backgroundColor: designState.stageBackdrop.value,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.15) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDesignState((prev) => ({ ...prev, selectedTextId: null }));
              setEditingTextId(null);
            }
          }}
        >
          {/* ENVELOPE + CARD CONTAINER (Captured for snapshot dispatch) */}
          <div
            ref={envelopeStageRef}
            className={`relative w-full flex flex-col items-center justify-center select-none transition-all duration-300 ${
              designState.isLandscape
                ? "max-w-[580px] sm:max-w-[640px] md:max-w-[680px]"
                : "max-w-[480px] sm:max-w-[540px] md:max-w-[580px]"
            }`}
            style={{ minHeight: designState.isLandscape ? "600px" : "680px" }}
          >
            {/* 1. Open Envelope Back & Liner Flap (Behind Card) */}
            <div
              className={`absolute rounded-t-3xl transition-all duration-300 pointer-events-none ${
                designState.isLandscape
                  ? "top-6 w-[96%] sm:w-[98%] h-[310px]"
                  : "top-4 w-[92%] sm:w-[94%] h-[340px]"
              }`}
              style={{
                background:
                  ENVELOPE_LINERS.find((l) => l.id === designState.envelope.liner)?.style || "rgba(0,0,0,0.02)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                clipPath: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)",
              }}
            />

            {/* Realistic Triangular Open Envelope Flap */}
            <div
              className={`absolute transition-all duration-300 pointer-events-none z-0 ${
                designState.isLandscape
                  ? "-top-14 w-[100%] sm:w-[102%] h-[150px]"
                  : "-top-12 w-[98%] sm:w-[100%] h-[160px]"
              }`}
              style={{
                background: designState.envelope.color,
                clipPath: "polygon(0 100%, 50% 0%, 100% 100%)",
                filter: "drop-shadow(0 -4px 12px rgba(0,0,0,0.25))",
              }}
            >
              {/* Optional Stamp on Flap */}
              {designState.envelope.stamp && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-500/20 border border-amber-300/40 flex items-center justify-center text-xl shadow-xs">
                  {STAMPS.find((s) => s.id === designState.envelope.stamp)?.emoji}
                </div>
              )}
            </div>

            {/* 2. THE INVITATION CARD (Mounted neatly in the pouch) */}
            <div
              ref={cardCanvasRef}
              id="invitation-card-container"
              data-testid="preview-card"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setEditingTextId(null);
                }
              }}
              className={`relative z-10 rounded-2xl overflow-hidden transition-all duration-300 ${
                designState.isLandscape
                  ? "w-[92%] sm:w-[94%] aspect-[4/3]"
                  : "w-[84%] sm:w-[86%] aspect-[3/4.2]"
              } ${
                designState.effects.texture === "cotton-press"
                  ? "texture-cotton-press"
                  : designState.effects.texture === "linen"
                  ? "texture-linen"
                  : ""
              }`}
              style={{
                backgroundColor:
                  designState.cardBg.type === "color"
                    ? designState.cardBg.value
                    : designState.cardBg.type === "image"
                    ? "#faf8f5"
                    : undefined,
                background:
                  designState.cardBg.type === "preset" || designState.cardBg.type === "gradient"
                    ? designState.cardBg.value
                    : undefined,
                boxShadow:
                  designState.effects.shadow === "deep"
                    ? "0 25px 50px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.06)"
                    : designState.effects.shadow === "floating"
                    ? "0 18px 36px -8px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)"
                    : designState.effects.shadow === "subtle"
                    ? "0 6px 16px rgba(0,0,0,0.12)"
                    : "none",
              }}
            >
              {/* Background Image if uploaded or template image */}
              {designState.cardBg.type === "image" &&
                designState.cardBg.value &&
                !designState.cardBg.value.startsWith("#") && (
                  <img
                    src={designState.cardBg.value}
                    alt="Card Background"
                    crossOrigin="anonymous"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                )}

              {/* Foil Shimmer Overlay if active */}
              {designState.effects.foil && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    background:
                      designState.effects.foil === "gold"
                        ? "linear-gradient(135deg, transparent 40%, #ffd700 50%, transparent 60%)"
                        : designState.effects.foil === "rose-gold"
                        ? "linear-gradient(135deg, transparent 40%, #f7cac9 50%, transparent 60%)"
                        : "linear-gradient(135deg, transparent 40%, #ffffff 50%, transparent 60%)",
                  }}
                />
              )}

              {/* Interactive Photo Slot (e.g. Disney Winnie the Pooh circular baby photo slot) */}
              {designState.photoSlot && (
                <div
                  id="canvas-photo-slot"
                  data-testid="canvas-photo-slot"
                  onClick={(e) => {
                    e.stopPropagation();
                    photoInputRef.current?.click();
                  }}
                  className="absolute cursor-pointer group select-none transition-transform hover:scale-[1.02]"
                  style={{
                    left: `${designState.photoSlot.x}%`,
                    top: `${designState.photoSlot.y}%`,
                    width: `${designState.photoSlot.width}px`,
                    height: `${designState.photoSlot.height}px`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 22,
                    pointerEvents: "auto",
                  }}
                  title="Click to replace photo"
                >
                  <div
                    className="w-full h-full overflow-hidden relative shadow-md border-2 border-amber-400/90 hover:border-amber-500 bg-amber-50/80 transition-all"
                    style={{
                      borderRadius: designState.photoSlot.borderRadius || "9999px",
                    }}
                  >
                    {designState.photoSlot.imageUrl ? (
                      <img
                        src={designState.photoSlot.imageUrl}
                        alt="Photo Frame"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50/90 text-amber-800 p-2 text-center">
                        <Upload className="w-6 h-6 mb-1 text-amber-600" />
                        <span className="text-[10px] font-bold">Add Photo</span>
                      </div>
                    )}

                    {/* Interactive hover overlay */}
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center cursor-pointer">
                      <Upload className="w-5 h-5 mb-1 text-white drop-shadow" />
                      <span className="text-[11px] font-bold drop-shadow leading-tight">
                        Change Photo
                      </span>
                      <span className="text-[9px] text-white/80 drop-shadow">
                        Upload baby photo
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden file input for photo slot replacement */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSlotUpload}
              />

              {/* Draggable & Selectable Text Layers */}
              {designState.textLayers.map((layer) => {
                const isSelected = designState.selectedTextId === layer.id;
                const isEditing = editingTextId === layer.id;
                const isFoil = designState.effects.foil;

                let foilClass = "";
                if (isFoil === "gold") foilClass = "foil-gold";
                else if (isFoil === "rose-gold") foilClass = "foil-rose-gold";
                else if (isFoil === "silver") foilClass = "foil-silver";

                return (
                  <div
                    key={layer.id}
                    id={`canvas-text-${layer.id}`}
                    data-testid={`text-layer-${layer.id}`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleLayerMouseDown(e, layer);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectLayer(layer.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingTextId(layer.id);
                      handleSelectLayer(layer.id);
                    }}
                    className={`absolute cursor-move transition-shadow select-none pointer-events-auto ${
                      isSelected
                        ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-white/80 rounded-lg z-30"
                        : "hover:ring-1 hover:ring-blue-300 rounded-lg z-15"
                    }`}
                    style={{
                      left: `${layer.x}%`,
                      top: `${layer.y}%`,
                      transform: "translate(-50%, -50%)",
                      maxWidth: "92%",
                      pointerEvents: "auto",
                      zIndex: isSelected ? 30 : 15,
                    }}
                  >
                    {isEditing ? (
                      <textarea
                        autoFocus
                        rows={layer.text.includes("\n") || layer.text.length > 30 ? 3 : 1}
                        value={layer.text}
                        onChange={(e) => updateActiveLayer({ text: e.target.value })}
                        onBlur={() => setEditingTextId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setEditingTextId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="bg-white/95 border-2 border-blue-500 rounded p-1.5 text-slate-900 resize-none outline-none shadow-xl cursor-text pointer-events-auto"
                        style={{
                          fontFamily: layer.fontFamily,
                          fontSize: `${layer.fontSize}px`,
                          color: layer.color,
                          textAlign: layer.align,
                          lineHeight: layer.lineHeight,
                          fontWeight: layer.fontWeight,
                          letterSpacing: `${layer.letterSpacing}px`,
                          minWidth: "180px",
                        }}
                      />
                    ) : (
                      <div
                        className={`px-3 py-1 leading-tight whitespace-pre-wrap pointer-events-auto ${foilClass}`}
                        style={{
                          fontFamily: layer.fontFamily,
                          fontSize: `${layer.fontSize}px`,
                          color: isFoil ? undefined : layer.color,
                          textAlign: layer.align,
                          textTransform: layer.casing === "none" ? undefined : layer.casing,
                          letterSpacing: `${layer.letterSpacing}px`,
                          lineHeight: layer.lineHeight,
                          fontWeight: layer.fontWeight,
                          pointerEvents: "auto",
                        }}
                      >
                        {layer.text || "Type text here"}
                      </div>
                    )}

                    {/* Active Drag Boundary Handles */}
                    {isSelected && !isEditing && (
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

            {/* 3. Envelope Front Pocket (Lower half holding the card) */}
            <div
              className={`relative w-full rounded-b-3xl pointer-events-none z-20 shadow-2xl transition-all duration-300 ${
                designState.isLandscape ? "-mt-24 h-[210px]" : "-mt-16 h-[220px]"
              }`}
              style={{
                background: designState.envelope.color,
                clipPath: "polygon(0 0, 50% 30%, 100% 0, 100% 100%, 0 100%)",
                filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.3))",
              }}
            >
              {/* Envelope Flap Crease & Texture Line */}
              <svg className="w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 70">
                <polygon points="0,0 50,35 100,0" fill="none" stroke="#000" strokeWidth="1.5" />
                <polygon points="0,70 50,35 100,70" fill="none" stroke="#fff" strokeWidth="1.5" />
              </svg>

              {/* Optional Sticker Seal on front flap */}
              {designState.envelope.sticker && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-white/90 shadow-lg border border-black/10 flex items-center justify-center text-2xl animate-bounce pointer-events-none">
                  {STICKERS.find((s) => s.id === designState.envelope.sticker)?.emoji}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
