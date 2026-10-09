"use client";

import React from "react";
import { Sparkles, ArrowRight, Clapperboard, ImagePlus } from "lucide-react";
import { useCreateSheet } from "./CreateSheetContext";
import { IMG } from "./data";

export default function FinalCta() {
  const { open } = useCreateSheet();

  return (
    <section id="start-now" aria-labelledby="final-cta-title" className="relative overflow-hidden bg-background py-24 lg:py-36">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
        {/* Animated Envelope visual */}
        <div className="relative mb-10 w-[260px] h-[180px] sm:w-[300px] sm:h-[200px]">
          {/* Card emerging from envelope */}
          <div className="absolute left-1/2 -top-12 -translate-x-1/2 w-[140px] h-[180px] rounded-2xl border-2 border-white/60 bg-black shadow-2xl overflow-hidden transition-transform duration-700 hover:-translate-y-4">
            <img src={IMG.jessica} alt="" className="kb size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute inset-x-2 bottom-3 text-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary block">
                Jessica 40
              </span>
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[8px] font-bold text-primary-foreground">
                Invited
              </span>
            </div>
          </div>

          {/* Envelope back */}
          <div className="absolute inset-0 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 shadow-2xl backdrop-blur-md" />

          {/* Envelope front fold */}
          <div
            className="absolute inset-0 rounded-2xl bg-[#12181d] border border-white/15 flex items-end justify-center pb-4 shadow-xl"
            style={{
              clipPath: "polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)",
            }}
          >
            <p className="font-display text-base font-bold tracking-tight text-white/90">
              For you
            </p>
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Start now
        </p>

        <h2
          id="final-cta-title"
          className="font-display text-balance text-[2.8rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl mt-3 text-white"
        >
          What are you celebrating?
        </h2>

        <p className="mt-4 max-w-xl text-base text-foreground/75 sm:text-lg">
          Your first event is free. No app required for your guests. Create once, run everything.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={() => open("ai")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-xl hover:brightness-110 active:scale-95 transition"
          >
            <Sparkles className="size-4" />
            <span>Create Your Event</span>
          </button>
          <button
            type="button"
            onClick={() => open("video")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full glass px-7 text-base font-semibold text-white hover:bg-white/15 active:scale-95 transition"
          >
            <Clapperboard className="size-4" />
            <span>Pick a Video Style</span>
          </button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Works seamlessly on iOS, Android, and Desktop browsers.
        </p>
      </div>
    </section>
  );
}
