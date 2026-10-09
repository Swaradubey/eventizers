"use client";

import React, { useState } from "react";
import { Sparkles, Wand2, ArrowRight } from "lucide-react";
import { LAB_CHIPS, MOODS } from "./data";
import ExperienceVisual from "./ExperienceVisual";
import { useCreateSheet } from "./CreateSheetContext";

export default function ViralLab() {
  const { open } = useCreateSheet();
  const [selectedChip, setSelectedChip] = useState(LAB_CHIPS[0]);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState(LAB_CHIPS[0].prompt);

  const handleChipClick = (chip: typeof LAB_CHIPS[0]) => {
    setSelectedChip(chip);
    setCustomPrompt(chip.prompt);
  };

  const handleMoodClick = (mood: string) => {
    setActiveMood(mood === activeMood ? null : mood);
  };

  return (
    <section id="lab" className="relative scroll-mt-16 overflow-hidden bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Viral AI lab
        </p>
        <h2 className="font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl mt-3">
          Make something people want to forward.
        </h2>
        <p className="mt-4 max-w-xl text-base text-foreground/75 sm:text-lg">
          No generic templates. Choose a creative direction or give AI full creative control.
        </p>

        {/* Interactive Lab Stage */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center rounded-[2.5rem] border border-white/10 bg-[#12181d] p-6 lg:p-10 shadow-2xl">
          {/* Controls */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
                Choose a Creative Hook
              </label>
              <div className="flex flex-wrap gap-2">
                {LAB_CHIPS.map((chip, idx) => {
                  const active = selectedChip.label === chip.label;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-primary text-primary-foreground shadow"
                          : "border border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                Tweak the Mood
              </label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood, idx) => {
                  const active = activeMood === mood;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleMoodClick(mood)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                        active
                          ? "bg-accent text-white"
                          : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      + {mood}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt preview box */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1.5">
                <Wand2 className="size-3.5" />
                <span>AI Prompt Director</span>
              </div>
              <p className="text-sm text-white/90 leading-relaxed font-mono">
                &ldquo;{customPrompt}
                {activeMood ? ` Also, ${activeMood.toLowerCase()}.` : ""}&rdquo;
              </p>
            </div>

            <button
              type="button"
              onClick={() => open("ai")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground hover:brightness-110 active:scale-95 transition shadow-lg self-start"
            >
              <Sparkles className="size-4" />
              <span>Generate This Invitation</span>
              <ArrowRight className="size-4" />
            </button>
          </div>

          {/* Real-time Visual Stage */}
          <div className="relative mx-auto aspect-[9/16] w-full max-w-[290px] overflow-hidden rounded-[2.2rem] border-4 border-white/20 bg-black shadow-2xl">
            <ExperienceVisual kind={selectedChip.kind} playing={true} className="size-full" />
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md">
                Live Preview
              </span>
              <span className="size-2 rounded-full bg-accent animate-ping" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
