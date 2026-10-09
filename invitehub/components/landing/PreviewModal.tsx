"use client";

import React, { useState } from "react";
import { X, Play, Pause, Sparkles, ArrowRight } from "lucide-react";
import { findTemplate, TEMPLATES } from "./data";
import ExperienceVisual from "./ExperienceVisual";

interface PreviewModalProps {
  templateId: string;
  onClose: () => void;
  onSelectForCreation: (templateId: string) => void;
}

export default function PreviewModal({
  templateId,
  onClose,
  onSelectForCreation,
}: PreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const template = findTemplate(templateId) || TEMPLATES[0];

  const isVideo = "kind" in template.preview;
  const kind = isVideo ? (template.preview as { kind: string }).kind : undefined;
  const img = !isVideo ? (template.preview as { img: string }).img : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
    >
      <div className="relative flex max-h-[96svh] w-full max-w-sm flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close Preview"
          className="absolute -top-12 right-0 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        >
          <X className="size-5" />
        </button>

        {/* Phone Frame */}
        <div className="relative aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[2.2rem] border-4 border-white/20 bg-black shadow-2xl">
          {isVideo && kind ? (
            <ExperienceVisual kind={kind} playing={isPlaying} className="size-full" />
          ) : (
            <div className="relative size-full">
              <img src={img} alt={template.title} className="kb size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              <div className="absolute inset-x-6 bottom-8 text-center">
                <p className="font-display text-2xl font-bold uppercase">{template.title}</p>
                <span className="mt-2 inline-block rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                  You&apos;re Invited
                </span>
              </div>
            </div>
          )}

          {/* Toggle Play/Pause for Video templates */}
          {isVideo && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="absolute left-3 top-3 z-20 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition"
            >
              {isPlaying ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current" />}
            </button>
          )}
        </div>

        {/* Action button */}
        <div className="mt-5 flex w-full max-w-[320px] flex-col gap-2">
          <button
            onClick={() => onSelectForCreation(template.id)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground hover:brightness-110 active:scale-95 transition shadow-lg"
          >
            <Sparkles className="size-4" />
            <span>Create with this style</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
