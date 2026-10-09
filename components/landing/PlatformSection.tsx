"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  MessageCircle,
  CreditCard,
  Users,
  KeyRound,
  QrCode,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ExperienceVisual from "./ExperienceVisual";
import { Eyebrow, MaskHeading } from "./motion";

const BADGES = [
  { icon: UserCheck, label: "RSVP", value: "84 Going", side: "l", top: "top-[2%]" },
  { icon: MessageCircle, label: "WhatsApp", value: "Reminder sent", side: "l", top: "top-[27%]" },
  { icon: CreditCard, label: "Tickets", value: "$4,820 sold", side: "l", top: "top-[52%]" },
  { icon: Users, label: "Guests", value: "16 Pending", side: "r", top: "top-[10%]" },
  { icon: KeyRound, label: "Private Access", value: "Verified guest", side: "r", top: "top-[35%]" },
  { icon: QrCode, label: "Check-In", value: "57 / 84 arrived", side: "r", top: "top-[60%]" },
];

export default function PlatformSection() {
  return (
    <section
      id="platform"
      className="relative overflow-hidden bg-[oklch(0.1_0.01_250)] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <Eyebrow>The invitation becomes the event</Eyebrow>
        <MaskHeading
          className="mt-3"
          lines={["Beautiful on the outside.", "Powerful underneath."]}
        />
      </div>

      <div className="relative mx-auto mt-12 h-[640px] w-full max-w-4xl px-4 lg:h-[720px]">
        {/* Center 3D Floating Phone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-1/2 top-[4%] aspect-[9/18] w-[46%] max-w-[250px] -translate-x-1/2"
        >
          <div className="float-y relative size-full overflow-hidden rounded-[2rem] border-[5px] border-[oklch(0.3_0.012_250)] bg-black shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)]">
            <ExperienceVisual kind="golden" className="absolute inset-0" />
          </div>
        </motion.div>

        {/* Floating status badges */}
        {BADGES.map((badge, idx) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, x: badge.side === "l" ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{
              duration: 0.7,
              delay: 0.3 + 0.12 * idx,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
              "absolute z-10 w-[40%] max-w-[210px]",
              badge.top,
              badge.side === "l" ? "left-3 sm:left-[4%]" : "right-3 sm:right-[4%]"
            )}
          >
            <div
              className="glass flex items-center gap-2.5 rounded-2xl p-3 shadow-2xl"
              style={{
                animation: `float-y ${5 + (idx % 3)}s ease-in-out ${0.4 * idx}s infinite alternate`,
              }}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <badge.icon className="size-[18px]" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
                  {badge.label}
                </p>
                <p className="truncate text-[13px] font-bold leading-tight sm:text-sm">
                  {badge.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Bottom AI Agent Toast */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-4 bottom-0 z-20 mx-auto max-w-md"
        >
          <div className="flex items-start gap-3 rounded-3xl bg-primary p-4 text-primary-foreground shadow-[0_20px_60px_-10px_var(--primary)]">
            <Bot className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-70">
                AI Agent
              </p>
              <p className="font-display text-lg font-bold leading-snug">
                “Want me to remind the remaining 16 guests?”
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <p className="mx-auto mt-10 max-w-md px-4 text-center text-lg text-foreground/70">
        The invitation is only the beginning.
      </p>
    </section>
  );
}
