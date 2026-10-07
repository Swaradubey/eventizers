// =============================================================================
// Evite 4-Layer Decoupled Architecture - Template Registry & Schema Definition
// Source of Truth: All templates define isolated backdrop, envelope, card artwork,
// and dynamic live text layers without baked-in typography.
// =============================================================================

import { homeTemplatesData } from "./homeTemplatesData";


// CSS-only card visual configuration — no images, no SVGs
export interface CssBorderConfig {
  type: 'double-gold' | 'triple-line' | 'dotted' | 'geometric' | 'hairline' | 'arch' | 'none';
  color?: string;
  secondaryColor?: string;
  thickness?: number;
  offset?: number;
  borderRadius?: string;
}

export interface CssEnvelopeConfig {
  outerColor: string;
  flapColor?: string;
  linerCss: string;  // pure CSS gradient/pattern string
}

export interface CssCardConfig {
  // Card surface
  backgroundColor: string;
  backgroundGradient?: string;   // overrides solid bg if set
  paperShadow?: string;          // inset box-shadow for paper texture
  border?: CssBorderConfig;
  // Optional shape modifiers
  borderRadius?: string;         // e.g. '140px 140px 0 0' for arch
  clipPath?: string;
}

export interface EviteCardTemplate {
  id: string;
  name: string;
  category: string;
  backdrop: {
    color: string;
    type?: 'color' | 'texture';
    value?: string;
    gradient?: string;  // pure CSS gradient for backdrop
  };
  envelope: {
    outerColor: string;
    linerPattern?: string;
    linerPatternUrl?: string;
    linerCss?: string;    // pure CSS gradient for liner
    isOpen?: boolean;
  };
  card: {
    backgroundColor: string;
    decorativeBorderSvgUrl: string; // '' for pure-CSS templates
    artworkUrl?: string;
    aspectRatio: 'portrait' | 'square' | '5x7';
    cssConfig?: CssCardConfig;   // populated for pure-CSS templates
  };
  textLayers: Array<{
    id: string;
    key: 'header' | 'title' | 'subtitle' | 'dateTime' | 'venue' | 'rsvp' | string;
    text: string;
    fontFamily: string;
    fontSize: number; // base font size in px
    fontWeight: string | number;
    color: string;
    textAlign: 'left' | 'center' | 'right';
    top: number;  // % percentage coordinate relative to card
    left: number; // % percentage coordinate relative to card
    // Foil gradient text (pure CSS, no images)
    foilGradient?: string;
    letterSpacing?: number;
    lineHeight?: number;
    casing?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  }>;
  // Present on pure-CSS templates only — null on legacy SVG-based templates
  cssConfig?: {
    card: CssCardConfig;
    envelopeCss: CssEnvelopeConfig;
    backdropGradient: string;
  } | null;
}

// -----------------------------------------------------------------------------
// Editable Canvas Layer Schema (Thanksgiving / Autumn template family)
// Mirrors the designer's independent, fully-editable canvas text nodes.
// -----------------------------------------------------------------------------
export interface EditableCanvasElement {
  id: string;
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight?: string | number;
  fontStyle?: string;
  letterSpacing?: string;
  lineHeight?: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  /** Absolute X coordinate in px relative to `dimensions.width` */
  x: number;
  /** Absolute Y coordinate in px relative to `dimensions.height` */
  y: number;
  /** Stacking order of the editable node above the locked artwork layer */
  zIndex?: number;
}

export interface TemplateCanvasBackground {
  color: string;
  texture?: string;
  artworkUrl: string;
  /** Locked background artwork — never selectable / never distorted by text edits */
  artworkLock?: boolean;
  filter?: string;
}

export interface TemplateEnvelopeConfig {
  /** Master switch — when false the template renders as a flat card with no envelope stage */
  enabled?: boolean;
  style?: 'kraft-paper' | 'forest-green' | string;
  linerPattern?: string;
  position?: 'left-angled-behind' | 'right-angled-behind' | string;
  envelopeColor?: string;
  linerBorder?: string;
  flapColor?: string;
}

export interface EviteTemplateSchema {
  id: string;
  title: string;
  name?: string;
  category: 'Baby Shower' | 'Wedding' | 'Birthday' | 'All' | 'bridal_shower' | string;
  tags?: string[];
  tier?: 'free' | 'premium' | string;
  isPremium?: boolean;
  badge?: 'Trending' | 'FREE' | 'Free' | 'PREMIUM' | 'Premium' | string;
  /** Browse-grid ordering weight — higher values float to the TOP of every template gallery */
  priority?: number;
  /** Stable tie-breaker used when several templates share the same `priority` */
  sortOrder?: number;
  /** Featured/pinned merchandising flag (treated as `priority: 100`) */
  isFeatured?: boolean;
  /** Whether every default text box is editable on the canvas */
  isEditable?: boolean;
  /** High-res card artwork loaded onto the locked canvas background layer */
  artworkUrl?: string;
  /** Envelope liner artwork (rendered as a CSS background image) */
  envelopeLinerUrl?: string;
  /** Designer canvas payload: background artwork + default text objects (px coordinates) */
  canvasConfig?: {
    width?: number;
    height?: number;
    artworkUrl?: string;
    crossOrigin?: string;
    proxyUrl?: string;
    locked?: boolean;
    textObjects?: Array<{
      id: string;
      role?: string;
      text: string;
      x: number;
      y: number;
      fontFamily: string;
      fontSize: number;
      fill: string;
      fontWeight?: string | number;
      align?: 'left' | 'center' | 'right';
    }>;
    [key: string]: any;
  };
  /** Design canvas size in px (design-time coordinate space for editableElements) */
  dimensions?: { width: number; height: number };
  /** Locked decorative artwork layer rendered behind every editable text node */
  canvasBackground?: TemplateCanvasBackground;
  /** Independent editable canvas nodes (headline / subtext / datetime / location) */
  editableElements?: EditableCanvasElement[];
  envelopeColor?: string;
  linerColor?: string;
  envelopeLiner?: string;
  mockupUrl?: string;
  thumbnailUrl?: string;
  innerCardLayer?: {
    backgroundColor?: string;
    borderRadius?: string;
    border?: any;
    paperShadow?: string;
    aspectRatio?: string;
  };
  backdrop: {
    type: 'color' | 'texture';
    value: string; // e.g. '#9c7cb6' or a pure CSS gradient string
    color?: string;
    gradient?: string;  // pure CSS gradient overriding value
  };
  envelope: TemplateEnvelopeConfig & {
    outerColor: string;
    flapColor?: string;
    linerPatternUrl: string; // empty string for pure-CSS templates
    innerLiner?: string;     // image URL or pattern for liner
    linerColor?: string;
    shadowColor?: string;    // custom shadow color
    linerCss?: string;       // pure CSS gradient/pattern string for liner
    linerPattern?: string;
    isOpen: boolean;
    isOpenUpward?: boolean;
    flapStyle?: 'triangle' | 'hexagon' | 'square' | string;
  };
  card: {
    artworkUrl: string;             // '' for pure-CSS templates
    borderIllustration?: string;    // image illustration frame path
    safeArea?: { top: string; bottom: string; left: string; right: string }; // safe printable margins
    decorativeBorderSvgUrl?: string;// '' for pure-CSS templates
    backgroundColor: string;
    aspectRatio: '5x7' | 'square' | 'portrait';
    border?: any;
    cssConfig?: CssCardConfig;      // populated for pure-CSS templates
    decorations?: any[];
    decorativeImages?: string[];
    illustrationLayers?: any[];
    stickerElements?: any[];
  };
  defaultTextBlocks?: Array<{
    id: string;
    text: string;
    fontFamily: string;
    fontSize: number;
    fontWeight?: string | number;
    textTransform?: string;
    casing?: string;
    lineHeight?: number;
    fontStyle?: string;
    letterSpacing?: string;
    color: string;
    align: string;
    position: { top: string; left: string; transform?: string };
    maxHeight?: string;
  }>;
  defaultTextLayers: Array<{
    id: string;
    key: string;
    text: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    fontWeight: string | number;
    textAlign: 'left' | 'center' | 'right';
    top: number;  // % percentage coordinate relative to card surface
    left: number; // % percentage coordinate relative to card surface
    fontStyle?: string;
    letterSpacing?: number | string;
    lineHeight?: number;
    maxHeight?: string;
    foilGradient?: string;
    isFoil?: 'gold' | 'rose-gold' | 'silver' | 'neon' | null;
    textShadow?: string;
    casing?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  }>;
  // Optional canvas payload consumed by the studio (background artwork + optional extra layers)
  canvasData?: {
    backgroundImage?: string | { url?: string; src?: string };
    layers?: any[];
    [key: string]: any;
  };
  textLayers?: Array<{
    id: string;
    key: 'header' | 'title' | 'subtitle' | 'dateTime' | 'venue' | 'rsvp' | string;
    text: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string | number;
    color: string;
    textAlign: 'left' | 'center' | 'right';
    top: number;
    left: number;
  }>;
  // Set to true for templates that use pure CSS and no image/SVG assets
  isPureCss?: boolean;
}

export interface TemplateTextLayer {
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
  casing?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number; // px
  lineHeight?: number; // multiplier e.g. 1.2
  fontWeight: string | number;
  isFoil?: 'gold' | 'rose-gold' | 'silver' | null;
  foilGradient?: string;
}

export interface PhotoSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: string;
  imageUrl?: string | null;
  placeholderText?: string;
}

export interface NewTemplateData {
  id: string;
  isPureCss?: boolean;
  isPremium?: boolean;
  isLayered?: boolean;
  isEditable?: boolean;
  isFeatured?: boolean;
  /** Browse-grid ordering weight (higher = shown first) */
  priority?: number;
  sortOrder?: number;
  artworkUrl?: string;
  envelopeLinerUrl?: string;
  canvasConfig?: EviteTemplateSchema['canvasConfig'];
  type: string;
  category: string;
  tags?: string[];
  designer?: string;
  title: string;
  badge?: 'Trending' | 'FREE' | 'PREMIUM' | string;
  subtitle: string;
  date: string;
  time: string;
  host: string;
  venue: string;
  gradient: string;
  accentColor: string;
  emoji: string;
  image: string;
  mockupUrl?: string;
  thumbnailUrl?: string;
  decorationImage?: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  titleSize: number;
  fontWeight: string | number;
  fontFamily: string;
  buttonColor: string;
  buttonRadius: number;
  buttonText: string;
  textAlignment: string;
  gallery: string[];
  sections: { title: string; content: string }[];
  isLandscape?: boolean;
  swatches?: string[];
  envelopeColor: string;
  linerColor?: string;
  envelopeLiner: string;
  flapStyle?: string;
  isOpenUpward?: boolean;
  textLayers?: TemplateTextLayer[];
  photoSlot?: PhotoSlot | null;
  // 4-Layer Evite Decoupled Fields
  backdrop: EviteTemplateSchema['backdrop'];
  envelope: EviteTemplateSchema['envelope'];
  card: EviteTemplateSchema['card'];
  innerCardLayer?: EviteTemplateSchema['innerCardLayer'];
  defaultTextLayers: EviteTemplateSchema['defaultTextLayers'];
  backgroundImage?: string | { url?: string; src?: string };
  backgroundUrl?: string;
  canvasData?: {
    backgroundImage?: string | { url?: string; src?: string };
    layers?: any[];
    [key: string]: any;
  };
}

// -----------------------------------------------------------------------------
// THANKSGIVING / AUTUMN TEMPLATE SEEDS (Editable Canvas Layer Architecture)
// Each seed is injected into EVITE_TEMPLATES below and normalized into the
// 4-Layer Decoupled schema (backdrop / envelope / card / defaultTextLayers).
// -----------------------------------------------------------------------------

/** Pure-CSS envelope liner patterns used by the Thanksgiving / Autumn family */
export const THANKSGIVING_LINER_PATTERNS: Record<string, string> = {
  // Warm kraft envelope — tan + forest green plaid
  "plaid-tan-green":
    "repeating-linear-gradient(90deg, rgba(29,59,46,0.55) 0px, rgba(29,59,46,0.55) 5px, transparent 5px, transparent 30px), repeating-linear-gradient(0deg, rgba(29,59,46,0.55) 0px, rgba(29,59,46,0.55) 5px, transparent 5px, transparent 30px), repeating-linear-gradient(90deg, rgba(140,109,79,0.4) 0px, rgba(140,109,79,0.4) 2px, transparent 2px, transparent 15px), repeating-linear-gradient(0deg, rgba(140,109,79,0.4) 0px, rgba(140,109,79,0.4) 2px, transparent 2px, transparent 15px), linear-gradient(135deg, #E9D6B8 0%, #DCC39C 55%, #E4CFAC 100%)",
  // Forest green envelope — warm terracotta gingham
  "warm-gingham":
    "repeating-linear-gradient(90deg, rgba(198,92,48,0.42) 0px, rgba(198,92,48,0.42) 13px, transparent 13px, transparent 27px), repeating-linear-gradient(0deg, rgba(198,92,48,0.42) 0px, rgba(198,92,48,0.42) 13px, transparent 13px, transparent 27px), linear-gradient(135deg, #F8EAD1 0%, #F1DCB9 100%)",
  // Flat-card templates never render an envelope liner, but keep a fallback
  "autumn-gingham":
    "repeating-linear-gradient(0deg, #cb925d 0px, #cb925d 14px, #fbf7ee 14px, #fbf7ee 28px), repeating-linear-gradient(90deg, rgba(160, 98, 42, 0.38) 0px, rgba(160, 98, 42, 0.38) 14px, transparent 14px, transparent 28px)",
};

/** Maps an editable node id to the canonical designer text-layer key */
const EDITABLE_KEY_MAP: Record<string, string> = {
  "text-title": "title",
  "text-heading": "heading",
  "text-datetime": "datetime",
  "text-location": "venue",
  "text-subtext": "subtitle",
  "text-details": "datetime",
  "text-invite": "invite",
  "text-time-place": "datetime",
};

/** Darkens a #RRGGBB hex color by a percentage (used for realistic envelope flap shading) */
const darkenHex = (hex: string, amount: number): string => {
  const clean = (hex || "").replace("#", "");
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const r = Math.max(0, Math.round(((num >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 255) * (1 - amount)));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

/** Rounds a px coordinate into the percentage coordinate space used by defaultTextLayers */
const toPercent = (value: number, total: number): number =>
  Math.round((value / total) * 10000) / 100;

/** Raw seed shape — the injected template configuration objects (verbatim designer schema) */
export interface ThanksgivingTemplateSeed {
  id: string;
  title: string;
  category: string;
  tier: 'free' | 'premium';
  tags?: string[];
  dimensions: { width: number; height: number };
  envelope: TemplateEnvelopeConfig;
  canvasBackground: TemplateCanvasBackground;
  stageBackdrop?: {
    type: 'color' | 'texture';
    value: string;
    color?: string;
    gradient?: string;
  };
  editableElements: EditableCanvasElement[];
}

/**
 * Normalizes a Thanksgiving seed into a full EviteTemplateSchema:
 * - `editableElements` (absolute px) → `defaultTextLayers` (percent) so every
 *   text block becomes an independent, interactive canvas node.
 * - `canvasBackground` → locked `card.artworkUrl` + `backdrop` stage surface.
 * - `envelope` spec keys → renderer keys (outerColor/flapColor/linerCss/...)
 */
export const buildEditableCanvasTemplate = (seed: ThanksgivingTemplateSeed): EviteTemplateSchema => {
  const { width, height } = seed.dimensions;
  const envelopeEnabled = seed.envelope.enabled !== false;
  const linerCss =
    THANKSGIVING_LINER_PATTERNS[seed.envelope.linerPattern || ""] ||
    (seed.envelope.linerPattern && seed.envelope.linerPattern.includes("gradient")
      ? seed.envelope.linerPattern
      : "");
  const outerColor = seed.envelope.envelopeColor || "#B89772";
  const isPremium = seed.tier === "premium";

  const defaultTextLayers = seed.editableElements.map((el) => ({
    id: el.id,
    key: EDITABLE_KEY_MAP[el.id] || el.id,
    text: el.content,
    fontFamily: el.fontFamily,
    fontSize: el.fontSize,
    color: el.color,
    fontWeight: (el.fontWeight ?? "400") as string | number,
    textAlign: el.textAlign,
    fontStyle: el.fontStyle,
    letterSpacing: el.letterSpacing,
    lineHeight: el.lineHeight,
    top: toPercent(el.y, height),
    left: toPercent(el.x, width),
    zIndex: el.zIndex ?? 12,
  }));

  const backdrop = seed.stageBackdrop || {
    type: "color" as const,
    value: seed.canvasBackground.color,
    color: seed.canvasBackground.color,
  };

  return {
    id: seed.id,
    title: seed.title,
    name: seed.title,
    category: seed.category,
    tags: seed.tags || ["Thanksgiving", "Autumn", "Fall", "All"],
    tier: seed.tier,
    isPremium,
    badge: isPremium ? "Premium" : "Free",
    dimensions: seed.dimensions,
    canvasBackground: seed.canvasBackground,
    editableElements: seed.editableElements,
    mockupUrl: `/assets/templates/${seed.id}-mockup.svg`,
    thumbnailUrl: `/assets/templates/${seed.id}-mockup.svg`,
    envelopeColor: outerColor,
    linerColor: seed.envelope.linerBorder || darkenHex(outerColor, 0.2),
    envelopeLiner: linerCss,
    backdrop: {
      type: backdrop.type,
      value: backdrop.value,
      color: backdrop.color || backdrop.value,
      gradient: backdrop.gradient,
    },
    envelope: {
      ...seed.envelope,
      outerColor,
      flapColor: seed.envelope.flapColor || darkenHex(outerColor, 0.14),
      linerCss,
      innerLiner: linerCss,
      linerColor: seed.envelope.linerBorder || darkenHex(outerColor, 0.2),
      linerPatternUrl: seed.envelope.linerPattern || "",
      shadowColor: "rgba(0,0,0,0.32)",
      isOpen: envelopeEnabled,
      isOpenUpward: true,
      flapStyle: "triangle",
      enabled: envelopeEnabled,
      position: seed.envelope.position || "left-angled-behind",
    },
    card: {
      artworkUrl: seed.canvasBackground.artworkUrl,
      decorativeBorderSvgUrl: seed.canvasBackground.artworkUrl,
      backgroundColor: seed.canvasBackground.color,
      aspectRatio: "5x7",
      border: "1px solid rgba(0,0,0,0.06)",
      cssConfig: {
        backgroundColor: seed.canvasBackground.color,
        borderRadius: "14px",
        paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)",
      },
    },
    innerCardLayer: {
      backgroundColor: seed.canvasBackground.color,
      borderRadius: "14px",
      paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)",
      aspectRatio: "5/7",
    },
    defaultTextLayers,
  } as EviteTemplateSchema;
};

