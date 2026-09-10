// =============================================================================
// Evite 4-Layer Decoupled Architecture - Template Registry & Schema Definition
// Source of Truth: All templates define isolated backdrop, envelope, card artwork,
// and dynamic live text layers without baked-in typography.
// =============================================================================

export interface EviteTemplateSchema {
  id: string;
  title: string;
  category: 'Baby Shower' | 'Wedding' | 'Birthday' | 'All';
  backdrop: {
    type: 'color' | 'texture';
    value: string; // e.g. '#9c7cb6' or '/textures/purple-linen.jpg'
  };
  envelope: {
    outerColor: string;     // e.g. '#E05A3E'
    linerPatternUrl: string;// e.g. '/liners/floral-pattern.svg'
    isOpen: boolean;
  };
  card: {
    artworkUrl: string; // Pure decorative frame/illustration ONLY. Absolutely NO hardcoded typography or text strings.
    backgroundColor: string; // e.g. '#211717'
    aspectRatio: '5x7' | 'square';
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
  }>;
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
                "top": 53.5,
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
                "top": 65.5,
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
                "top": 69,
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
                "top": 78,
                "left": 50
          }
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
    casing: 'none',
    letterSpacing: 0.5,
    lineHeight: 1.2,
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
    backdrop: ev.backdrop,
    envelope: ev.envelope,
    card: ev.card,
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
