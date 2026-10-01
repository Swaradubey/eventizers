"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import templateService from "@/services/templateService";

export interface CuratedTemplate {
  id: string;
  title: string;
  designer?: string;
  badge?: "Trending" | "Popular" | "Featured" | "Free" | "Premium" | string;
  category: string;
}

export interface TemplatesProps {
  onSelectTemplate?: (templateId: string) => void;
}

// All 16 Templates (The 3 new premium templates + the 13 existing templates)
export const CURATED_TEMPLATES: CuratedTemplate[] = [
  {
    id: "o-tannenbaum",
    title: "O Tannenbaum",
    badge: "Premium",
    category: "Holiday",
  },
  {
    id: "metallic-paint-splatter",
    title: "Metallic Paint Splatter",
    badge: "Premium",
    category: "Corporate",
  },
  {
    id: "golden-foliage-holiday",
    title: "Golden Foliage Holiday",
    badge: "Premium",
    category: "Holiday",
  },
  {
    id: "botanical-sketch-art",
    title: "Botanical Sketch (Art)",
    badge: "Premium",
    category: "Workshop",
  },
  {
    id: "tpl-chic-dinner-cake",
    title: "Chic Dinner & Cake Celebration",
    badge: "Premium",
    category: "Adult Birthday",
  },
  {
    id: "tpl-modern-gold-black-balloon",
    title: "Modern Gold & Black Balloon Bash",
    badge: "Premium",
    category: "Adult Birthday",
  },
  {
    id: "tpl-gold-ribbons-confetti",
    title: "Gold Ribbons & Confetti",
    badge: "Free",
    category: "Birthday",
  },
  {
    id: "tpl-sparkle-balloons",
    title: "Sparkle Balloons",
    badge: "Free",
    category: "Birthday",
  },
  {
    id: "tpl-celestial-flora",
    title: "Celestial Flora",
    badge: "Free",
    category: "Birthday",
  },
  {
    id: "tpl-abstract-nature-party",
    title: "Abstract Nature Party",
    badge: "Free",
    category: "Wedding",
  },
  {
    id: "tpl-bright-blooms-garden",
    title: "Bright Blooms Garden",
    badge: "Free",
    category: "Wedding",
  },
  {
    id: "tpl-vibrant-blooms-wedding",
    title: "Vibrant Blooms Wedding",
    badge: "Free",
    category: "Wedding",
  },
  {
    id: "tpl-lily-of-the-valley",
    title: "Lily of the Valley",
    badge: "Free",
    category: "Wedding",
  },
  {
    id: "blush-burgundy-blooms",
    title: "Blush & Burgundy Blooms",
    badge: "Premium",
    category: "Bridal Shower",
  },
  {
    id: "something-blue",
    title: "Something Blue",
    badge: "Premium",
    category: "Bridal Shower",
  },
  {
    id: "autumn-blooms",
    title: "Autumn Blooms",
    badge: "Premium",
    category: "Bridal Shower",
  },
];

const DEFAULT_CATEGORIES = ["All", "Holiday", "Corporate", "Birthday", "Adult Birthday", "Bridal Shower", "Wedding"];

