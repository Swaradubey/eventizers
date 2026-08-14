"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Cake, Heart, Briefcase, Wine, Baby, Gift, Music, Sparkles, ArrowRight } from "lucide-react";

interface ShowcaseCard {
  id: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  gradientClass: string;
  subtext: string;
  title: string;
  eventMeta: string;
  footerSubtitle: string;
  templateId: string;
  bgDecoration?: "rings" | "lines";
}

const showcaseCards: ShowcaseCard[] = [
  // Primary Row Cards
  {
    id: "birthday",
    badge: "BIRTHDAY",
    icon: Cake,
    gradientClass: "bg-gradient-to-br from-[#ff2a85] via-[#ff5470] to-[#ff8c42]",
    subtext: "You're invited to",
    title: "Maya's 5th Birthday",
    eventMeta: "Sat, June 14 · 2:00 PM",
    footerSubtitle: "Hosted by The Patels",
    templateId: "tpl-birthday",
  },
  {
    id: "wedding",
    badge: "WEDDING",
    icon: Heart,
    gradientClass: "bg-gradient-to-br from-[#6d28d9] via-[#8b5cf6] to-[#38bdf8]",
    subtext: "You're invited to",
    title: "Liam & Sofia",
    eventMeta: "Sept 21 · 5:00 PM · Vineyard Estate",
    footerSubtitle: "Together with their families",
    templateId: "tpl-wedding",
    bgDecoration: "rings",
  },
  {
    id: "corporate",
    badge: "CORPORATE",
    icon: Briefcase,
    gradientClass: "bg-gradient-to-br from-[#1e40af] via-[#3b82f6] to-[#6366f1]",
    subtext: "You're invited to",
    title: "Annual Product Launch",
    eventMeta: "Oct 3 · 6:30 PM · The Innovation Hub",
    footerSubtitle: "Northwind Technologies",
    templateId: "tpl-corporate",
    bgDecoration: "lines",
  },
  {
    id: "dinner-party",
    badge: "DINNER PARTY",
    icon: Wine,
    gradientClass: "bg-gradient-to-br from-[#f59e0b] via-[#f97316] to-[#ec4899]",
    subtext: "You're invited to",
    title: "Supper Club No. 7",
    eventMeta: "Fri, May 30 · 7:30 PM",
    footerSubtitle: "Hosted by Chef Amara",
    templateId: "tpl-dinner-party",
  },
  // Secondary Row Cards
  {
    id: "baby-shower",
    badge: "BABY SHOWER",
    icon: Baby,
    gradientClass: "bg-gradient-to-br from-[#00c6ff] to-[#0072ff]",
    subtext: "You're invited to",
    title: "A Little One is Coming",
    eventMeta: "Aug 9 · 12:00 PM · Garden Terrace",
    footerSubtitle: "Celebrating Baby Reyes",
    templateId: "tpl-baby-shower",
  },
  {
    id: "charity-gala",
    badge: "CHARITY GALA",
    icon: Gift,
    gradientClass: "bg-gradient-to-br from-[#7b2cbf] to-[#c77dff]",
    subtext: "You're invited to",
    title: "Bright Futures Gala",
    eventMeta: "Nov 15 · 8:00 PM · Grand Ballroom",
    footerSubtitle: "Bright Futures Foundation",
    templateId: "tpl-charity-gala",
  },
  {
    id: "live-music",
    badge: "LIVE MUSIC",
    icon: Music,
    gradientClass: "bg-gradient-to-br from-[#e60067] via-[#f72585] to-[#f77f00]",
    subtext: "You're invited to",
    title: "Rooftop Sessions",
    eventMeta: "July 12 · 9:00 PM · Skyline Loft",
    footerSubtitle: "Presented by Echo Collective",
    templateId: "tpl-live-music",
  },
  {
    id: "anniversary",
    badge: "ANNIVERSARY",
    icon: Sparkles,
    gradientClass: "bg-gradient-to-br from-[#ff7b00] to-[#ff006e]",
    subtext: "You're invited to",
    title: "25 Years Together",
    eventMeta: "Dec 6 · 6:00 PM · Lakeside Manor",
    footerSubtitle: "Celebrating James & Elena",
    templateId: "tpl-anniversary",
  },
];

