"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

export interface CuratedTemplate {
  id: string;
  title: string;
  designer?: string;
  badge?: "Trending";
  category: string;
  image: string;
  isLandscape?: boolean;
  envelopeColor: string;
  linerType: "electric-gradient" | "gold-foil" | "pink-glitter" | "sprinkles" | "charms" | "sports";
  swatches?: { id: string; style: string; label: string }[];
}

export const CURATED_TEMPLATES: CuratedTemplate[] = [
  // 1. Electric Outline
  {
    id: "tpl-electric-outline",
    title: "Electric Outline",
    badge: "Trending",
    category: "Birthday",
    image: "/assets/templates/electric-outline.svg",
    isLandscape: false,
    envelopeColor: "#FACC15",
    linerType: "electric-gradient",
    swatches: [
      { id: "s1", style: "bg-[#FEF08A] ring-2 ring-black ring-inset", label: "Yellow" },
      { id: "s2", style: "bg-[conic-gradient(at_center,#EF4444,#F59E0B,#10B981,#06B6D4,#8B5CF6,#EF4444)]", label: "Rainbow" },
      { id: "s3", style: "bg-[#F472B6]", label: "Pink" },
    ],
  },
  // 2. Cake and Confetti (Rifle Paper Co.)
  {
    id: "tpl-cake-and-confetti",
    title: "Cake and Confetti",
    designer: "Rifle Paper Co.",
    badge: "Trending",
    category: "Birthday",
    image: "/assets/templates/cake-and-confetti.svg",
    isLandscape: false,
    envelopeColor: "#FFFFFF",
    linerType: "gold-foil",
  },
  // 3. Hype Night
  {
    id: "tpl-hype-night",
    title: "Hype Night",
    badge: "Trending",
    category: "Birthday",
    image: "/assets/templates/hype-night.svg",
    isLandscape: true,
    envelopeColor: "#F9C5D5",
    linerType: "pink-glitter",
    swatches: [
      { id: "s1", style: "bg-gradient-to-r from-[#9333EA] from-50% to-[#EC4899] to-50%", label: "Purple/Pink" },
      { id: "s2", style: "bg-[#15803D]", label: "Green" },
      { id: "s3", style: "bg-[conic-gradient(at_center,#EF4444,#F59E0B,#10B981,#06B6D4,#8B5CF6,#EF4444)]", label: "Rainbow" },
    ],
  },
  // 4. Floating Cakes (Little Cube)
  {
    id: "tpl-floating-cakes",
    title: "Floating Cakes",
    designer: "Little Cube",
    category: "Birthday",
    image: "/assets/templates/floating-cakes.svg",
    isLandscape: false,
    envelopeColor: "#F5CAD5",
    linerType: "sprinkles",
  },
  // 5. Friendship Charms (Meri Meri)
  {
    id: "tpl-friendship-charms",
    title: "Friendship Charms",
    designer: "Meri Meri",
    category: "Birthday",
    image: "/assets/templates/friendship-charms.svg",
    isLandscape: false,
    envelopeColor: "#F7BABA",
    linerType: "charms",
  },
  // 6. Sporty Frame (Meri Meri)
  {
    id: "tpl-sporty-frame",
    title: "Sporty Frame",
    designer: "Meri Meri",
    category: "Birthday",
    image: "/assets/templates/sporty-frame.svg",
    isLandscape: false,
    envelopeColor: "#0C9744",
    linerType: "sports",
  },
];

/**
 * Open Envelope Component with triangular flap pointing UP and distinctive decorative liner
 */
