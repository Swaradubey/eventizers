"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Play, X, Sparkles, Check, ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { VIDEO_EXPERIENCES, VideoExperience, MOODS } from "./data";
import ExperienceVisual from "./ExperienceVisual";
import { useCreateSheet } from "./CreateSheetContext";
import { Eyebrow, MaskHeading, Reveal, useOnScreen } from "./motion";
import Modal from "./Modal";

const TIER_LABELS: Record<string, string> = {
  Included: "Included",
  Premium: "Premium Experience",
  Signature: "Signature",
};

const TIER_CLASSES: Record<string, string> = {
  Included: "bg-white/15 text-foreground backdrop-blur",
  Premium: "bg-primary text-primary-foreground",
  Signature: "bg-black/60 text-primary ring-1 ring-primary backdrop-blur",
};

function TierBadge({ tier, className }: { tier: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider",
        TIER_CLASSES[tier],
        className
      )}
    >
      {TIER_LABELS[tier] || tier}
    </span>
  );
}

const SLIDERS = [
  ["Elegant", "Wild"],
  ["Classic", "Viral"],
  ["Subtle", "Cinematic"],
];

function PreviewModalDialog({
  item,
  onClose,
}: {
  item: VideoExperience | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!item}
      onClose={onClose}
      label={item ? `${item.title} preview` : "Preview"}
      variant="full"
    >
      {item && <PreviewModalContent item={item} onClose={onClose} key={item.id} />}
    </Modal>
  );
}

function PreviewModalContent({
  item,
  onClose,
}: {
  item: VideoExperience;
  onClose: () => void;
}) {
  const { open } = useCreateSheet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [sliderValues, setSliderValues] = useState<number[]>([40, 50, 60]);
  const [generationState, setGenerationState] = useState<"idle" | "working" | "done">("idle");

  useEffect(() => {
    return () => {
      photos.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [photos]);

  const satRatio = sliderValues[0] / 100;
  const conRatio = sliderValues[2] / 100;

  return (
    <div className="grid h-svh grid-rows-[auto_1fr] bg-background lg:grid-cols-2 lg:grid-rows-1">
      {/* Visual preview */}
      <div className="relative flex items-center justify-center bg-black px-4 pb-4 pt-14 lg:pt-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="glass absolute left-3 top-3 z-10 grid size-11 place-items-center rounded-full transition active:scale-95"
        >
          <X className="size-5" aria-hidden />
        </button>

        <div
          className="relative h-[40svh] max-h-[760px] overflow-hidden rounded-[2rem] border-4 border-[oklch(0.3_0.012_250)] lg:h-[82svh]"
          style={{
            aspectRatio: "9 / 16",
            filter: `saturate(${1 + 0.6 * satRatio}) contrast(${1 + 0.25 * conRatio})`,
          }}
        >
          <ExperienceVisual kind={item.kind} className="absolute inset-0" />
          {photos[0] && (
            <div className="absolute bottom-3 right-3 size-14 overflow-hidden rounded-xl border-2 border-primary shadow-xl">
              <Image
                src={photos[0]}
                alt="Your uploaded photo"
                fill
                sizes="56px"
                unoptimized
                className="object-cover"
              />
            </div>
          )}
          {generationState === "working" && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-black/60 backdrop-blur-sm">
              <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
            </div>
          )}
        </div>
      </div>

      {/* Configuration panel */}
      <div className="no-scrollbar flex flex-col gap-6 overflow-y-auto px-5 pb-10 pt-6 lg:justify-center lg:px-14">
        <div>
          <TierBadge tier={item.tier} />
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-none">{item.title}</h2>
          <p className="mt-2 text-foreground/70">{item.blurb}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Use Your Photos</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) {
                setPhotos(Array.from(files).slice(0, 6).map((f) => URL.createObjectURL(f)));
                setGenerationState("idle");
              }
            }}
            aria-label="Upload photos"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.multiple = false;
                  fileInputRef.current.click();
                }
              }}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-dashed border-white/25 text-sm font-semibold transition hover:border-primary active:scale-[0.98]"
            >
              <ImagePlus className="size-4" aria-hidden /> 1 photo
            </button>
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.multiple = true;
                  fileInputRef.current.click();
                }
              }}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-dashed border-white/25 text-sm font-semibold transition hover:border-primary active:scale-[0.98]"
            >
              <ImagePlus className="size-4" aria-hidden /> Multiple photos
            </button>
          </div>
          {photos.length > 0 && (
            <ul className="mt-3 flex gap-2">
              {photos.map((url) => (
                <li
                  key={url}
                  className="relative size-14 overflow-hidden rounded-xl border border-white/20"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="56px"
                    unoptimized
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {SLIDERS.map(([left, right], idx) => (
            <label key={left} className="block">
              <span className="flex justify-between text-xs font-semibold uppercase tracking-widest text-foreground/60">
                <span>{left}</span>
                <span>{right}</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={sliderValues[idx]}
                onChange={(e) =>
                  setSliderValues((prev) =>
                    prev.map((val, i) => (i === idx ? Number(e.target.value) : val))
                  )
                }
                className="mt-2 h-8 w-full accent-primary"
                aria-label={`${left} to ${right}`}
              />
            </label>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood}
              type="button"
              aria-pressed={selectedMood === mood}
              onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
              className={cn(
                "h-11 rounded-full border px-4 text-sm font-semibold transition active:scale-95",
                selectedMood === mood
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/15 hover:border-white/40"
              )}
            >
              {mood}
            </button>
          ))}
        </div>

        {generationState === "done" ? (
          <div className="rounded-2xl bg-primary/15 p-4">
            <p className="flex items-center gap-2 font-semibold text-primary">
              <Check className="size-4" aria-hidden /> Your invite is ready to render
            </p>
            <p className="mt-1 text-sm text-foreground/70">
              Create your free event to save it and share one link.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                open("photos", { photo: photos[0] });
              }}
              className="mt-3 h-12 w-full rounded-full bg-primary text-[15px] font-bold text-primary-foreground transition active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setGenerationState("working");
              setTimeout(() => setGenerationState("done"), 1700);
            }}
            disabled={generationState === "working"}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground transition active:scale-[0.98] disabled:opacity-60"
          >
            <Sparkles className="size-5" aria-hidden />
            {generationState === "working" ? "Generating..." : "Generate My Invite"}
          </button>
        )}
      </div>
    </div>
  );
}

