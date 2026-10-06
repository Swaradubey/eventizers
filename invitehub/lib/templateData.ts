import { NEW_TEMPLATES_CARD_ITEMS } from "./newTemplatesData";

export interface TemplateItem {
  id: string;
  type: string;
  category: string;
  title: string;
  badge?: "Trending" | "FREE" | "PREMIUM" | "Free" | "Premium" | string;
  subtitle?: string;
  date: string;
  time: string;
  host: string;
  venue?: string;
  gradient: string;
  accentColor: string;
  emoji: string;
  image: string;
  mockupUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonText?: string;
  gallery?: string[];
  sections?: { title: string; content: string }[];
  isPremium?: boolean;
}

export interface HalloweenTemplate {
  id: string;
  title: string;
  category: string;
  badge: "Free" | "Premium" | string;
  isPremium: boolean;
  image: string;
  accentColor: string;
  description: string;
}

export const halloweenTemplates: HalloweenTemplate[] = [
  {
    id: "halloween-feast",
    title: "Halloween Feast",
    category: "Halloween",
    badge: "Free",
    isPremium: false,
    image: "/templates/halloween-feast.png",
    accentColor: "from-amber-500/20 to-orange-600/30",
    description: "Let's eat, drink, & be scary dinner party theme"
  },
  {
    id: "glowing-pumpkins",
    title: "Glowing Pumpkins",
    category: "Halloween",
    badge: "Free",
    isPremium: false,
    image: "/templates/glowing-pumpkins.png",
    accentColor: "from-orange-500/20 to-yellow-600/30",
    description: "Halloween Bash with classic glowing jack-o'-lanterns"
  },
  {
    id: "sweet-not-scary",
    title: "Sweet, Not Scary",
    category: "Kids Halloween",
    badge: "Free",
    isPremium: false,
    image: "/templates/sweet-not-scary.png",
    accentColor: "from-pink-400/20 to-rose-500/30",
    description: "Soft pink cute BOO! theme for kids and treats"
  },
  {
    id: "dramatic-doily",
    title: "Dramatic Doily",
    category: "Gothic & Dinner",
    badge: "Premium",
    isPremium: true,
    image: "/templates/dramatic-doily.png",
    accentColor: "from-red-900/30 to-rose-950/40",
    description: "Dying to party with you vintage lace & candlelight"
  },
  {
    id: "candy-cauldron",
    title: "Candy Cauldron",
    category: "Trick or Treat",
    badge: "Premium",
    isPremium: true,
    image: "/templates/candy-cauldron.png",
    accentColor: "from-emerald-500/20 to-teal-700/30",
    description: "A party is brewing witch cauldron full of candy"
  },
  {
    id: "holographic-hey-boo",
    title: "Holographic Hey Boo",
    category: "Trendy / Disco",
    badge: "Premium",
    isPremium: true,
    image: "/templates/holographic-hey-boo.png",
    accentColor: "from-purple-500/20 to-fuchsia-600/30",
    description: "Modern iridescent pastel holographic spooky party"
  },
  {
    id: "halloween-string-lights",
    title: "Halloween String Lights",
    category: "Party & Night",
    badge: "Free",
    isPremium: false,
    image: "/templates/halloween-string-lights.png",
    accentColor: "from-amber-400/20 to-orange-500/30",
    description: "Bunting banner and pumpkin string light party"
  },
  {
    id: "lets-boogie",
    title: "Let's Boogie",
    category: "Costume Party",
    badge: "Free",
    isPremium: false,
    image: "/templates/lets-boogie.png",
    accentColor: "from-indigo-500/20 to-purple-600/30",
    description: "Spooky costume dance party with cute monsters"
  },
  {
    id: "peanuts-spooky-snoopy",
    title: "Vintage Spooky Snoopy",
    category: "Vintage / Classic",
    badge: "Free",
    isPremium: false,
    image: "/templates/spooky-snoopy.png",
    accentColor: "from-lime-500/20 to-amber-700/30",
    description: "Retro cartoon pumpkin patch & candlelit invitation"
  }
];

const halloweenTemplateCards: TemplateItem[] = halloweenTemplates.map((ht) => ({
  id: ht.id,
  type: "halloween",
  category: ht.category,
  title: ht.title,
  badge: ht.badge,
  isPremium: ht.isPremium,
  subtitle: ht.description,
  date: "2026-10-31",
  time: "19:00",
  host: "Eventizer Host",
  venue: "Haunted Celebration Hall",
  gradient: ht.accentColor,
  accentColor: ht.accentColor,
  emoji: ht.isPremium ? "👑" : "🎃",
  image: ht.image,
  mockupUrl: ht.image,
  thumbnailUrl: ht.image,
  description: ht.description,
  backgroundColor: "#111827",
  textColor: "#F9FAFB",
}));

export const templateCards: TemplateItem[] = [
  ...halloweenTemplateCards,
  ...NEW_TEMPLATES_CARD_ITEMS
];

export const matchesCategory = (
  itemCategoryOrItem: string | any,
  selectedCategory: string,
  extraItem?: any
): boolean => {
  const item = typeof itemCategoryOrItem === "object" && itemCategoryOrItem !== null ? itemCategoryOrItem : extraItem;
  const itemCategory = typeof itemCategoryOrItem === "string" ? itemCategoryOrItem : (item?.category || item?.type);
  const target = (selectedCategory || "All").trim().toLowerCase();

  if (target === "all") return true;

  const itemId = item?.id ? String(item.id).trim().toLowerCase() : "";
  const isCorporateExclusive = itemId === "citrus-splash" || itemId === "garden-blooms";

  // When a specific category tab is selected, Citrus Splash & Garden Blooms only match under "corporate"
  if (isCorporateExclusive) {
    return target === "corporate";
  }

  const cat = (itemCategory || "").toLowerCase();
  const rawTags = item?.tags || [];
  const tags = Array.isArray(rawTags) ? rawTags.map((tg: string) => String(tg).toLowerCase()) : [];

  if (target === "halloween" || target === "fall") {
    return (
      cat.includes("halloween") ||
      cat.includes("fall") ||
      cat.includes("trick") ||
      cat.includes("gothic") ||
      cat.includes("costume") ||
      cat.includes("disco") ||
      cat.includes("vintage") ||
      itemId.includes("halloween") ||
      itemId.includes("pumpkin") ||
      itemId.includes("doily") ||
      itemId.includes("cauldron") ||
      itemId.includes("boo") ||
      itemId.includes("boogie") ||
      itemId.includes("snoopy")
    );
  }

  if (target === "corporate") {
    return cat === "corporate" || cat.includes("corporate") || tags.includes("corporate") || cat.includes("conference") || cat.includes("business") || cat.includes("summit") || cat.includes("enterprise");
  }
  if (target === "baby shower") {
    return cat.includes("baby shower") || cat.includes("baby") || cat.includes("bridal shower") || cat.includes("bridal");
  }
  if (target === "networking") {
    return cat.includes("networking") || cat.includes("mixer") || cat.includes("meetup") || cat.includes("founders") || cat.includes("connect");
  }
  if (target === "birthday" || target === "adult birthday") {
    return cat.includes("birthday") || cat.includes("bday") || cat.includes("milestone") || cat.includes("celebration");
  }
  if (target === "wedding") {
    return cat.includes("wedding") || cat.includes("bridal") || cat.includes("anniversary");
  }

  return cat.includes(target) || target.includes(cat) || tags.includes(target);
};
