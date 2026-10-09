"use client";

import React, { useState } from "react";
import { Sparkles, Clapperboard, ImagePlus, Upload, ArrowRight, Wand2 } from "lucide-react";
import { useCreateSheet } from "./CreateSheetContext";
import { IMG } from "./data";
import ExperienceVisual from "./ExperienceVisual";

export default function StartPaths() {
  const { open } = useCreateSheet();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const paths = [
    {
      id: "ai",
      title: "Describe It",
      blurb: "AI builds the whole event.",
      cta: "Create with AI",
      mode: "ai" as const,
      icon: Wand2,
      renderVisual: (playing: boolean) => (
        <div className="relative size-full overflow-hidden bg-gradient-to-br from-[#12181d] to-[#1a232b] p-4 flex flex-col justify-between">
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
              <Sparkles className="size-3.5" />
              <span>Prompting AI...</span>
            </div>
            <p className="text-xs text-white/90 leading-relaxed font-mono">
              &ldquo;Jessica&apos;s 40th in Soho, rooftop twilight, golden hour cocktails...&rdquo;
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/30 p-2 text-[11px] text-primary font-medium">
            <span>Themes &amp; music tuned</span>
            <span className="text-xs font-bold">100%</span>
          </div>
        </div>
      ),
    },
    {
      id: "viral",
      title: "Make It Viral",
      blurb: "Generate something nobody else has.",
      cta: "Create a Viral Invite",
      mode: "viral" as const,
      note: "No fixed template required.",
      icon: Sparkles,
      renderVisual: (playing: boolean) => (
        <div className="relative size-full overflow-hidden">
          <ExperienceVisual kind="premiere" playing={playing} className="absolute inset-0" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/60 backdrop-blur-md p-2 text-center text-xs font-bold text-white uppercase tracking-wider">
            Hollywood Trailer
          </div>
        </div>
      ),
    },
    {
      id: "photos",
      title: "Bring Photos to Life",
      blurb: "Turn memories into your invitation.",
      cta: "Create from Photos",
      mode: "photos" as const,
      badge: "AI Video",
      icon: ImagePlus,
      renderVisual: (playing: boolean) => (
        <div className="relative size-full overflow-hidden">
          <ExperienceVisual kind="then-now" playing={playing} className="absolute inset-0" />
        </div>
      ),
    },
    {
      id: "upload",
      title: "Upload Your Own",
      blurb: "Already designed it? Bring it with you.",
      cta: "Upload Your Design",
      mode: "upload" as const,
      icon: Upload,
      renderVisual: () => (
        <div className="relative size-full overflow-hidden bg-black flex flex-col items-center justify-center p-4">
          <img src={IMG.corporate} alt="" className="absolute inset-0 size-full object-cover opacity-60" />
          <div className="relative z-10 flex flex-col items-center rounded-xl bg-black/75 p-3.5 backdrop-blur-sm border border-white/20 text-center">
            <Upload className="size-6 text-primary mb-1" />
            <span className="text-xs font-bold">Your Artwork</span>
            <span className="text-[10px] text-white/70 mt-0.5">+ Live RSVP &amp; QR check-in</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="start" className="relative scroll-mt-16 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Four ways in
        </p>
        <h2 className="font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl mt-3">
          Start your way.
        </h2>
        <p className="mt-3 text-lg text-foreground/70">
          Eventizers takes it from there.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-4 lg:overflow-visible">
        {paths.map((p) => {
          const Icon = p.icon;
          const isHovered = hoveredCard === p.id;
          return (
            <div
              key={p.id}
              onMouseEnter={() => setHoveredCard(p.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="flex w-[280px] shrink-0 snap-start flex-col rounded-[2rem] border border-white/10 bg-[#12181d] p-4 sm:w-auto hover:border-white/20 transition-all hover:shadow-2xl"
            >
              {/* Card visual showcase */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.4rem] border border-white/10">
                {p.renderVisual(isHovered)}
                {p.badge && (
                  <span className="absolute top-2.5 right-2.5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground shadow">
                    {p.badge}
                  </span>
                )}
              </div>

              {/* Card text */}
              <div className="mt-4 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <h3 className="font-display text-xl font-bold tracking-tight text-white">
                      {p.title}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-foreground/70 leading-relaxed">{p.blurb}</p>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => open(p.mode as any)}
                    className="flex w-full items-center justify-between rounded-full bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primary hover:text-primary-foreground active:scale-95"
                  >
                    <span>{p.cta}</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                  {p.note && (
                    <p className="mt-2 text-center text-[10px] text-muted-foreground">{p.note}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