function ExperienceCard({
  item,
  onOpen,
}: {
  item: VideoExperience;
  onOpen: () => void;
}) {
  const [ref, isOnScreen] = useOnScreen("0px 120px");

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label={`Preview ${item.title}`}
      className="group relative aspect-[9/16] w-[66vw] max-w-[290px] shrink-0 snap-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-black text-left transition duration-500 lg:hover:-translate-y-2 lg:hover:border-primary/60"
    >
      <ExperienceVisual
        kind={item.kind}
        playing={isOnScreen}
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <TierBadge tier={item.tier} className="absolute left-3 top-3" />
      <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/15 backdrop-blur transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Play className="size-4 fill-current" aria-hidden />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display text-2xl font-extrabold leading-none">{item.title}</h3>
        <p className="mt-1.5 text-[13px] leading-snug text-white/75">{item.blurb}</p>
      </div>
    </button>
  );
}

export default function VideoSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activePreview, setActivePreview] = useState<VideoExperience | null>(null);

  const scrollByAmount = (direction: number) => {
    scrollContainerRef.current?.scrollBy({
      left: 320 * direction,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="video"
      className="relative scroll-mt-16 overflow-hidden bg-[oklch(0.1_0.01_250)] py-20 lg:py-28"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Eyebrow>AI video invitations</Eyebrow>
          <MaskHeading
            className="mt-3 sm:text-6xl lg:text-7xl"
            lines={[
              "Your memories deserve",
              "more than a static",
              "invitation.",
            ]}
          />
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/70">
              Upload your favorite photos. Pick an experience. Eventizers turns them into a cinematic
              invite made for your celebration.
            </p>
          </Reveal>
        </div>

        <div className="hidden gap-2 lg:flex">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Previous experiences"
            className="glass grid size-12 place-items-center rounded-full transition hover:bg-white/20 active:scale-95"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Next experiences"
            className="glass grid size-12 place-items-center rounded-full transition hover:bg-white/20 active:scale-95"
          >
            <ArrowRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
      >
        {VIDEO_EXPERIENCES.map((exp) => (
          <ExperienceCard
            key={exp.id}
            item={exp}
            onOpen={() => setActivePreview(exp)}
          />
        ))}
      </div>

      <div className="mx-auto mt-4 flex max-w-7xl flex-wrap gap-x-6 gap-y-2 px-4 text-sm text-foreground/60 sm:px-6">
        <p className="w-full text-xs font-semibold uppercase tracking-widest text-foreground/40">
          Swipe to explore. Tap to preview.
        </p>
        {(["Included", "Premium", "Signature"] as const).map((tier) => (
          <span key={tier} className={cn("flex items-center gap-2")}>
            <TierBadge tier={tier} />
            {tier === "Included"
              ? "Basic animated invite"
              : tier === "Premium"
              ? "Memory animation"
              : "Multi-photo cinematic sequence"}
          </span>
        ))}
      </div>

      <PreviewModalDialog
        item={activePreview}
        onClose={() => setActivePreview(null)}
      />
    </section>
  );
}
