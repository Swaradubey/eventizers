// =============================================================================
// Evite 4-Layer Decoupled Architecture - Template Registry & Schema Definition
// Source of Truth: All templates define isolated backdrop, envelope, card artwork,
// and dynamic live text layers without baked-in typography.
// =============================================================================

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
  border: CssBorderConfig;
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

export interface EviteTemplateSchema {
  id: string;
  title: string;
  name?: string;
  category: 'Baby Shower' | 'Wedding' | 'Birthday' | 'All';
  backdrop: {
    type: 'color' | 'texture';
    value: string; // e.g. '#9c7cb6' or a pure CSS gradient string
    color?: string;
    gradient?: string;  // pure CSS gradient overriding value
  };
  envelope: {
    outerColor: string;
    linerPatternUrl: string; // empty string for pure-CSS templates
    linerCss?: string;       // pure CSS gradient/pattern string for liner
    linerPattern?: string;
    isOpen: boolean;
  };
  card: {
    artworkUrl: string;             // '' for pure-CSS templates
    decorativeBorderSvgUrl?: string;// '' for pure-CSS templates
    backgroundColor: string;
    aspectRatio: '5x7' | 'square' | 'portrait';
    cssConfig?: CssCardConfig;      // populated for pure-CSS templates
    decorations?: any[];
    decorativeImages?: string[];
    illustrationLayers?: any[];
    stickerElements?: any[];
  };
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
    foilGradient?: string;
    letterSpacing?: number;
    lineHeight?: number;
    casing?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  }>;
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
  envelopeLiner: string;
  textLayers?: TemplateTextLayer[];
  photoSlot?: PhotoSlot | null;
  // 4-Layer Evite Decoupled Fields
  backdrop: EviteTemplateSchema['backdrop'];
  envelope: EviteTemplateSchema['envelope'];
  card: EviteTemplateSchema['card'];
  defaultTextLayers: EviteTemplateSchema['defaultTextLayers'];
}

// -----------------------------------------------------------------------------
// STANDARDIZED EVITE TEMPLATES REGISTRY (4-Layer Decoupled Architecture)
// -----------------------------------------------------------------------------
export const EVITE_TEMPLATES: EviteTemplateSchema[] = [
  {
    "id": "tpl-abstract-nature-party",
    "title": "Abstract Nature Party",
    "category": "Wedding",
    "backdrop": {
      "type": "color",
      "value": "linear-gradient(135deg, #F9F5EE 0%, #EFE7DA 100%)",
      "color": "#F9F5EE",
      "gradient": "linear-gradient(135deg, #F9F5EE 0%, #EFE7DA 100%)"
    },
    "envelope": {
      "outerColor": "#3F5E3D",
      "linerPatternUrl": "floral-liner",
      "linerCss": "repeating-linear-gradient(45deg, #C4607B 0px, #C4607B 10px, #FAF3E8 10px, #FAF3E8 20px)",
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
  }
];

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
  const subLayer = ev.defaultTextLayers.find(l => l.key === 'subtitle') || ev.defaultTextLayers[1];
  const dateLayer = ev.defaultTextLayers.find(l => l.key === 'datetime' || l.key === 'date');
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
    letterSpacing: (l as any).letterSpacing !== undefined ? (l as any).letterSpacing : 0.5,
    lineHeight: (l as any).lineHeight || 1.2,
    foilGradient: (l as any).foilGradient,
  }));

  return {
    id: ev.id,
    type: ev.category,
    category: ev.category,
    tags: [ev.category, 'All'],
    title: ev.title,
    badge: 'Free',
    subtitle: subLayer ? subLayer.text : ev.title,
    date: dateLayer ? dateLayer.text : 'Upcoming',
    time: '4:00 PM',
    host: hostLayer ? hostLayer.text : 'Hosted with Love',
    venue: venueLayer ? venueLayer.text : 'Venue TBD',
    gradient: ev.backdrop.value,
    accentColor: titleLayer ? titleLayer.color : '#C9A84C',
    emoji: ev.category === 'Wedding' ? '💍' : ev.category === 'Baby Shower' ? '🍼' : '🎉',
    image: ev.card.artworkUrl,
    decorationImage: ev.card.artworkUrl,
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
    envelopeColor: ev.envelope?.outerColor || "#5384db",
    envelopeLiner: (ev.envelope as any)?.linerCss || (ev.envelope as any)?.liner || "repeating-linear-gradient(90deg, #ea5b95 0px, #ea5b95 11px, #ffffff 11px, #ffffff 22px)",
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
      outerColor: ev.envelope?.outerColor || "#5384db",
      flapColor: (ev.envelope as any)?.flapColor || "#7ba3e8",
      liner: (ev.envelope as any)?.linerCss || (ev.envelope as any)?.liner || "repeating-linear-gradient(90deg, #ea5b95 0px, #ea5b95 11px, #ffffff 11px, #ffffff 22px)",
      linerPattern: ev.envelope?.linerPatternUrl || "vertical-pink-stripes",
      linerPatternUrl: ev.envelope?.linerPatternUrl || "vertical-pink-stripes",
      linerCss: (ev.envelope as any)?.linerCss || "repeating-linear-gradient(90deg, #ea5b95 0px, #ea5b95 11px, #ffffff 11px, #ffffff 22px)",
      isOpen: true,
    },
    card: {
      backgroundColor: ev.card.backgroundColor,
      border: (ev.card as any)?.border || ((ev.card as any)?.cssConfig?.border ? `${(ev.card as any).cssConfig.border.thickness || 1}px solid ${(ev.card as any).cssConfig.border.color || '#D4AF37'}` : '1px solid rgba(0,0,0,0.08)'),
      artworkUrl: ev.card.artworkUrl,
      decorativeBorderSvgUrl: ev.card.decorativeBorderSvgUrl || ev.card.artworkUrl,
      aspectRatio: ev.card.aspectRatio === 'square' ? 'square' : 'portrait',
      cssConfig: (ev.card as any)?.cssConfig,
    },
    defaultTextLayers: ev.defaultTextLayers,
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
}));

