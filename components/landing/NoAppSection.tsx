"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { WaChat, BrowserInvite } from "./PhotoToEvent";
import { Eyebrow, Reveal, Phone, useOnScreen, useLoopPhase } from "./motion";

const PHASES = ["WhatsApp", "Tap", "Experience", "RSVP"];
const DURATIONS = [2200, 1600, 2600, 3200];
const BULLETS = [
  "No App Store.",
  "No install interstitial.",
  "No forced guest account.",
];

function PhoneScreen({ phase }: { phase: number }) {
  if (phase === 0) return <WaChat />;
  if (phase === 1) return <WaChat tap />;
  return <BrowserInvite rsvp={phase === 3} going={phase === 3} />;
}

export default function NoAppSection() {
  const [ref, isOnScreen] = useOnScreen("0px");
  const phase = useLoopPhase(PHASES.length, DURATIONS, isOnScreen);

  return (
    <section
      id="no-app"
      className="relative overflow-hidden bg-primary py-20 text-primary-foreground lg:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Eyebrow className="text-primary-foreground/70">No app</Eyebrow>
          <h2 className="mt-3 font-display text-balance text-[3.4rem] font-extrabold leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              120 guests.
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              Zero downloads.
            </motion.span>
          </h2>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-xl font-medium leading-snug">
              Guests shouldn&apos;t need another app just to attend your event.
            </p>
          </Reveal>

          <ol
            className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2"
            aria-label="How guests reach your event"
          >
            {PHASES.map((name, idx) => (
              <li key={name} className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-extrabold transition-colors duration-300",
                    idx === phase
                      ? "bg-primary-foreground text-primary"
                      : "bg-primary-foreground/15"
                  )}
                >
                  {name}
                </span>
                {idx < PHASES.length - 1 && (
                  <ArrowRight className="size-4 opacity-60" aria-hidden />
                )}
              </li>
            ))}
          </ol>

          <ul className="mt-8 flex flex-col gap-1.5 text-base font-semibold">
            {BULLETS.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2">
                <X className="size-4" aria-hidden /> {bullet}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm font-bold uppercase tracking-widest opacity-70">
            No app required.
          </p>
        </div>

        <div ref={ref}>
          <Phone className="max-w-[260px] border-primary-foreground/90">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={phase >= 2 ? "browser" : `chat${phase}`}
                initial={{ opacity: 0, scale: phase === 2 ? 1.15 : 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 text-foreground"
              >
                <PhoneScreen phase={phase} />
              </motion.div>
            </AnimatePresence>
          </Phone>
        </div>
      </div>
    </section>
  );
}
