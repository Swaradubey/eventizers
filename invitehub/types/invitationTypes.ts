export interface EviteTemplateSchema {
  id: string;
  title: string;
  category: 'Baby Shower' | 'Wedding' | 'Birthday' | 'Corporate' | 'All';
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

export interface TextLayer {
  id: string;
  key?: string;
  text: string;
  x: number; // percentage: 0 to 100
  y: number; // percentage: 0 to 100
  top?: number; // alias for y
  left?: number; // alias for x
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
  width?: number; // percentage or px width
  height?: number; // computed height
  cardWidth?: number; // base container width when designed
}

export interface EnvelopeConfig {
  color: string;
  liner: string;
  stamp: string | null;
  sticker: string | null;
}

export interface StageBackdropConfig {
  type: "color" | "pattern";
  value: string;
  gradient?: string;
}

export interface CardBgConfig {
  type: "color" | "gradient" | "image" | "preset";
  value: string;
}

export interface EffectsConfig {
  foil: "gold" | "rose-gold" | "silver" | null;
  texture: "matte" | "cotton-press" | "linen" | "glossy";
  shadow: "subtle" | "floating" | "deep" | "none";
}

export interface CanvasStageConfig {
  activeTemplateId?: string | null;
  textLayers: TextLayer[];
  selectedTextId?: string | null;
  photoSlot?: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: string;
    imageUrl?: string | null;
  } | null;
  isLandscape?: boolean;
  cardBg: CardBgConfig;
  card?: {
    artworkUrl: string;
    backgroundColor: string;
    aspectRatio?: '5x7' | 'square' | string;
  };
  stageBackdrop: StageBackdropConfig;
  backdrop?: {
    type: 'color' | 'texture';
    value: string;
    gradient?: string;
  };
  canvasWorkspaceBg?: string;
  backdropBackground?: string;
  envelope: EnvelopeConfig;
  effects: EffectsConfig;
  eventDetails?: {
    title: string;
    host: string;
    date: string;
    time: string;
    venue: string;
    address: string;
    description?: string;
  };
}

export interface Invitation {
  id: string;
  eventId: string;
  templateId?: string;
  title: string;
  subtitle?: string;
  mainText?: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  titleSize: number;
  fontWeight: string | number;
  fontFamily: string;
  textAlignment: string;
  imageUrl?: string;
  buttonText: string;
  buttonColor: string;
  buttonRadius: number;
  status: "draft" | "published";
  // User-editable event detail overrides
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  createdAt?: string;
  updatedAt?: string;
  // 4-Layer Evite-style Decoupled State
  textElements?: TextLayer[];
  envelope?: EnvelopeConfig;
  stageBackdrop?: StageBackdropConfig;
  backdrop?: {
    type: 'color' | 'texture';
    value: string;
  };
  card?: {
    artworkUrl: string;
    backgroundColor: string;
    aspectRatio?: '5x7' | 'square' | string;
  };
  background?: CardBgConfig;
  cardBg?: CardBgConfig;
  effects?: EffectsConfig;
  isLandscape?: boolean;
  designData?: any;
}

export interface InvitationPayload {
  id?: string;
  eventId: string;
  templateId?: string;
  title: string;
  subtitle?: string;
  mainText?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  titleSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  textAlignment?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonColor?: string;
  buttonRadius?: number;
  status?: "draft" | "published";
  // User-editable event detail overrides
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  // 4-Layer Evite-style Decoupled State
  textElements?: TextLayer[];
  envelope?: EnvelopeConfig;
  stageBackdrop?: StageBackdropConfig;
  background?: CardBgConfig;
  cardBg?: CardBgConfig;
  effects?: EffectsConfig;
  isLandscape?: boolean;
  designData?: any;
}

export interface InvitationResponse {
  success: boolean;
  message?: string;
  invitation: Invitation;
}

export interface InvitationsResponse {
  success: boolean;
  message?: string;
  invitations: Invitation[];
}

export interface SendInvitationResponse {
  success: boolean;
  message: string;
}
