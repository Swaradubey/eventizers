"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { Sparkles, Images, PartyPopper, FileUp } from "lucide-react";
import { IMG } from "./data";
import { useCreateSheet } from "./CreateSheetContext";
import { Photo } from "./motion";

function Envelope({
  flap,
  partsOpacity,
  partsY,
  nameReveal,
  name,
  children,
}: {
  flap: any;
  partsOpacity: any;
  partsY: any;
  nameReveal: any;
  name: string;
  children: React.ReactNode;
}) {
  const zIndex = useTransform(flap, (val: number) => (val > 90 ? 10 : 40));
  const nameY = useTransform(nameReveal, [0, 1], [12, 0]);
  const partsStyle = { opacity: partsOpacity, y: partsY };

  return (
    <div
      className="relative"
      style={{ width: 280, height: 190, perspective: 1000 }}
    >
      <motion.div
        className="absolute inset-0 rounded-md bg-[oklch(0.84_0.012_100)]"
        style={{ ...partsStyle, zIndex: 1 }}
      />
      <div className="absolute inset-0" style={{ zIndex: 20 }}>
        {children}
      </div>
      <motion.div
        className="absolute inset-0 flex items-end justify-center bg-[oklch(0.95_0.006_100)] pb-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
        style={{
          ...partsStyle,
          zIndex: 30,
          clipPath: "polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%)",
          borderRadius: 6,
        }}
      >
        <motion.p
          className="font-display text-xl font-extrabold tracking-tight text-[oklch(0.2_0.012_250)]"
          style={{ opacity: nameReveal, y: nameY }}
        >
          {name}
        </motion.p>
      </motion.div>
      <motion.div
        className="absolute inset-x-0 top-0 origin-top"
        style={{
          ...partsStyle,
          height: "58%",
          zIndex,
          rotateX: flap,
          transformStyle: "preserve-3d",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
        }}
      >
        <div className="size-full bg-[linear-gradient(180deg,oklch(0.9_0.008_100),oklch(0.97_0.004_100))]" />
        <span className="absolute left-1/2 top-[52%] grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary font-display text-sm font-extrabold text-primary-foreground shadow-md">
          E
        </span>
      </motion.div>
    </div>
  );
}

const ACTION_BUTTONS = [
  { mode: "ai" as const, label: "Create with AI", icon: Sparkles },
  { mode: "photos" as const, label: "Use My Photos", icon: Images },
  { mode: "viral" as const, label: "Create Something Viral", icon: PartyPopper },
  { mode: "upload" as const, label: "Upload My Design", icon: FileUp },
];

export default function FinalCta() {
  const { open } = useCreateSheet();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [isInteractive, setIsInteractive] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (val) => {
    setIsInteractive(val > 0.82);
  });

  const flap = useTransform(scrollYProgress, [0.1, 0.3], [0, 180]);
  const partsOpacity = useTransform(scrollYProgress, [0.58, 0.72], [1, 0]);
  const partsY = useTransform(scrollYProgress, [0.58, 0.8], [0, 70]);
  const nameReveal = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
  const photoY = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 0.62, 0.82],
    [-28, -28, -150, -150, -100]
  );
  const photoScale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 0.62, 0.82],
    [0.7, 0.7, 1.15, 1.15, 5.5]
  );
  const photoOpacity = useTransform(scrollYProgress, [0.7, 0.9], [1, 0.28]);
  const envelopeScale = useTransform(scrollYProgress, [0.6, 0.8], [1, 0.8]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0.8, 0.92], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0.8, 0.92], [30, 0]);

  return (
    <section
      id="start-now"
      aria-labelledby="final-cta-title"
      className="relative bg-background"
    >
      <div ref={containerRef} className="relative h-[320svh]">
        <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
          {/* Animated 3D Envelope */}
          <motion.div style={{ scale: envelopeScale }} className="relative">
            <div className="scale-[0.9] sm:scale-[1.4]" aria-hidden>
              <Envelope
                flap={flap}
                partsOpacity={partsOpacity}
                partsY={partsY}
                nameReveal={nameReveal}
                name="For you"
              >
                <motion.div
                  className="absolute left-1/2 top-0 overflow-hidden rounded-2xl border-2 border-white/80 bg-black shadow-2xl"
                  style={{
                    width: 160,
                    height: 204,
                    marginLeft: -80,
                    y: photoY,
                    scale: photoScale,
                    opacity: photoOpacity,
                    transformOrigin: "50% 100%",
                  }}
                >
                  <Photo src={IMG.jessica} kenburns sizes="520px" />
                </motion.div>
              </Envelope>
            </div>
          </motion.div>

          <motion.p
            style={{ opacity: hintOpacity }}
            className="absolute bottom-16 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/50"
            aria-hidden
          >
            Keep scrolling
          </motion.p>

          {/* Headline & Actions Overlay */}
          <motion.div
            style={{
              opacity: titleOpacity,
              y: titleY,
              pointerEvents: isInteractive ? "auto" : "none",
            }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-background/40 via-background/70 to-background/90 px-5 text-center"
          >
            <h2
              id="final-cta-title"
              className="font-display text-balance text-[2.9rem] font-extrabold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
            >
              What are you celebrating?
            </h2>

            <div className="mt-8 grid w-full max-w-md gap-2.5 sm:max-w-2xl sm:grid-cols-2">
              {ACTION_BUTTONS.map((btn, idx) => (
                <button
                  key={btn.mode}
                  type="button"
                  tabIndex={isInteractive ? 0 : -1}
                  onClick={() => open(btn.mode)}
                  className={
                    idx === 0
                      ? "flex h-14 items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground transition active:scale-[0.98]"
                      : "glass flex h-14 items-center justify-center gap-2 rounded-full text-base font-bold transition hover:bg-white/20 active:scale-[0.98]"
                  }
                >
                  <btn.icon className="size-5" aria-hidden /> {btn.label}
                </button>
              ))}
            </div>

            <p className="mt-6 text-sm font-medium text-foreground/70">
              Your first event is free. No app required.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
