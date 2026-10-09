"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Play } from "lucide-react";
import PlatformIcon from "./PlatformIcon";

interface SalesItem {
  id: string;
  platform: string;
  label: string;
  tickets: number;
  revenue: number;
}

const SALES_ITEMS: SalesItem[] = [
  { id: "ig-reel", platform: "instagram", label: "Instagram Reel", tickets: 62, revenue: 1860 },
  { id: "tt-video", platform: "tiktok", label: "TikTok video", tickets: 78, revenue: 2340 },
  { id: "fb-post", platform: "facebook", label: "Facebook post", tickets: 81, revenue: 2910 },
  { id: "yt-short", platform: "youtube", label: "YouTube Short", tickets: 69, revenue: 2780 },
  { id: "ig-story", platform: "instagram", label: "Instagram Story", tickets: 61, revenue: 2540 },
  { id: "referral", platform: "direct", label: "Guest referrals", tickets: 49, revenue: 1800 },
];

const SCHEDULED_POSTS = [
  { platform: "instagram", format: "Reel", when: "Thu 7:00 PM" },
  { platform: "tiktok", format: "Video", when: "Thu 7:30 PM" },
  { platform: "facebook", format: "Post", when: "Fri 12:00 PM" },
  { platform: "youtube", format: "Short", when: "Fri 6:00 PM" },
];

const STEP_LABELS = [
  "One idea in. AI writes the posts.",
  "Posted everywhere, timed for each channel.",
  "Every sale credited to the post that earned it.",
  "Sold out. AI suggests what to do next.",
];

const STEP_DURATIONS = [3500, 3800, 6500, 4800];

const FLOATING_PLATFORMS = [
  {
    platform: "instagram",
    className: "left-0 top-[12%]",
    delay: 0,
    color: "#e1306c",
  },
  {
    platform: "tiktok",
    className: "left-1 top-[50%]",
    delay: 0.12,
    color: "#00f2fe",
  },
  {
    platform: "facebook",
    className: "right-0 top-[22%]",
    delay: 0.06,
    color: "#1877f2",
  },
  {
    platform: "youtube",
    className: "right-1 top-[60%]",
    delay: 0.18,
    color: "#ff0000",
  },
];

