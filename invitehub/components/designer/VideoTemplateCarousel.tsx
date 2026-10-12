"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clapperboard, Sparkles } from "lucide-react";
import { VideoTemplate, VIDEO_TEMPLATES_CATALOG } from "@/data/videoTemplates";
import VideoTemplateCard from "./VideoTemplateCard";

interface VideoTemplateCarouselProps {
  selectedTemplateId: string;
  onSelectTemplate: (template: VideoTemplate) => void;
  className?: string;
}

export default function VideoTemplateCarousel({
  selectedTemplateId,
  onSelectTemplate,
  className = "",
}: VideoTemplateCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const categories = [
    "All",
    "Fun & Kids",
    "Dance & Party",
    "Milestones & Luxury",
    "Hip-Hop & Stage",
    "Fantasy & Royalty",
    "Cocktails & Chic",
    "Weddings",
  ];

  const filteredTemplates =
    selectedCategory === "All"
      ? VIDEO_TEMPLATES_CATALOG
      : VIDEO_TEMPLATES_CATALOG.filter((t) =>
          t.category.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScrollability();
  }, [filteredTemplates]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -380 : 380;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {/* Category Pills & Scroll Navigation Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-[80%] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-white/[0.05] text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Arrow Navigation */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous templates"
            className="size-8 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/5 text-white flex items-center justify-center border border-white/10 transition cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Next templates"
            className="size-8 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/5 text-white flex items-center justify-center border border-white/10 transition cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div className="relative group/track w-full">
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 px-1 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-amber-500/40 hover:[&::-webkit-scrollbar-thumb]:bg-amber-500/80 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplateId === template.id;
            return (
              <div key={template.id} className="snap-start shrink-0">
                <VideoTemplateCard
                  template={template}
                  isSelected={isSelected}
                  onSelect={onSelectTemplate}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
