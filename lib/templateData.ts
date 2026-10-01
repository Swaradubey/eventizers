import { NEW_TEMPLATES_CARD_ITEMS } from "./newTemplatesData";

export interface TemplateItem {
  id: string;
  type: string;
  category: string;
  title: string;
  badge?: "Trending" | "FREE" | "PREMIUM" | string;
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
}

export const templateCards: TemplateItem[] = [
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