export default function Templates() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const handleCardClick = (templateId: string) => {
    router.push(`/dashboard/invitations?templateId=${encodeURIComponent(templateId)}`);
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section
      id="templates"
      className="relative py-20 md:py-28 bg-gradient-to-b from-[#FAF8F5] via-[#EEF4FF]/50 to-[#FAF8F5] overflow-hidden"
    >
      {/* Subtle geometric plus/cross grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.35]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="templates-showcase-cross-grid"
              width="44"
              height="44"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M22 17v10M17 22h10"
                stroke="#94A3B8"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#templates-showcase-cross-grid)" />
        </svg>
      </div>

      {/* Soft pastel ambient radial glows */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[480px] h-[480px] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[480px] h-[480px] bg-sky-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header & Typography */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0f172a] font-sans">
            Invitations your guests will love
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64748b] leading-relaxed font-sans">
            Pick a stunning design for any occasion, then customize every detail — or let AI design one for you.
          </p>
        </motion.div>

        {/* 4-Column Showcase Grid with responsive horizontal scroll / grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mt-12 pb-4 sm:pb-0 snap-x snap-mandatory sm:snap-none no-scrollbar"
        >
          {showcaseCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                onClick={() => handleCardClick(card.templateId)}
                className={`group relative rounded-[28px] ${card.gradientClass} p-6 min-h-[380px] min-w-[280px] sm:min-w-0 flex-1 flex flex-col justify-between text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden select-none snap-center`}
              >
                {/* Decorative ambient glass highlights */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-white/15 rounded-full blur-2xl pointer-events-none transform translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-500" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-black/10 rounded-full blur-2xl pointer-events-none transform -translate-x-8 translate-y-8" />

                {/* Subtle curved ring accents for wedding */}
                {card.bgDecoration === "rings" && (
                  <svg
                    className="absolute -right-6 -top-6 w-48 h-48 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                    viewBox="0 0 200 200"
                    fill="none"
                  >
                    <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="1.5" className="text-white" />
                    <circle cx="120" cy="85" r="55" stroke="currentColor" strokeWidth="1.5" className="text-white" />
                    <circle cx="75" cy="115" r="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="text-white" />
                  </svg>
                )}

                {/* Faint horizontal decorative line motifs for corporate */}
                {card.bgDecoration === "lines" && (
                  <svg
                    className="absolute right-0 top-14 w-44 h-36 pointer-events-none opacity-15 group-hover:opacity-25 transition-opacity duration-300"
                    viewBox="0 0 200 150"
                    fill="none"
                  >
                    <line x1="20" y1="20" x2="200" y2="20" stroke="currentColor" strokeWidth="1.5" className="text-white" />
                    <line x1="55" y1="45" x2="200" y2="45" stroke="currentColor" strokeWidth="1.5" className="text-white" />
                    <line x1="10" y1="70" x2="200" y2="70" stroke="currentColor" strokeWidth="1.5" className="text-white" />
                    <line x1="70" y1="95" x2="200" y2="95" stroke="currentColor" strokeWidth="1.5" className="text-white" />
                    <line x1="35" y1="120" x2="200" y2="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="text-white" />
                  </svg>
                )}

                {/* Top Row: Pill Badge & Circular Icon Container */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-white/20 text-white shadow-sm">
                    {card.badge}
                  </span>

                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="mt-auto pt-8 relative z-10">
                  <p className="text-xs font-medium text-white/80">
                    {card.subtext}
                  </p>
                  <h3 className="text-xl font-bold tracking-tight mt-1 text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs text-white/90 mt-1">
                    {card.eventMeta}
                  </p>
                  <div className="text-xs text-white/70 mt-4 border-t border-white/10 pt-3 flex items-center justify-between">
                    <span>{card.footerSubtitle}</span>
                    <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
