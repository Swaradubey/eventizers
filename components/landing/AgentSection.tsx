"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Check, MessageCircle, MessageSquare, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Eyebrow, MaskHeading, Phone, useOnScreen, useLoopPhase } from "./motion";

const PHASE_DURATIONS = [1100, 900, 2600, 1300, 1000, 2800, 1100, 3600];

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-[12px] font-medium leading-snug text-primary-foreground"
    >
      {children}
    </motion.p>
  );
}

function AgentBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="max-w-[90%] rounded-2xl rounded-bl-sm bg-card px-3 py-2 text-[12px] leading-snug"
    >
      {children}
    </motion.div>
  );
}

function ActionButton({
  done,
  doneLabel,
  children,
}: {
  done: boolean;
  doneLabel: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "mt-2 flex h-9 items-center justify-center gap-1.5 rounded-full text-[12px] font-bold transition-colors duration-500",
        done ? "bg-white/15 text-foreground" : "bg-primary text-primary-foreground"
      )}
    >
      {done ? (
        <>
          <Check className="size-3.5" aria-hidden /> {doneLabel}
        </>
      ) : (
        children
      )}
    </span>
  );
}

function QrScanner() {
  const corners = [
    "left-0 top-0 border-l-2 border-t-2",
    "right-0 top-0 border-r-2 border-t-2",
    "bottom-0 left-0 border-b-2 border-l-2",
    "bottom-0 right-0 border-b-2 border-r-2",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black px-6"
    >
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
        Check-in
      </p>
      <div className="relative aspect-square w-full max-w-[170px]">
        {corners.map((c) => (
          <span key={c} className={cn("absolute size-6 border-primary", c)} />
        ))}
        <div className="absolute inset-3 grid grid-cols-7 gap-0.5 opacity-70">
          {Array.from({ length: 49 }).map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "rounded-[1px]",
                (7 * idx + (idx % 5)) % 3 === 0 ? "bg-white" : "bg-transparent"
              )}
            />
          ))}
        </div>
        <div className="scan-line absolute inset-x-1 h-0.5 bg-primary shadow-[0_0_20px_3px_var(--primary)]" />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        className="mt-5 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground"
      >
        <Check className="size-3.5" aria-hidden /> Priya N. checked in
      </motion.p>
    </motion.div>
  );
}

export default function AgentSection() {
  const [ref, isOnScreen] = useOnScreen("0px");
  const phase = useLoopPhase(PHASE_DURATIONS.length, PHASE_DURATIONS, isOnScreen);

  return (
    <section id="agent" className="relative overflow-hidden bg-background py-20 lg:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <Eyebrow>Agentic AI</Eyebrow>
          <MaskHeading
            className="mt-3"
            lines={["Your event has", "an AI manager."]}
          />
          <p className="mt-5 max-w-md text-lg leading-relaxed text-foreground/70">
            Ask in plain English. Eventizers checks the list, writes the message and sends it.
          </p>
          <p className="mt-8 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ask. <span className="text-primary">Eventizers acts.</span>
          </p>
        </div>

        <div ref={ref} className="relative">
          <div
            className="pointer-events-none absolute -inset-10 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
          <Phone className="max-w-[300px]">
            <div className="flex size-full flex-col bg-background pt-9">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 pb-2">
                <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="size-3.5" aria-hidden />
                </span>
                <p className="text-[12px] font-bold">Eventizers Agent</p>
                <span className="blink ml-auto size-1.5 rounded-full bg-primary" />
              </div>

              <div
                className="flex flex-1 flex-col justify-end gap-2 overflow-hidden px-3 pb-3"
                aria-live="polite"
              >
                {phase >= 0 && (
                  <UserBubble>Who still hasn&apos;t RSVP&apos;d?</UserBubble>
                )}
                {phase === 1 && (
                  <p
                    className="flex w-fit gap-1 rounded-2xl bg-card px-3 py-2"
                    aria-label="Typing"
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="blink size-1.5 rounded-full bg-foreground/60"
                        style={{ animationDelay: `${0.2 * i}s` }}
                      />
                    ))}
                  </p>
                )}
                {phase >= 2 && (
                  <AgentBubble>
                    <p>
                      <b>16 guests</b> are still pending. 11 received the invitation through WhatsApp.
                    </p>
                    <ActionButton done={phase >= 3} doneLabel="Reminders sent">
                      Send Reminder to 16
                    </ActionButton>
                  </AgentBubble>
                )}
                {phase >= 4 && (
                  <UserBubble>
                    Tell everyone coming that parking moved to 27th Street.
                  </UserBubble>
                )}
                {phase >= 5 && (
                  <AgentBubble>
                    <p>
                      <b>84 confirmed guests</b> selected.
                    </p>
                    <p className="mt-1.5 flex items-center gap-2 text-foreground/70">
                      <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
                      <MessageSquare className="size-3.5" aria-hidden /> SMS
                      <Mail className="size-3.5" aria-hidden /> Email
                    </p>
                    <ActionButton done={phase >= 6} doneLabel="Update sent">
                      Send Update
                    </ActionButton>
                  </AgentBubble>
                )}
                {phase >= 6 && <UserBubble>Start check-in.</UserBubble>}
              </div>

              <div className="mx-3 mb-4 flex h-9 items-center rounded-full bg-card px-3 text-[11px] text-foreground/40">
                Ask anything about your event...
              </div>

              <AnimatePresence>
                {phase >= 7 && <QrScanner key="scanner" />}
              </AnimatePresence>
            </div>
          </Phone>
        </div>
      </div>
    </section>
  );
}
