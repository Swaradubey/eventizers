"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  TrendingUp,
  Zap,
  Clapperboard,
  Check,
} from "lucide-react";

export default function IndividualAiPage() {
  const [qInput, setQInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I am your Eventizers AI co-pilot. I monitor your RSVP rates, ticket pacing, and guest responses in real time. Pick a question below or ask me anything.",
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const q = (textToSend ?? qInput).trim();
    if (!q) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      {
        role: "ai",
        text: `Based on your recent event activity: You currently have 142 confirmed RSVPs out of 180 invitations (78.8% confirmed). 26 invites are pending. Sending a personalized nudge on WhatsApp or SMS today between 6 and 8 PM is estimated to convert another 18 guests.`,
      },
    ]);
    setQInput("");
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            AI Agent
          </p>
          <h1
            className="mt-1.5 text-balance font-display text-3xl font-extrabold leading-[1.02] tracking-tight sm:text-4xl text-foreground"
            style={{ fontFamily: "'Red Rose', Georgia, serif" }}
          >
            It sees the problem, then fixes it
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-[15px] leading-relaxed text-foreground/65">
            Eventizers AI reads your event metrics, tells you what changed and why, then drafts the fix. You stay in charge.
          </p>
        </div>
      </div>

      {/* Step Flow Banner */}
      <div className="flex flex-col gap-5">
        <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap" aria-label="How the agent works">
          <li className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 items-center rounded-full px-3.5 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground">
              Insight
            </span>
            <ArrowRight className="size-3.5 text-foreground/30" />
          </li>
          <li className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 items-center rounded-full px-3.5 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground">
              Recommendation
            </span>
            <ArrowRight className="size-3.5 text-foreground/30" />
          </li>
          <li className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 items-center rounded-full px-3.5 text-xs font-bold uppercase tracking-wider bg-white/8 text-foreground/55">
              Creation
            </span>
            <ArrowRight className="size-3.5 text-foreground/30" />
          </li>
          <li className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 items-center rounded-full px-3.5 text-xs font-bold uppercase tracking-wider bg-white/8 text-foreground/55">
              Approval
            </span>
            <ArrowRight className="size-3.5 text-foreground/30" />
          </li>
          <li className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 items-center rounded-full px-3.5 text-xs font-bold uppercase tracking-wider bg-white/8 text-foreground/55">
              Action
            </span>
            <ArrowRight className="size-3.5 text-foreground/30" />
          </li>
          <li className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 items-center rounded-full px-3.5 text-xs font-bold uppercase tracking-wider bg-white/8 text-foreground/55">
              Measurement
            </span>
          </li>
        </ol>

        {/* Diagnosis & Recommendation Card */}
        <section className="rounded-3xl border border-white/10 bg-card p-5 sm:p-6">
          <dl className="flex flex-col gap-5">
            <div className="flex gap-4">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 font-display text-sm font-extrabold"
                style={{ fontFamily: "'Red Rose', Georgia, serif" }}
              >
                1
              </span>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.18em] text-primary">What happened</dt>
                <dd className="mt-1 text-[15px] leading-relaxed text-foreground/85">
                  26 invited guests have viewed the invitation link but haven&apos;t confirmed their RSVP yet.
                </dd>
              </div>
            </div>

            <div className="flex gap-4">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 font-display text-sm font-extrabold"
                style={{ fontFamily: "'Red Rose', Georgia, serif" }}
              >
                2
              </span>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Why</dt>
                <dd className="mt-1 text-[15px] leading-relaxed text-foreground/85">
                  Static text invites get postponed. Guests typically RSVP within 10 minutes when shown a dynamic video teaser.
                </dd>
              </div>
            </div>

            <div className="flex gap-4">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 font-display text-sm font-extrabold"
                style={{ fontFamily: "'Red Rose', Georgia, serif" }}
              >
                3
              </span>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.18em] text-primary">What next</dt>
                <dd className="mt-1 text-[15px] leading-relaxed text-foreground/85">
                  Send a friendly 10-second cinematic reminder video with direct one-tap RSVP buttons.
                </dd>
              </div>
            </div>

            <div className="flex gap-4">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 font-display text-sm font-extrabold"
                style={{ fontFamily: "'Red Rose', Georgia, serif" }}
              >
                4
              </span>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Can AI do it</dt>
                <dd className="mt-1 text-[15px] leading-relaxed text-foreground/85">
                  Yes. I can create the video teaser and draft the message for WhatsApp and SMS. You review and approve first.
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-5 overflow-hidden rounded-2xl border border-primary/30 bg-primary/10">
            <div className="p-4 sm:p-5">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                <Sparkles className="size-3.5" /> Recommended action
              </p>
              <p className="mt-1.5 text-[15px] font-semibold leading-snug">
                Create a 10-second reminder video teaser & dispatch to pending guests
              </p>
              <button
                type="button"
                className="mt-3 flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition active:scale-95 hover:brightness-110 cursor-pointer"
              >
                <Sparkles className="size-4" /> Generate reminder teaser
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Ask a Question Section */}
      <section aria-label="Ask a question" className="overflow-hidden rounded-3xl border border-white/10 bg-card">
        <div className="border-b border-white/10 px-5 py-4">
          <h2
            className="font-display text-xl font-extrabold text-foreground"
            style={{ fontFamily: "'Red Rose', Georgia, serif" }}
          >
            Ask anything about your events
          </h2>
        </div>
        <div className="flex min-h-0 flex-col h-[28rem]">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground font-medium rounded-br-xs"
                      : "bg-white/[0.06] text-foreground/90 border border-white/10 rounded-bl-xs"
                  }`}
                >
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 bg-background/60 p-3">
            <div className="-mx-3 mb-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none]">
              {[
                "How is my RSVP pacing?",
                "Which guests need reminders?",
                "Generate a follow-up WhatsApp message.",
                "How do I set up QR check-in?",
              ].map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => handleSend(pill)}
                  className="h-10 shrink-0 rounded-full border border-white/12 bg-white/5 px-4 text-[13px] font-medium transition hover:bg-white/10 active:scale-95 text-foreground/80 cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Ask about RSVPs, guests, tickets or reminders…"
                className="h-12 min-w-0 flex-1 rounded-full border border-white/12 bg-white/6 px-5 text-sm placeholder:text-foreground/45 focus:border-primary focus:outline-none text-foreground"
              />
              <button
                type="submit"
                disabled={!qInput.trim()}
                className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <ArrowUp className="size-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* More Ideas from the Agent */}
      <section aria-label="More ideas">
        <h2
          className="mb-4 font-display text-2xl font-extrabold text-foreground"
          style={{ fontFamily: "'Red Rose', Georgia, serif" }}
        >
          More recommendations from the agent
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <article className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" /> AI Insight
            </p>
            <p className="text-pretty text-[15px] font-medium leading-snug text-foreground/90">
              WhatsApp shared invitations currently produce 3.2x faster RSVPs than email links.
            </p>
            <button
              type="button"
              className="mt-auto inline-flex h-11 w-fit items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/15 active:scale-95 cursor-pointer"
            >
              View sharing stats <ArrowUpRight className="size-4" />
            </button>
          </article>

          <article className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              <TrendingUp className="size-3.5" /> Timing Opportunity
            </p>
            <p className="text-pretty text-[15px] font-medium leading-snug text-foreground/90">
              Your guest response rate peaks between 6:30 and 8:30 PM on weekdays.
            </p>
            <button
              type="button"
              className="mt-auto inline-flex h-11 w-fit items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/15 active:scale-95 cursor-pointer"
            >
              Schedule reminder <ArrowUpRight className="size-4" />
            </button>
          </article>

          <article className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
              <Zap className="size-3.5" /> Check-in Status
            </p>
            <p className="text-pretty text-[15px] font-medium leading-snug text-foreground/90">
              All 142 confirmed guest badges are synced with the offline camera scanner.
            </p>
            <Link
              href="/dashboard/check-in"
              className="mt-auto inline-flex h-11 w-fit items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/15 active:scale-95 cursor-pointer"
            >
              Test scanner <ArrowUpRight className="size-4" />
            </Link>
          </article>

          <article className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              <Clapperboard className="size-3.5" /> Media Upgrade
            </p>
            <p className="text-pretty text-[15px] font-medium leading-snug text-foreground/90">
              Invitations with animated photo reveals have a 94% guest excitement score.
            </p>
            <Link
              href="/create-event/ai"
              className="mt-auto inline-flex h-11 w-fit items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/15 active:scale-95 cursor-pointer"
            >
              Try AI Photo-to-Video <ArrowUpRight className="size-4" />
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
