"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Megaphone,
  QrCode,
  Lock,
  Bot,
  CalendarDays,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Eyebrow, MaskHeading, Reveal, Cta, useOnScreen, useLoopPhase } from "./motion";

const TOOLS = [
  {
    id: "guests",
    label: "Guest Management",
    icon: Users,
    stats: [
      ["84", "Going"],
      ["16", "Pending"],
      ["9", "Plus-ones"],
    ],
    note: "Lists, plus-ones and dietary notes in one place.",
  },
  {
    id: "tickets",
    label: "Ticketing",
    icon: CreditCard,
    stats: [
      ["$4,820", "Sold"],
      ["212", "Tickets"],
      ["3", "Tiers"],
    ],
    note: "Free, paid and VIP tickets with one checkout link.",
  },
  {
    id: "messaging",
    label: "Messaging",
    icon: MessageSquare,
    stats: [
      ["3", "Channels"],
      ["98%", "Delivered"],
      ["2", "Scheduled"],
    ],
    note: "WhatsApp, SMS and email from the same thread.",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: TrendingUp,
    stats: [
      ["412", "Views"],
      ["71%", "Opened"],
      ["58%", "RSVP rate"],
    ],
    note: "See who opened, who replied and what is working.",
  },
  {
    id: "ambassadors",
    label: "Ambassadors",
    icon: Megaphone,
    stats: [
      ["14", "Promoters"],
      ["96", "Referrals"],
      ["$610", "Earned"],
    ],
    note: "Give your best promoters their own trackable link.",
  },
  {
    id: "checkin",
    label: "QR Check-In",
    icon: QrCode,
    stats: [
      ["57", "Arrived"],
      ["27", "To come"],
      ["0:03", "Avg. scan"],
    ],
    note: "Scan from any phone. No extra hardware.",
  },
  {
    id: "private",
    label: "Private Events",
    icon: Lock,
    stats: [
      ["84", "Verified"],
      ["5", "Requests"],
      ["2", "Revoked"],
    ],
    note: "Verified access, with approvals when you want them.",
  },
  {
    id: "agent",
    label: "AI Agent",
    icon: Bot,
    stats: [
      ["31", "Tasks done"],
      ["4", "Suggestions"],
      ["0", "Spreadsheets"],
    ],
    note: "Ask for anything. The agent does the legwork.",
  },
  {
    id: "multi",
    label: "Multiple Events",
    icon: CalendarDays,
    stats: [
      ["6", "Events"],
      ["1,240", "Guests"],
      ["1", "Dashboard"],
    ],
    note: "Run a whole season from a single account.",
  },
];

const AGENT_PROMPTS = [
  "Send a reminder to everyone who hasn’t replied",
  "Close ticket sales for Friday at midnight",
  "Show me who checked in after 9pm",
];

const PROMPT_DURATIONS = [3200, 3200, 3200];

export default function Organizers() {
  const [activeTool, setActiveTool] = useState(TOOLS[0]);
  const [ref, isOnScreen] = useOnScreen("0px");
  const promptIdx = useLoopPhase(AGENT_PROMPTS.length, PROMPT_DURATIONS, isOnScreen);

  return (
    <section
      id="organizers"
      className="relative scroll-mt-16 overflow-hidden bg-background py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Eyebrow>For organizers</Eyebrow>
        <MaskHeading
          className="mt-3"
          lines={["Create once.", "Run everything."]}
        />
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-foreground/70">
            One control center for every guest, ticket, message and check-in.
          </p>
        </Reveal>

        <Reveal className="mt-10">
          <div ref={ref} className="overflow-hidden rounded-[2rem] border border-white/10 bg-card">
            {/* Top Prompt bar */}
            <div className="flex items-center gap-3 border-b border-white/10 p-3 sm:p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Bot className="size-4" aria-hidden />
              </span>
              <div className="relative h-6 min-w-0 flex-1 overflow-hidden text-sm sm:text-base">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={promptIdx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 truncate text-foreground/70"
                  >
                    {AGENT_PROMPTS[promptIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <CornerDownLeft className="size-4 shrink-0 text-foreground/40" aria-hidden />
            </div>

            {/* Main Tabs + Panel */}
            <div className="grid lg:grid-cols-[260px_1fr]">
              <div
                role="tablist"
                aria-label="Organizer tools"
                className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-white/10 p-2 lg:flex-col lg:border-b-0 lg:border-r"
              >
                {TOOLS.map((tool) => {
                  const active = activeTool.id === tool.id;
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTool(tool)}
                      className={cn(
                        "flex h-11 shrink-0 items-center gap-2.5 rounded-xl px-3.5 text-sm font-semibold transition active:scale-95",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/70 hover:bg-white/5"
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                      {tool.label}
                    </button>
                  );
                })}
              </div>

              <div role="tabpanel" className="min-h-[230px] p-5 sm:p-8">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeTool.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-display text-3xl font-extrabold">{activeTool.label}</h3>
                    <p className="mt-1 text-foreground/70">{activeTool.note}</p>
                    <dl className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
                      {activeTool.stats.map(([val, label]) => (
                        <div key={label} className="rounded-2xl bg-background p-3 sm:p-4">
                          <dd className="font-display text-2xl font-extrabold text-primary sm:text-4xl">
                            {val}
                          </dd>
                          <dt className="mt-1 text-xs font-medium text-foreground/60">{label}</dt>
                        </div>
                      ))}
                    </dl>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-8">
          <Cta href="/pro" variant="light" className="h-14 px-8 text-base">
            See how Eventizers Pro works
          </Cta>
        </Reveal>
      </div>
    </section>
  );
}
