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

export interface EviteTemplateSchema {
  id: string;
  title: string;
  name?: string;
  category: 'Baby Shower' | 'Wedding' | 'Birthday' | 'All' | 'bridal_shower' | string;
  tags?: string[];
  isPremium?: boolean;
  badge?: 'Trending' | 'FREE' | 'Free' | 'PREMIUM' | 'Premium' | string;
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
  envelope: {
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
  isPremium?: boolean;
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
}));

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

  // 1. If URL contains /assets/ or /templates/, this is a frontend static asset.
  // Strip any foreign host prefix (http://localhost:5000, https://eventizersbackend.vercel.app, etc.)
  // so the client always loads it directly from the current frontend origin without CORS or 404 issues.
  const assetMatch = trimmed.match(/^(?:https?:\/\/[^/]+)?(\/(?:assets|templates)\/.*)$/i);
  if (assetMatch) {
    return assetMatch[1];
  }

  // 2. If running on HTTPS in production, upgrade insecure http:// URLs to https:// (except localhost)
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    trimmed.startsWith("http://") &&
    !trimmed.includes("localhost") &&
    !trimmed.includes("127.0.0.1")
  ) {
    return trimmed.replace(/^http:\/\//i, "https://");
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
      bt.backgroundImage ||
      bt.canvasData?.backgroundImage ||
      contentObj.backgroundImage ||
      contentObj.canvasData?.backgroundImage ||
      bt.backgroundUrl ||
      contentObj.backgroundUrl ||
      bt.card?.artworkUrl ||
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
      image: bgUrl || normalizeTemplateImageUrl(bt.thumbnailUrl || bt.imageUrl || bt.image) || "/assets/templates/chic-dinner-cake-mockup.svg",
      backgroundImage: bgUrl,
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
    };
    NEW_TEMPLATES_CONFIG[bt.id] = transformed;
    const existingIdx = NEW_TEMPLATES.findIndex(t => t.id === bt.id);
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
