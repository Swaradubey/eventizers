export interface NewTemplateData {
  id: string;
  type: string; // Category name
  category: string;
  designer?: string;
  title: string;
  badge?: "Trending" | "FREE" | "PREMIUM";
  subtitle: string;
  date: string;
  time: string;
  host: string;
  venue: string;
  gradient: string;
  accentColor: string;
  emoji: string;
  image: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  titleSize: number;
  fontWeight: string;
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
}

export const NEW_TEMPLATES: NewTemplateData[] = [
  // 1. Electric Outline
  {
    id: "tpl-electric-outline",
    type: "Kids Birthday",
    category: "Birthday",
    title: "Electric Outline",
    badge: "Trending",
    subtitle: "Bruh, You In? Otto's 8th Birthday Celebration",
    date: "Sat, Aug 4",
    time: "2:30 PM",
    host: "Hosted by Otto & Family",
    venue: "Zero Gravity Park",
    gradient: "linear-gradient(135deg, #0A0B10 0%, #171923 100%)",
    accentColor: "#FFEE00",
    emoji: "⚡",
    image: "/assets/templates/electric-outline.svg",
    description: "Bruh, you in? Join us for an epic gravity-defying party with obstacle courses, neon laser games, and electric pizza!",
    backgroundColor: "#0A0B10",
    textColor: "#FFFFFF",
    titleSize: 42,
    fontWeight: "800",
    fontFamily: "Montserrat",
    buttonColor: "#FFEE00",
    buttonRadius: 9999,
    buttonText: "RSVP to Celebrate",
    textAlignment: "center",
    swatches: ["#FEF08A", "rainbow", "#F472B6"],
    envelopeColor: "#FACC15",
    envelopeLiner: "linear-gradient(135deg, #D4FF00 0%, #00D2FF 100%)",
    gallery: [],
    sections: [
      { title: "Dress Code", content: "Neon colors, sneakers & athletic gear" },
      { title: "Activities", content: "Trampoline arena, laser tag, and zero gravity obstacle race" }
    ]
  },

  // 2. Cake and Confetti (Rifle Paper Co.)
  {
    id: "tpl-cake-and-confetti",
    type: "Kids Birthday",
    category: "Birthday",
    designer: "Rifle Paper Co.",
    title: "Cake and Confetti",
    badge: "Trending",
    subtitle: "Jamie is Turning 6 & We're Having a Party",
    date: "Sat, Jul 8",
    time: "12:00 PM",
    host: "Hosted by The Arable Family",
    venue: "The Arable Residence",
    gradient: "linear-gradient(135deg, #FAF6EE 0%, #F5EFEB 100%)",
    accentColor: "#D97706",
    emoji: "🎂",
    image: "/assets/templates/cake-and-confetti.svg",
    description: "Jamie is turning 6! Please join us for an afternoon celebration filled with homemade confetti cakes, cheerful balloons, and backyard games.",
    backgroundColor: "#FAF6EE",
    textColor: "#2B2118",
    titleSize: 38,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#D97706",
    buttonRadius: 9999,
    buttonText: "RSVP to Jamie's Party",
    textAlignment: "center",
    envelopeColor: "#F7F5F0",
    envelopeLiner: "radial-gradient(ellipse at center, #E6C875 0%, #C49B45 60%, #997328 100%)",
    gallery: [],
    sections: [
      { title: "Menu", content: "Artisanal sandwiches, confetti cakes, and fresh fruit lemonades" },
      { title: "Fun & Games", content: "Piñata smashing, face painting, and balloon animals" }
    ]
  },

  // 3. Hype Night
  {
    id: "tpl-hype-night",
    type: "Kids Birthday",
    category: "Birthday",
    title: "Hype Night",
    badge: "Trending",
    subtitle: "Let's Party - Alexander's 8th Birthday",
    date: "Sun, Oct 12",
    time: "2:00 PM",
    host: "Hosted by Alexander's Family",
    venue: "Zero Gravity Adventure Park",
    gradient: "linear-gradient(135deg, #14131A 0%, #2E1065 100%)",
    accentColor: "#EC4899",
    emoji: "🎉",
    image: "/assets/templates/hype-night.svg",
    description: "Let's party! Celebrate Alexander's 8th birthday with extreme fun, arcade mania, pizza, and prizes.",
    backgroundColor: "#14131A",
    textColor: "#F8FAFC",
    titleSize: 40,
    fontWeight: "800",
    fontFamily: "Montserrat",
    buttonColor: "#EC4899",
    buttonRadius: 9999,
    buttonText: "RSVP to Roll",
    textAlignment: "center",
    isLandscape: true,
    swatches: ["split-purple-pink", "#15803D", "rainbow"],
    envelopeColor: "#F9C5D5",
    envelopeLiner: "radial-gradient(circle at 50% 50%, #FF66B2 0%, #D92080 50%, #991054 100%)",
    gallery: [],
    sections: [
      { title: "Schedule", content: "2 PM Arrival & Jump Time, 3:30 PM Pizza & Cake Celebration" }
    ]
  },

  // 4. Floating Cakes (Little Cube)
  {
    id: "tpl-floating-cakes",
    type: "Kids Birthday",
    category: "Birthday",
    designer: "Little Cube",
    title: "Floating Cakes",
    subtitle: "Mia's Turning 5 - Confetti & Cake Celebration",
    date: "Sun, Apr 19",
    time: "1:00 PM",
    host: "Hosted by The Harpers",
    venue: "The Arable Residence, Brooklyn",
    gradient: "linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 100%)",
    accentColor: "#E11D48",
    emoji: "🍰",
    image: "/assets/templates/floating-cakes.svg",
    description: "Join us for a celebration full of confetti and cake! We're celebrating Mia's 5th birthday with sweet treats and playful memories.",
    backgroundColor: "#FAF8F5",
    textColor: "#2B2D31",
    titleSize: 40,
    fontWeight: "600",
    fontFamily: "Playfair Display",
    buttonColor: "#E11D48",
    buttonRadius: 9999,
    buttonText: "RSVP for Mia",
    textAlignment: "center",
    envelopeColor: "#F5CAD5",
    envelopeLiner: "sprinkles",
    gallery: [],
    sections: [
      { title: "Sweet Delights", content: "Cupcake decorating station & dessert buffet" }
    ]
  },

  // 5. Friendship Charms (Meri Meri)
  {
    id: "tpl-friendship-charms",
    type: "Kids Birthday",
    category: "Birthday",
    designer: "Meri Meri",
    title: "Friendship Charms",
    subtitle: "Fern is Turning 8 - Join Us for a Celebration",
    date: "Fri, Aug 12",
    time: "3:00 PM",
    host: "Hosted by Fern & Family",
    venue: "Our Place",
    gradient: "linear-gradient(135deg, #FAF8F2 0%, #FEE2E2 100%)",
    accentColor: "#EF4444",
    emoji: "💖",
    image: "/assets/templates/friendship-charms.svg",
    description: "Let's party! Join Fern to celebrate turning 8 with friendship bracelet crafting, charms bar, music, and strawberry treats.",
    backgroundColor: "#FAF8F2",
    textColor: "#3B271E",
    titleSize: 36,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#EF4444",
    buttonRadius: 9999,
    buttonText: "Join the Charm Party",
    textAlignment: "center",
    envelopeColor: "#F7BABA",
    envelopeLiner: "charms",
    gallery: [],
    sections: [
      { title: "DIY Bar", content: "Make your own charm bracelet to take home!" }
    ]
  },

  // 6. Sporty Frame (Meri Meri)
  {
    id: "tpl-sporty-frame",
    type: "Kids Birthday",
    category: "Birthday",
    designer: "Meri Meri",
    title: "Sporty Frame",
    subtitle: "Let's Have a Ball! Tom's Seventh Birthday",
    date: "Sun, Jul 1",
    time: "3:00 PM",
    host: "Hosted by Tom's Family",
    venue: "Mitchell Park",
    gradient: "linear-gradient(135deg, #FAF9F5 0%, #F0FDF4 100%)",
    accentColor: "#0284C7",
    emoji: "⚽",
    image: "/assets/templates/sporty-frame.svg",
    description: "Let's have a ball! Grab your sneakers and join us on the field for Tom's 7th birthday sports festival with soccer, kickball, and hot dogs.",
    backgroundColor: "#FAF9F5",
    textColor: "#0F172A",
    titleSize: 36,
    fontWeight: "800",
    fontFamily: "Montserrat",
    buttonColor: "#0284C7",
    buttonRadius: 9999,
    buttonText: "Join the Team RSVP",
    textAlignment: "center",
    envelopeColor: "#0C9744",
    envelopeLiner: "sports",
    gallery: [],
    sections: [
      { title: "Sports Clinic", content: "Soccer drills, relay races, and home-run derby" }
    ]
  },
];

export const NEW_TEMPLATES_CARD_ITEMS = NEW_TEMPLATES.map((t) => ({
  id: t.id,
  type: t.type,
  category: t.category,
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
}));

export const NEW_TEMPLATES_CONFIG: Record<string, NewTemplateData> = NEW_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = {
    ...t,
  };
  return acc;
}, {} as Record<string, NewTemplateData>);

export const NEW_TEMPLATE_DEFAULTS = NEW_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = {
    ...t,
  };
  return acc;
}, {} as Record<string, any>);

export const getTemplateConfig = (templateId?: string | null): NewTemplateData | null => {
  if (!templateId) return null;
  if (NEW_TEMPLATES_CONFIG[templateId]) {
    return NEW_TEMPLATES_CONFIG[templateId];
  }
  // Try case-insensitive or trim search
  const cleanId = templateId.trim().toLowerCase();
  const matchedKey = Object.keys(NEW_TEMPLATES_CONFIG).find(
    (k) => k.toLowerCase() === cleanId
  );
  if (matchedKey) {
    return NEW_TEMPLATES_CONFIG[matchedKey];
  }
  return null;
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
