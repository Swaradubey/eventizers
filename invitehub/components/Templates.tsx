"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Calendar, MapPin, Users } from "lucide-react";
import InvitationCard from "./InvitationCard";
import { templateCards as cards, TemplateItem, matchesCategory } from "../lib/templateData";

const Sparkle = ({ className }: { className: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 3C12 3 13.5 8.5 16 11C18.5 13.5 24 15 24 15C24 15 18.5 16.5 16 19C13.5 21.5 12 27 12 27C12 27 10.5 21.5 8 19C5.5 16.5 0 15 0 15C0 15 5.5 13.5 8 11C10.5 8.5 12 3 12 3Z" 
      fill="currentColor"
    />
  </svg>
);

const CATEGORIES = [
  "All",
  "Wedding",
  "Baby Shower",
  "Corporate",
  "Birthday",
  "Community",
  "Networking",
  "Private Dinner",
  "Fundraiser",
  "Graduation",
];

export default function Templates() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);

  // Filter templates dynamically across all cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Category match
      const categoryMatch = matchesCategory(card.category || card.type, selectedCategory);
      if (!categoryMatch) return false;

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        card.title.toLowerCase().includes(q) ||
        (card.category && card.category.toLowerCase().includes(q)) ||
        (card.type && card.type.toLowerCase().includes(q)) ||
        (card.host && card.host.toLowerCase().includes(q)) ||
        (card.venue && card.venue.toLowerCase().includes(q)) ||
        (card.description && card.description.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleOpenEditor = (templateId: string) => {
    router.push(`/dashboard/invitations?templateId=${encodeURIComponent(templateId)}`);
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const cardVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const headerVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
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
    <section id="templates" className="templates-section py-[70px] md:py-[110px] relative overflow-hidden bg-[#FAF8F5]">
      {/* Background Sparkles */}
      <Sparkle className="floating-sparkle top-12 left-10 w-4 h-4 select-none text-[#C9A84C]" />
      <Sparkle className="floating-sparkle-2 top-[20%] right-12 w-6 h-6 select-none text-[#9070c0]" />
      <Sparkle className="floating-sparkle-3 bottom-24 left-16 w-5 h-5 select-none text-[#e07090]" />
      <Sparkle className="floating-sparkle bottom-[35%] right-[20%] w-4 h-4 select-none text-[#4080b0]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Animated Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headerVariants}
          className="text-center mb-10 flex flex-col items-center relative z-10"
        >
          {/* Glass Badge */}
          <div className="premium-glass-badge mb-4 select-none px-4 py-1.5 rounded-full border border-[#9070c0]/30 bg-white/70 backdrop-blur-md text-xs font-semibold text-[#2D1B3D] shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>Over {cards.length} Premium Designs</span>
          </div>
          
          <h2
            className="font-display text-3xl sm:text-4xl lg:text-[52px] font-bold text-[#2D1B3D] tracking-tight leading-[1.1] max-w-3xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Invitations your guests will love
          </h2>
          
          <p className="text-[#2D1B3D]/70 text-base md:text-lg max-w-[680px] mx-auto leading-relaxed mt-4 font-body">
            Pick any design below to customize fonts, colors, and content — or open directly in the interactive editor.
          </p>
        </motion.div>

        {/* Filter Controls Bar: Search & Categories */}
        <div className="mb-10 space-y-5 relative z-10">
          {/* Search Input */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D1B3D]/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, host, venue, or keyword..."
              className="w-full pl-11 pr-10 py-3 rounded-full border border-[#E8C4B8]/60 bg-white text-sm text-[#2D1B3D] placeholder-[#2D1B3D]/40 focus:outline-none focus:ring-2 focus:ring-[#9070c0]/40 focus:border-[#9070c0] shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2D1B3D]/40 hover:text-[#2D1B3D]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto px-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 border ${
                    isSelected
                      ? "bg-[#2D1B3D] text-white border-[#2D1B3D] shadow-md scale-[1.02]"
                      : "bg-white text-[#2D1B3D]/70 border-[#E8C4B8]/50 hover:border-[#2D1B3D]/40 hover:text-[#2D1B3D] hover:bg-[#FAF8F5]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Result Count Indicator */}
          <div className="text-center text-xs text-[#2D1B3D]/50 font-medium pt-1">
            Showing {filteredCards.length} {filteredCards.length === 1 ? "template" : "templates"}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>

        {/* Templates Layout Grid */}
        {filteredCards.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8C4B8]/40 shadow-sm max-w-md mx-auto">
            <p className="text-lg font-bold text-[#2D1B3D] mb-1">No matching templates found</p>
            <p className="text-xs text-[#2D1B3D]/60 mb-6">Try adjusting your search query or selecting a different category.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#2D1B3D] text-white hover:bg-[#3D2555] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="max-h-[550px] sm:max-h-[600px] lg:max-h-[65vh] overflow-y-auto pr-2 pb-4 rounded-2xl custom-scrollbar relative z-10">
            <motion.div
              key={`${selectedCategory}-${searchQuery}`}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10"
            >
              {filteredCards.map((card) => (
                <motion.div
                  key={card.id}
                  variants={cardVariants}
                  onClick={() => setPreviewTemplate(card)}
                  className="w-full flex flex-col cursor-pointer group"
                >
                  <div className="relative rounded-[24px] overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
                    <InvitationCard {...card} />
                    {/* Hover Overlay Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4 pointer-events-none rounded-[24px]">
                      <span className="px-5 py-2 rounded-full bg-white text-[#2D1B3D] font-semibold text-xs shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                        Preview Template
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

      </div>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#E8C4B8]/40 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-[#FAF8F5]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#2D1B3D] text-white">
                    {previewTemplate.category || previewTemplate.type}
                  </span>
                  <span className="text-xs text-[#2D1B3D]/50 font-mono">ID: {previewTemplate.id}</span>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-200/60 text-[#2D1B3D]/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Preview */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                <div className="w-full max-w-sm mx-auto shadow-xl rounded-[24px] overflow-hidden">
                  <InvitationCard {...previewTemplate} />
                </div>

                <div className="space-y-2 text-center pt-2">
                  <h3 className="text-xl font-bold font-display text-[#2D1B3D]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {previewTemplate.title}
                  </h3>
                  <p className="text-xs text-[#2D1B3D]/70 max-w-md mx-auto leading-relaxed">
                    {previewTemplate.description || "Fully editable invitation template ready to customize with your event details."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8C4B8]/30">
                  <div className="flex items-center gap-2 text-[#2D1B3D]/70">
                    <Calendar className="w-4 h-4 text-[#9070c0]" />
                    <span className="truncate">{previewTemplate.date} {previewTemplate.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#2D1B3D]/70">
                    <Users className="w-4 h-4 text-[#9070c0]" />
                    <span className="truncate">{previewTemplate.host}</span>
                  </div>
                  {previewTemplate.venue && (
                    <div className="flex items-center gap-2 text-[#2D1B3D]/70 col-span-2">
                      <MapPin className="w-4 h-4 text-[#9070c0]" />
                      <span className="truncate">{previewTemplate.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-5 border-t border-neutral-100 bg-[#FAF8F5] flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-5 py-3 rounded-xl border border-[#E8C4B8]/60 text-xs font-semibold text-[#2D1B3D] hover:bg-white transition-colors flex-1"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    const tid = previewTemplate.id;
                    setPreviewTemplate(null);
                    handleOpenEditor(tid);
                  }}
                  className="px-6 py-3 rounded-xl bg-[#2D1B3D] text-white text-xs font-bold hover:bg-[#3D2555] transition-all shadow-md flex items-center justify-center gap-2 flex-[2]"
                >
                  <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                  Customize in Editor
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
