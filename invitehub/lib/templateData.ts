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

export const matchesCategory = (itemCategory: string, selectedCategory: string): boolean => {
  if (selectedCategory === "All") return true;
  const target = selectedCategory.toLowerCase();
  const cat = (itemCategory || "").toLowerCase();

  if (target === "baby shower") {
    return cat.includes("baby shower") || cat.includes("baby");
  }
  if (target === "corporate") {
    return cat.includes("corporate") || cat.includes("conference") || cat.includes("business") || cat.includes("summit");
  }
  if (target === "networking") {
    return cat.includes("networking") || cat.includes("mixer") || cat.includes("meetup");
  }
  if (target === "birthday") {
    return cat.includes("birthday") || cat.includes("bday");
  }
  if (target === "wedding") {
    return cat.includes("wedding");
  }

  return cat.includes(target) || target.includes(cat);
};
