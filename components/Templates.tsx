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
  badge?: "Trending" | "Popular" | "Featured";
  category: string;
}

export const CURATED_TEMPLATES: CuratedTemplate[] = [
  {
    id: "tpl-hibiscus-blooms",
    title: "Hibiscus Blooms",
    badge: "Trending",
    category: "Bridal Shower",
    designer: "Tropical Atelier",
  },
  {
    id: "tpl-chicory-whispers",
    title: "Chicory Whispers",
    badge: "Popular",
    category: "Bridal Shower",
    designer: "Botanical Press",
  },
  {
    id: "tpl-lovely-blossoms",
    title: "Lovely Blossoms",
    badge: "Trending",
    category: "Bridal Shower",
    designer: "Blush & Petals",
  },
  {
    id: "tpl-elegant-lace",
    title: "Elegant Lace",
    badge: "Featured",
    category: "Bridal Shower",
    designer: "Maison Dentelle",
  },
  {
    id: "tpl-painted-petals",
    title: "Painted Petals",
    badge: "Trending",
    category: "Bridal Shower",
    designer: "Atelier Bleu",
  },
  {
    id: "tpl-floral-elegance",
    title: "Floral Elegance",
    badge: "Popular",
    category: "Bridal Shower",
    designer: "Garden Guild",
  },
  {
    id: "tpl-floral-arch",
    title: "Floral Arch",
    badge: "Trending",
    category: "Bridal Shower",
    designer: "Flora Studio",
  },
  {
    id: "tpl-limoncello",
    title: "Little Limoncello",
    badge: "Featured",
    category: "Bridal Shower",
    designer: "Amalfi Coast",
  },
  {
    id: "tpl-pumpkin-petals",
    title: "Pumpkin & Petals",
    badge: "Trending",
    category: "Bridal Shower",
    designer: "Autumn Harvest",
  },
  {
    id: "tpl-wedding-elegance",
    title: "Eternal Botanical Garland",
    badge: "Featured",
    category: "Wedding",
    designer: "Haute Wedding",
  },
  {
    id: "tpl-corporate-summit",
    title: "Global Innovation Summit 2026",
    badge: "Trending",
    category: "Corporate",
    designer: "Enterprise Lab",
  },
  {
    id: "tpl-networking-founders",
    title: "Founders & Tech Connect",
    badge: "Popular",
    category: "Corporate",
    designer: "Silicon Mixer",
  },
  {
    id: "tpl-charity-gala",
    title: "Black Tie Charity Gala",
    badge: "Trending",
    category: "Dinner & Gala",
    designer: "Grand Ballroom",
  },
  {
    id: "tpl-dinner-sunset-soiree",
    title: "Sunset Garden Soirée",
    badge: "Popular",
    category: "Dinner & Gala",
    designer: "Chef's Table",
  },
  {
    id: "tpl-golden-milestone",
    title: "Golden Milestone",
    badge: "Trending",
    category: "Birthday",
    designer: "Evite Couture",
  },
  {
    id: "tpl-modern-minimalist-arch",
    title: "Modern Minimalist Arch",
    badge: "Popular",
    category: "Birthday",
    designer: "Studio Minimal",
  },
  {
    id: "tpl-classic-french-dinner",
    title: "Classic French Dinner",
    badge: "Trending",
    category: "Birthday",
    designer: "Atelier Paris",
  },
  {
    id: "tpl-retro-70s-sunset",
    title: "Retro 70s Sunset",
    badge: "Trending",
    category: "Birthday",
    designer: "Vintage Groovy",
  },
  {
    id: "tpl-midnight-lounge",
    title: "Midnight Lounge",
    badge: "Trending",
    category: "Birthday",
    designer: "Velvet Speakeasy",
  },
  {
    id: "tpl-emerald-soiree",
    title: "Emerald Soirée",
    badge: "Trending",
    category: "Birthday",
    designer: "Conservatory Guild",
  },
  {
    id: "tpl-champagne-brunch",
    title: "Champagne Brunch",
    badge: "Trending",
    category: "Birthday",
    designer: "Villa Garden",
  },
  {
    id: "tpl-noir-tuxedo",
    title: "Noir Tuxedo",
    badge: "Trending",
    category: "Birthday",
    designer: "Black Tie Club",
  },
  {
    id: "tpl-rustic-espresso",
    title: "Rustic Espresso",
    badge: "Trending",
    category: "Birthday",
    designer: "Timber Lodge",
  },
  {
    id: "tpl-lavender-twilight",
    title: "Lavender Twilight",
    badge: "Trending",
    category: "Birthday",
    designer: "Sonoma Twilight",
  },
];

const CATEGORIES = ["All", "Bridal Shower", "Wedding", "Birthday", "Corporate", "Dinner & Gala"];

export default function Templates() {
  const { user } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const filteredTemplates = React.useMemo(() => {
    if (selectedCategory === "All") return CURATED_TEMPLATES;
    return CURATED_TEMPLATES.filter((t) => t.category === selectedCategory);
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
    if (!user) {
      try {
        localStorage.setItem("pending_template_id", templateId);
        sessionStorage.setItem("pending_template_id", templateId);
      } catch (e) {}
      setPendingTemplateId(templateId);
      setIsAuthModalOpen(true);
      return;
    }
    router.push(`/dashboard/invitations?templateId=${encodeURIComponent(templateId)}&studio=true`);
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
      className="relative py-20 md:py-28 bg-[#faf9f6] text-neutral-900 border-t border-neutral-200/50"
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
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-neutral-900 tracking-tight mt-3" style={{ fontFamily: "Georgia, serif" }}>
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

        {/* 3-Column Card Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template) => {
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
                  {/* Top Badge Header */}
                  <div className="h-7 mb-2 flex items-center">
                    {template.badge && (
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#f5f1e8] text-[#524c44] tracking-wide shadow-2xs">
                        {template.badge}
                      </span>
                    )}
                  </div>

                  {/* Pure CSS Stationery Visual Area (Envelope + Liner Behind + Card in Front) */}
                  <div
                    onClick={() => handleCardClick(template.id)}
                    className="relative w-full cursor-pointer group-hover:-translate-y-1 transition-transform duration-300"
                  >
                    <EviteCardPreview
                      template={tplConfig || template}
                      hoverScale={true}
                    />

                    {/* Hover Pill "Customize" Button */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/0 group-hover:bg-black/10 transition-colors duration-200">
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

                  {/* Card Metadata Below Visual Area */}
                  <div className="mt-4 text-center flex flex-col items-center">
                    <h3
                      onClick={() => handleCardClick(template.id)}
                      className="text-neutral-900 text-base font-sans font-medium hover:text-black cursor-pointer transition-colors"
                    >
                      {template.title}
                    </h3>

                    {template.designer && (
                      <p className="text-xs text-neutral-500 font-sans mt-0.5">
                        {template.designer}
                      </p>
                    )}

                    {/* Minimalist Centered Favorite Heart Icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(template.id);
                      }}
                      className="mt-2.5 p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer focus:outline-none"
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
