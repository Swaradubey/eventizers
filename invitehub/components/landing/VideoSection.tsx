"use client";

import React, { useState } from "react";
import { Play, Pause, Sparkles, ArrowRight, Check } from "lucide-react";
import { VIDEO_EXPERIENCES, VideoExperience } from "./data";
import ExperienceVisual from "./ExperienceVisual";
import { useCreateSheet } from "./CreateSheetContext";

export default function VideoSection() {
  const { open } = useCreateSheet();
  const [activeExp, setActiveExp] = useState<VideoExperience>(VIDEO_EXPERIENCES[0]);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <section id="video" className="relative scroll-mt-16 overflow-hidden bg-[#0d1318] py-20 lg:py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Cinematic invitations
          </p>
          <h2 className="font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl mt-3">
            Your memories deserve more than a static invitation.
          </h2>
          <p className="mt-4 max-w-xl text-base text-foreground/75 sm:text-lg">
            A single photo or a few clips become an invitation your guests will watch more than
            once. No video editing skills required.
          </p>
        </div>

        <button
          type="button"
          onClick={() => open("video", { template: activeExp.id })}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground hover:brightness-110 active:scale-95 transition shadow-lg self-start lg:self-end"
        >
          <Sparkles className="size-4" />
          <span>Create a Video Invite</span>
        </button>
      </div>

      {/* Main interactive stage */}
      <div className="mx-auto mt-12 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        {/* Left: Interactive Video Player Mockup */}
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-[2.5rem] border-4 border-white/20 bg-black shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)]">
          <ExperienceVisual kind={activeExp.kind} playing={isPlaying} className="size-full" />

          {/* Floating Controls */}
          <div className="absolute inset-x-4 top-4 z-20 flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold backdrop-blur-md text-white">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              {activeExp.title}
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause visual" : "Play visual"}
              className="grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition"
            >
              {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
            </button>
          </div>

          <div className="absolute inset-x-4 bottom-4 z-20 flex items-center justify-between rounded-2xl bg-black/70 p-3 backdrop-blur-md border border-white/10">
            <div>
              <p className="text-xs font-bold text-white">{activeExp.title}</p>
              <p className="text-[10px] text-white/70">{activeExp.tier} experience</p>
            </div>
            <button
              onClick={() => open("video", { template: activeExp.id })}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110 transition"
            >
              <span>Use this</span>
              <ArrowRight className="size-3" />
            </button>
          </div>
        </div>

        {/* Right: List of selectable experiences */}
        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Browse Motion Styles ({VIDEO_EXPERIENCES.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {VIDEO_EXPERIENCES.map((exp) => {
              const active = activeExp.id === exp.id;
              return (
                <button
                  key={exp.id}
                  onClick={() => {
                    setActiveExp(exp);
                    setIsPlaying(true);
                  }}
                  className={`flex items-start gap-3.5 rounded-2xl border p-3.5 text-left transition ${
                    active
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-white/10 bg-[#12181d] hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      active ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/70"
                    }`}
                  >
                    {active ? <Check className="size-3.5" /> : <Play className="size-3 fill-current ml-0.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-base font-bold text-white leading-snug">
                        {exp.title}
                      </span>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider ${
                          exp.tier === "Signature" ? "text-primary" : "text-white/60"
                        }`}
                      >
                        {exp.tier}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-foreground/70 leading-relaxed">{exp.blurb}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
