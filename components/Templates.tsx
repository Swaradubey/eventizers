"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import templateService from "@/services/templateService";
import eventService from "@/services/eventService";
import AnimatedHeading from "./AnimatedHeading";

const getDefaultEventDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
};

export interface CuratedTemplate {
  id: string;
  title: string;
  name?: string;
  designer?: string;
  badge?: "Trending" | "Popular" | "Featured" | "Free" | "Premium" | string;
  category: string;
  tags?: string[];
  thumbnailUrl?: string;
  imageUrl?: string;
  image?: string;
  accentColor?: string;
  description?: string;
  isPremium?: boolean;
  aspectRatio?: "square" | "vertical";
  isSquare?: boolean;
  // Serialized canvas payload (layers/background) when the template carries one.
  canvasData?: any;
}

export interface TemplatesProps {
  onSelectTemplate?: (templateId: string) => void;
}

// Curated Square / Landscape Stationery Templates (Envelope & flatlay format)
export const SQUARE_TEMPLATES: CuratedTemplate[] = [
  {
    id: "retro-little-monsters",
    title: "Retro Little Monsters",
    category: "Halloween",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "square",
    isSquare: true,
    image: "/templates/retro-little-monsters.svg",
    imageUrl: "/templates/retro-little-monsters.svg",
    thumbnailUrl: "/templates/retro-little-monsters.svg",
    accentColor: "from-violet-500/20 to-emerald-500/30",
    description: "Groovy monsters throw a monstrously good time"
  },
  {
    id: "creepy-cake",
    title: "Creepy Cake",
    category: "Halloween",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "square",
    isSquare: true,
    image: "/templates/creepy-cake.svg",
    imageUrl: "/templates/creepy-cake.svg",
    thumbnailUrl: "/templates/creepy-cake.svg",
    accentColor: "from-orange-500/20 to-red-600/30",
    description: "Spooky three-tier cake for a frighteningly fun bash"
  },
  {
    id: "holographic-hey-boo",
    title: "Holographic Hey Boo",
    category: "Halloween",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "square",
    isSquare: true,
    image: "/templates/holographic-hey-boo.svg",
    imageUrl: "/templates/holographic-hey-boo.svg",
    thumbnailUrl: "/templates/holographic-hey-boo.svg",
    accentColor: "from-pink-400/20 to-sky-400/30",
    description: "Iridescent pastel ghosts, cats & pumpkins"
  },
  {
    id: "gilded-horror",
    title: "Gilded Horror",
    category: "Halloween",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "square",
    isSquare: true,
    image: "/templates/gilded-horror.svg",
    imageUrl: "/templates/gilded-horror.svg",
    thumbnailUrl: "/templates/gilded-horror.svg",
    accentColor: "from-amber-500/20 to-yellow-700/30",
    description: "Ornate antique gold frame with spiderweb detailing"
  },
  {
    id: "ribbons-bows",
    title: "Ribbons, Bows",
    category: "Bridal Shower",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "square",
    isSquare: true,
    thumbnailUrl: "/assets/templates/ribbons-bows-mockup.svg",
    imageUrl: "/assets/templates/ribbons-bows-mockup.svg",
    accentColor: "from-zinc-800/20 to-zinc-950/30",
    description: "Sharp black-and-white striped liner with minimalist silk bow"
  },
  {
    id: "painted-petals",
    title: "Painted Petals",
    category: "Wedding",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "square",
    isSquare: true,
    thumbnailUrl: "/assets/templates/painted-petals-mockup.svg",
    imageUrl: "/assets/templates/painted-petals-mockup.svg",
    accentColor: "from-rose-400/20 to-pink-600/30",
    description: "Delicate hand-painted watercolor petals with romantic script"
  },
  {
    id: "lemons-blossoms",
    title: "Lemons & Blossoms",
    category: "Bridal Shower",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "square",
    isSquare: true,
    thumbnailUrl: "/assets/templates/lemons-blossoms-mockup.svg",
    imageUrl: "/assets/templates/lemons-blossoms-mockup.svg",
    accentColor: "from-amber-400/20 to-yellow-500/30",
    description: "Sun-drenched Amalfi citrus and fragrant blossoms"
  },
  {
    id: "mamma-mia",
    title: "Mamma Mia",
    category: "Birthday",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "square",
    isSquare: true,
    thumbnailUrl: "/assets/templates/mamma-mia-mockup.svg",
    imageUrl: "/assets/templates/mamma-mia-mockup.svg",
    accentColor: "from-sky-500/20 to-blue-600/30",
    description: "Vibrant Mediterranean Greek isle celebration"
  },
  {
    id: "moonlit-grove",
    title: "Moonlit Grove",
    category: "Corporate",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "square",
    isSquare: true,
    thumbnailUrl: "/assets/templates/moonlit-grove-mockup.svg",
    imageUrl: "/assets/templates/moonlit-grove-mockup.svg",
    accentColor: "from-emerald-600/20 to-teal-800/30",
    description: "Mystical twilight forest with deep emerald shadows"
  },
  {
    id: "taste-of-italy",
    title: "Taste of Italy",
    category: "Holiday",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "square",
    isSquare: true,
    thumbnailUrl: "/assets/templates/taste-of-italy-mockup.svg",
    imageUrl: "/assets/templates/taste-of-italy-mockup.svg",
    accentColor: "from-orange-600/20 to-red-700/30",
    description: "Warm rustic Italian dinner under string lights"
  }
];

