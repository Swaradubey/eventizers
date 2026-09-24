"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import EviteCardPreview from "./designer/EviteCardPreview";
import { getTemplateConfig } from "@/lib/newTemplatesData";

export interface CuratedTemplate {
  id: string;
  title: string;
  designer?: string;
  badge?: "Trending" | "Popular" | "Featured" | "Free" | "PREMIUM" | string;
  category: string;
  tags?: string[];
}

export const CURATED_TEMPLATES: CuratedTemplate[] = [
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
    id: "blush-burgundy-blooms",
    title: "Blush & Burgundy Blooms",
    badge: "PREMIUM",
    category: "Wedding",
    tags: ["bridal_shower", "bridal"],
  },
  {
    id: "something-blue",
    title: "Something Blue",
    badge: "PREMIUM",
    category: "Wedding",
    tags: ["bridal_shower", "bridal"],
  },
  {
    id: "autumn-blooms",
    title: "Autumn Blooms",
    badge: "PREMIUM",
    category: "Wedding",
    tags: ["bridal_shower", "bridal"],
  },
];

const CATEGORIES = ["All", "Bridal Shower", "Wedding", "Birthday"];

export default function Templates() {
  const { user } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const filteredTemplates = React.useMemo(() => {
    const base = CURATED_TEMPLATES;
    if (selectedCategory === "All") return base;
    const target = selectedCategory.toLowerCase();
    return base.filter((t) => {
      const cat = (t.category || "").toLowerCase();
      const tags = (t.tags || []);
      if (target === "bridal shower") {
        return (
          cat.includes("bridal") ||
          cat.includes("shower") ||
          tags.some((tag: string) => tag.includes("bridal"))
        );
      }
      return cat === target || cat.includes(target);
    });
  }, [selectedCategory]);

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
    try {
      const guestDraft = {
        type: "template",
        templateId,
        templateName: filteredTemplates.find((t) => t.id === templateId)?.title || "Event",
      };
      localStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
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
        {/* Paperless Post / Evite Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="text-[12px] tracking-[0.2em] uppercase text-neutral-500 font-medium font-sans">
            Stationery & Botanical Collection
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
          {CATEGORIES.map((cat) => {
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

        {/* 2-3 Column Card Grid matching Evite gallery cards */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {filteredTemplates.slice(0, 10).map((template) => {
              const isFav = favorites.has(template.id);
              const tplConfig = getTemplateConfig(template.id);

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
                  {/* Outer Card Display Container matching Evite screenshot */}
                  <div
                    onClick={() => handleCardClick(template.id)}
                    className="relative w-full bg-[#f3f4f6]/80 hover:bg-[#eceff3] rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[360px] shadow-xs hover:shadow-md"
                  >
                    {/* Top Header: Free/Premium badge on left, Heart button on right */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                      <span className={`pointer-events-auto text-[11px] px-2.5 py-1 rounded-md shadow-2xs flex items-center gap-1 ${
                        template.badge?.toLowerCase() === "premium"
                          ? "bg-[#FAF5EE] text-[#6B2D38] border border-[#E8DCCB] font-semibold"
                          : "bg-white/95 text-neutral-800 font-medium"
                      }`}>
                        {template.badge?.toLowerCase() === "premium" && <span>👑</span>}
                        <span>{template.badge || "Free"}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(template.id);
                        }}
                        className="pointer-events-auto p-1.5 rounded-full hover:bg-white/80 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer focus:outline-none"
                        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform duration-200 hover:scale-115 ${
                            isFav
                              ? "fill-rose-500 text-rose-500 scale-110"
                              : "stroke-[1.6] text-neutral-400"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Centered Invitation Card Preview */}
                    <div className="w-full max-w-[230px] mx-auto py-2 group-hover:scale-[1.02] transition-transform duration-300 drop-shadow-md">
                      <EviteCardPreview
                        template={tplConfig || template}
                        hoverScale={false}
                        cardOnly={
                          template.category !== "Bridal Shower" &&
                          template.category !== "bridal_shower" &&
                          !(template.tags || []).some((tag: string) => tag.includes("bridal"))
                        }
                      />
                    </div>

                    {/* Hover Pill "Customize" Button */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-2xl">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(template.id);
                        }}
                        className="pointer-events-auto bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-105 cursor-pointer font-sans"
                      >
                        Customize
                      </button>
                    </div>
                  </div>

                  {/* Template Title Below Card */}
                  <div className="mt-3.5 text-left">
                    <h3
                      onClick={() => handleCardClick(template.id)}
                      className="text-neutral-900 text-base font-sans font-medium hover:text-black cursor-pointer transition-colors"
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
