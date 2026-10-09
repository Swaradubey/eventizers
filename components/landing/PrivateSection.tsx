"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  ShieldCheck,
  KeyRound,
  Ban,
  UserCheck,
  Lock,
  Check,
  CornerDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ExperienceVisual from "./ExperienceVisual";
import { Eyebrow, MaskHeading, Phone, useOnScreen, useLoopPhase } from "./motion";

const PHASE_DURATIONS = [2200, 3000, 2600, 2200, 3400];

const PHASES_INFO = [
  { who: "Jessica", text: "Receives her unique link" },
  { who: "Jessica", text: "Verifies her mobile number" },
  { who: "Jessica", text: "The invitation opens" },
  { who: "Someone else", text: "Jessica forwards the link" },
  { who: "Someone else", text: "The door stays closed" },
];

const FEATURES = [
  { icon: Link2, label: "Unique Links" },
  { icon: ShieldCheck, label: "OTP Verification" },
  { icon: KeyRound, label: "Access Requests" },
  { icon: Ban, label: "Revocable Invitations" },
  { icon: UserCheck, label: "Guest-Level Access" },
];

function PhaseContent({ phase }: { phase: number }) {
  if (phase === 0 || phase === 3) {
    return (
      <div className="flex size-full flex-col justify-center bg-[oklch(0.17_0.015_200)] px-3">
        <p className="mb-2 text-center text-[10px] text-white/50">Today</p>
        <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[oklch(0.35_0.07_165)] p-2.5 text-[11px] leading-snug">
          {phase === 3 && (
            <p className="mb-1 flex items-center gap-1 text-[10px] italic text-white/60">
              <CornerDownRight className="size-3" aria-hidden /> Forwarded
            </p>
          )}
          <p>Your private invite to Jessica&apos;s 40th</p>
          <p className="mt-1 break-all rounded-md bg-black/25 px-2 py-1 font-mono text-[10px] text-primary">
            eventizers.app/p/x7Kq-92
          </p>
        </div>
      </div>
    );
  }

  if (phase === 1) {
    return (
      <div className="flex size-full flex-col items-center justify-center bg-background px-5 text-center">
        <Lock className="size-6 text-primary" aria-hidden />
        <p className="mt-3 font-display text-lg font-extrabold">Verify it&apos;s you</p>
        <p className="mt-1 text-[11px] text-foreground/60">Code sent to (•••) •••-0142</p>
        <div className="mt-4 flex gap-1.5">
          {[4, 8, 1, 9].map((digit, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0.2, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + 0.4 * idx }}
              className="grid size-10 place-items-center rounded-lg bg-card font-display text-lg font-bold"
            >
              {digit}
            </motion.span>
          ))}
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
          className="mt-4 flex items-center gap-1 text-[11px] font-bold text-primary"
        >
          <Check className="size-3.5" aria-hidden /> Verified
        </motion.span>
      </div>
    );
  }

  if (phase === 2) {
    return (
      <div className="relative size-full bg-black">
        <ExperienceVisual kind="golden" className="absolute inset-0" playing />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass absolute inset-x-3 bottom-4 rounded-full px-3 py-2 text-center text-[11px] font-semibold"
        >
          Welcome, Jessica
        </motion.p>
      </div>
    );
  }

  // phase 4: locked
  return (
    <div className="flex size-full flex-col items-center justify-center bg-background px-5 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-card">
        <Lock className="size-5" aria-hidden />
      </span>
      <p className="mt-4 font-display text-xl font-extrabold">Private Event</p>
      <p className="mt-1 text-[12px] leading-snug text-foreground/60">
        This invitation is reserved for an invited guest.
      </p>
      <span className="mt-5 flex h-10 w-full items-center justify-center rounded-full border border-white/25 text-[12px] font-bold">
        Request Access
      </span>
    </div>
  );
}

export default function PrivateSection() {
  const [ref, isOnScreen] = useOnScreen("0px");
  const phase = useLoopPhase(PHASE_DURATIONS.length, PHASE_DURATIONS, isOnScreen);
  const current = PHASES_INFO[phase];

  return (
    <section
      id="private"
      className="relative overflow-hidden bg-[oklch(0.11_0.012_260)] py-20 lg:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <Eyebrow>Private invitations</Eyebrow>
          <MaskHeading
            className="mt-3"
            lines={["Forward the invite.", "Not the access."]}
          />
          <p className="mt-5 max-w-md text-lg leading-relaxed text-foreground/70">
            Private invitations can verify the guest before revealing your event.
          </p>
          <ul className="mt-8 grid gap-2 sm:grid-cols-2">
            {FEATURES.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-[15px] font-semibold"
              >
                <item.icon className="size-5 text-primary" aria-hidden />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div ref={ref} className="order-1 lg:order-2">
          <Phone className="max-w-[260px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={phase}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <PhaseContent phase={phase} />
              </motion.div>
            </AnimatePresence>
          </Phone>
          <p className="mt-5 text-center text-sm" aria-live="polite">
            <span className={cn("font-bold", phase >= 3 ? "text-accent" : "text-primary")}>
              {current.who}
            </span>
            <span className="text-foreground/70"> · {current.text}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
