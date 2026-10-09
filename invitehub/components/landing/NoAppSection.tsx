"use client";

import React from "react";
import { Check, Sparkles, Smartphone, Calendar, Share } from "lucide-react";
import { useCreateSheet } from "./CreateSheetContext";

export default function NoAppSection() {
  const { open } = useCreateSheet();

  return (
    <section id="no-app" className="relative overflow-hidden bg-primary py-20 text-primary-foreground lg:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Left text */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/75">
            No app required
          </p>
          <h2 className="mt-3 font-display text-balance text-[3.4rem] font-extrabold leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
            120 guests.
            <span className="block opacity-90">Zero downloads.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed opacity-90 sm:text-lg">
            Your grandmother, your coworker, and your college roommate can all view the invite
            and RSVP in 3 seconds from any browser. No app store friction. No accounts required for guests.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => open("ai")}
              className="inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-bold text-white shadow-xl hover:bg-black/80 active:scale-95 transition"
            >
              Start Free Event
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold opacity-85 sm:ml-4">
              <Check className="size-4" />
              <span>Works on iPhone, Android, and Desktop</span>
            </div>
          </div>
        </div>

        {/* Right Phone Mockup */}
        <div className="flex justify-center">
          <div className="relative aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-[2.5rem] border-4 border-black/40 bg-black text-white shadow-2xl p-4 flex flex-col justify-between">
            {/* Browser URL Bar */}
            <div className="rounded-full bg-white/10 px-3 py-1 text-center font-mono text-[10px] text-white/70">
              eventizers.com/e/jessica40
            </div>

            {/* Invitation Preview Card */}
            <div className="rounded-2xl bg-[#12181d] border border-white/15 p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Jessica turns 40
              </span>
              <p className="font-display text-xl font-bold mt-1">The Rooftop at Soho</p>
              <p className="text-[11px] text-white/70 mt-1">Sat, Nov 14 · 8:00 PM</p>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  className="rounded-full bg-primary py-2 text-xs font-bold text-primary-foreground shadow"
                >
                  ✓ Yes, I&apos;ll be there
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white/10 py-1.5 text-[11px] font-semibold text-white/80"
                >
                  Can&apos;t make it
                </button>
              </div>
            </div>

            {/* Quick 1-tap Calendar Add */}
            <div className="flex items-center justify-between rounded-xl bg-white/10 p-2.5 text-[11px]">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="size-3.5 text-primary" />
                Add to Apple / Google Cal
              </span>
              <span className="text-primary font-bold">1-Tap</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