export default function LaunchStage() {
  const [activeStep, setActiveStep] = useState(0);
  const [salesCount, setSalesCount] = useState(0);

  // Auto progression
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % STEP_LABELS.length);
    }, STEP_DURATIONS[activeStep]);
    return () => clearTimeout(timer);
  }, [activeStep]);

  // Sales counter animation during Step 2 & 3
  useEffect(() => {
    if (activeStep < 2) {
      setSalesCount(0);
      return;
    }
    if (activeStep === 3) {
      setSalesCount(SALES_ITEMS.length);
      return;
    }
    setSalesCount(0);
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setSalesCount(count);
      if (count >= SALES_ITEMS.length) clearInterval(interval);
    }, 900);
    return () => clearInterval(interval);
  }, [activeStep]);

  const currentSales = SALES_ITEMS.slice(0, salesCount);
  const totalTickets = activeStep === 3 ? 400 : currentSales.reduce((acc, s) => acc + s.tickets, 0);
  const totalRevenue = activeStep === 3 ? 14230 : currentSales.reduce((acc, s) => acc + s.revenue, 0);
  const lastSale = currentSales[currentSales.length - 1];

  return (
    <div
      role="group"
      aria-label="Animated preview of a Pro event selling out"
      className="w-full select-none"
    >
      <div className="relative mx-auto w-full max-w-[344px]">
        {/* Floating Social Icons */}
        {FLOATING_PLATFORMS.map((fp) => {
          const isTargeted = activeStep === 2 && lastSale?.platform === fp.platform;
          return (
            <motion.div
              key={fp.platform}
              aria-hidden="true"
              className={`absolute z-20 ${fp.className}`}
              initial={false}
              animate={activeStep >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 20,
                delay: activeStep >= 1 ? fp.delay : 0,
              }}
            >
              <div
                className="animate-[float-y_4.5s_ease-in-out_infinite]"
                style={{ animationDelay: `${6 * fp.delay}s` }}
              >
                <div
                  className={`relative grid size-12 place-items-center rounded-full border bg-card shadow-lg transition-all duration-300 ${
                    isTargeted
                      ? "scale-110 border-primary ring-4 ring-primary/30"
                      : "border-border"
                  }`}
                >
                  <span
                    className="grid shrink-0 place-items-center rounded-full size-9 [&_svg]:size-[18px]"
                    style={{
                      color: fp.color,
                      background: `color-mix(in oklab, ${fp.color} 16%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${fp.color} 30%, transparent)`,
                    }}
                  >
                    <PlatformIcon platform={fp.platform} size="md" />
                  </span>

                  {/* Bubble up ticket notification */}
                  <AnimatePresence>
                    {isTargeted && (
                      <motion.span
                        key={lastSale.id}
                        initial={{ opacity: 0, y: 4, scale: 0.8 }}
                        animate={{ opacity: 1, y: -30, scale: 1 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.5 }}
                        className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-black shadow-md"
                      >
                        +{lastSale.tickets}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* iPhone Frame */}
        <div className="relative mx-auto aspect-[9/18.5] w-full overflow-hidden rounded-[2.4rem] border-[6px] border-[#20272e] bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] max-w-[232px]">
          {/* Dynamic Island Notch */}
          <div className="absolute left-1/2 top-2 z-30 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />

          {/* Screen Content */}
          <div className="absolute inset-0 flex flex-col bg-background text-foreground">
            {/* Event Header Photo */}
            <div className="relative h-[40%] shrink-0 overflow-hidden">
              <img
                src="/images/halloween-house.png"
                alt="Event cover"
                className="size-full object-cover kb"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute inset-x-3 bottom-2">
                <p className="font-display text-base font-extrabold leading-tight">
                  NYC Rooftop Halloween
                </p>
                <p className="text-xs text-foreground/70">Oct 31 · The Roof</p>
              </div>

              {/* Status Badges on Image */}
              <AnimatePresence>
                {activeStep === 0 && (
                  <motion.span
                    key="idea"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute left-3 top-8 flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow"
                  >
                    <Sparkles className="size-3.5" aria-hidden="true" /> One idea
                  </motion.span>
                )}
                {activeStep === 3 && (
                  <motion.span
                    key="sold-out"
                    initial={{ opacity: 0, scale: 2, rotate: -22 }}
                    animate={{ opacity: 1, scale: 1, rotate: -8 }}
                    transition={{ type: "spring", stiffness: 360, damping: 16 }}
                    className="absolute right-3 top-9 rounded-md border-2 border-primary bg-background/90 px-2 py-0.5 font-display text-sm font-extrabold uppercase tracking-wider text-primary shadow-lg"
                  >
                    Sold out
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Dashboard Content */}
            <div className="flex flex-1 flex-col gap-2 p-3">
              {/* Stats Bar */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-foreground/60">Revenue</p>
                  <p className="font-display text-2xl font-extrabold leading-none text-foreground">
                    ${totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground/60">Tickets</p>
                  <p className="text-sm font-bold text-foreground">
                    {totalTickets}
                    <span className="font-medium text-foreground/50"> / 400</span>
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 overflow-hidden rounded-full bg-card">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={false}
                  animate={{ width: `${(totalTickets / 400) * 100}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>

              {/* Step Dynamic Content Box */}
              <div className="relative min-h-0 flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeStep === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col justify-center gap-2 rounded-xl bg-card p-3"
                    >
                      <p className="text-xs font-semibold text-foreground/70">Writing 4 posts…</p>
                      {[88, 64, 76].map((w, i) => (
                        <motion.span
                          key={i}
                          className="block h-2 rounded-full bg-foreground/15"
                          style={{ width: `${w}%` }}
                          animate={{ opacity: [0.35, 1, 0.35] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 * i }}
                        />
                      ))}
                    </motion.div>
                  )}

                  {activeStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col justify-between rounded-xl bg-card p-3"
                    >
                      <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                        4 posts scheduled
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {SCHEDULED_POSTS.map((p, idx) => (
                          <motion.li
                            key={p.platform}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + 0.1 * idx }}
                            className="flex items-center gap-2"
                          >
                            <PlatformIcon platform={p.platform} size="sm" />
                            <span className="flex-1 text-[11px] font-semibold">{p.format}</span>
                            <span className="text-[10px] text-foreground/60">{p.when}</span>
                          </motion.li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-foreground/50">Each with unique tracking link.</p>
                    </motion.div>
                  )}

                  {activeStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col justify-between rounded-xl bg-card p-2.5"
                    >
                      <p className="text-[11px] font-semibold text-primary">Sales attribution live</p>
                      <ul className="flex flex-col gap-1.5">
                        {SALES_ITEMS.slice(0, 4).map((s, idx) => {
                          const isNew = idx < salesCount;
                          return (
                            <li key={s.id} className="flex items-center gap-2 text-[11px]">
                              <PlatformIcon platform={s.platform} size="sm" />
                              <span className="flex-1 truncate">{s.label}</span>
                              <span
                                className={`font-bold tabular-nums transition-colors ${
                                  isNew ? "text-emerald-400" : "text-foreground/40"
                                }`}
                              >
                                {isNew ? `+${s.tickets}` : "-"}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      <p className="text-[10px] text-foreground/50">Revenue tagged automatically.</p>
                    </motion.div>
                  )}

                  {activeStep === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col justify-between rounded-xl bg-card p-2.5"
                    >
                      <div className="flex items-start gap-1.5">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[10px]">
                          ✨
                        </span>
                        <p className="text-[10px] leading-snug text-foreground/85">
                          Capacity reached in record time. Ready to announce the afterparty?
                        </p>
                      </div>
                      <span className="flex h-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow">
                        Draft Afterparty Announcement
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Stepper text and dots */}
        <div className="mx-auto mt-5 flex max-w-[344px] flex-col items-center">
          <p
            aria-live="off"
            className="min-h-10 text-balance text-center text-sm font-semibold text-foreground/85"
          >
            {STEP_LABELS[activeStep]}
          </p>
          <div className="flex items-center">
            {STEP_LABELS.map((lbl, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Show step ${idx + 1}: ${lbl}`}
                aria-current={idx === activeStep}
                onClick={() => setActiveStep(idx)}
                className="grid h-11 min-w-8 place-items-center px-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeStep ? "w-8 bg-primary" : "w-3 bg-foreground/25 hover:bg-foreground/40"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