export const HALLOWEEN_TEMPLATES: CuratedTemplate[] = SQUARE_TEMPLATES.slice(0, 4);

// Curated Vertical / Portrait Stationery Templates (Portrait card format)
export const VERTICAL_TEMPLATES: CuratedTemplate[] = [
  {
    id: "o-tannenbaum",
    title: "O Tannenbaum",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "vertical",
    category: "Holiday",
    accentColor: "from-emerald-500/20 to-green-700/30",
    description: "Evergreen pine flatlay with festive gold accents"
  },
  {
    id: "metallic-paint-splatter",
    title: "Metallic Paint Splatter",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "vertical",
    category: "Corporate",
    tags: ["Corporate", "Holiday", "All"],
    accentColor: "from-amber-400/20 to-yellow-600/30",
    description: "Contemporary metallic gold spatter on obsidian paper"
  },
  {
    id: "golden-foliage-holiday",
    title: "Golden Foliage Holiday",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "vertical",
    category: "Holiday",
    accentColor: "from-yellow-500/20 to-amber-600/30",
    description: "Gilded winter botanicals and lustrous typography"
  },
  {
    id: "template-everyones-family",
    title: "Everyone's Family",
    name: "Everyone's Family",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "vertical",
    category: "Thanksgiving",
    tags: ["Thanksgiving", "Autumn", "Fall", "Holiday"],
    thumbnailUrl: "/assets/templates/template-everyones-family-mockup.svg",
    imageUrl: "/assets/templates/template-everyones-family-mockup.svg",
    accentColor: "from-amber-600/20 to-orange-700/30",
    description: "Woodland feast table with family-style place settings",
  },
  {
    id: "botanical-sketch-art",
    title: "Botanical Sketch (Art)",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "vertical",
    category: "Workshop",
    accentColor: "from-teal-500/20 to-emerald-600/30",
    description: "Delicate pressed wild botanicals in hand-drawn charcoal"
  },
  {
    id: "template-give-thanks",
    title: "Give Thanks",
    name: "Give Thanks",
    badge: "Premium",
    isPremium: true,
    aspectRatio: "vertical",
    category: "Thanksgiving",
    tags: ["Thanksgiving", "Autumn", "Fall", "Holiday"],
    thumbnailUrl: "/assets/templates/template-give-thanks-mockup.svg",
    imageUrl: "/assets/templates/template-give-thanks-mockup.svg",
    accentColor: "from-orange-500/20 to-red-600/30",
    description: "Folk-art turkey framed by warm autumn leaves",
  },
  {
    id: "template-thanksgiving-branches",
    title: "Thanksgiving Branches",
    name: "Thanksgiving Branches",
    badge: "Free",
    aspectRatio: "vertical",
    category: "Thanksgiving",
    tags: ["Thanksgiving", "Autumn", "Fall", "Holiday"],
    thumbnailUrl: "/assets/templates/template-thanksgiving-branches-mockup.svg",
    imageUrl: "/assets/templates/template-thanksgiving-branches-mockup.svg",
    accentColor: "from-stone-400/20 to-amber-700/30",
    description: "Delicate botanical branch etchings with a pumpkin vignette",
  },
  {
    id: "tpl-chic-dinner-cake",
    title: "Chic Dinner & Cake Celebration",
    badge: "Premium",
    aspectRatio: "vertical",
    category: "Adult Birthday",
    accentColor: "from-purple-500/20 to-indigo-600/30",
  },
  {
    id: "tpl-modern-gold-black-balloon",
    title: "Modern Gold & Black Balloon Bash",
    badge: "Premium",
    aspectRatio: "vertical",
    category: "Adult Birthday",
    accentColor: "from-amber-500/20 to-yellow-500/30",
  },
  {
    id: "tpl-gold-ribbons-confetti",
    title: "Gold Ribbons & Confetti",
    badge: "Free",
    aspectRatio: "vertical",
    category: "Birthday",
    accentColor: "from-yellow-400/20 to-amber-500/30",
  },
  {
    id: "tpl-sparkle-balloons",
    title: "Sparkle Balloons",
    badge: "Free",
    aspectRatio: "vertical",
    category: "Birthday",
    accentColor: "from-cyan-400/20 to-blue-500/30",
  },
  {
    id: "tpl-celestial-flora",
    title: "Celestial Flora",
    badge: "Free",
    aspectRatio: "vertical",
    category: "Birthday",
    accentColor: "from-indigo-400/20 to-purple-500/30",
  },
  {
    id: "blush-burgundy-blooms",
    title: "Blush & Burgundy Blooms",
    badge: "Premium",
    aspectRatio: "vertical",
    category: "Bridal Shower",
    accentColor: "from-rose-500/20 to-red-600/30",
  },
  {
    id: "something-blue",
    title: "Something Blue",
    badge: "Premium",
    aspectRatio: "vertical",
    category: "Bridal Shower",
    accentColor: "from-blue-400/20 to-indigo-500/30",
  },
  {
    id: "autumn-blooms",
    title: "Autumn Blooms",
    badge: "Premium",
    aspectRatio: "vertical",
    category: "Bridal Shower",
    accentColor: "from-amber-500/20 to-orange-600/30",
  },
  {
    id: "tpl-abstract-nature-party",
    title: "Abstract Nature Party",
    badge: "Free",
    aspectRatio: "vertical",
    category: "Wedding",
    accentColor: "from-emerald-400/20 to-teal-500/30",
  },
  {
    id: "tpl-bright-blooms-garden",
    title: "Bright Blooms Garden",
    badge: "Free",
    aspectRatio: "vertical",
    category: "Wedding",
    accentColor: "from-pink-400/20 to-rose-500/30",
  },
  {
    id: "tpl-vibrant-blooms-wedding",
    title: "Vibrant Blooms Wedding",
    badge: "Free",
    aspectRatio: "vertical",
    category: "Wedding",
    accentColor: "from-violet-400/20 to-purple-500/30",
  },
  {
    id: "tpl-lily-of-the-valley",
    title: "Lily of the Valley",
    badge: "Free",
    aspectRatio: "vertical",
    category: "Wedding",
    accentColor: "from-emerald-400/20 to-green-500/30",
  },
  {
    id: "citrus-splash",
    title: "Farewell Party",
    name: "Citrus Splash",
    badge: "Premium",
    aspectRatio: "vertical",
    category: "Corporate",
    tags: ["Corporate", "Farewell", "Party"],
    accentColor: "from-orange-400/20 to-amber-500/30",
  },
  {
    id: "garden-blooms",
    title: "Annual Charity Gala",
    name: "Garden Blooms",
    badge: "Premium",
    aspectRatio: "vertical",
    category: "Corporate",
    tags: ["Corporate", "Charity", "Gala", "Annual"],
    accentColor: "from-rose-400/20 to-pink-600/30",
  },
];