const getTemplateImageSrc = (id: string) => {
  const mockupList = [
    "o-tannenbaum",
    "metallic-paint-splatter",
    "golden-foliage-holiday",
    "botanical-sketch-art",
    "tpl-chic-dinner-cake",
    "tpl-modern-gold-black-balloon",
    "blush-burgundy-blooms",
    "something-blue",
    "autumn-blooms",
  ];
  const assetId = id.startsWith("tpl-") ? id.slice(4) : id;
  if (mockupList.includes(id)) {
    return `/assets/templates/${assetId}-mockup.svg`;
  }
  return `/assets/templates/${assetId}-bg.svg`;
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

  // Fetch all templates from backend
  React.useEffect(() => {
    let isMounted = true;
    templateService.getTemplates()
      .then((tpls) => {
        if (!isMounted || !tpls || tpls.length === 0) return;
        const mapped: CuratedTemplate[] = tpls.map((t) => ({
          id: t.id,
          title: t.title || (t as any).name || "Invitation",
          badge: t.badge || (t.isPremium ? "Premium" : "Free"),
          category: t.category || "General",
        }));
        setCuratedList(mapped);
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
    curatedList.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    DEFAULT_CATEGORIES.forEach((c) => cats.add(c));
    return Array.from(cats);
  }, [curatedList]);

  const filteredTemplates = React.useMemo(() => {
    if (selectedCategory === "All") return curatedList;
    const target = selectedCategory.toLowerCase();
    const filtered = curatedList.filter((t) => {
      const cat = (t.category || "").toLowerCase();
      if (target === "bridal shower") {
        return cat.includes("bridal") || cat.includes("shower");
      }
      if (target === "birthday" || target === "adult birthday") {
        return cat.includes("birthday") || cat.includes("bday");
      }
      if (target === "holiday") {
        return cat.includes("holiday") || t.id.includes("tannenbaum") || t.id.includes("foliage");
      }
      if (target === "corporate") {
        return cat.includes("corporate") || t.id.includes("splatter") || t.id.includes("sketch");
      }
      return cat.includes(target) || target.includes(cat);
    });
    return filtered.length > 0 ? filtered : curatedList;
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

  const handleCardClick = (templateId: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(templateId);
      return;
    }
    try {
      const guestDraft = {
        type: "template",
        templateId,
        templateName:
          (filteredTemplates.find((t) => t.id === templateId) ||
            CURATED_TEMPLATES.find((t) => t.id === templateId))?.title || "Event",
      };
      localStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
      sessionStorage.setItem("pending_template_id", templateId);
      localStorage.setItem("pending_template_id", templateId);
    } catch (e) {}
    router.push(`/canvas?guest=true&templateId=${encodeURIComponent(templateId)}`);
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
      className="relative py-20 md:py-28 bg-transparent text-neutral-900 border-t border-slate-200/40"
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
          <span className="text-[12px] tracking-[0.2em] uppercase text-neutral-500 font-medium font-sans">
            Curated Stationery Collection
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-neutral-900 tracking-tight mt-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Invitations your guests will love
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-neutral-600 font-sans leading-relaxed">
            Every invitation is crafted with pure vector styling and typography — crisp, responsive, and fully customizable.
          </p>
        </motion.div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium font-sans transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/80"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Responsive Grid for all templates */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-start"
        >
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template) => {
              const isFav = favorites.has(template.id);
              const isPremium = template.badge?.toLowerCase() === "premium";
              const imgSrc = getTemplateImageSrc(template.id);

              return (
                <motion.div
                  layout
                  key={template.id}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex flex-col select-none"
                >
                  {/* Outer Card Item Preview Container */}
                  <div
                    onClick={() => handleCardClick(template.id)}
                    className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 group/card border border-neutral-200/70 bg-[#FAF8F5]"
                  >
                    {/* Render Image / Mockup */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgSrc}
                      alt={template.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-[1.03] select-none pointer-events-none"
                      loading="lazy"
                    />

                    {/* Top Header Overlay: Badge on left, Heart on right */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                      {/* Premium / Free Badge */}
                      <div className={`pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md backdrop-blur-xs shadow-2xs border ${
                        isPremium 
                          ? "bg-white/95 border-purple-100/50 text-[#581C87]"
                          : "bg-white/95 border-neutral-200/60 text-neutral-800"
                      }`}>
                        {isPremium && (
                          <svg className="w-3.5 h-3.5 fill-[#581C87] text-[#581C87]" viewBox="0 0 24 24">
                            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                          </svg>
                        )}
                        <span className="text-[11px] font-semibold tracking-tight">
                          {template.badge || (isPremium ? "Premium" : "Free")}
                        </span>
                      </div>

                      {/* Favorite Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(template.id);
                        }}
                        className="pointer-events-auto w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-xs flex items-center justify-center shadow-2xs hover:shadow-xs transition-all cursor-pointer focus:outline-none"
                        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform duration-200 hover:scale-110 ${
                            isFav
                              ? "fill-rose-500 text-rose-500 scale-105"
                              : "stroke-[1.8] text-neutral-400 hover:text-neutral-600"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Hover Action Pill: "Customize" */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/0 group-hover/card:bg-black/15 transition-colors duration-200">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(template.id);
                        }}
                        className="pointer-events-auto bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-6 py-2.5 rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-200 shadow-lg hover:scale-105 cursor-pointer font-sans tracking-wide"
                      >
                        Customize
                      </button>
                    </div>
                  </div>

                  {/* Title Text Below Card */}
                  <div className="mt-3.5 text-left">
                    <h3
                      onClick={() => handleCardClick(template.id)}
                      className="text-neutral-900 text-[15px] sm:text-base font-sans font-medium hover:text-black cursor-pointer transition-colors"
                    >
                      {template.title}
                    </h3>
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
