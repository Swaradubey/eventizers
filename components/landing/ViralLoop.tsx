"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { IMG } from "./data";
import { useCreateSheet } from "./CreateSheetContext";
import { Eyebrow, MaskHeading, Reveal, Photo } from "./motion";

const GUEST_AVATARS = [IMG.couple, IMG.marcus, IMG.party];
const SUB_GUEST_PAIRS = [
  [IMG.rooftop, IMG.anniversary],
  [IMG.baby, IMG.reunion],
  [IMG.grad, IMG.corporate],
];

const OFFSET_CLASS = "pl-[108px]";

function RoundAvatar({ src, className }: { src: string; className: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full border border-white/15 ${className}`}>
      <Photo src={src} sizes="48px" />
    </div>
  );
}

function LoopStep({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-24 shrink-0 flex-col items-start gap-1.5">
        <span aria-hidden className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
          {n}
        </span>
        <p className="text-sm font-semibold leading-snug">{title}</p>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function BranchSvg({ paths, viewBox }: { paths: string[]; viewBox: string }) {
  return (
    <svg viewBox={viewBox} preserveAspectRatio="none" className="block h-8 w-full" aria-hidden>
      {paths.map((p) => (
        <path
          key={p}
          d={p}
          fill="none"
          stroke="var(--primary)"
          strokeOpacity={0.6}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

export default function ViralLoop() {
  const { open } = useCreateSheet();

  return (
    <section className="relative overflow-hidden bg-[oklch(0.1_0.01_250)] py-16 lg:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        <div>
          <Eyebrow>Pass it on</Eyebrow>
          <MaskHeading
            className="mt-3"
            lines={["Every guest", "sees how it", "was made."]}
          />
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-sm text-lg leading-relaxed text-foreground/70">
              One great event leads to the next. Guests who loved yours can start theirs in a tap.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-8">
            <div className="max-w-sm rounded-3xl border border-white/10 bg-card p-4">
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl">
                  <Photo src={IMG.anniversary} sizes="64px" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
                    Made with Eventizers
                  </p>
                  <p className="mt-0.5 text-base font-semibold">Planning something?</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => open("ai")}
                className="mt-4 flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition active:scale-[0.98]"
              >
                Create yours <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <Reveal>
            <LoopStep n={1} title="You send your event">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-card py-1.5 pl-1.5 pr-4">
                  <RoundAvatar src={IMG.jessica} className="size-10" />
                  <div>
                    <p className="text-sm font-semibold leading-tight">You</p>
                    <p className="text-[11px] leading-tight text-foreground/60">the host</p>
                  </div>
                </div>
              </div>
            </LoopStep>
          </Reveal>

          <div className={OFFSET_CLASS} aria-hidden>
            <BranchSvg
              viewBox="0 0 300 32"
              paths={[
                "M150 0 C150 18 50 14 50 32",
                "M150 0 L150 32",
                "M150 0 C150 18 250 14 250 32",
              ]}
            />
          </div>

          <Reveal delay={0.1}>
            <LoopStep n={2} title="Guests see the badge">
              <div className="grid grid-cols-3">
                {GUEST_AVATARS.map((src, idx) => (
                  <div key={src} className="px-0.5">
                    <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-card px-1 py-2.5">
                      <RoundAvatar src={src} className="size-10" />
                      <p className="text-xs font-semibold leading-tight">Guest {idx + 1}</p>
                      <p className="text-center text-[10px] font-medium uppercase leading-tight tracking-wide text-primary">
                        Made with Eventizers
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </LoopStep>
          </Reveal>

          <div className={`grid grid-cols-3 ${OFFSET_CLASS}`} aria-hidden>
            {GUEST_AVATARS.map((src) => (
              <div key={src} className="px-0.5">
                <BranchSvg
                  viewBox="0 0 100 32"
                  paths={["M50 0 C50 18 25 14 25 32", "M50 0 C50 18 75 14 75 32"]}
                />
              </div>
            ))}
          </div>

          <Reveal delay={0.2}>
            <LoopStep n={3} title="They start theirs">
              <div className="grid grid-cols-3">
                {SUB_GUEST_PAIRS.map((pair, pIdx) => (
                  <div key={pIdx} className="grid grid-cols-2 justify-items-center">
                    {pair.map((src) => (
                      <RoundAvatar key={src} src={src} className="size-8" />
                    ))}
                  </div>
                ))}
              </div>
            </LoopStep>
          </Reveal>

          <Reveal delay={0.25}>
            <p className="mt-6 text-sm leading-relaxed text-foreground/60">
              Every invite carries a “Made with Eventizers” badge. Guests tap it, make their own event,
              and invite their own guests, who see the badge too.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