export const isSquareTemplate = (template: CuratedTemplate): boolean => {
  return (
    template.aspectRatio === "square" ||
    !!template.isSquare ||
    template.image?.startsWith("/templates/") ||
    template.thumbnailUrl?.startsWith("/templates/") ||
    [
      "retro-little-monsters",
      "creepy-cake",
      "holographic-hey-boo",
      "gilded-horror",
      "ribbons-bows",
      "painted-petals",
      "lemons-blossoms",
      "mamma-mia",
      "moonlit-grove",
      "taste-of-italy",
    ].includes(template.id)
  );
};

// All Curated Stationery Templates interleaved strictly 1 Square, 1 Vertical, 1 Square, 1 Vertical...
export const CURATED_TEMPLATES: CuratedTemplate[] = (() => {
  const result: CuratedTemplate[] = [];
  const max = Math.max(SQUARE_TEMPLATES.length, VERTICAL_TEMPLATES.length);
  for (let i = 0; i < max; i++) {
    if (i < SQUARE_TEMPLATES.length) result.push(SQUARE_TEMPLATES[i]);
    if (i < VERTICAL_TEMPLATES.length) result.push(VERTICAL_TEMPLATES[i]);
  }
  return result;
})();

const DEFAULT_CATEGORIES = [
  "All",
  "Halloween",
  "Holiday",
  "Thanksgiving",
  "Corporate",
  "Birthday",
  "Adult Birthday",
  "Bridal Shower",
  "Wedding"
];

