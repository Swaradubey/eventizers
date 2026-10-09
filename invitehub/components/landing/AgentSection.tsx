"use client";

import React from "react";
import { Bot, Check, Send, Sparkles } from "lucide-react";

export default function AgentSection() {
  return (
    <section id="agent" className="relative overflow-hidden bg-background py-20 lg:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        {/* Left text */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Agentic AI
          </p>
          <h2 className="font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl mt-3">
            Your event has
            <span className="block text-primary">an AI manager.</span>
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-foreground/70">
            Ask in plain English. Eventizers checks the guest list, drafts the messages, updates
            dietary requirements, and handles attendee questions automatically.
          </p>
          <p className="mt-8 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Ask. <span className="text-primary">Eventizers acts.</span>
          </p>
        </div>

        {/* Right simulated AI Agent Chat Card */}
        <div className="relative rounded-[2.5rem] border border-white/10 bg-[#12181d] p-6 shadow-2xl sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Bot className="size-5" />
              </span>
              <div>
                <p className="font-bold text-sm text-white">Eventizers Concierge</p>
                <p className="text-[11px] text-primary flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-primary animate-ping" />
                  Active for Jessica&apos;s 40th
                </p>
              </div>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
              Autonomous
            </span>
          </div>

          {/* Chat thread */}
          <div className="mt-6 space-y-4">
            {/* Host prompt */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
                &ldquo;Remind anyone who hasn&apos;t RSVP&apos;d yet that the rooftop caterer needs headcounts by tomorrow night.&rdquo;
              </div>
            </div>

            {/* AI Response */}
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-white/10 bg-[#080d11] p-4 text-xs leading-relaxed text-white/90">
                <p className="font-semibold text-primary mb-1 flex items-center gap-1">
                  <Sparkles className="size-3.5" />
                  Action plan ready:
                </p>
                <p className="text-foreground/80">
                  Identified <strong>19 guests</strong> with no response. Prepared a tailored WhatsApp message mentioning the Soho rooftop venue &amp; Friday dinner headcount deadline.
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/5 p-2 text-[11px] text-white/70">
                  <Check className="size-3.5 text-primary" />
                  <span>19 messages sent • 11 confirmed within 45 minutes</span>
                </div>
              </div>
            </div>

            {/* Guest Auto-Reply */}
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                <span className="text-[10px] font-bold text-primary block mb-0.5">Guest question from Priya N.:</span>
                &ldquo;Is there parking at the venue?&rdquo;
                <span className="text-[10px] text-white/60 block mt-1">
                  Auto-replied: &ldquo;Valet parking is available at the Prince St entrance.&rdquo;
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
