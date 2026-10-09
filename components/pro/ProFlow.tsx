"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, MessageCircle } from "lucide-react";
import PlatformIcon from "./PlatformIcon";
import CrmIcon from "./CrmIcon";

interface FlowStep {
  title: string;
  short: string;
  body: string;
  visual: React.ReactNode;
}

const ALSO_INCLUDED = [
  "Content calendar",
  "Audience groups",
  "Guest referral links",
  "QR check-in",
  "Multiple events",
];

export default function ProFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 7 interactive steps definition
  const steps: FlowStep[] = [
    // Step 1: Create
    {
      title: "Create your event and set your tickets",
      short: "Create",
      body: "Build the video invite, then add free, paid and VIP tickets. One link does it all.",
      visual: (
        <ul className="flex flex-col gap-2 rounded-2xl bg-background p-3 shadow-inner">
          {[
            { name: "General", price: "Free", spots: 250, pct: 62 },
            { name: "Early bird", price: "$25", spots: 100, pct: 80 },
            { name: "VIP table", price: "$120", spots: 50, pct: 36 },
          ].map((tier, idx) => (
            <motion.li
              key={tier.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx, duration: 0.3 }}
              className="rounded-xl bg-card px-3.5 py-3 border border-border/50"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">{tier.name}</span>
                <span className="font-display text-lg font-extrabold text-primary">
                  {tier.price}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${tier.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + 0.1 * idx }}
                  />
                </div>
                <span className="text-xs text-foreground/60 tabular-nums">
                  {tier.spots} spots
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      ),
    },

    // Step 2: Connect
    {
      title: "Connect your channels once",
      short: "Connect",
      body: "Link Instagram, TikTok, Facebook, YouTube and LinkedIn. No more logging in to each one.",
      visual: (
        <div className="rounded-2xl bg-background p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
            Connected Channels
          </p>
          <ul className="flex flex-wrap gap-2.5">
            {[
              { id: "instagram", name: "Instagram" },
              { id: "tiktok", name: "TikTok" },
              { id: "facebook", name: "Facebook" },
              { id: "youtube", name: "YouTube" },
              { id: "linkedin", name: "LinkedIn" },
            ].map((p, idx) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * idx }}
                className="flex h-11 items-center gap-2.5 rounded-full bg-card border border-border/60 py-1 pl-2 pr-4 text-sm font-medium"
              >
                <PlatformIcon platform={p.id} size="md" />
                <span className="text-foreground">{p.name}</span>
                <Check className="size-3.5 text-emerald-400 ml-1" aria-label="Connected" />
              </motion.li>
            ))}
          </ul>
        </div>
      ),
    },

    // Step 3: Leads
    {
      title: "Connect your CRM and manage every lead",
      short: "Leads",
      body: "Sync guests to HubSpot, Salesforce, Pipedrive or Google Sheets. Answer DMs, comments and emails in one inbox, with AI-drafted replies.",
      visual: (
        <div className="flex flex-col gap-3 rounded-2xl bg-background p-3.5">
          <ul className="flex flex-wrap gap-2">
            {[
              { id: "hubspot", label: "HubSpot" },
              { id: "salesforce", label: "Salesforce" },
              { id: "pipedrive", label: "Pipedrive" },
              { id: "sheets", label: "Sheets" },
            ].map((crm) => (
              <li
                key={crm.id}
                className="flex h-10 items-center gap-2 rounded-full bg-card border border-border/60 py-1 pl-1.5 pr-3 text-xs font-medium"
              >
                <CrmIcon id={crm.id} size="sm" />
                <span>{crm.label}</span>
              </li>
            ))}
          </ul>

          <ul className="flex flex-col gap-2">
            <motion.li
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex min-h-14 items-center gap-3 rounded-xl bg-card border border-border/50 px-3 py-2"
            >
              <PlatformIcon platform="instagram" size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Maya Chen</p>
                <p className="truncate text-xs text-foreground/60">
                  New lead from your countdown Reel
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                <Check className="size-3" aria-hidden="true" /> Synced
              </span>
            </motion.li>

            <motion.li
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex min-h-14 items-center gap-3 rounded-xl bg-card border border-border/50 px-3 py-2"
            >
              <MessageCircle className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">“Is there a table for 6?”</p>
                <p className="truncate text-xs text-foreground/60">
                  AI reply ready for you to approve
                </p>
              </div>
            </motion.li>
          </ul>
        </div>
      ),
    },

    // Step 4: Post
    {
      title: "Post to every channel from one place",
      short: "Post",
      body: "AI turns one idea into a Reel, a Story, a Post and a Short, each timed for its platform. You approve, it schedules.",
      visual: (
        <div className="rounded-2xl bg-background p-3.5">
          <div className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border">
              <img
                src="/images/halloween-house.png"
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                One idea
              </p>
              <p className="truncate font-display text-base font-extrabold">
                Countdown: 9 days to go
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Becomes four posts, timed per channel
          </p>

          <ul className="mt-2 flex flex-col gap-1.5">
            {[
              { platform: "instagram", format: "Reel", when: "Thu 7:00 PM" },
              { platform: "tiktok", format: "Video", when: "Thu 7:30 PM" },
              { platform: "facebook", format: "Post", when: "Fri 12:00 PM" },
              { platform: "youtube", format: "Short", when: "Fri 6:00 PM" },
            ].map((p, idx) => (
              <motion.li
                key={p.platform}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * idx }}
                className="flex min-h-10 items-center justify-between rounded-xl bg-card border border-border/40 px-3 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={p.platform} size="sm" />
                  <span className="font-semibold">{p.format}</span>
                </div>
                <span className="text-foreground/60">{p.when}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      ),
    },

    // Step 5: Track
    {
      title: "Every post carries a tracking link",
      short: "Track",
      body: "Follow each guest from the first view to RSVP, ticket and the door scan, with no spreadsheets.",
      visual: (
        <ul className="flex flex-col gap-3 rounded-2xl bg-background p-4">
          {[
            { label: "Saw it", value: "12.4K", pct: 100 },
            { label: "RSVP’d", value: "612", pct: 62 },
            { label: "Bought", value: "327", pct: 38 },
            { label: "Showed up", value: "Door scan", pct: 22 },
          ].map((f, idx) => (
            <li key={f.label} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-foreground/70">{f.label}</span>
                <span className="font-bold">{f.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-card">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${f.pct}%` }}
                  transition={{ duration: 0.7, delay: 0.1 * idx }}
                />
              </div>
            </li>
          ))}
        </ul>
      ),
    },

    // Step 6: Learn
    {
      title: "See which post sold the ticket",
      short: "Learn",
      body: "Analytics show revenue by post and channel, so you put your next hour where it pays.",
      visual: (
        <div className="rounded-2xl bg-background p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Share of ticket sales
          </p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {[
              { platform: "instagram", label: "Countdown Reel", pct: 46 },
              { platform: "tiktok", label: "Cocktail reveal", pct: 27 },
              { platform: "facebook", label: "Lineup post", pct: 17 },
              { platform: "direct", label: "Guest referral links", pct: 10 },
            ].map((p, idx) => (
              <li key={p.label} className="flex items-center gap-3">
                <PlatformIcon platform={p.platform} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate text-foreground/80">{p.label}</span>
                    <span className="font-bold tabular-nums">{p.pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-card">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct * 2}%` }}
                      transition={{ duration: 0.7, delay: 0.1 * idx }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ),
    },

    // Step 7: Fix
    {
      title: "Let the AI agent fix slow sales",
      short: "Fix",
      body: "It spots the slowdown, explains why, and drafts the post that fixes it. Nothing goes out until you approve.",
      visual: (
        <div className="flex flex-col gap-3 rounded-2xl bg-background p-3.5">
          <div className="flex items-start gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <p className="rounded-2xl rounded-tl-md bg-card border border-border/50 px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
              Sales slowed since Tuesday. Your Reel sold the most, so I drafted a countdown Reel for
              tonight at 7:30 PM.
            </p>
          </div>
          <div className="flex gap-2 pl-10">
            <span className="flex h-10 items-center rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow">
              Approve and schedule
            </span>
            <span className="flex h-10 items-center rounded-full bg-card border border-border px-4 text-xs font-semibold text-foreground/75">
              Edit
            </span>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];

  return (
    <section id="flow" className="relative scroll-mt-16 border-y border-border bg-card">
      {/* Top Header */}
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:pt-28">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Start to finish
        </p>
        <h2 className="font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight mt-3 sm:text-5xl lg:text-6xl">
          <span className="block pb-[0.08em]">From first idea</span>
          <span className="block pb-[0.08em] text-primary">to sold out.</span>
        </h2>

        <div>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            Seven steps, one workspace. Follow along to watch a Pro take an event from a blank
            page to a full room, and learn what worked for the next one.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Also included">
            {ALSO_INCLUDED.map((item) => (
              <li
                key={item}
                className="rounded-full bg-background border border-border/50 px-3.5 py-2 text-sm text-foreground/75"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interactive Step Switcher & Showcase */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-20" ref={containerRef}>
        {/* Step Indicator Pills */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {steps.map((st, idx) => (
            <button
              key={st.short}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 min-w-[70px] h-9 rounded-full px-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                idx === currentStep
                  ? "bg-primary text-primary-foreground shadow"
                  : idx < currentStep
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-background text-foreground/60 border border-border hover:text-foreground"
              }`}
            >
              <span>0{idx + 1}</span>
              <span className="hidden sm:inline">{st.short}</span>
            </button>
          ))}
        </div>

        {/* Content & Visual Grid */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16">
          {/* Left: Step Copy */}
          <div className="w-full lg:max-w-md lg:flex-1">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-display text-base font-extrabold text-primary-foreground shadow">
                {currentStep + 1}
              </span>
              <span className="font-mono text-sm text-primary">
                {String(currentStep + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}{" "}
                · {current.short}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="mt-4 font-display text-[1.65rem] font-extrabold leading-[1.05] tracking-tight text-balance sm:text-4xl lg:text-5xl text-foreground">
                  {current.title}
                </h3>
                <p className="mt-3 max-w-md text-pretty text-[15px] leading-relaxed text-foreground/70 lg:text-lg">
                  {current.body}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
                disabled={currentStep === 0}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold disabled:opacity-30 transition hover:bg-white/5"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep((p) => Math.min(steps.length - 1, p + 1))}
                disabled={currentStep === steps.length - 1}
                className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs font-bold disabled:opacity-30 transition hover:brightness-110 shadow"
              >
                Next Step
              </button>
            </div>
          </div>

          {/* Right: Visual Preview */}
          <div className="relative w-full min-h-0 lg:max-w-xl lg:flex-1">
            <div className="pointer-events-none absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border bg-background p-4 shadow-2xl shadow-black/30 sm:p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                >
                  {current.visual}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