/** Collapse any backend-provided casing/variant ("thanksgiving", "Thanksgiving / Autumn")
 *  onto the single canonical tab so duplicate pills never render. */
const normalizeCategory = (category?: string) => {
  if (!category) return category;
  return category.toLowerCase().includes("thanksgiving") ? "Thanksgiving" : category;
};

const getTemplateImageSrc = (template: CuratedTemplate) => {
  if (template.thumbnailUrl) return template.thumbnailUrl;
  if (template.imageUrl) return template.imageUrl;
  if (template.image) return template.image;
  const assetId = template.id.startsWith("tpl-") ? template.id.slice(4) : template.id;
  return `/assets/templates/${assetId}-mockup.svg`;
};

export default function Templates({ onSelectTemplate }: TemplatesProps = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [curatedList, setCuratedList] = useState<CuratedTemplate[]>(CURATED_TEMPLATES);
  const shouldReduceMotion = useReducedMotion();

  // Fetch all templates from backend while ensuring CURATED_TEMPLATES remain 100% preserved
  React.useEffect(() => {
    let isMounted = true;
    templateService.getTemplates()
      .then((tpls) => {
        if (!isMounted || !tpls || tpls.length === 0) return;
        const mapped: CuratedTemplate[] = tpls.map((t) => ({
          id: t.id,
          title: t.title || (t as any).name || "Invitation",
          name: (t as any).name || t.title || "Invitation",
          badge: t.badge || (t.isPremium ? "Premium" : "Free"),
          category: normalizeCategory(t.category || "General") || "General",
          tags: (t as any).tags || [],
          thumbnailUrl: t.thumbnailUrl || (t as any).fullThumbnailUrl || (t as any).imageUrl,
          imageUrl: t.imageUrl || (t as any).fullImageUrl,
          image: (t as any).image,
          accentColor: (t as any).accentColor,
          description: (t as any).description,
          canvasData: (t as any).canvasData,
        }));

        // Guarantee ALL baseline CURATED_TEMPLATES remain 100% preserved
        const mappedIds = new Set(mapped.map((t) => t.id));
        const combined = [...CURATED_TEMPLATES];
        mapped.forEach((m) => {
          if (!mappedIds.has(m.id)) {
            combined.push(m);
          }
        });

        setCuratedList(combined);
      })
      .catch((err) => {
        console.warn("[Templates] Could not fetch backend templates:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = React.useMemo(() => {
    const cats = new Set<string>(["All"]);
    DEFAULT_CATEGORIES.forEach((c) => cats.add(c));
    curatedList.forEach((t) => {
      if (t.category && !["Vintage / Classic"].includes(t.category)) {
        cats.add(normalizeCategory(t.category) || t.category);
      }
    });
    return Array.from(cats);
  }, [curatedList]);

  const filteredTemplates = React.useMemo(() => {
    const target = selectedCategory.trim().toLowerCase();

    // Exclude Citrus Splash and Garden Blooms from homepage default ("All") and non-Corporate tabs
    const visibleList = curatedList.filter((t) => {
      const isCorporateExclusive = t.id === "citrus-splash" || t.id === "garden-blooms";
      if (isCorporateExclusive && target !== "corporate") {
        return false;
      }
      return true;
    });

    let result: CuratedTemplate[];

    if (target === "all") {
      result = visibleList;
    } else {
      result = visibleList.filter((t) => {
        const cat = (t.category || "").toLowerCase();
        const rawTags = (t as any).tags || [];
        const tags = Array.isArray(rawTags) ? rawTags.map((tg: any) => String(tg).toLowerCase()) : [];
        const isCorporateExclusive = t.id === "citrus-splash" || t.id === "garden-blooms";

        if (target === "halloween" || target === "fall") {
          return (
            cat.includes("halloween") ||
            cat.includes("fall") ||
            cat.includes("vintage") ||
            t.id.includes("halloween") ||
            t.id.includes("pumpkin") ||
            t.id.includes("snoopy")
          );
        }

        if (target === "corporate") {
          return cat === "corporate" || cat.includes("corporate") || tags.includes("corporate") || isCorporateExclusive || t.id.includes("splatter") || t.id.includes("sketch");
        }
        if (target === "bridal shower") {
          return cat.includes("bridal") || cat.includes("shower");
        }
        if (target === "birthday" || target === "adult birthday") {
          return cat.includes("birthday") || cat.includes("bday");
        }
        if (target === "holiday") {
          return cat.includes("holiday") || t.id.includes("tannenbaum") || t.id.includes("foliage");
        }
        return cat.includes(target) || target.includes(cat) || tags.includes(target);
      });
    }

    // Interleave strictly: 1 square, 1 vertical, 1 square, 1 vertical so the layout never feels uneven
    const squares = result.filter(isSquareTemplate);
    const verticals = result.filter((t) => !isSquareTemplate(t));

    if (squares.length > 0 && verticals.length > 0) {
      const interleaved: CuratedTemplate[] = [];
      const maxLen = Math.max(squares.length, verticals.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < squares.length) interleaved.push(squares[i]);
        if (i < verticals.length) interleaved.push(verticals[i]);
      }
      return interleaved;
    }

    return result;
  }, [selectedCategory, curatedList]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCardClick = async (templateId: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(templateId);
      return;
    }
    const templateMeta =
      filteredTemplates.find((t) => t.id === templateId) ||
      CURATED_TEMPLATES.find((t) => t.id === templateId);
    try {
      const guestDraft = {
        type: "template",
        templateId,
        templateName: templateMeta?.title || "Event",
      };
      localStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
      sessionStorage.setItem("pending_template_id", templateId);
      localStorage.setItem("pending_template_id", templateId);
    } catch (e) {}

    // Signed-in hosts: create the draft event first so the canvas opens against a real event
    if (user) {
      try {
        const res = await eventService.createEvent({
          title: templateMeta?.title || "My Celebration",
          venue: "TBD Venue",
          eventDate: getDefaultEventDate(),
          eventTime: "18:00",
          eventType: templateMeta?.category || "Other",
          status: "draft",
          // Persist the exact selected template on the event so the canvas editor
          // never has to guess (or fall back to a previous/default template).
          templateId,
          selectedTemplateId: templateId,
          canvasState: templateMeta?.canvasData
            ? { templateId, activeTemplateId: templateId, ...templateMeta.canvasData }
            : undefined,
        });
        const eventId = res?.success ? res.event?.id : undefined;
        if (eventId) {
          router.push(
            `/studio?templateId=${encodeURIComponent(templateId)}&eventId=${encodeURIComponent(eventId)}`
          );
          return;
        }
      } catch (err) {
        console.warn("[Templates] Could not create event from template:", err);
      }
    }

    // Guests (or event-creation fallback): route directly to Canvas Editor
    router.push(`/editor?template=${encodeURIComponent(templateId)}`);
  };

  const handleAuthSuccess = () => {
    const tplId =
      pendingTemplateId ||
      (typeof window !== "undefined" ? sessionStorage.getItem("pending_template_id") : null);
    if (tplId) {
      router.push(`/dashboard/invitations?templateId=${encodeURIComponent(tplId)}&studio=true`);
    } else {
      router.push("/dashboard/invitations");
    }
  };

  return (
    <section
      id="templates"
      className="relative py-20 md:py-28 bg-transparent text-neutral-900 dark:text-neutral-100"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="text-[12px] tracking-[0.2em] uppercase text-orange-600 dark:text-orange-400 font-semibold font-sans">
            Curated Stationery Collection
          </span>
          <AnimatedHeading delay={0.1}>
            <h2
              className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-black dark:text-black tracking-tight mt-3"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Invitations your guests will love
            </h2>
          </AnimatedHeading>
          <p className="mt-3.5 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
            Every invitation is crafted with pure vector styling and typography — crisp, responsive, and fully customizable.
          </p>
        </motion.div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const isHalloween = cat === "Halloween";
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium font-sans transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? isHalloween
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20"
                      : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800"
                }`}
              >
                {isHalloween && <span>🎃</span>}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* 3-Column Responsive Grid on Desktop */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-start"
        >
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template) => {
              const isFav = favorites.has(template.id);
              const isPremium = template.badge?.toLowerCase() === "premium" || !!template.isPremium;
              const imgSrc = getTemplateImageSrc(template);
              const isSquareCard = isSquareTemplate(template);

              return (
                <motion.div
                  layout
                  key={template.id}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative flex flex-col select-none"
                >
                  {/* Subtle dynamic ambient glow matching accentColor */}
                  <div
                    className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-tr ${
                      template.accentColor || (isPremium ? "from-amber-500/25 to-violet-600/30" : "from-orange-500/20 to-yellow-600/20")
                    } opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 -z-10`}
                  />

                  {/* Outer Card Item Preview Container */}
                  <div
                    onClick={() => handleCardClick(template.id)}
                    className={`relative w-full ${
                      isSquareCard ? "aspect-[4/3]" : "aspect-[3/4]"
                    } rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300 group/card border border-neutral-200/90 dark:border-neutral-800 bg-[#FAF8F5] dark:bg-neutral-900`}
                  >
                    {/* Render Image / Mockup with smooth hover scale */}
                    <img
                      src={imgSrc}
                      alt={template.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105 select-none pointer-events-none"
                      loading="lazy"
                      onError={(e) => {
                        if (!template.thumbnailUrl && !template.imageUrl && !template.image) {
                          const assetId = template.id.startsWith("tpl-") ? template.id.slice(4) : template.id;
                          e.currentTarget.src = `/assets/templates/${assetId}-bg.svg`;
                        }
                      }}
                    />

                    {/* Top Header Overlay: Badges and Favorite Heart */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20 pointer-events-none">
                      {/* Premium / Free Badge */}
                      {isPremium ? (
                        <div className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-violet-600 text-white shadow-sm font-semibold text-xs tracking-tight">
                          <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                          </svg>
                          <span>Premium</span>
                        </div>
                      ) : (
                        <div className="pointer-events-auto flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md text-xs font-semibold text-neutral-800 dark:text-neutral-200 border border-white/60 dark:border-neutral-700/60 shadow-xs">
                          <span>Free</span>
                        </div>
                      )}

                      {/* Top-right Favorite Heart Button with Interactive Toggle & Scale */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(template.id);
                        }}
                        className="pointer-events-auto w-8 h-8 rounded-full bg-white/85 dark:bg-neutral-900/85 hover:bg-white dark:hover:bg-neutral-800 backdrop-blur-md flex items-center justify-center shadow-xs border border-white/60 dark:border-neutral-700/60 transition-all duration-200 active:scale-90 hover:scale-105 group-hover:opacity-100 cursor-pointer focus:outline-none"
                        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors duration-200 ${
                            isFav
                              ? "fill-rose-500 text-rose-500 scale-105"
                              : "stroke-[2] text-neutral-500 dark:text-neutral-400 hover:text-rose-500"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Quick Customize Template overlay sliding up from bottom */}
                    <div className="absolute inset-x-0 bottom-0 p-4 z-20 flex justify-center pointer-events-none bg-gradient-to-t from-black/60 via-black/25 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(template.id);
                        }}
                        className="pointer-events-auto transform translate-y-3 group-hover/card:translate-y-0 transition-all duration-300 bg-white/95 dark:bg-neutral-900/95 hover:bg-white dark:hover:bg-black text-neutral-900 dark:text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer flex items-center gap-1.5 backdrop-blur-md border border-white/40 dark:border-neutral-700 font-sans tracking-wide"
                      >
                        <span>Customize Template</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Typography: Crisp Title & Category / Subtitle */}
                  <div className="mt-3.5 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        onClick={() => handleCardClick(template.id)}
                        className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors truncate"
                      >
                        {template.title}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-0.5">
                      {template.category}
                    </p>
                    {template.description && (
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans mt-1 line-clamp-1 leading-relaxed">
                        {template.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </section>
  );
}
