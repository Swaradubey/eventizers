"use client";

import { motion, useReducedMotion } from "framer-motion";

const useCases = [
  {
    title: "Consumers",
    desc: "Birthdays, weddings, dinners, and personal celebrations.",
    emoji: "🎉",
    theme: {
      accentGradient: "from-[#E6B83E] to-[#F3D794]",
      iconBg: "from-[#FFFDF5] to-[#FCEECF]",
      iconBorder: "border-[#E6B83E]/20 shadow-[0_8px_20px_-6px_rgba(230,184,62,0.25)]",
    },
  },
  {
    title: "Businesses",
    desc: "Conferences, launches, networking, and team events.",
    emoji: "🏢",
    theme: {
      accentGradient: "from-[#3B82F6] to-[#60A5FA]",
      iconBg: "from-[#F0F7FF] to-[#D8EAFF]",
      iconBorder: "border-[#3B82F6]/20 shadow-[0_8px_20px_-6px_rgba(59,130,246,0.25)]",
    },
  },
  {
    title: "Nonprofits",
    desc: "Fundraisers, galas, donation drives, and community events.",
    emoji: "🤝",
    theme: {
      accentGradient: "from-[#10B981] to-[#34D399]",
      iconBg: "from-[#F0FDF4] to-[#DCFCE7]",
      iconBorder: "border-[#10B981]/20 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.25)]",
    },
  },
  {
    title: "Enterprises",
    desc: "Multi-team events with SSO, approvals, and analytics.",
    emoji: "⚡",
    theme: {
      accentGradient: "from-[#8B5CF6] to-[#A78BFA]",
      iconBg: "from-[#FAF5FF] to-[#F3E8FF]",
      iconBorder: "border-[#8B5CF6]/20 shadow-[0_8px_20px_-6px_rgba(139,92,246,0.25)]",
    },
  },
];

const testimonials = [
  {
    quote:
      "We planned our entire product launch in under an hour. The AI handled invitations, reminders, and check-in flawlessly.",
    name: "Sarah Chen",
    role: "Head of Events, Northwind",
    avatar: "SC",
    color: "#4080b0",
  },
  {
    quote:
      "The attendance guarantee changed everything. No-shows dropped by 60% and our catering waste is finally under control.",
    name: "Marcus Reid",
    role: "Founder, GatherWell",
    avatar: "MR",
    color: "#7A9E7E",
  },
  {
    quote:
      "It feels like Stripe and Apple had a baby. Our donors love how effortless RSVPs and registries are.",
    name: "Priya Nair",
    role: "Director, Bright Futures Foundation",
    avatar: "PN",
    color: "#C9A84C",
  },
];

export default function UseCasesAndTestimonials() {
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
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
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
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
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
    <>
      {/* Use cases */}
      <section className="relative py-28 md:py-32 overflow-hidden bg-[#FFFCF8]">
        {/* Ambient glow orbs & mesh gradient with noise */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Soft purple radial glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] min-w-[400px] min-h-[400px] rounded-full bg-gradient-to-tr from-purple-200/20 to-transparent blur-3xl" />
          {/* Warm golden radial glow */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] min-w-[500px] min-h-[500px] rounded-full bg-gradient-to-bl from-amber-100/30 to-transparent blur-3xl" />
          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/15 via-transparent to-transparent" />
          {/* SVG noise texture */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.015] pointer-events-none mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={headerVariants}
            className="text-center mb-16 flex flex-col items-center"
          >
            {/* Glassmorphism pill badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#C9A84C]/30 bg-white/60 backdrop-blur-md shadow-[0_2px_12px_rgba(201,168,76,0.05)] text-[10px] font-bold tracking-[0.15em] text-[#C9A84C] uppercase mb-6 select-none">
              <span className="text-xs">✨</span> Event Types
            </div>

            <h2
              className="font-display text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#2D1B3D] tracking-[-0.02em] leading-[1.1] max-w-3xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Built for every kind of event
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {useCases.map((uc) => (
              <motion.div
                key={uc.title}
                variants={cardVariants}
                className="group relative overflow-hidden p-8 rounded-[24px] bg-white/40 backdrop-blur-xl border border-white/60 hover:border-white/80 shadow-[0_12px_40px_-15px_rgba(45,27,61,0.04),0_1px_2px_rgba(45,27,61,0.01)] hover:shadow-[0_24px_48px_-15px_rgba(45,27,61,0.12)] hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer flex flex-col items-start min-h-[280px]"
              >
                {/* Thin top accent line using card theme color */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${uc.theme.accentGradient} opacity-85 group-hover:opacity-100 transition-opacity`} />

                {/* Premium Icon Area */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${uc.theme.iconBg} ${uc.theme.iconBorder} flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-300`}>
                  <span className="text-2xl select-none">
                    {uc.emoji}
                  </span>
                </div>

                {/* Category Title */}
                <h3
                  className="font-display text-[26px] font-bold text-[#2D1B3D] mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {uc.title}
                </h3>

                {/* Description */}
                <p className="text-[16px] text-[#2D1B3D]/70 leading-[1.7] font-medium">
                  {uc.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
              Loved by hosts everywhere
            </p>
            <h2
              className="font-display text-4xl md:text-5xl font-bold text-[#2D1B3D]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              What our hosts say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-7 border border-[#E8C4B8]/20 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#C9A84C] text-sm">★</span>
                  ))}
                </div>
                <p className="text-[#2D1B3D]/75 text-sm leading-relaxed mb-5 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2D1B3D]">{t.name}</p>
                    <p className="text-xs text-[#2D1B3D]/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
