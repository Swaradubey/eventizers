"use client";

import React from "react";
import { Sparkles, ArrowRight, Share2, Film, CheckCircle2 } from "lucide-react";
import { IMG } from "./data";
import ExperienceVisual from "./ExperienceVisual";
import { useCreateSheet } from "./CreateSheetContext";

export default function PhotoToEvent() {
  const { open } = useCreateSheet();

  const steps = [
    {
      num: "01",
      title: "Start with anything",
      blurb:
        "Upload one photo, drop a few childhood pictures, describe your vibe in plain words, or bring your own finished flyer.",
      icon: Film,
    },
    {
      num: "02",
      title: "AI directs the invite",
      blurb:
        "Eventizers crafts cinematic pacing, kinetic typography, atmospheric depth, and custom RSVP styling tailored to your event.",
      icon: Sparkles,
    },
    {
      num: "03",
      title: "Share one unforgettable link",
      blurb:
        "Guests tap and watch directly in their mobile browser. One-tap calendar sync, custom questions, tickets, and check-in handled.",
      icon: Share2,
    },
  ];

  return (
    <section id="how" className="relative scroll-mt-16 bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          How it works
        </p>
        <h2 className="font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl mt-3">
          One photo. One unforgettable event.
        </h2>
        <p className="mt-4 max-w-xl text-base text-foreground/75 sm:text-lg">
          From a quiet idea to a party people talk about for weeks.
        </p>

        {/* 3 Steps Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="relative flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#12181d] p-6 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-extrabold text-primary/80">
                      {s.num}
                    </span>
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-foreground/70 leading-relaxed">{s.blurb}</p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-primary">
                  <CheckCircle2 className="size-4" />
                  <span>Instant preview ready</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Transformation Showcase */}
        <div className="mt-14 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#12181d] p-6 lg:p-10 shadow-2xl">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                Real-Time Transformation
              </span>
              <h3 className="mt-4 font-display text-3xl font-extrabold text-white sm:text-4xl">
                See the before &amp; after.
              </h3>
              <p className="mt-3 text-sm text-foreground/75 leading-relaxed sm:text-base">
                Upload a family portrait or a baby snapshot, and watch Eventizers transform it
                into an emotive celebration experience complete with interactive RSVP buttons,
                venue directions, and calendar sync.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => open("photos")}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 active:scale-95 transition"
                >
                  <span>Try With Your Photo</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Side-by-side interactive preview */}
            <div className="relative mx-auto aspect-[9/14] w-full max-w-[320px] overflow-hidden rounded-[2.2rem] border-4 border-white/20 bg-black shadow-2xl">
              <ExperienceVisual kind="then-now" playing={true} className="size-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
