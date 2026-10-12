export interface VideoTemplate {
  id: string;
  title: string;
  category: string;
  tier: "Included" | "Premium" | "Signature";
  thumbnail: string;
  videoUrl: string;
  defaultPrompt: string;
  soundPreview?: boolean;
  audioTrack?: string;
  motionIntensity?: number;
  badge?: string;
  sampleDescription?: string;
}

export const VIDEO_TEMPLATES_CATALOG: VideoTemplate[] = [
  {
    id: "baby-dance",
    title: "Baby Dance",
    category: "Fun & Kids",
    tier: "Included",
    thumbnail: "/images/baby.webp",
    videoUrl: "/videos/golden-celebration.mp4",
    defaultPrompt: "Joyful celebratory baby dance animation with high-energy cute moves, colorful confetti bursts, vibrant party lights, cinematic 9:16 mobile frame.",
    soundPreview: true,
    motionIntensity: 140,
    badge: "Trending",
    sampleDescription: "Baby Leo turns 1! Join our joyful first birthday dance party celebration",
  },
  {
    id: "groove-duo",
    title: "Groove Duo",
    category: "Dance & Party",
    tier: "Included",
    thumbnail: "/images/party.webp",
    videoUrl: "/videos/celebration-motion.mp4",
    defaultPrompt: "Dynamic dancing duo celebrating on the dance floor with synchronized choreography, pulsing club spotlights, disco sparkles, energetic motion.",
    soundPreview: true,
    motionIntensity: 150,
    badge: "Viral Dance",
    sampleDescription: "Join Maya & Alex on the dance floor for their epic anniversary bash",
  },
  {
    id: "mic-drop",
    title: "Mic Drop Rap",
    category: "Hip-Hop & Stage",
    tier: "Premium",
    thumbnail: "/images/concert.webp",
    videoUrl: "/videos/celebration-motion.mp4",
    defaultPrompt: "Epic hip-hop stage mic drop moment, dramatic smoke cannons, golden laser beams, stadium flashbulbs, superstar hype celebration.",
    soundPreview: true,
    motionIntensity: 135,
    badge: "Superstar",
    sampleDescription: "Mic Drop 30! Jordan's headline birthday concert and afterparty",
  },
  {
    id: "burj-khalifa",
    title: "Burj Khalifa Birthday",
    category: "Milestones & Luxury",
    tier: "Signature",
    thumbnail: "/images/rooftop.webp",
    videoUrl: "/videos/golden-celebration.mp4",
    defaultPrompt: "Spectacular Burj Khalifa skyscraper LED laser celebration, Dubai fountain lights, illuminated personalized birthday projection, golden fireworks.",
    soundPreview: true,
    motionIntensity: 130,
    badge: "Ultra Luxury",
    sampleDescription: "Dubai Skyline Gala: An extraordinary evening celebrating Marcus's milestone",
  },
  {
    id: "lion-lady",
    title: "Lion & The Lady",
    category: "Fantasy & Royalty",
    tier: "Signature",
    thumbnail: "/images/anniversary.webp",
    videoUrl: "/videos/golden-celebration.mp4",
    defaultPrompt: "Regal luxury fantasy royal court with magnificent golden lion companion, ethereal golden twilight, velvet banners, opulent royal celebration.",
    soundPreview: true,
    motionIntensity: 120,
    badge: "Regal",
    sampleDescription: "A Royal Court Birthday Celebration for Queen Victoria's 40th",
  },
  {
    id: "rooftop-40th",
    title: "Rooftop 40th Birthday",
    category: "Cocktails & Chic",
    tier: "Premium",
    thumbnail: "/images/jessica.webp",
    videoUrl: "/videos/golden-celebration.mp4",
    defaultPrompt: "Glamorous VIP penthouse rooftop celebration under city skyline, champagne sparkle fountains, warm ambient fairy lights, golden milestone toast.",
    soundPreview: true,
    motionIntensity: 125,
    badge: "Popular",
    sampleDescription: "Jessica turns 40! Rooftop cocktail evening under the stars",
  },
  {
    id: "premiere",
    title: "Movie Premiere",
    category: "Cinematic & Gala",
    tier: "Premium",
    thumbnail: "/images/rooftop.webp",
    videoUrl: "/videos/golden-celebration.mp4",
    defaultPrompt: "Hollywood blockbuster movie premiere trailer teaser, dramatic rich red velvet curtains opening, warm golden stage spotlights, floating particles in dark luxury theatre.",
    soundPreview: true,
    motionIntensity: 135,
    badge: "Hollywood",
    sampleDescription: "A blockbuster Hollywood-style premiere party for Marcus",
  },
  {
    id: "wedding",
    title: "Wedding & Nuptials",
    category: "Weddings",
    tier: "Premium",
    thumbnail: "/images/couple.webp",
    videoUrl: "/videos/golden-celebration.mp4",
    defaultPrompt: "Romantic ethereal wedding celebration garden, soft pastel rose petals gently floating in breeze, golden hour sunlight bokeh, floral elegance.",
    soundPreview: true,
    motionIntensity: 110,
    badge: "Romantic",
    sampleDescription: "Sarah & David invite you to celebrate their eternal union",
  },
  {
    id: "vhs",
    title: "Retro VHS",
    category: "Vintage & Nostalgia",
    tier: "Premium",
    thumbnail: "/images/old-beach.webp",
    videoUrl: "/videos/celebration-motion.mp4",
    defaultPrompt: "Nostalgic 1990s retro home video aesthetic, subtle VHS magnetic tape scanlines, warm CRT glow, vibrant nostalgic party lighting.",
    soundPreview: true,
    motionIntensity: 130,
    badge: "90s Retro",
    sampleDescription: "Throwback 90s neon basement party with classic retro music",
  },
  {
    id: "golden",
    title: "Golden Milestone",
    category: "Milestones & Luxury",
    tier: "Signature",
    thumbnail: "/images/anniversary.webp",
    videoUrl: "/videos/golden-celebration.mp4",
    defaultPrompt: "Ultra-luxury black and 3D shimmering gold particles, elegant milestone celebration, fluid metallic golden motion, sparkling light reflections.",
    soundPreview: true,
    motionIntensity: 125,
    badge: "Signature",
    sampleDescription: "Celebrating 50 golden years of love, memories, and family",
  },
  {
    id: "news",
    title: "Breaking News",
    category: "Novelty & Fun",
    tier: "Included",
    thumbnail: "/images/marcus.webp",
    videoUrl: "/videos/celebration-motion.mp4",
    defaultPrompt: "Dynamic breaking news broadcast television studio backdrop, rotating digital globe, sleek crimson high-tech motion graphics.",
    soundPreview: true,
    motionIntensity: 135,
    badge: "Comedy",
    sampleDescription: "Breaking news bulletin: Marcus is officially hitting half a century",
  },
  {
    id: "grad",
    title: "Graduation Gala",
    category: "Academic",
    tier: "Included",
    thumbnail: "/images/grad.webp",
    videoUrl: "/videos/golden-celebration.mp4",
    defaultPrompt: "Epic cinematic graduation commencement celebration, golden confetti drifting in slow motion, sunlit graduation caps flying, triumphant warm golden rim lighting.",
    soundPreview: true,
    motionIntensity: 140,
    badge: "Honors",
    sampleDescription: "Honoring our class of 2026 graduation banquet & commencement",
  },
];

export function findVideoTemplate(id?: string | null): VideoTemplate {
  if (!id) return VIDEO_TEMPLATES_CATALOG[3]; // Burj Khalifa as default luxury preset
  return (
    VIDEO_TEMPLATES_CATALOG.find((t) => t.id === id) ||
    VIDEO_TEMPLATES_CATALOG.find((t) => t.id.toLowerCase() === id.toLowerCase()) ||
    VIDEO_TEMPLATES_CATALOG[0]
  );
}