export const NEW_TEMPLATES_CONFIG: Record<string, NewTemplateData> = NEW_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {} as Record<string, NewTemplateData>);

export const NEW_TEMPLATE_DEFAULTS = NEW_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {} as Record<string, any>);

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

export const getEviteCardTemplate = (templateId?: string | null): EviteCardTemplate | null => {
  if (!templateId) return null;
  const t = getTemplateConfig(templateId);
  if (!t) return null;
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
      linerPattern: (t.envelope as any)?.linerPattern || (t.envelope as any)?.linerPatternUrl || t.envelopeLiner || "gold-foil",
      linerPatternUrl: (t.envelope as any)?.linerPatternUrl || t.envelopeLiner || "gold-foil",
      isOpen: true,
    },
    card: {
      backgroundColor: (t.card as any)?.backgroundColor || t.backgroundColor || "#FAF8F5",
      decorativeBorderSvgUrl: (t.card as any)?.decorativeBorderSvgUrl || (t.card as any)?.artworkUrl || t.decorationImage || t.image,
      artworkUrl: (t.card as any)?.artworkUrl || t.decorationImage || t.image,
      aspectRatio: (t.card as any)?.aspectRatio === "square" ? "square" : "portrait",
    },
    textLayers: (t.defaultTextLayers || t.textLayers || []).map((tl: any) => ({
      id: tl.id,
      key: tl.key || "title",
      text: tl.text,
      fontFamily: tl.fontFamily,
      fontSize: tl.fontSize,
      fontWeight: tl.fontWeight,
      color: tl.color,
      textAlign: tl.textAlign || tl.align || "center",
      top: tl.top !== undefined ? tl.top : (tl.y !== undefined ? tl.y : 50),
      left: tl.left !== undefined ? tl.left : (tl.x !== undefined ? tl.x : 50),
    })),
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

export const NEW_TEMPLATE_IMAGES = NEW_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = t.image;
  return acc;
}, {} as Record<string, string>);

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
