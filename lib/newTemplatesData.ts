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
    id: "tpl-electric-outline",
    title: "Electric Outline",
    category: "Birthday",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #0A0B10 0%, #171923 100%)"},
    envelope: {"outerColor":"#FACC15","linerPatternUrl":"linear-gradient(135deg, #D4FF00 0%, #00D2FF 100%)","isOpen":true},
    card: {"artworkUrl":"/assets/templates/electric-outline-bg.svg","backgroundColor":"#0A0B10","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-title",
                "key": "title",
                "text": "BRUH, YOU IN?",
                "fontFamily": "'Montserrat', sans-serif",
                "fontSize": 44,
                "color": "#FFEE00",
                "fontWeight": "900",
                "textAlign": "center",
                "top": 33,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "JOIN US FOR A PARTY TO CELEBRATE",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 13,
                "color": "#38BDF8",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 48,
                "left": 50
          },
          {
                "id": "layer-celebrant",
                "key": "celebrant",
                "text": "OTTO'S 8TH BIRTHDAY",
                "fontFamily": "'Montserrat', sans-serif",
                "fontSize": 32,
                "color": "#00F0FF",
                "fontWeight": "800",
                "textAlign": "center",
                "top": 61,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "SATURDAY, AUGUST 4TH AT 2:30 P.M.",
                "fontFamily": "'Montserrat', sans-serif",
                "fontSize": 14,
                "color": "#FFEE00",
                "fontWeight": "800",
                "textAlign": "center",
                "top": 74,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "ZERO GRAVITY PARK",
                "fontFamily": "'Montserrat', sans-serif",
                "fontSize": 15,
                "color": "#4ADE80",
                "fontWeight": "800",
                "textAlign": "center",
                "top": 81,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-cake-and-confetti",
    title: "Cake and Confetti",
    category: "Birthday",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FAF6EE 0%, #F5EFEB 100%)"},
    envelope: {"outerColor":"#F7F5F0","linerPatternUrl":"radial-gradient(ellipse at center, #E6C875 0%, #C49B45 60%, #997328 100%)","isOpen":true},
    card: {"artworkUrl":"/assets/templates/cake-and-confetti-bg.svg","backgroundColor":"#FAF6EE","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-greeting",
                "key": "greeting",
                "text": "JAMIE IS",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 16,
                "color": "#3D2D24",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 41,
                "left": 50
          },
          {
                "id": "layer-title",
                "key": "title",
                "text": "TURNING 6",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 34,
                "color": "#2B2118",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 47,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "& WE'RE HAVING A PARTY",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#3D2D24",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 53,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "SATURDAY, JULY 8TH AT NOON",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 12,
                "color": "#3D2D24",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 59,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "the arable residence",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 17,
                "color": "#5C4A3E",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 67,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-hype-night",
    title: "Hype Night",
    category: "Birthday",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #14131A 0%, #2E1065 100%)"},
    envelope: {"outerColor":"#F9C5D5","linerPatternUrl":"radial-gradient(circle at 50% 50%, #FF66B2 0%, #D92080 50%, #991054 100%)","isOpen":true},
    card: {"artworkUrl":"/assets/templates/hype-night-bg.svg","backgroundColor":"#14131A","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-greeting",
                "key": "greeting",
                "text": "PLEASE JOIN US TO CELEBRATE",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 12,
                "color": "#D8B4FE",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 25,
                "left": 72
          },
          {
                "id": "layer-title",
                "key": "title",
                "text": "ALEXANDER'S\n8TH BIRTHDAY",
                "fontFamily": "'Montserrat', sans-serif",
                "fontSize": 24,
                "color": "#FF2A85",
                "fontWeight": "900",
                "textAlign": "center",
                "top": 42,
                "left": 72
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "SUNDAY, OCTOBER 12TH AT 2 PM",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 13,
                "color": "#FFFFFF",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 62,
                "left": 72
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "ZERO GRAVITY ADVENTURE PARK",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 12,
                "color": "#CBD5E1",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 78,
                "left": 72
          }
    ],
  },
  {
    id: "tpl-floating-cakes",
    title: "Floating Cakes",
    category: "Birthday",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 100%)"},
    envelope: {"outerColor":"#F5CAD5","linerPatternUrl":"sprinkles","isOpen":true},
    card: {"artworkUrl":"/assets/templates/floating-cakes-bg.svg","backgroundColor":"#FAF8F5","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-title",
                "key": "title",
                "text": "Mia's turning 5",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 34,
                "color": "#2B2D31",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 42,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "Join us for a celebration full of confetti and cake",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 14,
                "color": "#5C4A3E",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 57,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "Sunday, April 19th at 1 p.m.",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 14,
                "color": "#475569",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 66,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "The Arable Residence, Brooklyn",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 14,
                "color": "#475569",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 73,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-friendship-charms",
    title: "Friendship Charms",
    category: "Birthday",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FAF8F2 0%, #FEE2E2 100%)"},
    envelope: {"outerColor":"#F7BABA","linerPatternUrl":"charms","isOpen":true},
    card: {"artworkUrl":"/assets/templates/friendship-charms-bg.svg","backgroundColor":"#FAF8F2","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-title",
                "key": "title",
                "text": "FERN IS TURNING 8",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 28,
                "color": "#166534",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 59,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "Join us for a celebration",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 15,
                "color": "#475569",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 66,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "Friday, August 12th at 3 in the afternoon",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 13,
                "color": "#334155",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 74,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "Our Place",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 15,
                "color": "#475569",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 83,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-sporty-frame",
    title: "Sporty Frame",
    category: "Birthday",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FAF9F5 0%, #F0FDF4 100%)"},
    envelope: {"outerColor":"#0C9744","linerPatternUrl":"sports","isOpen":true},
    card: {"artworkUrl":"/assets/templates/sporty-frame-bg.svg","backgroundColor":"#FAF9F5","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-title",
                "key": "title",
                "text": "LET'S HAVE A BALL!",
                "fontFamily": "'Montserrat', sans-serif",
                "fontSize": 32,
                "color": "#0284C7",
                "fontWeight": "900",
                "textAlign": "center",
                "top": 44,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "JOIN US TO CELEBRATE TOM'S SEVENTH BIRTHDAY",
                "fontFamily": "'Montserrat', sans-serif",
                "fontSize": 12,
                "color": "#1E293B",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 58,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "SUNDAY, JULY 1ST • 3 PM - 5 PM",
                "fontFamily": "'Montserrat', sans-serif",
                "fontSize": 13,
                "color": "#0284C7",
                "fontWeight": "800",
                "textAlign": "center",
                "top": 69,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "MITCHELL PARK",
                "fontFamily": "'Montserrat', sans-serif",
                "fontSize": 13,
                "color": "#1E293B",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 75,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-garden-brunch",
    title: "Pastel Garden Brunch",
    category: "Wedding",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FDFBF7 0%, #F7F3EC 100%)"},
    envelope: {"outerColor":"#A8C3B0","linerPatternUrl":"pink-gingham","isOpen":true},
    card: {"artworkUrl":"/assets/templates/pastel-garden-brunch-bg.svg","backgroundColor":"#FDFBF7","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-intro",
                "key": "intro",
                "text": "You are cordially invited to a",
                "fontFamily": "'Caveat', cursive",
                "fontSize": 15,
                "color": "#607258",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 45,
                "left": 50
          },
          {
                "id": "layer-title",
                "key": "title",
                "text": "garden brunch",
                "fontFamily": "'Caveat', cursive",
                "fontSize": 38,
                "color": "#6E885B",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 53,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "to celebrate",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#8C9E87",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 58,
                "left": 50
          },
          {
                "id": "layer-names",
                "key": "celebrant",
                "text": "Amanda Sanders",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 25,
                "color": "#54684E",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 65,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "Saturday, April 19th at 11 am",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 12,
                "color": "#72846E",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 73,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "1272 Misen Avenue",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#8E9E8B",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 78,
                "left": 50
          },
          {
                "id": "layer-rsvp",
                "key": "rsvp",
                "text": "Mimosas & light bites will be served",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 11,
                "color": "#7B8C78",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 83,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-floral-wreath-sophia",
    title: "Floral Wreath Sophia Henry",
    category: "Wedding",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FCFCF9 0%, #F6F5F0 100%)"},
    envelope: {"outerColor":"#C4A482","linerPatternUrl":"sage-mist","isOpen":true},
    card: {"artworkUrl":"/assets/templates/floral-wreath-sophia-bg.svg","backgroundColor":"#FCFCF9","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-intro",
                "key": "intro",
                "text": "JOIN US TO CELEBRATE",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 10,
                "color": "#7C8879",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 38,
                "left": 50
          },
          {
                "id": "layer-title",
                "key": "title",
                "text": "SOPHIA\nHENRY",
                "fontFamily": "'Cinzel', serif",
                "fontSize": 30,
                "color": "#242A24",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 49,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "Saturday, August 2nd at 2pm",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 12,
                "color": "#546051",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 59,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "50 Rose Avenue Road",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#6C7A69",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 64,
                "left": 50
          },
          {
                "id": "layer-location",
                "key": "venue",
                "text": "Danville, AL",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#7C8A79",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 68,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-blue-hydrangeas",
    title: "Blue Hydrangeas Morgan & Kevin",
    category: "Wedding",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FFFFFF 0%, #F9FBFD 100%)"},
    envelope: {"outerColor":"#9BB4CE","linerPatternUrl":"silver-foil","isOpen":true},
    card: {"artworkUrl":"/assets/templates/blue-hydrangeas-bg.svg","backgroundColor":"#FFFFFF","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-intro",
                "key": "intro",
                "text": "JOIN US TO CELEBRATE",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 10,
                "color": "#5A6578",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 17,
                "left": 50
          },
          {
                "id": "layer-title",
                "key": "title",
                "text": "Morgan Woods\n&\nKevin Barnes",
                "fontFamily": "'Dancing Script', cursive",
                "fontSize": 32,
                "color": "#1E2530",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 30,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "SATURDAY, APRIL 19TH\nat 7 o'clock in the evening",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#3B4859",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 44,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "THE WASHINGTON HOTEL",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#2D3748",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 52,
                "left": 50
          },
          {
                "id": "layer-location",
                "key": "venue",
                "text": "427 Lafayette Rd, Nashville, TN",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 10,
                "color": "#64748B",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 56,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-minimalist-bella-carter",
    title: "Minimalist Bella & Carter",
    category: "Wedding",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FCFCFA 0%, #F7F6F2 100%)"},
    envelope: {"outerColor":"#ECE8E1","linerPatternUrl":"ivory-linen","isOpen":true},
    card: {"artworkUrl":"/assets/templates/minimalist-bella-carter-bg.svg","backgroundColor":"#FCFCFA","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-title",
                "key": "title",
                "text": "Bella\n&\nCarter",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 40,
                "color": "#1C1C1C",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 50,
                "left": 27
          },
          {
                "id": "layer-intro",
                "key": "intro",
                "text": "Together with our families,\nwe joyfully invite you to\ncelebrate our wedding on",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#4B4B4B",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 38,
                "left": 73
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "07 / 18 / 2026",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 20,
                "color": "#111111",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 55,
                "left": 73
          },
          {
                "id": "layer-time",
                "key": "datetime",
                "text": "at 5 o'clock in the evening",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#555555",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 67,
                "left": 73
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "Wildwood Forest",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 12,
                "color": "#222222",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 74,
                "left": 73
          },
          {
                "id": "layer-location",
                "key": "venue",
                "text": "Portland, Oregon",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 10,
                "color": "#666666",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 79,
                "left": 73
          }
    ],
  },
  {
    id: "tpl-blue-botanical",
    title: "Blue Botanical Tiffany & Michael",
    category: "Wedding",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FFFFFF 0%, #FBFDFE 100%)"},
    envelope: {"outerColor":"#102A54","linerPatternUrl":"silver-foil","isOpen":true},
    card: {"artworkUrl":"/assets/templates/blue-botanical-bg.svg","backgroundColor":"#FFFFFF","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-intro",
                "key": "intro",
                "text": "Please join us for",
                "fontFamily": "'Dancing Script', cursive",
                "fontSize": 22,
                "color": "#3B4A60",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 28,
                "left": 50
          },
          {
                "id": "layer-title",
                "key": "title",
                "text": "TIFFANY JONES\nand\nMICHAEL NGUYEN",
                "fontFamily": "'Cinzel', serif",
                "fontSize": 21,
                "color": "#141B26",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 41,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "Please join us for this special occasion.",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#4B586E",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 57,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "Friday, August 14th @ 5 PM",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 12,
                "color": "#243042",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 63,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "The Jones Smith Venue",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 12,
                "color": "#4B586E",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 68,
                "left": 50
          },
          {
                "id": "layer-location",
                "key": "venue",
                "text": "123 Floral Street St, Columbus, OH",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 10,
                "color": "#6B798F",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 72,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-winter-foliage",
    title: "Winter Foliage",
    category: "Baby Shower",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FCFAF5 0%, #F2ECE0 100%)"},
    envelope: {"outerColor":"#C93B4E","linerPatternUrl":"gold-foil","isOpen":true},
    card: {"artworkUrl":"/assets/templates/winter-foliage-bg.svg","backgroundColor":"#FCFAF5","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-greeting",
                "key": "greeting",
                "text": "PLEASE JOIN US FOR",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#6B7869",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 34,
                "left": 50
          },
          {
                "id": "layer-celebrant",
                "key": "celebrant",
                "text": "Julia's Very Merry\nBaby Shower",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 34,
                "color": "#751824",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 44,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "HONORING BABY GIRL HARPER",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 12,
                "color": "#7B8878",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 53,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "SATURDAY, DECEMBER 12TH\nAT 2:00 IN THE AFTERNOON",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 14,
                "color": "#203424",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 63,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "The Holly & Hearth Bistro",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 15,
                "color": "#751824",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 73,
                "left": 50
          },
          {
                "id": "layer-address",
                "key": "address",
                "text": "452 Wintergreen Way, Aspen, CO",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11.5,
                "color": "#60705E",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 77,
                "left": 50
          },
          {
                "id": "layer-rsvp",
                "key": "rsvp",
                "text": "RSVP to Sarah by Dec 1st • 555-0192",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#751824",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 84,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-watercolor-eucalyptus-wreath",
    title: "Watercolor Eucalyptus Wreath",
    category: "Baby Shower",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FCFCFA 0%, #F2F4EF 100%)"},
    envelope: {"outerColor":"#A8BCA9","linerPatternUrl":"sage-mist","isOpen":true},
    card: {"artworkUrl":"/assets/templates/watercolor-eucalyptus-wreath-bg.svg","backgroundColor":"#FCFCFA","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-greeting",
                "key": "greeting",
                "text": "WELCOME\nBABY!",
                "fontFamily": "'Cinzel', serif",
                "fontSize": 26,
                "color": "#3D5340",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 32,
                "left": 50
          },
          {
                "id": "layer-intro",
                "key": "intro",
                "text": "PLEASE JOIN US TO CELEBRATE",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 10,
                "color": "#758E76",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 41,
                "left": 50
          },
          {
                "id": "layer-celebrant",
                "key": "celebrant",
                "text": "Baby Oliver Thompson",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 32,
                "color": "#253526",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 58,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "HONORING MOM-TO-BE JESSICA",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11.5,
                "color": "#6A826B",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 64,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "SUNDAY, MAY 17TH AT 1:00 PM",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 14,
                "color": "#2E4030",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 71,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "The Botanical Conservatory",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 14,
                "color": "#3D5340",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 77,
                "left": 50
          },
          {
                "id": "layer-address",
                "key": "address",
                "text": "784 Meadow Vista Lane, Portland, OR",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#627763",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 80.5,
                "left": 50
          },
          {
                "id": "layer-rsvp",
                "key": "rsvp",
                "text": "Registered at Target & Babylist • RSVP to 555-0144",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 10.5,
                "color": "#4B634E",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 86.5,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-winnie-the-pooh-so-sweet",
    title: "Disney's Winnie the Pooh: So Sweet",
    category: "Baby Shower",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FCF8EE 0%, #EFE1BF 100%)"},
    envelope: {"outerColor":"#E8C87A","linerPatternUrl":"gold-foil","isOpen":true},
    card: {"artworkUrl":"/assets/templates/winnie-the-pooh-so-sweet-bg.svg","backgroundColor":"#FCF8EE","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-greeting",
                "key": "greeting",
                "text": "A little hunny is on the way!",
                "fontFamily": "'Caveat', cursive",
                "fontSize": 22,
                "color": "#A8681B",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 11,
                "left": 50
          },
          {
                "id": "layer-celebrant",
                "key": "celebrant",
                "text": "So Sweet Baby Shower",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 32,
                "color": "#523211",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 43,
                "left": 50
          },
          {
                "id": "layer-honoree",
                "key": "honoree",
                "text": "FOR AMANDA JONES",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 13,
                "color": "#9C5A14",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 48,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "Celebrating the sweet arrival of baby Noah",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 12,
                "color": "#6E5031",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 53.5,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "SATURDAY, SEPTEMBER 26TH\nAT 2:00 IN THE AFTERNOON",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 14,
                "color": "#3D2409",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 63.5,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "Hundred Acre Garden Cafe",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 15,
                "color": "#523211",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 72.5,
                "left": 50
          },
          {
                "id": "layer-address",
                "key": "address",
                "text": "100 Wood Cottage Rd, Pasadena, CA",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11.5,
                "color": "#7D5C3B",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 76,
                "left": 50
          },
          {
                "id": "layer-rsvp",
                "key": "rsvp",
                "text": "RSVP to Kanga & Roo by Sept 15 • 555-0188",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#8C5316",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 83.5,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-camellia-fields",
    title: "Camellia Fields",
    category: "Baby Shower",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FCF8F7 0%, #F3E9E7 100%)"},
    envelope: {"outerColor":"#EABAC1","linerPatternUrl":"pink-gingham","isOpen":true},
    card: {"artworkUrl":"/assets/templates/camellia-fields-bg.svg","backgroundColor":"#FCF8F7","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-greeting",
                "key": "greeting",
                "text": "PLEASE JOIN US TO CELEBRATE",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#8C5C64",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 26,
                "left": 50
          },
          {
                "id": "layer-celebrant",
                "key": "celebrant",
                "text": "Cassidy Anderson",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 40,
                "color": "#421E25",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 35,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "AND THE UPCOMING ARRIVAL OF HER BABY GIRL",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 12,
                "color": "#7C4B54",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 41,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "SATURDAY, JUNE 20TH\nAT 11:30 IN THE MORNING",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 14.5,
                "color": "#3D1C23",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 53.5,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "The Rosewood Manor Garden",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 16,
                "color": "#59252F",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 65.5,
                "left": 50
          },
          {
                "id": "layer-address",
                "key": "address",
                "text": "324 Camellia Drive, Charleston, SC",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11.5,
                "color": "#7D4B54",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 69,
                "left": 50
          },
          {
                "id": "layer-rsvp",
                "key": "rsvp",
                "text": "RSVP to Chloe at 555-0167 • Registered at Pottery Barn Kids",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#8A4854",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 78,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-bountiful-bouquet",
    title: "Bountiful Bouquet",
    category: "Baby Shower",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FCFCFA 0%, #F4F4EE 100%)"},
    envelope: {"outerColor":"#D0D9CE","linerPatternUrl":"ivory-linen","isOpen":true},
    card: {"artworkUrl":"/assets/templates/bountiful-bouquet-bg.svg","backgroundColor":"#FCFCFA","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-greeting",
                "key": "greeting",
                "text": "JOIN US FOR A BABY SHOWER HONORING",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#7A8778",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 26,
                "left": 50
          },
          {
                "id": "layer-celebrant",
                "key": "celebrant",
                "text": "AMBER & TAYLOR",
                "fontFamily": "'Cinzel', serif",
                "fontSize": 32,
                "color": "#1C241E",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 36,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "as they prepare to welcome their little one",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 14,
                "color": "#586957",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 42,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "SUNDAY, AUGUST 16TH\n2:00 TO 5:00 IN THE AFTERNOON",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 13.5,
                "color": "#2D3B2E",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 56,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "The Glasshouse Loft",
                "fontFamily": "'Cinzel', serif",
                "fontSize": 15.5,
                "color": "#1C241E",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 69,
                "left": 50
          },
          {
                "id": "layer-address",
                "key": "address",
                "text": "89 Mercer Street, New York, NY",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11.5,
                "color": "#6A7A6B",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 72.5,
                "left": 50
          },
          {
                "id": "layer-rsvp",
                "key": "rsvp",
                "text": "RSVP by August 1st to taylor.amber@example.com",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#4B5E4D",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 81.5,
                "left": 50
          }
    ],
  },
  {
    id: "tpl-orchid-geranium",
    title: "Orchid & Geranium",
    category: "Baby Shower",
    backdrop: {"type":"color","value":"linear-gradient(135deg, #FFFDF9 0%, #F5ECE4 100%)"},
    envelope: {"outerColor":"#E28AA8","linerPatternUrl":"electric-gradient","isOpen":true},
    card: {"artworkUrl":"/assets/templates/orchid-geranium-bg.svg","backgroundColor":"#FFFDF9","aspectRatio":"5x7"},
    defaultTextLayers: [
          {
                "id": "layer-greeting",
                "key": "greeting",
                "text": "A BABY SHOWER CELEBRATION FOR",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#913B56",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 26,
                "left": 50
          },
          {
                "id": "layer-celebrant",
                "key": "celebrant",
                "text": "Brittany Anderson",
                "fontFamily": "'Dancing Script', cursive",
                "fontSize": 42,
                "color": "#7E1343",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 35,
                "left": 50
          },
          {
                "id": "layer-subtitle",
                "key": "title",
                "text": "LET'S SHOWER BRITTANY WITH LOVE BEFORE BABY ARRIVES!",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11.5,
                "color": "#8F3255",
                "fontWeight": "600",
                "textAlign": "center",
                "top": 41,
                "left": 50
          },
          {
                "id": "layer-datetime",
                "key": "datetime",
                "text": "SATURDAY, OCTOBER 10TH\nAT 1:00 IN THE AFTERNOON",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 14.5,
                "color": "#3D1222",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 52,
                "left": 50
          },
          {
                "id": "layer-venue",
                "key": "venue",
                "text": "The Palm Terrace Pavilion",
                "fontFamily": "'Playfair Display', serif",
                "fontSize": 16,
                "color": "#800D41",
                "fontWeight": "700",
                "textAlign": "center",
                "top": 63,
                "left": 50
          },
          {
                "id": "layer-address",
                "key": "address",
                "text": "510 Coral Way, Miami, FL",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11.5,
                "color": "#6E2C42",
                "fontWeight": "400",
                "textAlign": "center",
                "top": 69.5,
                "left": 50
          },
          {
                "id": "layer-rsvp",
                "key": "rsvp",
                "text": "RSVP by Sept 25 to 555-0139 • Light bites & cocktails served",
                "fontFamily": "'Inter', sans-serif",
                "fontSize": 11,
                "color": "#A82855",
                "fontWeight": "500",
                "textAlign": "center",
                "top": 77.5,
                "left": 50
          }
    ],
  },

  // ===========================================================================
  // 10 ADULT BIRTHDAY — PURE CSS ZERO-IMAGE TEMPLATES
  // All artworkUrl fields are '' (empty). Visuals come entirely from cssConfig.
  // ===========================================================================

  // 1. Golden Milestone
  {
    id: 'tpl-golden-milestone',
    title: 'Golden Milestone',
    category: 'Birthday',
    isPureCss: true,
    backdrop: {
      type: 'color',
      value: '#181818',
      gradient: 'radial-gradient(ellipse at 50% 30%, #2a2515 0%, #181818 60%, #0d0d0d 100%)',
    },
    envelope: {
      outerColor: '#1C1A10',
      linerPatternUrl: '',
      linerCss: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 60%, #FBF5B7 80%, #AA771C 100%)',
      isOpen: true,
    },
    card: {
      artworkUrl: '',
      decorativeBorderSvgUrl: '',
      backgroundColor: '#161616',
      aspectRatio: 'portrait',
      cssConfig: {
        backgroundColor: '#161616',
        paperShadow: 'inset 0 0 60px rgba(212,175,55,0.04), 0 20px 60px rgba(0,0,0,0.7)',
        border: {
          type: 'double-gold',
          color: '#D4AF37',
          secondaryColor: '#AA8A1E',
          thickness: 2,
          offset: 12,
        },
      },
    },
    defaultTextLayers: [
      { id: 'gm-header', key: 'header', text: 'YOU ARE INVITED', fontFamily: "'Montserrat', sans-serif", fontSize: 9, fontWeight: '700', color: '#D4AF37', textAlign: 'center', top: 10, left: 50, letterSpacing: 6, casing: 'uppercase', foilGradient: 'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728)' },
      { id: 'gm-title', key: 'title', text: "Eleanor's 50th", fontFamily: "'Cormorant Garamond', serif", fontSize: 46, fontWeight: '700', color: '#D4AF37', textAlign: 'center', top: 28, left: 50, foilGradient: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 40%, #B38728 70%, #FBF5B7 100%)' },
      { id: 'gm-subtitle', key: 'subtitle', text: 'A Golden Celebration', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: '400', color: '#C9A84C', textAlign: 'center', top: 42, left: 50, letterSpacing: 2 },
      { id: 'gm-divider', key: 'divider', text: '— ✦ —', fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: '400', color: '#D4AF37', textAlign: 'center', top: 51, left: 50 },
      { id: 'gm-datetime', key: 'datetime', text: 'Saturday, October 18th at 7:00 PM', fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontWeight: '400', color: '#C9A84C', textAlign: 'center', top: 60, left: 50 },
      { id: 'gm-venue', key: 'venue', text: 'The Grand Ballroom, Manhattan', fontFamily: "'Cormorant Garamond', serif", fontSize: 12, fontWeight: '400', color: '#A08030', textAlign: 'center', top: 68, left: 50 },
      { id: 'gm-rsvp', key: 'rsvp', text: 'Black Tie  ·  RSVP by October 1st', fontFamily: "'Montserrat', sans-serif", fontSize: 9, fontWeight: '600', color: '#D4AF37', textAlign: 'center', top: 80, left: 50, letterSpacing: 3, casing: 'uppercase' },
    ],
  },

  // 2. Modern Minimalist Arch
  {
    id: 'tpl-modern-minimalist-arch',
    title: 'Modern Minimalist Arch',
    category: 'Birthday',
    isPureCss: true,
    backdrop: {
      type: 'color',
      value: '#E8E5E0',
      gradient: 'linear-gradient(160deg, #EFECE6 0%, #E0DDD8 100%)',
    },
    envelope: {
      outerColor: '#B5AFA8',
      linerPatternUrl: '',
      linerCss: 'repeating-linear-gradient(0deg, #d4cfc9, #d4cfc9 1px, transparent 1px, transparent 12px), repeating-linear-gradient(90deg, #d4cfc9, #d4cfc9 1px, transparent 1px, transparent 12px)',
      isOpen: true,
    },
    card: {
      artworkUrl: '',
      decorativeBorderSvgUrl: '',
      backgroundColor: '#F9F8F6',
      aspectRatio: 'portrait',
      cssConfig: {
        backgroundColor: '#F9F8F6',
        paperShadow: 'inset 0 0 40px rgba(0,0,0,0.02), 0 10px 35px rgba(0,0,0,0.12)',
        borderRadius: '9999px 9999px 0 0',
        border: {
          type: 'hairline',
          color: '#C8C3BC',
          thickness: 1,
          offset: 16,
          borderRadius: '9999px 9999px 0 0',
        },
      },
    },
    defaultTextLayers: [
      { id: 'mma-header', key: 'header', text: 'A BIRTHDAY CELEBRATION', fontFamily: "'Inter', sans-serif", fontSize: 8, fontWeight: '600', color: '#6B6860', textAlign: 'center', top: 16, left: 50, letterSpacing: 5, casing: 'uppercase' },
      { id: 'mma-title', key: 'title', text: 'Marcus', fontFamily: "'Playfair Display', serif", fontSize: 60, fontWeight: '700', color: '#1A1917', textAlign: 'center', top: 36, left: 50 },
      { id: 'mma-turns', key: 'subtitle', text: 'turns forty', fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: '400', color: '#3D3C3A', textAlign: 'center', top: 50, left: 50 },
      { id: 'mma-datetime', key: 'datetime', text: 'September 6, 2025  ·  8 PM', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: '400', color: '#6B6860', textAlign: 'center', top: 63, left: 50 },
      { id: 'mma-venue', key: 'venue', text: 'Studio Loft, Brooklyn', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: '400', color: '#6B6860', textAlign: 'center', top: 71, left: 50 },
      { id: 'mma-rsvp', key: 'rsvp', text: 'RSVP  →  marcus50.com', fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: '700', color: '#1A1917', textAlign: 'center', top: 83, left: 50, letterSpacing: 1 },
    ],
  },

  // 3. Classic French Dinner
  {
    id: 'tpl-classic-french-dinner',
    title: 'Classic French Dinner',
    category: 'Birthday',
    isPureCss: true,
    backdrop: {
      type: 'color',
      value: '#3D1A1A',
      gradient: 'radial-gradient(ellipse at 50% 40%, #4A2020 0%, #2E1212 100%)',
    },
    envelope: {
      outerColor: '#5C2020',
      linerPatternUrl: '',
      linerCss: 'linear-gradient(135deg, #E8D5B0 0%, #D4B896 50%, #C9A87A 100%)',
      isOpen: true,
    },
    card: {
      artworkUrl: '',
      decorativeBorderSvgUrl: '',
      backgroundColor: '#FFFFF0',
      aspectRatio: 'portrait',
      cssConfig: {
        backgroundColor: '#FFFFF0',
        paperShadow: 'inset 0 0 50px rgba(120,108,94,0.06), 0 15px 40px rgba(0,0,0,0.2)',
        border: {
          type: 'triple-line',
          color: '#786C5E',
          thickness: 1,
          offset: 14,
        },
      },
    },
    defaultTextLayers: [
      { id: 'cfd-header', key: 'header', text: 'Vous êtes cordialement invité', fontFamily: "'Playfair Display', serif", fontSize: 10, fontWeight: '400', color: '#786C5E', textAlign: 'center', top: 9, left: 50 },
      { id: 'cfd-title', key: 'title', text: 'Anniversaire\nde Margaux', fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: '700', color: '#2E1A0E', textAlign: 'center', top: 28, left: 50, lineHeight: 1.2 },
      { id: 'cfd-divider', key: 'divider', text: '✦', fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: '400', color: '#786C5E', textAlign: 'center', top: 47, left: 50 },
      { id: 'cfd-subtitle', key: 'subtitle', text: 'Un dîner élégant en son honneur', fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: '400', color: '#4E3D2D', textAlign: 'center', top: 56, left: 50 },
      { id: 'cfd-datetime', key: 'datetime', text: 'Vendredi, le 14 Novembre à 20h00', fontFamily: "'Playfair Display', serif", fontSize: 11, fontWeight: '400', color: '#786C5E', textAlign: 'center', top: 66, left: 50 },
      { id: 'cfd-venue', key: 'venue', text: 'Le Jardin, 42 Rue de Rivoli, Paris', fontFamily: "'Playfair Display', serif", fontSize: 11, fontWeight: '400', color: '#786C5E', textAlign: 'center', top: 74, left: 50 },
      { id: 'cfd-rsvp', key: 'rsvp', text: 'Répondez s\'il vous plaît avant le 1er Novembre', fontFamily: "'Playfair Display', serif", fontSize: 9.5, fontWeight: '400', color: '#786C5E', textAlign: 'center', top: 84, left: 50 },
    ],
  },

  // 4. Retro 70s Sunset
  {
    id: 'tpl-retro-70s-sunset',
    title: 'Retro 70s Sunset',
    category: 'Birthday',
    isPureCss: true,
    backdrop: {
      type: 'color',
      value: '#7B3F00',
      gradient: 'linear-gradient(160deg, #BF6B35 0%, #8B3A10 50%, #4A1800 100%)',
    },
    envelope: {
      outerColor: '#E8D0A8',
      linerPatternUrl: '',
      linerCss: 'repeating-linear-gradient(45deg, #F4A460 0px, #F4A460 8px, #E8855A 8px, #E8855A 16px, #D4603C 16px, #D4603C 24px)',
      isOpen: true,
    },
    card: {
      artworkUrl: '',
      decorativeBorderSvgUrl: '',
      backgroundColor: '#C86D51',
      aspectRatio: 'portrait',
      cssConfig: {
        backgroundColor: '#C86D51',
        paperShadow: 'inset 0 0 0 8px #B85C40, inset 0 0 0 16px #C86D51, inset 0 0 0 22px #D97A5C, 0 15px 40px rgba(0,0,0,0.4)',
        border: { type: 'none' },
      },
    },
    defaultTextLayers: [
      { id: 'r70-header', key: 'header', text: '✦ GROOVY BIRTHDAY BASH ✦', fontFamily: "'Fredoka One', cursive", fontSize: 10, fontWeight: '400', color: '#FFF1D0', textAlign: 'center', top: 8, left: 50, letterSpacing: 2 },
      { id: 'r70-title', key: 'title', text: "Debbie's\nFab 40!", fontFamily: "'Fredoka One', cursive", fontSize: 44, fontWeight: '400', color: '#FFF1D0', textAlign: 'center', top: 28, left: 50, lineHeight: 1.1 },
      { id: 'r70-subtitle', key: 'subtitle', text: "Far out! Come hang with us, baby", fontFamily: "'Fredoka One', cursive", fontSize: 14, fontWeight: '400', color: '#FFD9A8', textAlign: 'center', top: 48, left: 50 },
      { id: 'r70-datetime', key: 'datetime', text: 'Saturday, July 12th · 7 PM', fontFamily: "'Fredoka One', cursive", fontSize: 12, fontWeight: '400', color: '#FFF1D0', textAlign: 'center', top: 60, left: 50 },
      { id: 'r70-venue', key: 'venue', text: 'The Sunken Lounge, Malibu', fontFamily: "'Fredoka One', cursive", fontSize: 12, fontWeight: '400', color: '#FFD9A8', textAlign: 'center', top: 69, left: 50 },
      { id: 'r70-rsvp', key: 'rsvp', text: 'Keep it groovy · RSVP by July 1', fontFamily: "'Fredoka One', cursive", fontSize: 10, fontWeight: '400', color: '#FFF1D0', textAlign: 'center', top: 82, left: 50 },
    ],
  },

  // 5. Midnight Lounge
  {
    id: 'tpl-midnight-lounge',
    title: 'Midnight Lounge',
    category: 'Birthday',
    isPureCss: true,
    backdrop: {
      type: 'color',
      value: '#050810',
      gradient: 'radial-gradient(ellipse at 30% 20%, #0D1B35 0%, #050810 70%)',
    },
    envelope: {
      outerColor: '#0A1020',
      linerPatternUrl: '',
      linerCss: 'repeating-linear-gradient(135deg, #C0C0C0 0px, #C0C0C0 1px, transparent 1px, transparent 20px), repeating-linear-gradient(45deg, #C0C0C0 0px, #C0C0C0 1px, transparent 1px, transparent 20px)',
      isOpen: true,
    },
    card: {
      artworkUrl: '',
      decorativeBorderSvgUrl: '',
      backgroundColor: '#0D1B2A',
      aspectRatio: 'portrait',
      cssConfig: {
        backgroundColor: '#0D1B2A',
        paperShadow: 'inset 0 0 60px rgba(192,192,192,0.03), 0 20px 60px rgba(0,0,0,0.8)',
        border: {
          type: 'geometric',
          color: '#C0C0C0',
          thickness: 1,
          offset: 12,
        },
      },
    },
    defaultTextLayers: [
      { id: 'ml-header', key: 'header', text: 'EXCLUSIVE INVITATION', fontFamily: "'Courier New', monospace", fontSize: 8, fontWeight: '700', color: '#C0C0C0', textAlign: 'center', top: 9, left: 50, letterSpacing: 5, casing: 'uppercase' },
      { id: 'ml-title', key: 'title', text: 'James\nTurns 45', fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', top: 28, left: 50, lineHeight: 1.2 },
      { id: 'ml-bar', key: 'divider', text: '— MIDNIGHT LOUNGE —', fontFamily: "'Courier New', monospace", fontSize: 9, fontWeight: '400', color: '#808090', textAlign: 'center', top: 46, left: 50, letterSpacing: 3 },
      { id: 'ml-subtitle', key: 'subtitle', text: 'An evening of jazz, cocktails & celebration', fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: '400', color: '#C0C0C0', textAlign: 'center', top: 55, left: 50 },
      { id: 'ml-datetime', key: 'datetime', text: 'Friday, November 21 · 9 PM till late', fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: '400', color: '#808090', textAlign: 'center', top: 65, left: 50 },
      { id: 'ml-venue', key: 'venue', text: 'The Blue Note Lounge, Chicago', fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: '400', color: '#808090', textAlign: 'center', top: 73, left: 50 },
      { id: 'ml-rsvp', key: 'rsvp', text: 'BLACK TIE OPTIONAL  ·  RSVP NOV 7', fontFamily: "'Courier New', monospace", fontSize: 8, fontWeight: '700', color: '#C0C0C0', textAlign: 'center', top: 84, left: 50, letterSpacing: 3, casing: 'uppercase' },
    ],
  },

  // 6. Emerald Soirée
  {
    id: 'tpl-emerald-soiree',
    title: 'Emerald Soirée',
    category: 'Birthday',
    isPureCss: true,
    backdrop: {
      type: 'color',
      value: '#071A0F',
      gradient: 'radial-gradient(ellipse at 40% 30%, #0D2B18 0%, #071A0F 70%)',
    },
    envelope: {
      outerColor: '#0A2014',
      linerPatternUrl: '',
      linerCss: 'repeating-linear-gradient(45deg, rgba(212,175,55,0.25) 0px, rgba(212,175,55,0.25) 1px, transparent 1px, transparent 10px)',
      isOpen: true,
    },
    card: {
      artworkUrl: '',
      decorativeBorderSvgUrl: '',
      backgroundColor: '#0F2E23',
      aspectRatio: 'portrait',
      cssConfig: {
        backgroundColor: '#0F2E23',
        paperShadow: 'inset 0 0 50px rgba(212,175,55,0.04), 0 20px 50px rgba(0,0,0,0.7)',
        border: {
          type: 'hairline',
          color: 'rgba(212,175,55,0.6)',
          thickness: 1,
          offset: 14,
        },
      },
    },
    defaultTextLayers: [
      { id: 'es-header', key: 'header', text: 'UNE SOIRÉE ÉLÉGANTE', fontFamily: "'Cormorant Garamond', serif", fontSize: 9, fontWeight: '400', color: 'rgba(212,175,55,0.7)', textAlign: 'center', top: 9, left: 50, letterSpacing: 4, casing: 'uppercase' },
      { id: 'es-title', key: 'title', text: "Céleste", fontFamily: "'Cormorant Garamond', serif", fontSize: 58, fontWeight: '700', color: '#F0E68C', textAlign: 'center', top: 27, left: 50, foilGradient: 'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728)' },
      { id: 'es-subtitle', key: 'subtitle', text: 'fête ses cinquante ans', fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: '400', color: '#7DAF87', textAlign: 'center', top: 42, left: 50 },
      { id: 'es-divider', key: 'divider', text: '❧', fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: '400', color: 'rgba(212,175,55,0.6)', textAlign: 'center', top: 52, left: 50 },
      { id: 'es-datetime', key: 'datetime', text: 'Samedi 8 Mars · 20h00', fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontWeight: '400', color: '#7DAF87', textAlign: 'center', top: 62, left: 50 },
      { id: 'es-venue', key: 'venue', text: 'Château Margaux, Bordeaux', fontFamily: "'Cormorant Garamond', serif", fontSize: 12, fontWeight: '400', color: 'rgba(212,175,55,0.55)', textAlign: 'center', top: 70, left: 50 },
      { id: 'es-rsvp', key: 'rsvp', text: 'Tenue de soirée · Réponse souhaitée', fontFamily: "'Cormorant Garamond', serif", fontSize: 10, fontWeight: '400', color: 'rgba(212,175,55,0.5)', textAlign: 'center', top: 82, left: 50, letterSpacing: 1 },
    ],
  },

  // 7. Champagne Brunch
  {
    id: 'tpl-champagne-brunch',
    title: 'Champagne Brunch',
    category: 'Birthday',
    isPureCss: true,
    backdrop: {
      type: 'color',
      value: '#E8C8C0',
      gradient: 'linear-gradient(150deg, #EDD5CB 0%, #D8B8B0 100%)',
    },
    envelope: {
      outerColor: '#C4988A',
      linerPatternUrl: '',
      linerCss: 'radial-gradient(ellipse at 50% 50%, #FAE8E0 0%, #F0C8BC 50%, #E0A898 100%)',
      isOpen: true,
    },
    card: {
      artworkUrl: '',
      decorativeBorderSvgUrl: '',
      backgroundColor: '#F7EDE2',
      aspectRatio: 'portrait',
      cssConfig: {
        backgroundColor: '#F7EDE2',
        paperShadow: 'inset 0 0 40px rgba(212,163,115,0.06), 0 10px 30px rgba(0,0,0,0.1)',
        border: {
          type: 'dotted',
          color: '#D4A373',
          thickness: 2,
          offset: 14,
        },
      },
    },
    defaultTextLayers: [
      { id: 'cb-header', key: 'header', text: 'Join us for a', fontFamily: "'Dancing Script', cursive", fontSize: 14, fontWeight: '400', color: '#B08060', textAlign: 'center', top: 9, left: 50 },
      { id: 'cb-title', key: 'title', text: 'Champagne\nBrunch', fontFamily: "'Dancing Script', cursive", fontSize: 44, fontWeight: '700', color: '#7A4030', textAlign: 'center', top: 27, left: 50, lineHeight: 1.1 },
      { id: 'cb-host', key: 'subtitle', text: 'in honour of Beatrice\'s 35th', fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontWeight: '400', color: '#8A5840', textAlign: 'center', top: 45, left: 50 },
      { id: 'cb-divider', key: 'divider', text: '· · ·', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: '400', color: '#D4A373', textAlign: 'center', top: 54, left: 50 },
      { id: 'cb-datetime', key: 'datetime', text: 'Sunday, April 20 · 11:00 AM', fontFamily: "'Cormorant Garamond', serif", fontSize: 12, fontWeight: '400', color: '#8A5840', textAlign: 'center', top: 63, left: 50 },
      { id: 'cb-venue', key: 'venue', text: 'La Maison Rosée, Napa Valley', fontFamily: "'Cormorant Garamond', serif", fontSize: 12, fontWeight: '400', color: '#8A5840', textAlign: 'center', top: 71, left: 50 },
      { id: 'cb-rsvp', key: 'rsvp', text: 'RSVP by April 10 · Brunch attire', fontFamily: "'Cormorant Garamond', serif", fontSize: 10, fontWeight: '400', color: '#B08060', textAlign: 'center', top: 83, left: 50 },
    ],
  },

  // 8. Noir Tuxedo
  {
    id: 'tpl-noir-tuxedo',
    title: 'Noir Tuxedo',
    category: 'Birthday',
    isPureCss: true,
    backdrop: {
      type: 'color',
      value: '#050505',
      gradient: 'linear-gradient(180deg, #0A0A0A 0%, #050505 100%)',
    },
    envelope: {
      outerColor: '#111111',
      linerPatternUrl: '',
      linerCss: 'repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(255,255,255,0.08) 18px, rgba(255,255,255,0.08) 20px)',
      isOpen: true,
    },
    card: {
      artworkUrl: '',
      decorativeBorderSvgUrl: '',
      backgroundColor: '#0A0A0A',
      aspectRatio: 'portrait',
      cssConfig: {
        backgroundColor: '#0A0A0A',
        paperShadow: 'inset 0 0 50px rgba(255,255,255,0.02), 0 20px 60px rgba(0,0,0,0.9)',
        border: {
          type: 'geometric',
          color: '#FFFFFF',
          thickness: 1,
          offset: 14,
        },
      },
    },
    defaultTextLayers: [
      { id: 'nt-header', key: 'header', text: 'AN EVENING WITH', fontFamily: "'Inter', sans-serif", fontSize: 8, fontWeight: '300', color: '#888888', textAlign: 'center', top: 9, left: 50, letterSpacing: 8, casing: 'uppercase' },
      { id: 'nt-title', key: 'title', text: 'VICTOR', fontFamily: "'Inter', sans-serif", fontSize: 52, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', top: 27, left: 50, letterSpacing: 10, casing: 'uppercase' },
      { id: 'nt-age', key: 'subtitle', text: '50', fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: '200', color: '#555555', textAlign: 'center', top: 42, left: 50, letterSpacing: 12 },
      { id: 'nt-rule', key: 'divider', text: '──────────', fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: '100', color: '#333333', textAlign: 'center', top: 51, left: 50, letterSpacing: 4 },
      { id: 'nt-datetime', key: 'datetime', text: 'December 6th  ·  9 PM', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: '300', color: '#AAAAAA', textAlign: 'center', top: 61, left: 50, letterSpacing: 3 },
      { id: 'nt-venue', key: 'venue', text: 'The Observatory, NYC', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: '300', color: '#666666', textAlign: 'center', top: 70, left: 50, letterSpacing: 2 },
      { id: 'nt-rsvp', key: 'rsvp', text: 'BLACK TIE  ·  RSVP REQUIRED', fontFamily: "'Inter', sans-serif", fontSize: 8, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', top: 83, left: 50, letterSpacing: 5, casing: 'uppercase' },
    ],
  },

  // 9. Rustic Espresso
  {
    id: 'tpl-rustic-espresso',
    title: 'Rustic Espresso',
    category: 'Birthday',
    isPureCss: true,
    backdrop: {
      type: 'color',
      value: '#1A0F08',
      gradient: 'radial-gradient(ellipse at 50% 40%, #251408 0%, #1A0F08 80%)',
    },
    envelope: {
      outerColor: '#8B6347',
      linerPatternUrl: '',
      linerCss: 'repeating-linear-gradient(45deg, #C4A882 0px, #C4A882 2px, #D4B892 2px, #D4B892 8px, #C4A882 8px, #C4A882 10px)',
      isOpen: true,
    },
    card: {
      artworkUrl: '',
      decorativeBorderSvgUrl: '',
      backgroundColor: '#2B2118',
      aspectRatio: 'portrait',
      cssConfig: {
        backgroundColor: '#2B2118',
        paperShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.3), 0 15px 40px rgba(0,0,0,0.6)',
        border: {
          type: 'triple-line',
          color: '#8B6347',
          thickness: 1,
          offset: 12,
        },
      },
    },
    defaultTextLayers: [
      { id: 're-header', key: 'header', text: '~ COME GATHER ~', fontFamily: "'Special Elite', cursive", fontSize: 10, fontWeight: '400', color: '#C4A882', textAlign: 'center', top: 9, left: 50, letterSpacing: 3 },
      { id: 're-title', key: 'title', text: "Frank's\nBirthday", fontFamily: "'Special Elite', cursive", fontSize: 40, fontWeight: '400', color: '#D4C0A0', textAlign: 'center', top: 27, left: 50, lineHeight: 1.2 },
      { id: 're-subtitle', key: 'subtitle', text: 'Good food. Good bourbon. Good company.', fontFamily: "'Special Elite', cursive", fontSize: 12, fontWeight: '400', color: '#A88860', textAlign: 'center', top: 46, left: 50 },
      { id: 're-divider', key: 'divider', text: '— ✦ —', fontFamily: "'Special Elite', cursive", fontSize: 14, fontWeight: '400', color: '#8B6347', textAlign: 'center', top: 56, left: 50 },
      { id: 're-datetime', key: 'datetime', text: 'Saturday, August 30 · 6 PM', fontFamily: "'Special Elite', cursive", fontSize: 12, fontWeight: '400', color: '#C4A882', textAlign: 'center', top: 65, left: 50 },
      { id: 're-venue', key: 'venue', text: 'The Old Smokehouse, Nashville', fontFamily: "'Special Elite', cursive", fontSize: 11, fontWeight: '400', color: '#A88860', textAlign: 'center', top: 73, left: 50 },
      { id: 're-rsvp', key: 'rsvp', text: 'Casual attire. RSVP by Aug 15.', fontFamily: "'Special Elite', cursive", fontSize: 10, fontWeight: '400', color: '#8B6347', textAlign: 'center', top: 84, left: 50 },
    ],
  },

  // 10. Lavender Twilight
  {
    id: 'tpl-lavender-twilight',
    title: 'Lavender Twilight',
    category: 'Birthday',
    isPureCss: true,
    backdrop: {
      type: 'color',
      value: '#2D1A4A',
      gradient: 'radial-gradient(ellipse at 50% 30%, #3D2460 0%, #2D1A4A 60%, #1A0D30 100%)',
    },
    envelope: {
      outerColor: '#4A1A6A',
      linerPatternUrl: '',
      linerCss: 'radial-gradient(ellipse at 50% 50%, #C8A8E0 0%, #9060C0 50%, #5A2880 100%)',
      isOpen: true,
    },
    card: {
      artworkUrl: '',
      decorativeBorderSvgUrl: '',
      backgroundColor: '#EBE6EE',
      aspectRatio: 'portrait',
      cssConfig: {
        backgroundColor: '#EBE6EE',
        paperShadow: 'inset 0 0 40px rgba(180,120,220,0.05), 0 10px 40px rgba(90,40,128,0.25)',
        border: {
          type: 'hairline',
          color: '#B090D0',
          thickness: 1,
          offset: 16,
          borderRadius: '8px',
        },
      },
    },
    defaultTextLayers: [
      { id: 'lt-header', key: 'header', text: 'with love & starlight', fontFamily: "'Dancing Script', cursive", fontSize: 13, fontWeight: '400', color: '#9060B0', textAlign: 'center', top: 9, left: 50 },
      { id: 'lt-title', key: 'title', text: 'Violette', fontFamily: "'Cormorant Garamond', serif", fontSize: 58, fontWeight: '700', color: '#4A1A6A', textAlign: 'center', top: 26, left: 50 },
      { id: 'lt-subtitle', key: 'subtitle', text: 'celebrates her 30th birthday', fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: '400', color: '#7040A0', textAlign: 'center', top: 41, left: 50 },
      { id: 'lt-stars', key: 'divider', text: '✦  ✦  ✦', fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: '400', color: '#B090D0', textAlign: 'center', top: 51, left: 50 },
      { id: 'lt-datetime', key: 'datetime', text: 'Saturday, June 21st · 7:30 PM', fontFamily: "'Cormorant Garamond', serif", fontSize: 12, fontWeight: '400', color: '#7040A0', textAlign: 'center', top: 62, left: 50 },
      { id: 'lt-venue', key: 'venue', text: 'The Rooftop Garden, Paris', fontFamily: "'Cormorant Garamond', serif", fontSize: 12, fontWeight: '400', color: '#9060B0', textAlign: 'center', top: 70, left: 50 },
      { id: 'lt-rsvp', key: 'rsvp', text: 'Twilight attire welcome · RSVP by June 7', fontFamily: "'Cormorant Garamond', serif", fontSize: 10, fontWeight: '400', color: '#B090D0', textAlign: 'center', top: 82, left: 50 },
    ],
  },

  // ===========================================================================
  // 14 NEW EVITE-STYLE VECTOR & BOTANICAL TEMPLATES (Pushed from Backend)
  // ===========================================================================

  // 1. Hibiscus Blooms (Bridal Shower)
  {
    id: "tpl-hibiscus-blooms",
    title: "Hibiscus Blooms",
    category: "Baby Shower",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#E0F7FA",
      gradient: "linear-gradient(135deg, #E0F7FA 0%, #BAE6FD 50%, #F0FDFA 100%)",
    },
    envelope: {
      outerColor: "#FF7043",
      linerPatternUrl: "",
      linerCss: "linear-gradient(135deg, #FFE082 0%, #FF8A80 50%, #FF7043 100%)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#F0FDFA",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#F0FDFA",
        backgroundGradient: "linear-gradient(180deg, #E0F7FA 0%, #FFFFFF 100%)",
        paperShadow: "inset 0 0 40px rgba(0, 188, 212, 0.08), 0 20px 45px rgba(0,0,0,0.1)",
        border: {
          type: "double-gold",
          color: "#38BDF8",
          secondaryColor: "#FF8A80",
          thickness: 2,
          offset: 8,
        },
      },
    },
    defaultTextLayers: [
      { id: "hb-hdr", key: "header", text: "JOIN US FOR AN AFTERNOON IN PARADISE...", fontFamily: "'Montserrat', sans-serif", fontSize: 9.5, fontWeight: "600", color: "#1E3A8A", textAlign: "center", top: 16, left: 50, letterSpacing: 2, casing: "uppercase" },
      { id: "hb-title", key: "title", text: "Amber's Beachy\nBridal Shower", fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: "700", color: "#0F172A", textAlign: "center", top: 32, left: 50 },
      { id: "hb-datetime", key: "datetime", text: "SATURDAY, JULY 18TH AT 2:00 PM", fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: "600", color: "#1E3A8A", textAlign: "center", top: 58, left: 50, letterSpacing: 1 },
      { id: "hb-venue", key: "venue", text: "THE SURFSIDE INN", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "600", color: "#334155", textAlign: "center", top: 68, left: 50 },
      { id: "hb-address", key: "address", text: "100 Ocean View Drive, Malibu", fontFamily: "'Playfair Display', serif", fontSize: 10.5, fontWeight: "400", color: "#64748B", textAlign: "center", top: 76, left: 50 },
      { id: "hb-rsvp", key: "rsvp", text: "RSVP BY JULY 1ST  ·  SWIMWEAR WELCOME", fontFamily: "'Montserrat', sans-serif", fontSize: 9, fontWeight: "600", color: "#FF7043", textAlign: "center", top: 85, left: 50, letterSpacing: 1.5, casing: "uppercase" },
    ],
  },

  // 2. Chicory Whispers (Bridal Shower)
  {
    id: "tpl-chicory-whispers",
    title: "Chicory Whispers",
    category: "Baby Shower",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#EFF6FF",
      gradient: "radial-gradient(circle at 50% 30%, #DBEAFE 0%, #EFF6FF 70%, #E0E7FF 100%)",
    },
    envelope: {
      outerColor: "#1E3A8A",
      linerPatternUrl: "",
      linerCss: "repeating-linear-gradient(45deg, #93C5FD 0px, #93C5FD 10px, #DBEAFE 10px, #DBEAFE 20px)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#FFFFFF",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#FFFFFF",
        paperShadow: "inset 0 0 30px rgba(30, 58, 138, 0.04), 0 20px 45px rgba(0,0,0,0.1)",
        border: {
          type: "hairline",
          color: "#93C5FD",
          thickness: 1.5,
          offset: 10,
          borderRadius: "8px",
        },
      },
    },
    defaultTextLayers: [
      { id: "cw-hdr", key: "header", text: "Please join us to shower", fontFamily: "'Great Vibes', cursive", fontSize: 26, fontWeight: "400", color: "#1E3A8A", textAlign: "center", top: 15, left: 50 },
      { id: "cw-title", key: "title", text: "Maggie Collins", fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: "700", color: "#0F172A", textAlign: "center", top: 32, left: 50 },
      { id: "cw-divider", key: "divider", text: "— ✿ —", fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: "400", color: "#3B82F6", textAlign: "center", top: 48, left: 50 },
      { id: "cw-datetime", key: "datetime", text: "SUNDAY, AUGUST 3RD AT 11:00 AM", fontFamily: "'Montserrat', sans-serif", fontSize: 10.5, fontWeight: "600", color: "#1E3A8A", textAlign: "center", top: 58, left: 50, letterSpacing: 1.5 },
      { id: "cw-venue", key: "venue", text: "The Collins Family Home", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "500", color: "#475569", textAlign: "center", top: 68, left: 50 },
      { id: "cw-address", key: "address", text: "547 Lovely Lane, Carlsbad, CA", fontFamily: "'Playfair Display', serif", fontSize: 10.5, fontWeight: "400", color: "#64748B", textAlign: "center", top: 75, left: 50 },
      { id: "cw-rsvp", key: "rsvp", text: "Light apps and drinks will be served", fontFamily: "'Great Vibes', cursive", fontSize: 18, fontWeight: "400", color: "#1E3A8A", textAlign: "center", top: 85, left: 50 },
    ],
  },

  // 3. Lovely Blossoms (Bridal Shower)
  {
    id: "tpl-lovely-blossoms",
    title: "Lovely Blossoms",
    category: "Baby Shower",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#FDF2F8",
      gradient: "linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #FFF1F2 100%)",
    },
    envelope: {
      outerColor: "#839E92",
      linerPatternUrl: "",
      linerCss: "repeating-linear-gradient(90deg, #E8F0EC 0px, #E8F0EC 8px, #D1E0D7 8px, #D1E0D7 16px)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#FFFDF9",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#FFFDF9",
        paperShadow: "inset 0 0 35px rgba(219, 39, 119, 0.04), 0 20px 45px rgba(0,0,0,0.08)",
        border: {
          type: "dotted",
          color: "#F472B6",
          thickness: 2,
          offset: 12,
          borderRadius: "12px",
        },
      },
    },
    defaultTextLayers: [
      { id: "lb-hdr", key: "header", text: "JOIN US TO CELEBRATE", fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: "600", color: "#9D174D", textAlign: "center", top: 16, left: 50, letterSpacing: 3, casing: "uppercase" },
      { id: "lb-title", key: "title", text: "Josephine Sanders", fontFamily: "'Great Vibes', cursive", fontSize: 40, fontWeight: "400", color: "#BE185D", textAlign: "center", top: 32, left: 50 },
      { id: "lb-subtitle", key: "subtitle", text: "Bridal Shower Brunch", fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: "500", color: "#9D174D", textAlign: "center", top: 48, left: 50, letterSpacing: 1 },
      { id: "lb-datetime", key: "datetime", text: "SATURDAY, JUNE 19TH AT 1:00 PM", fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: "600", color: "#9D174D", textAlign: "center", top: 60, left: 50, letterSpacing: 1.5 },
      { id: "lb-venue", key: "venue", text: "THE SANDERS HOME", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "600", color: "#475569", textAlign: "center", top: 69, left: 50 },
      { id: "lb-address", key: "address", text: "219 Garden Lane, Pasadena", fontFamily: "'Playfair Display', serif", fontSize: 10.5, fontWeight: "400", color: "#64748B", textAlign: "center", top: 76, left: 50 },
      { id: "lb-rsvp", key: "rsvp", text: "Drinks & light bites will be served", fontFamily: "'Great Vibes', cursive", fontSize: 18, fontWeight: "400", color: "#BE185D", textAlign: "center", top: 85, left: 50 },
    ],
  },

  // 4. Elegant Lace (Bridal Shower)
  {
    id: "tpl-elegant-lace",
    title: "Elegant Lace",
    category: "Baby Shower",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#FDFBF7",
      gradient: "radial-gradient(circle at 50% 30%, #FAF6EE 0%, #F5EFE6 100%)",
    },
    envelope: {
      outerColor: "#D8CAB8",
      linerPatternUrl: "",
      linerCss: "linear-gradient(135deg, #F4EDE4 0%, #E8DCCB 50%, #D8CAB8 100%)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#FDFBF7",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#FDFBF7",
        paperShadow: "inset 0 0 50px rgba(180, 160, 130, 0.08), 0 20px 45px rgba(0,0,0,0.08)",
        border: {
          type: "hairline",
          color: "#D4C5B0",
          thickness: 1.5,
          offset: 12,
          borderRadius: "16px",
        },
      },
    },
    defaultTextLayers: [
      { id: "el-hdr", key: "header", text: "KINDLY JOIN US AS WE HONOR", fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: "600", color: "#52483E", textAlign: "center", top: 18, left: 50, letterSpacing: 3, casing: "uppercase" },
      { id: "el-title", key: "title", text: "Emma Johnson", fontFamily: "'Great Vibes', cursive", fontSize: 40, fontWeight: "400", color: "#2B2927", textAlign: "center", top: 34, left: 50 },
      { id: "el-subtitle", key: "subtitle", text: "A Delicate Lace Tea & Shower", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "400", color: "#786C5E", textAlign: "center", top: 50, left: 50 },
      { id: "el-datetime", key: "datetime", text: "SATURDAY, APRIL 20TH AT 12 O'CLOCK", fontFamily: "'Playfair Display', serif", fontSize: 11.5, fontWeight: "600", color: "#2B2927", textAlign: "center", top: 62, left: 50, letterSpacing: 1 },
      { id: "el-venue", key: "venue", text: "JUNIPER CAFE", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "600", color: "#2B2927", textAlign: "center", top: 71, left: 50 },
      { id: "el-address", key: "address", text: "2345 11th Street, Encinitas, CA", fontFamily: "'Playfair Display', serif", fontSize: 10, fontWeight: "400", color: "#786C5E", textAlign: "center", top: 78, left: 50 },
      { id: "el-rsvp", key: "rsvp", text: "RSVP BY APRIL 5TH TO CATHERINE", fontFamily: "'Montserrat', sans-serif", fontSize: 9, fontWeight: "600", color: "#8C7E6D", textAlign: "center", top: 86, left: 50, letterSpacing: 1.5, casing: "uppercase" },
    ],
  },

  // 5. Painted Petals (Bridal Shower)
  {
    id: "tpl-painted-petals",
    title: "Painted Petals",
    category: "Baby Shower",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#F0F7FF",
      gradient: "linear-gradient(135deg, #F0F7FF 0%, #E0F2FE 100%)",
    },
    envelope: {
      outerColor: "#0F2A4A",
      linerPatternUrl: "",
      linerCss: "linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#FBF9F4",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#FBF9F4",
        paperShadow: "inset 0 0 35px rgba(30, 58, 138, 0.05), 0 20px 45px rgba(0,0,0,0.08)",
        border: {
          type: "hairline",
          color: "#93C5FD",
          thickness: 1.5,
          offset: 10,
          borderRadius: "8px",
        },
      },
    },
    defaultTextLayers: [
      { id: "pp-hdr", key: "header", text: "JOIN US TO SHOWER", fontFamily: "'Montserrat', sans-serif", fontSize: 10.5, fontWeight: "600", color: "#1E3A8A", textAlign: "center", top: 16, left: 50, letterSpacing: 3, casing: "uppercase" },
      { id: "pp-title", key: "title", text: "Emilia Hernandez", fontFamily: "'Great Vibes', cursive", fontSize: 40, fontWeight: "400", color: "#1E3A8A", textAlign: "center", top: 32, left: 50 },
      { id: "pp-datetime", key: "datetime", text: "SUNDAY, JUNE 7TH AT 1:00 PM", fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: "600", color: "#1E3A8A", textAlign: "center", top: 58, left: 50 },
      { id: "pp-venue", key: "venue", text: "THE HERNANDEZ HOME", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "600", color: "#334155", textAlign: "center", top: 68, left: 50 },
      { id: "pp-address", key: "address", text: "893 South Hill Street, Pasadena", fontFamily: "'Playfair Display', serif", fontSize: 10.5, fontWeight: "400", color: "#64748B", textAlign: "center", top: 76, left: 50 },
      { id: "pp-rsvp", key: "rsvp", text: "Lunch & prosecco will be served", fontFamily: "'Great Vibes', cursive", fontSize: 18, fontWeight: "400", color: "#1E3A8A", textAlign: "center", top: 85, left: 50 },
    ],
  },

  // 6. Floral Elegance (Bridal Shower)
  {
    id: "tpl-floral-elegance",
    title: "Floral Elegance",
    category: "Baby Shower",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#F0FDF4",
      gradient: "radial-gradient(circle at 50% 30%, #DCFCE7 0%, #F0FDF4 70%, #F7FEE7 100%)",
    },
    envelope: {
      outerColor: "#4A6052",
      linerPatternUrl: "",
      linerCss: "linear-gradient(135deg, #A7F3D0 0%, #86EFAC 50%, #BBF7D0 100%)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#FFFFFF",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#FFFFFF",
        paperShadow: "inset 0 0 35px rgba(180, 83, 9, 0.04), 0 20px 45px rgba(0,0,0,0.08)",
        border: {
          type: "dotted",
          color: "#86EFAC",
          thickness: 2,
          offset: 12,
          borderRadius: "14px",
        },
      },
    },
    defaultTextLayers: [
      { id: "fe-title", key: "title", text: "Brunch & Bubbly", fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: "700", color: "#B45309", textAlign: "center", top: 20, left: 50 },
      { id: "fe-subhdr", key: "subtitle", text: "PLEASE JOIN US FOR A BRIDAL SHOWER HONORING", fontFamily: "'Montserrat', sans-serif", fontSize: 9.5, fontWeight: "600", color: "#D97706", textAlign: "center", top: 40, left: 50, letterSpacing: 2, casing: "uppercase" },
      { id: "fe-names", key: "names", text: "Chloe Johnson", fontFamily: "'Great Vibes', cursive", fontSize: 38, fontWeight: "400", color: "#D97706", textAlign: "center", top: 52, left: 50 },
      { id: "fe-datetime", key: "datetime", text: "SATURDAY, MARCH 16TH AT 11:00 AM", fontFamily: "'Playfair Display', serif", fontSize: 11.5, fontWeight: "600", color: "#4B5563", textAlign: "center", top: 68, left: 50 },
      { id: "fe-venue", key: "venue", text: "THE JOHNSON HOME", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "600", color: "#4B5563", textAlign: "center", top: 76, left: 50 },
      { id: "fe-address", key: "address", text: "983 Crestline Drive, Santa Barbara", fontFamily: "'Playfair Display', serif", fontSize: 10, fontWeight: "400", color: "#64748B", textAlign: "center", top: 83, left: 50 },
    ],
  },

  // 7. Floral Arch (Bridal Shower)
  {
    id: "tpl-floral-arch",
    title: "Floral Arch",
    category: "Baby Shower",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#FFF1F2",
      gradient: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)",
    },
    envelope: {
      outerColor: "#D87A80",
      linerPatternUrl: "",
      linerCss: "linear-gradient(135deg, #FECDD3 0%, #FDA4AF 100%)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#FFFBF5",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#FFFBF5",
        paperShadow: "inset 0 0 35px rgba(219, 39, 119, 0.05), 0 20px 45px rgba(0,0,0,0.08)",
        borderRadius: "140px 140px 0 0",
        border: {
          type: "hairline",
          color: "#FDE047",
          thickness: 2,
          offset: 8,
          borderRadius: "132px 132px 0 0",
        },
      },
    },
    defaultTextLayers: [
      { id: "fa-title", key: "title", text: "Love is in Bloom", fontFamily: "'Great Vibes', cursive", fontSize: 40, fontWeight: "400", color: "#DB2777", textAlign: "center", top: 24, left: 50 },
      { id: "fa-subhdr", key: "subtitle", text: "JOIN US TO CELEBRATE", fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: "600", color: "#F43F5E", textAlign: "center", top: 46, left: 50, letterSpacing: 2, casing: "uppercase" },
      { id: "fa-names", key: "names", text: "AVERY SANDERS", fontFamily: "'Montserrat', sans-serif", fontSize: 17, fontWeight: "700", color: "#DB2777", textAlign: "center", top: 56, left: 50, letterSpacing: 3 },
      { id: "fa-datetime", key: "datetime", text: "SATURDAY, JULY 15TH AT 3:00 PM", fontFamily: "'Playfair Display', serif", fontSize: 11.5, fontWeight: "600", color: "#4B5563", textAlign: "center", top: 68, left: 50 },
      { id: "fa-venue", key: "venue", text: "POPLIN BOTANICAL GARDEN", fontFamily: "'Playfair Display', serif", fontSize: 12.5, fontWeight: "600", color: "#4B5563", textAlign: "center", top: 76, left: 50 },
      { id: "fa-address", key: "address", text: "Rose Pavilion & Terrace", fontFamily: "'Playfair Display', serif", fontSize: 10.5, fontWeight: "400", color: "#64748B", textAlign: "center", top: 84, left: 50 },
    ],
  },

  // 8. Little Limoncello (Bridal Shower)
  {
    id: "tpl-limoncello",
    title: "Little Limoncello",
    category: "Baby Shower",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#F0F9FF",
      gradient: "radial-gradient(circle at 50% 30%, #FEF08A 0%, #E0F2FE 70%, #BAE6FD 100%)",
    },
    envelope: {
      outerColor: "#5B86E5",
      linerPatternUrl: "",
      linerCss: "linear-gradient(135deg, #FEF08A 0%, #FDE047 50%, #93C5FD 100%)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#F8FAFC",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#F8FAFC",
        paperShadow: "inset 0 0 40px rgba(37, 99, 235, 0.05), 0 20px 45px rgba(0,0,0,0.08)",
        border: {
          type: "hairline",
          color: "#60A5FA",
          thickness: 2,
          offset: 10,
          borderRadius: "14px",
        },
      },
    },
    defaultTextLayers: [
      { id: "lc-title", key: "title", text: "Ciao Bella!", fontFamily: "'Great Vibes', cursive", fontSize: 44, fontWeight: "400", color: "#2563EB", textAlign: "center", top: 18, left: 50 },
      { id: "lc-subhdr", key: "subtitle", text: "PLEASE JOIN US FOR THE BRIDAL SHOWER OF", fontFamily: "'Montserrat', sans-serif", fontSize: 9.5, fontWeight: "600", color: "#3B82F6", textAlign: "center", top: 38, left: 50, letterSpacing: 2, casing: "uppercase" },
      { id: "lc-names", key: "names", text: "Christina Hirata", fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: "700", color: "#1E40AF", textAlign: "center", top: 48, left: 50 },
      { id: "lc-divider", key: "divider", text: "🍋 · 🍋 · 🍋", fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: "400", color: "#EAB308", textAlign: "center", top: 60, left: 50 },
      { id: "lc-datetime", key: "datetime", text: "SATURDAY, JULY 27TH AT 11:00 AM", fontFamily: "'Playfair Display', serif", fontSize: 11.5, fontWeight: "600", color: "#4B5563", textAlign: "center", top: 68, left: 50 },
      { id: "lc-venue", key: "venue", text: "THE CARTWRIGHT HOME", fontFamily: "'Playfair Display', serif", fontSize: 12.5, fontWeight: "600", color: "#1E3A8A", textAlign: "center", top: 76, left: 50 },
      { id: "lc-address", key: "address", text: "Amalfi Terrace, Newport Coast", fontFamily: "'Playfair Display', serif", fontSize: 10, fontWeight: "400", color: "#64748B", textAlign: "center", top: 84, left: 50 },
    ],
  },

  // 9. Pumpkin & Petals (Bridal Shower)
  {
    id: "tpl-pumpkin-petals",
    title: "Pumpkin & Petals",
    category: "Baby Shower",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#FFF7ED",
      gradient: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)",
    },
    envelope: {
      outerColor: "#9A3412",
      linerPatternUrl: "",
      linerCss: "linear-gradient(135deg, #FDBA74 0%, #FB923C 50%, #C2410C 100%)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#FFFBF5",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#FFFBF5",
        paperShadow: "inset 0 0 40px rgba(154, 52, 18, 0.05), 0 20px 45px rgba(0,0,0,0.08)",
        border: {
          type: "hairline",
          color: "#FB923C",
          thickness: 1.5,
          offset: 10,
          borderRadius: "10px",
        },
      },
    },
    defaultTextLayers: [
      { id: "pk-subhdr", key: "header", text: "Fall in Love", fontFamily: "'Great Vibes', cursive", fontSize: 42, fontWeight: "400", color: "#C25E1A", textAlign: "center", top: 18, left: 50 },
      { id: "pk-header", key: "subtitle", text: "JOIN US FOR A BRIDAL SHOWER HONORING", fontFamily: "'Montserrat', sans-serif", fontSize: 9.5, fontWeight: "600", color: "#9A3412", textAlign: "center", top: 38, left: 50, letterSpacing: 2, casing: "uppercase" },
      { id: "pk-title", key: "title", text: "Silvia Stewart", fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: "700", color: "#7C2D12", textAlign: "center", top: 48, left: 50 },
      { id: "pk-datetime", key: "datetime", text: "SATURDAY, OCTOBER 5TH AT 2:00 PM", fontFamily: "'Playfair Display', serif", fontSize: 11.5, fontWeight: "600", color: "#9A3412", textAlign: "center", top: 64, left: 50 },
      { id: "pk-venue", key: "venue", text: "THE ANDERSON HOME", fontFamily: "'Playfair Display', serif", fontSize: 12.5, fontWeight: "600", color: "#7C2D12", textAlign: "center", top: 72, left: 50 },
      { id: "pk-address", key: "address", text: "819 Main Street, Vista, CA", fontFamily: "'Playfair Display', serif", fontSize: 10.5, fontWeight: "400", color: "#9A3412", textAlign: "center", top: 80, left: 50 },
    ],
  },

  // 10. Eternal Botanical Garland (Wedding)
  {
    id: "tpl-wedding-elegance",
    title: "Eternal Botanical Garland",
    category: "Wedding",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#F8FAFC",
      gradient: "radial-gradient(ellipse at 50% 30%, #F1F5F9 0%, #E2E8F0 100%)",
    },
    envelope: {
      outerColor: "#0F1E36",
      linerPatternUrl: "",
      linerCss: "linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 60%, #FBF5B7 80%, #AA771C 100%)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#FFFDF9",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#FFFDF9",
        paperShadow: "inset 0 0 50px rgba(30, 58, 138, 0.05), 0 20px 50px rgba(0,0,0,0.1)",
        border: {
          type: "double-gold",
          color: "#D4AF37",
          secondaryColor: "#AA8A1E",
          thickness: 2,
          offset: 10,
        },
      },
    },
    defaultTextLayers: [
      { id: "we-subhdr", key: "header", text: "TOGETHER WITH THEIR FAMILIES", fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: "600", color: "#1E3A8A", textAlign: "center", top: 16, left: 50, letterSpacing: 3, casing: "uppercase" },
      { id: "we-title", key: "title", text: "Sophia & Alexander", fontFamily: "'Great Vibes', cursive", fontSize: 42, fontWeight: "400", color: "#1E3A8A", textAlign: "center", top: 30, left: 50 },
      { id: "we-hdr", key: "subtitle", text: "REQUEST THE HONOR OF YOUR PRESENCE AT THEIR WEDDING", fontFamily: "'Playfair Display', serif", fontSize: 11, fontWeight: "400", color: "#334155", textAlign: "center", top: 48, left: 50, letterSpacing: 1 },
      { id: "we-datetime", key: "datetime", text: "SATURDAY, AUGUST 15TH AT 4:00 PM", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "600", color: "#1E3A8A", textAlign: "center", top: 60, left: 50 },
      { id: "we-venue", key: "venue", text: "ST. PATRICK'S CATHEDRAL", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "600", color: "#334155", textAlign: "center", top: 69, left: 50 },
      { id: "we-address", key: "address", text: "294 Park Avenue, New York", fontFamily: "'Playfair Display', serif", fontSize: 11, fontWeight: "400", color: "#64748B", textAlign: "center", top: 76, left: 50 },
      { id: "we-rsvp", key: "rsvp", text: "DINNER & DANCING TO FOLLOW", fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: "600", color: "#1E3A8A", textAlign: "center", top: 85, left: 50, letterSpacing: 2, casing: "uppercase" },
    ],
  },

  // 11. Global Innovation Summit 2026 (Corporate Event)
  {
    id: "tpl-corporate-summit",
    title: "Global Innovation Summit 2026",
    category: "Birthday",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#0B1120",
      gradient: "radial-gradient(circle at 50% 30%, #1E293B 0%, #0F172A 70%, #020617 100%)",
    },
    envelope: {
      outerColor: "#1E293B",
      linerPatternUrl: "",
      linerCss: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #D4AF37 100%)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#0F172A",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#0F172A",
        paperShadow: "inset 0 0 60px rgba(212, 175, 55, 0.05), 0 20px 60px rgba(0,0,0,0.8)",
        border: {
          type: "double-gold",
          color: "#D4AF37",
          secondaryColor: "#06B6D4",
          thickness: 2,
          offset: 10,
        },
      },
    },
    defaultTextLayers: [
      { id: "cs-subhdr", key: "header", text: "EVENTIZERS ENTERPRISE PRESENTS", fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: "700", color: "#06B6D4", textAlign: "center", top: 16, left: 50, letterSpacing: 3, casing: "uppercase" },
      { id: "cs-title", key: "title", text: "NextGen Tech Summit", fontFamily: "'Cinzel', serif", fontSize: 32, fontWeight: "700", color: "#FFFFFF", textAlign: "center", top: 32, left: 50 },
      { id: "cs-hdr", key: "subtitle", text: "ANNUAL KEYNOTE & PRODUCT SHOWCASE", fontFamily: "'Montserrat', sans-serif", fontSize: 10.5, fontWeight: "600", color: "#94A3B8", textAlign: "center", top: 50, left: 50, letterSpacing: 2, casing: "uppercase" },
      { id: "cs-datetime", key: "datetime", text: "THURSDAY, OCTOBER 8TH | 9:00 AM - 5:00 PM", fontFamily: "'Montserrat', sans-serif", fontSize: 11.5, fontWeight: "600", color: "#E2E8F0", textAlign: "center", top: 62, left: 50 },
      { id: "cs-venue", key: "venue", text: "METROPOLITAN CONVENTION CENTER", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "600", color: "#F8FAFC", textAlign: "center", top: 72, left: 50 },
      { id: "cs-address", key: "address", text: "100 Innovation Drive, Seattle", fontFamily: "'Playfair Display', serif", fontSize: 11, fontWeight: "400", color: "#94A3B8", textAlign: "center", top: 79, left: 50 },
      { id: "cs-rsvp", key: "rsvp", text: "VIP NETWORKING RECEPTION AT 6:00 PM", fontFamily: "'Montserrat', sans-serif", fontSize: 9.5, fontWeight: "700", color: "#06B6D4", textAlign: "center", top: 86, left: 50, letterSpacing: 2, casing: "uppercase" },
    ],
  },

  // 12. Founders & Tech Connect (Networking)
  {
    id: "tpl-networking-founders",
    title: "Founders & Tech Connect",
    category: "Birthday",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#022C22",
      gradient: "radial-gradient(circle at 50% 30%, #064E3B 0%, #022C22 100%)",
    },
    envelope: {
      outerColor: "#064E3B",
      linerPatternUrl: "",
      linerCss: "linear-gradient(135deg, #10B981 0%, #34D399 50%, #A7F3D0 100%)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#0A1916",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#0A1916",
        paperShadow: "inset 0 0 50px rgba(52, 211, 153, 0.05), 0 20px 60px rgba(0,0,0,0.7)",
        border: {
          type: "hairline",
          color: "#34D399",
          thickness: 1.5,
          offset: 10,
          borderRadius: "8px",
        },
      },
    },
    defaultTextLayers: [
      { id: "nf-subhdr", key: "header", text: "AN EXCLUSIVE NETWORKING MIXER", fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: "700", color: "#A7F3D0", textAlign: "center", top: 16, left: 50, letterSpacing: 3, casing: "uppercase" },
      { id: "nf-title", key: "title", text: "Founders & Tech Connect", fontFamily: "'Cinzel', serif", fontSize: 26, fontWeight: "700", color: "#FFFFFF", textAlign: "center", top: 32, left: 50 },
      { id: "nf-hdr", key: "subtitle", text: "REPUBLIC OF AI & THE FUTURE", fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: "600", color: "#6EE7B7", textAlign: "center", top: 48, left: 50, letterSpacing: 2, casing: "uppercase" },
      { id: "nf-datetime", key: "datetime", text: "THURSDAY, NOVEMBER 14TH @ 6:00 PM", fontFamily: "'Montserrat', sans-serif", fontSize: 11.5, fontWeight: "600", color: "#FFFFFF", textAlign: "center", top: 60, left: 50 },
      { id: "nf-venue", key: "venue", text: "HORIZON ROOFTOP & HUB", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "600", color: "#FFFFFF", textAlign: "center", top: 70, left: 50 },
      { id: "nf-address", key: "address", text: "320 Market Street, Suite 400", fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: "400", color: "#A7F3D0", textAlign: "center", top: 78, left: 50 },
      { id: "nf-rsvp", key: "rsvp", text: "COMPLIMENTARY DRINKS · RSVP REQUIRED", fontFamily: "'Montserrat', sans-serif", fontSize: 9, fontWeight: "600", color: "#6EE7B7", textAlign: "center", top: 86, left: 50, letterSpacing: 1.5, casing: "uppercase" },
    ],
  },

  // 13. Black Tie Charity Gala (Fundraiser)
  {
    id: "tpl-charity-gala",
    title: "Black Tie Charity Gala",
    category: "Birthday",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#000000",
      gradient: "radial-gradient(ellipse at 50% 30%, #262016 0%, #12100C 60%, #000000 100%)",
    },
    envelope: {
      outerColor: "#111111",
      linerPatternUrl: "",
      linerCss: "linear-gradient(135deg, #BF953F 0%, #FCF6BA 35%, #B38728 70%, #FBF5B7 100%)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#0A0A0A",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#0A0A0A",
        paperShadow: "inset 0 0 60px rgba(212, 175, 55, 0.06), 0 25px 65px rgba(0,0,0,0.85)",
        border: {
          type: "double-gold",
          color: "#D4AF37",
          secondaryColor: "#AA8A1E",
          thickness: 2,
          offset: 12,
        },
      },
    },
    defaultTextLayers: [
      { id: "cg-subhdr", key: "header", text: "CORDIALLY INVITED TO THE ANNUAL BENEFIT", fontFamily: "'Montserrat', sans-serif", fontSize: 9.5, fontWeight: "700", color: "#D4AF37", textAlign: "center", top: 16, left: 50, letterSpacing: 3, casing: "uppercase", foilGradient: "linear-gradient(135deg, #BF953F, #FCF6BA, #B38728)" },
      { id: "cg-title", key: "title", text: "Charity Gala", fontFamily: "'Great Vibes', cursive", fontSize: 46, fontWeight: "400", color: "#FCE182", textAlign: "center", top: 30, left: 50, foilGradient: "linear-gradient(135deg, #BF953F 0%, #FCF6BA 40%, #B38728 70%, #FBF5B7 100%)" },
      { id: "cg-hdr", key: "subtitle", text: "AN EVENING OF ELEGANCE & BENEFICENCE", fontFamily: "'Cinzel', serif", fontSize: 10.5, fontWeight: "600", color: "#E6CA65", textAlign: "center", top: 50, left: 50, letterSpacing: 2 },
      { id: "cg-datetime", key: "datetime", text: "SATURDAY, OCTOBER 14TH AT 7:00 PM", fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: "600", color: "#FBF3D5", textAlign: "center", top: 62, left: 50 },
      { id: "cg-venue", key: "venue", text: "THE GRAND PLAZA BALLROOM", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "600", color: "#FFFFFF", textAlign: "center", top: 71, left: 50 },
      { id: "cg-address", key: "address", text: "Fifth Avenue at Central Park South", fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: "400", color: "#E2E8F0", textAlign: "center", top: 78, left: 50 },
      { id: "cg-rsvp", key: "rsvp", text: "BLACK TIE OPTIONAL · SILENT AUCTION & DINNER", fontFamily: "'Montserrat', sans-serif", fontSize: 9, fontWeight: "700", color: "#D4AF37", textAlign: "center", top: 86, left: 50, letterSpacing: 2, casing: "uppercase" },
    ],
  },

  // 14. Sunset Garden Soirée (Private Dinner)
  {
    id: "tpl-dinner-sunset-soiree",
    title: "Sunset Garden Soirée",
    category: "Birthday",
    isPureCss: true,
    backdrop: {
      type: "color",
      value: "#24121A",
      gradient: "radial-gradient(ellipse at 50% 30%, #4A1525 0%, #24121A 70%, #150910 100%)",
    },
    envelope: {
      outerColor: "#3B1220",
      linerPatternUrl: "",
      linerCss: "linear-gradient(135deg, #FF8A80 0%, #FF7043 50%, #D87A80 100%)",
      isOpen: true,
    },
    card: {
      artworkUrl: "",
      decorativeBorderSvgUrl: "",
      backgroundColor: "#24121A",
      aspectRatio: "portrait",
      cssConfig: {
        backgroundColor: "#24121A",
        paperShadow: "inset 0 0 50px rgba(255, 138, 128, 0.06), 0 20px 60px rgba(0,0,0,0.7)",
        border: {
          type: "double-gold",
          color: "#FF8A80",
          secondaryColor: "#FF7043",
          thickness: 1.5,
          offset: 10,
        },
      },
    },
    defaultTextLayers: [
      { id: "ss-subhdr", key: "header", text: "AN INTIMATE EVENING UNDER THE STARS", fontFamily: "'Montserrat', sans-serif", fontSize: 9.5, fontWeight: "600", color: "#FFE4D6", textAlign: "center", top: 16, left: 50, letterSpacing: 3, casing: "uppercase" },
      { id: "ss-title", key: "title", text: "Sunset Dinner Soirée", fontFamily: "'Great Vibes', cursive", fontSize: 42, fontWeight: "400", color: "#FFFFFF", textAlign: "center", top: 32, left: 50 },
      { id: "ss-hdr", key: "subtitle", text: "CELEBRATING CHEF'S PRIVATE TASTING MENU", fontFamily: "'Playfair Display', serif", fontSize: 11, fontWeight: "500", color: "#FFD8C2", textAlign: "center", top: 50, left: 50, letterSpacing: 1 },
      { id: "ss-datetime", key: "datetime", text: "SATURDAY, OCTOBER 21ST AT 6:30 PM", fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: "600", color: "#FFFFFF", textAlign: "center", top: 62, left: 50 },
      { id: "ss-venue", key: "venue", text: "VILLA DEL MAR - WINE CELLAR", fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: "600", color: "#FFFFFF", textAlign: "center", top: 72, left: 50 },
      { id: "ss-address", key: "address", text: "442 Cypress Canyon Road, Malibu", fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: "400", color: "#FFD8C2", textAlign: "center", top: 79, left: 50 },
      { id: "ss-rsvp", key: "rsvp", text: "FARM-TO-TABLE 4-COURSE MENU · RSVP BY OCT 8", fontFamily: "'Montserrat', sans-serif", fontSize: 9, fontWeight: "600", color: "#FFE4D6", textAlign: "center", top: 86, left: 50, letterSpacing: 1.5, casing: "uppercase" },
    ],
  },
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
    badge: 'Trending',
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
    envelopeColor: ev.envelope.outerColor,
    envelopeLiner: ev.envelope.linerPatternUrl,
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
      outerColor: ev.envelope.outerColor,
      liner: (ev.envelope as any)?.linerCss || (ev.envelope as any)?.liner || ev.envelope.linerPatternUrl || 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)',
      linerPattern: ev.envelope.linerPatternUrl,
      linerPatternUrl: ev.envelope.linerPatternUrl,
      linerCss: (ev.envelope as any)?.linerCss,
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
  return matchedKey ? NEW_TEMPLATES_CONFIG[matchedKey] : null;
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
