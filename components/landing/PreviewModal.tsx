"use client";

import React, { useState } from "react";
import { X, Play, Pause, Sparkles, ArrowRight } from "lucide-react";
import { findTemplate, TEMPLATES } from "./data";
import ExperienceVisual from "./ExperienceVisual";

interface PreviewModalProps {
  templateId: string;
  onClose: () => void;
  onSelectForCreation: (templateId: string, photo?: string) => void;
}

export default function PreviewModal({
  templateId,
  onClose,
  onSelectForCreation,
}: PreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const template = findTemplate(templateId) || TEMPLATES[0];

  const isVideo = "kind" in template.preview;
  const kind = isVideo ? (template.preview as { kind: string }).kind : undefined;
  const img = !isVideo ? (template.preview as { img: string }).img : undefined;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          setUserPhoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
          className="absolute -top-12 right-0 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
          aria-label="Upload celebrant photo"
        />

        {/* Phone Frame */}
        <div className="relative aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[2.2rem] border-4 border-white/20 bg-black shadow-2xl">
          {isVideo && kind ? (
            <ExperienceVisual kind={kind} playing={isPlaying} photo={userPhoto || undefined} className="size-full" />
          ) : (
            <div className="relative size-full">
              <img
                src={userPhoto || img}
                alt={template.title}
                className="kb size-full object-cover transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              <div className="absolute inset-x-6 bottom-8 text-center">
                <p className="font-display text-2xl font-bold uppercase">{template.title}</p>
                <span className="mt-2 inline-block rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                  You&apos;re Invited
                </span>
              </div>
            </div>
          )}

          {/* User photo indicator pill */}
          {userPhoto && (
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Your Photo Applied</span>
            </div>
          )}

          {/* Toggle Play/Pause for Video templates */}
          {isVideo && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="absolute right-3 top-3 z-20 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition cursor-pointer"
            >
              {isPlaying ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current" />}
            </button>
          )}
        </div>

        {/* Action button & Photo Upload Controls */}
        <div className="mt-4 flex w-full max-w-[320px] flex-col gap-2">
          {userPhoto ? (
            <div className="flex items-center justify-between rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
              <span className="truncate">✓ Ready to animate with AI</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="hover:underline text-foreground cursor-pointer"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => setUserPhoto(null)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Remove photo"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>Upload your photo to replace Jessica</span>
            </button>
          )}

          <button
            onClick={() => onSelectForCreation(template.id, userPhoto || undefined)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground hover:brightness-110 active:scale-95 transition shadow-lg cursor-pointer"
          >
            <Sparkles className="size-4" />
            <span>{userPhoto ? "Generate video invite with AI" : "Create with this style"}</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
