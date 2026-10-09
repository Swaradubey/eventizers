"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { IMG } from "./data";
import { useCreateSheet } from "./CreateSheetContext";

export default function ViralLoop() {
  const { open } = useCreateSheet();

  return (
    <section className="relative overflow-hidden bg-[#0a0f14] py-16 lg:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        {/* Left text */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Pass it on
          </p>
          <h2 className="font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl mt-3">
            Every guest
            <span className="block">sees how it</span>
            <span className="block text-primary">was made.</span>
          </h2>
          <p className="mt-5 max-w-sm text-lg leading-relaxed text-foreground/70">
            One great event leads to the next. Guests who loved yours can start theirs in a single tap.
          </p>
          <div className="mt-8">
            <button
              type="button"
              onClick={() => open("ai")}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 active:scale-95 transition shadow-lg"
            >
              <Sparkles className="size-4" />
              <span>Create Your Event</span>
            </button>
          </div>
        </div>

        {/* Right card mockup */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#12181d] p-5 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-white/15">
                <img src={IMG.anniversary} alt="" className="size-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                  Seen on the invitation
                </p>
                <p className="font-display text-base font-bold text-white truncate">
                  Mark &amp; Elena&apos;s Silver Jubilee
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Made with Eventizers AI
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-black/50 p-4 border border-white/10 text-center">
              <p className="text-xs text-white/90 font-medium">
                Want an invitation like this for your next event?
              </p>
              <button
                type="button"
                onClick={() => open("photos")}
                className="mt-3 w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-primary hover:text-primary-foreground transition"
              >
                Create One in 60 Seconds
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
