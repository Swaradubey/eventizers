"use client";

import { motion, useReducedMotion } from "framer-motion";
import InvitationCard from "./InvitationCard";
import { templateCards as cards } from "../lib/templateData";

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

export default function Templates() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
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
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section id="templates" className="templates-section py-[70px] md:py-[120px] relative overflow-hidden">
      {/* Floating Sparkles in the background */}
      <Sparkle className="floating-sparkle top-12 left-10 w-4 h-4 select-none" />
      <Sparkle className="floating-sparkle-2 top-[20%] right-12 w-6 h-6 select-none" />
      <Sparkle className="floating-sparkle-3 bottom-24 left-16 w-5 h-5 select-none" />
      <Sparkle className="floating-sparkle bottom-[35%] right-[20%] w-4 h-4 select-none" />
      <Sparkle className="floating-sparkle-2 top-[40%] left-[15%] w-3 h-3 select-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Animated Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headerVariants}
          className="text-center mb-16 flex flex-col items-center relative z-10"
        >
          {/* Glass Badge */}
          <div className="premium-glass-badge mb-5 select-none">
            ✨ Hundreds of designs
          </div>
          
          <h2
            className="font-display text-4xl sm:text-5xl lg:text-[56px] xl:text-[64px] font-bold text-[#2D1B3D] tracking-tight leading-[1.1] max-w-3xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Invitations your guests will love
          </h2>
          
          <p className="text-[#2D1B3D]/70 text-lg md:text-xl max-w-[700px] mx-auto leading-relaxed mt-5">
            Pick a stunning design for any occasion, then customize every detail — or let AI design one for you.
          </p>
        </motion.div>

        {/* Responsive Templates Layout Grid / Carousel */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
        >
          {cards.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              className="w-full flex flex-col"
            >
              <InvitationCard {...card} />
            </motion.div>
          ))}
        </motion.div>

        {/* Polished Bottom CTA Button */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={headerVariants}
          className="text-center mt-12 relative z-10"
        >
          <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2D1B3D] text-white hover:bg-[#3D2555] text-sm font-semibold transition-all shadow-[0_4px_14px_rgba(45,27,61,0.15)] hover:shadow-[0_6px_20px_rgba(45,27,61,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-98">
            Browse all templates
          </button>
        </motion.div>

      </div>
    </section>
  );
}

