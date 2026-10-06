"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, Crown, ArrowRight, Sparkles } from "lucide-react";
import { homeTemplatesData, HomeTemplateItem } from "@/lib/homeTemplatesData";

export default function HomeTemplatesGallery() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleSelectTemplate = (template: HomeTemplateItem) => {
    try {
      localStorage.setItem("pending_template_id", template.id);
      sessionStorage.setItem("pending_template_id", template.id);
      const guestDraft = {
        type: "template",
        templateId: template.id,
        templateName: template.title || template.name,
      };
      localStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
      sessionStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
    } catch (e) {
      console.warn("Storage write error:", e);
    }

    router.push(`/editor?templateId=${encodeURIComponent(template.id)}&tier=premium`);
  };

  return (
    <section
      id="templates-gallery"
      className="relative py-16 sm:py-24 bg-transparent text-neutral-900 dark:text-neutral-100 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold tracking-wide uppercase mb-3">
            <Crown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 fill-purple-600/20" />
            <span>Premium Designer Suites</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-serif text-neutral-900 dark:text-neutral-50 tracking-tight"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            Templates Gallery
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
            Exclusive luxury stationery with handcrafted envelope liners, textured backdrop surfaces, and editable typography.
          </p>
        </div>

        {/* 3x3 Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {homeTemplatesData.map((template) => {
            const isFav = favorites.has(template.id);
            const mockupSrc = template.mockupUrl || `/assets/templates/${template.id}-mockup.svg`;

            return (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="group flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1.5 focus:outline-none"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectTemplate(template);
                  }
                }}
              >
                {/* Envelope Layering Visual Container */}
                <div className="relative aspect-[800/533] w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-md group-hover:shadow-2xl group-hover:shadow-black/15 transition-all duration-300">
                  {/* Composite Visual Layer (Underlay Envelope + Floating Invitation Card + Backdrop Matte) */}
                  <img
                    src={mockupSrc}
                    alt={`${template.title} Invitation Preview`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />

                  {/* Top-Left: Premium Crown Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-neutral-950/80 backdrop-blur-md border border-white/60 dark:border-neutral-700/60 shadow-xs text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
                      <Crown className="w-3 h-3 text-purple-600 dark:text-purple-400 fill-purple-600/30" />
                      <span>Premium</span>
                    </div>
                  </div>

                  {/* Top-Right: Heart Favorite Toggle */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(template.id, e)}
                      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                      className="w-8 h-8 rounded-full bg-white/85 dark:bg-neutral-950/70 backdrop-blur-md border border-white/60 dark:border-neutral-700/60 flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFav
                            ? "fill-rose-500 text-rose-500"
                            : "text-neutral-600 dark:text-neutral-300 hover:text-rose-500"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Hover Overlay with Customize Action */}
                  <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <div className="px-4 py-2 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg border border-white/40 text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <span>Customize</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Template Info (Title & Category) */}
                <div className="mt-3.5 px-0.5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {template.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {template.category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
