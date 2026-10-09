"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Check, Wand2, Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { LAB_CHIPS } from "./data";
import ExperienceVisual from "./ExperienceVisual";
import { useCreateSheet } from "./CreateSheetContext";
import { Eyebrow, MaskHeading, Reveal } from "./motion";

const VIRAL_KINDS = ["meme", "news", "premiere", "vhs", "redcarpet"];
const ELEGANT_KINDS = ["luxury", "editorial", "romantic", "golden", "journey"];
const ALL_KINDS = [...VIRAL_KINDS, ...ELEGANT_KINDS];

const LAB_LABELS: Record<string, string> = {
  premiere: "Movie Trailer",
  news: "Breaking News",
  editorial: "Luxury Editorial",
  vhs: "90s Throwback",
  meme: "Meme Energy",
  romantic: "Romantic Film",
  redcarpet: "VIP Only",
  luxury: "Luxury Envelope",
  golden: "Golden Milestone",
  journey: "Memory Journey",
  surprise: "Surprise",
  "then-now": "Then & Now",
};

const SHARING_TIPS = [
  "Strong opening hook",
  "High visual surprise",
  "Short reveal",
  "Excellent mobile preview",
  "Clear RSVP CTA",
];

function pickRandom(pool: string[], count: number, force?: string): string[] {
  const filtered = [...pool].sort(() => Math.random() - 0.5).filter((k) => k !== force);
  return (force ? [force, ...filtered] : filtered).slice(0, count);
}

export default function ViralLab() {
  const { open } = useCreateSheet();
  const [prompt, setPrompt] = useState("");
  const [concepts, setConcepts] = useState<string[] | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const runGeneration = (kinds: string[]) => {
    setIsLoading(true);
    setConcepts(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setConcepts(kinds);
      setSelectedIdx(0);
      setIsLoading(false);
    }, 1300);
  };

  const handleWild = (force?: string) => runGeneration(pickRandom(ALL_KINDS, 3, force));

  const targetScore = concepts
    ? 80 + (3 * concepts.length + 4 * selectedIdx + 5) % 13
    : 0;

  useEffect(() => {
    if (!concepts) {
      setAnimatedScore(0);
      return;
    }
    let frame = 0;
    let animId: number;
    const animate = () => {
      frame++;
      setAnimatedScore(Math.min(targetScore, Math.round((targetScore * frame) / 28)));
      if (frame < 28) animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [concepts, targetScore]);

  return (
    <section id="lab" className="relative scroll-mt-16 overflow-hidden bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Eyebrow>Viral AI lab</Eyebrow>
        <MaskHeading
          className="mt-3"
          lines={["Make something", "people want to", "forward."]}
        />
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/70">
            Don&apos;t choose another invitation everyone has already seen. Tell AI the vibe and
            generate something original.
          </p>
        </Reveal>

        <Reveal className="mt-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleWild();
            }}
            className="rounded-[2rem] border border-white/10 bg-card p-4 sm:p-6"
          >
            <label
              htmlFor="lab-prompt"
              className="font-display text-2xl font-extrabold leading-tight sm:text-3xl"
            >
              What should your invitation feel like?
            </label>
            <textarea
              id="lab-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Make my 30th birthday invitation feel like a ridiculous Hollywood action movie trailer."
              className="mt-3 w-full resize-none rounded-2xl bg-background p-4 text-base leading-relaxed placeholder:text-foreground/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              {LAB_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setPrompt(chip.prompt);
                    runGeneration(
                      pickRandom(ALL_KINDS, 3, chip.kind === "surprise" ? undefined : chip.kind)
                    );
                  }}
                  className="h-11 shrink-0 rounded-full border border-white/15 px-4 text-sm font-semibold transition hover:border-primary hover:text-primary active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground transition active:scale-[0.98] disabled:opacity-70 sm:w-auto sm:px-10"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="size-5" aria-hidden />
              )}
              {isLoading ? "Dreaming up concepts..." : "Generate 3 concepts"}
            </button>
          </form>
        </Reveal>

        <div className="mt-8 min-h-[18rem]" aria-live="polite">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.ul
                key="busy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-3 gap-2 sm:gap-4"
                aria-label="Generating concepts"
              >
                {[0, 1, 2].map((idx) => (
                  <li key={idx} className="shimmer aspect-[9/16] rounded-2xl bg-card" />
                ))}
              </motion.ul>
            )}

            {concepts && !isLoading && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ul className="grid grid-cols-3 gap-2 sm:gap-4">
                  {concepts.map((kind, idx) => (
                    <motion.li
                      key={`${kind}-${idx}`}
                      initial={{
                        opacity: 0,
                        y: 40,
                        rotate: idx === 1 ? 0 : idx === 0 ? -4 : 4,
                      }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={{ delay: 0.12 * idx, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedIdx(idx)}
                        aria-pressed={selectedIdx === idx}
                        aria-label={`Select concept 0${idx + 1}: ${LAB_LABELS[kind] || kind}`}
                        className={cn(
                          "relative block aspect-[9/16] w-full overflow-hidden rounded-2xl border-2 transition",
                          selectedIdx === idx
                            ? "border-primary shadow-[0_0_40px_-8px_var(--primary)]"
                            : "border-transparent opacity-80"
                        )}
                      >
                        <ExperienceVisual kind={kind} className="absolute inset-0" />
                        {selectedIdx === idx && (
                          <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3.5" aria-hidden />
                          </span>
                        )}
                      </button>
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-primary">
                        Concept 0{idx + 1}
                      </p>
                      <p className="text-xs text-foreground/70">{LAB_LABELS[kind] || kind}</p>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => runGeneration(pickRandom(VIRAL_KINDS, 3))}
                    className="h-12 rounded-full border border-white/15 text-sm font-semibold transition hover:border-primary active:scale-95"
                  >
                    Make More Viral
                  </button>
                  <button
                    type="button"
                    onClick={() => runGeneration(pickRandom(ELEGANT_KINDS, 3))}
                    className="h-12 rounded-full border border-white/15 text-sm font-semibold transition hover:border-primary active:scale-95"
                  >
                    Make More Elegant
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWild()}
                    className="flex h-12 items-center justify-center gap-1.5 rounded-full border border-white/15 text-sm font-semibold transition hover:border-primary active:scale-95"
                  >
                    <Dices className="size-4" aria-hidden /> Try Something Wild
                  </button>
                  <button
                    type="button"
                    onClick={() => open("viral")}
                    className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-bold text-primary-foreground transition active:scale-95"
                  >
                    <Wand2 className="size-4" aria-hidden /> Use This
                  </button>
                </div>

                <div className="mt-6 rounded-[2rem] border border-white/10 bg-card p-5 sm:p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">
                        Shareability
                      </p>
                      <p className="font-display text-6xl font-extrabold leading-none text-primary">
                        {animatedScore}
                        <span className="text-2xl text-foreground/50"> / 100</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => runGeneration(pickRandom(VIRAL_KINDS, 3))}
                      className="h-11 shrink-0 rounded-full bg-foreground px-5 text-sm font-bold text-background transition active:scale-95"
                    >
                      Make It Even Better
                    </button>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${animatedScore}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>

                  <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                    {SHARING_TIPS.map((tip) => (
                      <li key={tip} className="flex items-center gap-2 text-foreground/80">
                        <Check className="size-4 shrink-0 text-primary" aria-hidden /> {tip}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-4 text-xs text-foreground/45">
                    Playful guidance based on common sharing patterns. It&apos;s not a prediction or a
                    guarantee.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