// -----------------------------------------------------------------------------
// STANDARDIZED EVITE TEMPLATES REGISTRY (4-Layer Decoupled Architecture)
// -----------------------------------------------------------------------------
export const EVITE_TEMPLATES: EviteTemplateSchema[] = [
  {
    "id": "botanical-sketch-art",
    "title": "Botanical Sketch (Art)",
    "name": "Botanical Sketch (Art)",
    "category": "Workshop & Art",
    "badge": "Premium",
    "envelopeColor": "#CFC4B5",
    "linerColor": "#ECE4D8",
    "envelopeLiner": "linear-gradient(135deg, #DDD2C3 0%, #CFC4B5 100%)",
    "mockupUrl": "/assets/templates/botanical-sketch-art-mockup.svg",
    "thumbnailUrl": "/assets/templates/botanical-sketch-art-mockup.svg",
    "backdrop": {
      "type": "texture",
      "value": "/assets/backdrops/terrazzo.svg",
      "color": "#FAF8F5",
      "gradient": "url('/assets/backdrops/terrazzo.svg') center / cover no-repeat, linear-gradient(135deg, #FAF8F5 0%, #EDE9E1 100%)"
    },
    "envelope": {
      "outerColor": "#CFC4B5",
      "flapColor": "#DDD2C3",
      "linerPatternUrl": "",
      "linerColor": "#ECE4D8",
      "innerLiner": "linear-gradient(135deg, #DDD2C3 0%, #CFC4B5 100%)",
      "linerCss": "linear-gradient(135deg, #DDD2C3 0%, #CFC4B5 100%)",
      "isOpen": true,
      "isOpenUpward": true,
      "shadowColor": "rgba(0,0,0,0.28)"
    },
    "card": {
      "artworkUrl": "/assets/templates/botanical-sketch-art-bg.svg",
      "decorativeBorderSvgUrl": "/assets/templates/botanical-sketch-art-bg.svg",
      "backgroundColor": "#A3B899",
      "aspectRatio": "5x7",
      "border": "1px solid rgba(0,0,0,0.06)",
      "cssConfig": {
        "backgroundColor": "#A3B899",
        "borderRadius": "14px",
        "paperShadow": "0 14px 30px -6px rgba(0, 0, 0, 0.28)"
      }
    },
    "innerCardLayer": {
      "backgroundColor": "#A3B899",
      "borderRadius": "14px",
      "paperShadow": "0 14px 30px -6px rgba(0, 0, 0, 0.28)",
      "aspectRatio": "5/7"
    },
    "defaultTextLayers": [
      {
        "id": "layer-title",
        "key": "title",
        "text": "Botanical Illustration Workshop",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 20,
        "color": "#1C2D1A",
        "fontWeight": "600",
        "textAlign": "center",
        "top": 72,
        "left": 50
      },
      {
        "id": "layer-datetime",
        "key": "datetime",
        "text": "Artisans June 21 at 12 PM",
        "fontFamily": "'Inter', sans-serif",
        "fontSize": 12,
        "color": "#30442D",
        "fontWeight": "500",
        "textAlign": "center",
        "top": 86,
        "left": 50
      }
    ]
  },
  {
    "id": "tpl-chic-dinner-cake",
    "title": "Chic Dinner & Cake Celebration",
    "category": "Adult Birthday",
    "badge": "Premium",
    "envelopeColor": "#111111",
    "linerColor": "#D4AF37",
    "envelopeLiner": "linear-gradient(135deg, #D4AF37 0%, #FFF2A1 25%, #AA771C 50%, #FDF4B8 75%, #B8860B 100%)",
    "mockupUrl": "/assets/templates/chic-dinner-cake-mockup.svg",
    "thumbnailUrl": "/assets/templates/chic-dinner-cake-mockup.svg",
    "backdrop": {
      "type": "texture",
      "value": "/assets/backdrops/white-embossed-floral.svg",
      "color": "#FAF7F2",
      "gradient": "url('/assets/backdrops/white-embossed-floral.svg') center / cover no-repeat, linear-gradient(135deg, #FAF7F2 0%, #EDE6D8 100%)"
    },
    "envelope": {
      "outerColor": "#111111",
      "flapColor": "#111111",
      "linerPatternUrl": "gold-foil",
      "linerColor": "#D4AF37",
      "innerLiner": "linear-gradient(135deg, #D4AF37 0%, #FFF2A1 25%, #AA771C 50%, #FDF4B8 75%, #B8860B 100%)",
      "linerCss": "linear-gradient(135deg, #D4AF37 0%, #FFF2A1 25%, #AA771C 50%, #FDF4B8 75%, #B8860B 100%)",
      "isOpen": true,
      "isOpenUpward": true
    },
    "card": {
      "artworkUrl": "/assets/templates/chic-dinner-cake-bg.svg",
      "decorativeBorderSvgUrl": "/assets/templates/chic-dinner-cake-bg.svg",
      "borderIllustration": "/assets/templates/chic-dinner-cake-bg.svg",
      "backgroundColor": "#F4EFE6",
      "aspectRatio": "5x7",
      "cssConfig": {
        "backgroundColor": "#F4EFE6",
        "borderRadius": "12px",
        "paperShadow": "0 12px 28px -6px rgba(0,0,0,0.3)"
      }
    },
    "innerCardLayer": {
      "backgroundColor": "#F4EFE6",
      "borderRadius": "12px",
      "paperShadow": "0 12px 28px -6px rgba(0,0,0,0.3)",
      "aspectRatio": "5/7"
    },
    "defaultTextLayers": [
      {
        "id": "layer-header",
        "key": "header",
        "text": "Let's celebrate",
        "fontFamily": "'Great Vibes', cursive",
        "fontSize": 24,
        "color": "#1A1A1A",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 18,
        "left": 50
      },
      {
        "id": "layer-title",
        "key": "title",
        "text": "LAURA'S 30TH BIRTHDAY",
        "fontFamily": "'Cinzel', serif",
        "fontSize": 22,
        "letterSpacing": 2,
        "color": "#1A1A1A",
        "fontWeight": "700",
        "textAlign": "center",
        "top": 28,
        "left": 50
      },
      {
        "id": "layer-details",
        "key": "details",
        "text": "AUGUST 31ST AT 7 PM\nOUR PLACE",
        "fontFamily": "'Inter', sans-serif",
        "fontSize": 12,
        "letterSpacing": 1.5,
        "lineHeight": 1.6,
        "color": "#1A1A1A",
        "fontWeight": "500",
        "textAlign": "center",
        "top": 38,
        "left": 50
      }
    ]
  },
  {
    "id": "tpl-modern-gold-black-balloon",
    "title": "Modern Gold & Black Balloon Bash",
    "category": "Adult Birthday",
    "badge": "Premium",
    "envelopeColor": "#111111",
    "linerColor": "#D4AF37",
    "envelopeLiner": "linear-gradient(135deg, #D4AF37 0%, #FFF2A1 25%, #AA771C 50%, #FDF4B8 75%, #B8860B 100%)",
    "mockupUrl": "/assets/templates/modern-gold-black-balloon-mockup.svg",
    "thumbnailUrl": "/assets/templates/modern-gold-black-balloon-mockup.svg",
    "backdrop": {
      "type": "texture",
      "value": "/assets/backdrops/subtle-white-marble.svg",
      "color": "#F8F9FA",
      "gradient": "url('/assets/backdrops/subtle-white-marble.svg') center / cover no-repeat, linear-gradient(135deg, #F8F9FA 0%, #EAECEF 100%)"
    },
    "envelope": {
      "outerColor": "#111111",
      "flapColor": "#111111",
      "linerPatternUrl": "gold-foil",
      "linerColor": "#D4AF37",
      "innerLiner": "linear-gradient(135deg, #D4AF37 0%, #FFF2A1 25%, #AA771C 50%, #FDF4B8 75%, #B8860B 100%)",
      "linerCss": "linear-gradient(135deg, #D4AF37 0%, #FFF2A1 25%, #AA771C 50%, #FDF4B8 75%, #B8860B 100%)",
      "isOpen": true,
      "isOpenUpward": true
    },
    "card": {
      "artworkUrl": "/assets/templates/modern-gold-black-balloon-bg.svg",
      "decorativeBorderSvgUrl": "/assets/templates/modern-gold-black-balloon-bg.svg",
      "borderIllustration": "/assets/templates/modern-gold-black-balloon-bg.svg",
      "backgroundColor": "#FAFAFA",
      "aspectRatio": "5x7",
      "cssConfig": {
        "backgroundColor": "#FAFAFA",
        "borderRadius": "12px",
        "paperShadow": "0 12px 28px -6px rgba(0,0,0,0.3)"
      }
    },
    "innerCardLayer": {
      "backgroundColor": "#FAFAFA",
      "borderRadius": "12px",
      "paperShadow": "0 12px 28px -6px rgba(0,0,0,0.3)",
      "aspectRatio": "5/7"
    },
    "defaultTextLayers": [
      {
        "id": "layer-heading",
        "key": "heading",
        "text": "let's party",
        "fontFamily": "'Alex Brush', cursive",
        "fontSize": 38,
        "color": "#111111",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 22,
        "left": 55
      },
      {
        "id": "layer-intro",
        "key": "intro",
        "text": "PLEASE JOIN US TO CELEBRATE",
        "fontFamily": "'Inter', sans-serif",
        "fontSize": 11,
        "letterSpacing": 2,
        "color": "#555555",
        "fontWeight": "600",
        "textAlign": "center",
        "top": 33,
        "left": 55
      },
      {
        "id": "layer-title",
        "key": "title",
        "text": "MORGAN ANDERSON",
        "fontFamily": "'Playfair Display', serif",
        "fontSize": 20,
        "letterSpacing": 1.5,
        "color": "#111111",
        "fontWeight": "700",
        "textAlign": "center",
        "top": 43,
        "left": 55
      },
      {
        "id": "layer-datetime",
        "key": "datetime",
        "text": "SATURDAY, JUNE 24 AT 6 PM\nWILLOW TERRACE",
        "fontFamily": "'Inter', sans-serif",
        "fontSize": 11,
        "letterSpacing": 1.5,
        "lineHeight": 1.6,
        "color": "#333333",
        "fontWeight": "500",
        "textAlign": "center",
        "top": 54,
        "left": 55
      }
    ]
  },
  {
    "id": "tpl-abstract-nature-party",
    "title": "Abstract Nature Party",
    "category": "Wedding",
    "mockupUrl": "/assets/templates/abstract-nature-party-mockup.svg",
    "thumbnailUrl": "/assets/templates/abstract-nature-party-mockup.svg",
    "backdrop": {
      "type": "color",
      "value": "linear-gradient(135deg, #F9F5EE 0%, #EFE7DA 100%)",
      "color": "#F9F5EE",
      "gradient": "linear-gradient(135deg, #F9F5EE 0%, #EFE7DA 100%)"
    },
    "envelope": {
      "outerColor": "#3F5E3D",
      "flapColor": "#2f482d",
      "linerPatternUrl": "",
      "linerCss": "",
      "isOpen": true
    },
    "card": {
      "artworkUrl": "/assets/templates/abstract-nature-party-bg.svg",
      "decorativeBorderSvgUrl": "/assets/templates/abstract-nature-party-bg.svg",
      "backgroundColor": "#FAF3E8",
      "aspectRatio": "5x7"
    },
    "defaultTextLayers": [
      {
        "id": "layer-intro",
        "key": "intro",
        "text": "Please join us to celebrate\nthe marriage ceremony of",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 13,
        "color": "#4A433A",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 28,
        "left": 50
      },
      {
        "id": "layer-title",
        "key": "title",
        "text": "Brittany Moore\n&\nDaniel Rodriguez",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 24,
        "color": "#992847",
        "fontWeight": "600",
        "textAlign": "center",
        "top": 43,
        "left": 50
      },
      {
        "id": "layer-datetime",
        "key": "datetime",
        "text": "Saturday, June 30 at 1 PM",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 13,
        "color": "#4A433A",
        "fontWeight": "500",
        "textAlign": "center",
        "top": 58,
        "left": 50
      },
      {
        "id": "layer-venue",
        "key": "venue",
        "text": "The Rose Garden\n45 Mountain View Rd. Denver, CO",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 12,
        "color": "#5C5348",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 68,
        "left": 50
      }
    ]
  },
  {
    "id": "tpl-bright-blooms-garden",
    "title": "Bright Blooms Garden",
    "category": "Wedding",
    "mockupUrl": "/assets/templates/bright-blooms-garden-mockup.svg",
    "thumbnailUrl": "/assets/templates/bright-blooms-garden-mockup.svg",
    "backdrop": {
      "type": "color",
      "value": "linear-gradient(135deg, #F8F9FA 0%, #EEF1F5 100%)",
      "color": "#F8F9FA",
      "gradient": "linear-gradient(135deg, #F8F9FA 0%, #EEF1F5 100%)"
    },
    "envelope": {
      "outerColor": "#FA835B",
      "linerPatternUrl": "purple-stripes",
      "linerCss": "repeating-linear-gradient(90deg, #845EC2 0px, #845EC2 8px, #FFFFFF 8px, #FFFFFF 16px)",
      "isOpen": true
    },
    "card": {
      "artworkUrl": "/assets/templates/bright-blooms-garden-bg.svg",
      "decorativeBorderSvgUrl": "/assets/templates/bright-blooms-garden-bg.svg",
      "backgroundColor": "#FFFFFF",
      "aspectRatio": "5x7"
    },
    "defaultTextLayers": [
      {
        "id": "layer-intro",
        "key": "intro",
        "text": "PLEASE JOIN US TO CELEBRATE\nTHE WEDDING OF",
        "fontFamily": "'Inter', sans-serif",
        "fontSize": 11,
        "letterSpacing": 2,
        "color": "#6B7280",
        "fontWeight": "600",
        "textAlign": "left",
        "top": 22,
        "left": 38
      },
      {
        "id": "layer-title",
        "key": "title",
        "text": "Peyton Barnes\n&\nAnthony Woods",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 26,
        "color": "#262626",
        "fontWeight": "600",
        "textAlign": "left",
        "top": 38,
        "left": 38
      },
      {
        "id": "layer-datetime",
        "key": "datetime",
        "text": "SATURDAY, JUNE 4, 2026 AT 4 PM",
        "fontFamily": "'Inter', sans-serif",
        "fontSize": 10,
        "letterSpacing": 1.5,
        "color": "#525252",
        "fontWeight": "500",
        "textAlign": "left",
        "top": 52,
        "left": 38
      },
      {
        "id": "layer-venue",
        "key": "venue",
        "text": "WILDWOOD ESTATE\n45 MOUNTAIN VIEW RD.\nDENVER, CO",
        "fontFamily": "'Inter', sans-serif",
        "fontSize": 10,
        "letterSpacing": 1.2,
        "color": "#737373",
        "fontWeight": "400",
        "textAlign": "left",
        "top": 62,
        "left": 38
      }
    ]
  },
  {
    "id": "tpl-vibrant-blooms-wedding",
    "title": "Vibrant Blooms Wedding",
    "category": "Wedding",
    "mockupUrl": "/assets/templates/vibrant-blooms-wedding-mockup.svg",
    "thumbnailUrl": "/assets/templates/vibrant-blooms-wedding-mockup.svg",
    "backdrop": {
      "type": "color",
      "value": "linear-gradient(135deg, #FBF2E8 0%, #F5DEC7 100%)",
      "color": "#FBF2E8",
      "gradient": "linear-gradient(135deg, #FBF2E8 0%, #F5DEC7 100%)"
    },
    "envelope": {
      "outerColor": "#E67E17",
      "linerPatternUrl": "poppy-liner",
      "linerCss": "repeating-linear-gradient(45deg, #D91B24 0px, #D91B24 10px, #FFF5DF 10px, #FFF5DF 20px)",
      "isOpen": true
    },
    "card": {
      "artworkUrl": "/assets/templates/vibrant-blooms-wedding-bg.svg",
      "decorativeBorderSvgUrl": "/assets/templates/vibrant-blooms-wedding-bg.svg",
      "backgroundColor": "#E67E17",
      "aspectRatio": "5x7"
    },
    "defaultTextLayers": [
      {
        "id": "layer-title",
        "key": "title",
        "text": "Emily Taylor\n&\nJoseph Lee",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 22,
        "color": "#2C241E",
        "fontWeight": "600",
        "textAlign": "center",
        "top": 35,
        "left": 50
      },
      {
        "id": "layer-subtitle",
        "key": "subtitle",
        "text": "invite you to\ncelebrate their wedding",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 12,
        "color": "#5C4A3E",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 48,
        "left": 50
      },
      {
        "id": "layer-datetime",
        "key": "datetime",
        "text": "Saturday, the sixth of August\ntwo thousand and twenty-seven\nat six o'clock in the evening",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 11,
        "color": "#4A3C31",
        "fontWeight": "500",
        "textAlign": "center",
        "top": 60,
        "left": 50
      },
      {
        "id": "layer-venue",
        "key": "venue",
        "text": "Wildwood Gardens\nSan Francisco, CA",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 11,
        "color": "#5C4A3E",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 72,
        "left": 50
      }
    ]
  },
  {
    "id": "tpl-lily-of-the-valley",
    "title": "Lily of the Valley",
    "category": "Wedding",
    "mockupUrl": "/assets/templates/lily-of-the-valley-mockup.svg",
    "thumbnailUrl": "/assets/templates/lily-of-the-valley-mockup.svg",
    "backdrop": {
      "type": "color",
      "value": "linear-gradient(135deg, #F8F5ED 0%, #EDE7D8 100%)",
      "color": "#F8F5ED",
      "gradient": "linear-gradient(135deg, #F8F5ED 0%, #EDE7D8 100%)"
    },
    "envelope": {
      "outerColor": "#5A6F4E",
      "linerPatternUrl": "craspedia-stripes",
      "linerCss": "repeating-linear-gradient(90deg, #E5B232 0px, #E5B232 8px, #F7F3E7 8px, #F7F3E7 16px)",
      "isOpen": true
    },
    "card": {
      "artworkUrl": "/assets/templates/lily-of-the-valley-bg.svg",
      "decorativeBorderSvgUrl": "/assets/templates/lily-of-the-valley-bg.svg",
      "backgroundColor": "#F7F3E7",
      "aspectRatio": "5x7"
    },
    "defaultTextLayers": [
      {
        "id": "layer-intro",
        "key": "intro",
        "text": "Please join us for the wedding of",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 13,
        "color": "#54483C",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 30,
        "left": 50
      },
      {
        "id": "layer-title",
        "key": "title",
        "text": "Brianna Davis\nand\nThomas Brown",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 24,
        "color": "#2E251E",
        "fontWeight": "600",
        "textAlign": "center",
        "top": 44,
        "left": 50
      },
      {
        "id": "layer-datetime",
        "key": "datetime",
        "text": "Saturday, June 15 at 4 PM",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 12,
        "color": "#54483C",
        "fontWeight": "500",
        "textAlign": "center",
        "top": 58,
        "left": 50
      },
      {
        "id": "layer-venue",
        "key": "venue",
        "text": "The Rose Garden\n45 Mountain View Rd.",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 11,
        "color": "#6B5C4D",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 68,
        "left": 50
      }
    ]
  },
  {
    "id": "tpl-gold-ribbons-confetti",
    "title": "Gold Ribbons & Confetti",
    "category": "Birthday",
    "mockupUrl": "/assets/templates/gold-ribbons-confetti-mockup.svg",
    "thumbnailUrl": "/assets/templates/gold-ribbons-confetti-mockup.svg",
    "backdrop": {
      "type": "color",
      "value": "linear-gradient(135deg, #F6F6F6 0%, #E8E8E8 100%)",
      "color": "#F6F6F6",
      "gradient": "linear-gradient(135deg, #F6F6F6 0%, #E8E8E8 100%)"
    },
    "envelope": {
      "outerColor": "#1A1A1A",
      "linerPatternUrl": "gold-foil",
      "linerCss": "repeating-linear-gradient(45deg, #D4AF37 0px, #D4AF37 10px, #1A1A1A 10px, #1A1A1A 20px)",
      "isOpen": true
    },
    "card": {
      "artworkUrl": "/assets/templates/gold-ribbons-confetti-bg.svg",
      "decorativeBorderSvgUrl": "/assets/templates/gold-ribbons-confetti-bg.svg",
      "backgroundColor": "#FFFFFF",
      "aspectRatio": "5x7"
    },
    "defaultTextLayers": [
      {
        "id": "layer-headline",
        "key": "headline",
        "text": "DAVE IS TURNING",
        "fontFamily": "'Inter', sans-serif",
        "fontSize": 18,
        "letterSpacing": 2,
        "color": "#1A1A1A",
        "fontWeight": "800",
        "textAlign": "center",
        "top": 30,
        "left": 50
      },
      {
        "id": "layer-title",
        "key": "title",
        "text": "50",
        "fontFamily": "'Inter', sans-serif",
        "fontSize": 48,
        "color": "#1A1A1A",
        "fontWeight": "900",
        "textAlign": "center",
        "top": 43,
        "left": 50
      },
      {
        "id": "layer-subtitle",
        "key": "subtitle",
        "text": "Please join us to celebrate!",
        "fontFamily": "'Inter', sans-serif",
        "fontSize": 12,
        "color": "#555555",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 54,
        "left": 50
      },
      {
        "id": "layer-datetime",
        "key": "datetime",
        "text": "Saturday, August 10 at 2 PM",
        "fontFamily": "'Inter', sans-serif",
        "fontSize": 13,
        "color": "#222222",
        "fontWeight": "600",
        "textAlign": "center",
        "top": 62,
        "left": 50
      },
      {
        "id": "layer-venue",
        "key": "venue",
        "text": "Downtown Pub\n457 Lakeview Rd.",
        "fontFamily": "'Inter', sans-serif",
        "fontSize": 11,
        "color": "#666666",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 72,
        "left": 50
      }
    ]
  },
  {
    "id": "tpl-sparkle-balloons",
    "title": "Sparkle Balloons",
    "category": "Birthday",
    "mockupUrl": "/assets/templates/sparkle-balloons-mockup.svg",
    "thumbnailUrl": "/assets/templates/sparkle-balloons-mockup.svg",
    "backdrop": {
      "type": "color",
      "value": "linear-gradient(135deg, #F5F2EA 0%, #E8E3D7 100%)",
      "color": "#F5F2EA",
      "gradient": "linear-gradient(135deg, #F5F2EA 0%, #E8E3D7 100%)"
    },
    "envelope": {
      "outerColor": "#26252B",
      "linerPatternUrl": "gold-stars",
      "linerCss": "repeating-linear-gradient(135deg, #E8C36A 0px, #E8C36A 12px, #EDE9DF 12px, #EDE9DF 24px)",
      "isOpen": true
    },
    "card": {
      "artworkUrl": "/assets/templates/sparkle-balloons-bg.svg",
      "decorativeBorderSvgUrl": "/assets/templates/sparkle-balloons-bg.svg",
      "backgroundColor": "#EDE9DF",
      "aspectRatio": "5x7"
    },
    "defaultTextLayers": [
      {
        "id": "layer-intro",
        "key": "intro",
        "text": "Join us for",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 14,
        "color": "#4A4A4A",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 38,
        "left": 50
      },
      {
        "id": "layer-title",
        "key": "title",
        "text": "APRIL'S BIRTHDAY!",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 24,
        "letterSpacing": 1.5,
        "color": "#1E1E1E",
        "fontWeight": "700",
        "textAlign": "center",
        "top": 48,
        "left": 50
      },
      {
        "id": "layer-datetime",
        "key": "datetime",
        "text": "Sunday, May 7th at 1 PM",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 12,
        "color": "#4A4A4A",
        "fontWeight": "500",
        "textAlign": "center",
        "top": 58,
        "left": 50
      },
      {
        "id": "layer-venue",
        "key": "venue",
        "text": "The Blais' Backyard\n8739 Shorecrest Drive",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 11,
        "color": "#5C5C5C",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 68,
        "left": 50
      }
    ]
  },
  {
    "id": "tpl-celestial-flora",
    "title": "Celestial Flora",
    "category": "Birthday",
    "mockupUrl": "/assets/templates/celestial-flora-mockup.svg",
    "thumbnailUrl": "/assets/templates/celestial-flora-mockup.svg",
    "backdrop": {
      "type": "color",
      "value": "linear-gradient(135deg, #FCF8F0 0%, #F5EDE0 100%)",
      "color": "#FCF8F0",
      "gradient": "linear-gradient(135deg, #FCF8F0 0%, #F5EDE0 100%)"
    },
    "envelope": {
      "outerColor": "#DE6B35",
      "linerPatternUrl": "sun-liner",
      "linerCss": "repeating-linear-gradient(45deg, #F5B842 0px, #F5B842 10px, #FAF7EF 10px, #FAF7EF 20px)",
      "isOpen": true
    },
    "card": {
      "artworkUrl": "/assets/templates/celestial-flora-bg.svg",
      "decorativeBorderSvgUrl": "/assets/templates/celestial-flora-bg.svg",
      "backgroundColor": "#FAF7EF",
      "aspectRatio": "5x7"
    },
    "defaultTextLayers": [
      {
        "id": "layer-intro",
        "key": "intro",
        "text": "Let's celebrate",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 13,
        "color": "#594D42",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 28,
        "left": 50
      },
      {
        "id": "layer-title",
        "key": "title",
        "text": "Another Trip\nAround\nThe Sun",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 26,
        "color": "#4B5E3C",
        "fontWeight": "700",
        "textAlign": "center",
        "top": 42,
        "left": 50
      },
      {
        "id": "layer-name",
        "key": "name",
        "text": "Aria Thompson",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 16,
        "color": "#B85B32",
        "fontWeight": "600",
        "textAlign": "center",
        "top": 58,
        "left": 50
      },
      {
        "id": "layer-datetime",
        "key": "datetime",
        "text": "Saturday, May 15 at 2 PM",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 12,
        "color": "#594D42",
        "fontWeight": "500",
        "textAlign": "center",
        "top": 66,
        "left": 50
      },
      {
        "id": "layer-venue",
        "key": "venue",
        "text": "412 Sunset Lane",
        "fontFamily": "'Playfair Display', Georgia, serif",
        "fontSize": 11,
        "color": "#6B5E52",
        "fontWeight": "400",
        "textAlign": "center",
        "top": 74,
        "left": 50
      }
    ]
  },
  // 1. Blush & Burgundy Blooms
  {
    id: "blush-burgundy-blooms",
    title: "Blush & Burgundy Blooms",
    category: "bridal_shower",
    badge: "Premium",
    envelopeColor: "#722F37",
    linerColor: "#FAE8EC",
    envelopeLiner: "/templates/envelopes/blush-gold-foil-liner.svg",
    mockupUrl: "/assets/templates/blush-burgundy-blooms-mockup.svg",
    thumbnailUrl: "/assets/templates/blush-burgundy-blooms-mockup.svg",
    backdrop: {
      type: "texture",
      value: "/assets/backdrops/off-white-linen.svg",
      color: "#FAF7F2",
      gradient: "url('/assets/backdrops/off-white-linen.svg') center / cover no-repeat, linear-gradient(135deg, #FAF7F2 0%, #F5EFEB 100%)"
    },
    envelope: {
      outerColor: "#722F37", // Deep burgundy / wine red (#722F37)
      flapColor: "#722F37",
      flapStyle: "triangle",
      isOpenUpward: true,
      innerLiner: "/templates/envelopes/blush-gold-foil-liner.svg", // Soft blush pink with subtle golden foil floral line-art or shimmer
      linerPatternUrl: "/templates/envelopes/blush-gold-foil-liner.svg",
      linerPattern: "/templates/envelopes/blush-gold-foil-liner.svg",
      linerCss: "url('/templates/envelopes/blush-gold-foil-liner.svg') center / cover no-repeat",
      linerColor: "#FAE8EC",
      shadowColor: "rgba(0, 0, 0, 0.28)",
      isOpen: true
    },
    card: {
      backgroundColor: "#FFFFFF",
      safeArea: { top: "20%", bottom: "16%", left: "22%", right: "22%" },
      borderIllustration: "/templates/bridal/blush-burgundy-frame.png",
      artworkUrl: "/templates/bridal/blush-burgundy-frame.png",
      decorativeBorderSvgUrl: "/templates/bridal/blush-burgundy-frame.png",
      aspectRatio: "5x7",
      cssConfig: {
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)",
      aspectRatio: "5/7"
    },
    defaultTextBlocks: [
      {
        id: "subtitle",
        text: "Something\nold...something new...\nsomething borrowed...\nsomething red and\npink too",
        fontFamily: "Playfair Display, Georgia, serif",
        fontSize: 15,
        lineHeight: 1.45,
        fontStyle: "italic",
        color: "#5A4A42",
        align: "center",
        position: { top: "45%", left: "50%", transform: "translate(-50%, -50%)" },
        maxHeight: "140px",
      },
      {
        id: "title-name",
        text: "taylor madison",
        fontFamily: "Great Vibes, Alex Brush, cursive",
        fontSize: 38,
        lineHeight: 1.15,
        color: "#722F37",
        align: "center",
        position: { top: "62%", left: "50%", transform: "translate(-50%, -50%)" },
        maxHeight: "80px",
      },
      {
        id: "details",
        text: "Sunday, April 3rd at 1 pm\nThe Rosewood Cafe",
        fontFamily: "Playfair Display, Georgia, serif",
        fontSize: 13,
        lineHeight: 1.5,
        fontStyle: "italic",
        color: "#5A4A42",
        align: "center",
        position: { top: "74%", left: "50%", transform: "translate(-50%, -50%)" },
        maxHeight: "60px",
      }
    ],
    defaultTextLayers: [
      {
        id: "subtitle",
        key: "subtitle",
        text: "Something\nold...something new...\nsomething borrowed...\nsomething red and\npink too",
        fontFamily: "Playfair Display, Georgia, serif",
        fontSize: 15,
        lineHeight: 1.45,
        fontStyle: "italic",
        color: "#5A4A42",
        fontWeight: "400",
        textAlign: "center",
        top: 45,
        left: 50,
      },
      {
        id: "title-name",
        key: "title",
        text: "taylor madison",
        fontFamily: "Great Vibes, Alex Brush, cursive",
        fontSize: 38,
        lineHeight: 1.15,
        color: "#722F37",
        fontWeight: "600",
        textAlign: "center",
        top: 62,
        left: 50,
      },
      {
        id: "details",
        key: "datetime",
        text: "Sunday, April 3rd at 1 pm\nThe Rosewood Cafe",
        fontFamily: "Playfair Display, Georgia, serif",
        fontSize: 13,
        lineHeight: 1.5,
        fontStyle: "italic",
        color: "#5A4A42",
        fontWeight: "400",
        textAlign: "center",
        top: 74,
        left: 50,
      }
    ]
  },
  // 2. Something Blue
  {
    id: "something-blue",
    title: "Something Blue",
    category: "bridal_shower",
    badge: "Premium",
    envelopeColor: "#5B7C99",
    linerColor: "#FFFFFF",
    envelopeLiner: "/templates/envelopes/something-blue-toile-liner.svg",
    mockupUrl: "/assets/templates/something-blue-mockup.svg",
    thumbnailUrl: "/assets/templates/something-blue-mockup.svg",
    backdrop: {
      type: "texture",
      value: "/assets/backdrops/subtle-white-marble.svg",
      color: "#F8F9FA",
      gradient: "url('/assets/backdrops/subtle-white-marble.svg') center / cover no-repeat, linear-gradient(135deg, #F8F9FA 0%, #EAECEF 100%)"
    },
    envelope: {
      outerColor: "#5B7C99", // Dusty slate blue / french blue (#5B7C99)
      flapColor: "#5B7C99",
      flapStyle: "triangle",
      isOpenUpward: true,
      innerLiner: "/templates/envelopes/something-blue-toile-liner.svg", // Classic delicate blue-and-white botanical toile
      linerPatternUrl: "/templates/envelopes/something-blue-toile-liner.svg",
      linerPattern: "/templates/envelopes/something-blue-toile-liner.svg",
      linerCss: "url('/templates/envelopes/something-blue-toile-liner.svg') center / cover no-repeat",
      linerColor: "#FFFFFF",
      shadowColor: "rgba(0, 0, 0, 0.22)",
      isOpen: true
    },
    card: {
      backgroundColor: "#FFFFFF",
      safeArea: { top: "18%", bottom: "15%", left: "20%", right: "20%" },
      borderIllustration: "/templates/bridal/something-blue-frame.png",
      artworkUrl: "/templates/bridal/something-blue-frame.png",
      decorativeBorderSvgUrl: "/templates/bridal/something-blue-frame.png",
      aspectRatio: "5x7",
      cssConfig: {
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)",
      aspectRatio: "5/7"
    },
    defaultTextBlocks: [
      {
        id: "title-ribbon",
        text: "Something Blue\nBEFORE \"I DO\"",
        fontFamily: "Cormorant Garamond, serif",
        fontSize: 24,
        lineHeight: 1.25,
        letterSpacing: "2px",
        color: "#355B82",
        align: "center",
        position: { top: "44%", left: "50%", transform: "translate(-50%, -50%)" },
      },
      {
        id: "subtitle",
        text: "Please join us for a bridal shower honoring",
        fontFamily: "Montserrat, sans-serif",
        fontSize: 11,
        lineHeight: 1.4,
        color: "#5C768D",
        align: "center",
        position: { top: "54%", left: "50%", transform: "translate(-50%, -50%)" },
      },
      {
        id: "title-name",
        text: "Andrea Ross",
        fontFamily: "Great Vibes, cursive",
        fontSize: 38,
        lineHeight: 1.2,
        color: "#2D5175",
        align: "center",
        position: { top: "62%", left: "50%", transform: "translate(-50%, -50%)" },
      },
      {
        id: "details",
        text: "Saturday, May 14th at 2 pm\nThe Glasshouse",
        fontFamily: "Montserrat, sans-serif",
        fontSize: 12,
        lineHeight: 1.5,
        color: "#5C768D",
        align: "center",
        position: { top: "72%", left: "50%", transform: "translate(-50%, -50%)" },
      }
    ],
    defaultTextLayers: [
      {
        id: "title-ribbon",
        key: "headline",
        text: "Something Blue\nBEFORE \"I DO\"",
        fontFamily: "Cormorant Garamond, serif",
        fontSize: 24,
        lineHeight: 1.25,
        letterSpacing: 2,
        color: "#355B82",
        fontWeight: "600",
        textAlign: "center",
        top: 44,
        left: 50,
      },
      {
        id: "subtitle",
        key: "subtitle",
        text: "Please join us for a bridal shower honoring",
        fontFamily: "Montserrat, sans-serif",
        fontSize: 11,
        lineHeight: 1.4,
        color: "#5C768D",
        fontWeight: "400",
        textAlign: "center",
        top: 54,
        left: 50,
      },
      {
        id: "title-name",
        key: "title",
        text: "Andrea Ross",
        fontFamily: "Great Vibes, cursive",
        fontSize: 38,
        lineHeight: 1.2,
        color: "#2D5175",
        fontWeight: "600",
        textAlign: "center",
        top: 62,
        left: 50,
      },
      {
        id: "details",
        key: "datetime",
        text: "Saturday, May 14th at 2 pm\nThe Glasshouse",
        fontFamily: "Montserrat, sans-serif",
        fontSize: 12,
        lineHeight: 1.5,
        color: "#5C768D",
        fontWeight: "400",
        textAlign: "center",
        top: 72,
        left: 50,
      }
    ]
  },
  // 3. Autumn Blooms
  {
    id: "autumn-blooms",
    title: "Autumn Blooms",
    category: "bridal_shower",
    badge: "Premium",
    envelopeColor: "#B3673B",
    linerColor: "#F8EFE4",
    envelopeLiner: "/templates/envelopes/autumn-gingham-liner.png",
    mockupUrl: "/assets/templates/autumn-blooms-mockup.svg",
    thumbnailUrl: "/assets/templates/autumn-blooms-mockup.svg",
    backdrop: {
      type: "texture",
      value: "/assets/backdrops/warm-artisan-kraft.svg",
      color: "#CDBAA6",
      gradient: "url('/assets/backdrops/warm-artisan-kraft.svg') center / cover no-repeat, linear-gradient(135deg, #D4C2AE 0%, #C3AF9B 100%)"
    },
    envelope: {
      outerColor: "#B3673B", // Warm terracotta / camel brown (#B3673B)
      flapColor: "#B3673B",
      flapStyle: "triangle",
      isOpenUpward: true,
      innerLiner: "/templates/envelopes/autumn-gingham-liner.png", // Warm beige & brown buffalo/gingham plaid check
      linerPatternUrl: "/templates/envelopes/autumn-gingham-liner.png",
      linerPattern: "/templates/envelopes/autumn-gingham-liner.png",
      linerCss: "url('/templates/envelopes/autumn-gingham-liner.png') center / 150px repeat",
      linerColor: "#F8EFE4",
      shadowColor: "rgba(0, 0, 0, 0.25)",
      isOpen: true
    },
    card: {
      backgroundColor: "#FCFAF6",
      safeArea: { top: "18%", bottom: "22%", left: "20%", right: "20%" },
      borderIllustration: "/templates/bridal/autumn-blooms-frame.png",
      artworkUrl: "/templates/bridal/autumn-blooms-frame.png",
      decorativeBorderSvgUrl: "/templates/bridal/autumn-blooms-frame.png",
      aspectRatio: "5x7",
      cssConfig: {
        backgroundColor: "#FCFAF6",
        borderRadius: "12px",
        paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#FCFAF6",
      borderRadius: "12px",
      paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)",
      aspectRatio: "5/7"
    },
    defaultTextBlocks: [
      {
        id: "subtitle",
        text: "Fall in love",
        fontFamily: "Great Vibes, cursive",
        fontSize: 34,
        color: "#B3673B",
        align: "center",
        position: { top: "45%", left: "50%", transform: "translate(-50%, -50%)" },
      },
      {
        id: "title-name",
        text: "JENNIFER\nHAYWARD",
        fontFamily: "Cinzel, Cormorant Garamond, serif",
        fontSize: 20,
        letterSpacing: "3px",
        lineHeight: 1.3,
        color: "#6D4427",
        align: "center",
        position: { top: "56%", left: "50%", transform: "translate(-50%, -50%)" },
      },
      {
        id: "details",
        text: "OCTOBER 15TH AT 4:00 PM\nOAK GROVE ESTATE",
        fontFamily: "Montserrat, sans-serif",
        fontSize: 11,
        lineHeight: 1.6,
        letterSpacing: "1.5px",
        color: "#8B6B55",
        align: "center",
        position: { top: "67%", left: "50%", transform: "translate(-50%, -50%)" },
      }
    ],
    defaultTextLayers: [
      {
        id: "subtitle",
        key: "subtitle",
        text: "Fall in love",
        fontFamily: "Great Vibes, cursive",
        fontSize: 34,
        color: "#B3673B",
        fontWeight: "400",
        textAlign: "center",
        top: 45,
        left: 50,
      },
      {
        id: "title-name",
        key: "title",
        text: "JENNIFER\nHAYWARD",
        fontFamily: "Cinzel, Cormorant Garamond, serif",
        fontSize: 20,
        letterSpacing: 3,
        lineHeight: 1.3,
        color: "#6D4427",
        fontWeight: "600",
        textAlign: "center",
        top: 56,
        left: 50,
      },
      {
        id: "details",
        key: "datetime",
        text: "OCTOBER 15TH AT 4:00 PM\nOAK GROVE ESTATE",
        fontFamily: "Montserrat, sans-serif",
        fontSize: 11,
        lineHeight: 1.6,
        letterSpacing: 1.5,
        color: "#8B6B55",
        fontWeight: "400",
        textAlign: "center",
        top: 67,
        left: 50,
      }
    ]
  },
  {
    id: "o-tannenbaum",
    title: "O Tannenbaum",
    name: "O Tannenbaum",
    category: "Holiday",
    badge: "Premium",
    envelopeColor: "#DACFBC",
    linerColor: "#D4AF37",
    envelopeLiner: "linear-gradient(135deg, #A67C1E 0%, #D4AF37 25%, #FFF2A1 50%, #D4AF37 75%, #8E6516 100%)",
    mockupUrl: "/assets/templates/o-tannenbaum-mockup.svg",
    thumbnailUrl: "/assets/templates/o-tannenbaum-mockup.svg",
    backdrop: {
      type: "texture",
      value: "linear-gradient(135deg, #FAF7F2 0%, #F4EFE6 50%, #EAE3D6 100%)",
      color: "#FAF7F2",
      gradient: "linear-gradient(135deg, #FAF7F2 0%, #F4EFE6 50%, #EAE3D6 100%)"
    },
    envelope: {
      outerColor: "#DACFBC",
      flapColor: "#DACFBC",
      linerPatternUrl: "",
      linerColor: "#D4AF37",
      innerLiner: "linear-gradient(135deg, #A67C1E 0%, #D4AF37 25%, #FFF2A1 50%, #D4AF37 75%, #8E6516 100%)",
      linerCss: "linear-gradient(135deg, #A67C1E 0%, #D4AF37 25%, #FFF2A1 50%, #D4AF37 75%, #8E6516 100%)",
      isOpen: true,
      isOpenUpward: false,
      shadowColor: "rgba(0,0,0,0.28)",
      position: "left"
    } as any,
    card: {
      artworkUrl: "/assets/templates/o-tannenbaum-bg.svg",
      borderIllustration: "/assets/templates/o-tannenbaum-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/o-tannenbaum-bg.svg",
      backgroundColor: "#1C1F1E",
      aspectRatio: "5x7",
      border: "1px solid rgba(255,255,255,0.08)",
      cssConfig: {
        backgroundColor: "#1C1F1E",
        borderRadius: "14px",
        paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.35)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#1C1F1E",
      borderRadius: "14px",
      paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.35)",
      aspectRatio: "5/7"
    },
    defaultTextLayers: [
      {
        id: "ot-title",
        key: "title",
        text: "Holiday Party",
        fontFamily: "'Great Vibes', cursive",
        fontSize: 38,
        color: "#F6F4ED",
        fontWeight: "400",
        textAlign: "center",
        top: 30,
        left: 64
      },
      {
        id: "ot-subtitle",
        key: "subtitle",
        text: "Join us for light bites & good times",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 12,
        color: "#CDC9BC",
        fontWeight: "400",
        textAlign: "center",
        top: 48,
        left: 64
      },
      {
        id: "ot-datetime",
        key: "datetime",
        text: "Saturday, December 16\nat 7 PM",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 12,
        color: "#E2DDD2",
        fontWeight: "500",
        textAlign: "center",
        top: 60,
        left: 64
      },
      {
        id: "ot-venue",
        key: "venue",
        text: "The Smith Home\n5555 Willow Brook St.",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 11,
        color: "#B3ADA0",
        fontWeight: "400",
        textAlign: "center",
        top: 74,
        left: 64
      }
    ]
  },
  {
    id: "metallic-paint-splatter",
    title: "Metallic Paint Splatter",
    name: "Metallic Paint Splatter",
    category: "Corporate",
    badge: "Premium",
    envelopeColor: "#141414",
    linerColor: "#111111",
    envelopeLiner: "#111111",
    mockupUrl: "/assets/templates/metallic-paint-splatter-mockup.svg",
    thumbnailUrl: "/assets/templates/metallic-paint-splatter-mockup.svg",
    backdrop: {
      type: "texture",
      value: "linear-gradient(135deg, #F2EEE7 0%, #EBE5DC 50%, #DFD7CB 100%)",
      color: "#F2EEE7",
      gradient: "linear-gradient(135deg, #F2EEE7 0%, #EBE5DC 50%, #DFD7CB 100%)"
    },
    envelope: {
      outerColor: "#141414",
      flapColor: "#181818",
      linerPatternUrl: "",
      linerColor: "#111111",
      innerLiner: "#111111",
      linerCss: "#111111",
      isOpen: true,
      isOpenUpward: false,
      shadowColor: "rgba(0,0,0,0.32)",
      position: "left"
    } as any,
    card: {
      artworkUrl: "/assets/templates/metallic-paint-splatter-bg.svg",
      borderIllustration: "/assets/templates/metallic-paint-splatter-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/metallic-paint-splatter-bg.svg",
      backgroundColor: "#FAF8F5",
      aspectRatio: "5x7",
      border: "1px solid rgba(0,0,0,0.06)",
      cssConfig: {
        backgroundColor: "#FAF8F5",
        borderRadius: "14px",
        paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#FAF8F5",
      borderRadius: "14px",
      paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)",
      aspectRatio: "5/7"
    },
    defaultTextLayers: [
      {
        id: "mps-header",
        key: "title",
        text: "JOIN US",
        fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
        fontSize: 28,
        letterSpacing: 4,
        color: "#1C1C1C",
        fontWeight: "600",
        textAlign: "center",
        top: 36,
        left: 50
      },
      {
        id: "mps-subtext",
        key: "subtitle",
        text: "Come raise a glass... we've got so much to celebrate!",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontStyle: "italic",
        fontSize: 13,
        lineHeight: 1.4,
        color: "#4A4A4A",
        fontWeight: "400",
        textAlign: "center",
        top: 48,
        left: 50
      },
      {
        id: "mps-details",
        key: "datetime",
        text: "Friday, February 3 at 7 PM\n835 South Hill St.",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 12,
        lineHeight: 1.5,
        color: "#5A5A5A",
        fontWeight: "400",
        textAlign: "center",
        top: 66,
        left: 50
      }
    ]
  },
  {
    id: "golden-foliage-holiday",
    title: "Golden Foliage Holiday",
    name: "Golden Foliage Holiday",
    category: "Holiday",
    badge: "Premium",
    envelopeColor: "#DACFBC",
    linerColor: "#D4AF37",
    envelopeLiner: "linear-gradient(135deg, #9E7318 0%, #D4AF37 25%, #FFF4B3 50%, #D4AF37 75%, #7C540C 100%)",
    mockupUrl: "/assets/templates/golden-foliage-holiday-mockup.svg",
    thumbnailUrl: "/assets/templates/golden-foliage-holiday-mockup.svg",
    backdrop: {
      type: "texture",
      value: "linear-gradient(135deg, #FAF7F2 0%, #F3ECE2 50%, #E8DFCFA 100%)",
      color: "#FAF7F2",
      gradient: "linear-gradient(135deg, #FAF7F2 0%, #F3ECE2 50%, #E8DFCFA 100%)"
    },
    envelope: {
      outerColor: "#DACFBC",
      flapColor: "#DACFBC",
      linerPatternUrl: "",
      linerColor: "#D4AF37",
      innerLiner: "linear-gradient(135deg, #9E7318 0%, #D4AF37 25%, #FFF4B3 50%, #D4AF37 75%, #7C540C 100%)",
      linerCss: "linear-gradient(135deg, #9E7318 0%, #D4AF37 25%, #FFF4B3 50%, #D4AF37 75%, #7C540C 100%)",
      isOpen: true,
      isOpenUpward: false,
      shadowColor: "rgba(0,0,0,0.28)",
      position: "left"
    } as any,
    card: {
      artworkUrl: "/assets/templates/golden-foliage-holiday-bg.svg",
      borderIllustration: "/assets/templates/golden-foliage-holiday-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/golden-foliage-holiday-bg.svg",
      backgroundColor: "#223326",
      aspectRatio: "5x7",
      border: "1px solid rgba(255,255,255,0.08)",
      cssConfig: {
        backgroundColor: "#223326",
        borderRadius: "14px",
        paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.35)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#223326",
      borderRadius: "14px",
      paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.35)",
      aspectRatio: "5/7"
    },
    defaultTextLayers: [
      {
        id: "gfh-heading",
        key: "title",
        text: "LET'S CELEBRATE\nTHE SEASON",
        fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
        fontSize: 22,
        letterSpacing: 2,
        lineHeight: 1.3,
        color: "#222222",
        fontWeight: "600",
        textAlign: "center",
        top: 36,
        left: 50
      },
      {
        id: "gfh-subtitle",
        key: "subtitle",
        text: "JOIN US FOR OUR\nannual holiday party",
        fontFamily: "'Great Vibes', cursive",
        fontSize: 20,
        lineHeight: 1.4,
        color: "#555555",
        fontWeight: "400",
        textAlign: "center",
        top: 50,
        left: 50
      },
      {
        id: "gfh-details",
        key: "datetime",
        text: "SATURDAY, DECEMBER 15TH AT 6 PM\nTHE ANDERSON HOME, 819 HOLLY LANE",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 9.5,
        letterSpacing: 1.1,
        lineHeight: 1.6,
        color: "#555555",
        fontWeight: "500",
        textAlign: "center",
        top: 66,
        left: 50
      }
    ]
  },
  {
    id: "citrus-splash",
    title: "Farewell Party",
    name: "Citrus Splash",
    category: "Corporate",
    tags: ["Corporate", "Farewell", "Party"],
    isPremium: true,
    badge: "Premium",
    envelopeColor: "#A5835F",
    linerColor: "#FDFBF5",
    envelopeLiner: "#FDFBF5",
    mockupUrl: "/assets/templates/citrus-splash-mockup.svg",
    thumbnailUrl: "/assets/templates/citrus-splash-mockup.svg",
    backdrop: {
      type: "texture",
      value: "/assets/backdrops/olive-green-texture.svg",
      color: "#414A20",
      gradient: "linear-gradient(135deg, #4C5627 0%, #414A20 50%, #242911 100%)"
    },
    envelope: {
      outerColor: "#A5835F",
      flapColor: "#B3936F",
      linerPatternUrl: "",
      linerColor: "#FDFBF5",
      innerLiner: "#FDFBF5",
      linerCss: "repeating-linear-gradient(45deg, #EFE5D2 0px, #EFE5D2 8px, #FDFBF5 8px, #FDFBF5 16px)",
      isOpen: true,
      isOpenUpward: true,
      shadowColor: "rgba(0,0,0,0.32)",
      position: "left"
    } as any,
    card: {
      artworkUrl: "/assets/templates/citrus-splash-bg.svg",
      borderIllustration: "/assets/templates/citrus-splash-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/citrus-splash-bg.svg",
      backgroundColor: "#FFFDF4",
      aspectRatio: "5x7",
      border: "1px solid rgba(0,0,0,0.06)",
      cssConfig: {
        backgroundColor: "#FFFDF4",
        borderRadius: "14px",
        paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#FFFDF4",
      borderRadius: "14px",
      paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)",
      aspectRatio: "5/7"
    },
    defaultTextLayers: [
      {
        id: "cs-intro",
        key: "intro",
        text: "you are invited to a",
        fontFamily: "'Inter', sans-serif",
        fontSize: 10.5,
        letterSpacing: 1.5,
        color: "#525636",
        fontWeight: "500",
        textAlign: "center",
        top: 32,
        left: 50
      },
      {
        id: "cs-title",
        key: "title",
        text: "FAREWELL\nPARTY",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 26,
        letterSpacing: 3,
        lineHeight: 1.25,
        color: "#28361B",
        fontWeight: "700",
        textAlign: "center",
        top: 44,
        left: 50
      },
      {
        id: "cs-subtitle",
        key: "subtitle",
        text: "to honor and thank",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontStyle: "italic",
        fontSize: 12.5,
        color: "#525636",
        fontWeight: "400",
        textAlign: "center",
        top: 58,
        left: 50
      },
      {
        id: "cs-honoree",
        key: "name",
        text: "Elena Thomas",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 22,
        letterSpacing: 1.5,
        color: "#28361B",
        fontWeight: "600",
        textAlign: "center",
        top: 68,
        left: 50
      }
    ]
  },
  {
    id: "garden-blooms",
    title: "Annual Charity Gala",
    name: "Garden Blooms",
    category: "Corporate",
    tags: ["Corporate", "Charity", "Gala", "Annual"],
    isPremium: true,
    badge: "Premium",
    envelopeColor: "#A5835F",
    linerColor: "#58724E",
    envelopeLiner: "#58724E",
    mockupUrl: "/assets/templates/garden-blooms-mockup.svg",
    thumbnailUrl: "/assets/templates/garden-blooms-mockup.svg",
    backdrop: {
      type: "texture",
      value: "/assets/backdrops/beige-textured-linen.svg",
      color: "#E2D9C8",
      gradient: "linear-gradient(135deg, #EDE6D8 0%, #E2D9C8 50%, #C5BBA7 100%)"
    },
    envelope: {
      outerColor: "#A5835F",
      flapColor: "#B3936F",
      position: "left",
      linerPatternUrl: "",
      linerColor: "#58724E",
      innerLiner: "#58724E",
      linerCss: "repeating-linear-gradient(90deg, #58724E 0px, #58724E 8px, #FDFBF7 8px, #FDFBF7 16px)",
      isOpen: true,
      isOpenUpward: true,
      shadowColor: "rgba(0,0,0,0.28)"
    } as any,
    card: {
      artworkUrl: "/assets/templates/garden-blooms-bg.svg",
      borderIllustration: "/assets/templates/garden-blooms-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/garden-blooms-bg.svg",
      backgroundColor: "#FFFFFF",
      aspectRatio: "5x7",
      border: "1px solid rgba(0,0,0,0.06)",
      cssConfig: {
        backgroundColor: "#FFFFFF",
        borderRadius: "14px",
        paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#FFFFFF",
      borderRadius: "14px",
      paperShadow: "0 14px 30px -6px rgba(0, 0, 0, 0.28)",
      aspectRatio: "5/7"
    },
    defaultTextLayers: [
      {
        id: "gb-intro",
        key: "intro",
        text: "join us for our",
        fontFamily: "'Inter', sans-serif",
        fontSize: 10,
        letterSpacing: 1.2,
        color: "#555555",
        fontWeight: "500",
        textAlign: "center",
        top: 32,
        left: 50
      },
      {
        id: "gb-title",
        key: "title",
        text: "Annual\nCharity\nGala",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 26,
        letterSpacing: 2,
        lineHeight: 1.25,
        color: "#242424",
        fontWeight: "600",
        textAlign: "center",
        top: 45,
        left: 50
      },
      {
        id: "gb-datetime",
        key: "datetime",
        text: "Friday, September 24 at 7 PM",
        fontFamily: "'Inter', sans-serif",
        fontSize: 10.5,
        letterSpacing: 0.5,
        color: "#444444",
        fontWeight: "500",
        textAlign: "center",
        top: 60,
        left: 50
      },
      {
        id: "gb-venue",
        key: "venue",
        text: "Marina Ballroom",
        fontFamily: "'Inter', sans-serif",
        fontSize: 10.5,
        letterSpacing: 0.5,
        color: "#333333",
        fontWeight: "600",
        textAlign: "center",
        top: 68,
        left: 50
      },
      {
        id: "gb-attire",
        key: "details",
        text: "formal attire encouraged",
        fontFamily: "'Inter', sans-serif",
        fontStyle: "italic",
        fontSize: 9.5,
        letterSpacing: 0.4,
        color: "#666666",
        fontWeight: "400",
        textAlign: "center",
        top: 76,
        left: 50
      }
    ]
  },
  // ---------------- NEW HALLOWEEN PREMIUM TEMPLATES (Canvas-Ready 4-Layer Architecture) ----------------
  {
    id: "retro-little-monsters",
    title: "Retro Little Monsters",
    name: "Retro Little Monsters",
    category: "Halloween",
    badge: "Premium",
    isPremium: true,
    tags: ["Halloween", "All"],
    envelopeColor: "#A9DCC6",
    linerColor: "#1C1A19",
    envelopeLiner: "repeating-conic-gradient(#1C1A19 0% 25%, #FDFCF7 0% 50%) 0 0 / 26px 26px",
    mockupUrl: "/templates/retro-little-monsters.svg",
    thumbnailUrl: "/templates/retro-little-monsters.svg",
    backdrop: {
      type: "color",
      value: "#C7B8E6",
      color: "#C7B8E6",
      gradient: "linear-gradient(135deg, #C7B8E6 0%, #A99CD9 100%)"
    },
    envelope: {
      outerColor: "#A9DCC6",
      flapColor: "#9AD2BA",
      linerPatternUrl: "",
      linerColor: "#1C1A19",
      innerLiner: "repeating-conic-gradient(#1C1A19 0% 25%, #FDFCF7 0% 50%) 0 0 / 26px 26px",
      linerCss: "repeating-conic-gradient(#1C1A19 0% 25%, #FDFCF7 0% 50%) 0 0 / 26px 26px",
      isOpen: true,
      isOpenUpward: true,
      shadowColor: "rgba(43,30,68,0.45)"
    },
    card: {
      artworkUrl: "/assets/templates/retro-little-monsters-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/retro-little-monsters-bg.svg",
      borderIllustration: "/assets/templates/retro-little-monsters-bg.svg",
      backgroundColor: "#F7F2E3",
      aspectRatio: "5x7",
      border: "1px solid rgba(0,0,0,0.06)",
      cssConfig: {
        backgroundColor: "#F7F2E3",
        borderRadius: "12px",
        paperShadow: "0 16px 34px -6px rgba(0,0,0,0.45)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#F7F2E3",
      borderRadius: "12px",
      paperShadow: "0 16px 34px -6px rgba(0,0,0,0.45)",
      aspectRatio: "5/7"
    },
    canvasData: {
      backgroundImage: "/assets/templates/retro-little-monsters-bg.svg"
    },
    defaultTextLayers: [
      {
        id: "layer-intro",
        key: "intro",
        text: "It was a mash... It was a",
        fontFamily: "'Dancing Script', cursive",
        fontSize: 26,
        fontWeight: "600",
        color: "#2B2B2B",
        textAlign: "center",
        top: 41,
        left: 50
      },
      {
        id: "layer-title",
        key: "title",
        text: "MONSTER MASH",
        fontFamily: "'Londrina Solid', sans-serif",
        fontSize: 46,
        fontWeight: "900",
        letterSpacing: 1,
        color: "#1F1D1A",
        textAlign: "center",
        top: 51,
        left: 50
      },
      {
        id: "layer-description",
        key: "description",
        text: "Join us for a monstrously good time",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12.5,
        fontWeight: "500",
        color: "#4A4640",
        textAlign: "center",
        top: 65,
        left: 50
      },
      {
        id: "layer-datetime",
        key: "datetime",
        text: "Saturday, October 31st at 5 PM",
        fontFamily: "'Inter', sans-serif",
        fontSize: 11.5,
        fontWeight: "600",
        color: "#2B2B2B",
        textAlign: "center",
        top: 73,
        left: 50
      },
      {
        id: "layer-venue",
        key: "venue",
        text: "617 Costume Court",
        fontFamily: "'Inter', sans-serif",
        fontSize: 11.5,
        fontWeight: "500",
        color: "#6B665C",
        textAlign: "center",
        top: 79.5,
        left: 50
      }
    ]
  },
  {
    id: "creepy-cake",
    title: "Creepy Cake",
    name: "Creepy Cake",
    category: "Halloween",
    badge: "Premium",
    isPremium: true,
    isEditable: true,
    isFeatured: true,
    priority: 100,
    sortOrder: 1,
    tags: ["Halloween", "Birthday", "All"],
    envelopeColor: "#C2966A",
    linerColor: "#D8B486",
    envelopeLiner: "url('/assets/templates/creepy-cake-liner.svg') center / cover no-repeat, linear-gradient(135deg, #D8B486 0%, #C2966A 60%, #A87B52 100%)",
    envelopeLinerUrl: "/assets/templates/creepy-cake-liner.svg",
    artworkUrl: "/assets/templates/creepy-cake-bg.svg",
    mockupUrl: "/templates/creepy-cake.svg",
    thumbnailUrl: "/templates/creepy-cake.svg",
    backdrop: {
      type: "color",
      value: "#1A1619",
      color: "#1A1619",
      gradient: "linear-gradient(180deg, #221C22 0%, #141116 100%)"
    },
    envelope: {
      outerColor: "#C2966A",
      flapColor: "#B0855A",
      linerPatternUrl: "/assets/templates/creepy-cake-liner.svg",
      linerColor: "#D8B486",
      innerLiner: "url('/assets/templates/creepy-cake-liner.svg') center / cover no-repeat, linear-gradient(135deg, #D8B486 0%, #C2966A 60%, #A87B52 100%)",
      linerCss: "url('/assets/templates/creepy-cake-liner.svg') center / cover no-repeat, linear-gradient(135deg, #D8B486 0%, #C2966A 60%, #A87B52 100%)",
      isOpen: true,
      isOpenUpward: true,
      shadowColor: "rgba(90,45,5,0.5)"
    },
    card: {
      artworkUrl: "/assets/templates/creepy-cake-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/creepy-cake-bg.svg",
      borderIllustration: "/assets/templates/creepy-cake-bg.svg",
      backgroundColor: "#1A1619",
      aspectRatio: "5x7",
      border: "1px solid rgba(0,0,0,0.2)",
      cssConfig: {
        backgroundColor: "#1A1619",
        borderRadius: "12px",
        paperShadow: "0 18px 38px -6px rgba(0,0,0,0.65)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#1A1619",
      borderRadius: "12px",
      paperShadow: "0 18px 38px -6px rgba(0,0,0,0.65)",
      aspectRatio: "5/7"
    },
    canvasData: {
      backgroundImage: "/assets/templates/creepy-cake-bg.svg"
    },
    canvasConfig: {
      width: 600,
      height: 840,
      artworkUrl: "/assets/templates/creepy-cake-bg.svg",
      crossOrigin: "anonymous",
      proxyUrl: "/api/proxy-image",
      locked: true,
      textObjects: [
        { id: "layer-title", role: "title", text: "VANESSA'S\nHALLOWEEN\nBASH!", x: 300, y: 202, fontFamily: "'Permanent Marker', cursive", fontSize: 55, fill: "#FF7A1A", fontWeight: 400, align: "center" },
        { id: "layer-description", role: "subtitle", text: "Let's get a little spooky for Vanessa's birthday!", x: 408, y: 487, fontFamily: "'Inter', sans-serif", fontSize: 15, fill: "#F5F1E8", fontWeight: 500, align: "center" },
        { id: "layer-datetime", role: "dateTime", text: "October 23rd at 6 PM", x: 408, y: 588, fontFamily: "'Inter', sans-serif", fontSize: 14, fill: "#FFFFFF", fontWeight: 600, align: "center" },
        { id: "layer-venue", role: "venue", text: "The Harvey House", x: 408, y: 647, fontFamily: "'Inter', sans-serif", fontSize: 14, fill: "#E4DCCF", fontWeight: 500, align: "center" }
      ]
    },
    defaultTextLayers: [
      {
        id: "layer-title",
        key: "title",
        text: "VANESSA'S\nHALLOWEEN\nBASH!",
        fontFamily: "'Permanent Marker', cursive",
        fontSize: 46,
        fontWeight: "400",
        lineHeight: 1,
        color: "#FF7A1A",
        textAlign: "center",
        top: 24,
        left: 50
      },
      {
        id: "layer-description",
        key: "description",
        text: "Let's get a little spooky for Vanessa's birthday!",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12.5,
        fontWeight: "500",
        color: "#F5F1E8",
        textAlign: "center",
        top: 58,
        left: 68
      },
      {
        id: "layer-datetime",
        key: "datetime",
        text: "October 23rd at 6 PM",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
        textAlign: "center",
        top: 70,
        left: 68
      },
      {
        id: "layer-venue",
        key: "venue",
        text: "The Harvey House",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: "500",
        color: "#E4DCCF",
        textAlign: "center",
        top: 77,
        left: 68
      }
    ]
  },
  {
    id: "holographic-hey-boo",
    title: "Holographic Hey Boo",
    name: "Holographic Hey Boo",
    category: "Halloween",
    badge: "Premium",
    isPremium: true,
    tags: ["Halloween", "All"],
    envelopeColor: "#F6F4F1",
    linerColor: "#CDB8F0",
    envelopeLiner: "linear-gradient(135deg, #F9C6D9 0%, #CDB8F0 35%, #BFE0F5 70%, #BFEAD9 100%)",
    mockupUrl: "/templates/holographic-hey-boo.svg",
    thumbnailUrl: "/templates/holographic-hey-boo.svg",
    backdrop: {
      type: "color",
      value: "#FEFDFA",
      color: "#FEFDFA",
      gradient: "radial-gradient(circle at 18% 14%, rgba(249,198,217,0.75) 0%, rgba(249,198,217,0) 45%), radial-gradient(circle at 84% 12%, rgba(191,224,245,0.75) 0%, rgba(191,224,245,0) 45%), linear-gradient(160deg, #FEFDFA 0%, #F3F0FB 100%)"
    },
    envelope: {
      outerColor: "#F6F4F1",
      flapColor: "#EDEBE7",
      linerPatternUrl: "",
      linerColor: "#CDB8F0",
      innerLiner: "linear-gradient(135deg, #F9C6D9 0%, #CDB8F0 35%, #BFE0F5 70%, #BFEAD9 100%)",
      linerCss: "linear-gradient(135deg, #F9C6D9 0%, #CDB8F0 35%, #BFE0F5 70%, #BFEAD9 100%)",
      isOpen: true,
      isOpenUpward: true,
      shadowColor: "rgba(0,0,0,0.35)"
    },
    card: {
      artworkUrl: "/assets/templates/holographic-hey-boo-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/holographic-hey-boo-bg.svg",
      borderIllustration: "/assets/templates/holographic-hey-boo-bg.svg",
      backgroundColor: "#FEFDFA",
      aspectRatio: "5x7",
      border: "1px solid rgba(0,0,0,0.06)",
      cssConfig: {
        backgroundColor: "#FEFDFA",
        borderRadius: "12px",
        paperShadow: "0 16px 34px -6px rgba(0,0,0,0.4)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#FEFDFA",
      borderRadius: "12px",
      paperShadow: "0 16px 34px -6px rgba(0,0,0,0.4)",
      aspectRatio: "5/7"
    },
    canvasData: {
      backgroundImage: "/assets/templates/holographic-hey-boo-bg.svg"
    },
    defaultTextLayers: [
      {
        id: "layer-title",
        key: "title",
        text: "Hey Boo!",
        fontFamily: "'Pacifico', cursive",
        fontSize: 58,
        fontWeight: "700",
        color: "#1A1A1A",
        textAlign: "center",
        top: 30,
        left: 50
      },
      {
        id: "layer-subtitle",
        key: "subtitle",
        text: "COME ON OVER FOR OUR HALLOWEEN PARTY!",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 1,
        color: "#1A1A1A",
        textAlign: "center",
        top: 62,
        left: 50
      },
      {
        id: "layer-datetime",
        key: "datetime",
        text: "SATURDAY, OCTOBER 31 AT 6 PM",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 1,
        color: "#3A3A3A",
        textAlign: "center",
        top: 72,
        left: 50
      },
      {
        id: "layer-venue",
        key: "venue",
        text: "3333 PALMERA DRIVE",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 1,
        color: "#5A5A5A",
        textAlign: "center",
        top: 79,
        left: 50
      }
    ]
  },
  {
    id: "gilded-horror",
    title: "Gilded Horror",
    name: "Gilded Horror",
    category: "Halloween",
    badge: "Premium",
    isPremium: true,
    tags: ["Halloween", "All"],
    envelopeColor: "#C9A227",
    linerColor: "#E8CE86",
    envelopeLiner: "linear-gradient(135deg, #E8CE86 0%, #C9A227 50%, #8A6A22 100%)",
    mockupUrl: "/templates/gilded-horror.svg",
    thumbnailUrl: "/templates/gilded-horror.svg",
    backdrop: {
      type: "color",
      value: "#6E7076",
      color: "#6E7076",
      gradient: "linear-gradient(180deg, #75777D 0%, #5F6167 100%)"
    },
    envelope: {
      outerColor: "#C9A227",
      flapColor: "#B08C1F",
      linerPatternUrl: "",
      linerColor: "#E8CE86",
      innerLiner: "linear-gradient(135deg, #E8CE86 0%, #C9A227 50%, #8A6A22 100%)",
      linerCss: "linear-gradient(135deg, #E8CE86 0%, #C9A227 50%, #8A6A22 100%)",
      isOpen: true,
      isOpenUpward: true,
      shadowColor: "rgba(30,32,36,0.55)"
    },
    card: {
      artworkUrl: "/assets/templates/gilded-horror-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/gilded-horror-bg.svg",
      borderIllustration: "/assets/templates/gilded-horror-bg.svg",
      backgroundColor: "#23211D",
      aspectRatio: "5x7",
      border: "1px solid rgba(0,0,0,0.2)",
      cssConfig: {
        backgroundColor: "#23211D",
        borderRadius: "12px",
        paperShadow: "0 18px 38px -6px rgba(0,0,0,0.65)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#23211D",
      borderRadius: "12px",
      paperShadow: "0 18px 38px -6px rgba(0,0,0,0.65)",
      aspectRatio: "5/7"
    },
    canvasData: {
      backgroundImage: "/assets/templates/gilded-horror-bg.svg"
    },
    defaultTextLayers: [
      {
        id: "layer-intro",
        key: "intro",
        text: "You are cordially invited to",
        fontFamily: "'Playfair Display', serif",
        fontSize: 15,
        fontStyle: "italic",
        fontWeight: "500",
        color: "#E8CE86",
        textAlign: "center",
        top: 33,
        left: 50
      },
      {
        id: "layer-title",
        key: "title",
        text: "A Ghastly Gathering",
        fontFamily: "'Dancing Script', cursive",
        fontSize: 40,
        fontWeight: "600",
        color: "#F6E7B2",
        textAlign: "center",
        top: 43,
        left: 50
      },
      {
        id: "layer-heading",
        key: "heading",
        text: "HAUNTED HALLOWEEN",
        fontFamily: "'Cinzel', serif",
        fontSize: 24,
        fontWeight: "700",
        letterSpacing: 1.5,
        color: "#C9A227",
        textAlign: "center",
        top: 54,
        left: 50
      },
      {
        id: "layer-datetime",
        key: "datetime",
        text: "October 31st at 7 PM",
        fontFamily: "'Inter', sans-serif",
        fontSize: 14,
        fontWeight: "600",
        color: "#E8CE86",
        textAlign: "center",
        top: 64,
        left: 50
      },
      {
        id: "layer-venue",
        key: "venue",
        text: "1234 Zombie Way",
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        fontWeight: "500",
        color: "#BDB49A",
        textAlign: "center",
        top: 71,
        left: 50
      }
    ]
  },
  // ---------------- PREMIUM HALLOWEEN 2026 — PINNED TO THE TOP OF THE BROWSE GRID ----------------
  {
    id: "dramatic-doily",
    title: "Dramatic Doily",
    name: "Dramatic Doily",
    category: "Halloween",
    badge: "Premium",
    isPremium: true,
    isEditable: true,
    isFeatured: true,
    priority: 100,
    sortOrder: 2,
    tags: ["Halloween", "Gothic", "All"],
    envelopeColor: "#5E0A10",
    linerColor: "#D8B486",
    envelopeLiner: "url('/assets/templates/dramatic-doily-liner.svg') center / cover no-repeat, linear-gradient(135deg, #F3E7D6 0%, #D8B486 100%)",
    envelopeLinerUrl: "/assets/templates/dramatic-doily-liner.svg",
    artworkUrl: "/assets/templates/dramatic-doily-bg.svg",
    mockupUrl: "/templates/dramatic-doily.svg",
    thumbnailUrl: "/templates/dramatic-doily.svg",
    backdrop: {
      type: "color",
      value: "#6C0C11",
      color: "#6C0C11",
      gradient: "linear-gradient(150deg, #8C1116 0%, #4A070B 100%)"
    },
    envelope: {
      outerColor: "#5E0A10",
      flapColor: "#4A070B",
      linerPatternUrl: "/assets/templates/dramatic-doily-liner.svg",
      linerColor: "#D8B486",
      innerLiner: "url('/assets/templates/dramatic-doily-liner.svg') center / cover no-repeat, linear-gradient(135deg, #F3E7D6 0%, #D8B486 100%)",
      linerCss: "url('/assets/templates/dramatic-doily-liner.svg') center / cover no-repeat, linear-gradient(135deg, #F3E7D6 0%, #D8B486 100%)",
      isOpen: true,
      isOpenUpward: true,
      shadowColor: "rgba(45,4,8,0.55)"
    },
    card: {
      artworkUrl: "/assets/templates/dramatic-doily-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/dramatic-doily-bg.svg",
      borderIllustration: "/assets/templates/dramatic-doily-bg.svg",
      backgroundColor: "#6C0C11",
      aspectRatio: "5x7",
      border: "1px solid rgba(0,0,0,0.25)",
      cssConfig: {
        backgroundColor: "#6C0C11",
        borderRadius: "12px",
        paperShadow: "0 18px 38px -6px rgba(0,0,0,0.6)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#6C0C11",
      borderRadius: "12px",
      paperShadow: "0 18px 38px -6px rgba(0,0,0,0.6)",
      aspectRatio: "5/7"
    },
    canvasData: {
      backgroundImage: "/assets/templates/dramatic-doily-bg.svg"
    },
    canvasConfig: {
      width: 600,
      height: 840,
      artworkUrl: "/assets/templates/dramatic-doily-bg.svg",
      crossOrigin: "anonymous",
      proxyUrl: "/api/proxy-image",
      locked: true,
      textObjects: [
        { id: "layer-title", role: "title", text: "Dying\nto party\nwith you", x: 300, y: 403, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 55, fill: "#6E0C11", fontWeight: 700, align: "center" },
        { id: "layer-subtitle", role: "subtitle", text: "Join us for cocktails, canapés & a graveyard smash — if you dare", x: 300, y: 508, fontFamily: "'Inter', sans-serif", fontSize: 15, fill: "#7A1218", fontWeight: 500, align: "center" },
        { id: "layer-datetime", role: "dateTime", text: "Saturday, October 31st at 8 PM", x: 300, y: 542, fontFamily: "'Inter', sans-serif", fontSize: 15, fill: "#5E0A10", fontWeight: 700, align: "center" },
        { id: "layer-venue", role: "venue", text: "21 Witchling Way", x: 300, y: 563, fontFamily: "'Inter', sans-serif", fontSize: 15, fill: "#7A1218", fontWeight: 500, align: "center" }
      ]
    },
    defaultTextLayers: [
      {
        id: "layer-title",
        key: "title",
        text: "Dying\nto party\nwith you",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 44,
        fontWeight: "700",
        lineHeight: 1.06,
        color: "#6E0C11",
        textAlign: "center",
        top: 48,
        left: 50
      },
      {
        id: "layer-subtitle",
        key: "subtitle",
        text: "Join us for cocktails, canapés & a graveyard smash — if you dare",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12.5,
        fontWeight: "500",
        color: "#7A1218",
        textAlign: "center",
        top: 60.5,
        left: 50
      },
      {
        id: "layer-datetime",
        key: "datetime",
        text: "Saturday, October 31st at 8 PM",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12.5,
        fontWeight: "700",
        color: "#5E0A10",
        textAlign: "center",
        top: 64.5,
        left: 50
      },
      {
        id: "layer-venue",
        key: "venue",
        text: "21 Witchling Way",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12.5,
        fontWeight: "500",
        color: "#7A1218",
        textAlign: "center",
        top: 67,
        left: 50
      }
    ]
  },
  {
    id: "strange-times",
    title: "Strange Times",
    name: "Strange Times",
    category: "Halloween",
    badge: "Premium",
    isPremium: true,
    isEditable: true,
    isFeatured: true,
    priority: 100,
    sortOrder: 3,
    tags: ["Halloween", "Retro", "All"],
    envelopeColor: "#150F2E",
    linerColor: "#3E2A6E",
    envelopeLiner: "url('/assets/templates/strange-times-liner.svg') center / cover no-repeat, linear-gradient(135deg, #1A1030 0%, #0B0716 100%)",
    envelopeLinerUrl: "/assets/templates/strange-times-liner.svg",
    artworkUrl: "/assets/templates/strange-times-bg.svg",
    mockupUrl: "/templates/strange-times.svg",
    thumbnailUrl: "/templates/strange-times.svg",
    backdrop: {
      type: "color",
      value: "#0A0716",
      color: "#0A0716",
      gradient: "linear-gradient(160deg, #141033 0%, #07091A 100%)"
    },
    envelope: {
      outerColor: "#150F2E",
      flapColor: "#0D0920",
      linerPatternUrl: "/assets/templates/strange-times-liner.svg",
      linerColor: "#3E2A6E",
      innerLiner: "url('/assets/templates/strange-times-liner.svg') center / cover no-repeat, linear-gradient(135deg, #1A1030 0%, #0B0716 100%)",
      linerCss: "url('/assets/templates/strange-times-liner.svg') center / cover no-repeat, linear-gradient(135deg, #1A1030 0%, #0B0716 100%)",
      isOpen: true,
      isOpenUpward: true,
      shadowColor: "rgba(5,3,16,0.6)"
    },
    card: {
      artworkUrl: "/assets/templates/strange-times-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/strange-times-bg.svg",
      borderIllustration: "/assets/templates/strange-times-bg.svg",
      backgroundColor: "#0A0716",
      aspectRatio: "5x7",
      border: "1px solid rgba(0,0,0,0.4)",
      cssConfig: {
        backgroundColor: "#0A0716",
        borderRadius: "12px",
        paperShadow: "0 18px 38px -6px rgba(0,0,0,0.7)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#0A0716",
      borderRadius: "12px",
      paperShadow: "0 18px 38px -6px rgba(0,0,0,0.7)",
      aspectRatio: "5/7"
    },
    canvasData: {
      backgroundImage: "/assets/templates/strange-times-bg.svg"
    },
    canvasConfig: {
      width: 600,
      height: 840,
      artworkUrl: "/assets/templates/strange-times-bg.svg",
      crossOrigin: "anonymous",
      proxyUrl: "/api/proxy-image",
      locked: true,
      textObjects: [
        { id: "layer-title", role: "title", text: "LET'S\nPARTY", x: 300, y: 664, fontFamily: "'Londrina Solid', sans-serif", fontSize: 72, fill: "#FF2E3F", fontWeight: 900, align: "center" },
        { id: "layer-subtitle", role: "subtitle", text: "A STRANGE EVENING AWAITS... IF YOU DARE", x: 300, y: 769, fontFamily: "'Inter', sans-serif", fontSize: 15, fill: "#EDEBFF", fontWeight: 700, align: "center" },
        { id: "layer-datetime", role: "dateTime", text: "October 31st | 6 PM | 1228 Strange Street", x: 300, y: 798, fontFamily: "'Inter', sans-serif", fontSize: 15, fill: "#FFFFFF", fontWeight: 600, align: "center" },
        { id: "layer-venue", role: "venue", text: "Hawkins, Indiana", x: 300, y: 819, fontFamily: "'Inter', sans-serif", fontSize: 15, fill: "#C6C0E6", fontWeight: 500, align: "center" }
      ]
    },
    defaultTextLayers: [
      {
        id: "layer-title",
        key: "title",
        text: "LET'S\nPARTY",
        fontFamily: "'Londrina Solid', sans-serif",
        fontSize: 62,
        fontWeight: "900",
        lineHeight: 1,
        letterSpacing: 1,
        color: "#FF2E3F",
        textAlign: "center",
        top: 79,
        left: 50
      },
      {
        id: "layer-subtitle",
        key: "subtitle",
        text: "A STRANGE EVENING AWAITS... IF YOU DARE",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12.5,
        fontWeight: "700",
        letterSpacing: 1.2,
        color: "#EDEBFF",
        textAlign: "center",
        top: 91.5,
        left: 50
      },
      {
        id: "layer-datetime",
        key: "datetime",
        text: "October 31st | 6 PM | 1228 Strange Street",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
        textAlign: "center",
        top: 95,
        left: 50
      },
      {
        id: "layer-venue",
        key: "venue",
        text: "Hawkins, Indiana",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: "500",
        color: "#C6C0E6",
        textAlign: "center",
        top: 97.5,
        left: 50
      }
    ]
  },
  {
    id: "sophisticated-spooky-party",
    title: "Sophisticated Spooky Party",
    name: "Sophisticated Spooky Party",
    category: "Halloween",
    badge: "Premium",
    isPremium: true,
    isEditable: true,
    isFeatured: true,
    priority: 100,
    sortOrder: 4,
    tags: ["Halloween", "Cocktail", "Elegant", "All"],
    envelopeColor: "#0B0B0D",
    linerColor: "#C9A227",
    envelopeLiner: "url('/assets/templates/sophisticated-spooky-party-liner.svg') center / cover no-repeat, linear-gradient(135deg, #1A1A1E 0%, #0B0B0D 100%)",
    envelopeLinerUrl: "/assets/templates/sophisticated-spooky-party-liner.svg",
    artworkUrl: "/assets/templates/sophisticated-spooky-party-bg.svg",
    mockupUrl: "/templates/sophisticated-spooky-party.svg",
    thumbnailUrl: "/templates/sophisticated-spooky-party.svg",
    backdrop: {
      type: "color",
      value: "#0A0A0C",
      color: "#0A0A0C",
      gradient: "linear-gradient(150deg, #26262A 0%, #0A0A0C 100%)"
    },
    envelope: {
      outerColor: "#0B0B0D",
      flapColor: "#050506",
      linerPatternUrl: "/assets/templates/sophisticated-spooky-party-liner.svg",
      linerColor: "#C9A227",
      innerLiner: "url('/assets/templates/sophisticated-spooky-party-liner.svg') center / cover no-repeat, linear-gradient(135deg, #1A1A1E 0%, #0B0B0D 100%)",
      linerCss: "url('/assets/templates/sophisticated-spooky-party-liner.svg') center / cover no-repeat, linear-gradient(135deg, #1A1A1E 0%, #0B0B0D 100%)",
      isOpen: true,
      isOpenUpward: true,
      shadowColor: "rgba(0,0,0,0.7)"
    },
    card: {
      artworkUrl: "/assets/templates/sophisticated-spooky-party-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/sophisticated-spooky-party-bg.svg",
      borderIllustration: "/assets/templates/sophisticated-spooky-party-bg.svg",
      backgroundColor: "#0A0A0C",
      aspectRatio: "5x7",
      border: "1px solid rgba(201,162,39,0.45)",
      cssConfig: {
        backgroundColor: "#0A0A0C",
        borderRadius: "12px",
        paperShadow: "0 18px 38px -6px rgba(0,0,0,0.75)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#0A0A0C",
      borderRadius: "12px",
      paperShadow: "0 18px 38px -6px rgba(0,0,0,0.75)",
      aspectRatio: "5/7"
    },
    canvasData: {
      backgroundImage: "/assets/templates/sophisticated-spooky-party-bg.svg"
    },
    canvasConfig: {
      width: 600,
      height: 840,
      artworkUrl: "/assets/templates/sophisticated-spooky-party-bg.svg",
      crossOrigin: "anonymous",
      proxyUrl: "/api/proxy-image",
      locked: true,
      textObjects: [
        { id: "layer-subtitle", role: "subtitle", text: "Calling all my best witches for a", x: 300, y: 317, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 21, fill: "#F4E4AE", fontWeight: 500, align: "center" },
        { id: "layer-title", role: "title", text: "HALLOWEEN\nCOCKTAIL\nPARTY", x: 300, y: 470, fontFamily: "'Cinzel', serif", fontSize: 52, fill: "#E8CE86", fontWeight: 700, align: "center" },
        { id: "layer-datetime", role: "dateTime", text: "SATURDAY, OCTOBER 31ST AT 7 PM", x: 300, y: 596, fontFamily: "'Inter', sans-serif", fontSize: 15, fill: "#E8CE86", fontWeight: 600, align: "center" },
        { id: "layer-venue", role: "venue", text: "The Gilded Lantern, 99 Candlewood Ave", x: 300, y: 626, fontFamily: "'Inter', sans-serif", fontSize: 15, fill: "#BDB49A", fontWeight: 500, align: "center" }
      ]
    },
    defaultTextLayers: [
      {
        id: "layer-subtitle",
        key: "subtitle",
        text: "Calling all my best witches for a",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 17,
        fontWeight: "500",
        fontStyle: "italic",
        color: "#F4E4AE",
        textAlign: "center",
        top: 37.7,
        left: 50
      },
      {
        id: "layer-title",
        key: "title",
        text: "HALLOWEEN\nCOCKTAIL\nPARTY",
        fontFamily: "'Cinzel', serif",
        fontSize: 42,
        fontWeight: "700",
        lineHeight: 1.15,
        letterSpacing: 2,
        color: "#E8CE86",
        textAlign: "center",
        top: 56,
        left: 50
      },
      {
        id: "layer-datetime",
        key: "datetime",
        text: "SATURDAY, OCTOBER 31ST AT 7 PM",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12.5,
        fontWeight: "600",
        letterSpacing: 1.4,
        color: "#E8CE86",
        textAlign: "center",
        top: 71,
        left: 50
      },
      {
        id: "layer-venue",
        key: "venue",
        text: "The Gilded Lantern, 99 Candlewood Ave",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: "500",
        letterSpacing: 0.8,
        color: "#BDB49A",
        textAlign: "center",
        top: 74.5,
        left: 50
      }
    ]
  },
  {
    id: "sallys-song",
    title: "Tim Burton's The Nightmare Before Christmas: Sally's Song",
    name: "Tim Burton's The Nightmare Before Christmas: Sally's Song",
    category: "Halloween",
    badge: "Premium",
    isPremium: true,
    isEditable: true,
    isFeatured: true,
    priority: 100,
    sortOrder: 5,
    tags: ["Halloween", "Tim Burton", "Nightmare Before Christmas", "All"],
    envelopeColor: "#3E1834",
    linerColor: "#6C3358",
    envelopeLiner: "url('/assets/templates/sallys-song-liner.svg') center / cover no-repeat, linear-gradient(135deg, #2A1026 0%, #160A14 100%)",
    envelopeLinerUrl: "/assets/templates/sallys-song-liner.svg",
    artworkUrl: "/assets/templates/sallys-song-bg.svg",
    mockupUrl: "/templates/sallys-song.svg",
    thumbnailUrl: "/templates/sallys-song.svg",
    backdrop: {
      type: "color",
      value: "#2A1026",
      color: "#2A1026",
      gradient: "linear-gradient(150deg, #3A1630 0%, #1A0A18 100%)"
    },
    envelope: {
      outerColor: "#3E1834",
      flapColor: "#31132B",
      linerPatternUrl: "/assets/templates/sallys-song-liner.svg",
      linerColor: "#6C3358",
      innerLiner: "url('/assets/templates/sallys-song-liner.svg') center / cover no-repeat, linear-gradient(135deg, #2A1026 0%, #160A14 100%)",
      linerCss: "url('/assets/templates/sallys-song-liner.svg') center / cover no-repeat, linear-gradient(135deg, #2A1026 0%, #160A14 100%)",
      isOpen: true,
      isOpenUpward: true,
      shadowColor: "rgba(26,5,18,0.6)"
    },
    card: {
      artworkUrl: "/assets/templates/sallys-song-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/sallys-song-bg.svg",
      borderIllustration: "/assets/templates/sallys-song-bg.svg",
      backgroundColor: "#100C19",
      aspectRatio: "5x7",
      border: "1px solid rgba(75,44,70,0.6)",
      cssConfig: {
        backgroundColor: "#100C19",
        borderRadius: "12px",
        paperShadow: "0 18px 38px -6px rgba(0,0,0,0.65)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#100C19",
      borderRadius: "12px",
      paperShadow: "0 18px 38px -6px rgba(0,0,0,0.65)",
      aspectRatio: "5/7"
    },
    canvasData: {
      backgroundImage: "/assets/templates/sallys-song-bg.svg"
    },
    canvasConfig: {
      width: 600,
      height: 840,
      artworkUrl: "/assets/templates/sallys-song-bg.svg",
      crossOrigin: "anonymous",
      proxyUrl: "/api/proxy-image",
      locked: true,
      textObjects: [
        { id: "layer-title", role: "title", text: "A splendid\nnightmare awaits", x: 300, y: 202, fontFamily: "'Dancing Script', cursive", fontSize: 48, fill: "#F4E6F0", fontWeight: 600, align: "center" },
        { id: "layer-subtitle", role: "subtitle", text: "JOIN US FOR A FRIGHTFULLY CHILLING TIME AT SIX", x: 300, y: 298, fontFamily: "'Inter', sans-serif", fontSize: 14, fill: "#D9CDE4", fontWeight: 600, align: "center" },
        { id: "layer-heading", role: "heading", text: "Halloween\ncelebration", x: 300, y: 382, fontFamily: "'Dancing Script', cursive", fontSize: 41, fill: "#E7A9C4", fontWeight: 600, align: "center" },
        { id: "layer-datetime", role: "dateTime", text: "SATURDAY\nOCTOBER 31ST\nAT 7PM", x: 300, y: 470, fontFamily: "'Inter', sans-serif", fontSize: 14, fill: "#F4E6F0", fontWeight: 700, align: "center" },
        { id: "layer-venue", role: "venue", text: "THE PLACE\n84 EVERLOCK DR.", x: 300, y: 538, fontFamily: "'Inter', sans-serif", fontSize: 14, fill: "#E7A9C4", fontWeight: 700, align: "center" }
      ]
    },
    defaultTextLayers: [
      {
        id: "layer-title",
        key: "title",
        text: "A splendid\nnightmare awaits",
        fontFamily: "'Dancing Script', cursive",
        fontSize: 38,
        fontWeight: "600",
        lineHeight: 1.15,
        color: "#F4E6F0",
        textAlign: "center",
        top: 24,
        left: 50
      },
      {
        id: "layer-subtitle",
        key: "subtitle",
        text: "JOIN US FOR A FRIGHTFULLY\nCHILLING TIME AT SIX",
        fontFamily: "'Inter', sans-serif",
        fontSize: 11.5,
        fontWeight: "600",
        letterSpacing: 1.4,
        lineHeight: 1.5,
        color: "#D9CDE4",
        textAlign: "center",
        top: 35.5,
        left: 50
      },
      {
        id: "layer-heading",
        key: "heading",
        text: "Halloween\ncelebration",
        fontFamily: "'Dancing Script', cursive",
        fontSize: 34,
        fontWeight: "600",
        lineHeight: 1.1,
        color: "#E7A9C4",
        textAlign: "center",
        top: 45.5,
        left: 50
      },
      {
        id: "layer-datetime",
        key: "datetime",
        text: "SATURDAY\nOCTOBER 31ST\nAT 7PM",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.3,
        lineHeight: 1.45,
        color: "#F4E6F0",
        textAlign: "center",
        top: 56,
        left: 50
      },
      {
        id: "layer-venue",
        key: "venue",
        text: "THE PLACE\n84 EVERLOCK DR.",
        fontFamily: "'Inter', sans-serif",
        fontSize: 11.5,
        fontWeight: "700",
        letterSpacing: 1.2,
        lineHeight: 1.45,
        color: "#E7A9C4",
        textAlign: "center",
        top: 64,
        left: 50
      }
    ]
  },
  // =========================================================================
  // PREMIUM KIDS / BIRTHDAY TEMPLATES (Choose from Editable)
  // =========================================================================
  {
    id: "perfectely-pink",
    title: "Perfectely Pink",
    name: "Perfectely Pink",
    category: "Birthday",
    badge: "Premium",
    isPremium: true,
    isEditable: true,
    isFeatured: true,
    priority: 96,
    sortOrder: 1,
    tags: ["Birthday", "Kids", "All"],
    envelopeColor: "#FF2E88",
    linerColor: "#FF8ABF",
    envelopeLiner: "url('/assets/templates/perfectely-pink-liner.svg') center / cover no-repeat, linear-gradient(135deg, #FF8ABF 0%, #FF2E88 55%, #E5206F 100%)",
    envelopeLinerUrl: "/assets/templates/perfectely-pink-liner.svg",
    artworkUrl: "/assets/templates/perfectely-pink-bg.svg",
    mockupUrl: "/assets/templates/perfectely-pink-mockup.svg",
    thumbnailUrl: "/assets/templates/perfectely-pink-mockup.svg",
    backdrop: {
      type: "color",
      value: "#FCE7F1",
      color: "#FCE7F1",
      gradient: "radial-gradient(circle at 18% 14%, rgba(255,182,213,0.9) 0%, rgba(255,182,213,0) 48%), radial-gradient(circle at 86% 82%, rgba(255,120,175,0.75) 0%, rgba(255,120,175,0) 52%), linear-gradient(160deg, #FDEEF5 0%, #F8C9DD 60%, #F5B3CF 100%)"
    },
    envelope: {
      outerColor: "#FF2E88",
      flapColor: "#E5206F",
      linerPatternUrl: "/assets/templates/perfectely-pink-liner.svg",
      linerColor: "#FF8ABF",
      innerLiner: "url('/assets/templates/perfectely-pink-liner.svg') center / cover no-repeat, linear-gradient(135deg, #FF8ABF 0%, #FF2E88 55%, #E5206F 100%)",
      linerCss: "url('/assets/templates/perfectely-pink-liner.svg') center / cover no-repeat, linear-gradient(135deg, #FF8ABF 0%, #FF2E88 55%, #E5206F 100%)",
      isOpen: true,
      isOpenUpward: true,
      shadowColor: "rgba(150,10,70,0.5)"
    },
    card: {
      artworkUrl: "/assets/templates/perfectely-pink-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/perfectely-pink-bg.svg",
      borderIllustration: "/assets/templates/perfectely-pink-bg.svg",
      backgroundColor: "#B01455",
      aspectRatio: "5x7",
      border: "1px solid rgba(0,0,0,0.12)",
      cssConfig: {
        backgroundColor: "#B01455",
        borderRadius: "12px",
        paperShadow: "0 18px 38px -6px rgba(146,10,66,0.55)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#B01455",
      borderRadius: "12px",
      paperShadow: "0 18px 38px -6px rgba(146,10,66,0.55)",
      aspectRatio: "5/7"
    },
    canvasData: {
      backgroundImage: "/assets/templates/perfectely-pink-bg.svg"
    },
    canvasConfig: {
      width: 600,
      height: 840,
      artworkUrl: "/assets/templates/perfectely-pink-bg.svg",
      crossOrigin: "anonymous",
      proxyUrl: "/api/proxy-image",
      locked: true,
      textObjects: [
        { id: "layer-kicker", role: "kicker", text: "LET'S GET DOLLED UP TO", x: 300, y: 344, fontFamily: "'Montserrat', sans-serif", fontSize: 13, fill: "#FFFFFF", fontWeight: 700, align: "center" },
        { id: "layer-purpose", role: "subtitle", text: "CELEBRATE AVA'S BIG DAY\nIN STYLE!", x: 300, y: 407, fontFamily: "'Montserrat', sans-serif", fontSize: 16, fill: "#FFFFFF", fontWeight: 800, align: "center" },
        { id: "layer-headline", role: "title", text: "Let's go party!", x: 300, y: 542, fontFamily: "'Chewy', 'Comic Sans MS', cursive", fontSize: 38, fill: "#FFFFFF", fontWeight: 700, align: "center" }
      ]
    },
    defaultTextLayers: [
      {
        id: "layer-kicker",
        key: "kicker",
        text: "LET'S GET DOLLED UP TO",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.8,
        color: "#FFFFFF",
        textAlign: "center",
        top: 41,
        left: 50
      },
      {
        id: "layer-purpose",
        key: "subtitle",
        text: "CELEBRATE AVA'S BIG DAY\nIN STYLE!",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 13,
        fontWeight: "800",
        lineHeight: 1.25,
        color: "#FFFFFF",
        textAlign: "center",
        top: 48.5,
        left: 50
      },
      {
        id: "layer-headline",
        key: "title",
        text: "Let's go party!",
        fontFamily: "'Chewy', 'Comic Sans MS', cursive",
        fontSize: 32,
        fontWeight: "700",
        lineHeight: 1.05,
        color: "#FFFFFF",
        textAlign: "center",
        top: 64.5,
        left: 50,
        textShadow: "0 3px 0 #C2185B, 0 6px 14px rgba(110,0,55,0.45)"
      }
    ]
  },
  {
    id: "royal-garden",
    title: "Disney: Royal Garden",
    name: "Disney: Royal Garden",
    category: "Birthday",
    badge: "Premium",
    isPremium: true,
    isEditable: true,
    isFeatured: true,
    priority: 95,
    sortOrder: 2,
    tags: ["Birthday", "Kids", "All"],
    envelopeColor: "#F0559B",
    linerColor: "#FBC7DE",
    envelopeLiner: "url('/assets/templates/royal-garden-liner.svg') center / cover no-repeat, linear-gradient(135deg, #FBC7DE 0%, #F0559B 60%, #DB4489 100%)",
    envelopeLinerUrl: "/assets/templates/royal-garden-liner.svg",
    artworkUrl: "/assets/templates/royal-garden-bg.svg",
    mockupUrl: "/assets/templates/royal-garden-mockup.svg",
    thumbnailUrl: "/assets/templates/royal-garden-mockup.svg",
    backdrop: {
      type: "texture",
      value: "/assets/backdrops/olive-green-texture.svg",
      color: "#EAF3E4",
      gradient: "radial-gradient(circle at 22% 18%, rgba(197,227,180,0.9) 0%, rgba(197,227,180,0) 45%), radial-gradient(circle at 82% 78%, rgba(127,173,110,0.65) 0%, rgba(127,173,110,0) 50%), linear-gradient(155deg, #F3F8EE 0%, #DCEBCF 55%, #C6DDB6 100%)"
    },
    envelope: {
      outerColor: "#F0559B",
      flapColor: "#E04488",
      linerPatternUrl: "/assets/templates/royal-garden-liner.svg",
      linerColor: "#FBC7DE",
      innerLiner: "url('/assets/templates/royal-garden-liner.svg') center / cover no-repeat, linear-gradient(135deg, #FBC7DE 0%, #F0559B 60%, #DB4489 100%)",
      linerCss: "url('/assets/templates/royal-garden-liner.svg') center / cover no-repeat, linear-gradient(135deg, #FBC7DE 0%, #F0559B 60%, #DB4489 100%)",
      isOpen: true,
      isOpenUpward: true,
      shadowColor: "rgba(140,30,85,0.45)"
    },
    card: {
      artworkUrl: "/assets/templates/royal-garden-bg.svg",
      decorativeBorderSvgUrl: "/assets/templates/royal-garden-bg.svg",
      borderIllustration: "/assets/templates/royal-garden-bg.svg",
      backgroundColor: "#FDF8F5",
      aspectRatio: "5x7",
      border: "1px solid rgba(0,0,0,0.06)",
      cssConfig: {
        backgroundColor: "#FDF8F5",
        borderRadius: "12px",
        paperShadow: "0 16px 34px -6px rgba(85,45,60,0.4)"
      }
    },
    innerCardLayer: {
      backgroundColor: "#FDF8F5",
      borderRadius: "12px",
      paperShadow: "0 16px 34px -6px rgba(85,45,60,0.4)",
      aspectRatio: "5/7"
    },
    canvasData: {
      backgroundImage: "/assets/templates/royal-garden-bg.svg"
    },
    canvasConfig: {
      width: 600,
      height: 840,
      artworkUrl: "/assets/templates/royal-garden-bg.svg",
      crossOrigin: "anonymous",
      proxyUrl: "/api/proxy-image",
      locked: true,
      textObjects: [
        { id: "layer-invite", role: "intro", text: "You're invited to the most magical party\nto celebrate", x: 300, y: 97, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 12, fill: "#D47A88", fontWeight: 500, align: "center" },
        { id: "layer-name", role: "title", text: "Bella's", x: 300, y: 164, fontFamily: "'Great Vibes', 'Brush Script MT', cursive", fontSize: 36, fill: "#D47A88", fontWeight: 400, align: "center" },
        { id: "layer-event", role: "heading", text: "Birthday", x: 300, y: 231, fontFamily: "'Great Vibes', 'Brush Script MT', cursive", fontSize: 32, fill: "#D47A88", fontWeight: 400, align: "center" },
        { id: "layer-datetime", role: "dateTime", text: "Saturday, June 14th at 11 am", x: 300, y: 315, fontFamily: "'Inter', sans-serif", fontSize: 13, fill: "#9C6870", fontWeight: 500, align: "center" },
        { id: "layer-venue", role: "venue", text: "Bella's Castle\n812 Fairy Tale Lane", x: 300, y: 370, fontFamily: "'Inter', sans-serif", fontSize: 12, fill: "#9C6870", fontWeight: 400, align: "center" }
      ]
    },
    defaultTextLayers: [
      {
        id: "layer-invite",
        key: "intro",
        text: "You're invited to the most magical party\nto celebrate",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontStyle: "italic",
        fontSize: 10.5,
        fontWeight: "500",
        lineHeight: 1.35,
        color: "#D47A88",
        textAlign: "center",
        top: 11.5,
        left: 50
      },
      {
        id: "layer-name",
        key: "title",
        text: "Bella's",
        fontFamily: "'Great Vibes', 'Brush Script MT', cursive",
        fontSize: 30,
        fontWeight: "400",
        lineHeight: 1.1,
        color: "#D47A88",
        textAlign: "center",
        top: 19.5,
        left: 50
      },
      {
        id: "layer-event",
        key: "heading",
        text: "Birthday",
        fontFamily: "'Great Vibes', 'Brush Script MT', cursive",
        fontSize: 27,
        fontWeight: "400",
        lineHeight: 1.1,
        color: "#D47A88",
        textAlign: "center",
        top: 27.5,
        left: 50
      },
      {
        id: "layer-datetime",
        key: "datetime",
        text: "Saturday, June 14th at 11 am",
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
        fontWeight: "500",
        letterSpacing: 0.4,
        color: "#9C6870",
        textAlign: "center",
        top: 37.5,
        left: 50
      },
      {
        id: "layer-venue",
        key: "venue",
        text: "Bella's Castle\n812 Fairy Tale Lane",
        fontFamily: "'Inter', sans-serif",
        fontSize: 10,
        fontWeight: "400",
        lineHeight: 1.5,
        color: "#9C6870",
        textAlign: "center",
        top: 44,
        left: 50
      }
    ]
  }
];

// -----------------------------------------------------------------------------
// THANKSGIVING / AUTUMN EDITABLE TEMPLATE CONFIGURATIONS
// Injected into the registry below (full canvas editability + envelope stage)
// -----------------------------------------------------------------------------
const THANKSGIVING_TEMPLATE_SEEDS: ThanksgivingTemplateSeed[] = [
  {
    "id": "template-everyones-family",
    "title": "Everyone's Family",
    "category": "Thanksgiving / Friendsgiving",
    "tier": "premium",
    "tags": ["Thanksgiving", "Friendsgiving", "Autumn", "Fall", "Feast", "All"],
    "dimensions": { "width": 600, "height": 840 },
    "envelope": {
      "enabled": true,
      "style": "kraft-paper",
      "linerPattern": "plaid-tan-green",
      "position": "left-angled-behind",
      "envelopeColor": "#B89772",
      "linerBorder": "#8C6D4F"
    },
    "stageBackdrop": {
      "type": "texture",
      "value": "/assets/backdrops/olive-green-texture.svg",
      "color": "#7E8A6B",
      "gradient": "url('/assets/backdrops/olive-green-texture.svg') center / cover no-repeat, linear-gradient(150deg, #8B9677 0%, #6F7B5F 100%)"
    },
    "canvasBackground": {
      "color": "#FAF5EC",
      "texture": "paper-grain",
      "artworkUrl": "/templates/assets/woodland-feast-table.svg",
      "artworkLock": true
    },
    "editableElements": [
      {
        "id": "text-title",
        "type": "text",
        "content": "LET'S FEAST!",
        "fontFamily": "Cinzel, 'Playfair Display', serif",
        "fontSize": 26,
        "fontWeight": "700",
        "letterSpacing": "3px",
        "color": "#5A2E17",
        "textAlign": "center",
        "x": 300,
        "y": 305,
        "zIndex": 12
      },
      {
        "id": "text-datetime",
        "type": "text",
        "content": "Thursday\n11/24 at 1 PM",
        "fontFamily": "Merriweather, serif",
        "fontSize": 15,
        "lineHeight": 1.4,
        "color": "#6B4423",
        "textAlign": "center",
        "x": 300,
        "y": 355,
        "zIndex": 12
      },
      {
        "id": "text-location",
        "type": "text",
        "content": "Our place\n56 Willow St.",
        "fontFamily": "Merriweather, serif",
        "fontSize": 14,
        "lineHeight": 1.4,
        "color": "#6B4423",
        "textAlign": "center",
        "x": 300,
        "y": 420,
        "zIndex": 12
      }
    ]
  },
  {
    "id": "template-give-thanks",
    "title": "Give Thanks",
    "category": "Thanksgiving",
    "tier": "premium",
    "tags": ["Thanksgiving", "Autumn", "Fall", "Turkey", "All"],
    "dimensions": { "width": 600, "height": 840 },
    "envelope": {
      "enabled": true,
      "style": "forest-green",
      "linerPattern": "warm-gingham",
      "position": "left-angled-behind",
      "envelopeColor": "#1D3B2E",
      "linerBorder": "#14281F"
    },
    "stageBackdrop": {
      "type": "texture",
      "value": "/assets/backdrops/off-white-linen.svg",
      "color": "#F6F1E8",
      "gradient": "url('/assets/backdrops/off-white-linen.svg') center / cover no-repeat, linear-gradient(160deg, #FAF6EE 0%, #EFE8DC 100%)"
    },
    "canvasBackground": {
      "color": "#FFF9E6",
      "artworkUrl": "/templates/assets/folk-art-turkey-leaves.svg",
      "artworkLock": true
    },
    "editableElements": [
      {
        "id": "text-heading",
        "type": "text",
        "content": "Give\nThanks.",
        "fontFamily": "'Caveat', 'Reenie Beanie', cursive",
        "fontSize": 48,
        "lineHeight": 1.1,
        "color": "#1C1C1C",
        "textAlign": "left",
        "x": 220,
        "y": 140,
        "zIndex": 12
      },
      {
        "id": "text-subtext",
        "type": "text",
        "content": "Please join us for an all-day\nThanksgiving celebration!",
        "fontFamily": "Inter, sans-serif",
        "fontSize": 13,
        "lineHeight": 1.4,
        "color": "#333333",
        "textAlign": "left",
        "x": 210,
        "y": 340,
        "zIndex": 12
      },
      {
        "id": "text-details",
        "type": "text",
        "content": "Thursday, November 24 at 12 PM\nOur place\n351 Riverway Blvd.",
        "fontFamily": "Inter, sans-serif",
        "fontSize": 12,
        "lineHeight": 1.5,
        "color": "#444444",
        "textAlign": "left",
        "x": 210,
        "y": 395,
        "zIndex": 12
      }
    ]
  },
  {
    "id": "template-thanksgiving-branches",
    "title": "Thanksgiving Branches",
    "category": "Thanksgiving Dinner",
    "tier": "free",
    "tags": ["Thanksgiving", "Dinner", "Autumn", "Botanical", "Fall", "All"],
    "dimensions": { "width": 600, "height": 840 },
    "envelope": {
      "enabled": false
    },
    "stageBackdrop": {
      "type": "texture",
      "value": "/assets/backdrops/subtle-white-marble.svg",
      "color": "#F3F1EE",
      "gradient": "url('/assets/backdrops/subtle-white-marble.svg') center / cover no-repeat, linear-gradient(160deg, #F7F5F2 0%, #EBE8E3 100%)"
    },
    "canvasBackground": {
      "color": "#EED8CB",
      "artworkUrl": "/templates/assets/botanical-pumpkin-etching.svg",
      "artworkLock": true
    },
    "editableElements": [
      {
        "id": "text-title",
        "type": "text",
        "content": "THANKS\nGIVING",
        "fontFamily": "'Playfair Display', serif",
        "fontSize": 42,
        "letterSpacing": "2px",
        "lineHeight": 1.1,
        "color": "#4A2216",
        "textAlign": "center",
        "x": 340,
        "y": 310,
        "zIndex": 12
      },
      {
        "id": "text-invite",
        "type": "text",
        "content": "Join us for dinner and drinks!",
        "fontFamily": "'Playfair Display', italic, serif",
        "fontSize": 15,
        "color": "#633122",
        "textAlign": "center",
        "x": 340,
        "y": 430,
        "zIndex": 12
      },
      {
        "id": "text-time-place",
        "type": "text",
        "content": "Thursday, November 23 at Noon\nOur home\n1321 Harvest Lane",
        "fontFamily": "'Playfair Display', serif",
        "fontSize": 13,
        "lineHeight": 1.5,
        "color": "#54281B",
        "textAlign": "center",
        "x": 340,
        "y": 480,
        "zIndex": 12
      }
    ]
  }
];

// Inject the Thanksgiving / Autumn templates into the registry
THANKSGIVING_TEMPLATE_SEEDS.forEach((seed) => {
  const built = buildEditableCanvasTemplate(seed);
  const existingIndex = EVITE_TEMPLATES.findIndex((e) => e.id === built.id);
  if (existingIndex >= 0) {
    EVITE_TEMPLATES[existingIndex] = built;
  } else {
    EVITE_TEMPLATES.push(built);
  }
});

// Register Home Page Exclusive Premium Templates
homeTemplatesData.forEach((ht) => {
  if (!EVITE_TEMPLATES.some((e) => e.id === ht.id)) {
    EVITE_TEMPLATES.push(ht);
  }
});

// Map for constant-time lookup by template ID
export const EVITE_TEMPLATES_CONFIG: Record<string, EviteTemplateSchema> = EVITE_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {} as Record<string, EviteTemplateSchema>);

// -----------------------------------------------------------------------------
// Backward-Compatible NEW_TEMPLATES Definition
// -----------------------------------------------------------------------------
export const NEW_TEMPLATES: NewTemplateData[] = EVITE_TEMPLATES.map((ev) => {
  const titleLayer = ev.defaultTextLayers.find(l => l.key === 'title') || ev.defaultTextLayers[0];
  const subLayer = ev.defaultTextLayers.find(l => l.key === 'subtitle' || l.key === 'intro' || l.key === 'header' || l.key === 'heading') || ev.defaultTextLayers[1];
  const dateLayer = ev.defaultTextLayers.find(l => l.key === 'datetime' || l.key === 'date' || l.key === 'details');
  const venueLayer = ev.defaultTextLayers.find(l => l.key === 'venue');
  const hostLayer = ev.defaultTextLayers.find(l => l.key === 'host');

  const textLayers: TemplateTextLayer[] = ev.defaultTextLayers.map(l => ({
    id: l.id,
    key: l.key,
    text: l.text,
    x: l.left,
    y: l.top,
    top: l.top,
    left: l.left,
    fontSize: l.fontSize,
    fontFamily: l.fontFamily,
    color: l.color,
    fontWeight: l.fontWeight,
    align: l.textAlign,
    textAlign: l.textAlign,
    casing: (l as any).casing || 'none',
    letterSpacing: typeof (l as any).letterSpacing === "number" ? (l as any).letterSpacing : (l as any).letterSpacing ? parseFloat(String((l as any).letterSpacing)) : 0.5,
    lineHeight: (l as any).lineHeight || 1.2,
    foilGradient: (l as any).foilGradient,
  }));

  const borderIllustration = (ev.card as any)?.borderIllustration || ev.card.artworkUrl;
  const safeArea = (ev.card as any)?.safeArea;
  const innerLiner = (ev.envelope as any)?.innerLiner || (ev.envelope as any)?.linerCss || (ev.envelope as any)?.linerPatternUrl;
  const shadowColor = (ev.envelope as any)?.shadowColor;

  const isBirthday = ev.category.toLowerCase().includes('birthday');
  const isHoliday = ev.category.toLowerCase().includes('holiday') || (ev as any).tags?.includes('Holiday');
  const isCorporate = ev.category.toLowerCase().includes('corporate') || (ev as any).tags?.includes('Corporate');

  return {
    id: ev.id,
    type: ev.category,
    category: ev.category,
    tags: (ev as any).tags && (ev as any).tags.length > 0
      ? (ev as any).tags
      : [ev.category, ...(isBirthday ? ['Birthday', 'Adult Birthday'] : []), ...(isHoliday ? ['Holiday', 'Corporate'] : []), ...(isCorporate ? ['Corporate', 'Holiday'] : []), 'All'],
    title: ev.title,
    badge: ev.badge || ((ev as any).isPremium ? 'Premium' : 'Free'),
    isPremium: Boolean((ev as any).isPremium) || (ev.badge || '').toUpperCase() === 'PREMIUM',
    subtitle: subLayer ? subLayer.text : ev.title,
    date: dateLayer ? dateLayer.text : 'Upcoming',
    time: '4:00 PM',
    host: hostLayer ? hostLayer.text : 'Hosted with Love',
    venue: venueLayer ? venueLayer.text : 'Venue TBD',
    gradient: ev.backdrop.value,
    accentColor: titleLayer ? titleLayer.color : '#C9A84C',
    emoji: ev.category === 'Wedding' ? '💍' : ev.category === 'bridal_shower' ? '💐' : ev.category === 'Baby Shower' ? '🍼' : ev.category === 'Holiday' ? '🎄' : '🎉',
    image: (ev as any).mockupUrl || (ev as any).thumbnailUrl || borderIllustration || ev.card.artworkUrl,
    mockupUrl: (ev as any).mockupUrl,
    thumbnailUrl: (ev as any).thumbnailUrl,
    decorationImage: borderIllustration || ev.card.artworkUrl,
    description: subLayer ? subLayer.text : `Join us for ${ev.title}`,
    backgroundColor: ev.card.backgroundColor,
    textColor: titleLayer ? titleLayer.color : '#1e293b',
    titleSize: titleLayer ? titleLayer.fontSize : 42,
    fontWeight: titleLayer ? titleLayer.fontWeight : '700',
    fontFamily: titleLayer ? titleLayer.fontFamily : 'Playfair Display',
    buttonColor: ev.envelope.outerColor,
    buttonRadius: 12,
    buttonText: 'RSVP to Celebrate',
    textAlignment: titleLayer ? titleLayer.textAlign : 'center',
    gallery: [],
    sections: [],
    isLandscape: false,
    swatches: [ev.envelope.outerColor, ev.card.backgroundColor],
    envelopeColor: (ev as any).envelopeColor || ev.envelope?.outerColor || "#5384db",
    linerColor: (ev as any).linerColor || (ev.envelope as any)?.linerColor || "#D4AF37",
    envelopeLiner: (ev as any).envelopeLiner || (ev.envelope as any)?.linerCss || (ev.envelope as any)?.liner || (ev.envelope as any)?.innerLiner || "repeating-linear-gradient(90deg, #ea5b95 0px, #ea5b95 11px, #ffffff 11px, #ffffff 22px)",
    linerPattern: ev.envelope?.linerPatternUrl || (ev.envelope as any)?.innerLiner,
    flapStyle: (ev.envelope as any)?.flapStyle || (ev as any).flapStyle || "triangle",
    isOpenUpward: (ev.envelope as any)?.isOpenUpward || false,
    textLayers,
    photoSlot: null,
    isPureCss: ev.isPureCss || false,
    backdrop: {
      color: ev.backdrop.value,
      value: ev.backdrop.value,
      gradient: (ev.backdrop as any)?.gradient || ev.backdrop.value,
      type: ev.backdrop.type,
    },
    envelope: {
      outerColor: ev.envelope?.outerColor || (ev as any).envelopeColor || "#5384db",
      flapColor: (ev.envelope as any)?.flapColor || ev.envelope?.outerColor || (ev as any).envelopeColor || "#7ba3e8",
      flapStyle: (ev.envelope as any)?.flapStyle || (ev as any).flapStyle || "triangle",
      position: (ev.envelope as any)?.position || "right",
      innerLiner,
      linerColor: (ev.envelope as any)?.linerColor || (ev as any).linerColor || "#D4AF37",
      shadowColor,
      liner: (ev.envelope as any)?.linerCss || (ev.envelope as any)?.liner || (ev.envelope as any)?.innerLiner || "repeating-linear-gradient(90deg, #ea5b95 0px, #ea5b95 11px, #ffffff 11px, #ffffff 22px)",
      linerPattern: ev.envelope?.linerPatternUrl || (ev.envelope as any)?.innerLiner || "vertical-pink-stripes",
      linerPatternUrl: ev.envelope?.linerPatternUrl || (ev.envelope as any)?.innerLiner || "vertical-pink-stripes",
      linerCss: (ev.envelope as any)?.linerCss || "repeating-linear-gradient(90deg, #ea5b95 0px, #ea5b95 11px, #ffffff 11px, #ffffff 22px)",
      isOpen: true,
      isOpenUpward: (ev.envelope as any)?.isOpenUpward || false,
    },
    card: {
      backgroundColor: ev.card.backgroundColor,
      border: (ev.card as any)?.border || ((ev.card as any)?.cssConfig?.border ? `${(ev.card as any).cssConfig.border.thickness || 1}px solid ${(ev.card as any).cssConfig.border.color || '#D4AF37'}` : '1px solid rgba(0,0,0,0.08)'),
      artworkUrl: borderIllustration || ev.card.artworkUrl,
      borderIllustration,
      safeArea,
      decorativeBorderSvgUrl: borderIllustration || ev.card.decorativeBorderSvgUrl || ev.card.artworkUrl,
      aspectRatio: ev.card.aspectRatio === 'square' ? 'square' : 'portrait',
      cssConfig: (ev.card as any)?.cssConfig,
    },
    innerCardLayer: (ev as any).innerCardLayer || {
      backgroundColor: ev.card.backgroundColor,
      borderRadius: (ev.card as any)?.cssConfig?.borderRadius || "14px",
      border: (ev.card as any)?.cssConfig?.border,
      paperShadow: (ev.card as any)?.cssConfig?.paperShadow || "0 12px 24px -4px rgba(0,0,0,0.25)",
      aspectRatio: "5/7",
    },
    defaultTextLayers: ev.defaultTextLayers,
    defaultTextBlocks: (ev as any).defaultTextBlocks,
    canvasData: (ev as any).canvasData,
    priority: (ev as any).priority,
    sortOrder: (ev as any).sortOrder,
    isEditable: (ev as any).isEditable,
    isFeatured: (ev as any).isFeatured,
    artworkUrl: (ev as any).artworkUrl || borderIllustration || ev.card.artworkUrl,
    envelopeLinerUrl: (ev as any).envelopeLinerUrl,
    canvasConfig: (ev as any).canvasConfig,
  };
});

export const NEW_TEMPLATES_CARD_ITEMS = NEW_TEMPLATES.map((t) => ({
  id: t.id,
  type: t.type,
  category: t.category,
  tags: t.tags,
  designer: t.designer,
  title: t.title,
  badge: t.badge,
  subtitle: t.subtitle,
  date: t.date,
  time: t.time,
  host: t.host,
  venue: t.venue,
  gradient: t.gradient,
  accentColor: t.accentColor,
  emoji: t.emoji,
  image: t.image,
  mockupUrl: (t as any).mockupUrl,
  thumbnailUrl: (t as any).thumbnailUrl,
  description: t.description,
  backgroundColor: t.backgroundColor,
  textColor: t.textColor,
  buttonColor: t.buttonColor,
  buttonText: t.buttonText,
  gallery: t.gallery,
  sections: t.sections,
  isLandscape: t.isLandscape,
  swatches: t.swatches,
  envelopeColor: t.envelopeColor,
  envelopeLiner: t.envelopeLiner,
  photoSlot: t.photoSlot,
  backdrop: t.backdrop,
  envelope: t.envelope,
  card: t.card,
  defaultTextLayers: t.defaultTextLayers,
  priority: t.priority,
  sortOrder: t.sortOrder,
  isEditable: t.isEditable,
  isFeatured: t.isFeatured,
  artworkUrl: t.artworkUrl,
  envelopeLinerUrl: t.envelopeLinerUrl,
  canvasConfig: t.canvasConfig,
}));

// -----------------------------------------------------------------------------
// Browse-grid ordering: pinned premium templates float to the top.
// `priority` (desc) wins; `sortOrder` (asc) breaks ties; array order is stable.
// -----------------------------------------------------------------------------
export const getTemplatePriority = (t: any): number => {
  if (t?.priority != null) return Number(t.priority) || 0;
  if (t?.isFeatured) return 100;
  return 0;
};

export const sortTemplatesByPriority = <T extends { id?: string }>(items: T[]): T[] =>
  items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const pa = getTemplatePriority(a.item);
      const pb = getTemplatePriority(b.item);
      if (pb !== pa) return pb - pa;
      const oa = Number((a.item as any)?.sortOrder ?? 0);
      const ob = Number((b.item as any)?.sortOrder ?? 0);
      if (oa !== ob) return oa - ob;
      return a.index - b.index;
    })
    .map((entry) => entry.item);

export const NEW_TEMPLATES_CONFIG: Record<string, NewTemplateData> = NEW_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {} as Record<string, NewTemplateData>);

export const NEW_TEMPLATE_DEFAULTS = NEW_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {} as Record<string, any>);

/**
 * Normalizes template background image URLs:
 * - Detects frontend static asset paths (/assets/, /templates/) and strips foreign backend/localhost hosts
 * - Upgrades insecure http:// URLs to https:// on HTTPS pages (preventing Mixed Content blocking)
 * - Safely handles relative paths, data URLs, and uploads
 */
export const normalizeTemplateImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;

  // 1. Direct external image links (Unsplash, Cloudinary, Imgur, Supabase, etc.)
  // If URL begins with http(s):// and is NOT from our backend/localhost host, preserve it directly!
  const isDirectExternal = /^https?:\/\/(?!localhost|127\.0\.0\.1|eventizersbackend\.vercel\.app)/i.test(trimmed);
  if (isDirectExternal) {
    if (typeof window !== "undefined" && window.location.protocol === "https:" && trimmed.startsWith("http://")) {
      return trimmed.replace(/^http:\/\//i, "https://");
    }
    return trimmed;
  }

  // 2. If URL contains /assets/ or /templates/ on our backend host or localhost, strip foreign host prefix
  const foreignAssetMatch = trimmed.match(/^(?:https?:\/\/(?:localhost|127\.0\.0\.1|eventizersbackend\.vercel\.app)(?::\d+)?)\/((?:assets|templates)\/.*)$/i);
  if (foreignAssetMatch) {
    return `/${foreignAssetMatch[1]}`;
  }

  // Relative frontend static assets
  if (trimmed.startsWith("/assets/") || trimmed.startsWith("/templates/")) {
    return trimmed;
  }

  // 3. If running in production and URL points to localhost /uploads/
  if (
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    (trimmed.includes("localhost") || trimmed.includes("127.0.0.1"))
  ) {
    const uploadMatch = trimmed.match(/^(?:https?:\/\/[^/]+)?(\/uploads\/.*)$/i);
    if (uploadMatch) {
      return uploadMatch[1];
    }
  }

  return trimmed;
};

/**
 * Dynamically register or update templates fetched from backend API.
 * Ensures website components, studio, and canvas seamlessly use templates from backend.
 */
export const registerDynamicTemplates = (backendTemplates: any[]) => {
  if (!Array.isArray(backendTemplates)) return;
  for (const bt of backendTemplates) {
    if (!bt || !bt.id) continue;
    let contentObj: any = {};
    if (typeof bt.content === 'string' && bt.content) {
      try { contentObj = JSON.parse(bt.content); } catch (_) {}
    } else if (typeof bt.content === 'object' && bt.content) {
      contentObj = bt.content;
    }

    const rawBg =
      bt.fullBackgroundImage ||
      bt.backgroundImage ||
      bt.canvasData?.backgroundImage ||
      contentObj.fullBackgroundImage ||
      contentObj.backgroundImage ||
      contentObj.canvasData?.backgroundImage ||
      bt.backgroundUrl ||
      contentObj.backgroundUrl ||
      bt.card?.fullArtworkUrl ||
      bt.card?.artworkUrl ||
      contentObj.card?.fullArtworkUrl ||
      contentObj.card?.artworkUrl ||
      bt.imageUrl ||
      bt.thumbnailUrl ||
      bt.image ||
      null;

    const rawBgStr = typeof rawBg === 'object' && rawBg !== null
      ? (rawBg.url || rawBg.src || null)
      : (typeof rawBg === 'string' ? rawBg : null);

    const bgUrl = normalizeTemplateImageUrl(rawBgStr);

    const layers =
      bt.layers ||
      bt.defaultTextLayers ||
      bt.textLayers ||
      bt.canvasData?.layers ||
      contentObj.defaultTextLayers ||
      contentObj.layers ||
      contentObj.canvasData?.layers ||
      [];

    const cleanCard = {
      backgroundColor: "#ffffff",
      aspectRatio: "5x7",
      ...(contentObj.card || {}),
      ...(bt.card || {}),
      artworkUrl: bgUrl || normalizeTemplateImageUrl(bt.card?.artworkUrl || contentObj.card?.artworkUrl),
      fullArtworkUrl: bgUrl || normalizeTemplateImageUrl(bt.card?.fullArtworkUrl || bt.card?.artworkUrl),
    };

    const transformed: NewTemplateData = {
      ...bt,
      id: bt.id,
      title: bt.name || bt.title || "Template",
      category: bt.category || "General",
      badge: bt.badge || (bt.isPremium ? "Premium" : "Free"),
      isPremium: Boolean(bt.isPremium),
      isLayered: Boolean(bt.isLayered || contentObj.isLayered),
      image: bgUrl || normalizeTemplateImageUrl(bt.thumbnailUrl || bt.imageUrl || bt.image) || "/assets/templates/chic-dinner-cake-mockup.svg",
      backgroundImage: bgUrl,
      fullBackgroundImage: bgUrl,
      canvasData: {
        backgroundImage: bgUrl,
        layers: layers,
        ...(bt.canvasData || contentObj.canvasData || {}),
      },
      gradient: bt.gradient || contentObj.gradient || bt.backdrop?.gradient || (bgUrl ? undefined : "linear-gradient(135deg, #FAF7F2 0%, #EDE6D8 100%)"),
      accentColor: bt.accentColor || contentObj.accentColor || bt.envelope?.linerColor || "#D4AF37",
      backdrop: bt.backdrop || contentObj.backdrop || { color: "#FAF7F2", type: "texture", value: "/assets/backdrops/white-embossed-floral.svg" },
      envelope: bt.envelope || contentObj.envelope || { outerColor: "#111111", flapColor: "#111111", linerCss: "", linerColor: "#D4AF37", isOpen: true },
      card: cleanCard,
      defaultTextLayers: layers,
      textLayers: layers,
      layers: layers,
      priority: bt.priority ?? contentObj.priority,
      sortOrder: bt.sortOrder ?? contentObj.sortOrder,
      isEditable: bt.isEditable ?? contentObj.isEditable,
      isFeatured: bt.isFeatured ?? contentObj.isFeatured,
      artworkUrl: bt.artworkUrl || contentObj.artworkUrl || bgUrl,
      envelopeLinerUrl: bt.envelopeLinerUrl || contentObj.envelopeLinerUrl,
      canvasConfig: bt.canvasConfig || contentObj.canvasConfig,
    };
    NEW_TEMPLATES_CONFIG[bt.id] = transformed;
    NEW_TEMPLATES_CONFIG[bt.id.toLowerCase()] = transformed;
    const existingIdx = NEW_TEMPLATES.findIndex(t => t.id === bt.id || t.id.toLowerCase() === bt.id.toLowerCase());
    if (existingIdx >= 0) {
      NEW_TEMPLATES[existingIdx] = transformed;
    } else {
      NEW_TEMPLATES.push(transformed);
    }
  }
};

export const getEviteTemplate = (templateId?: string | null): EviteTemplateSchema | null => {
  if (!templateId) return null;
  if (EVITE_TEMPLATES_CONFIG[templateId]) return EVITE_TEMPLATES_CONFIG[templateId];
  const cleanId = templateId.trim().toLowerCase();
  const matchedKey = Object.keys(EVITE_TEMPLATES_CONFIG).find(k => k.toLowerCase() === cleanId);
  return matchedKey ? EVITE_TEMPLATES_CONFIG[matchedKey] : null;
};

export const getTemplateConfig = (templateId?: string | null): NewTemplateData | null => {
  if (!templateId) return null;
  if (NEW_TEMPLATES_CONFIG[templateId]) return NEW_TEMPLATES_CONFIG[templateId];
  const cleanId = templateId.trim().toLowerCase();
  const matchedKey = Object.keys(NEW_TEMPLATES_CONFIG).find(k => k.toLowerCase() === cleanId);
  if (matchedKey) return NEW_TEMPLATES_CONFIG[matchedKey];

  const byPartial = Object.values(NEW_TEMPLATES_CONFIG).find(t =>
    t.id.toLowerCase().includes(cleanId) ||
    cleanId.includes(t.id.toLowerCase()) ||
    t.title.toLowerCase().replace(/\s+/g, '-').includes(cleanId) ||
    cleanId.includes(t.title.toLowerCase().replace(/\s+/g, '-'))
  );
  if (byPartial) return byPartial;
  return null;
};

export const isTemplatePremium = (tplOrId?: any): boolean => {
  if (!tplOrId) return false;
  if (typeof tplOrId === 'string') {
    const cfg = getTemplateConfig(tplOrId);
    return isTemplatePremium(cfg);
  }
  if (tplOrId.isPremium === true) return true;
  const badge = (tplOrId.badge || '').trim().toUpperCase();
  if (badge === 'PREMIUM') return true;
  const tplId = tplOrId.id || tplOrId.templateId || tplOrId.activeTemplateId;
  if (tplId && typeof tplId === 'string') {
    const cfg = getTemplateConfig(tplId);
    if (cfg && cfg !== tplOrId) {
      return isTemplatePremium(cfg);
    }
  }
  return false;
};

export const isTemplateFree = (tplOrId?: any): boolean => {
  return !isTemplatePremium(tplOrId);
};

export const getEviteCardTemplate = (templateId?: string | null): EviteCardTemplate | null => {
  if (!templateId) return null;
  const t = getTemplateConfig(templateId);
  if (!t) return null;
  const rawLayers = (t as any).defaultTextBlocks && (t as any).defaultTextBlocks.length > 0
    ? (t as any).defaultTextBlocks
    : (t.defaultTextLayers || t.textLayers || []);

  const borderIllustration = (t.card as any)?.borderIllustration || (t.card as any)?.decorativeBorderSvgUrl || (t.card as any)?.artworkUrl || t.decorationImage || t.image;
  const innerLiner = (t.envelope as any)?.innerLiner || (t.envelope as any)?.linerCss || (t.envelope as any)?.linerPatternUrl || t.envelopeLiner || "gold-foil";

  return {
    id: t.id,
    name: t.title,
    category: t.category,
    backdrop: {
      color: (t.backdrop as any)?.color || (t.backdrop as any)?.value || t.backgroundColor || "#FAF8F5",
      type: (t.backdrop as any)?.type || "color",
      value: (t.backdrop as any)?.value || t.backgroundColor || "#FAF8F5",
    },
    envelope: {
      outerColor: (t.envelope as any)?.outerColor || t.envelopeColor || "#781d60",
      flapColor: (t.envelope as any)?.flapColor || (t.envelope as any)?.outerColor || t.envelopeColor || "#781d60",
      flapStyle: (t.envelope as any)?.flapStyle || (t as any).flapStyle || "triangle",
      isOpenUpward: (t.envelope as any)?.isOpenUpward ?? (t as any).isOpenUpward ?? false,
      linerPattern: innerLiner,
      linerPatternUrl: innerLiner,
      innerLiner,
      shadowColor: (t.envelope as any)?.shadowColor,
      isOpen: true,
    } as any,
    card: {
      backgroundColor: (t.card as any)?.backgroundColor || t.backgroundColor || "#FAF8F5",
      decorativeBorderSvgUrl: borderIllustration,
      artworkUrl: borderIllustration,
      borderIllustration,
      safeArea: (t.card as any)?.safeArea,
      aspectRatio: (t.card as any)?.aspectRatio === "square" ? "square" : "portrait",
    } as any,
    textLayers: rawLayers.map((tl: any) => {
      const rawTop = tl.position?.top !== undefined ? tl.position.top : (tl.top !== undefined ? tl.top : (tl.y !== undefined ? tl.y : 50));
      const rawLeft = tl.position?.left !== undefined ? tl.position.left : (tl.left !== undefined ? tl.left : (tl.x !== undefined ? tl.x : 50));
      const topNum = typeof rawTop === "string" ? parseFloat(rawTop.replace("%", "")) : rawTop;
      const leftNum = typeof rawLeft === "string" ? parseFloat(rawLeft.replace("%", "")) : rawLeft;
      return {
        id: tl.id,
        key: tl.key || tl.id || "title",
        text: tl.text,
        fontFamily: tl.fontFamily,
        fontSize: tl.fontSize,
        fontWeight: tl.fontWeight || 500,
        fontStyle: tl.fontStyle,
        color: tl.color,
        textAlign: tl.textAlign || tl.align || "center",
        top: isNaN(topNum) ? 50 : topNum,
        left: isNaN(leftNum) ? 50 : leftNum,
        letterSpacing: typeof tl.letterSpacing === "string" ? parseFloat(tl.letterSpacing) : tl.letterSpacing,
        lineHeight: tl.lineHeight,
      };
    }),
  };
};

export const NEW_FALLBACK_TEMPLATES = NEW_TEMPLATES.map((t) => ({
  id: t.id,
  name: t.title,
  category: t.category,
  badge: t.badge,
  content: JSON.stringify({
    gradient: t.gradient,
    accentColor: t.accentColor,
    emoji: t.emoji,
    host: t.host,
    venue: t.venue,
    description: t.description,
    image: t.image,
    backdrop: t.backdrop,
    envelope: t.envelope,
    card: t.card,
    defaultTextLayers: t.defaultTextLayers,
  }),
  isPremium: false,
}));

export const NEW_TEMPLATE_IMAGES = {
  ...NEW_TEMPLATES.reduce((acc, t) => {
    acc[t.id] = t.image;
    return acc;
  }, {} as Record<string, string>)
};

export const NEW_TEMPLATE_STYLES = NEW_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = {
    gradient: t.gradient,
    accentColor: t.accentColor,
    emoji: t.emoji,
    imageUrl: t.image,
    host: t.host,
    venue: t.venue,
    description: t.description,
  };
  return acc;
}, {} as Record<string, any>);