function OpenEnvelope({
  envelopeColor,
  linerType,
  isLandscape,
}: {
  envelopeColor: string;
  linerType: CuratedTemplate["linerType"];
  isLandscape?: boolean;
}) {
  return (
    <div
      className={`absolute transition-transform duration-300 pointer-events-none select-none ${
        isLandscape
          ? "right-2 sm:right-6 top-1 w-[82%] sm:w-[84%] aspect-[1.15/1]"
          : "right-1 sm:right-4 top-2 w-[74%] sm:w-[78%] aspect-[0.95/1]"
      }`}
    >
      <svg
        viewBox="0 0 400 420"
        className="w-full h-full drop-shadow-[0_8px_18px_rgba(0,0,0,0.12)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 1. Electric Lime-to-Cyan Gradient Liner */}
          <linearGradient id="liner-electric" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4FF00" />
            <stop offset="45%" stopColor="#84CC16" />
            <stop offset="85%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* 2. Shimmering Gold Foil Metallic Liner */}
          <radialGradient id="liner-gold" cx="40%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="25%" stopColor="#E5C158" />
            <stop offset="60%" stopColor="#B3862A" />
            <stop offset="100%" stopColor="#785514" />
          </radialGradient>

          {/* 3. Magenta Sparkling Glitter Texture Liner */}
          <radialGradient id="liner-glitter-base" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FF77B8" />
            <stop offset="45%" stopColor="#D92080" />
            <stop offset="85%" stopColor="#880E4F" />
          </radialGradient>
          <pattern id="liner-glitter" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="url(#liner-glitter-base)" />
            <circle cx="4" cy="4" r="1.2" fill="#FFFFFF" opacity="0.9" />
            <circle cx="14" cy="6" r="1.5" fill="#FFE4F1" opacity="0.8" />
            <circle cx="9" cy="14" r="1.3" fill="#FFFFFF" opacity="0.95" />
            <circle cx="17" cy="16" r="1" fill="#FFB6D9" opacity="0.8" />
            <polygon points="10,2 11,4 13,4 11.5,5 12,7 10,5.5 8,7 8.5,5 7,4 9,4" fill="#FFFFFF" opacity="0.85" transform="scale(0.6) translate(8, 8)" />
          </pattern>

          {/* 4. Pastel Sprinkles / Confetti Liner */}
          <pattern id="liner-sprinkles" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <rect width="36" height="36" fill="#FFFDF8" />
            <circle cx="8" cy="10" r="1.8" fill="#F472B6" />
            <circle cx="26" cy="8" r="1.6" fill="#38BDF8" />
            <circle cx="16" cy="24" r="1.8" fill="#FBBF24" />
            <circle cx="30" cy="28" r="1.5" fill="#34D399" />
            <circle cx="6" cy="30" r="1.4" fill="#A78BFA" />
            <rect x="20" y="14" width="4" height="1.8" rx="0.9" transform="rotate(30, 20, 14)" fill="#FB7185" />
            <rect x="10" y="4" width="4" height="1.8" rx="0.9" transform="rotate(-40, 10, 4)" fill="#FBBF24" />
          </pattern>

          {/* 5. Cute Charms & Icons Pattern Liner */}
          <pattern id="liner-charms" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
            <rect width="44" height="44" fill="#FAF7F2" />
            {/* Tiny smiley */}
            <circle cx="12" cy="12" r="4.5" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" />
            {/* Tiny star */}
            <polygon points="32,8 33,11 36,11 34,13 35,16 32,14 29,16 30,13 28,11 31,11" fill="#F87171" />
            {/* Tiny flower */}
            <circle cx="14" cy="32" r="2.5" fill="#F472B6" />
            <circle cx="14" cy="32" r="1" fill="#FEF08A" />
            {/* Tiny mushroom */}
            <path d="M 30 32 C 30 28 36 28 36 32 Z" fill="#EF4444" />
            <rect x="32" y="32" width="2" height="3" fill="#FFF" />
          </pattern>

          {/* 6. Sports Pattern Liner */}
          <pattern id="liner-sports" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <rect width="48" height="48" fill="#0F172A" />
            {/* Soccer ball */}
            <circle cx="12" cy="12" r="5" fill="#FFF" stroke="#64748B" strokeWidth="0.8" />
            <polygon points="12,10 14,11 13,13 11,13 10,11" fill="#1E293B" />
            {/* Basketball */}
            <circle cx="36" cy="14" r="5.5" fill="#EA580C" stroke="#9A3412" strokeWidth="0.8" />
            <line x1="31" y1="14" x2="41" y2="14" stroke="#1E293B" strokeWidth="0.8" />
            {/* Football */}
            <path d="M 10 32 C 10 27 22 27 22 32 C 22 37 10 37 10 32 Z" fill="#92400E" transform="rotate(-30, 16, 32)" />
            {/* Baseball */}
            <circle cx="36" cy="36" r="4.5" fill="#FFF" stroke="#64748B" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* Envelope Body (Back pocket wall) */}
        <rect
          x="20"
          y="130"
          width="360"
          height="280"
          rx="10"
          fill={envelopeColor}
          stroke={envelopeColor === "#FFFFFF" ? "#E2E8F0" : "rgba(0,0,0,0.06)"}
          strokeWidth="1.5"
        />

        {/* Interior Liner Fill on the Open Triangular Flap & Inside Back Wall */}
        <path
          d="M 38 135 L 200 15 L 362 135 L 362 395 L 38 395 Z"
          fill={
            linerType === "electric-gradient"
              ? "url(#liner-electric)"
              : linerType === "gold-foil"
              ? "url(#liner-gold)"
              : linerType === "pink-glitter"
              ? "url(#liner-glitter)"
              : linerType === "sprinkles"
              ? "url(#liner-sprinkles)"
              : linerType === "charms"
              ? "url(#liner-charms)"
              : "url(#liner-sports)"
          }
        />

        {/* Outer Triangular Open Flap Peak Border (Showing envelope paper framing the liner) */}
        <path
          d="M 20 130 L 200 0 L 380 130 L 362 135 L 200 15 L 38 135 Z"
          fill={envelopeColor}
          stroke={envelopeColor === "#FFFFFF" ? "#E2E8F0" : "rgba(0,0,0,0.08)"}
          strokeWidth="1"
        />

        {/* Side interior crease shadows for 3D realism */}
        <path d="M 38 135 L 140 220 L 38 395" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1.5" />
        <path d="M 362 135 L 260 220 L 362 395" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function Templates() {
  const { user } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedSwatches, setSelectedSwatches] = useState<Record<string, string>>({
    "tpl-electric-outline": "s1",
    "tpl-hype-night": "s1",
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

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
    router.push(`/dashboard/invitations?templateId=${encodeURIComponent(templateId)}`);
  };

  const handleAuthSuccess = () => {
    const tplId =
      pendingTemplateId ||
      (typeof window !== "undefined" ? sessionStorage.getItem("pending_template_id") : null);
    if (tplId) {
      router.push(`/dashboard/invitations?templateId=${encodeURIComponent(tplId)}`);
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
        {/* Paperless Post Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-[12px] tracking-[0.2em] uppercase text-neutral-500 font-medium font-sans">
            Curated Invitations
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-neutral-900 tracking-tight mt-3" style={{ fontFamily: "Georgia, serif" }}>
            Invitations your guests will love
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-neutral-600 font-sans leading-relaxed">
            Pick a stunning design for any occasion, then customize every detail — or let AI design one for you.
          </p>
        </motion.div>

        {/* 3-Column Card Grid (2 Rows of 3 Cards) */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {CURATED_TEMPLATES.map((template) => {
              const isFav = favorites.has(template.id);
              const isLandscape = Boolean(template.isLandscape);

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
                  {/* Top-Left Badge Header (e.g. "Trending") */}
                  <div className="h-7 mb-2 flex items-center">
                    {template.badge && (
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#f5f1e8] text-[#524c44] tracking-wide shadow-2xs">
                        {template.badge}
                      </span>
                    )}
                  </div>

                  {/* Visual Stationery Area: Open Envelope Behind + Card in Front */}
                  <div
                    onClick={() => handleCardClick(template.id)}
                    className="relative w-full h-[330px] sm:h-[350px] flex items-end justify-start cursor-pointer group-hover:-translate-y-1 transition-transform duration-300"
                  >
                    {/* Open Envelope with Liner Behind the Card */}
                    <OpenEnvelope
                      envelopeColor={template.envelopeColor}
                      linerType={template.linerType}
                      isLandscape={isLandscape}
                    />

                    {/* Invitation Card in Front */}
                    <div
                      className={`relative z-10 rounded-lg overflow-hidden transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.18),0_4px_10px_-3px_rgba(0,0,0,0.1)] group-hover:shadow-[0_18px_35px_-8px_rgba(0,0,0,0.25)] ${
                        isLandscape
                          ? "w-[92%] sm:w-[94%] aspect-[1.6/1] ml-0 mb-4"
                          : "w-[68%] sm:w-[70%] aspect-[3/4] ml-1 sm:ml-2 mb-2"
                      }`}
                    >
                      <img
                        src={template.image}
                        alt={template.title}
                        className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-500 group-hover:scale-103"
                        loading="lazy"
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
                  </div>

                  {/* Card Metadata Below Visual Area */}
                  <div className="mt-4 text-center flex flex-col items-center">
                    {/* Title */}
                    <h3
                      onClick={() => handleCardClick(template.id)}
                      className="text-neutral-900 text-base font-sans font-medium hover:text-black cursor-pointer transition-colors"
                    >
                      {template.title}
                    </h3>

                    {/* Subtitle / Designer (e.g. Rifle Paper Co., Little Cube, Meri Meri) */}
                    {template.designer && (
                      <p className="text-xs text-neutral-500 font-sans mt-0.5">
                        {template.designer}
                      </p>
                    )}

                    {/* Color Swatches (if template has multiple options) */}
                    {template.swatches && template.swatches.length > 0 && (
                      <div className="flex items-center justify-center gap-1.5 mt-2">
                        {template.swatches.map((swatch) => {
                          const isSelected = selectedSwatches[template.id] === swatch.id;
                          return (
                            <button
                              key={swatch.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSwatches((prev) => ({
                                  ...prev,
                                  [template.id]: swatch.id,
                                }));
                              }}
                              className={`w-4 h-4 rounded-full transition-all cursor-pointer ${swatch.style} ${
                                isSelected
                                  ? "scale-115 ring-2 ring-neutral-900 ring-offset-1"
                                  : "hover:scale-110 opacity-80 hover:opacity-100"
                              }`}
                              aria-label={swatch.label}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Minimalist Centered Favorite Heart Icon at the bottom */}
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
