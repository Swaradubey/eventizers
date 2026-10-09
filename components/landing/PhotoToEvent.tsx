"use client";

import React, { useRef, useState } from "react";
import {
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
  motion,
} from "framer-motion";
import { Check, CheckCheck, Lock, Wand2, Sun, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";
import { IMG } from "./data";
import ExperienceVisual from "./ExperienceVisual";
import { Eyebrow, MaskHeading, Phone, Photo } from "./motion";

const URL_HOST = "eventizers.app/jessica40";

const GUESTS_DASH = [
  { name: "Priya N.", status: "Going" },
  { name: "Daniel K. +1", status: "Going" },
  { name: "Marcus R.", status: "Pending" },
  { name: "Sofia L.", status: "Going" },
];

function AddressBar() {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center bg-black/70 px-4 pb-1.5 pt-8 backdrop-blur">
      <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium">
        <Lock className="size-2.5" aria-hidden />
        {URL_HOST}
      </span>
    </div>
  );
}

export function UploadScreen() {
  return (
    <div className="flex size-full flex-col bg-background px-4 pb-6 pt-10">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        New event
      </p>
      <div className="relative mt-4 flex-1 overflow-hidden rounded-2xl border border-dashed border-white/25">
        <Photo src={IMG.jessica} sizes="240px" />
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 font-mono text-[10px]">
          IMG_2041.jpg
        </span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
        <motion.span
          className="block h-full rounded-full bg-primary"
          initial={{ width: "5%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Uploading your photo
      </p>
    </div>
  );
}

export function AnalyzeScreen() {
  const analysisTags = [
    { icon: ScanFace, text: "Face found" },
    { icon: Sun, text: "Light enhanced" },
    { icon: Wand2, text: "Motion mapped" },
  ];

  return (
    <div className="relative size-full bg-black">
      <Photo src={IMG.jessica} className="brightness-90 saturate-125" sizes="240px" />
      <div className="absolute inset-x-3 scan-line h-0.5 bg-primary shadow-[0_0_24px_4px_var(--primary)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40" />
      <div className="absolute inset-x-3 bottom-5 flex flex-wrap gap-1.5">
        {analysisTags.map((tag, idx) => (
          <motion.span
            key={tag.text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + 0.3 * idx }}
            className="glass flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          >
            <tag.icon className="size-3.5 text-primary" aria-hidden />
            {tag.text}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export function WaChat({ showLink = true, tap = false }: { showLink?: boolean; tap?: boolean }) {
  return (
    <div className="flex size-full flex-col bg-[oklch(0.2_0.02_200)]">
      <div className="flex items-center gap-2 bg-[oklch(0.3_0.05_175)] px-3 pb-2.5 pt-9">
        <span className="grid size-7 place-items-center rounded-full bg-white/20 text-xs font-bold">
          J
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold">Jessica&apos;s 40th</p>
          <p className="text-[10px] text-white/60">42 participants</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2 p-3">
        <p className="max-w-[78%] rounded-xl rounded-tl-none bg-[oklch(0.28_0.015_200)] px-3 py-2 text-xs">
          Saturday. Roof. Don&apos;t be late.
        </p>
        <motion.div
          initial={false}
          animate={{
            opacity: showLink ? 1 : 0,
            y: showLink ? 0 : 24,
            scale: showLink ? 1 : 0.95,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative ml-auto w-[88%] overflow-hidden rounded-xl rounded-tr-none bg-[oklch(0.38_0.07_170)] p-1"
        >
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
            <Photo src={IMG.jessica} sizes="220px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <p className="absolute bottom-1.5 left-2 font-display text-sm font-extrabold uppercase">
              Jessica turns 40
            </p>
          </div>
          <p className="px-1.5 pt-1.5 text-[11px] font-semibold text-white/90">
            You&apos;re invited →
          </p>
          <p className="px-1.5 text-[10px] text-[oklch(0.8_0.1_200)]">{URL_HOST}</p>
          <span className="flex items-center justify-end gap-0.5 px-1.5 pb-0.5 text-[9px] text-white/60">
            9:41 <CheckCheck className="size-3 text-[oklch(0.75_0.12_230)]" aria-hidden />
          </span>
          {tap && (
            <span className="absolute left-1/2 top-[38%] size-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-white/50" />
          )}
        </motion.div>
      </div>
    </div>
  );
}

export function BrowserInvite({
  rsvp = false,
  going = false,
}: {
  rsvp?: boolean;
  going?: boolean;
}) {
  return (
    <div className="relative size-full bg-black">
      <ExperienceVisual kind="premiere" className="absolute inset-0" />
      <AddressBar />
      <motion.div
        initial={false}
        animate={{ y: rsvp ? 0 : "105%" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-0 z-10 rounded-t-3xl bg-card p-4 pb-6"
      >
        <p className="text-center text-xs font-semibold">Will you be there?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <span
            className={cn(
              "flex h-10 items-center justify-center gap-1 rounded-full text-xs font-bold transition-colors duration-300",
              going ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            {going && <Check className="size-3.5" aria-hidden />} Going
          </span>
          <span className="flex h-10 items-center justify-center rounded-full bg-muted text-xs font-bold">
            Can&apos;t make it
          </span>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          +1 allowed · No account needed
        </p>
      </motion.div>
    </div>
  );
}

export function DashScreen() {
  return (
    <div className="flex size-full flex-col bg-background px-4 pb-5 pt-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        Jessica&apos;s 40th
      </p>
      <div className="mt-3 flex items-end gap-2">
        <span className="font-display text-6xl font-extrabold leading-none text-primary">
          84
        </span>
        <span className="pb-1 text-sm font-semibold">going</span>
      </div>
      <p className="text-xs text-muted-foreground">16 pending · 9 plus-ones</p>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/10">
        <motion.span
          className="bg-primary"
          initial={{ width: 0 }}
          animate={{ width: "84%" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4 flex items-center gap-2 rounded-xl bg-primary/15 px-3 py-2 text-xs font-semibold text-primary"
      >
        <span className="blink size-1.5 rounded-full bg-primary" /> Alex just RSVP&apos;d
      </motion.p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {GUESTS_DASH.map((guest) => (
          <li
            key={guest.name}
            className="flex items-center justify-between rounded-xl bg-card px-3 py-2 text-xs"
          >
            <span className="font-medium">{guest.name}</span>
            <span
              className={cn(
                "font-semibold",
                guest.status === "Going" ? "text-primary" : "text-muted-foreground"
              )}
            >
              {guest.status}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-auto text-center text-[11px] text-muted-foreground">
        Eventizers handles the rest.
      </p>
    </div>
  );
}

const STEPS = [
  {
    word: "Upload",
    line: "Start with the photo you already love.",
    screen: <UploadScreen />,
  },
  {
    word: "Create",
    line: "AI finds the faces, fixes the light and maps the motion.",
    screen: <AnalyzeScreen />,
  },
  {
    word: "Bring it to life",
    line: "The still becomes a cinematic invitation.",
    screen: <ExperienceVisual kind="golden" className="absolute inset-0" playing />,
  },
  {
    word: "Share",
    line: "One link, straight into WhatsApp.",
    screen: <WaChat tap />,
  },
  {
    word: "Experience",
    line: "Your guest taps. The invite opens in their browser.",
    screen: <BrowserInvite />,
  },
  {
    word: "RSVP",
    line: "One tap to answer. No account, no app.",
    screen: <BrowserInvite rsvp going />,
  },
  {
    word: "Eventizers handles the rest.",
    line: "Replies land in your dashboard, live.",
    screen: <DashScreen />,
  },
];

export default function PhotoToEvent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const idx = Math.min(
      STEPS.length - 1,
      Math.max(0, Math.floor(progress * STEPS.length))
    );
    setStepIndex((curr) => (curr === idx ? curr : idx));
  });

  const activeStep = STEPS[stepIndex];

  return (
    <section id="how" className="relative scroll-mt-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-20 sm:px-6 lg:pt-28">
        <Eyebrow>How it works</Eyebrow>
        <MaskHeading
          className="mt-3"
          lines={["One photo.", "One unforgettable", "event."]}
        />
      </div>

      <div ref={containerRef} className="relative h-[560svh]">
        <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-5 overflow-hidden px-4 pt-14 lg:flex-row lg:gap-20">
          {/* Mobile progress indicators */}
          <div
            className="absolute inset-x-0 top-14 mx-auto flex max-w-xs justify-center gap-1.5 lg:hidden"
            aria-hidden
          >
            {STEPS.map((s, idx) => (
              <span
                key={s.word}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  idx <= stepIndex ? "bg-primary" : "bg-white/15"
                )}
              />
            ))}
          </div>

          {/* Phone Mockup Stage */}
          <div className="relative w-full max-w-[min(260px,26svh)] lg:max-w-[290px]">
            <div
              className="pointer-events-none absolute -inset-10 rounded-full bg-primary/10 blur-3xl"
              aria-hidden
            />
            <Phone className="max-w-none">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={stepIndex}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  {activeStep.screen}
                </motion.div>
              </AnimatePresence>
            </Phone>
          </div>

          {/* Step text content */}
          <div className="w-full max-w-md text-center lg:text-left" aria-live="polite">
            <p className="hidden font-mono text-sm text-primary lg:block">
              {String(stepIndex + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
            </p>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="font-display text-balance text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-5xl lg:mt-3 lg:text-6xl">
                  {activeStep.word}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-pretty text-base leading-relaxed text-foreground/70 lg:mx-0 lg:text-lg">
                  {activeStep.line}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Desktop pill progress bars */}
            <ol className="mt-8 hidden gap-2 lg:flex" aria-hidden>
              {STEPS.map((s, idx) => (
                <li
                  key={s.word}
                  className={cn(
                    "h-1 w-10 rounded-full transition-colors duration-300",
                    idx <= stepIndex ? "bg-primary" : "bg-white/15"
                  )}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
